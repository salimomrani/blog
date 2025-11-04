#!/bin/bash

# Script pour configurer automatiquement les secrets GitHub
# Usage: ./configure-secrets.sh

set -e

echo "🔐 Configuration des secrets GitHub pour kOps..."
echo ""

# Vérifier que gh CLI est installé
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) n'est pas installé"
    echo "   Installez-le: https://cli.github.com/"
    exit 1
fi

# Vérifier l'authentification GitHub
if ! gh auth status &> /dev/null; then
    echo "❌ Vous n'êtes pas authentifié avec GitHub CLI"
    echo "   Exécutez: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI configuré"
echo ""

# Récupérer les credentials depuis les variables d'environnement
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
AWS_REGION="us-east-1"
KOPS_STATE_STORE="s3://kopsstate9569"
KOPS_CLUSTER_NAME="kubevpro.i-consulting.shop"

# Vérifier que les variables existent
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ Les variables AWS ne sont pas définies dans l'environnement"
    echo "   Exécutez: source ~/.bashrc ou source ~/.zshrc"
    exit 1
fi

echo "📝 Configuration des secrets suivants:"
echo "   - AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:0:10}..."
echo "   - AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:0:10}..."
echo "   - AWS_REGION: $AWS_REGION"
echo "   - KOPS_STATE_STORE: $KOPS_STATE_STORE"
echo "   - KOPS_CLUSTER_NAME: $KOPS_CLUSTER_NAME"
echo ""

read -p "Continuer ? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo ""
echo "🚀 Configuration des secrets GitHub..."

# Configurer chaque secret
gh secret set AWS_ACCESS_KEY_ID -b "$AWS_ACCESS_KEY_ID"
gh secret set AWS_SECRET_ACCESS_KEY -b "$AWS_SECRET_ACCESS_KEY"
gh secret set AWS_REGION -b "$AWS_REGION"
gh secret set KOPS_STATE_STORE -b "$KOPS_STATE_STORE"
gh secret set KOPS_CLUSTER_NAME -b "$KOPS_CLUSTER_NAME"

echo ""
echo "✅ Tous les secrets ont été configurés avec succès!"
echo ""
echo "📋 Secrets configurés:"
gh secret list

echo ""
echo "🗑️  N'oubliez pas de supprimer l'ancien secret KUBE_CONFIG_DATA:"
echo "   gh secret remove KUBE_CONFIG_DATA"
echo ""
echo "🎯 Vous pouvez maintenant tester le workflow:"
echo "   git push origin master"
echo "   gh run watch"
