# Guide d'intégration Helm dans votre workflow

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation Helm](#installation-helm)
3. [Workflow local](#workflow-local)
4. [Intégration CI/CD](#intégration-cicd)
5. [Gestion des secrets](#gestion-des-secrets)
6. [Bonnes pratiques](#bonnes-pratiques)

---

## Prérequis

- **Kubernetes cluster** configuré et accessible
- **kubectl** installé et configuré
- **Helm 3+** installé
- **Docker** pour build des images
- **Registry** Docker (Docker Hub, GCR, ECR, etc.)

---

## Installation Helm

### Linux

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### macOS

```bash
brew install helm
```

### Windows

```bash
choco install kubernetes-helm
```

Vérification:

```bash
helm version
```

---

## Workflow local

### 1. Build de l'image Docker

```bash
# Build de production
docker build -f Dockerfile.prod -t blog-frontend:dev .

# Tag pour votre registry
docker tag blog-frontend:dev your-registry/blog-frontend:dev

# Push vers le registry
docker push your-registry/blog-frontend:dev
```

### 2. Déploiement avec script

```bash
# Development
./scripts/deploy.sh dev

# Staging
./scripts/deploy.sh staging -i v1.2.3

# Production (dry-run first)
./scripts/deploy.sh prod -d
./scripts/deploy.sh prod -n production
```

### 3. Déploiement manuel

```bash
# Dev
helm upgrade --install blog-frontend ./helm/blog-frontend \
  -f ./helm/blog-frontend/values-dev.yaml \
  --namespace dev \
  --create-namespace

# Staging
helm upgrade --install blog-frontend ./helm/blog-frontend \
  -f ./helm/blog-frontend/values-staging.yaml \
  --namespace staging \
  --set image.tag=v1.2.3

# Production
helm upgrade --install blog-frontend ./helm/blog-frontend \
  -f ./helm/blog-frontend/values-prod.yaml \
  --namespace production \
  --set image.tag=v1.2.3
```

---

## Intégration CI/CD

### GitHub Actions

Créer `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/blog-frontend

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha

      - name: Build frontend
        run: npm ci && npm run build

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.prod
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-dev:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Helm
        uses: azure/setup-helm@v3
        with:
          version: '3.12.0'

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBE_CONFIG_DEV }}" | base64 -d > $HOME/.kube/config

      - name: Deploy to dev
        run: |
          helm upgrade --install blog-frontend ./helm/blog-frontend \
            -f ./helm/blog-frontend/values-dev.yaml \
            --namespace dev \
            --create-namespace \
            --set image.repository=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }} \
            --set image.tag=develop \
            --wait

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Helm
        uses: azure/setup-helm@v3

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > $HOME/.kube/config

      - name: Deploy to staging
        run: |
          ./scripts/deploy.sh staging \
            -i sha-${{ github.sha }} \
            -n staging

  deploy-prod:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Helm
        uses: azure/setup-helm@v3

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Configure kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > $HOME/.kube/config

      - name: Deploy to production
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}
          ./scripts/deploy.sh prod \
            -i $VERSION \
            -n production
```

### GitLab CI

Créer `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE/blog-frontend
  HELM_CHART: ./helm/blog-frontend

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - npm ci
    - npm run build
    - docker build -f Dockerfile.prod -t $DOCKER_IMAGE:$CI_COMMIT_SHA .
    - docker tag $DOCKER_IMAGE:$CI_COMMIT_SHA $DOCKER_IMAGE:latest
    - docker push $DOCKER_IMAGE:$CI_COMMIT_SHA
    - docker push $DOCKER_IMAGE:latest

deploy:dev:
  stage: deploy
  image: alpine/helm:latest
  only:
    - develop
  script:
    - kubectl config use-context dev
    - helm upgrade --install blog-frontend $HELM_CHART
        -f $HELM_CHART/values-dev.yaml
        --namespace dev
        --set image.tag=$CI_COMMIT_SHA

deploy:staging:
  stage: deploy
  image: alpine/helm:latest
  only:
    - main
  environment:
    name: staging
  script:
    - kubectl config use-context staging
    - helm upgrade --install blog-frontend $HELM_CHART
        -f $HELM_CHART/values-staging.yaml
        --namespace staging
        --set image.tag=$CI_COMMIT_SHA

deploy:prod:
  stage: deploy
  image: alpine/helm:latest
  only:
    - tags
  when: manual
  environment:
    name: production
  script:
    - kubectl config use-context production
    - helm upgrade --install blog-frontend $HELM_CHART
        -f $HELM_CHART/values-prod.yaml
        --namespace production
        --set image.tag=$CI_COMMIT_TAG
```

---

## Gestion des secrets

### Créer des secrets Kubernetes

```bash
# Secret pour image registry
kubectl create secret docker-registry registry-credentials \
  --docker-server=your-registry.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --namespace=production

# Secret pour backend API credentials
kubectl create secret generic backend-api-secret \
  --from-literal=api-key=your-api-key \
  --namespace=production
```

### Utiliser sealed-secrets (recommandé)

```bash
# Installer sealed-secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Installer kubeseal CLI
brew install kubeseal  # macOS
# ou
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-linux-amd64 -O kubeseal

# Créer un sealed secret
kubectl create secret generic backend-api-secret \
  --from-literal=api-key=your-api-key \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > sealed-secret.yaml

# Commit sealed-secret.yaml (c'est sûr!)
git add sealed-secret.yaml
```

### Utiliser Helm secrets

```bash
# Installer helm-secrets plugin
helm plugin install https://github.com/jkroepke/helm-secrets

# Créer fichier values secrets
cat > helm/blog-frontend/secrets-prod.yaml << EOF
nginxConfig:
  backendUrl: "https://api.production.com"
apiKey: "super-secret-key"
EOF

# Chiffrer
helm secrets enc helm/blog-frontend/secrets-prod.yaml

# Déployer
helm secrets upgrade --install blog-frontend ./helm/blog-frontend \
  -f ./helm/blog-frontend/values-prod.yaml \
  -f ./helm/blog-frontend/secrets-prod.yaml
```

---

## Bonnes pratiques

### 1. Versioning

```bash
# Utiliser des tags sémantiques
git tag v1.2.3
git push origin v1.2.3

# Référencer dans le déploiement
helm upgrade --install blog-frontend ./helm/blog-frontend \
  --set image.tag=v1.2.3
```

### 2. Rollback

```bash
# Voir l'historique
helm history blog-frontend -n production

# Rollback vers version précédente
helm rollback blog-frontend -n production

# Rollback vers version spécifique
helm rollback blog-frontend 3 -n production
```

### 3. Testing

```bash
# Dry-run avant déploiement
helm upgrade --install blog-frontend ./helm/blog-frontend \
  -f values-prod.yaml \
  --dry-run --debug

# Lint du chart
helm lint ./helm/blog-frontend

# Test des templates
helm template blog-frontend ./helm/blog-frontend \
  -f values-prod.yaml
```

### 4. Monitoring

```bash
# Surveiller les pods
kubectl get pods -n production -w

# Logs en temps réel
kubectl logs -f -l app.kubernetes.io/name=blog-frontend -n production

# Events
kubectl get events -n production --sort-by='.lastTimestamp'

# Metrics (si metrics-server installé)
kubectl top pods -n production
```

### 5. Health checks

```bash
# Vérifier le health de l'application
kubectl port-forward svc/blog-frontend 8080:80 -n production
curl http://localhost:8080

# Vérifier le statut du déploiement
kubectl rollout status deployment/blog-frontend -n production
```

---

## Workflow complet recommandé

```bash
# 1. Développement local
docker-compose up

# 2. Build et test
npm run build
npm test

# 3. Build image
docker build -f Dockerfile.prod -t blog-frontend:dev .

# 4. Test Helm chart
helm lint ./helm/blog-frontend
helm template blog-frontend ./helm/blog-frontend -f values-dev.yaml

# 5. Déployer en dev
./scripts/deploy.sh dev -d  # dry-run
./scripts/deploy.sh dev      # deploy

# 6. Vérifier
kubectl get pods -n dev
kubectl logs -f deployment/blog-frontend -n dev

# 7. Tag et push pour staging
git tag v1.2.3
git push origin v1.2.3

# 8. CI/CD prend le relais pour staging/prod
```

---

## Support

Pour toute question, consulter:
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- README.md du chart
