# MongoDB Community Edition 설치 스크립트
Write-Host "MongoDB Community Edition 설치를 시작합니다..." -ForegroundColor Green

# MongoDB 다운로드 URL (Windows x64)
$mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.14-signed.msi"
$installerPath = "$env:TEMP\mongodb-installer.msi"

# MongoDB 설치 경로
$mongoPath = "C:\Program Files\MongoDB\Server\7.0"
$dataPath = "C:\data\db"

# 1. MongoDB 다운로드
Write-Host "MongoDB 다운로드 중..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $mongoUrl -OutFile $installerPath
    Write-Host "다운로드 완료!" -ForegroundColor Green
} catch {
    Write-Host "다운로드 실패: $_" -ForegroundColor Red
    exit 1
}

# 2. MongoDB 설치
Write-Host "MongoDB 설치 중..." -ForegroundColor Yellow
try {
    Start-Process msiexec.exe -ArgumentList "/i", $installerPath, "/quiet", "/norestart" -Wait
    Write-Host "설치 완료!" -ForegroundColor Green
} catch {
    Write-Host "설치 실패: $_" -ForegroundColor Red
    exit 1
}

# 3. 데이터 디렉토리 생성
Write-Host "데이터 디렉토리 생성 중..." -ForegroundColor Yellow
if (!(Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
    Write-Host "데이터 디렉토리 생성 완료!" -ForegroundColor Green
}

# 4. 환경 변수 설정
Write-Host "환경 변수 설정 중..." -ForegroundColor Yellow
$binPath = "$mongoPath\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$binPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$binPath", "Machine")
    Write-Host "환경 변수 설정 완료!" -ForegroundColor Green
}

# 5. MongoDB 서비스로 설치
Write-Host "MongoDB 서비스 설치 중..." -ForegroundColor Yellow
try {
    & "$binPath\mongod.exe" --install --dbpath $dataPath --logpath "$dataPath\mongod.log"
    Write-Host "서비스 설치 완료!" -ForegroundColor Green
} catch {
    Write-Host "서비스 설치 실패 (이미 설치되어 있을 수 있음)" -ForegroundColor Yellow
}

# 6. MongoDB 서비스 시작
Write-Host "MongoDB 서비스 시작 중..." -ForegroundColor Yellow
Start-Service MongoDB
Write-Host "MongoDB 서비스 시작 완료!" -ForegroundColor Green

Write-Host "`nMongoDB 설치가 완료되었습니다!" -ForegroundColor Green
Write-Host "MongoDB는 포트 27017에서 실행 중입니다." -ForegroundColor Cyan