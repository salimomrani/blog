# Scripts Directory

This directory contains utility scripts for setting up and managing the Kubernetes cluster infrastructure.

## Available Scripts

### setup-cluster.sh

One-time setup script for installing the NGINX Ingress Controller on your AWS EKS cluster.

**Purpose:**
- Installs the NGINX Ingress Controller for AWS
- Verifies the installation
- Waits for the Load Balancer to be provisioned
- Displays DNS configuration instructions

**Prerequisites:**
- kubectl installed and configured with cluster access
- AWS EKS cluster running and accessible
- Proper IAM permissions for creating AWS LoadBalancers

**Usage:**

```bash
# Run the script
./scripts/setup-cluster.sh
```

**Features:**

1. **Idempotent Operation**: Safe to run multiple times
   - Checks if already installed before proceeding
   - Prompts for confirmation before reinstalling

2. **Comprehensive Verification**:
   - Validates kubectl connectivity
   - Checks cluster accessibility
   - Verifies all components are running

3. **Load Balancer Monitoring**:
   - Waits for AWS to provision the Load Balancer
   - Displays the Load Balancer hostname/IP when ready
   - Provides DNS configuration instructions

4. **Error Handling**:
   - Clear error messages with exit on failure
   - Color-coded output for better readability
   - Timeout protection for long-running operations

**Output Example:**

```
========================================
NGINX Ingress Controller Setup for AWS EKS
========================================

========================================
Checking Prerequisites
========================================
✓ kubectl is installed
✓ Connected to Kubernetes cluster

========================================
Installing NGINX Ingress Controller
========================================
✓ Manifest applied successfully
✓ Namespace is active
✓ Controller pods are ready

========================================
Waiting for Load Balancer
========================================
✓ Load Balancer is ready!

========================================
DNS Configuration
========================================
ℹ To configure your DNS, create a CNAME record:

  Type:   CNAME
  Name:   blog
  Value:  a1234567890abcdef.elb.us-east-1.amazonaws.com
  TTL:    300
```

**What It Does:**

1. **Checks Prerequisites**:
   - Verifies kubectl is installed
   - Confirms connection to Kubernetes cluster

2. **Checks Existing Installation**:
   - Detects if NGINX Ingress Controller is already installed
   - Offers option to reinstall if needed

3. **Installs NGINX Ingress Controller**:
   - Applies the official AWS manifest (v1.8.1)
   - Waits for namespace creation
   - Waits for controller pods to be ready (up to 5 minutes)

4. **Waits for Load Balancer**:
   - Monitors AWS Load Balancer provisioning
   - Displays hostname/IP when available
   - Times out after 10 minutes with warning

5. **Verifies Installation**:
   - Checks namespace exists
   - Validates deployment and pods are running
   - Confirms service is created

6. **Displays Summary**:
   - Shows all ingress controller resources
   - Displays Load Balancer address
   - Provides DNS configuration instructions

**Troubleshooting:**

If the script fails, check:

1. **kubectl not configured**:
   ```bash
   # Configure kubectl with your cluster
   aws eks update-kubeconfig --region us-east-1 --name your-cluster-name
   ```

2. **Permission issues**:
   - Ensure your AWS IAM role has permissions to create LoadBalancers
   - Check EKS cluster IAM roles and policies

3. **Pods not becoming ready**:
   ```bash
   # Check pod status
   kubectl get pods -n ingress-nginx

   # View pod logs
   kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
   ```

4. **Load Balancer not provisioning**:
   ```bash
   # Check service events
   kubectl describe service ingress-nginx-controller -n ingress-nginx

   # Check AWS console for Load Balancer creation
   ```

**Re-running the Script:**

The script is designed to be idempotent:
- If already installed, it will detect and ask for confirmation before reinstalling
- Safe to run multiple times without breaking your cluster
- Use it for validation or after cluster issues

**Integration with CI/CD:**

This script is intended for manual, one-time cluster setup. The CI/CD pipeline (`.github/workflows/ci.yml`) includes an automated version of this logic in the `deploy-to-kubernetes` job that:
- Automatically checks for the Ingress Controller
- Installs it if not present
- Is fully automated (no prompts)
- Runs on every deployment

## Notes

- The NGINX Ingress Controller version used is v1.8.1
- The scripts are configured for AWS EKS environments
- For other cloud providers (GCP, Azure), you would need different manifests
- All scripts include error handling and clear output messages
