# Système de Gestion des Stages - IUT de la Martinique REFONTE EN COURS Changement de STACK

Application web complète de gestion des stages pour l'IUT de la Martinique, développée avec Next.js 16, TypeScript, Tailwind CSS, PostgreSQL et Docker.

## 🚀 Démarrage rapide

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js 20+** : [Télécharger Node.js](https://nodejs.org/)
- **Docker Desktop** : [Télécharger Docker](https://www.docker.com/products/docker-desktop/)
  - Nécessaire pour PostgreSQL en développement
  - Alternative : PostgreSQL installé localement
- **npm** : Inclus avec Node.js
- **Git** : Pour cloner le repository

### Installation pas à pas

#### 1. Cloner le repository

```bash
git clone <url-du-repository>
cd 001-suivi-stages-IUT
```

#### 2. Installer les dépendances

```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires (Next.js, Prisma, React, etc.).

#### 3. Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp ENV.example .env.local

# Éditer le fichier .env.local avec vos paramètres
# Les valeurs par défaut fonctionnent pour le développement local
```

**Variables importantes :**

- `DATABASE_URL` : URL de connexion PostgreSQL (par défaut : `postgresql://postgres:postgres@localhost:5434/gestion_stages?schema=public`)
- `NODE_ENV` : `development` pour le développement
- `GROQ_API_KEY` et `GROQ_MODEL` : Optionnel, nécessaire pour le parsing IA des PDF et le chat assistant (Groq Cloud)

#### 4. Démarrer PostgreSQL avec Docker

```bash
# Démarrer PostgreSQL en arrière-plan
docker compose up -d postgres

# Vérifier que le conteneur est démarré
docker compose ps
```

**Note :** Si vous utilisez PostgreSQL localement, assurez-vous qu'il est démarré et configurez `DATABASE_URL` dans `.env.local`.

#### 5. Configurer la base de données

```bash
# Générer le client Prisma (nécessaire après chaque modification du schéma)
npm run db:generate

# Appliquer les migrations pour créer les tables
npm run db:migrate
```

**En cas d'erreur :**

- Vérifiez que PostgreSQL est bien démarré : `docker compose ps`
- Vérifiez les logs : `docker compose logs postgres`
- Vérifiez que le port 5434 n'est pas déjà utilisé

#### 6. (Optionnel) Importer les données de test

Pour peupler la base de données avec des données de démonstration :

```bash
npm run db:import
```

Cette commande importe :

- **11 entreprises** (IUT de la Martinique, BEEPWAY.COM, DIGITAL FREEDOM CARAIBE, etc.)
- **11 tuteurs** associés aux entreprises
- **15 étudiants** avec leurs informations
- **15 stages** avec leurs détails (sujets, descriptions, dates)

**Note :** Les données sont importées avec des IDs spécifiques. Si vous exécutez la commande plusieurs fois, les données existantes seront mises à jour (pas de doublons).

#### 7. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

#### 8. Vérifier que tout fonctionne

1. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur
2. Vous devriez voir le tableau de bord
3. Testez la navigation entre les pages
4. Si vous avez importé les données de test, vous devriez voir des stages, entreprises, étudiants et tuteurs dans les différentes sections

### 🔧 Configuration optionnelle : Groq Cloud (IA)

Pour activer le parsing intelligent de PDF et le chat assistant :

1. **Créer un compte** sur [https://console.groq.com](https://console.groq.com)
2. **Générer une clé API** dans la section API Keys
3. **Configurer** dans `.env.local` :
   ```env
   GROQ_API_KEY=votre_cle_api
   GROQ_MODEL=llama-3.1-8b-instant
   ```
   Modèles disponibles : `llama-3.1-8b-instant` (rapide, recommandé), `llama-3.1-70b-versatile`, etc.

**Note :** Sans `GROQ_API_KEY`, le parsing utilisera la méthode regex par défaut et le chat ne sera pas disponible.

## 📁 Structure du projet

```
001-suivi-stages-IUT/
├── prisma/
│   ├── schema.prisma          # Schéma Prisma avec tous les modèles
│   └── migrations/             # Migrations de base de données
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # Pages du tableau de bord (administration)
│   │   │   ├── gestion-etudiants/    # Gestion des étudiants
│   │   │   ├── stages/               # Gestion des stages
│   │   │   ├── entreprises/          # Gestion des entreprises
│   │   │   ├── tuteurs/               # Gestion des tuteurs
│   │   │   ├── suivi-stage/           # Suivi des stages
│   │   │   ├── referents-stage/       # Référents de stage
│   │   │   ├── validations-stage/     # Fiches de validation
│   │   │   └── conventions-stage/     # Conventions de stage
│   │   ├── etudiants/          # Pages dédiées aux étudiants
│   │   │   ├── formulaire-stage/      # Formulaire de déclaration de stage
│   │   │   ├── entreprises/           # Consultation des entreprises
│   │   │   ├── stages/                # Consultation des stages
│   │   │   └── aide/                  # Assistant virtuel
│   │   ├── api/                # API Routes
│   │   │   ├── stages/
│   │   │   ├── entreprises/
│   │   │   ├── etudiants/
│   │   │   ├── tuteurs/
│   │   │   ├── enseignants/
│   │   │   ├── referents-stage/
│   │   │   ├── suivi-stage/
│   │   │   ├── validations-stage/
│   │   │   ├── conventions-stage/
│   │   │   ├── formulaire-stage/
│   │   │   ├── parse-convention/      # Parsing de conventions PDF
│   │   │   ├── stats/                 # Statistiques
│   │   │   └── chat/                  # Assistant virtuel (chat)
│   │   └── globals.css         # Styles globaux
│   ├── components/
│   │   ├── dashboard/          # Composants du tableau de bord
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── departement-selector.tsx
│   │   │   ├── nav-item.tsx
│   │   │   ├── providers.tsx
│   │   │   └── search.tsx
│   │   ├── ui/                 # Composants UI (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── onboarding-card.tsx # Carte d'onboarding
│   │   ├── nextstep-wrapper.tsx # Wrapper pour NextStep.js
│   │   └── icons.tsx           # Icônes personnalisées
│   ├── lib/
│   │   ├── prisma.ts           # Client Prisma singleton
│   │   ├── validations.ts      # Schémas de validation Zod
│   │   ├── export-csv.ts       # Export de données en CSV
│   │   ├── parse-convention.ts # Parsing de conventions PDF (regex)
│   │   ├── parse-convention-groq.ts # Parsing avec Groq Cloud
│   │   └── onboarding-steps.ts # Étapes d'onboarding
│   ├── types/
│   │   ├── index.ts            # Types TypeScript
│   │   └── pdf-parse.d.ts      # Types pour pdf-parse
│   └── generated/              # Client Prisma généré
├── scripts/
│   ├── import-data.ts          # Script d'import de données
│   └── migrate-referents-to-enseignants.ts # Migration des référents
├── public/
│   ├── documents/              # Documents de référence
│   ├── uploads/                # Fichiers uploadés
│   └── *.svg                   # Logos et icônes
├── docker-compose.yml          # Configuration Docker Compose
└── Dockerfile                   # Image Docker pour production
```

## ✅ Fonctionnalités implémentées

### Configuration

- ✅ Next.js 16 avec App Router
- ✅ TypeScript configuré
- ✅ Tailwind CSS 4 avec couleurs personnalisées
- ✅ Prisma ORM avec schéma complet
- ✅ Docker Compose pour PostgreSQL
- ✅ Dockerfile pour production
- ✅ Système d'onboarding avec NextStep.js

### Base de données

- ✅ Schéma Prisma avec 8 modèles :
  - `Entreprise` - Gestion des entreprises partenaires
  - `Etudiant` - Gestion des étudiants
  - `Tuteur` - Gestion des tuteurs en entreprise
  - `Enseignant` - Gestion des enseignants
  - `Stage` - Gestion des stages
  - `ReferentStage` - Référents de stage par département/promotion
  - `VisiteSuiviStage` - Visites de suivi de stage
  - `ConventionStage` - Conventions de stage (PDF)
- ✅ Relations entre les modèles configurées
- ✅ Champs `created_at` et `updated_at` automatiques
- ✅ Support multi-départements (INFO, GEA, HSE, MLT, TC)
- ✅ Gestion des promotions et années universitaires

### API Routes

#### Gestion des entités

- ✅ `/api/stages` (GET, POST, DELETE)
  - Recherche multi-critères
  - Ajout en cascade (entreprise, étudiant, tuteur)
  - Suppression multiple
  - Validation Zod
- ✅ `/api/entreprises` (GET, POST, PUT, DELETE)
- ✅ `/api/etudiants` (GET, POST, PUT, DELETE)
- ✅ `/api/tuteurs` (GET, POST, PUT, DELETE)
- ✅ `/api/enseignants` (GET, POST)
- ✅ `/api/referents-stage` (GET, POST, PUT, DELETE)

#### Fonctionnalités avancées

- ✅ `/api/formulaire-stage` - Formulaire de déclaration de stage
- ✅ `/api/suivi-stage` - Suivi des stages avec visites
- ✅ `/api/validations-stage` - Gestion des fiches de validation
- ✅ `/api/conventions-stage` - Upload et gestion des conventions PDF
- ✅ `/api/parse-convention` - Parsing automatique de conventions PDF
- ✅ `/api/stats` - Statistiques du système
- ✅ `/api/chat` - Assistant virtuel (chat avec IA)

### Pages Dashboard (Administration)

#### Gestion des entités

- ✅ `/gestion-etudiants` - Liste et gestion des étudiants
  - Ajout, modification, suppression
  - Filtrage par département
  - Recherche
- ✅ `/stages` - Liste et gestion des stages
  - Ajout, modification, suppression
  - Filtrage par statut, département, promotion
  - Recherche multi-critères
- ✅ `/entreprises` - Liste et gestion des entreprises
  - Ajout, modification, suppression
  - Filtrage par département
  - Recherche
- ✅ `/tuteurs` - Liste et gestion des tuteurs
  - Ajout, modification, suppression
  - Filtrage par département
  - Recherche

#### Fonctionnalités spécialisées

- ✅ `/suivi-stage` - Suivi des stages avec visites
  - Création et gestion des visites de suivi
  - Formulaire de suivi structuré
- ✅ `/referents-stage` - Gestion des référents de stage
  - Attribution par département/promotion/année
- ✅ `/validations-stage` - Gestion des fiches de validation
  - Upload et consultation des fiches
- ✅ `/conventions-stage` - Gestion des conventions
  - Upload de conventions PDF
  - Parsing automatique
  - Consultation et téléchargement

### Pages Étudiants

- ✅ `/etudiants` - Tableau de bord étudiant
  - Vue d'ensemble des stages
  - Accès rapide aux fonctionnalités
- ✅ `/etudiants/formulaire-stage` - Déclaration de stage
  - Formulaire complet de déclaration
  - Préremplissage depuis convention PDF
  - Validation en temps réel
- ✅ `/etudiants/entreprises` - Consultation des entreprises
  - Liste des entreprises partenaires
  - Filtrage par département
  - Détails des entreprises
- ✅ `/etudiants/stages` - Consultation des stages
  - Liste des stages
  - Détails des stages
- ✅ `/etudiants/aide` - Assistant virtuel
  - Chat avec IA spécialisée IUT Martinique
  - Aide contextuelle

### Composants

#### Composants Dashboard

- ✅ `Breadcrumb` - Fil d'Ariane
- ✅ `DepartementSelector` - Sélecteur de département
- ✅ `NavItem` - Item de navigation
- ✅ `Search` - Barre de recherche globale
- ✅ `Providers` - Providers React (thème, etc.)

#### Composants UI

- ✅ Composants shadcn/ui complets :
  - Button, Card, Dialog, Input, Select, Textarea
  - Badge, Checkbox, Dropdown Menu, Tabs
  - Alert Dialog, Tooltip, Progress, Sheet
  - Table

#### Composants spéciaux

- ✅ `OnboardingCard` - Carte d'onboarding
- ✅ `NextStepWrapper` - Wrapper pour les tours guidés
- ✅ `Icons` - Icônes personnalisées

### Utilitaires

- ✅ Client Prisma singleton
- ✅ Schémas de validation Zod complets
- ✅ Export CSV des données par département
- ✅ Parsing de conventions PDF (Groq Cloud ou regex)
- ✅ Types TypeScript pour tous les modèles
- ✅ Système d'onboarding configurable

### Scripts

- ✅ `scripts/import-data.ts` - Import de données depuis fichiers
- ✅ `scripts/migrate-referents-to-enseignants.ts` - Migration des référents

## 🔨 Commandes utiles

### Développement

```bash
# Lancer le serveur de développement
npm run dev
# → Accessible sur http://localhost:3000

# Build pour production
npm run build

# Démarrer en production (après build)
npm start

# Vérifier le code avec ESLint
npm run lint
```

### Base de données

```bash
# Générer le client Prisma (à faire après chaque modification du schéma)
npm run db:generate

# Créer une nouvelle migration et l'appliquer
npm run db:migrate
# → Crée un fichier dans prisma/migrations/ et applique les changements

# Appliquer le schéma directement sans créer de migration
npm run db:push
# → Utile pour le développement rapide

# Ouvrir Prisma Studio (interface graphique pour la base de données)
npm run db:studio
# → Ouvre http://localhost:5555

# Importer des données de test
npm run db:import

# Migrer les référents vers enseignants (migration spécifique)
npm run db:migrate-referents
```

### Docker

```bash
# Démarrer PostgreSQL en arrière-plan
docker compose up -d postgres

# Voir le statut des conteneurs
docker compose ps

# Arrêter les services
docker compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker compose down -v

# Voir les logs en temps réel
docker compose logs -f postgres

# Redémarrer PostgreSQL
docker compose restart postgres

# Accéder au conteneur PostgreSQL
docker exec -it gestion-stages-db psql -U postgres -d gestion_stages
```

### Dépannage

```bash
# Si la base de données ne démarre pas
docker compose logs postgres

# Si le port 5434 est déjà utilisé
# Modifier DB_PORT dans .env.local et docker-compose.yml

# Réinitialiser complètement la base de données
docker compose down -v
docker compose up -d postgres
npm run db:migrate
```

## 📝 Notes techniques

### Technologies utilisées

- **Framework** : Next.js 16 avec App Router
- **Langage** : TypeScript (mode strict)
- **Styling** : Tailwind CSS 4
- **ORM** : Prisma avec génération de types
- **Base de données** : PostgreSQL
- **Validation** : Zod
- **UI Components** : Radix UI (via shadcn/ui)
- **Parsing PDF** : pdf-parse
- **IA/Assistant** : Groq Cloud (parsing PDF et chat)
- **Onboarding** : NextStep.js

### Architecture

- **App Router** : Utilisation du nouveau système de routing de Next.js
- **Server Components** : Composants serveur par défaut pour les pages de liste et de détail
- **Client Components** : Utilisés uniquement pour l'interactivité (formulaires, interactions utilisateur)
- **API Routes** : Routes API pour toutes les opérations CRUD avec configuration de route segment
- **Prisma** : ORM avec génération de types TypeScript
- **Middleware** : Middleware Next.js pour la gestion centralisée des headers et de la sécurité
- **Metadata API** : Metadata configurée pour le SEO et l'accessibilité

### Fonctionnalités avancées

- **Multi-départements** : Support de 5 départements (INFO, GEA, HSE, MLT, TC)
- **Gestion des promotions** : Support des promotions 1, 2 et 3
- **Années universitaires** : Format "2024-2025", "2025-2026", etc.
- **Parsing PDF** : Extraction automatique de données depuis conventions PDF
- **Assistant virtuel** : Chat avec IA pour aider les étudiants
- **Export CSV** : Export des données par département
- **Onboarding** : Tours guidés pour les nouveaux utilisateurs

## 🐳 Docker

### Configuration

Le projet utilise Docker Compose pour PostgreSQL en développement. La configuration se trouve dans `docker-compose.yml`. Utilisez la commande `docker compose` (avec un espace) au lieu de `docker-compose`.

### Variables d'environnement

Assurez-vous de configurer les variables suivantes dans `.env.local` :

- `DATABASE_URL` - URL de connexion PostgreSQL
- `DB_USER` - Utilisateur PostgreSQL (défaut: postgres)
- `DB_PASSWORD` - Mot de passe PostgreSQL (défaut: postgres)
- `DB_NAME` - Nom de la base de données (défaut: gestion_stages)
- `DB_PORT` - Port PostgreSQL (défaut: 5434)

## 📚 Documentation supplémentaire

Pour plus d'informations sur :

- Les scripts disponibles : voir `scripts/README.md`
- Le schéma de base de données : voir `prisma/schema.prisma`
- Les types TypeScript : voir `src/types/index.ts`

## 🔒 Sécurité et Production

### Améliorations de sécurité implémentées

- ✅ **Headers de sécurité** : Configuration des headers HTTP de sécurité (HSTS, X-Frame-Options, etc.)
- ✅ **Rate limiting** : Protection contre les abus avec limitation du nombre de requêtes par IP
- ✅ **Stockage sécurisé** : Les fichiers uploadés sont stockés hors du dossier `public/` et servis via une API sécurisée
- ✅ **Logging structuré** : Système de logging avec niveaux (debug, info, warn, error)
- ✅ **Gestion d'erreurs centralisée** : Gestion standardisée des erreurs avec codes d'erreur
- ✅ **Middleware** : Middleware Next.js pour la gestion centralisée des headers et de la sécurité au niveau des routes
- ✅ **Route segment config** : Configuration explicite du dynamic rendering et du cache pour toutes les routes API
- ✅ **Metadata API** : Metadata SEO et accessibilité configurée pour toutes les pages principales

### Optimisations et Best Practices

- ✅ **Server Components** : Utilisation privilégiée des Server Components pour les pages de liste (stages, entreprises, étudiants)
- ✅ **TypeScript strict** : Types stricts avec utilisation des types Prisma générés
- ✅ **Optimisation des imports** : Configuration pour optimiser les imports de packages volumineux (lucide-react)
- ✅ **Configuration des images** : Optimisation automatique avec formats modernes (AVIF, WebP)
- ✅ **Suspense boundaries** : Utilisation de Suspense pour le streaming et les états de chargement

### Configuration pour la production

1. **Variables d'environnement** : Copier `ENV.example` vers `.env.local` et configurer :

   - `DATABASE_URL` : URL de connexion PostgreSQL
   - `NODE_ENV=production` : Mode production
   - `GROQ_API_KEY` et `GROQ_MODEL` : Configuration Groq Cloud (optionnel, pour parsing IA et chat)

2. **Build de production** :

   ```bash
   npm run build
   npm start
   ```

3. **Docker** : Le Dockerfile est configuré pour la production avec mode standalone

### Stockage des fichiers

Les fichiers uploadés (conventions, validations) sont stockés dans le dossier `storage/` (hors de `public/`) et servis via l'API `/api/files/[type]/[filename]` avec vérification de sécurité.

### Rate Limiting

- API générales : 100 requêtes/minute par IP
- Uploads : 10 uploads/minute par IP
- Chat : 30 messages/minute par IP

## ❓ Dépannage

### Problèmes courants

#### La base de données ne démarre pas

```bash
# Vérifier les logs
docker compose logs postgres

# Vérifier que le port 5434 n'est pas utilisé
lsof -i :5434  # macOS/Linux
netstat -ano | findstr :5434  # Windows

# Si le port est utilisé, changer DB_PORT dans .env.local et docker-compose.yml
```

#### Erreur "Prisma Client not generated"

```bash
# Régénérer le client Prisma
npm run db:generate
```

#### Erreur de migration

```bash
# Réinitialiser la base de données (⚠️ supprime toutes les données)
docker compose down -v
docker compose up -d postgres
npm run db:migrate
```

#### L'application ne se connecte pas à la base de données

1. Vérifier que PostgreSQL est démarré : `docker compose ps`
2. Vérifier `DATABASE_URL` dans `.env.local`
3. Tester la connexion : `npm run db:studio`

#### Erreurs de build

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Le chat ou le parsing IA ne fonctionne pas

1. Vérifier que `GROQ_API_KEY` est défini dans `.env.local`
2. Vérifier que la clé est valide sur [console.groq.com](https://console.groq.com)
3. En cas de limite de requêtes (429), attendre quelques secondes puis réessayer

### Obtenir de l'aide

- Vérifier les logs : `docker compose logs -f`
- Vérifier les erreurs dans la console du navigateur
- Vérifier les logs Next.js dans le terminal

## 📄 Licence

Ce projet est développé par Harrow Jean-Michel pour l'IUT de la Martinique.
