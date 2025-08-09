# VeraChain Mobile App

React Native 기반 진품 인증 플랫폼 모바일 앱

## 🚀 주요 기능

- **진품 인증**: QR 코드 및 이미지 스캔을 통한 제품 진위 확인
- **NFT 발행**: 인증된 제품의 NFT 인증서 발행
- **블록체인 연동**: Polygon 네트워크 기반 투명한 거래 기록
- **생체 인증**: 지문/Face ID를 통한 안전한 로그인
- **실시간 알림**: 인증 상태 및 거래 알림

## 📱 테스트 환경 설정

### 필수 요구사항

- Node.js 18.x 이상
- React Native CLI
- Android Studio (Android 개발)
- Xcode (iOS 개발, Mac 필요)
- Metro Bundler

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/prior89/verachain-mobile.git
cd verachain-mobile
```

2. **의존성 설치**
```bash
npm install
```

3. **iOS 설정 (Mac only)**
```bash
cd ios && pod install
cd ..
```

### 실행 방법

#### Android
```bash
# 에뮬레이터 실행 후
npx react-native run-android

# 또는 Metro 먼저 실행
npx react-native start
# 새 터미널에서
npx react-native run-android
```

#### iOS (Mac only)
```bash
npx react-native run-ios

# 또는 특정 시뮬레이터 지정
npx react-native run-ios --simulator="iPhone 14"
```

### 백엔드 연결 설정

1. **로컬 백엔드 서버 실행**
   - 백엔드 저장소: https://github.com/prior89/verachain
   - 포트: 5001

2. **API 엔드포인트 설정**
   - 파일: `src/services/api.ts`
   - 개발 환경: `http://localhost:5001/api`
   - Android 에뮬레이터: `http://10.0.2.2:5001/api`

### 테스트 계정

```
이메일: test1@test.com
비밀번호: password

이메일: test2@test.com
비밀번호: password

이메일: admin@test.com
비밀번호: password
```

## 🛠️ 주요 기술 스택

- **Frontend**: React Native, TypeScript
- **State Management**: React Context API
- **Navigation**: React Navigation v6
- **UI Components**: Custom Components
- **Authentication**: JWT + AsyncStorage
- **Network**: Axios
- **Image Processing**: React Native Image Picker
- **Biometrics**: React Native Touch ID

## 📂 프로젝트 구조

```
mobile/
├── android/           # Android 네이티브 코드
├── ios/              # iOS 네이티브 코드
├── src/
│   ├── components/   # 재사용 가능한 컴포넌트
│   ├── screens/      # 화면 컴포넌트
│   ├── services/     # API 및 서비스 로직
│   ├── context/      # Context API providers
│   ├── navigation/   # 네비게이션 설정
│   ├── utils/        # 유틸리티 함수
│   └── types/        # TypeScript 타입 정의
├── App.tsx           # 앱 진입점
└── package.json      # 프로젝트 설정

```

## 🔧 환경 변수 설정

`.env` 파일 생성:
```
API_URL=http://localhost:5001/api
POLYGON_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
```

## 🐛 문제 해결

### Android 빌드 오류
```bash
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

### iOS 빌드 오류
```bash
cd ios && pod deintegrate
pod install
cd .. && npx react-native run-ios
```

### Metro 번들러 캐시 초기화
```bash
npx react-native start --reset-cache
```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항은 Issues 탭을 이용해주세요.

---

Made with ❤️ by VeraChain Team