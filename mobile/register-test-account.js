const axios = require('axios');

async function registerAndLogin() {
    console.log('🔐 테스트 계정 생성 및 로그인 테스트\n');
    
    // 새 테스트 계정 정보
    const timestamp = Date.now();
    const testAccount = {
        name: 'Test User',
        email: `test_${timestamp}@verachain.com`,
        password: 'Test1234!'
    };
    
    console.log('1. 새 계정 등록 시도...');
    console.log('   이메일:', testAccount.email);
    console.log('   비밀번호:', testAccount.password);
    
    try {
        // 회원가입
        const registerResponse = await axios.post(
            'https://verachain-backend2.onrender.com/api/auth/register',
            testAccount,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            }
        );
        
        if (registerResponse.data.success !== false) {
            console.log('✅ 회원가입 성공!');
            console.log('   응답:', JSON.stringify(registerResponse.data, null, 2));
            
            // 로그인 시도
            console.log('\n2. 생성된 계정으로 로그인 시도...');
            const loginResponse = await axios.post(
                'https://verachain-backend2.onrender.com/api/auth/login',
                {
                    email: testAccount.email,
                    password: testAccount.password
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 15000
                }
            );
            
            if (loginResponse.data.token) {
                console.log('✅ 로그인 성공!');
                console.log('   토큰:', loginResponse.data.token.substring(0, 30) + '...');
                console.log('   사용자 정보:', loginResponse.data.user);
                
                console.log('\n========================================');
                console.log('📱 앱에서 사용할 로그인 정보:');
                console.log('========================================');
                console.log('이메일:', testAccount.email);
                console.log('비밀번호:', testAccount.password);
                console.log('========================================\n');
                
                return testAccount;
            } else {
                console.log('❌ 로그인 실패: 토큰이 없습니다');
            }
        } else {
            console.log('❌ 회원가입 실패:', registerResponse.data.message);
        }
    } catch (error) {
        console.log('❌ 오류 발생:', error.response?.data?.message || error.message);
        if (error.response) {
            console.log('   상태 코드:', error.response.status);
            console.log('   응답:', JSON.stringify(error.response.data, null, 2));
        }
    }
    
    // 기존 계정으로 시도
    console.log('\n3. 고정 테스트 계정 생성 시도...');
    const fixedAccount = {
        name: 'VeraChain Test',
        email: 'veratest@verachain.com',
        password: 'Vera1234!'
    };
    
    try {
        await axios.post(
            'https://verachain-backend2.onrender.com/api/auth/register',
            fixedAccount,
            { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );
        console.log('✅ 고정 계정 생성 성공');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('ℹ️ 고정 계정이 이미 존재합니다');
        }
    }
    
    // 고정 계정으로 로그인
    try {
        const loginResponse = await axios.post(
            'https://verachain-backend2.onrender.com/api/auth/login',
            { email: fixedAccount.email, password: fixedAccount.password },
            { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );
        
        if (loginResponse.data.token) {
            console.log('✅ 고정 계정 로그인 성공!');
            console.log('\n========================================');
            console.log('📱 사용 가능한 로그인 정보:');
            console.log('========================================');
            console.log('이메일:', fixedAccount.email);
            console.log('비밀번호:', fixedAccount.password);
            console.log('========================================\n');
        }
    } catch (error) {
        console.log('❌ 고정 계정 로그인 실패');
    }
}

registerAndLogin().catch(console.error);