# VeraChain - 블록체인 기반 정품 인증 플랫폼

VeraChain은 AI와 블록체인 기술을 결합하여 제품의 진위를 확인하고 위조품을 방지하는 혁신적인 솔루션입니다. 스마트 스캔을 통해 제품을 인증하고 NFT 기반의 디지털 인증서를 발급합니다.

## 📁 프로젝트 구조

```
VeraChain/
├── mobile/                               # React Native 모바일 앱
│   ├── src/
│   ├── android/
│   ├── ios/
│   └── package.json
├── backend/                             # Node.js API 서버
│   ├── src/
│   └── package.json
├── contracts/                           # Solidity 스마트 컨트랙트
│   └── VeraChainNFT.sol
└── smart-contracts/                     # 추가 컨트랙트
    ├── contracts/
    ├── migrations/
    └── scripts/
```

## 🚀 주요 기능

- ✅ **AI 기반 스캔**: TensorFlow.js를 사용한 제품 인증 기능
- ✅ **블록체인 인증**: 불변의 인증 기록 보관
- ✅ **NFT 디지털 인증서**: Polygon Amoy 테스트넷 기반 NFT 인증서
- ✅ **모바일 앱**: 직관적이고 현대적인 모바일 UI
- ✅ **인증서 관리**: NFT 인증서 조회 및 관리 기능
- ✅ **보안 강화**: 다층 보안을 통한 위조 방지

## 🛠 기술 스택

### Mobile App
- React Native 0.74.5
- TypeScript
- Expo SDK 51
- React Navigation 6
- Modern V2 UI Design

### Backend
- Node.js + Express
- MongoDB (데이터베이스)
- JWT (인증)
- TensorFlow.js (AI 분석)

### Blockchain
- Solidity (스마트 컨트랙트)
- Polygon Amoy 테스트넷
- Ethers.js (블록체인 연동)
- IPFS (분산 저장)

## 📱 빠른 시작 가이드

### 1. 저장소 복제
```bash
git clone https://github.com/prior89/verachain.git
cd verachain
```

### 2. 모바일 앱 실행
```bash
cd mobile
npm install
npx expo start

# 웹에서 실행
npx expo start --web

# Android
npx expo run:android

# iOS (Mac만 가능)
npx expo run:ios
```

### 3. 백엔드 서버 실행
```bash
cd backend
npm install
npm start
# http://localhost:5000에서 실행
```

## 🌟 새로운 V2 UI 특징

### Modern Design System
- **현대적 색상 팔레트**: Indigo 기반 일관된 색상 시스템
- **그라데이션 효과**: 깊이감 있는 시각적 디자인
- **타이포그래피**: 체계적인 텍스트 스타일 시스템
- **카드 기반 레이아웃**: 직관적인 정보 구조

### 개선된 사용자 경험
- **한 화면 최적화**: 스크롤 없이 핵심 기능 접근
- **빠른 메뉴**: 그리드 레이아웃의 직관적 네비게이션
- **실시간 통계**: 사용자 활동 대시보드
- **반응형 디자인**: 다양한 화면 크기 대응

## 🔧 환경 설정

프로젝트를 실행하기 전에 환경 변수 파일들을 설정해야 합니다:

### Backend (.env)
```
NODE_ENV=development
PORT=5000
USE_MEMORY_DB=true
JWT_SECRET=your_jwt_secret_key
```

## 🧪 테스트

### 모바일 앱 테스트
```bash
cd mobile
npm test
```

### 백엔드 테스트
```bash
cd backend
npm test
```

## 🚀 배포

### 모바일 앱 (Web)
- **Vercel**: 자동 배포 설정
- **GitHub Pages**: GitHub Actions를 통한 자동 배포
- **로컬 빌드**: `cd mobile && npx expo export --platform web`

### 백엔드 (클라우드 배포)
```bash
cd backend
npm run build
# PM2, Docker 등을 이용한 배포
```

## 🔐 보안 및 개인정보보호

- **암호화 통신**: 모든 데이터 전송 시 암호화
- **JWT 인증**: 안전한 사용자 인증 및 세션 관리
- **HTTPS**: 모든 통신 암호화
- **입력 검증**: XSS, SQL Injection 방지
- **CORS 설정**: 안전한 도메인 간 요청 제한

