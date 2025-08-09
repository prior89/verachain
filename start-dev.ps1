# VeraChain Development Server Startup Script
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "   VERACHAIN DEVELOPMENT SERVER  " -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Cyan

# Check if MongoDB is running
Write-Host "Checking MongoDB status..." -ForegroundColor Gray
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq "Running") {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠ MongoDB is not running. Please start MongoDB first." -ForegroundColor Yellow
    Write-Host "  Run: net start MongoDB" -ForegroundColor Gray
}

# Check if .env files exist
Write-Host "`nChecking environment files..." -ForegroundColor Gray
if (Test-Path ".\backend\.env") {
    Write-Host "✓ Backend .env found" -ForegroundColor Green
} else {
    Write-Host "⚠ Backend .env not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".\backend\.env.example" ".\backend\.env"
}

if (Test-Path ".\frontend\.env") {
    Write-Host "✓ Frontend .env found" -ForegroundColor Green
} else {
    Write-Host "⚠ Frontend .env not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".\frontend\.env.example" ".\frontend\.env"
}

# Install dependencies if needed
Write-Host "`nChecking dependencies..." -ForegroundColor Gray
if (-not (Test-Path ".\backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location ".\backend"
    npm install
    Set-Location ".."
}

if (-not (Test-Path ".\frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location ".\frontend"
    npm install
    Set-Location ".."
}

# Start servers
Write-Host "`n🚀 Starting VeraChain servers..." -ForegroundColor Cyan

# Backend server
Write-Host "Starting Backend server..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\backend; Write-Host 'BACKEND SERVER' -ForegroundColor Cyan; npm run dev"

# Wait a moment before starting frontend
Start-Sleep -Seconds 2

# Frontend server
Write-Host "Starting Frontend server..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\frontend; Write-Host 'FRONTEND SERVER' -ForegroundColor Cyan; npm start"

# Display status
Write-Host "`n================================" -ForegroundColor Green
Write-Host "✅ SERVERS RUNNING" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend API:  " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:5000" -ForegroundColor Yellow
Write-Host "  Frontend App: " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "  API Docs:     " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:5000/api" -ForegroundColor Gray
Write-Host "  Health Check: " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:5000/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Gray
Write-Host "================================`n" -ForegroundColor Green
