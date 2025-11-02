# Kubernetes Deployment Guide

## Prerequisites

1. Docker image built and pushed to a container registry
2. Kubernetes cluster running (kops cluster configured)
3. kubectl configured to access your cluster
4. NGINX Ingress Controller installed in your cluster

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build the Docker image
docker build -t iconsultingdev/blog-frontend:latest .

# Push to your registry (DockerHub)
docker push iconsultingdev/blog-frontend:latest
```

**Docker Registry:** Using Docker Hub registry `iconsultingdev/blog-frontend:latest`

### 2. Install NGINX Ingress Controller (if not already installed)

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### 3. Deploy the Application

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods

# Check service
kubectl get svc

# Check ingress
kubectl get ingress

# View logs
kubectl logs -l app=blog-frontend
```

### 5. Access the Application

The application will be accessible at: `http://blog.kubevpro.i-consulting.shop`

Make sure your DNS is configured to point `blog.kubevpro.i-consulting.shop` to your ingress controller's external IP.

```bash
# Get ingress external IP
kubectl get ingress blog-frontend-ingress
```

## Configuration Details

### Deployment
- **Replicas:** 2 pods for high availability
- **Resources:**
  - Requests: 128Mi memory, 100m CPU
  - Limits: 256Mi memory, 200m CPU
- **Health Checks:** Liveness and readiness probes configured

### Service
- **Type:** ClusterIP (internal only)
- **Port:** 80

### Ingress
- **Host:** blog.kubevpro.i-consulting.shop
- **Path:** / (root path)
- **Backend:** blog-frontend-service on port 80

## Useful Commands

```bash
# Update deployment after image change
kubectl rollout restart deployment/blog-frontend

# Scale deployment
kubectl scale deployment/blog-frontend --replicas=3

# View deployment status
kubectl rollout status deployment/blog-frontend

# Delete all resources
kubectl delete -f k8s/
```

## Troubleshooting

```bash
# Check pod logs
kubectl logs -l app=blog-frontend --tail=50

# Describe pod for events
kubectl describe pod -l app=blog-frontend

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

## Notes

- Docker Hub registry configured: `iconsultingdev/blog-frontend:latest`
- The Ingress requires NGINX Ingress Controller to be installed
- DNS must be configured to point your domain to the ingress external IP
- For HTTPS/TLS, you'll need to add cert-manager or configure TLS in the Ingress
