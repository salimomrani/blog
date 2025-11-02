# Kubernetes Deployment Setup Guide

This guide explains how to configure GitHub Actions to automatically deploy your Angular application to your Kubernetes cluster.

## Overview

The CI/CD pipeline now includes three jobs:

1. **build-and-test**: Runs ESLint, Jest tests, and builds the Angular application
2. **docker-build**: Builds Docker image and pushes to Docker Hub (iconsultingdev/blog-frontend:latest)
3. **deploy-to-kubernetes**: Deploys the application to your kops cluster (kubevpro.i-consulting.shop)

## Pipeline Flow

```
Push to master/main
       ↓
Build and Test (lint + test + build)
       ↓
Docker Build (build image + push to Docker Hub)
       ↓
Deploy to Kubernetes (apply manifests + restart deployment)
       ↓
Application live at http://blog.kubevpro.i-consulting.shop
```

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Existing Secrets (already configured)
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password or access token

### New Secret Required
- `KUBE_CONFIG_DATA`: Base64-encoded kubeconfig file for your kops cluster

## How to Add KUBE_CONFIG_DATA Secret

### Step 1: Get Your Kubeconfig File

Your kubeconfig file is typically located at `~/.kube/config`. This file contains credentials and connection information for your Kubernetes cluster.

If you're using kops, ensure you have the correct context set:

```bash
# List available contexts
kubectl config get-contexts

# Switch to your kops cluster context (if needed)
kubectl config use-context kubevpro.i-consulting.shop

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### Step 2: Encode Kubeconfig to Base64

You need to encode your kubeconfig file to base64 before adding it to GitHub secrets.

**On Linux/macOS:**
```bash
cat ~/.kube/config | base64 -w 0
```

**Alternative method (works on all platforms):**
```bash
base64 < ~/.kube/config | tr -d '\n'
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("$env:USERPROFILE\.kube\config"))
```

Copy the entire output (it will be a long string).

### Step 3: Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name: `KUBE_CONFIG_DATA`
5. Value: Paste the base64-encoded string from Step 2
6. Click **Add secret**

## Security Best Practices

### Kubeconfig Security

The kubeconfig contains sensitive credentials. Follow these best practices:

1. **Use Service Account (Recommended)**

   Instead of using your personal admin kubeconfig, create a dedicated service account with limited permissions:

   ```bash
   # Create namespace (if not exists)
   kubectl create namespace blog-frontend

   # Create service account
   kubectl create serviceaccount github-deployer -n blog-frontend

   # Create role with deployment permissions
   kubectl create role deployer-role \
     --verb=get,list,watch,create,update,patch,delete \
     --resource=deployments,services,ingresses,pods \
     -n blog-frontend

   # Bind role to service account
   kubectl create rolebinding deployer-binding \
     --role=deployer-role \
     --serviceaccount=blog-frontend:github-deployer \
     -n blog-frontend

   # Get service account token (Kubernetes 1.24+)
   kubectl create token github-deployer -n blog-frontend --duration=87600h
   ```

2. **Rotate Credentials Regularly**

   Rotate your kubeconfig credentials periodically (every 90 days recommended).

3. **Use Least Privilege**

   Grant only the minimum permissions needed for deployment.

4. **Monitor Access**

   Regularly audit deployment logs and cluster access.

### GitHub Secrets Security

- Never commit kubeconfig or credentials to your repository
- Only repository administrators can view/edit secrets
- Secrets are encrypted at rest by GitHub
- Secrets are redacted in workflow logs

## Deployment Process Details

### What Happens During Deployment

1. **Install kubectl**: Sets up kubectl v1.29.0 in the GitHub Actions runner
2. **Configure kubeconfig**: Decodes the base64 kubeconfig and configures kubectl
3. **Verify Connection**: Connects to the cluster and verifies access
4. **Apply Manifests**: Applies Kubernetes manifests in order:
   - `k8s/service.yaml` - ClusterIP service
   - `k8s/deployment.yaml` - Deployment with 2 replicas
   - `k8s/ingress.yaml` - Ingress for blog.kubevpro.i-consulting.shop
5. **Restart Deployment**: Performs rolling restart to pull latest Docker image
6. **Wait for Rollout**: Waits up to 5 minutes for deployment to complete
7. **Verify**: Checks deployment, pods, service, and ingress status

### Rollout Strategy

The deployment uses a **RollingUpdate** strategy (Kubernetes default):
- New pods are created with the latest image
- Old pods are terminated only after new pods are ready
- Zero-downtime deployment with health checks (liveness and readiness probes)

### Rollback Procedure

If a deployment fails, you can rollback manually:

```bash
# View rollout history
kubectl rollout history deployment/blog-frontend

# Rollback to previous version
kubectl rollout undo deployment/blog-frontend

# Rollback to specific revision
kubectl rollout undo deployment/blog-frontend --to-revision=2
```

## Kubernetes Manifests Overview

### Deployment (k8s/deployment.yaml)
- **Image**: `iconsultingdev/blog-frontend:latest`
- **Replicas**: 2 pods for high availability
- **Resources**:
  - Requests: 100m CPU, 128Mi memory
  - Limits: 200m CPU, 256Mi memory
- **Health Checks**:
  - Liveness probe: HTTP GET / on port 80 (checks every 10s)
  - Readiness probe: HTTP GET / on port 80 (checks every 5s)

### Service (k8s/service.yaml)
- **Type**: ClusterIP (internal cluster access)
- **Port**: 80 → 80
- **Selector**: app=blog-frontend

### Ingress (k8s/ingress.yaml)
- **Host**: blog.kubevpro.i-consulting.shop
- **Ingress Class**: nginx
- **Path**: / (prefix matching)
- **Backend**: blog-frontend-service:80

## Monitoring Deployments

### View Workflow Runs

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select the latest workflow run
4. Click on **Deploy to Kubernetes** job to view logs

### Monitor Kubernetes Cluster

```bash
# Watch deployment rollout
kubectl rollout status deployment/blog-frontend

