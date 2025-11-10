#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RELEASE_NAME="blog-frontend"
CHART_PATH="./helm/blog-frontend"
NAMESPACE="default"

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to show usage
usage() {
    cat << EOF
Usage: $0 [ENVIRONMENT] [OPTIONS]

Deploy blog frontend to Kubernetes using Helm

ENVIRONMENT:
    dev         Deploy to development environment
    staging     Deploy to staging environment
    prod        Deploy to production environment

OPTIONS:
    -n, --namespace NAMESPACE    Kubernetes namespace (default: default)
    -r, --release NAME           Helm release name (default: blog-frontend)
    -i, --image-tag TAG          Override image tag
    -d, --dry-run                Run Helm in dry-run mode
    -h, --help                   Show this help message

EXAMPLES:
    $0 dev                       Deploy to dev environment
    $0 prod -n production        Deploy to prod in production namespace
    $0 staging -i v1.2.3         Deploy staging with specific image tag
    $0 prod -d                   Test prod deployment (dry-run)

EOF
}

# Parse arguments
if [ $# -eq 0 ]; then
    print_error "No environment specified"
    usage
    exit 1
fi

ENVIRONMENT=$1
shift

DRY_RUN=""
IMAGE_TAG=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--release)
            RELEASE_NAME="$2"
            shift 2
            ;;
        -i|--image-tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate environment
case $ENVIRONMENT in
    dev|staging|prod)
        VALUES_FILE="$CHART_PATH/values-$ENVIRONMENT.yaml"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        print_info "Valid environments: dev, staging, prod"
        exit 1
        ;;
esac

# Check if values file exists
if [ ! -f "$VALUES_FILE" ]; then
    print_error "Values file not found: $VALUES_FILE"
    exit 1
fi

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
    print_error "Helm is not installed. Please install Helm first."
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

print_info "Deploying blog-frontend to $ENVIRONMENT environment"
print_info "Namespace: $NAMESPACE"
print_info "Release: $RELEASE_NAME"
print_info "Values: $VALUES_FILE"

# Build Helm command
HELM_CMD="helm upgrade --install $RELEASE_NAME $CHART_PATH"
HELM_CMD="$HELM_CMD --namespace $NAMESPACE"
HELM_CMD="$HELM_CMD --create-namespace"
HELM_CMD="$HELM_CMD --values $VALUES_FILE"

if [ -n "$IMAGE_TAG" ]; then
    print_info "Image tag: $IMAGE_TAG"
    HELM_CMD="$HELM_CMD --set image.tag=$IMAGE_TAG"
fi

if [ -n "$DRY_RUN" ]; then
    print_warning "Running in DRY-RUN mode"
    HELM_CMD="$HELM_CMD $DRY_RUN --debug"
fi

# Execute Helm command
print_info "Executing: $HELM_CMD"
eval $HELM_CMD

if [ -z "$DRY_RUN" ]; then
    print_info "Deployment initiated successfully"

    # Wait for rollout
    print_info "Waiting for rollout to complete..."
    kubectl rollout status deployment/$RELEASE_NAME -n $NAMESPACE --timeout=5m

    print_info "Deployment completed successfully!"

    # Show deployment info
    echo ""
    print_info "Deployment information:"
    kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=blog-frontend

    # Show service info
    echo ""
    print_info "Service information:"
    kubectl get svc -n $NAMESPACE -l app.kubernetes.io/name=blog-frontend

    # Show ingress info if available
    if kubectl get ingress -n $NAMESPACE $RELEASE_NAME &> /dev/null; then
        echo ""
        print_info "Ingress information:"
        kubectl get ingress -n $NAMESPACE $RELEASE_NAME
    fi
fi
