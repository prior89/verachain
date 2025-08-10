const axios = require('axios');

async function testLogin() {
    console.log('🔍 로그인 API 테스트 시작...\n');
    
    const testAccounts = [
        { email: 'test@test.com', password: 'Test1234!' },
        { email: 'test1@test.com', password: 'password' },
        { email: 'admin@test.com', password: 'password' }
    ];
    
    // 백엔드 서버 상태 확인
    console.log('1. 백엔드 서버 상태 확인...');
    try {
        const healthCheck = await axios.get('https://verachain-backend2.onrender.com/health', {
            timeout: 10000
        });
        console.log('✅ 백엔드 서버 응답:', healthCheck.status);
    } catch (error) {
        console.log('❌ 백엔드 서버 연결 실패:', error.message);
    }
    
    // 각 계정으로 로그인 테스트
    for (const account of testAccounts) {
        console.log(`\n2. 로그인 테스트: ${account.email}`);
        try {
            const response = await axios.post(
                'https://verachain-backend2.onrender.com/api/auth/login',
                account,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 15000
                }
            );
            
            if (response.data.token) {
                console.log('✅ 로그인 성공!');
                console.log('   토큰:', response.data.token.substring(0, 20) + '...');
                console.log('   사용자:', response.data.user?.name || response.data.user?.email);
            } else {
                console.log('⚠️ 토큰이 없습니다');
            }
        } catch (error) {
            console.log('❌ 로그인 실패:', error.response?.data?.message || error.message);
            if (error.response) {
                console.log('   상태 코드:', error.response.status);
                console.log('   응답 데이터:', JSON.stringify(error.response.data, null, 2));
            }
        }
    }
    
    // CORS 테스트
    console.log('\n3. CORS 설정 확인...');
    try {
        const corsTest = await axios.options('https://verachain-backend2.onrender.com/api/auth/login', {
            headers: {
                'Origin': 'http://localhost:8083',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'content-type'
            }
        });
        console.log('✅ CORS 허용됨');
        console.log('   허용된 Origin:', corsTest.headers['access-control-allow-origin']);
        console.log('   허용된 Methods:', corsTest.headers['access-control-allow-methods']);
    } catch (error) {
        console.log('❌ CORS 오류:', error.message);
    }
    
    console.log('\n========================================');
    console.log('📋 테스트 완료!');
    console.log('========================================');
}

testLogin().catch(console.error);