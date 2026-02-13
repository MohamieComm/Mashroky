#!/bin/bash

# Mashrok Deployment Script for Railway
# This script helps deploy the application to Railway

set -e

echo "================================"
echo "Mashrok Deployment Script"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Step 1: Check Git status
echo -e "\n${BLUE}Step 1: Checking Git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}You have uncommitted changes. Commit them first.${NC}"
    echo "Run: git add . && git commit -m 'message'"
    exit 1
fi
echo -e "${GREEN}✓ Git status clean${NC}"

# Step 2: Verify environment variables
echo -e "\n${BLUE}Step 2: Verifying environment variables...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Copy from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please update .env with your values${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env file found${NC}"

# Step 3: Build locally to verify
echo -e "\n${BLUE}Step 3: Building locally to verify...${NC}"
if [ -d "app" ]; then
    cd app
    echo "Building frontend..."
    npm ci --silent
    npm run build
    cd ..
    echo -e "${GREEN}✓ Frontend build successful${NC}"
fi

# Step 4: Login to Railway
echo -e "\n${BLUE}Step 4: Checking Railway login...${NC}"
railway whoami || railway login

# Step 5: Link/Create project
echo -e "\n${BLUE}Step 5: Setting up Railway project...${NC}"
PROJECT_ID=$(railway project --json | jq -r '.id // empty')

if [ -z "$PROJECT_ID" ]; then
    echo "No Railway project linked. Creating/selecting..."
    railway init
    PROJECT_ID=$(railway project --json | jq -r '.id')
fi

echo -e "${GREEN}✓ Using Railway project: $PROJECT_ID${NC}"

# Step 6: Set environment variables
echo -e "\n${BLUE}Step 6: Setting environment variables in Railway...${NC}"

source .env

# Essential variables
railway variables set VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-}" || true
railway variables set VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY:-}" || true
railway variables set VITE_ADMIN_EMAILS="${VITE_ADMIN_EMAILS:-}" || true
railway variables set AMADEUS_CLIENT_ID="${AMADEUS_CLIENT_ID:-}" || true
railway variables set AMADEUS_CLIENT_SECRET="${AMADEUS_CLIENT_SECRET:-}" || true
railway variables set SKYSCANNER_API_KEY="${SKYSCANNER_API_KEY:-}" || true
railway variables set DUFFEL_API_KEY="${DUFFEL_API_KEY:-}" || true
railway variables set NODE_ENV="production" || true
railway variables set PORT="3000" || true

echo -e "${GREEN}✓ Environment variables set${NC}"

# Step 7: Deploy
echo -e "\n${BLUE}Step 7: Deploying to Railway...${NC}"
echo "Pushing changes to trigger deployment..."
git push origin main

echo -e "${GREEN}✓ Changes pushed${NC}"
echo -e "${BLUE}Waiting for Railway build...${NC}"

railway up

# Step 8: Get service URL
echo -e "\n${BLUE}Step 8: Getting service URL...${NC}"
SERVICE_URL=$(railway service --json | jq -r '.domains[0] // .url' 2>/dev/null || echo "")

if [ -n "$SERVICE_URL" ]; then
    echo -e "${GREEN}✓ Service URL: $SERVICE_URL${NC}"
else
    echo "Use 'railway open' to open your service"
fi

# Step 9: Domain setup instructions
echo -e "\n${YELLOW}================================${NC}"
echo -e "${YELLOW}Domain Configuration Required!${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""
echo "To connect www.mashrok.online:"
echo "1. Go to https://railway.app/project/[YOUR_PROJECT_ID]/settings"
echo "2. Click 'Domains'"
echo "3. Add custom domain: www.mashrok.online"
echo "4. Get the CNAME value from Railway"
echo "5. Update DNS records at your domain registrar"
echo ""
echo "DNS Update:"
echo "Subdomain: www"
echo "Type: CNAME"
echo "Value: [RAILWAY_CNAME]"
echo "TTL: 3600"
echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo -e "Monitor logs with: ${BLUE}railway logs -f${NC}"
echo -e "Open dashboard with: ${BLUE}railway open${NC}"
