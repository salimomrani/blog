#!/bin/bash
set -e

echo "🚀 Starting SSL/TLS setup with cert-manager and Let's Encrypt..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}📂 Working directory: $SCRIPT_DIR${NC}"

# Step 1: Check if Helm is installed
echo -e "${YELLOW}📦 Checking Helm installation...${NC}"
if ! command -v helm &> /dev/null; then
    echo -e "${RED}❌ Helm is not installed. Please install Helm first.${NC}"
    echo "Install Helm: curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash"
    exit 1
fi
echo -e "${GREEN}✅ Helm is installed${NC}"

# Step 2: Add cert-manager Helm repository
echo -e "${YELLOW}📦 Adding cert-manager Helm repository...${NC}"
helm repo add jetstack https://charts.jetstack.io
helm repo update
echo -e "${GREEN}✅ Helm repository added${NC}"

# Step 3: Install cert-manager
echo -e "${YELLOW}🔧 Installing cert-manager...${NC}"
if kubectl get namespace cert-manager &> /dev/null; then
    echo -e "${YELLOW}⚠️  cert-manager namespace already exists. Upgrading...${NC}"
    helm upgrade cert-manager jetstack/cert-manager \
      --namespace cert-manager \
      --version v1.14.0 \
      --set installCRDs=true
else
    helm install cert-manager jetstack/cert-manager \
      --namespace cert-manager \
      --create-namespace \
      --version v1.14.0 \
      --set installCRDs=true
fi
echo -e "${GREEN}✅ cert-manager installed${NC}"

# Step 4: Wait for cert-manager pods to be ready
echo -e "${YELLOW}⏳ Waiting for cert-manager pods to be ready...${NC}"
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=cert-manager \
  -n cert-manager \
  --timeout=180s
echo -e "${GREEN}✅ cert-manager pods are ready${NC}"

# Step 5: Verify cert-manager CRDs
echo -e "${YELLOW}🔍 Verifying cert-manager CRDs...${NC}"
kubectl get crds | grep cert-manager
echo -e "${GREEN}✅ cert-manager CRDs verified${NC}"

# Step 6: Deploy ClusterIssuer
echo -e "${YELLOW}📜 Deploying Let's Encrypt ClusterIssuer...${NC}"
kubectl apply -f 01-cluster-issuer-letsencrypt.yaml
echo -e "${GREEN}✅ ClusterIssuer deployed${NC}"

# Step 7: Wait for ClusterIssuer to be ready
echo -e "${YELLOW}⏳ Waiting for ClusterIssuer to be ready...${NC}"
sleep 5
kubectl get clusterissuer
echo -e "${GREEN}✅ ClusterIssuer status checked${NC}"

# Step 8: Deploy or update the Ingress with TLS
echo -e "${YELLOW}🌐 Deploying Ingress with TLS configuration...${NC}"
kubectl apply -f ingress.yaml
echo -e "${GREEN}✅ Ingress deployed${NC}"

# Step 9: Wait for certificate to be issued
echo -e "${YELLOW}⏳ Waiting for SSL certificate to be issued (this may take 1-3 minutes)...${NC}"
echo "Certificate status:"
sleep 10

# Check certificate status multiple times
for i in {1..12}; do
    echo -e "\n${YELLOW}Attempt $i/12 - Checking certificate status...${NC}"

    if kubectl get certificate blog-frontend-tls-cert &> /dev/null; then
        kubectl get certificate blog-frontend-tls-cert

        # Check if certificate is ready
        CERT_READY=$(kubectl get certificate blog-frontend-tls-cert -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}')

        if [ "$CERT_READY" == "True" ]; then
            echo -e "${GREEN}✅ Certificate is ready!${NC}"
            break
        fi
    else
        echo -e "${YELLOW}Certificate not found yet, waiting...${NC}"
    fi

    if [ $i -eq 12 ]; then
        echo -e "${RED}⚠️  Certificate not ready after 2 minutes. Check logs below:${NC}"
        kubectl describe certificate blog-frontend-tls-cert
    fi

    sleep 10
done

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 SSL/TLS setup completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}📋 Resource Summary:${NC}"
echo -e "${YELLOW}Cert-manager pods:${NC}"
kubectl get pods -n cert-manager

echo -e "\n${YELLOW}ClusterIssuers:${NC}"
kubectl get clusterissuer

echo -e "\n${YELLOW}Certificates:${NC}"
kubectl get certificate

echo -e "\n${YELLOW}Ingress:${NC}"
kubectl get ingress blog-frontend-ingress

echo -e "\n${YELLOW}🔗 Access your application:${NC}"
echo "  HTTP:  http://blog.kubevpro.i-consulting.shop"
echo "  HTTPS: https://blog.kubevpro.i-consulting.shop"

echo -e "\n${YELLOW}💡 Useful commands:${NC}"
echo "  Check certificate:        kubectl describe certificate blog-frontend-tls-cert"
echo "  Check cert-manager logs:  kubectl logs -n cert-manager -l app=cert-manager"
echo "  Check certificate secret: kubectl get secret blog-frontend-tls-cert"
echo "  Test HTTPS:               curl -I https://blog.kubevpro.i-consulting.shop"

echo -e "\n${GREEN}✨ Done!${NC}"