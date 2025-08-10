# VeraChain Mobile App - 서버 배포 가이드

## 📱 앱 정보
- **앱 이름**: VeraChain
- **패키지 ID**: com.verachain.mobile
- **백엔드 API**: https://verachain-backend2.onrender.com

## 🚀 배포 옵션

### 1. Expo Go (개발/테스트용)
```bash
npx expo start --tunnel
```
- QR 코드를 스캔하여 Expo Go 앱에서 실행
- 빠른 테스트와 개발에 적합

### 2. Expo Application Services (EAS) - 권장
```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# APK 빌드 (Android)
eas build --platform android --profile preview

# iOS 빌드
eas build --platform ios --profile preview
```

### 3. 웹 배포 (PWA)
```bash
# 웹용 빌드
npx expo export:web

# 정적 호스팅 서비스에 배포
# - Vercel
# - Netlify  
# - GitHub Pages
```

### 4. 자체 서버 호스팅
```bash
# 프로덕션 빌드
npx expo export --platform all

# dist 폴더를 웹 서버에 업로드
# nginx/Apache 설정 필요
```

## 🔐 프로덕션 환경 변수

`.env.production` 파일 생성:
```env
API_URL=https://verachain-backend2.onrender.com
ENVIRONMENT=production
```

## 📦 APK 직접 빌드 (로컬)

### 사전 요구사항:
- Android Studio
- Java JDK 11+
- Android SDK

### 빌드 단계:
```bash
# 1. 네이티브 프로젝트 생성
npx expo prebuild --platform android

# 2. Android 폴더로 이동
cd android

# 3. APK 빌드
./gradlew assembleRelease

# 4. APK 위치
# android/app/build/outputs/apk/release/app-release.apk
```

## 🌐 서버 요구사항

### 최소 사양:
- Node.js 18+
- 2GB RAM
- 10GB 저장 공간

### 권장 호스팅:
1. **Vercel** - 웹 앱용
2. **Render** - 백엔드 API
3. **AWS S3 + CloudFront** - 정적 파일
4. **Google Play Console** - Android 앱 배포
5. **App Store Connect** - iOS 앱 배포

## 📊 모니터링

### 추천 도구:
- **Sentry** - 에러 추적
- **Google Analytics** - 사용자 분석
- **Expo Updates** - OTA 업데이트

## 🔑 테스트 계정

프로덕션 테스트용:
- Email: `veratest@verachain.com`
- Password: `Vera1234!`

## 📝 체크리스트

- [ ] 환경 변수 설정
- [ ] API 엔드포인트 확인
- [ ] CORS 설정 확인
- [ ] SSL 인증서 확인
- [ ] 앱 아이콘 및 스플래시 스크린
- [ ] 앱 권한 설정
- [ ] 프라이버시 정책 및 이용약관
- [ ] 앱 스토어 메타데이터

## 🛠 문제 해결

### API 연결 실패:
- CORS 설정 확인
- SSL 인증서 유효성
- 네트워크 타임아웃 설정

### 빌드 실패:
- Node modules 재설치: `rm -rf node_modules && npm install`
- 캐시 삭제: `npx expo start --clear`
- Metro 재시작: `npx react-native start --reset-cache`

## 📞 지원

문제 발생 시:
- GitHub Issues: [프로젝트 저장소]
- 백엔드 상태: https://verachain-backend2.onrender.com/health