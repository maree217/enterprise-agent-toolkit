#!/bin/bash

# Chat Agent Deployment Script
# Deploy a working chat agent in minutes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Parse arguments
CLIENT_NAME=""
ENVIRONMENT="dev"
REGION="eastus"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --client) CLIENT_NAME="$2"; shift ;;
        --environment) ENVIRONMENT="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --help) 
            echo "Usage: ./deploy.sh --client <name> [--environment dev|prod] [--region eastus|westus2]"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Validate required parameters
if [ -z "$CLIENT_NAME" ]; then
    print_error "Client name is required. Use --client <name>"
    exit 1
fi

# Generate unique names
RESOURCE_GROUP="rg-${CLIENT_NAME}-agent-${ENVIRONMENT}"
OPENAI_NAME="oai-${CLIENT_NAME}-${ENVIRONMENT}"
APP_NAME="app-${CLIENT_NAME}-chat-${ENVIRONMENT}"
COSMOS_NAME="cosmos-${CLIENT_NAME}-${ENVIRONMENT}"
STORAGE_NAME="st${CLIENT_NAME}${ENVIRONMENT}"

echo "
╔════════════════════════════════════════════╗
║     Chat Agent Deployment for ${CLIENT_NAME}     ║
╚════════════════════════════════════════════╝
"

print_status "Configuration:"
echo "  Client: ${CLIENT_NAME}"
echo "  Environment: ${ENVIRONMENT}"
echo "  Region: ${REGION}"
echo "  Resource Group: ${RESOURCE_GROUP}"
echo ""

# Check Azure CLI login
print_status "Checking Azure CLI authentication..."
if ! az account show &>/dev/null; then
    print_error "Not logged in to Azure. Running 'az login'..."
    az login
fi

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
print_status "Using subscription: ${SUBSCRIPTION_ID}"

# Create resource group
print_status "Creating resource group..."
az group create \
    --name "${RESOURCE_GROUP}" \
    --location "${REGION}" \
    --output none

# Create Azure OpenAI resource
print_status "Creating Azure OpenAI resource..."
az cognitiveservices account create \
    --name "${OPENAI_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --kind "OpenAI" \
    --sku "S0" \
    --location "${REGION}" \
    --yes \
    --output none || print_warning "OpenAI resource might already exist"

# Deploy GPT model
print_status "Deploying GPT-3.5-turbo model..."
az cognitiveservices account deployment create \
    --name "${OPENAI_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --deployment-name "gpt-35-turbo" \
    --model-name "gpt-35-turbo" \
    --model-version "0301" \
    --model-format "OpenAI" \
    --sku-capacity 10 \
    --sku-name "Standard" \
    --output none 2>/dev/null || print_warning "Model deployment might already exist"

