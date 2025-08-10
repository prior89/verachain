const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3001';
const API_URL = 'http://localhost:5000/api';

async function testFrontendFunctionality() {
    console.log('=== VeraChain 프론트엔드 기능 테스트 ===\n');
    
    const testResults = [];
    
    // 1. 프론트엔드 서버 접근 테스트
    console.log('1. 프론트엔드 서버 접근 테스트...');
    try {
        const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
        testResults.push({
            test: '프론트엔드 서버 접근',
            status: response.status === 200 ? 'SUCCESS' : 'FAIL',
            details: `상태 코드: ${response.status}`
        });
        console.log('   ✅ 프론트엔드 서버 정상 접근\n');
    } catch (error) {
        testResults.push({
            test: '프론트엔드 서버 접근',
            status: 'FAIL',
            details: error.message
        });
        console.log(`   ❌ 프론트엔드 서버 접근 실패: ${error.message}\n`);
    }
    
    // 2. 로그인 기능 테스트
    console.log('2. 로그인 기능 테스트...');
    try {
        const loginData = {
            email: 'test@test.com',
            password: 'Test1234!'
        };
        const response = await axios.post(`${API_URL}/auth/login`, loginData, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true
        });
        
        if (response.status === 200) {
            testResults.push({
                test: '로그인 기능',
                status: 'SUCCESS',
                details: '로그인 성공, 토큰 발급됨'
            });
            console.log('   ✅ 로그인 기능 정상 작동\n');
        } else if (response.status === 401) {
            testResults.push({
                test: '로그인 기능',
                status: 'PARTIAL',
                details: '로그인 API는 작동하나 인증 실패 (테스트 계정 없음)'
            });
            console.log('   ⚠️  로그인 API 작동 확인 (401 - 인증 실패)\n');
        } else {
            testResults.push({
                test: '로그인 기능',
                status: 'FAIL',
                details: `예상치 못한 상태: ${response.status}`
            });
            console.log(`   ❌ 로그인 기능 오류: ${response.status}\n`);
        }
    } catch (error) {
        testResults.push({
            test: '로그인 기능',
            status: 'FAIL',
            details: error.message
        });
        console.log(`   ❌ 로그인 기능 테스트 실패: ${error.message}\n`);
    }
    
    // 3. 회원가입 기능 테스트
    console.log('3. 회원가입 기능 테스트...');
    try {
        const registerData = {
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@test.com`,
            password: 'Test1234!'
        };
        const response = await axios.post(`${API_URL}/auth/register`, registerData, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true
        });
        
        if (response.status === 200 || response.status === 201) {
            testResults.push({
                test: '회원가입 기능',
                status: 'SUCCESS',
                details: '새 사용자 등록 성공'
            });
            console.log('   ✅ 회원가입 기능 정상 작동\n');
        } else if (response.status === 400) {
            testResults.push({
                test: '회원가입 기능',
                status: 'PARTIAL',
                details: '회원가입 API 작동하나 유효성 검증 실패'
            });
            console.log('   ⚠️  회원가입 API 작동 확인 (400 - 유효성 검증)\n');
        } else {
            testResults.push({
                test: '회원가입 기능',
                status: 'FAIL',
                details: `예상치 못한 상태: ${response.status}`
            });
            console.log(`   ❌ 회원가입 기능 오류: ${response.status}\n`);
        }
    } catch (error) {
        testResults.push({
            test: '회원가입 기능',
            status: 'FAIL',
            details: error.message
        });
        console.log(`   ❌ 회원가입 기능 테스트 실패: ${error.message}\n`);
    }
    
    // 4. 스캔 기능 테스트
    console.log('4. AI 스캔 기능 테스트...');
    try {
        const scanData = {
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        };
        const response = await axios.post(`${API_URL}/ai/scan`, scanData, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true
        });
        
        if (response.status === 200) {
            testResults.push({
                test: 'AI 스캔 기능',
                status: 'SUCCESS',
                details: 'AI 스캔 성공'
            });
            console.log('   ✅ AI 스캔 기능 정상 작동\n');
        } else if (response.status === 400 || response.status === 401) {
            testResults.push({
                test: 'AI 스캔 기능',
                status: 'PARTIAL',
                details: `API 작동하나 처리 실패 (${response.status})`
            });
            console.log(`   ⚠️  AI 스캔 API 작동 확인 (${response.status})\n`);
        } else {
            testResults.push({
                test: 'AI 스캔 기능',
                status: 'FAIL',
                details: `예상치 못한 상태: ${response.status}`
            });
            console.log(`   ❌ AI 스캔 기능 오류: ${response.status}\n`);
        }
    } catch (error) {
        testResults.push({
            test: 'AI 스캔 기능',
            status: 'FAIL',
            details: error.message
        });
        console.log(`   ❌ AI 스캔 기능 테스트 실패: ${error.message}\n`);
    }
    
    // 5. 인증서 조회 기능 테스트
    console.log('5. 인증서 조회 기능 테스트...');
    try {
        const response = await axios.get(`${API_URL}/certificates`, {
            validateStatus: () => true
        });
        
        if (response.status === 200) {
            testResults.push({
                test: '인증서 조회',
                status: 'SUCCESS',
                details: '인증서 목록 조회 성공'
            });
            console.log('   ✅ 인증서 조회 기능 정상 작동\n');
        } else if (response.status === 401) {
            testResults.push({
                test: '인증서 조회',
                status: 'PARTIAL',
                details: 'API 작동하나 인증 필요'
            });
            console.log('   ⚠️  인증서 조회 API 작동 확인 (401 - 인증 필요)\n');
        } else {
            testResults.push({
                test: '인증서 조회',
                status: 'FAIL',
                details: `예상치 못한 상태: ${response.status}`
            });
            console.log(`   ❌ 인증서 조회 오류: ${response.status}\n`);
        }
    } catch (error) {
        testResults.push({
            test: '인증서 조회',
            status: 'FAIL',
            details: error.message
        });
        console.log(`   ❌ 인증서 조회 테스트 실패: ${error.message}\n`);
    }
    
    // 결과 요약
    console.log('=== 테스트 결과 요약 ===\n');
    
    const successCount = testResults.filter(r => r.status === 'SUCCESS').length;
    const partialCount = testResults.filter(r => r.status === 'PARTIAL').length;
    const failCount = testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`총 테스트: ${testResults.length}`);
    console.log(`✅ 성공: ${successCount}`);
    console.log(`⚠️  부분 성공: ${partialCount}`);
    console.log(`❌ 실패: ${failCount}`);
    
    console.log('\n=== 상세 결과 ===\n');
    testResults.forEach(result => {
        const icon = result.status === 'SUCCESS' ? '✅' : 
                    result.status === 'PARTIAL' ? '⚠️' : '❌';
        console.log(`${icon} ${result.test}`);
        console.log(`   상태: ${result.status}`);
        console.log(`   상세: ${result.details}\n`);
    });
    
    return testResults;
}

// 테스트 실행
testFrontendFunctionality().catch(console.error);