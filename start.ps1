$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "  Death Challenge - Demarrage" -ForegroundColor Red
Write-Host "  ============================" -ForegroundColor DarkRed
Write-Host ""

# --- Docker ---
Write-Host "[1/3] Demarrage de PostgreSQL..." -ForegroundColor Cyan
Set-Location $root
docker-compose up -d
if (-not $?) { Write-Host "Erreur docker-compose" -ForegroundColor Red; exit 1 }

# Attendre que postgres soit pret
Write-Host "      Attente de PostgreSQL..." -ForegroundColor DarkGray
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    $check = docker-compose exec -T postgres pg_isready -U dc_user -d deathchallenge 2>&1
    if ($check -match "accepting connections") { $ready = $true; break }
    Start-Sleep -Seconds 1
}
if (-not $ready) { Write-Host "PostgreSQL ne repond pas." -ForegroundColor Yellow }
else { Write-Host "      PostgreSQL OK" -ForegroundColor Green }

# --- Backend ---
Write-Host "[2/3] Demarrage du backend  (port 3001)..." -ForegroundColor Cyan
Set-Location "$root\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# --- Frontend ---
Write-Host "[3/3] Demarrage du frontend (port 5173)..." -ForegroundColor Cyan
Set-Location "$root\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# --- Recap ---
Write-Host ""
Write-Host "  Tout est lance !" -ForegroundColor Green
Write-Host ""
Write-Host "  Application  : http://localhost:5173" -ForegroundColor White
Write-Host "  API          : http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "  Comptes demo :" -ForegroundColor DarkGray
Write-Host "    admin  / admin123   (acces complet)" -ForegroundColor DarkGray
Write-Host "    editor / editor123  (ajout + modif)" -ForegroundColor DarkGray
Write-Host "    viewer / viewer123  (lecture seule)" -ForegroundColor DarkGray
Write-Host ""

Set-Location $root