# Get OpenAI endpoint and key
print_status "Retrieving OpenAI credentials..."
OPENAI_ENDPOINT=$(az cognitiveservices account show \
    --name "${OPENAI_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --query "properties.endpoint" -o tsv)

OPENAI_KEY=$(az cognitiveservices account keys list \
    --name "${OPENAI_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --query "key1" -o tsv)

# Create Cosmos DB account
print_status "Creating Cosmos DB account..."
az cosmosdb create \
    --name "${COSMOS_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --kind "GlobalDocumentDB" \
    --locations regionName="${REGION}" \
    --default-consistency-level "Session" \
    --output none

# Create database and container
print_status "Creating Cosmos DB database..."
az cosmosdb sql database create \
    --account-name "${COSMOS_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --name "ChatHistory" \
    --output none

az cosmosdb sql container create \
    --account-name "${COSMOS_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --database-name "ChatHistory" \
    --name "Conversations" \
    --partition-key-path "/userId" \
    --throughput 400 \
    --output none

# Get Cosmos DB connection string
COSMOS_CONNECTION=$(az cosmosdb keys list \
    --name "${COSMOS_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --type connection-strings \
    --query "connectionStrings[0].connectionString" -o tsv)

# Create Storage Account
print_status "Creating Storage Account..."
az storage account create \
    --name "${STORAGE_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --location "${REGION}" \
    --sku "Standard_LRS" \
    --kind "StorageV2" \
    --output none

# Create App Service Plan
print_status "Creating App Service Plan..."
az appservice plan create \
    --name "plan-${APP_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --location "${REGION}" \
    --sku "B2" \
    --is-linux \
    --output none

# Create Web App
print_status "Creating Web App..."
az webapp create \
    --name "${APP_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --plan "plan-${APP_NAME}" \
    --runtime "PYTHON:3.9" \
    --output none

# Configure app settings
print_status "Configuring application settings..."
az webapp config appsettings set \
    --name "${APP_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --settings \
        "AZURE_OPENAI_ENDPOINT=${OPENAI_ENDPOINT}" \
        "AZURE_OPENAI_KEY=${OPENAI_KEY}" \
        "AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo" \
        "COSMOS_CONNECTION_STRING=${COSMOS_CONNECTION}" \
        "CLIENT_NAME=${CLIENT_NAME}" \
        "ENVIRONMENT=${ENVIRONMENT}" \
    --output none

# Create Application Insights
print_status "Creating Application Insights..."
az monitor app-insights component create \
    --app "${APP_NAME}-insights" \
    --location "${REGION}" \
    --resource-group "${RESOURCE_GROUP}" \
    --output none

# Get App Insights key
APP_INSIGHTS_KEY=$(az monitor app-insights component show \
    --app "${APP_NAME}-insights" \
    --resource-group "${RESOURCE_GROUP}" \
    --query "instrumentationKey" -o tsv)

# Update app settings with App Insights
az webapp config appsettings set \
    --name "${APP_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --settings "APPLICATIONINSIGHTS_INSTRUMENTATION_KEY=${APP_INSIGHTS_KEY}" \
    --output none

# Deploy application code
print_status "Deploying application code..."
if [ -f "src/app.zip" ]; then
    az webapp deployment source config-zip \
        --name "${APP_NAME}" \
        --resource-group "${RESOURCE_GROUP}" \
        --src "src/app.zip" \
        --output none
else
    print_warning "No app.zip found. Creating from source..."
    cd src
    zip -r ../app.zip . -x "*.pyc" "__pycache__/*" ".git/*"
    cd ..
    az webapp deployment source config-zip \
        --name "${APP_NAME}" \
        --resource-group "${RESOURCE_GROUP}" \
        --src "app.zip" \
        --output none
fi

# Get Web App URL
APP_URL=$(az webapp show \
    --name "${APP_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --query "defaultHostName" -o tsv)

# Create .env file for local development
print_status "Creating .env file for local development..."
cat > .env << EOF
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=${OPENAI_ENDPOINT}
AZURE_OPENAI_KEY=${OPENAI_KEY}
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo

# Cosmos DB Configuration
COSMOS_CONNECTION_STRING=${COSMOS_CONNECTION}

# Application Insights
APPLICATIONINSIGHTS_INSTRUMENTATION_KEY=${APP_INSIGHTS_KEY}

# Application Configuration
CLIENT_NAME=${CLIENT_NAME}
ENVIRONMENT=${ENVIRONMENT}
APP_URL=https://${APP_URL}
EOF

print_status "Deployment complete!"

echo "
╔════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT SUCCESSFUL!                    ║
╠══════════════════════════════════════════════════════════════╣
║  Your chat agent is now live at:                            ║
║  https://${APP_URL}                                         ║
║                                                              ║
║  Resource Group: ${RESOURCE_GROUP}                          ║
║  Azure Portal: https://portal.azure.com                     ║
║                                                              ║
║  Next Steps:                                                ║
║  1. Visit the URL above to test your agent                  ║
║  2. Add knowledge documents to data/knowledge/              ║
║  3. Customize config/agent_config.yaml                      ║
║  4. Monitor performance in Application Insights             ║
╚══════════════════════════════════════════════════════════════╝
"

# Save deployment info
cat > deployment-info.json << EOF
{
  "client": "${CLIENT_NAME}",
  "environment": "${ENVIRONMENT}",
  "resourceGroup": "${RESOURCE_GROUP}",
  "appUrl": "https://${APP_URL}",
  "openAiEndpoint": "${OPENAI_ENDPOINT}",
  "deploymentTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

print_status "Deployment information saved to deployment-info.json"