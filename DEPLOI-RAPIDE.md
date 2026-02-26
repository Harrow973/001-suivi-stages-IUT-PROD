# Déploiement rapide avec deploy.sh

Guide condensé pour déployer l'application de suivi de stages en production.

---

## 1. Prérequis (une seule fois)

### Sur le serveur

- **Docker** et **Docker Compose** installés
- **Nginx** et **Certbot** (Let's Encrypt) pour SSL
- Nom de domaine pointant vers l'IP du serveur

```bash
# Vérifier
docker --version
docker compose version
```

---

## 2. Préparer le projet

```bash
# Cloner ou transférer le projet
cd /opt/gestion-stages   # ou votre répertoire

# Créer .env.production depuis le template
cp ENV.example .env.production
```

---

## 3. Configurer .env.production

Éditer `.env.production` et **modifier obligatoirement** :

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `DB_PASSWORD` | Mot de passe fort | `MonMotDePasseSecurise123!` |
| `DATABASE_URL` | `postgres:5432` (pour Docker) | `postgresql://postgres:VOTRE_MDP@postgres:5432/gestion_stages?schema=public` |
| `NEXT_PUBLIC_APP_URL` | URL HTTPS publique | `https://stages.iut-martinique.univ-antilles.fr` |

**Optionnel** (parsing PDF et chat IA) :

- `GROQ_API_KEY` : clé API depuis [console.groq.com](https://console.groq.com)
- `GROQ_MODEL` : `llama-3.1-8b-instant`

---

## 4. Configurer Nginx et SSL

```bash
# Obtenir le certificat SSL
sudo certbot certonly --nginx -d votre-domaine.fr

# Copier et activer la config Nginx
sudo cp nginx.conf /etc/nginx/sites-available/votre-domaine.fr
sudo ln -s /etc/nginx/sites-available/votre-domaine.fr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

> **Important** : Nginx doit proxy vers `localhost:3003` (port exposé par l'app).

---

## 5. Lancer le déploiement

```bash
./deploy.sh
```

Le script exécute automatiquement :

1. Vérification de `docker-compose.prod.yml` et `.env.production`
2. Vérification de Docker et Docker Compose
3. Construction et démarrage des conteneurs (`postgres`, `app`)
4. Attente 15 secondes (PostgreSQL)
5. Application des migrations via le service Node.js
6. Affichage de l'état des services

---

## 6. Vérifier

```bash
# État des conteneurs
docker compose -f docker-compose.prod.yml ps

# Logs en temps réel
docker compose -f docker-compose.prod.yml logs -f
```

L'application est accessible sur l'URL configurée dans `NEXT_PUBLIC_APP_URL`.

---

## Commandes utiles après déploiement

```bash
# Migrations (après mise à jour du code)
docker compose -f docker-compose.prod.yml run --rm node npx prisma migrate deploy

# Import de données de test
docker compose -f docker-compose.prod.yml run --rm node npm run db:import

# Logs
docker compose -f docker-compose.prod.yml logs -f app
```

---

## Mise à jour de l'application

```bash
git pull
./deploy.sh
# Ou manuellement :
docker compose -f docker-compose.prod.yml up -d --build app
docker compose -f docker-compose.prod.yml run --rm node npx prisma migrate deploy
```

---

## En cas de problème

| Problème | Action |
|----------|--------|
| `.env.production` manquant | Le script le crée depuis `ENV.example` ; éditez-le puis relancez |
| Erreur de migration | `docker compose -f docker-compose.prod.yml logs postgres` |
| App ne démarre pas | `docker compose -f docker-compose.prod.yml logs app` |
| 502 Bad Gateway | Vérifier `DATABASE_URL` (doit être `postgres:5432` dans Docker) ; redémarrer l'app |
| Page blanche | Vérifier `NEXT_PUBLIC_APP_URL` = votre domaine ; **reconstruire** : `docker compose up -d --build app` |

### Diagnostic page blanche

```bash
# 1. L'app répond-elle directement ?
curl -I http://127.0.0.1:3003/

# 2. Réponse HTTP (200 = OK) et contenu HTML
curl -s http://127.0.0.1:3003/ | head -20

# 3. NEXT_PUBLIC_APP_URL doit correspondre au domaine exact
grep NEXT_PUBLIC_APP_URL .env.production
# → https://logistidom.com (sans slash final)

# 4. Après modification de .env.production : reconstruire obligatoirement
docker compose -f docker-compose.prod.yml up -d --build app
```

### Mise à jour de la config Nginx sur le serveur

Après modification de `nginx.conf` dans le projet :

```bash
sudo sed -i 's/votre-domaine\.fr/logistidom.com/g' /etc/nginx/sites-available/logistidom.com
sudo sed -i 's/localhost:3003/127.0.0.1:3003/g' /etc/nginx/sites-available/logistidom.com
sudo nginx -t && sudo systemctl reload nginx
```

---

Pour plus de détails : voir `DEPLOY.md`.
