# Guide de Déploiement en Production

Ce guide explique comment déployer l'application de suivi de stages sur un serveur (VPS ou serveur de l'établissement, ex. IUT).

> **Guide condensé** : Pour un rappel rapide des étapes avec `./deploy.sh`, voir `DEPLOI-RAPIDE.md`.

## 📋 Prérequis

- Serveur avec accès root/sudo (VPS KVM ou serveur de l'IUT)
- Nom de domaine pointant vers l'IP du serveur (ex. `stages.iut-martinique.univ-antilles.fr` ou domaine fourni par l'établissement)
- Docker et Docker Compose installés
- Nginx installé
- Certbot (Let's Encrypt) installé

## 🚀 Étapes de Déploiement

### 1. Préparation du Serveur

#### 1.1 Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.2 Installation de Docker et Docker Compose

```bash
# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Docker Compose est maintenant un plugin intégré à Docker
# Il est installé automatiquement avec Docker Desktop ou les versions récentes de Docker Engine

# Vérifier l'installation
docker --version
docker compose version
```

#### 1.3 Installation de Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### 1.4 Installation de Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configuration du Projet

#### 2.1 Cloner ou transférer le projet

```bash
# Option 1: Si le projet est sur Git
git clone <votre-repo-url>
cd 001-suivi-stages-IUT

# Option 2: Si vous transférez les fichiers via SCP/SFTP
# Transférez tous les fichiers du projet vers /opt/gestion-stages
sudo mkdir -p /opt/gestion-stages
cd /opt/gestion-stages
# Transférez vos fichiers ici
```

#### 2.2 Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp ENV.example .env.production

# Éditer le fichier .env.production
nano .env.production
```

Configurez les variables suivantes dans `.env.production` :

```bash
# Base de données PostgreSQL
# IMPORTANT: Utilisez "postgres" (nom du service) pour les connexions depuis les conteneurs
# Utilisez "localhost:5434" pour les connexions depuis l'hôte
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE_SECURISE@postgres:5432/gestion_stages?schema=public"

# Configuration PostgreSQL (pour docker compose)
DB_USER=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE
DB_NAME=gestion_stages
DB_PORT=5434  # Port exposé sur l'hôte (5432 est le port interne du conteneur)

# Configuration Groq Cloud (optionnel - pour le parsing de PDF et le chat)
# Créez une clé sur https://console.groq.com
GROQ_API_KEY=votre_cle_api
GROQ_MODEL=llama-3.1-8b-instant

# Environnement
NODE_ENV=production

# Port de l'application (port interne du conteneur, exposé sur 3003)
PORT=3000

# URL de l'application (IMPORTANT: utiliser HTTPS, remplacer par votre domaine)
NEXT_PUBLIC_APP_URL=https://votre-domaine.fr
```

**⚠️ IMPORTANT**:

- Remplacez `VOTRE_MOT_DE_PASSE_SECURISE` par un mot de passe fort
- **DATABASE_URL pour les conteneurs** : Utilisez `postgres:5432` (nom du service Docker + port interne)
- **DATABASE_URL pour l'hôte** : Utilisez `localhost:5434` si vous voulez vous connecter depuis l'hôte
- `DB_PORT=5434` : Port exposé sur l'hôte (5432 est le port interne du conteneur)
- Configurez `NEXT_PUBLIC_APP_URL` avec l'URL publique de l'application (ex. `https://stages.iut-martinique.univ-antilles.fr`)

**Note sur DATABASE_URL** :

- Depuis les conteneurs `app` et `node` : `postgresql://postgres:password@postgres:5432/gestion_stages?schema=public`
- Depuis l'hôte (pour migrations manuelles avec Node.js local) : `postgresql://postgres:password@localhost:5434/gestion_stages?schema=public`

### 3. Configuration SSL avec Let's Encrypt

#### 3.1 Obtenir le certificat SSL

```bash
# D'abord, configurez Nginx temporairement pour la validation
# Remplacez votre-domaine.fr par votre nom de domaine réel
sudo certbot certonly --nginx -d votre-domaine.fr -d www.votre-domaine.fr

# Suivez les instructions à l'écran
# Entrez votre email
# Acceptez les conditions
```

#### 3.2 Configuration Nginx

```bash
# Copier la configuration Nginx (remplacer votre-domaine.fr dans nginx.conf avant, ou après)
sudo cp nginx.conf /etc/nginx/sites-available/votre-domaine.fr

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/votre-domaine.fr /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 4. Déploiement avec Docker Compose

**Note importante** : L'application est configurée pour écouter sur le port **3003** côté hôte (mappé depuis le port 3000 du conteneur). Nginx doit être configuré pour proxy vers `localhost:3003`.

**Services Docker** :

- `postgres` : Base de données PostgreSQL 15
- `app` : Application Next.js (production)
- `node` : Service Node.js pour migrations, scripts et maintenance (utilisé via `docker compose run`)

#### 4.1 Construire et démarrer les services

```bash
# Utiliser le fichier docker-compose.prod.yml
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

#### 4.2 Appliquer les migrations de base de données

```bash
# Attendre que PostgreSQL soit prêt (10-15 secondes)
sleep 15

# Exécuter les migrations via le service Node.js dédié
docker compose -f docker-compose.prod.yml run --rm node npx prisma migrate deploy
```

#### 4.3 Configuration Groq Cloud (optionnel)

Pour le parsing intelligent de PDF et le chat assistant, configurez une clé API Groq dans `.env.production` :

```bash
# Créer un compte et générer une clé sur https://console.groq.com
# Ajouter dans .env.production :
GROQ_API_KEY=votre_cle_api
GROQ_MODEL=llama-3.1-8b-instant
```

Sans `GROQ_API_KEY`, le parsing utilisera la méthode regex et le chat ne sera pas disponible.

#### 4.4 Vérifier que tout fonctionne

```bash
# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f

# Vérifier les conteneurs
docker compose -f docker-compose.prod.yml ps
```

### 5. Configuration du Renouvellement SSL

```bash
# Tester le renouvellement automatique
sudo certbot renew --dry-run

# Le renouvellement est automatique via cron, mais vous pouvez vérifier
sudo systemctl status certbot.timer
```

### 6. Configuration du Firewall (Optionnel mais recommandé)

```bash
# Installation d'UFW
sudo apt install ufw -y

# Autoriser SSH, HTTP et HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

## 🔧 Commandes Utiles

### Gestion des conteneurs

```bash
# Démarrer les services
docker compose -f docker-compose.prod.yml up -d

# Arrêter les services
docker compose -f docker-compose.prod.yml down

# Voir les logs
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f postgres

# Redémarrer un service
docker compose -f docker-compose.prod.yml restart app

# Reconstruire l'application après une mise à jour
docker compose -f docker-compose.prod.yml up -d --build app
```

### Service Node.js (migrations, scripts, maintenance)

Le service `node` fournit un environnement Node.js complet pour exécuter Prisma et les scripts :

```bash
# Appliquer les migrations
docker compose -f docker-compose.prod.yml run --rm node npx prisma migrate deploy

# Importer des données de test
docker compose -f docker-compose.prod.yml run --rm node npm run db:import

# Ouvrir Prisma Studio (interface graphique)
docker compose -f docker-compose.prod.yml run --rm -p 5555:5555 node npx prisma studio

# Générer le client Prisma
docker compose -f docker-compose.prod.yml run --rm node npx prisma generate
```

**Note** : Le service `node` utilise `DATABASE_URL` pointant vers `postgres:5432` (réseau Docker interne).

### Base de données

```bash
# Accéder à la base de données
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d gestion_stages

# Sauvegarder la base de données
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres gestion_stages > backup_$(date +%Y%m%d).sql

# Restaurer la base de données
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres gestion_stages < backup_20250115.sql
```

### Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger la configuration
sudo systemctl reload nginx

# Redémarrer Nginx
sudo systemctl restart nginx

# Voir les logs (remplacer votre-domaine.fr par votre nom de domaine si différent)
sudo tail -f /var/log/nginx/votre-domaine.fr.access.log
sudo tail -f /var/log/nginx/votre-domaine.fr.error.log
```

## 🔄 Mise à Jour de l'Application

```bash
# 1. Se placer dans le répertoire du projet
cd /opt/gestion-stages  # ou le chemin où se trouve votre projet

# 2. Récupérer les dernières modifications (si Git)
git pull

# 3. Reconstruire et redémarrer l'application
docker compose -f docker-compose.prod.yml up -d --build app

# 4. Appliquer les migrations via le service Node.js
docker compose -f docker-compose.prod.yml run --rm node npx prisma migrate deploy

# 5. Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f app
```

## 📊 Monitoring et Maintenance

### Vérification de l'état des services

```bash
# État des conteneurs Docker
docker compose -f docker-compose.prod.yml ps

# Utilisation des ressources
docker stats

# Espace disque
df -h

# Logs système
journalctl -u docker -f
```

### Sauvegarde automatique (Optionnel)

Créez un script de sauvegarde `/opt/backup-stages.sh` :

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
docker compose -f /opt/gestion-stages/docker-compose.prod.yml exec -T postgres pg_dump -U postgres gestion_stages > $BACKUP_DIR/db_$DATE.sql

# Sauvegarder les fichiers uploadés
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz /opt/gestion-stages/storage

# Supprimer les sauvegardes de plus de 7 jours
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Rendre le script exécutable et l'ajouter au cron :

```bash
chmod +x /opt/backup-stages.sh
crontab -e
# Ajouter cette ligne pour une sauvegarde quotidienne à 2h du matin
0 2 * * * /opt/backup-stages.sh
```

## 🐛 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
docker compose -f docker-compose.prod.yml logs app

# Vérifier les variables d'environnement
docker compose -f docker-compose.prod.yml exec app env | grep -E "DATABASE_URL|NODE_ENV"
```

### Problème de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
docker compose -f docker-compose.prod.yml ps postgres

# Vérifier les logs PostgreSQL
docker compose -f docker-compose.prod.yml logs postgres

# Tester la connexion
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d gestion_stages -c "SELECT 1;"
```

### Problème SSL

```bash
# Vérifier les certificats
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew

# Vérifier la configuration Nginx
sudo nginx -t
```

### L'application est lente

```bash
# Vérifier l'utilisation des ressources
docker stats

# Vérifier les logs pour les erreurs
docker compose -f docker-compose.prod.yml logs app | grep -i error

# Vérifier l'espace disque
df -h
```

## 🔐 Sécurité

### Recommandations

1. **Mots de passe forts** : Utilisez des mots de passe complexes pour la base de données
2. **Mises à jour** : Maintenez le système et les conteneurs à jour
3. **Firewall** : Configurez UFW pour limiter l'accès
4. **Backups** : Configurez des sauvegardes régulières
5. **Monitoring** : Surveillez les logs régulièrement

### Changer les mots de passe

```bash
# 1. Modifier .env.production avec le nouveau mot de passe
nano .env.production

# 2. Modifier le mot de passe dans PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'NOUVEAU_MOT_DE_PASSE';"

# 3. Redémarrer les services
docker compose -f docker-compose.prod.yml restart
```

## 📝 Notes Importantes

- Le nom de domaine doit pointer vers l'IP du serveur (pour un déploiement à l'IUT, le domaine est en général fourni par l'établissement)
- Les certificats SSL sont renouvelés automatiquement par Certbot
- Les fichiers uploadés sont stockés dans le volume Docker `storage_data`
- La base de données est stockée dans le volume Docker `postgres_data`
- Les logs de l'application sont accessibles via `docker compose logs`

## ✅ Checklist de Déploiement

- [ ] Docker et Docker Compose installés
- [ ] Nginx installé et configuré
- [ ] Certificat SSL obtenu avec Certbot
- [ ] Fichier `.env.production` configuré avec les bonnes valeurs
- [ ] Services Docker démarrés (`docker compose ps`)
- [ ] Migrations appliquées (`docker compose run --rm node npx prisma migrate deploy`)
- [ ] Application accessible en HTTPS (URL configurée dans `NEXT_PUBLIC_APP_URL`)
- [ ] Firewall configuré (optionnel mais recommandé)
- [ ] Sauvegardes configurées (optionnel mais recommandé)

## 🆘 Support

En cas de problème, vérifiez :

1. Les logs Docker : `docker compose logs`
2. Les logs Nginx : `/var/log/nginx/<votre-domaine>.error.log`
3. Les logs système : `journalctl -xe`
4. La configuration : `docker compose ps` et `sudo nginx -t`