# View pods
kubectl get pods -l app=blog-frontend -w

# View logs from all pods
kubectl logs -l app=blog-frontend --tail=100 -f

# View deployment events
kubectl describe deployment blog-frontend

# View ingress
kubectl get ingress blog-frontend-ingress
```

### Access Application

After successful deployment:
- **URL**: http://blog.kubevpro.i-consulting.shop
- Verify the application is running with the latest changes

## Troubleshooting

### Deployment Fails with "Unauthorized"

**Problem**: kubectl cannot authenticate with the cluster

**Solution**:
1. Verify `KUBE_CONFIG_DATA` secret is correctly set
2. Ensure kubeconfig is valid: `kubectl cluster-info`
3. Check kubeconfig has correct cluster URL and credentials

### Image Pull Errors

**Problem**: Kubernetes cannot pull the Docker image

**Solution**:
1. Verify Docker Hub image exists: https://hub.docker.com/r/iconsultingdev/blog-frontend
2. Check image tag is correct (`latest`)
3. If using private repository, add image pull secret

### Rollout Timeout

**Problem**: Deployment rollout exceeds 5-minute timeout

**Solution**:
1. Check pod status: `kubectl get pods -l app=blog-frontend`
2. View pod logs: `kubectl logs <pod-name>`
3. Check events: `kubectl describe pod <pod-name>`
4. Common issues:
   - Image pull failures
   - Resource constraints (CPU/memory)
   - Failed health checks
   - Node capacity issues

### Ingress Not Working

**Problem**: Application not accessible via ingress URL

**Solution**:
1. Verify ingress controller is installed: `kubectl get pods -n ingress-nginx`
2. Check ingress: `kubectl describe ingress blog-frontend-ingress`
3. Verify DNS: `nslookup blog.kubevpro.i-consulting.shop`
4. Check service endpoints: `kubectl get endpoints blog-frontend-service`

## Advanced Configuration

### Deploy to Multiple Environments

To deploy to different environments (dev, staging, production), you can:

1. Create environment-specific manifests in separate directories
2. Use GitHub Environments with protection rules
3. Add environment variables to the workflow

Example:
```yaml
deploy-to-production:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: docker-build
  environment: production  # Requires approval
  if: github.ref == 'refs/heads/main'
  # ... deployment steps
```

### Use Helm Charts

For more complex deployments, consider using Helm:

```yaml
- name: Install Helm
  uses: azure/setup-helm@v4

- name: Deploy with Helm
  run: |
    helm upgrade --install blog-frontend ./helm/blog-frontend \
      --set image.tag=latest \
      --wait --timeout 5m
```

### Add Smoke Tests

Add smoke tests after deployment:

```yaml
- name: Run smoke tests
  run: |
    # Wait for ingress to be ready
    sleep 30

    # Test application endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" http://blog.kubevpro.i-consulting.shop)
    if [ $response -eq 200 ]; then
      echo "Smoke test passed: Application is accessible"
    else
      echo "Smoke test failed: Got HTTP $response"
      exit 1
    fi
```

### Implement Canary Deployments

For safer production deployments:

1. Deploy new version to a small subset of pods
2. Monitor metrics and errors
3. Gradually increase traffic to new version
4. Rollback if issues detected

This requires additional tooling like Flagger, Argo Rollouts, or Istio.

## Testing the Pipeline

### Test the Complete Pipeline

1. Make a change to your Angular application
2. Commit and push to `master` or `main` branch:
   ```bash
   git add .
   git commit -m "Test deployment pipeline"
   git push origin master
   ```
3. Watch the workflow in GitHub Actions
4. Verify deployment: http://blog.kubevpro.i-consulting.shop

### Test Only Kubernetes Deployment

If you want to test just the Kubernetes deployment without rebuilding:

```bash
# Manually trigger deployment from your local machine
kubectl apply -f k8s/
kubectl rollout restart deployment/blog-frontend
kubectl rollout status deployment/blog-frontend
```

## Cost Optimization

1. **Use appropriate resource requests/limits** to avoid over-provisioning
2. **Implement autoscaling** for variable traffic:
   ```bash
   kubectl autoscale deployment blog-frontend --min=2 --max=5 --cpu-percent=80
   ```
3. **Use spot instances** for non-production environments
4. **Monitor resource usage** and adjust accordingly

## Next Steps

1. Add the `KUBE_CONFIG_DATA` secret to GitHub (see instructions above)
2. Push a commit to `master` or `main` to trigger the pipeline
3. Monitor the deployment in GitHub Actions
4. Verify the application at http://blog.kubevpro.i-consulting.shop

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [kops Documentation](https://kops.sigs.k8s.io/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

## Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Review the troubleshooting section above
3. Verify cluster health: `kubectl get nodes` and `kubectl get pods --all-namespaces`
4. Check cluster events: `kubectl get events --sort-by='.lastTimestamp'`