## 🤝 기여 가이드

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 📞 지원 및 문의

- **GitHub Issues**: [버그 신고 및 기능 요청](https://github.com/prior89/verachain/issues)
- **이메일**: support@verachain.com
- **문서**: [개발 문서](./docs/)

## 🎯 로드맵

- [ ] iOS 앱 출시
- [ ] 다중 언어 지원 (영어, 중국어)
- [ ] 더 많은 블록체인 지원
- [ ] AR/VR 인증 기능 추가
- [ ] 기업 대시보드 연동
- [ ] NFT 마켓플레이스

---

**VeraChain** - 블록체인으로 만드는 신뢰할 수 있는 제품 인증의 미래
mongodb+srv://verachain:<db_password1674614ppa!>@verachain-cluster.izpeptn.mongodb.net/?retryWrites=true&w=majority&appName=verachain-cluster
연결 문제 해결


이 페이지에서는 일반적인 연결 문제와 가능한 해결 방법을 간략하게 설명합니다.

Atlas 클러스터에 연결하는 방법에 대해 자세히 알아보려면 Atlas로 시작하기 튜토리얼을 참조하세요.

참고
지원을 원하는 기업 고객인 경우 신청서를 제출하세요. 커뮤니티 지원은 MongoDB Community 리소스를 참조하세요.

참고
현재 서버리스 인스턴스는 특정 드라이버 또는 드라이버 버전을 통한 연결을 지원하지 않습니다. 자세한 내용은 서버리스 인스턴스 제한 사항을 참조하세요.

클러스터 Connect 버튼이 비활성화되었습니다
클러스터가 프로비저닝 상태인 경우 클러스터의 Connect 버튼이 비활성화될 수 있습니다. 클러스터는 처음 배포될 때 프로비저닝해야 합니다. 클러스터를 확장 또는 축소할 때도 프로비저닝해야 합니다. 프로비저닝 프로세스에는 최대 10분이 걸릴 수 있습니다. 프로세스가 완료된 후에는 Connect 버튼이 활성화됩니다.

IP 액세스 목록에 없는 IP 주소 연결
Atlas 클러스터에 연결하기 전에 호스트의 IP 주소를 클러스터 프로젝트의 IP 액세스 목록에 추가했는지 확인하세요. Atlas는 IP 액세스 목록에 있는 IP 주소 및 CIDR 주소 범위의 클라이언트 연결만 허용합니다.

클러스터에 대한 인증에 실패했습니다.
Atlas에 연결하려면 MongoDB database 사용자로 인증해야 합니다. 클러스터에 대한 데이터베이스 사용자를 생성하려면 데이터베이스 사용자 구성을 참조하세요.

가능한 솔루션
사용자를 만들었는데 인증하는 데 문제가 있는 경우 다음을 시도해 보세요:

데이터베이스 사용자에 대해 올바른 사용자 이름과 비밀번호를 사용하고 있으며 올바른 클러스터에 연결하고 있는지 확인하세요.

연결 문자열에 올바른 authSource 데이터베이스를 지정하고 있는지 확인하세요.

비밀번호에 특수 문자가 있는 경우 연결 문자열 비밀번호에 특수 문자 사용을 참조하세요.

클러스터에 대해 열려 있는 연결이 너무 많음
Atlas는 클러스터에 대한 동시 수신 연결에 대한 제한을 설정합니다. 클러스터의 경우 이는 클러스터 계층을 기반으로 합니다. 이 제한에 도달했을 때 연결을 시도하면 MongoDB는 connection refused because too many open connections 라는 오류를 표시합니다.

클러스터 계층과 최대 동시 연결 수에 대한 자세한 비교는 연결 제한 및 클러스터 계층을 참조하세요.

가능한 솔루션
현재 사용하지 않는 클러스터에 대한 열려 있는 연결을 모두 닫습니다.

더 많은 동시 연결을 지원하려면 클러스터를 더 상위 계층으로 스케일링합니다.

애플리케이션을 다시 시작합니다.

앞으로 이 문제를 방지하려면 maxPoolSize 연결 문자열 옵션을 사용하여 연결 풀의 연결 수를 제한하는 것이 좋습니다.

이 문제를 해결하는 방법을 알아보려면 연결 문제 해결 페이지를 참조하세요.

연결 수가 급증하는 동안 샤딩된 클러스터의 성능 저하
Atlas는 비공개 엔드포인트 서비스의 로드 밸런서를 사용하여 샤딩된 클러스터에 대해 최적화된 SRV 연결 문자열을 생성할 수 있습니다. 최적화된 연결 문자열을 사용하면 Atlas는 애플리케이션과 샤딩된 클러스터 간의 mongos 당 연결 수를 제한합니다. mongos 당 제한된 연결은 연결 수가 급증하는 동안 성능을 향상시킵니다.

비공개 엔드포인트 샤딩된 클러스터의 최적화된 연결 문자열에 대해 자세히 알아보려면 비공개 엔드포인트 샤딩된 클러스터를 위한 연결 성능 향상을 참고하세요.

방화벽 뒤에서 연결을 시도하는 경우
Atlas UI에 연결
Atlas는 CDN을 사용하여 콘텐츠를 빠르게 제공합니다. 조직에서 방화벽을 사용하는 경우 다음 Atlas CDN 호스트를 방화벽의 허용 목록에 추가하여 Atlas UI https://assets.mongodb-cdn.com/을(를) 액세스하는 데 문제가 발생하지 않도록 합니다.

클러스터에 연결
Atlas 클러스터는 포트 27017에서 작동합니다. 클러스터에 연결하려면 이 포트에 연결할 수 있어야 합니다. 또한, 다음에 대해 적절한 포트가 열려 있는지 확인합니다.

샤딩된 클러스터의 경우 포트 27016에 대한 액세스 권한을 부여합니다.

BI Connector의 경우 포트 27015에 대한 액세스 권한을 허용하세요.

타사 Outgoing port tester를 사용하여 포트에 도달할 수 있는지 확인할 수 있습니다.

예시
포트 27017에 연결할 수 있는지 확인하려면 http://portquiz.net:27017을 방문하세요.

해당 포트에 액세스할 수 없는 경우 시스템 방화벽 설정을 확인하고 해당 설정이 대상 포트에 대한 액세스를 차단하고 있지 않은지 확인하세요.

클러스터 가용성
mongodb+srv:// 연결 문자열을 사용 중이고 드라이버 또는 셸에서 Atlas 클러스터의 DNS 호스트를 찾을 수 없는 경우 클러스터가 일시 중지되거나 삭제될 수 있습니다. 클러스터가 존재하는지 확인합니다. 일시 중지된 클러스터인 경우 필요시 클러스터를 다시 시작할 수 있습니다.

참고
연결이 없는 상태로 60일이 지나면 Atlas가 유휴 상태인 M0 클러스터를 자동으로 일시 중지합니다.

MongoDB Compass 문제 해결
MongoDB Compass를 사용하여 cluster에 연결했는데 문제가 발생하는 경우 다음을 참조하세요:

이 섹션에서 SRV 연결 문자열을 사용한 연결이 거부됨을 확인하세요.

MongoDB Compass 문서의 Compass 연결 오류 섹션.

자체 관리형 X.509 인증서 또는 Atlas에서 관리하는 자동 생성 X.509 인증서를 사용하여 MongoDB 데이터베이스에 인증하는 경우 MongoDB Compass에 연결할 때 다음을 수행해야 합니다.

MongoDB Compass에서 Fill in connection fields individually를 선택합니다.

Authentication 드롭다운 메뉴에서 X.509을(를) 선택합니다.

{00}}을 선택합니다.

