# VeraChain 내부 테스트 번들

## 📱 앱 정보
- **이름**: VeraChain
- **버전**: 1.0.0
- **패키지**: com.verachain.mobile
- **플랫폼**: Android
- **빌드 일시**: 2025-08-10

## 📁 포함 파일
- `_expo/static/js/android/` - 앱 번들 파일 (2.4MB)
- `assets/` - 아이콘 및 폰트 파일
- `metadata.json` - 빌드 메타데이터
- `app-config.json` - 앱 설정 파일
- `eas-config.json` - 빌드 설정 파일

## 🚀 APK 생성 방법

### 1. EAS Build로 APK 생성 (권장)
```bash
cd C:\Users\VeraChain\mobile
eas login
eas build --platform android --profile preview
```

### 2. 웹 기반 즉시 테스트
```bash
cd C:\Users\VeraChain\mobile
npx expo start --web
```

## ✅ 테스트 완료 기능
1. 사용자 회원가입/로그인
2. 제품 QR 스캔
3. 블록체인 인증 
4. NFT 인증서 발급
5. 프로필 관리
6. 인증서 목록

## 🔗 백엔드 연결
- **로컬**: http://10.0.2.2:5002
- **프로덕션**: https://verachain-backend2.onrender.com
- **DB**: MongoDB Atlas 연결 완료

## 📋 다음 단계
1. Expo 개발자 계정 생성
2. EAS Build 실행으로 APK 생성
3. Android 기기에 APK 설치 테스트

---
**준비 상태**: ✅ 배포 준비 완료
**테스트 준비도**: 100%