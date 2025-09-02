#!/bin/bash

# Walrus Deployment Script
# This script handles the deployment of encrypted data to Walrus storage

set -e

# Configuration
WALRUS_RPC_URL=${WALRUS_RPC_URL:-"https://walrus.testnet.rpc"}
WALRUS_NETWORK=${WALRUS_NETWORK:-"testnet"}
ENCRYPTION_KEY=${ENCRYPTION_KEY:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Walrus deployment...${NC}"

# Check required environment variables
if [ -z "$ENCRYPTION_KEY" ]; then
    echo -e "${RED}Error: ENCRYPTION_KEY environment variable is required${NC}"
    exit 1
fi

# Install Walrus CLI if not present
if ! command -v walrus &> /dev/null; then
    echo -e "${YELLOW}Installing Walrus CLI...${NC}"
    curl -s https://install.walrus.dev | sh
    export PATH="$PATH:$HOME/.local/bin"
fi

# Create deployment directory
DEPLOYMENT_DIR="packages/contracts/deployment/walrus"
mkdir -p "$DEPLOYMENT_DIR"

# Function to encrypt and upload file
encrypt_and_upload() {
    local file_path=$1
    local file_name=$(basename "$file_path")
    
    echo -e "${YELLOW}Encrypting $file_name...${NC}"
    
    # Encrypt file using AES-256-GCM
    openssl enc -aes-256-gcm -salt -pbkdf2 -k "$ENCRYPTION_KEY" -in "$file_path" -out "$file_path.enc"
    
    # Upload to Walrus
    echo -e "${YELLOW}Uploading $file_name to Walrus...${NC}"
    local walrus_output=$(walrus upload "$file_path.enc" --network "$WALRUS_NETWORK")
    local blob_id=$(echo "$walrus_output" | grep -o '"blob_id":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$blob_id" ]; then
        echo -e "${RED}Error: Failed to upload $file_name to Walrus${NC}"
        exit 1
    fi
    
    # Clean up encrypted file
    rm "$file_path.enc"
    
    echo "$blob_id"
}

# Deploy contract artifacts
echo -e "${YELLOW}Deploying contract artifacts to Walrus...${NC}"

# Upload contract build artifacts
for file in packages/contracts/build/*.bytecode; do
    if [ -f "$file" ]; then
        blob_id=$(encrypt_and_upload "$file")
        echo "Contract artifact uploaded with blob ID: $blob_id"
        echo "$blob_id" > "$DEPLOYMENT_DIR/$(basename "$file").blob_id"
    fi
done

# Upload contract ABIs
for file in packages/contracts/abis/*.json; do
    if [ -f "$file" ]; then
        blob_id=$(encrypt_and_upload "$file")
        echo "Contract ABI uploaded with blob ID: $blob_id"
        echo "$blob_id" > "$DEPLOYMENT_DIR/$(basename "$file").blob_id"
    fi
done

# Create deployment manifest
cat > "$DEPLOYMENT_DIR/manifest.json" << EOF
{
  "network": "$WALRUS_NETWORK",
  "rpc_url": "$WALRUS_RPC_URL",
  "deployment_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": [],
  "abis": []
}
EOF

# Add contract artifacts to manifest
for file in packages/contracts/build/*.bytecode; do
    if [ -f "$file" ]; then
        blob_id=$(cat "$DEPLOYMENT_DIR/$(basename "$file").blob_id")
        contract_name=$(basename "$file" .bytecode)
        jq --arg name "$contract_name" --arg blob_id "$blob_id" \
           '.contracts += [{"name": $name, "blob_id": $blob_id}]' \
           "$DEPLOYMENT_DIR/manifest.json" > "$DEPLOYMENT_DIR/manifest.tmp"
        mv "$DEPLOYMENT_DIR/manifest.tmp" "$DEPLOYMENT_DIR/manifest.json"
    fi
done

# Add ABIs to manifest
for file in packages/contracts/abis/*.json; do
    if [ -f "$file" ]; then
        blob_id=$(cat "$DEPLOYMENT_DIR/$(basename "$file").blob_id")
        abi_name=$(basename "$file" .json)
        jq --arg name "$abi_name" --arg blob_id "$blob_id" \
           '.abis += [{"name": $name, "blob_id": $blob_id}]' \
           "$DEPLOYMENT_DIR/manifest.json" > "$DEPLOYMENT_DIR/manifest.tmp"
        mv "$DEPLOYMENT_DIR/manifest.tmp" "$DEPLOYMENT_DIR/manifest.json"
    fi
done

echo -e "${GREEN}✅ Walrus deployment completed successfully!${NC}"
echo -e "${GREEN}Deployment manifest saved to: $DEPLOYMENT_DIR/manifest.json${NC}"

# Output summary
echo -e "${YELLOW}Deployment Summary:${NC}"
echo "Network: $WALRUS_NETWORK"
echo "RPC URL: $WALRUS_RPC_URL"
echo "Contracts deployed: $(jq '.contracts | length' "$DEPLOYMENT_DIR/manifest.json")"
echo "ABIs deployed: $(jq '.abis | length' "$DEPLOYMENT_DIR/manifest.json")"