SSL 드롭다운 메뉴에서 Server and Client Validation를 선택합니다.

다운로드한 Atlas 관리형 인증서에 동일한 경로를 추가하거나 자체 관리형 인증서(사용하는 항목에 따라 다름)를 Certificate Authority, Client Certificate, Client Private Key 등의 각 필드에 추가합니다.

자세한 내용은 MongoDB Compass 문서에서 MongoDB에 연결하기를 참조하세요.

연결 문자열 문제
잘못된 연결 문자열 형식
Atlas에 연결하는 데 사용하는 연결 문자열 형식은 다음과 같은 여러 요인에 따라 달라집니다:

사용 중인 mongosh 버전입니다. 자세히 알아보려면 mongosh를 통한 연결을 참조하세요.

사용 중인 드라이버 버전입니다. 자세한 내용은 드라이버를 통해 연결을 참조하세요.

연결 문자열을 프로덕션에 적용하기 전에 테스트 환경에서 확인하세요.

연결 문자열 비밀번호의 특수 문자
암호에 특수 문자가 포함되어 있고 연결 문자열 URI에 암호를 사용하는 경우 특수 문자를 인코딩합니다.

퍼센트 인코딩이 필요한 특수 문자를 사용하여 비밀번호를 업데이트하려고 하면 다음 오류 메시지가 나타납니다.

