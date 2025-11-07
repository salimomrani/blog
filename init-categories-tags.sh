#!/bin/bash

# Script pour initialiser les catégories et tags
# Usage: ./init-categories-tags.sh <access_token>

if [ -z "$1" ]; then
  echo "Usage: ./init-categories-tags.sh <access_token>"
  echo "Vous devez fournir votre token d'authentification"
  exit 1
fi

ACCESS_TOKEN=$1
API_URL="http://localhost:8080/api/v1"

echo "🚀 Initialisation des catégories et tags..."
echo ""

# Créer les catégories
echo "📂 Création des catégories..."

CATEGORIES=(
  '{"name":"Frontend","description":"Articles sur le développement frontend (Angular, React, Vue)"}'
  '{"name":"Backend","description":"Articles sur le développement backend (Spring Boot, Node.js)"}'
  '{"name":"DevOps","description":"Articles sur DevOps, CI/CD et déploiement"}'
  '{"name":"Database","description":"Articles sur les bases de données"}'
  '{"name":"Architecture","description":"Articles sur l architect système et les design patterns"}'
)

for category in "${CATEGORIES[@]}"; do
  RESPONSE=$(curl -s -X POST "$API_URL/categories" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "$category")

  NAME=$(echo "$category" | jq -r '.name')
  if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "  ✅ Catégorie '$NAME' créée"
  else
    echo "  ❌ Erreur pour '$NAME': $(echo $RESPONSE | jq -r '.message')"
  fi
done

echo ""
echo "🏷️  Création des tags..."

TAGS=(
  '{"name":"Angular"}'
  '{"name":"TypeScript"}'
  '{"name":"JavaScript"}'
  '{"name":"Spring Boot"}'
  '{"name":"Java"}'
  '{"name":"Docker"}'
  '{"name":"Kubernetes"}'
  '{"name":"PostgreSQL"}'
  '{"name":"MongoDB"}'
  '{"name":"REST API"}'
  '{"name":"GraphQL"}'
  '{"name":"Microservices"}'
  '{"name":"Testing"}'
  '{"name":"Security"}'
  '{"name":"Performance"}'
)

for tag in "${TAGS[@]}"; do
  RESPONSE=$(curl -s -X POST "$API_URL/tags" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "$tag")

  NAME=$(echo "$tag" | jq -r '.name')
  if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "  ✅ Tag '$NAME' créé"
  else
    echo "  ❌ Erreur pour '$NAME': $(echo $RESPONSE | jq -r '.message')"
  fi
done

echo ""
echo "✨ Initialisation terminée !"
echo ""
echo "📊 Résumé :"
echo "  - ${#CATEGORIES[@]} catégories"
echo "  - ${#TAGS[@]} tags"
