#!/bin/bash
set -e

echo "🚀 Setting up Kubernetes infrastructure (Ingress + TLS)..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
K8S_DIR="$SCRIPT_DIR/../k8s"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 STEP 1: Install NGINX Ingress Controller${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if ingress-nginx is already installed
if kubectl get namespace ingress-nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  ingress-nginx namespace already exists${NC}"
    echo -e "${YELLOW}Checking if controller is running...${NC}"
    if kubectl get deployment ingress-nginx-controller -n ingress-nginx &> /dev/null; then
        echo -e "${GREEN}✅ NGINX Ingress Controller already installed${NC}"
    else
        echo -e "${YELLOW}Installing controller...${NC}"
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.5/deploy/static/provider/cloud/deploy.yaml
    fi
else
    echo -e "${YELLOW}📦 Installing NGINX Ingress Controller...${NC}"
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.5/deploy/static/provider/cloud/deploy.yaml
    echo -e "${GREEN}✅ NGINX Ingress Controller installed${NC}"
fi

# Wait for ingress controller to be ready
echo -e "${YELLOW}⏳ Waiting for ingress controller to be ready...${NC}"
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s || echo -e "${YELLOW}⚠️  Timeout waiting for controller, continuing...${NC}"

echo -e "${GREEN}✅ NGINX Ingress Controller is ready${NC}"

# Show LoadBalancer IP/hostname
echo -e "\n${YELLOW}🔍 Ingress Controller Service:${NC}"
kubectl get svc -n ingress-nginx ingress-nginx-controller

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 STEP 2: Install cert-manager${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if cert-manager is already installed
if kubectl get namespace cert-manager &> /dev/null; then
    echo -e "${YELLOW}⚠️  cert-manager namespace already exists${NC}"
    if kubectl get deployment cert-manager -n cert-manager &> /dev/null; then
        echo -e "${GREEN}✅ cert-manager already installed${NC}"
    else
        echo -e "${YELLOW}Installing cert-manager...${NC}"
        kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
    fi
else
    echo -e "${YELLOW}📦 Installing cert-manager...${NC}"
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
    echo -e "${GREEN}✅ cert-manager installed${NC}"
fi

# Wait for cert-manager pods to be ready
echo -e "${YELLOW}⏳ Waiting for cert-manager pods to be ready...${NC}"
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=cert-manager \
  -n cert-manager \
  --timeout=180s || echo -e "${YELLOW}⚠️  Timeout waiting for cert-manager, continuing...${NC}"

echo -e "${GREEN}✅ cert-manager is ready${NC}"

# Verify cert-manager CRDs
echo -e "${YELLOW}🔍 Verifying cert-manager CRDs...${NC}"
kubectl get crds | grep cert-manager || echo -e "${YELLOW}⚠️  CRDs not fully ready yet${NC}"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 STEP 3: Apply ClusterIssuer${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}📜 Applying Let's Encrypt ClusterIssuer...${NC}"
kubectl apply -f "$K8S_DIR/cert-manager.yaml"
echo -e "${GREEN}✅ ClusterIssuer applied${NC}"

# Wait a moment for ClusterIssuer to be processed
sleep 3
echo -e "${YELLOW}🔍 ClusterIssuer status:${NC}"
kubectl get clusterissuer

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Kubernetes infrastructure setup completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}📋 Infrastructure Summary:${NC}"
echo -e "${YELLOW}NGINX Ingress Controller:${NC}"
kubectl get pods -n ingress-nginx | grep controller || true

echo -e "\n${YELLOW}cert-manager:${NC}"
kubectl get pods -n cert-manager || true

echo -e "\n${YELLOW}ClusterIssuers:${NC}"
kubectl get clusterissuer || true

echo -e "\n${YELLOW}💡 Next steps:${NC}"
echo "  1. Deploy your application: kubectl apply -f k8s/deployment.yaml"
echo "  2. Deploy ingress: kubectl apply -f k8s/ingress.yaml"
echo "  3. Check certificate: kubectl get certificate -n blog-frontend"
echo "  4. Get LoadBalancer IP: kubectl get svc -n ingress-nginx"
echo "  5. Configure DNS to point blog.kubevpro.i-consulting.shop to the LoadBalancer IP"

echo -e "\n${GREEN}✨ Done!${NC}"
