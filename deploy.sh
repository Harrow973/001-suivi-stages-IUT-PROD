#!/bin/bash

# Script de déploiement automatique pour VPS KVM
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de l'application de suivi de stages"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Erreur: docker-compose.prod.yml non trouvé"
    echo "   Assurez-vous d'être dans le répertoire du projet"
    exit 1
fi

# Vérifier que .env.production existe
if [ ! -f ".env.production" ]; then
    echo "⚠️  Fichier .env.production non trouvé"
    echo "   Création depuis ENV.example..."
    if [ -f "ENV.example" ]; then
        cp ENV.example .env.production
        echo "✅ Fichier .env.production créé"
        echo "⚠️  IMPORTANT: Éditez .env.production avec vos valeurs de production"
        echo "   Puis relancez ce script"
        exit 1
    else
        echo "❌ Erreur: ENV.example non trouvé"
        exit 1
    fi
fi

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "   Installez Docker avec: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# Vérifier Docker Compose (plugin)
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé ou n'est pas disponible"
    exit 1
fi

echo "📦 Construction et démarrage des conteneurs..."
# Charger les variables d'environnement pour docker compose (nécessaire pour les variables dans environment:)
# Méthode sûre pour charger les variables en filtrant les commentaires et lignes vides
set -a
eval $(grep -v '^#' .env.production | grep -v '^$' | sed 's/^/export /')
set +a
# Le fichier .env.production est aussi chargé via env_file dans docker-compose.prod.yml pour les conteneurs
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "⏳ Attente que PostgreSQL soit prêt (15 secondes)..."
sleep 15

echo ""
echo "🔄 Application des migrations de base de données..."
# Utilise le service Node.js dédié (connexion postgres:5432 via le réseau Docker)
docker compose -f docker-compose.prod.yml run --rm node npx prisma migrate deploy || {
    echo "⚠️  Les migrations ont peut-être déjà été appliquées ou une erreur s'est produite"
    echo "   Vérifiez les logs avec: docker compose -f docker-compose.prod.yml logs postgres"
}

echo ""
echo "🤖 Configuration de Groq Cloud..."
# Vérifier si la clé API Groq est configurée
if [ -z "$GROQ_API_KEY" ]; then
    echo "   ⚠️  GROQ_API_KEY n'est pas configurée"
    echo "   Le parsing intelligent de PDF et le chat ne seront pas disponibles"
    echo "   Pour activer: configurez GROQ_API_KEY dans .env.production"
    echo "   Obtenez une clé API sur: https://console.groq.com"
else
    echo "   ✅ GROQ_API_KEY est configurée"
    GROQ_MODEL=${GROQ_MODEL:-llama-3.1-8b-instant}
    echo "   Modèle Groq: $GROQ_MODEL"
fi

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Vérification de l'état des services:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📝 Pour voir les logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🌐 L'application sera accessible sur l'URL configurée dans NEXT_PUBLIC_APP_URL (.env.production)"
echo "   (assurez-vous que Nginx est configuré et que le certificat SSL est valide)"

