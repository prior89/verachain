Write-Host "Starting VeraChain Local Development..." -ForegroundColor Green

# Backend 시작
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# 3초 대기
Start-Sleep -Seconds 3

# Frontend 시작
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "Backend: http://localhost:5001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Opening browser..." -ForegroundColor Green

# 브라우저 열기
Start-Sleep -Seconds 5
Start-Process "http://localhost:3001"
