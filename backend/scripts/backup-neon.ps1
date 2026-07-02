<#
.SYNOPSIS
    Sauvegarde complète (schéma + données, toutes les tables) de la base Neon.

.DESCRIPTION
    Utilise pg_dump via un conteneur Docker éphémère (postgres:18-alpine,
    aligné sur la version serveur de Neon — pg_dump refuse de dumper un
    serveur plus récent que lui) pour éviter de dépendre d'un pg_dump
    installé sur la machine. Indépendant de la stack docker-compose locale :
    seule une connexion sortante vers Neon est nécessaire.
    Le dump est généré au format "custom" de pg_dump (-Fc) : compressé, et
    restaurable sélectivement (table par table) avec pg_restore.

.PARAMETER NeonUrl
    Connection string Neon (postgresql://user:pass@host/db?sslmode=require).
    Si omis, lit $env:NEON_DATABASE_URL.

.PARAMETER OutputDir
    Dossier de destination du fichier de sauvegarde. Par défaut : .\backups
    à côté de ce script.

.PARAMETER Plain
    Génère un .sql texte brut (lisible, rejouable avec psql) en plus du
    fichier .dump binaire.

.PARAMETER PgImage
    Image Docker Postgres à utiliser pour pg_dump. Par défaut postgres:18-alpine
    (version serveur de Neon au moment de l'écriture). À ajuster si Neon
    change de version majeure (le dump échoue explicitement sinon, avec un
    message clair de pg_dump).

.EXAMPLE
    $env:NEON_DATABASE_URL = "postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
    .\backup-neon.ps1

.EXAMPLE
    .\backup-neon.ps1 -NeonUrl "postgresql://..." -OutputDir "D:\Backups" -Plain
#>

param(
    [string]$NeonUrl = $env:NEON_DATABASE_URL,
    [string]$OutputDir = (Join-Path $PSScriptRoot "backups"),
    [string]$PgImage = "postgres:18-alpine",
    [switch]$Plain
)

$ErrorActionPreference = "Stop"

if (-not $NeonUrl) {
    Write-Error "Aucune connection string Neon fournie. Passe -NeonUrl ou définis `$env:NEON_DATABASE_URL."
    exit 1
}

try { docker info *> $null; $dockerRunning = $LASTEXITCODE -eq 0 } catch { $dockerRunning = $false }
if (-not $dockerRunning) {
    Write-Error "Docker ne semble pas démarré. Lance Docker Desktop puis réessaie."
    exit 1
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
$OutputDir = (Resolve-Path $OutputDir).Path

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$dumpFileName = "deathchallenge-neon-$timestamp.dump"
$localDumpPath = Join-Path $OutputDir $dumpFileName

Write-Host "Sauvegarde de Neon en cours (format custom, compressé, image $PgImage)..." -ForegroundColor Cyan
docker run --rm -v "${OutputDir}:/backup" $PgImage `
    pg_dump $NeonUrl -Fc --no-owner --no-acl -f "/backup/$dumpFileName"
if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump a échoué (code $LASTEXITCODE). Si l'erreur mentionne un écart de version serveur, relance avec -PgImage postgres:<version-neon>-alpine."
    exit 1
}

$size = (Get-Item $localDumpPath).Length
Write-Host "OK : $localDumpPath ($([math]::Round($size / 1MB, 2)) Mo)" -ForegroundColor Green

if ($Plain) {
    $sqlFileName = "deathchallenge-neon-$timestamp.sql"
    $localSqlPath = Join-Path $OutputDir $sqlFileName

    Write-Host "Sauvegarde texte brut (.sql) en cours..." -ForegroundColor Cyan
    docker run --rm -v "${OutputDir}:/backup" $PgImage `
        pg_dump $NeonUrl --no-owner --no-acl -f "/backup/$sqlFileName"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "pg_dump (format plain) a échoué (code $LASTEXITCODE)."
        exit 1
    }

    $sqlSize = (Get-Item $localSqlPath).Length
    Write-Host "OK : $localSqlPath ($([math]::Round($sqlSize / 1MB, 2)) Mo)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour restaurer le .dump dans une base (vide de préférence) :" -ForegroundColor Yellow
Write-Host "  docker run --rm -v `"${OutputDir}:/backup`" $PgImage pg_restore -d <connection_string_cible> --no-owner --no-acl --clean --if-exists /backup/$dumpFileName"