This password contains special characters which will be URL-encoded.

참고
다음의 문자와 공백 문자는 사용자 이름 또는 비밀번호에 포함된 경우 퍼센트 인코딩을 사용하여 변환해야 합니다.

: / ? # [ ] @ ! $ & ' ( ) * , ; = %

예를 들어 일반 텍스트의 비밀번호가 p@ssw0rd'9'!인 경우 비밀번호를 다음과 같이 인코딩해야 합니다:

p%40ssw0rd%279%27%21
➤ 언어 선택 드롭다운 메뉴를 사용하여 이 섹션의 인코딩 예시의 언어를 설정합니다.

package main
import (
	"context"
	"fmt"
	"net/url"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)
func main() {
	username := "<username>"
	password := "<password>"
	cluster := "<clusterName>"
	authSource  := "<authSource>"
	authMechanism := "<authMechanism>"
	uri := "mongodb+srv://" + url.QueryEscape(username) + ":" + 
		url.QueryEscape(password) + "@" + cluster + 
		"/?authSource=" + authSource +
		"&authMechanism=" + authMechanism
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		panic(err)
	}
	defer client.Disconnect(context.TODO())
	collection := client.Database("<dbName>").Collection("<collName>")
	cursor, err := collection.Find(context.TODO(), bson.D{})
	if err != nil {
		panic(err)
	}
	var results []bson.D
	if err = cursor.All(context.TODO(), &results); err != nil {
		panic(err)
	}
	for _, result := range results {
		fmt.Println(result)
	}
}

중요
연결 문자열 URI 외부에서 비밀번호를 사용하는 경우(예시: mongosh에 붙여넣기) 비밀번호의 특수 문자를 인코딩하지 마세요.

드라이버 버전과 호환되지 않는 연결 문자열
이 오류 메시지가 표시되면 드라이버가 최신 버전이 아닐 수 있습니다. 드라이버 업데이트에 대한 지침은 해당 드라이버 설명서를 참조하세요.

인터넷 서비스 제공자 DNS에 의한 연결 문자열 차단
DNS 시드 목록 연결 문자열 형식을 사용하여 Atlas에 연결할 때 다음 오류가 표시될 수 있습니다.

DNSHostNotFound: Failed to look up service "<MongoDB service name>"
이 오류는 ISP가 제공하는 기본 DNS 서버를 사용할 때 발생할 수 있습니다. 해당 DNS 서버는 DNS 시드 목록 연결 문자열 형식이 사용하는 SRV 조회를 지원하지 않을 수 있습니다.

이 문제를 해결하려면 공용 DNS 서버를 사용하도록 DNS 구성을 변경해 볼 수 있습니다.

예시
ISP의 DNS 서버 대신 Google Public DNS  를 사용하도록 네트워크 설정을 구성할 수 있습니다.

공용 DNS 서버를 사용하도록 네트워크 설정을 업데이트한 후 클러스터에 연결합니다.

