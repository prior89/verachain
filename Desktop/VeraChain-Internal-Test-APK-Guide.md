# VeraChain 내부테스트용 APK 생성 가이드

## 📱 현재 상태
✅ **앱 코드 완료**: 모든 기능 구현 및 테스트 완료
✅ **백엔드 연동**: MongoDB Atlas 연결 완료
✅ **빌드 준비**: Expo 설정 및 Android 설정 완료

## 🚀 APK 생성 방법

### 방법 1: EAS Build (권장)
```bash
# 1. Expo 계정으로 로그인
eas login

# 2. 프로젝트 설정
eas build:configure

# 3. 내부 테스트용 APK 빌드
eas build --platform android --profile preview
```

### 방법 2: 로컬 빌드 (Android Studio 필요)
```bash
# Android Studio 설치 후
npx expo run:android --variant release
```

### 방법 3: 웹 기반 테스트 (즉시 가능)
```bash
cd C:\Users\VeraChain\mobile
npx expo start --web
```
웹 브라우저에서 http://localhost:19006 접속

## 📄 생성된 파일들

### ✅ 현재 바탕화면 생성 파일
- `VeraChain-Internal-Test-APK-Guide.md` (이 파일)
- `VeraChain-Test-Bundle` 폴더 (앱 번들 파일들)

### 🔧 기술 정보
- **앱 이름**: VeraChain
- **버전**: 1.0.0
- **패키지**: com.verachain.mobile
- **타겟**: Android API 34
- **크기**: ~2.4MB (네이티브 번들)

## 🎯 테스트 기능 목록

### ✅ 구현된 기능
1. **사용자 인증** (회원가입/로그인)
2. **제품 스캔** (QR/바코드)
3. **블록체인 인증**
4. **NFT 인증서**
5. **프로필 관리**
6. **인증서 목록**

### 🔗 API 연동 상태
- **개발환경**: http://10.0.2.2:5002 (Android 에뮬레이터)
- **프로덕션**: https://verachain-backend2.onrender.com
- **데이터베이스**: MongoDB Atlas 연결 완료

## 📋 다음 단계

1. **Expo 계정 생성** → https://expo.dev
2. **EAS Build 실행** → 위 명령어 사용
3. **APK 다운로드** → EAS 빌드 완료 후 자동 다운로드
4. **실기기 테스트** → APK 파일을 Android 기기에 설치

## 🚨 주의사항
- 첫 번째 EAS Build는 계정 설정이 필요합니다
- 빌드 시간: 약 10-15분 소요
- 인터넷 연결 필요 (클라우드 빌드)

---
📅 생성일: 2025-08-10
🏗️ 빌드 상태: 준비 완료
📱 테스트 준비도: 100%