const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
    console.log('=== VeraChain API 연결 테스트 시작 ===\n');
    
    const tests = [
        {
            name: '헬스체크',
            method: 'GET',
            url: `${API_BASE}/health`,
            expectedStatus: [200, 404]
        },
        {
            name: '인증 - 회원가입',
            method: 'POST',
            url: `${API_BASE}/auth/register`,
            data: {
                username: `test_${Date.now()}`,
                email: `test_${Date.now()}@test.com`,
                password: 'Test1234!'
            },
            expectedStatus: [200, 201, 400]
        },
        {
            name: '인증 - 로그인',
            method: 'POST',
            url: `${API_BASE}/auth/login`,
            data: {
                email: 'test@test.com',
                password: 'Test1234!'
            },
            expectedStatus: [200, 401]
        },
        {
            name: '제품 목록 조회',
            method: 'GET',
            url: `${API_BASE}/products`,
            expectedStatus: [200, 404]
        },
        {
            name: '인증서 목록 조회',
            method: 'GET',
            url: `${API_BASE}/certificates`,
            expectedStatus: [200, 404, 401]
        },
        {
            name: 'NFT 목록 조회',
            method: 'GET',
            url: `${API_BASE}/nfts`,
            expectedStatus: [200, 404]
        },
        {
            name: 'AI 스캔 엔드포인트',
            method: 'POST',
            url: `${API_BASE}/ai/scan`,
            data: {
                image: 'base64_test_image'
            },
            expectedStatus: [200, 400, 401]
        },
        {
            name: '광고 목록 조회',
            method: 'GET',
            url: `${API_BASE}/ads/active`,
            expectedStatus: [200, 404]
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const config = {
                method: test.method,
                url: test.url,
                data: test.data,
                timeout: 5000,
                validateStatus: () => true
            };
            
            const response = await axios(config);
            const success = test.expectedStatus.includes(response.status);
            
            results.push({
                name: test.name,
                url: test.url,
                method: test.method,
                status: response.status,
                success: success,
                message: success ? '정상' : `예상치 못한 상태 코드: ${response.status}`
            });
            
            console.log(`✅ ${test.name}: ${response.status} - ${success ? '성공' : '실패'}`);
        } catch (error) {
            results.push({
                name: test.name,
                url: test.url,
                method: test.method,
                status: 'ERROR',
                success: false,
                message: error.message
            });
            console.log(`❌ ${test.name}: 연결 실패 - ${error.message}`);
        }
    }
    
    console.log('\n=== 테스트 결과 요약 ===');
    console.log(`총 테스트: ${results.length}`);
    console.log(`성공: ${results.filter(r => r.success).length}`);
    console.log(`실패: ${results.filter(r => !r.success).length}`);
    
    console.log('\n=== 상세 결과 ===');
    results.forEach(r => {
        const icon = r.success ? '✅' : '❌';
        console.log(`${icon} [${r.method}] ${r.name}`);
        console.log(`   URL: ${r.url}`);
        console.log(`   상태: ${r.status}`);
        console.log(`   메시지: ${r.message}\n`);
    });
    
    return results;
}

testAPI().catch(console.error);