Ubuntu 18.04에서 DB 도구의 연결 문자열 오류
Ubuntu 18.04를 실행 중이고 DNS 시드 목록 연결 문자열 형식(mongodb+srv://)을 사용하여 MongoDB Database Tools (mongodump, mongorestore 등) 중 하나에서 Atlas에 연결하는 경우 다음 오류가 표시될 수 있습니다.

lookup nta8e.mongodb.net on 123.45.67.8:27017: cannot unmarshal DNS message
이 경우 다음 연결 옵션 중 하나를 대신 사용합니다.

--uri 옵션을 SRV가 아닌 연결 문자열(mongodb://)과 함께 사용합니다.

--host 옵션을 사용하여 연결할 호스트를 지정합니다.

SRV 연결 문자열을 사용한 연결이 거부됨
드라이버 또는 Compass와 함께 DNS 시드 목록 연결 문자열 형식(mongodb+srv://)을 사용하는 경우 다음 오류가 나타날 수 있습니다.

Error: querySrv ECONNREFUSED _mongodb._tcp.<SRV Record>
문제 해결을 시작하려면 클러스터의 시드 목록 연결 문자열에서 DNS SRV 이름과 각 노드의 개별 호스트 이름 및 포트 번호가 모두 필요합니다.

DNS SRV 이름을 찾으려면
애플리케이션 연결의 1-6단계를 따르세요.

7단계에서 선택한 드라이버의 최신 버전을 선택하세요.

DNS SRV 이름은 비밀번호 뒤의 @ 기호 뒤에서 시작하고 .mongodb.net으로 끝납니다. 예를 들어 cluster0.dfget.mongodb.net과 같습니다.

노드의 호스트 이름과 포트 번호를 찾으려면 다음을 수행하세요.
애플리케이션 연결의 1-6단계를 따르세요.

7단계에서 선택한 드라이버의 최신 버전을 선택하세요.

7단계에서 비안정 API에서 가장 오래된 드라이버 버전을 선택합니다.

각 호스트 이름은 암호 뒤의 @ 기호 다음에 시작하여 .mongodb.net으로 끝나는 쉼표로 구분된 목록에 있습니다.

각 호스트 이름 뒤의 포트 번호를 기록하세요.

클러스터의 연결 문자열은 토폴로지와 연결 방법에 따라 다양한 호스트 이름과 포트를 포함할 수 있습니다.

비공개 엔드포인트의 작동 방식에 대한 자세한 내용은 비공개 엔드포인트 구성을 참조하세요.

기본 네트워크 연결을 테스트하세요.
문제가 발생한 애플리케이션 서버의 터미널 또는 명령 프롬프트에서 다음 명령을 실행하세요.

DNS SRV 확인 테스트:
Linux/MacOS:

dig SRV _mongodb._tcp.<DNS SRV name>

Windows:

nslookup -debug -q=SRV  _mongodb._tcp.<DNS SRV name>

응답의 ANSWER SECTION에서 클러스터의 각 노드에 대한 결과가 하나씩 표시되어야 합니다. - 예시:

;; ANSWER SECTION:
_mongodb._tcp.gcluster0.dfget.mongodb.net. 60 IN SRV 0 0 27017 cluster0-shard-00-00.dfget.mongodb.net.
_mongodb._tcp.gcluster0.dfget.mongodb.net. 60 IN SRV 0 0 27017 cluster0-shard-00-01.dfget.mongodb.net.
_mongodb._tcp.gcluster0.dfget.mongodb.net. 60 IN SRV 0 0 27017 cluster0-shard-00-02.dfget.mongodb.net.

DNS 노드 호스트 이름 확인 테스트:

클러스터의 각 호스트 이름에 대해 이 명령을 실행하세요.

Linux/MacOS:

dig <Node Hostname>

Windows:

nslookup -debug -q=A <Node Hostname>

응답의 ANSWER SECTION에서 DNS 호스트명이 확인된 IP 주소를 볼 수 있어야 합니다.

예를 들면 다음과 같습니다.

;; ANSWER SECTION: cluster0-shard-00-00.ag9in.mongodb.net. 60 IN A 10.10.10.10

핑 테스트:
참고
ICMP 요청은 클라우드 공급자가 비공개 엔드포인트 연결에서 차단할 수 있습니다.

클러스터의 각 호스트 이름에 대해 이 명령을 실행하세요.

Linux/Mac OS:

ping -c 10 <Node Hostname>

Windows:

ping /n 10 <Node Hostname>

종단간 네트워크 연결 테스트:
Linux/Mac/OS:

nc -zv <Node Hostname> <Node Port Number>

Windows:

Test-NetConnection -Port <Node Port Number> -InformationLevel "Detailed" -ComputerName "<Node Hostname>"