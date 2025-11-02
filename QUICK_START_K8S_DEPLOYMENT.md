# Quick Start: Kubernetes Deployment

This is a quick reference guide to get your Kubernetes deployment running. For detailed information, see `KUBERNETES_DEPLOYMENT_SETUP.md`.

## Prerequisites

- Docker Hub credentials configured (`DOCKER_USERNAME`, `DOCKER_PASSWORD` secrets)
- Access to kops cluster (kubevpro.i-consulting.shop)
- kubectl configured locally

## 1. Get Base64 Encoded Kubeconfig

Run this command to encode your kubeconfig:

```bash
cat ~/.kube/config | base64 -w 0
```

Copy the entire output (it's a long string).

## 2. Add GitHub Secret

1. Go to: **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Click: **New repository secret**
3. Name: `KUBE_CONFIG_DATA`
4. Value: Paste the base64 string from step 1
5. Click: **Add secret**

## 3. Test the Pipeline

Push a commit to master/main:

```bash
git add .
git commit -m "Test K8s deployment"
git push origin master
```

## 4. Monitor Deployment

### In GitHub:
- Go to **Actions** tab
- Click on the latest workflow run
- Watch the **Deploy to Kubernetes** job

### In Kubernetes:
```bash
kubectl rollout status deployment/blog-frontend
kubectl get pods -l app=blog-frontend
```

## 5. Verify Application

Open in browser: http://blog.kubevpro.i-consulting.shop

## Pipeline Flow

```
Commit → Push to master
   ↓
Build and Test (lint + test + build)
   ↓
Docker Build (push to iconsultingdev/blog-frontend:latest)
   ↓
Deploy to Kubernetes (apply manifests + restart deployment)
   ↓
Application live at http://blog.kubevpro.i-consulting.shop
```

## Troubleshooting Quick Fixes

### "Unauthorized" Error
```bash
# Verify kubeconfig works locally
kubectl cluster-info

# Re-encode and update GitHub secret
cat ~/.kube/config | base64 -w 0
```

### Deployment Timeout
```bash
# Check pod status
kubectl get pods -l app=blog-frontend

# View logs
kubectl logs -l app=blog-frontend --tail=50

# Check events
kubectl get events --sort-by='.lastTimestamp' | grep blog-frontend
```

### Manual Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/blog-frontend

# Check status
kubectl rollout status deployment/blog-frontend
```

## Key Files

- **CI/CD Pipeline**: `.github/workflows/ci.yml`
- **Deployment**: `k8s/deployment.yaml`
- **Service**: `k8s/service.yaml`
- **Ingress**: `k8s/ingress.yaml`
- **Full Documentation**: `KUBERNETES_DEPLOYMENT_SETUP.md`

## What Happens on Each Push to Master

1. Runs ESLint and Jest tests
2. Builds Angular production bundle
3. Builds Docker image and pushes to Docker Hub
4. Deploys to Kubernetes cluster
5. Restarts deployment to pull latest image
6. Waits for rollout to complete (5min timeout)
7. Verifies deployment status

## Security Notes

- Never commit kubeconfig to git
- Use service accounts for production (see full documentation)
- Rotate credentials every 90 days
- Monitor deployment logs regularly

## Next Steps

After successful deployment:
- Set up monitoring (Prometheus/Grafana)
- Configure autoscaling
- Add smoke tests
- Implement canary deployments
- Set up alerts

For detailed instructions and advanced configuration, refer to `KUBERNETES_DEPLOYMENT_SETUP.md`.
