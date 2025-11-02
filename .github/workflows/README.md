# CI/CD Pipeline Documentation

## Pipeline Overview

This directory contains the GitHub Actions workflow for continuous integration and deployment.

## Workflow File

- **ci.yml**: Main CI/CD pipeline with build, test, Docker, and Kubernetes deployment

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Push to master/main                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  JOB 1: Build and Test                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Checkout code                                                 │
│  • Setup Node.js 22.x                                           │
│  • Install dependencies (npm ci)                                │
│  • Run ESLint                                                   │
│  • Run Jest tests                                               │
│  • Build Angular app (npm run build)                           │
│  • Upload build artifacts                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  JOB 2: Docker Build (only on push to master/main)             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Checkout code                                                 │
│  • Setup Docker Buildx                                          │
│  • Build Docker image (with cache)                             │
│  • Login to Docker Hub                                          │
│  • Push: iconsultingdev/blog-frontend:latest                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  JOB 3: Deploy to Kubernetes (only on push to master/main)     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Checkout code                                                 │
│  • Install kubectl v1.29.0                                      │
│  • Configure kubeconfig (from KUBE_CONFIG_DATA secret)         │
│  • Verify cluster connection                                    │
│  • Apply Kubernetes manifests:                                  │
│    - k8s/service.yaml                                           │
│    - k8s/deployment.yaml                                        │
│    - k8s/ingress.yaml                                           │
│  • Restart deployment (kubectl rollout restart)                │
│  • Wait for rollout completion (5min timeout)                  │
│  • Verify deployment status                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         Application Live at:                                     │
│         http://blog.kubevpro.i-consulting.shop                  │
└─────────────────────────────────────────────────────────────────┘
```

## Triggers

### Pull Request (all jobs except Docker build and K8s deploy)
- Runs on: `pull_request` to `master` or `main` branches
- Executes: Build and Test job only
- Purpose: Validate code changes before merge

### Push to master/main (all jobs)
- Runs on: `push` to `master` or `main` branches
- Executes: All three jobs (Build → Docker → Deploy)
- Purpose: Full CI/CD pipeline to production

## Job Dependencies

```
build-and-test
       ↓
docker-build (needs: build-and-test)
       ↓
deploy-to-kubernetes (needs: docker-build)
```

Each job waits for the previous job to complete successfully before starting.

## Required Secrets

The pipeline requires the following GitHub secrets to be configured:

| Secret Name | Purpose | Used In Job |
|------------|---------|-------------|
| `DOCKER_USERNAME` | Docker Hub username | docker-build |
| `DOCKER_PASSWORD` | Docker Hub password/token | docker-build |
| `KUBE_CONFIG_DATA` | Base64-encoded kubeconfig | deploy-to-kubernetes |

## Deployment Resources

### Kubernetes Manifests
- **Location**: `k8s/` directory
- **Files**:
  - `deployment.yaml`: 2 replicas, health checks, resource limits
  - `service.yaml`: ClusterIP service on port 80
  - `ingress.yaml`: nginx ingress for blog.kubevpro.i-consulting.shop

### Docker Image
- **Registry**: Docker Hub
- **Repository**: iconsultingdev/blog-frontend
- **Tag**: latest
- **Base Image**: nginx:alpine
- **Build Context**: Root directory with Dockerfile

### Kubernetes Cluster
- **Provider**: kops
- **Domain**: kubevpro.i-consulting.shop
- **Application URL**: http://blog.kubevpro.i-consulting.shop
- **Ingress Controller**: nginx

## Deployment Strategy

### Rolling Update (Zero Downtime)
1. New pods are created with the latest image
2. Health checks verify new pods are ready
3. Traffic is gradually shifted to new pods
4. Old pods are terminated after new pods are healthy

### Health Checks
- **Liveness Probe**: HTTP GET / (checks every 10s, starts after 30s)
- **Readiness Probe**: HTTP GET / (checks every 5s, starts after 5s)

### Resource Allocation
- **Requests**: 100m CPU, 128Mi memory per pod
- **Limits**: 200m CPU, 256Mi memory per pod
- **Replicas**: 2 pods for high availability

## Monitoring and Debugging

### View Pipeline Logs
1. Go to repository **Actions** tab
2. Select the workflow run
3. Click on individual jobs to see detailed logs

### Monitor Deployment
```bash
# Watch deployment status
kubectl rollout status deployment/blog-frontend

