# Guide de Déploiement en Production

Ce document décrit les améliorations apportées pour préparer le projet à la production.

## ✅ Améliorations Implémentées

### 1. Configuration Next.js pour la Production

- **Mode standalone** : Activé pour Docker (optimisation de la taille de l'image)
- **Headers de sécurité** :
  - `X-DNS-Prefetch-Control` : Optimisation des performances DNS
  - `Strict-Transport-Security` : Force HTTPS avec preload
  - `X-Frame-Options` : Protection contre le clickjacking (SAMEORIGIN)
  - `X-Content-Type-Options` : Empêche le MIME-sniffing (nosniff)
  - `X-XSS-Protection` : Protection XSS (1; mode=block)
  - `Referrer-Policy` : Contrôle des informations de referrer
  - `Permissions-Policy` : Désactive caméra, microphone, géolocalisation

### 2. Système de Rate Limiting

Protection contre les abus avec limitation par IP :

- **API générales** : 100 requêtes/minute (`apiRateLimiter`)
- **Uploads** : 10 uploads/minute (`uploadRateLimiter`)
- **Chat** : 30 messages/minute (`chatRateLimiter`)

Les limites sont appliquées automatiquement sur les routes API critiques :

- `/api/chat` : Chat avec Groq Cloud
- `/api/conventions-stage` : Upload de conventions
- `/api/parse-convention` : Parsing de PDF

**Note** : Le rate limiting actuel est en mémoire. Pour un déploiement multi-instance, voir la section "Points d'Attention".

### 3. Stockage Sécurisé des Fichiers

- **Ancien système** : Fichiers dans `public/uploads/` (accessible publiquement)
- **Nouveau système** : Fichiers dans `storage/uploads/` (privé)
- **API sécurisée** : `/api/files/[type]/[filename]` avec validation
- **Types supportés** : `convention` et `validation`
- **Sécurité** :
  - Validation du type de fichier
  - Sanitization des noms de fichiers (protection contre path traversal)
  - Vérification de l'existence du fichier
  - Taille maximale : 10MB par fichier
  - Format accepté : PDF uniquement

### 4. Logging Structuré

Remplacement de tous les `console.log` par un système de logging structuré :

- **Niveaux** : debug, info, warn, error
- **Format JSON en production** : Compatible avec les services de logging (ELK, CloudWatch, etc.)
- **Format lisible en développement** : Avec emojis et timestamps
- **Context** : Support des métadonnées contextuelles
- **Stack traces** : Uniquement en développement (sécurité)

### 5. Gestion d'Erreurs Centralisée

Gestion standardisée des erreurs avec codes cohérents :

- **Validation Zod** : `VALIDATION_ERROR` (400)
- **Contrainte unique Prisma** : `UNIQUE_CONSTRAINT_VIOLATION` (409)
- **Enregistrement non trouvé** : `NOT_FOUND` (404)
- **Erreur interne** : `INTERNAL_ERROR` (500)
- **Messages sécurisés** : Pas d'exposition de détails techniques aux clients
- **Logging** : Toutes les erreurs sont loggées avec contexte

### 6. Parsing de Conventions PDF

Deux méthodes de parsing disponibles :

- **Groq** (par défaut) : Utilise l’API Groq Cloud pour extraire les données
- **Regex** : Méthode de fallback basée sur des expressions régulières
- **Endpoint** : `/api/parse-convention?method=groq|regex`
- **Limitation** : Rate limiting appliqué (10 uploads/minute)

### 7. Fichier d'Environnement

- `ENV.example` : Template avec toutes les variables nécessaires
- Documentation complète des variables d'environnement

## 🔧 Configuration Requise

### Variables d'Environnement

Copiez `ENV.example` vers `.env.local` et configurez :

```bash
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@host:port/database"

# Configuration PostgreSQL (pour docker-compose)
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=gestion_stages
DB_PORT=5434

# Configuration Groq Cloud (optionnel - pour le parsing de PDF et le chat)
# Clé API sur https://console.groq.com
GROQ_API_KEY=votre_cle_api
GROQ_MODEL=llama-3.1-8b-instant

# Environnement
NODE_ENV=production

# Port de l'application (par défaut 3000)
PORT=3000
```

### Dossiers à Créer

Le dossier `storage/` sera créé automatiquement au premier upload, mais vous pouvez le créer manuellement :

```bash
mkdir -p storage/uploads/conventions
mkdir -p storage/uploads/validations
```

**Note** : Dans Docker, les dossiers sont créés automatiquement avec les bonnes permissions (user `nextjs`).

## 🚀 Déploiement

### Préparation avant le déploiement

1. **Vérifier les variables d'environnement** :

   ```bash
   # Copier et configurer .env.local
   cp ENV.example .env.local
   # Modifier NODE_ENV=production
   # Configurer DATABASE_URL avec les vraies credentials
   ```

2. **Appliquer les migrations** :

   ```bash
   npm run db:migrate
   ```

3. **Tester le build localement** :
   ```bash
   npm run build
   npm start
   ```

### Avec Docker Compose (Recommandé)

Utilisez `docker-compose.prod.yml` pour la production :

```bash
# 1. Construire et démarrer les services
docker compose -f docker-compose.prod.yml up -d --build

# 2. Attendre que PostgreSQL soit prêt (10-15 secondes)
sleep 15

# 3. Appliquer les migrations via le service Node.js
docker compose -f docker-compose.prod.yml run --rm node npx prisma migrate deploy
```

**Note :** Utilisez `docker compose` (avec un espace) au lieu de `docker-compose` (avec un tiret).

**Services Docker** :

- `postgres` : Base de données PostgreSQL 15
- `app` : Application Next.js (production)
- `node` : Service Node.js pour migrations, scripts et maintenance (`docker compose run --rm node <commande>`)

**Caractéristiques du Dockerfile** :

- Build multi-stage pour optimiser la taille de l'image
- Stage `node` dédié pour Prisma et scripts (migrations, import, etc.)
- User non-root (`nextjs:nodejs`) pour la sécurité
- Mode standalone Next.js (image minimale)
- Dossiers de stockage créés automatiquement avec les bonnes permissions
- Optimisations pour la production (compression, cache, etc.)

### Déploiement sur Vercel (Recommandé pour Next.js)

1. **Connecter le repository** à Vercel
2. **Configurer les variables d'environnement** dans le dashboard Vercel
3. **Configurer la base de données** :
   - Utiliser Vercel Postgres ou une base externe
   - Ajouter `DATABASE_URL` dans les variables d'environnement
4. **Déployer** : Vercel détecte automatiquement Next.js et déploie

**Variables d'environnement requises sur Vercel :**

- `DATABASE_URL`
- `NODE_ENV=production`
- `GROQ_API_KEY` et `GROQ_MODEL` (si chat / parsing IA utilisés)

### Déploiement sur serveur dédié

```bash
# 1. Cloner le repository
git clone <repository-url>
cd 001-suivi-stages-IUT

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp ENV.example .env.local
# Éditer .env.local

# 4. Générer le client Prisma
npm run db:generate

# 5. Appliquer les migrations
npm run db:migrate

# 6. Build de production
npm run build

# 7. Démarrer avec PM2 (recommandé)
npm install -g pm2
pm2 start npm --name "gestion-stages" -- start
pm2 save
pm2 startup
```

### Sans Docker

```bash
# Installation des dépendances
npm install

# Génération du client Prisma
npm run db:generate

# Migration de la base de données
npm run db:migrate

# Build de l'application
npm run build

# Démarrage en production
npm start
```

### Scripts NPM Disponibles

```bash
# Développement
npm run dev              # Serveur de développement (port 3000)

# Production
npm run build            # Build de production (optimisé)
npm run start            # Serveur de production (après build)

# Base de données
npm run db:generate      # Générer le client Prisma
npm run db:migrate       # Créer et appliquer une migration
npm run db:studio        # Ouvrir Prisma Studio (interface graphique)
npm run db:push          # Appliquer le schéma sans migration
npm run db:import        # Importer des données de test
npm run db:migrate-referents  # Migrer les référents vers enseignants

# Qualité
npm run lint             # Vérifier le code avec ESLint
```

### Service Node.js (production Docker)

Pour exécuter des commandes Prisma ou des scripts en production :

```bash
# Migrations
docker compose -f docker-compose.prod.yml run --rm node npx prisma migrate deploy

# Import de données
docker compose -f docker-compose.prod.yml run --rm node npm run db:import

# Prisma Studio
docker compose -f docker-compose.prod.yml run --rm -p 5555:5555 node npx prisma studio
```

### Checklist de déploiement

Avant de déployer en production, vérifiez :

- [ ] Variables d'environnement configurées (`.env.production` ou variables système)
- [ ] `NODE_ENV=production` défini
- [ ] `DATABASE_URL` pointe vers la base de production (ou `postgres:5432` pour les conteneurs)
- [ ] Migrations appliquées (`docker compose run --rm node npx prisma migrate deploy`)
- [ ] Build testé localement (`npm run build && npm start`)
- [ ] Secrets et mots de passe changés (pas les valeurs par défaut)
- [ ] HTTPS configuré (certificat SSL/TLS)
- [ ] Backups de base de données configurés
- [ ] Monitoring configuré (logs, alertes)
- [ ] Rate limiting testé
- [ ] Groq Cloud configuré (si chat / parsing IA utilisés)

## ⚠️ Points d'Attention

### Migration des Fichiers Existants

Si vous avez des fichiers dans `public/uploads/`, vous devez les migrer vers `storage/` :

1. Les anciens fichiers continueront de fonctionner (compatibilité)
2. Les nouveaux fichiers seront stockés dans `storage/`
3. Pour migrer complètement :

   ```bash
   # Déplacer les fichiers
   mv public/uploads/conventions/* storage/uploads/conventions/
   mv public/uploads/validations/* storage/uploads/validations/

   # Mettre à jour les chemins en base de données si nécessaire
   ```

### Rate Limiting

Le rate limiting actuel est en mémoire. Pour un déploiement multi-instance, considérez :

- **Redis** : Solution recommandée pour le stockage distribué
- **Upstash Rate Limit** : Service managé
- **Autre solution distribuée** : Selon votre infrastructure

**Implémentation recommandée** : Modifier `src/lib/rate-limit.ts` pour utiliser un store Redis au lieu de la mémoire.

### Base de Données

- **PostgreSQL 15+** : Version minimale requise
- **Migrations** : Toujours appliquer les migrations avant le déploiement
- **Backup** : Configurer des sauvegardes régulières
- **Healthcheck** : Le docker-compose inclut un healthcheck pour PostgreSQL

### Monitoring

En production, configurez :

- **Service de monitoring** : Sentry, LogRocket, Datadog, etc.
- **Alertes** : Sur les erreurs critiques (500, rate limit, etc.)
- **Dashboard** : Pour les métriques (requêtes/min, erreurs, etc.)
- **Logs** : Centraliser les logs JSON pour analyse

### Performance

- **Cache** : Considérer un cache Redis pour les requêtes fréquentes
- **CDN** : Pour les assets statiques (si déployé sur plusieurs régions)
- **Database pooling** : Prisma gère automatiquement le pooling

## 🔐 Sécurité

### Mesures Implémentées

1. **Headers de sécurité** : Configurés dans `next.config.ts`
2. **Validation** : Toutes les entrées sont validées avec Zod
3. **Sanitization** : Les noms de fichiers sont sanitizés (protection path traversal)
4. **Rate limiting** : Protection contre les abus
5. **Stockage privé** : Fichiers hors du dossier public
6. **User non-root** : Dockerfile utilise un user non-privilégié
7. **Gestion d'erreurs** : Pas d'exposition de détails techniques

### Recommandations Supplémentaires

1. **Authentification** : À implémenter (NextAuth.js recommandé)
2. **HTTPS** : Utiliser HTTPS en production (certificat SSL/TLS)
3. **CORS** : Configurer CORS si nécessaire (actuellement ouvert)
4. **Secrets** : Utiliser un gestionnaire de secrets (AWS Secrets Manager, HashiCorp Vault)
5. **WAF** : Web Application Firewall pour protection supplémentaire
6. **Audit** : Logs d'audit pour les actions sensibles

## 📊 Tests

Les tests ne sont pas encore implémentés. Recommandations :

- **Tests unitaires** : Pour les utilitaires (`src/lib/`)
- **Tests d'intégration** : Pour les routes API (`src/app/api/`)
- **Tests E2E** : Pour les flux critiques (formulaires, uploads)
- **Tests de charge** : Pour valider le rate limiting et les performances

**Outils recommandés** :

- Jest / Vitest pour les tests unitaires
- Playwright / Cypress pour les tests E2E
- k6 / Artillery pour les tests de charge

## 🛠️ Scripts Utilitaires

Le dossier `scripts/` contient des scripts utilitaires :

### Import de Données

```bash
npm run db:import
```

Importe des données de test depuis `scripts/import-data.ts`.

## 📝 Notes Importantes

- **Compatibilité** : Le système est compatible avec les anciens chemins de fichiers
- **Logging** : Le logging est configuré pour ne pas exposer d'informations sensibles
- **Erreurs** : Les erreurs sont loggées mais les détails techniques ne sont pas exposés aux clients
- **Groq Cloud** : Optionnel, nécessaire pour le parsing intelligent de PDF et le chat (clé API sur console.groq.com)
- **Docker** : L'image Docker est optimisée pour la production (multi-stage build)
- **Standalone** : Next.js en mode standalone pour une image Docker minimale

## 🔄 Mises à Jour

### Avant chaque déploiement

1. Vérifier les migrations Prisma : `npm run db:migrate`
2. Tester le build localement : `npm run build`
3. Vérifier les variables d'environnement
4. Sauvegarder la base de données
5. Tester les fonctionnalités critiques

### Après le déploiement

1. Vérifier les logs pour les erreurs
2. Tester les endpoints API
3. Vérifier le rate limiting
4. Monitorer les performances
