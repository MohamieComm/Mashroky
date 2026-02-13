# Mashrok Deployment Script for Railway (PowerShell)
# This script helps deploy the application to Railway

Write-Host "================================" -ForegroundColor Yellow
Write-Host "Mashrok Deployment Script" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

$ErrorActionPreference = "Stop"

# Check if Railway CLI is installed
Write-Host "`nStep 1: Checking Railway CLI..." -ForegroundColor Blue
try {
    railway --version | Out-Null
    Write-Host "✓ Railway CLI ready" -ForegroundColor Green
} catch {
    Write-Host "Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    Write-Host "✓ Railway CLI installed" -ForegroundColor Green
}

# Step 2: Check Git status
Write-Host "`nStep 2: Checking Git status..." -ForegroundColor Blue
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "You have uncommitted changes. Commit them first." -ForegroundColor Yellow
    Write-Host "Run: git add . && git commit -m 'message'" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Git status clean" -ForegroundColor Green

# Step 3: Verify environment variables
Write-Host "`nStep 3: Verifying environment variables..." -ForegroundColor Blue
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Created .env file. Please update with your values." -ForegroundColor Yellow
    } else {
        Write-Host "Error: .env.example not found" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ .env file found" -ForegroundColor Green

# Step 4: Build locally
Write-Host "`nStep 4: Building frontend locally..." -ForegroundColor Blue
if (Test-Path "app") {
    Push-Location "app"
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    npm ci --silent
    Write-Host "Building application..." -ForegroundColor Gray
    npm run build
    Pop-Location
    Write-Host "✓ Frontend build successful" -ForegroundColor Green
}

# Step 5: Check Railway login
Write-Host "`nStep 5: Checking Railway authentication..." -ForegroundColor Blue
try {
    railway whoami | Out-Null
} catch {
    Write-Host "Not logged in. Opening login page..." -ForegroundColor Yellow
    railway login
}

# Step 6: Link/Create project
Write-Host "`nStep 6: Setting up Railway project..." -ForegroundColor Blue
try {
    $projectJson = railway project --json 2>$null | ConvertFrom-Json
    $projectId = $projectJson.id
} catch {
    $projectId = $null
}

if (-not $projectId) {
    Write-Host "No Railway project found. Initializing..." -ForegroundColor Yellow
    railway init
    try {
        $projectJson = railway project --json 2>$null | ConvertFrom-Json
        $projectId = $projectJson.id
    } catch {
        $projectId = "unknown"
    }
}

Write-Host "✓ Using Railway project: $projectId" -ForegroundColor Green

# Step 7: Set environment variables
Write-Host "`nStep 7: Setting environment variables..." -ForegroundColor Blue

# Read .env file
$envContent = Get-Content ".env" -Raw
$envVars = @{}
$envContent -split "`n" | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($key -and $value) {
            $envVars[$key] = $value
        }
    }
}

# Set variables in Railway
$requiredVars = @(
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_ADMIN_EMAILS',
    'AMADEUS_CLIENT_ID',
    'AMADEUS_CLIENT_SECRET',
    'SKYSCANNER_API_KEY',
    'DUFFEL_API_KEY'
)

foreach ($var in $requiredVars) {
    if ($envVars.ContainsKey($var)) {
        Write-Host "Setting $var..." -ForegroundColor Gray
        railway variables set "$var=$($envVars[$var])" 2>$null | Out-Null
    }
}

railway variables set "NODE_ENV=production" 2>$null | Out-Null
railway variables set "PORT=3000" 2>$null | Out-Null

Write-Host "✓ Environment variables configured" -ForegroundColor Green

# Step 8: Deploy
Write-Host "`nStep 8: Deploying to Railway..." -ForegroundColor Blue
Write-Host "Pushing changes to GitHub..." -ForegroundColor Gray
git push origin main

Write-Host "✓ Changes pushed. Railway will start deployment automatically." -ForegroundColor Green

# Step 9: Instructions
Write-Host "`n================================" -ForegroundColor Yellow
Write-Host "Domain Configuration Required!" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

Write-Host @"

To connect www.mashrok.online to Railway:

1. Open Railway Dashboard: https://railway.app/dashboard
2. Select your project
3. Go to Settings > Domains
4. Click "Add Custom Domain"
5. Enter: www.mashrok.online
6. Copy the CNAME value provided
7. Update your domain registrar:
   - Provider: GoDaddy, Namecheap, etc
   - Subdomain: www
   - Record Type: CNAME
   - Value: [Railway CNAME]
   - TTL: 3600

Helpful commands:
  railway logs -f          # View live logs
  railway open             # Open service in browser
  railway env              # View environment variables
  railway restart          # Restart service
  railway metrics          # View performance metrics

"@ -ForegroundColor Cyan

Write-Host "✓ Deployment setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Monitor deployment: railway logs -f" -ForegroundColor Gray
Write-Host "2. Configure domain CNAME" -ForegroundColor Gray
Write-Host "3. Wait 24h for DNS propagation" -ForegroundColor Gray
Write-Host "4. Test at https://www.mashrok.online" -ForegroundColor Gray
