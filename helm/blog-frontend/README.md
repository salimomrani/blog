# Blog Frontend Helm Chart

Helm chart pour déployer le frontend Angular du blog sur Kubernetes.

## Prérequis

- Kubernetes 1.19+
- Helm 3.0+
- Image Docker du frontend construite et disponible

## Installation

### Installation basique

```bash
helm install blog-frontend ./helm/blog-frontend
```

### Installation avec valeurs personnalisées

```bash
helm install blog-frontend ./helm/blog-frontend \
  --set image.repository=your-registry/blog-frontend \
  --set image.tag=1.0.0
```

### Installation avec fichier values personnalisé

```bash
helm install blog-frontend ./helm/blog-frontend -f custom-values.yaml
```

## Configuration

### Paramètres principaux

| Paramètre | Description | Défaut |
|-----------|-------------|--------|
| `replicaCount` | Nombre de replicas | `2` |
| `image.repository` | Repository de l'image Docker | `blog-frontend` |
| `image.tag` | Tag de l'image Docker | `latest` |
| `image.pullPolicy` | Politique de pull de l'image | `IfNotPresent` |
| `service.type` | Type de service Kubernetes | `ClusterIP` |
| `service.port` | Port du service | `80` |
| `ingress.enabled` | Activer l'Ingress | `false` |
| `ingress.className` | Classe Ingress Controller | `nginx` |
| `ingress.hosts[0].host` | Nom de domaine | `blog.example.com` |
| `resources.limits.cpu` | Limite CPU | `500m` |
| `resources.limits.memory` | Limite mémoire | `512Mi` |
| `autoscaling.enabled` | Activer HPA | `false` |
| `nginxConfig.enabled` | Utiliser ConfigMap nginx | `true` |
| `nginxConfig.backendUrl` | URL du backend | `http://blog-backend:8080` |

### Exemple de configuration pour production

```yaml
# production-values.yaml
replicaCount: 3

image:
  repository: registry.example.com/blog-frontend
  tag: "1.0.0"
  pullPolicy: Always

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: blog.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: blog-frontend-tls
      hosts:
        - blog.example.com

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 200m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

nginxConfig:
  enabled: true
  backendUrl: "https://backend.example.com"
```

## Commandes utiles

### Installer le chart

```bash
helm install blog-frontend ./helm/blog-frontend -f production-values.yaml
```

### Mettre à jour le déploiement

```bash
helm upgrade blog-frontend ./helm/blog-frontend -f production-values.yaml
```

### Désinstaller le chart

```bash
helm uninstall blog-frontend
```

### Vérifier les valeurs

```bash
helm get values blog-frontend
```

### Dry-run (test sans installation)

```bash
helm install blog-frontend ./helm/blog-frontend --dry-run --debug
```

### Générer les manifests

```bash
helm template blog-frontend ./helm/blog-frontend
```

## Architecture

Le chart déploie:
- **Deployment**: Gère les pods du frontend avec nginx
- **Service**: Expose l'application en interne
- **Ingress**: (optionnel) Expose l'application à l'extérieur
- **ConfigMap**: Configuration nginx avec proxy vers le backend
- **ServiceAccount**: Compte de service pour les pods
- **HPA**: (optionnel) Autoscaling horizontal

## Sécurité

- Pods exécutés en tant que non-root (user 101)
- SecurityContext strict appliqué
- readOnlyRootFilesystem activé
- Capabilities DROP ALL

## Monitoring

- Liveness probe sur `/` port 80
- Readiness probe sur `/` port 80

## Support

Pour les problèmes ou questions, créer une issue sur le repository GitHub.
