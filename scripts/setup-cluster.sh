#!/bin/bash

################################################################################
# NGINX Ingress Controller Setup Script for AWS EKS Cluster
################################################################################
#
# This script installs and configures the NGINX Ingress Controller on an AWS
# EKS cluster. It's designed to be idempotent (safe to run multiple times).
#
# Prerequisites:
#   - kubectl installed and configured with cluster access
#   - AWS EKS cluster running and accessible
#   - Proper IAM permissions for creating LoadBalancers
#
# Usage:
#   ./scripts/setup-cluster.sh
#
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INGRESS_NGINX_VERSION="controller-v1.8.1"
INGRESS_MANIFEST_URL="https://raw.githubusercontent.com/kubernetes/ingress-nginx/${INGRESS_NGINX_VERSION}/deploy/static/provider/aws/deploy.yaml"
NAMESPACE="ingress-nginx"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    print_success "kubectl is installed"

    # Check if we can connect to the cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please configure kubectl first."
        exit 1
    fi
    print_success "Connected to Kubernetes cluster"

    # Display cluster info
    echo ""
    print_info "Cluster Information:"
    kubectl cluster-info | head -n 2
    echo ""
}

check_existing_installation() {
    print_header "Checking Existing Installation"

    if kubectl get namespace $NAMESPACE &> /dev/null; then
        print_warning "NGINX Ingress Controller namespace already exists"

        if kubectl get deployment ingress-nginx-controller -n $NAMESPACE &> /dev/null; then
            print_warning "NGINX Ingress Controller is already installed"

            # Show current status
            echo ""
            print_info "Current Controller Status:"
            kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=controller

            echo ""
            read -p "Do you want to reinstall? This will delete and recreate the controller. (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_info "Removing existing installation..."
                kubectl delete namespace $NAMESPACE --timeout=120s
                print_success "Existing installation removed"
                sleep 5
                return 1  # Not installed anymore
            else
                print_info "Keeping existing installation"
                return 0  # Already installed
            fi
        else
            print_warning "Namespace exists but controller not found. Cleaning up..."
            kubectl delete namespace $NAMESPACE --timeout=120s || true
            sleep 5
            return 1  # Not installed
        fi
    else
        print_info "NGINX Ingress Controller is not installed"
        return 1  # Not installed
    fi
}

install_ingress_controller() {
    print_header "Installing NGINX Ingress Controller"

    print_info "Using manifest: $INGRESS_MANIFEST_URL"
    echo ""

    # Apply the manifest
    print_info "Applying Kubernetes manifest..."
    if kubectl apply -f "$INGRESS_MANIFEST_URL"; then
        print_success "Manifest applied successfully"
    else
        print_error "Failed to apply manifest"
        exit 1
    fi

    echo ""
    print_info "Waiting for namespace to be active..."
    kubectl wait --for=jsonpath='{.status.phase}'=Active namespace/$NAMESPACE --timeout=60s
    print_success "Namespace is active"

    echo ""
    print_info "Waiting for controller pods to be ready (this may take 2-5 minutes)..."
    if kubectl wait --namespace $NAMESPACE \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/component=controller \
        --timeout=300s; then
        print_success "Controller pods are ready"
    else
        print_error "Controller pods failed to become ready within timeout"
        print_info "Check pod status with: kubectl get pods -n $NAMESPACE"
        exit 1
    fi
}

wait_for_load_balancer() {
    print_header "Waiting for Load Balancer"

    print_info "AWS is provisioning the Load Balancer (this may take 3-5 minutes)..."
    echo ""

    local max_wait=600  # 10 minutes max
    local elapsed=0
    local interval=10

    while [ $elapsed -lt $max_wait ]; do
        LB_HOSTNAME=$(kubectl get service ingress-nginx-controller -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
        LB_IP=$(kubectl get service ingress-nginx-controller -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

        if [ -n "$LB_HOSTNAME" ] || [ -n "$LB_IP" ]; then
            echo ""
            print_success "Load Balancer is ready!"
            return 0
        fi

        printf "\r  Waiting for Load Balancer... (%ds elapsed)" "$elapsed"
        sleep $interval
        elapsed=$((elapsed + interval))
    done

    echo ""
    print_warning "Load Balancer took longer than expected to provision"
    print_info "It may still be provisioning in the background"
    return 1
}

display_installation_summary() {
    print_header "Installation Summary"

    echo ""
    print_info "NGINX Ingress Controller Resources:"
    kubectl get all -n $NAMESPACE

    echo ""
    echo ""
    print_info "Ingress Controller Service:"
    kubectl get service ingress-nginx-controller -n $NAMESPACE

    echo ""
    echo ""

    # Get Load Balancer details
    LB_HOSTNAME=$(kubectl get service ingress-nginx-controller -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    LB_IP=$(kubectl get service ingress-nginx-controller -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

    if [ -n "$LB_HOSTNAME" ] || [ -n "$LB_IP" ]; then
        print_success "Load Balancer Address:"
        if [ -n "$LB_HOSTNAME" ]; then
            echo "  Hostname: $LB_HOSTNAME"
        fi
        if [ -n "$LB_IP" ]; then
            echo "  IP: $LB_IP"
        fi

        echo ""
        print_header "DNS Configuration"
        print_info "To configure your DNS, create a CNAME record:"
        echo ""
        echo "  Type:   CNAME"
        echo "  Name:   blog (or your subdomain)"
        echo "  Value:  $LB_HOSTNAME"
        echo "  TTL:    300 (or as desired)"
        echo ""
        print_info "For your domain blog.kubevpro.i-consulting.shop:"
        echo "  blog.kubevpro.i-consulting.shop -> $LB_HOSTNAME"
    else
        print_warning "Load Balancer address not yet available"
        print_info "Run this command to get the address once it's provisioned:"
        echo "  kubectl get service ingress-nginx-controller -n ingress-nginx"
    fi
}

verify_installation() {
    print_header "Verifying Installation"

    # Check namespace
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        print_success "Namespace exists"
    else
        print_error "Namespace not found"
        return 1
    fi

    # Check deployment
    if kubectl get deployment ingress-nginx-controller -n $NAMESPACE &> /dev/null; then
        print_success "Controller deployment exists"
    else
        print_error "Controller deployment not found"
        return 1
    fi

    # Check pods
    local ready_pods=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=controller -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l)
    if [ "$ready_pods" -gt 0 ]; then
        print_success "Controller pod is ready"
    else
        print_error "Controller pod is not ready"
        return 1
    fi

    # Check service
    if kubectl get service ingress-nginx-controller -n $NAMESPACE &> /dev/null; then
        print_success "Controller service exists"
    else
        print_error "Controller service not found"
        return 1
    fi

    echo ""
    print_success "Installation verification completed successfully!"
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    print_header "NGINX Ingress Controller Setup for AWS EKS"
    echo ""

    # Step 1: Check prerequisites
    check_prerequisites

    # Step 2: Check if already installed
    if check_existing_installation; then
        echo ""
        print_success "NGINX Ingress Controller is already installed and running"
        verify_installation
        display_installation_summary
        exit 0
    fi

    # Step 3: Install the controller
    echo ""
    install_ingress_controller

    # Step 4: Wait for Load Balancer
    echo ""
    wait_for_load_balancer

    # Step 5: Verify installation
    echo ""
    verify_installation

    # Step 6: Display summary
    echo ""
    display_installation_summary

    echo ""
    print_success "Setup completed successfully!"
    echo ""
}

# Run main function
main
