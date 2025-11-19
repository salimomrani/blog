# Kubernetes Deployment Guide

## Prerequisites

Before deploying the application, ensure your Kubernetes cluster has:

1. **NGINX Ingress Controller**
2. **cert-manager** (for automatic TLS certificates)

## Installation Steps

### 1. Install NGINX Ingress Controller

```bash
# Install using Helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Verify installation
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

**Or using kubectl:**
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/aws/deploy.yaml
```

### 2. Install cert-manager

```bash
# Install using kubectl
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager
```

**Or using Helm:**
```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true
```

### 3. Apply cert-manager ClusterIssuer

```bash
kubectl apply -f k8s/cert-manager.yaml
```

This creates two ClusterIssuers:
- `letsencrypt-prod` - Production Let's Encrypt certificates
- `letsencrypt-staging` - Staging certificates (for testing)

### 4. Deploy the Application

```bash
# Create namespace
kubectl create namespace blog-frontend

# Apply deployment and service
kubectl apply -f k8s/deployment.yaml

# Apply ingress
kubectl apply -f k8s/ingress.yaml
```

### 5. Configure DNS

Get the external IP of the NGINX Ingress Controller:

```bash
kubectl get svc -n ingress-nginx
```

Create a DNS A record pointing to this IP:
```
blog.kubevpro.i-consulting.shop -> <EXTERNAL-IP>
```

### 6. Verify TLS Certificate

Check certificate status:

```bash
# Check certificate
kubectl get certificate -n blog-frontend

# Check certificate details
kubectl describe certificate blog-frontend-tls -n blog-frontend

# Check ingress
kubectl get ingress -n blog-frontend
```

The certificate will be automatically issued by Let's Encrypt via cert-manager.

## Accessing the Application

Once deployed and DNS is configured:

- **URL**: https://blog.kubevpro.i-consulting.shop
- **Auto-redirect**: HTTP → HTTPS

## Troubleshooting

### Certificate not issuing

```bash
# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager

# Check certificate challenge
kubectl get challenges -n blog-frontend

# Check certificate orders
kubectl get certificaterequest -n blog-frontend
```

### Ingress not working

```bash
# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Check ingress details
kubectl describe ingress blog-frontend -n blog-frontend
```

### Test with staging first

To avoid Let's Encrypt rate limits, test with staging issuer first:

```yaml
# In k8s/ingress.yaml, change:
cert-manager.io/cluster-issuer: letsencrypt-staging
```

## Manual Deployment (without CI/CD)

```bash
# Apply all manifests
kubectl apply -f k8s/cert-manager.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get all,ingress,certificate -n blog-frontend
```
