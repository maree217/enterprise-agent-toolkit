#!/bin/bash

# Document Classifier Agent - One-Click Azure Deployment
# This script deploys a production-ready document classification system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
CLIENT_NAME=""
RESOURCE_GROUP=""
LOCATION="East US"
ENVIRONMENT="production"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show usage
show_usage() {
    echo "Usage: $0 --client CLIENT_NAME [OPTIONS]"
    echo ""
    echo "Required:"
    echo "  --client CLIENT_NAME    Client name for resource naming"
    echo ""
    echo "Optional:"
    echo "  --resource-group NAME   Resource group name (default: rg-classifier-CLIENT_NAME)"
    echo "  --location LOCATION     Azure region (default: East US)"
    echo "  --environment ENV       Environment (default: production)"
    echo "  --help                  Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 --client contoso --location 'West Europe'"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --client)
            CLIENT_NAME="$2"
            shift 2
            ;;
        --resource-group)
            RESOURCE_GROUP="$2"
            shift 2
            ;;
        --location)
            LOCATION="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown parameter: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$CLIENT_NAME" ]]; then
    print_error "Client name is required"
    show_usage
    exit 1
fi

# Set defaults based on client name
if [[ -z "$RESOURCE_GROUP" ]]; then
    RESOURCE_GROUP="rg-classifier-$CLIENT_NAME"
fi

# Configuration
APP_NAME="classifier-agent-$CLIENT_NAME"
CONTAINER_REGISTRY="cr$CLIENT_NAME$(date +%s)"
CONTAINER_APP_ENV="cae-classifier-$CLIENT_NAME"
CONTAINER_APP="ca-classifier-$CLIENT_NAME"
STORAGE_ACCOUNT="st$CLIENT_NAME$(date +%s)"
COSMOSDB_ACCOUNT="cosmos-classifier-$CLIENT_NAME"
OPENAI_ACCOUNT="openai-classifier-$CLIENT_NAME"
APP_INSIGHTS="ai-classifier-$CLIENT_NAME"

print_status "Starting deployment for client: $CLIENT_NAME"
print_status "Resource Group: $RESOURCE_GROUP"
print_status "Location: $LOCATION"
print_status "Environment: $ENVIRONMENT"

# Check if Azure CLI is installed and logged in
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! az account show &> /dev/null; then
    print_error "Please login to Azure CLI first: az login"
    exit 1
fi

# Check if .env file exists
if [[ ! -f ".env" ]]; then
    print_error ".env file not found. Please copy .env.example and configure it."
    exit 1
fi

# Source environment variables
source .env

print_status "Creating resource group..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --tags Environment="$ENVIRONMENT" Client="$CLIENT_NAME" \
    || print_warning "Resource group might already exist"

print_status "Creating Azure Container Registry..."
az acr create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$CONTAINER_REGISTRY" \
    --sku Basic \
    --admin-enabled true

print_status "Building and pushing container image..."
az acr build \
    --registry "$CONTAINER_REGISTRY" \
    --image "classifier-agent:latest" \
    .

print_status "Creating storage account for documents..."
az storage account create \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2

# Create blob containers
STORAGE_KEY=$(az storage account keys list --resource-group "$RESOURCE_GROUP" --account-name "$STORAGE_ACCOUNT" --query '[0].value' -o tsv)

az storage container create \
    --name "documents" \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$STORAGE_KEY" \
    --public-access off

az storage container create \
    --name "processed" \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$STORAGE_KEY" \
    --public-access off

print_status "Creating Cosmos DB for classification results..."
az cosmosdb create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$COSMOSDB_ACCOUNT" \
    --kind GlobalDocumentDB \
    --locations regionName="$LOCATION" failoverPriority=0 isZoneRedundant=False

az cosmosdb sql database create \
    --resource-group "$RESOURCE_GROUP" \
    --account-name "$COSMOSDB_ACCOUNT" \
    --name "classifier"

az cosmosdb sql container create \
    --resource-group "$RESOURCE_GROUP" \
    --account-name "$COSMOSDB_ACCOUNT" \
    --database-name "classifier" \
    --name "classifications" \
    --partition-key-path "/document_id" \
    --throughput 400

print_status "Creating Azure OpenAI service..."
if [[ -n "$AZURE_OPENAI_ENDPOINT" ]]; then
    print_warning "Using existing Azure OpenAI endpoint from .env"
else
    az cognitiveservices account create \
        --name "$OPENAI_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --kind OpenAI \
        --sku S0 \
        --subscription $(az account show --query id -o tsv)
    
    # Deploy GPT model
    az cognitiveservices account deployment create \
        --name "$OPENAI_ACCOUNT" \
        --resource-group "$RESOURCE_GROUP" \
        --deployment-name "gpt-35-turbo" \
        --model-name "gpt-35-turbo" \
        --model-version "0613" \
        --model-format OpenAI \
        --scale-settings-scale-type Standard
