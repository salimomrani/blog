#!/bin/bash

# Script pour créer un article de test
# Usage: ./create-test-article.sh <access_token>

if [ -z "$1" ]; then
  echo "Usage: ./create-test-article.sh <access_token>"
  echo "Vous devez fournir votre token d'authentification"
  exit 1
fi

ACCESS_TOKEN=$1
API_URL="http://localhost:8080/api/v1/articles"

# Article de test avec contenu enrichi
ARTICLE_DATA='{
  "title": "Introduction à Angular 20 et les Signal Stores",
  "content": "<h2>Découvrez les nouveautés d'\''Angular 20</h2><p>Angular 20 marque un tournant majeur dans le développement d'\''applications web modernes. Avec l'\''introduction des <strong>Signal Stores</strong> et l'\''amélioration continue des <strong>Standalone Components</strong>, le framework offre une expérience de développement sans précédent.</p><h3>Les Signals : Une révolution dans la réactivité</h3><p>Les Signals représentent une nouvelle approche de la réactivité dans Angular :</p><ul><li>Performance optimisée avec une détection de changements fine-grained</li><li>Syntaxe simple et intuitive</li><li>Meilleure intégration avec le change detection</li><li>TypeScript-first avec un typage fort</li></ul><h3>NgRx Signal Store</h3><p>Le Signal Store de NgRx simplifie la gestion d'\''état en combinant la puissance de NgRx avec la simplicité des Signals. Plus besoin de boilerplate complexe !</p><pre><code>export const UsersStore = signalStore(\n  { providedIn: '\''root'\'' },\n  withState(initialState),\n  withMethods((store) => ({\n    loadUsers: rxMethod&lt;void&gt;(...)\n  }))\n);</code></pre><h3>Standalone Components</h3><p>Fini les NgModules ! Les composants standalone permettent de créer des applications plus modulaires et maintenables. Chaque composant déclare ses propres dépendances de manière explicite.</p><h3>Conclusion</h3><p>Angular 20 continue d'\''évoluer dans la bonne direction, offrant aux développeurs des outils modernes et performants. C'\''est le moment idéal pour migrer vos applications ou démarrer de nouveaux projets !</p><blockquote><p>💡 <em>Astuce</em> : Commencez petit avec les Signals dans vos composants existants, puis migrez progressivement vers les Signal Stores.</p></blockquote>"
}'

echo "🚀 Création de l'article de test..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$ARTICLE_DATA")

echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  ARTICLE_ID=$(echo "$RESPONSE" | jq -r '.data.id')
  echo ""
  echo "✅ Article créé avec succès !"
  echo "📝 ID de l'article : $ARTICLE_ID"
  echo "🔗 Voir l'article : http://localhost:4200/articles/$ARTICLE_ID"
else
  echo ""
  echo "❌ Erreur lors de la création de l'article"
fi
