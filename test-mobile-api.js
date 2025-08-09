// 모바일 앱 API 연결 테스트
const axios = require('axios');

const API_BASE = 'https://verachain-backend2.onrender.com/api';
const MOBILE_ORIGIN = 'https://verachain-46rrad9qh-prior89s-projects.vercel.app';

async function testMobileAPI() {
    console.log('🔍 모바일 API 연결 테스트 시작...\n');
    
    try {
        // 1. 백엔드 상태 확인
        console.log('1️⃣ 백엔드 상태 확인...');
        try {
            const healthResponse = await axios.get(`${API_BASE}/health`, {
                timeout: 10000,
                headers: {
                    'Origin': MOBILE_ORIGIN,
                    'User-Agent': 'VeraChain Mobile Test'
                }
            });
            console.log('✅ 백엔드 응답:', healthResponse.status);
        } catch (error) {
            console.log('❌ 백엔드 헬스체크 실패 - 일반 엔드포인트로 테스트');
        }

        // 2. CORS 프리플라이트 테스트
        console.log('\n2️⃣ CORS 프리플라이트 테스트...');
        try {
            const corsResponse = await axios.options(`${API_BASE}/auth/register`, {
                headers: {
                    'Origin': MOBILE_ORIGIN,
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'content-type,authorization'
                }
            });
            console.log('✅ CORS 프리플라이트 성공:', corsResponse.status);
            console.log('CORS 헤더:', corsResponse.headers['access-control-allow-origin']);
        } catch (error) {
            console.log('❌ CORS 프리플라이트 실패:', error.response?.status || error.message);
        }

        // 3. 회원가입 테스트
        console.log('\n3️⃣ 회원가입 API 테스트...');
        const testEmail = `test_${Date.now()}@mobile.test`;
        try {
            const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
                email: testEmail,
                password: 'Mobile123!',
                name: 'Mobile Test User'
            }, {
                headers: {
                    'Origin': MOBILE_ORIGIN,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            console.log('✅ 회원가입 성공:', registerResponse.status);
            console.log('응답 데이터:', registerResponse.data);
            
            // 4. 로그인 테스트
            console.log('\n4️⃣ 로그인 API 테스트...');
            const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
                email: testEmail,
                password: 'Mobile123!'
            }, {
                headers: {
                    'Origin': MOBILE_ORIGIN,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            console.log('✅ 로그인 성공:', loginResponse.status);
            console.log('로그인 응답 데이터:', loginResponse.data);
            
            const token = loginResponse.data?.data?.token || loginResponse.data?.token;
            console.log('토큰 받음:', token ? '✅' : '❌');
            if (token) {
                console.log('토큰:', token.substring(0, 50) + '...');
            }
            
            // 5. 인증이 필요한 API 테스트
            console.log('\n5️⃣ 인증 API 테스트...');
            const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
                headers: {
                    'Origin': MOBILE_ORIGIN,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            console.log('✅ 프로필 조회 성공:', profileResponse.status);
            
        } catch (error) {
            if (error.response) {
                console.log('❌ API 호출 실패:', error.response.status);
                console.log('에러 응답:', error.response.data);
            } else {
                console.log('❌ 네트워크 에러:', error.message);
            }
        }

        // 6. 제품 검증 API 테스트
        console.log('\n6️⃣ 제품 검증 API 테스트...');
        try {
            const verifyResponse = await axios.post(`${API_BASE}/verification/verify`, {
                productId: 'TEST_PRODUCT_123',
                certificateId: 'TEST_CERT_123'
            }, {
                headers: {
                    'Origin': MOBILE_ORIGIN,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            console.log('✅ 제품 검증 API 응답:', verifyResponse.status);
        } catch (error) {
            console.log('❌ 제품 검증 실패 (예상됨):', error.response?.status || error.message);
        }

        console.log('\n🎉 모바일 API 테스트 완료!');
        
    } catch (error) {
        console.error('💥 테스트 중 전체 오류:', error.message);
    }
}

// 테스트 실행
testMobileAPI();