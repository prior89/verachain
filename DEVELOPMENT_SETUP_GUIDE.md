# 🚀 VeraChain 개발 환경 완전 독립 설정 가이드
## Complete Independent Development Setup Guide

이 가이드를 따라하면 **어떤 컴퓨터에서든** VeraChain을 즉시 개발할 수 있습니다!
Follow this guide to develop VeraChain instantly on **any computer**!

---

## 📋 사전 요구사항 (Prerequisites)

### 1. Node.js 설치 확인
```bash
# Node.js 버전 확인 (Check Node.js version)
node --version   # v18.0.0 이상 필요 (v18.0.0+ required)
npm --version    # 8.0.0 이상 권장 (8.0.0+ recommended)
```

**Node.js가 없다면:**
- 공식 사이트: https://nodejs.org
- LTS 버전 설치 추천

### 2. Git 설치 확인
```bash
git --version
```

---

## 🎯 완전 독립 실행 가이드 (Complete Independent Setup)

### Step 1: 저장소 클론 (Clone Repository)
```bash
git clone https://github.com/prior89/verachain.git
cd verachain
```

### Step 2: 백엔드 실행 (Backend Setup)
```bash
cd backend
npm install        # 의존성 설치 (Install dependencies)
npm start         # 서버 시작 (Start server)
```
✅ **즉시 실행됨!** 메모리 DB로 동작하므로 MongoDB 불필요
✅ **Runs immediately!** Works with memory DB, MongoDB not required

**백엔드 접속 확인:** http://localhost:5000/api/health

### Step 3: 프론트엔드 실행 (Frontend Setup)
```bash
# 새 터미널 열기 (Open new terminal)
cd frontend
npm install        # 의존성 설치 (Install dependencies) 
npm start         # 개발 서버 시작 (Start dev server)
```
✅ **자동으로 브라우저가 열리며 실행됨!**
✅ **Automatically opens browser and runs!**

**프론트엔드 접속:** http://localhost:3000

---

## 🔧 환경 설정 파일 설명 (Environment Configuration)

### 백엔드 (.env 파일이 이미 포함됨)
- `JWT_SECRET`: JWT 토큰 암호화 키
- `USE_MEMORY_DB=true`: 메모리 DB 사용 (MongoDB 불필요)
- `PORT=5000`: 백엔드 서버 포트

### 프론트엔드 (.env 파일이 이미 포함됨)
- `REACT_APP_API_URL`: 로컬 백엔드 연결 URL
- `CI=false`: 빌드 경고 비활성화

---

## 📱 모바일 앱 개발 (Mobile Development)

### React Native 환경 설정
```bash
cd mobile
npm install

# Android 개발 (Android Development)
npx react-native run-android

# iOS 개발 (iOS Development - Mac만 가능)
npx react-native run-ios
```

---

## ✅ 즉시 테스트 방법 (Instant Testing)

### 1. 백엔드 API 테스트
```bash
# 헬스체크 (Health check)
curl http://localhost:5000/api/health

# 테스트 API
curl http://localhost:5000/api/test
```

### 2. 디버깅 도구 사용
프로젝트 루트의 `FRONTEND_DEBUG_TOOL.html` 파일을 브라우저에서 열어 실시간 테스트 가능

### 3. 회원가입/로그인 테스트
1. http://localhost:3000 접속
2. "회원가입" 클릭
3. 양식 작성 후 가입
4. 자동으로 대시보드 이동 확인

---

## 🔄 프로덕션 빌드 (Production Build)

### 프론트엔드 빌드
```bash
cd frontend
npm run build     # 빌드 생성
```

### 백엔드 프로덕션 모드
```bash
cd backend
NODE_ENV=production npm start
```

---

## 🛠️ 개발 도구 및 스크립트 (Development Tools)

### 백엔드 개발 스크립트
```bash
npm run dev       # nodemon으로 자동 재시작
npm run seed      # 샘플 데이터 생성
npm run test      # 테스트 실행
npm run lint      # 코드 검사
```

### 프론트엔드 개발 스크립트  
```bash
npm start         # 개발 서버
npm run build     # 프로덕션 빌드
npm test          # 테스트 실행
npm run lint      # 코드 검사
```

---

## 📂 프로젝트 구조 이해 (Project Structure)

```
VeraChain/
├── backend/           # Node.js API 서버
│   ├── src/          # 소스 코드
│   ├── .env          # ✅ 환경설정 (포함됨)
│   └── package.json  # 의존성 설정
├── frontend/         # React 웹 앱
│   ├── src/          # React 컴포넌트
│   ├── .env          # ✅ 환경설정 (포함됨)
│   └── package.json  # 의존성 설정
├── mobile/           # React Native 앱
│   └── ...           # 모바일 앱 코드
└── 디버깅 도구들.html  # 개발 및 테스트 도구
```

---

## 🚨 문제 해결 (Troubleshooting)

### 포트 충돌 해결
```bash
# 포트 5000이 사용 중인 경우
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows

# 다른 포트 사용
PORT=5001 npm start  # 백엔드
```

### 캐시 문제 해결
```bash
# npm 캐시 정리
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 권한 문제 (Windows)
- PowerShell을 관리자 권한으로 실행
- 또는 Git Bash 사용

---

## 🎉 성공 확인 체크리스트

- [ ] `git clone` 완료
- [ ] 백엔드 `npm install && npm start` 실행
- [ ] http://localhost:5000/api/health 접속 확인  
- [ ] 프론트엔드 `npm install && npm start` 실행
- [ ] http://localhost:3000 접속 확인
- [ ] 회원가입/로그인 테스트 완료
- [ ] 대시보드 정상 접근 확인

---

## 📞 추가 지원 (Additional Support)

### 개발 도구
- **디버깅**: `FRONTEND_DEBUG_TOOL.html`
- **API 테스트**: `INTERACTIVE_TESTING_INTERFACE.html`  
- **기능 테스트**: `USER_TESTING_PLAN.html`

### 문서
- **수정사항**: `URGENT_FIXES_APPLIED.md`
- **테스트 결과**: `TESTING_RESULTS_DOCUMENTATION.md`

---

## 🎯 핵심 요약

**✅ 이제 완전히 독립적입니다!**
1. `git clone` → 2. `npm install` → 3. `npm start` 
2. **MongoDB, 외부 DB, 복잡한 설정 모두 불필요**
3. **메모리 DB로 즉시 개발 가능**
4. **모든 환경설정 파일이 저장소에 포함됨**

**어디서든 5분 안에 개발환경 구축 완료!** 🚀