fi

print_status "Creating Application Insights..."
az extension add --name application-insights
az monitor app-insights component create \
    --app "$APP_INSIGHTS" \
    --location "$LOCATION" \
    --resource-group "$RESOURCE_GROUP" \
    --kind web

print_status "Creating Container Apps Environment..."
az extension add --name containerapp
az containerapp env create \
    --name "$CONTAINER_APP_ENV" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION"

print_status "Getting connection strings and keys..."
COSMOS_CONNECTION=$(az cosmosdb keys list --resource-group "$RESOURCE_GROUP" --name "$COSMOSDB_ACCOUNT" --type connection-strings --query 'connectionStrings[0].connectionString' -o tsv)
STORAGE_CONNECTION=$(az storage account show-connection-string --resource-group "$RESOURCE_GROUP" --name "$STORAGE_ACCOUNT" --query 'connectionString' -o tsv)
APP_INSIGHTS_KEY=$(az monitor app-insights component show --app "$APP_INSIGHTS" --resource-group "$RESOURCE_GROUP" --query 'instrumentationKey' -o tsv)

if [[ -z "$AZURE_OPENAI_ENDPOINT" ]]; then
    OPENAI_ENDPOINT=$(az cognitiveservices account show --name "$OPENAI_ACCOUNT" --resource-group "$RESOURCE_GROUP" --query 'properties.endpoint' -o tsv)
    OPENAI_KEY=$(az cognitiveservices account keys list --name "$OPENAI_ACCOUNT" --resource-group "$RESOURCE_GROUP" --query 'key1' -o tsv)
else
    OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT"
    OPENAI_KEY="$AZURE_OPENAI_KEY"
fi

print_status "Deploying Container App..."
az containerapp create \
    --name "$CONTAINER_APP" \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$CONTAINER_APP_ENV" \
    --image "$CONTAINER_REGISTRY.azurecr.io/classifier-agent:latest" \
    --target-port 8000 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 5 \
    --cpu 1.0 \
    --memory 2.0Gi \
    --registry-server "$CONTAINER_REGISTRY.azurecr.io" \
    --env-vars \
        AZURE_OPENAI_ENDPOINT="$OPENAI_ENDPOINT" \
        AZURE_OPENAI_KEY="$OPENAI_KEY" \
        AZURE_OPENAI_DEPLOYMENT="gpt-35-turbo" \
        COSMOS_CONNECTION_STRING="$COSMOS_CONNECTION" \
        STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" \
        APPLICATIONINSIGHTS_INSTRUMENTATIONKEY="$APP_INSIGHTS_KEY" \
        ENVIRONMENT="$ENVIRONMENT" \
        CLIENT_NAME="$CLIENT_NAME"

# Get the app URL
APP_URL=$(az containerapp show --name "$CONTAINER_APP" --resource-group "$RESOURCE_GROUP" --query 'properties.configuration.ingress.fqdn' -o tsv)

print_success "🎉 Document Classifier Agent deployed successfully!"
echo ""
echo -e "${GREEN}📋 Deployment Summary:${NC}"
echo "  Client: $CLIENT_NAME"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Application URL: https://$APP_URL"
echo "  Environment: $ENVIRONMENT"
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo "  Classification API: https://$APP_URL/classify"
echo "  Batch Processing: https://$APP_URL/classify/batch"
echo "  Upload Interface: https://$APP_URL/upload"
echo "  Monitoring Dashboard: https://$APP_URL/monitor"
echo ""
echo -e "${YELLOW}📊 Monitoring:${NC}"
echo "  Application Insights: https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Insights/components/$APP_INSIGHTS"
echo "  Storage Account: https://portal.azure.com/#@/resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT"
echo ""
echo -e "${GREEN}✅ Next Steps:${NC}"
echo "  1. Test classification: curl -X POST https://$APP_URL/classify -F 'file=@sample.pdf'"
echo "  2. Configure custom categories in the Azure portal"
echo "  3. Upload training documents to improve accuracy"
echo "  4. Set up monitoring alerts and dashboards"
echo ""

# Save deployment info
cat > deployment-info.json << EOF
{
    "client_name": "$CLIENT_NAME",
    "resource_group": "$RESOURCE_GROUP",
    "location": "$LOCATION",
    "environment": "$ENVIRONMENT",
    "app_url": "https://$APP_URL",
    "endpoints": {
        "classify": "https://$APP_URL/classify",
        "batch": "https://$APP_URL/classify/batch",
        "upload": "https://$APP_URL/upload",
        "monitor": "https://$APP_URL/monitor"
    },
    "resources": {
        "container_app": "$CONTAINER_APP",
        "storage_account": "$STORAGE_ACCOUNT",
        "cosmos_account": "$COSMOSDB_ACCOUNT",
        "app_insights": "$APP_INSIGHTS"
    },
    "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

print_success "Deployment information saved to deployment-info.json"