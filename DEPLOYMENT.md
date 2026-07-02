# Déploiement — Render + Neon + Vercel

Backend + API sur Render, base PostgreSQL sur Neon, frontend statique sur
Vercel. Le code est prêt côté repo (`render.yaml`, `frontend/vercel.json`,
SSL automatique pour les hôtes distants, `VITE_API_URL` configurable). Les
étapes ci-dessous nécessitent un compte Render, un compte Neon et un compte
Vercel — je ne peux pas les créer à ta place, voici donc le déroulé exact à
suivre.

Ordre important : backend d'abord (il faut son URL pour configurer le
frontend), puis frontend, puis un dernier aller-retour pour donner l'URL du
frontend au backend (CORS).

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
   - `CORS_ORIGIN` : laisse une valeur temporaire pour l'instant (ex.
     `http://localhost:5173`), on la corrigera à l'étape 4 avec l'URL Vercel
     réelle.
5. Lance le déploiement, puis note l'URL du service une fois généré (ex.
   `https://deathchallenge-backend.onrender.com`).

## 3. Déployer le frontend sur Vercel

1. Crée un compte sur [vercel.com](https://vercel.com).
2. "Add New Project", sélectionne ce dépôt.
3. Configure le projet :
   - **Root Directory** : `frontend`
   - Framework : Vercel détecte Vite automatiquement (build `npm run build`,
     dossier de sortie `dist`) — rien à changer normalement.
4. Ajoute la variable d'environnement `VITE_API_URL` = URL du backend Render
   suivie de `/api`, par exemple :
   `https://deathchallenge-backend.onrender.com/api`
5. Déploie. `frontend/vercel.json` gère déjà le fallback SPA nécessaire pour
   react-router (sans ça, actualiser une page comme `/selection` renverrait
   une 404).
6. Note l'URL Vercel générée (ex. `https://deathchallenge.vercel.app`).

## 4. Boucler : autoriser le frontend côté backend (CORS)

Retourne dans les paramètres du service Render (Environment) et mets à jour
`CORS_ORIGIN` avec l'URL Vercel exacte de l'étape 3 (sans slash final).
Sauvegarder redéploie automatiquement le service.

## 5. Vérifier

- `https://<ton-service>.onrender.com/api/health` doit répondre `{"status":"ok"}`.
- Ouvrir l'URL Vercel, se connecter avec `admin`/`admin123` (comptes de démo
  créés automatiquement par le seed au premier démarrage du backend) : la
  page doit charger sans erreur CORS dans la console.

## Limites des plans gratuits à connaître

- **Render** : le service s'éteint après 15 minutes d'inactivité (la requête
  suivante déclenche un redémarrage à froid de 30 à 60 secondes) ; 750h
  d'instance gratuites par mois.
- **Neon** : 1 projet, ~3 Gio de données — largement suffisant ici (moins de
  500 lignes de données actuellement).
- **Vercel** : offre gratuite généreuse pour un projet perso (limite de
  bande passante mensuelle, pas de tâches de fond nécessaires ici puisque
  c'est un site statique).

## Pour revenir en local

Rien ne change : `docker compose up -d` + `backend/.env` avec l'URL locale
continuent de fonctionner normalement (bascule SSL automatique selon l'hôte
détecté), et le frontend sans `VITE_API_URL` définie retombe sur le proxy
Vite `/api` comme avant.
