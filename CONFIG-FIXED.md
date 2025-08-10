# VeraChain 고정 설정 (FIXED CONFIGURATION)

⚠️ **경고: 이 문서에 명시된 설정들은 검증된 고정 설정입니다. 변경 시 시스템 전체에 영향을 줄 수 있으므로 반드시 팀 승인을 받아야 합니다.**

## 🔒 고정된 설정들

### 1. 포트 설정 (FIXED PORTS)

| 환경 | 포트 | 상태 | 비고 |
|------|------|------|------|
| **Development** | `5000` | 🔒 **FIXED** | MongoDB Atlas 표준 포트 |
| **Production** | Render 배포 | 🔒 **FIXED** | https://verachain-backend2.onrender.com |
| Fastify Server | `5001` | 🔧 Optional | 별도 서버용 |

**변경 금지 파일:**
- `backend/.env` → `PORT=5000`
- `backend/server.js` → `process.env.PORT || 5000`
- `mobile/src/lib/api.ts` → `http://localhost:5000`
- `mobile/src/lib/core/config.ts` → development baseURL

### 2. 데이터베이스 설정 (DATABASE - FIXED)

```
MONGODB_URI=mongodb+srv://verachain:1674614ppappa@verachain-cluster.izpeptn.mongodb.net/?retryWrites=true&w=majority&appName=verachain-cluster
USE_MEMORY_DB=false
```

**상태:** 🔒 **MongoDB Atlas 운영 환경 - 변경 절대 금지**

### 3. API 엔드포인트 (API ENDPOINTS - FIXED)

#### Development (로컬 개발)
```
http://localhost:5000
```

#### Production (운영)
```
https://verachain-backend2.onrender.com
```

**검증 명령어:**
```bash
# 로컬 테스트
curl http://localhost:5000/api/health

# 운영 테스트  
curl https://verachain-backend2.onrender.com/api/health
```

### 4. 확정된 환경별 설정

#### 🟢 Development (개발환경)
- **Port:** `5000` 🔒
- **Database:** MongoDB Atlas 🔒
- **API Base:** `http://localhost:5000` 🔒

#### 🟡 Staging (스테이징)
- **Status:** TODO - 설정 필요
- **Planned URL:** `https://staging-api.verachain.com`

#### 🔴 Production (운영환경)  
- **URL:** `https://verachain-backend2.onrender.com` 🔒
- **Database:** MongoDB Atlas (동일 클러스터) 🔒
- **Status:** ✅ 운영 중

## 📋 변경 승인 프로세스

이 설정들을 변경해야 하는 경우:

1. **팀 논의** - 변경 사유와 영향도 분석
2. **문서 업데이트** - 이 파일과 README-ARCHITECTURE.md 동시 업데이트
3. **테스트 검증** - 모든 환경에서 연결 테스트
4. **배포 확인** - 프론트엔드/백엔드 동시 배포

## 🚨 응급 상황 대처

포트 충돌이나 연결 문제 발생 시:

```bash
# 현재 실행 중인 포트 확인
netstat -ano | findstr :5000

# 백엔드 헬스 체크
curl http://localhost:5000/api/health

# 프로세스 종료 (필요시)
taskkill /PID [PID_NUMBER] /F
```

## 📄 관련 파일들

### 🔒 변경 금지 파일들
- `backend/.env` (PORT, MONGODB_URI)
- `backend/server.js` (기본 포트)
- `mobile/src/lib/api.ts` (API_URL)
- `mobile/src/lib/core/config.ts` (development config)

### 🔧 조건부 변경 가능
- `backend/server.fastify.js` (포트 5001)
- `mobile/src/lib/blockchain.ts` (운영 URL만 변경 가능)

---

**마지막 업데이트:** 2025-08-10  
**다음 검토 예정:** 매월 첫째 주  
**담당자:** 개발팀 전체