# View pods
kubectl get pods -l app=blog-frontend

# View logs
kubectl logs -l app=blog-frontend --tail=100 -f

# View events
kubectl get events --sort-by='.lastTimestamp'
```

### Rollback Failed Deployment
```bash
# View deployment history
kubectl rollout history deployment/blog-frontend

# Rollback to previous version
kubectl rollout undo deployment/blog-frontend

# Rollback to specific revision
kubectl rollout undo deployment/blog-frontend --to-revision=2
```

## Performance Optimizations

### Build Caching
- **Node modules**: Cached using `actions/setup-node@v4` with `cache: 'npm'`
- **Docker layers**: Cached using GitHub Actions cache (`type=gha`)
- **Benefits**: Faster builds, reduced network usage

### Build Artifacts
- **Angular build output** uploaded as artifact
- **Retention**: 7 days
- **Purpose**: Can be downloaded for debugging or redeployment

### Docker Buildx
- Multi-platform support (if needed)
- Advanced caching strategies
- Optimized layer building

## Security Best Practices

### Implemented
- Secrets stored in GitHub (encrypted at rest)
- Secrets not exposed in logs
- Kubeconfig file permissions set to 600
- Docker Hub authentication via secrets
- No hardcoded credentials

### Recommended
- Use service accounts instead of admin kubeconfig
- Rotate credentials every 90 days
- Enable vulnerability scanning for Docker images
- Use GitHub Environments with protection rules
- Implement RBAC in Kubernetes cluster
- Enable audit logging in Kubernetes

## Troubleshooting

### Common Issues

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Build fails | ESLint or test errors | Check logs, fix code issues |
| Docker push fails | Invalid credentials | Verify DOCKER_USERNAME and DOCKER_PASSWORD secrets |
| K8s auth fails | Invalid kubeconfig | Verify KUBE_CONFIG_DATA secret is correctly encoded |
| Deployment timeout | Image pull errors, resource constraints | Check pod status and events |
| Ingress not working | DNS issues, ingress controller down | Verify ingress controller and DNS |

### Debug Commands
```bash
# Check workflow syntax locally (requires act)
act -n

# Validate Kubernetes manifests
kubectl apply --dry-run=client -f k8s/

# Test kubeconfig
kubectl cluster-info
kubectl get nodes

# Check cluster capacity
kubectl top nodes
kubectl describe nodes
```

## Future Enhancements

### Recommended Improvements
- Add smoke tests after deployment
- Implement canary deployments
- Add Slack/email notifications
- Set up monitoring (Prometheus/Grafana)
- Configure autoscaling (HPA)
- Add security scanning (Trivy, Snyk)
- Implement GitOps (ArgoCD, Flux)
- Add performance testing
- Configure multiple environments (dev, staging, prod)
- Implement blue-green deployments

### Multi-Environment Example
```yaml
deploy-to-staging:
  environment: staging
  if: github.ref == 'refs/heads/develop'
  # ... deploy to staging cluster

deploy-to-production:
  environment: production  # Requires approval
  if: github.ref == 'refs/heads/main'
  # ... deploy to production cluster
```

## Documentation

- **Quick Start**: `QUICK_START_K8S_DEPLOYMENT.md`
- **Detailed Setup**: `KUBERNETES_DEPLOYMENT_SETUP.md`
- **Project Instructions**: `CLAUDE.md`
- **Main README**: `README.md`

## Support

For issues or questions:
1. Check the detailed documentation in `KUBERNETES_DEPLOYMENT_SETUP.md`
2. Review GitHub Actions logs for error messages
3. Verify cluster health and resource availability
4. Check Kubernetes events and pod logs
5. Consult official documentation:
   - [GitHub Actions](https://docs.github.com/en/actions)
   - [Kubernetes](https://kubernetes.io/docs/)
   - [kubectl](https://kubernetes.io/docs/reference/kubectl/)

## Changelog

### 2025-11-02: Added Kubernetes Deployment
- Added `deploy-to-kubernetes` job
- Configured kubectl v1.29.0
- Implemented rolling deployment strategy
- Added deployment verification steps
- Created comprehensive documentation

### Previous: Docker Build and Test
- Initial CI/CD pipeline with build and Docker push
- ESLint and Jest integration
- Docker Hub deployment
