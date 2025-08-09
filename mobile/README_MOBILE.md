# VeraChain Mobile

VeraChain의 공식 React Native 모바일 애플리케이션입니다. 블록체인 기술과 AI를 활용하여 명품의 진위를 검증하는 서비스를 제공합니다.

## 주요 기능

- 🔍 **제품 스캔**: AI 기반 제품 진품 인증
- 📋 **인증서 관리**: NFT 형태의 디지털 인증서 관리
- 🔗 **블록체인 연동**: Polygon 네트워크를 통한 투명한 거래
- 🔐 **프라이버시 보호**: 개인정보 보호 중심 설계
- 📱 **모바일 최적화**: React Native로 구현된 네이티브 앱 성능

## 기술 스택

- **Frontend**: React Native, TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **Camera**: React Native Vision Camera
- **Storage**: AsyncStorage
- **UI/UX**: Native Components, Animated API

## 설치 및 실행

### 요구사항

- Node.js 16+
- React Native CLI
- Android Studio (Android 개발용)
- Xcode (iOS 개발용)

### 설치

```bash
# 프로젝트 클론
git clone https://github.com/prior89/verachain.git
cd VeraChainMobile

# 의존성 설치
npm install

# iOS 의존성 설치 (iOS만 해당)
cd ios && pod install && cd ..
```

### 실행

#### Android
```bash
# Android 에뮬레이터 또는 기기 연결 후
npx react-native run-android
```

#### iOS
```bash
# iOS 시뮬레이터 또는 기기 연결 후
npx react-native run-ios
```

### 개발 모드
```bash
# Metro 번들러 시작
npx react-native start

# 디버그 메뉴 열기
# Android: Ctrl + M
# iOS: Cmd + D
```

## 프로젝트 구조

```
src/
├── App.tsx                 # 메인 앱 컴포넌트
├── components/             # 재사용 가능한 컴포넌트
├── context/               # React Context 상태 관리
│   └── AuthContext.tsx    # 인증 상태 관리
├── navigation/            # 네비게이션 설정
│   └── AppNavigator.tsx   # 메인 네비게이터
├── screens/               # 화면 컴포넌트들
│   ├── HomeScreen.tsx     # 홈 화면
│   ├── LoginScreen.tsx    # 로그인 화면
│   ├── RegisterScreen.tsx # 회원가입 화면
│   ├── ScanScreen.tsx     # 스캔 화면
│   ├── CertificatesScreen.tsx # 인증서 목록
│   └── ProfileScreen.tsx  # 프로필 화면
├── services/              # API 서비스들
│   ├── api.ts            # 기본 API 설정
│   ├── authService.ts    # 인증 서비스
│   └── certificateService.ts # 인증서 서비스
├── types/                # TypeScript 타입 정의
└── utils/                # 유틸리티 함수들
```

## 주요 화면

### 1. 로그인/회원가입
- 이메일/비밀번호 기반 인증
- 테스트 계정: `test@verachain.com` / `password`

### 2. 홈 화면
- 광고 슬라이더
- 주요 기능 바로가기
- 통계 정보

### 3. 스캔 화면
- 카메라 기반 제품 스캔
- AI 분석 진행도 표시
- 실시간 스캔 피드백

### 4. 인증서 관리
- NFT 인증서 목록 조회
- 검색 및 필터링
- QR 코드 생성

### 5. 프로필
- 사용자 정보 관리
- 앱 설정
- 통계 조회

## 개발 가이드

### 테스트 계정
```
이메일: test@verachain.com
비밀번호: password
```

### API 연동
현재는 목업 데이터를 사용하고 있습니다. 실제 백엔드와 연동하려면:

1. `src/services/api.ts`의 `API_BASE_URL` 수정
2. `src/context/AuthContext.tsx`의 목업 로직을 실제 API 호출로 교체
3. `src/services/` 폴더의 서비스 파일들 업데이트

### 카메라 권한
Android에서 카메라 사용을 위해 다음 권한이 필요합니다:
- `android.permission.CAMERA`
- `android.permission.RECORD_AUDIO`

### 빌드 설정

#### Android 릴리즈 빌드
```bash
cd android
./gradlew assembleRelease
```

#### iOS 릴리즈 빌드
```bash
# Xcode에서 Archive 빌드
```

## 배포

### Android Play Store
1. `android/app/build.gradle`에서 버전 코드/이름 업데이트
2. 서명된 APK/AAB 생성
3. Play Console에 업로드

### iOS App Store
1. `ios/VeraChainMobile/Info.plist`에서 버전 정보 업데이트
2. Xcode에서 Archive 생성
3. App Store Connect에 업로드

## 기여하기

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 지원

문의사항이나 버그 리포트는 [GitHub Issues](https://github.com/prior89/verachain/issues)를 통해 제출해주세요.

---

**VeraChain** - 블록체인으로 보장하는 명품의 진위