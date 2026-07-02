# Déploiement (backend + DB) — Render + Neon

Ce document couvre le déploiement du backend (`backend/`) sur Render et de la
base PostgreSQL sur Neon. Le frontend n'est pas couvert ici (hors périmètre de
cette configuration).

Le code est prêt côté repo (`render.yaml`, SSL automatique pour les hôtes
distants dans `backend/src/db/index.js`). Les étapes ci-dessous nécessitent
un compte Render et un compte Neon — je ne peux pas les créer à ta place,
voici donc le déroulé exact à suivre.

## 1. Créer la base sur Neon

1. Crée un compte sur [neon.tech](https://neon.tech) (offre gratuite, pas de
   carte bancaire requise au moment de la rédaction).
2. Crée un nouveau projet.
3. Dans le dashboard du projet, récupère la **connection string** (format
   `postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require`).
   Garde-la de côté, elle sert de `DATABASE_URL`.

## 2. Déployer le backend sur Render

1. Pousse ce repo sur GitHub/GitLab si ce n'est pas déjà fait (Render déploie
   depuis un dépôt Git).
2. Crée un compte sur [render.com](https://render.com).
3. Dans le dashboard, choisis l'option d'import via **Blueprint** et
   sélectionne ce dépôt. Render doit détecter `render.yaml` à la racine et
   proposer de créer le service `deathchallenge-backend` automatiquement
   (build `npm install`, démarrage `npm start`, plan gratuit).
4. `JWT_SECRET` est généré automatiquement par le Blueprint. Il reste deux
   variables à renseigner manuellement dans les paramètres du service une
   fois créé (Environment) :
   - `DATABASE_URL` : la connection string Neon récupérée à l'étape 1.
   - `CORS_ORIGIN` : l'URL du frontend qui appellera cette API (ex.
     `https://mon-frontend.vercel.app`). Si le frontend n'est pas encore
     déployé, mets une valeur temporaire et reviens la modifier ensuite —
     sans ça, le navigateur bloquera les appels API en CORS.
5. Lance le déploiement. Render construit et démarre le service ; au premier
   démarrage, `initDB()`/`seed()` s'exécutent normalement comme en local et
   créent les tables + comptes de démo sur la base Neon.

## 3. Vérifier

- `https://<ton-service>.onrender.com/api/health` doit répondre `{"status":"ok"}`.
- Se connecter via `POST /api/auth/login` avec `admin`/`admin123` doit
  fonctionner (mêmes comptes de démo qu'en local, créés par le seed).

## Limites du plan gratuit à connaître

- Le service Render gratuit s'éteint après 15 minutes d'inactivité ; la
  requête suivante déclenche un redémarrage à froid de 30 à 60 secondes.
- 750h d'instance gratuites par mois (largement suffisant pour un seul
  service qui tourne en continu, sauf usage multi-projets sur le même compte).
- Neon gratuit : 1 projet, ~3 Gio de données — largement suffisant pour ce
  projet (moins de 500 lignes de données actuellement).

## Pour revenir en local

Rien ne change : `docker compose up -d` + `backend/.env` avec l'URL locale
continuent de fonctionner normalement, la bascule SSL est automatique selon
l'hôte détecté dans `DATABASE_URL`.
