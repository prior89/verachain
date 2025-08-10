const axios = require('axios');

async function testPasswordValidation() {
    console.log('🔐 비밀번호 검증 테스트 시작\n');
    console.log('=' .repeat(50));
    
    // 1. 새 계정 생성 및 로그인 테스트
    const timestamp = Date.now();
    const testAccount = {
        name: 'Password Test',
        email: `pwtest_${timestamp}@test.com`,
        password: 'MyPassword123!'
    };
    
    console.log('1️⃣ 새 계정 생성');
    console.log(`   이메일: ${testAccount.email}`);
    console.log(`   비밀번호: ${testAccount.password}`);
    
    try {
        // 회원가입
        const registerRes = await axios.post(
            'https://verachain-backend2.onrender.com/api/auth/register',
            testAccount,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000
            }
        );
        
        console.log('✅ 회원가입 성공');
        console.log(`   토큰 받음: ${registerRes.data.data?.token ? 'Yes' : 'No'}`);
        
        // 올바른 비밀번호로 로그인
        console.log('\n2️⃣ 올바른 비밀번호로 로그인 시도');
        console.log(`   비밀번호: ${testAccount.password}`);
        
        const loginCorrect = await axios.post(
            'https://verachain-backend2.onrender.com/api/auth/login',
            {
                email: testAccount.email,
                password: testAccount.password
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000
            }
        );
        
        if (loginCorrect.data.success !== false) {
            console.log('✅ 로그인 성공!');
            const token = loginCorrect.data.data?.token || loginCorrect.data.token;
            console.log(`   토큰: ${token ? token.substring(0, 20) + '...' : 'No token'}`);
        } else {
            console.log('❌ 로그인 실패:', loginCorrect.data.message);
        }
        
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('❌ 인증 실패 (401):', error.response.data.message);
        } else {
            console.log('❌ 오류:', error.response?.data?.message || error.message);
        }
    }
    
    // 잘못된 비밀번호로 로그인 시도
    console.log('\n3️⃣ 잘못된 비밀번호로 로그인 시도');
    const wrongPasswords = [
        'WrongPassword123!',
        'mypassword123!',  // 대소문자 틀림
        'MyPassword123',   // 특수문자 없음
        'MyPassword123!!', // 추가 문자
        ''                 // 빈 비밀번호
    ];
    
    for (const wrongPw of wrongPasswords) {
        console.log(`\n   시도: "${wrongPw}"`);
        try {
            const loginWrong = await axios.post(
                'https://verachain-backend2.onrender.com/api/auth/login',
                {
                    email: testAccount.email,
                    password: wrongPw
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );
            
            if (loginWrong.data.success !== false) {
                console.log('   ⚠️ 경고: 잘못된 비밀번호인데 로그인됨!');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('   ✅ 정상: 잘못된 비밀번호 거부됨');
            } else {
                console.log('   ❓ 예상치 못한 오류:', error.response?.status);
            }
        }
    }
    
    // 기존 테스트 계정들 테스트
    console.log('\n4️⃣ 기존 테스트 계정 검증');
    const existingAccounts = [
        { email: 'veratest@verachain.com', password: 'Vera1234!' },
        { email: 'test_1754838624700@verachain.com', password: 'Test1234!' }
    ];
    
    for (const account of existingAccounts) {
        console.log(`\n   계정: ${account.email}`);
        console.log(`   비밀번호: ${account.password}`);
        
        try {
            const response = await axios.post(
                'https://verachain-backend2.onrender.com/api/auth/login',
                account,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );
            
            if (response.data.success !== false) {
                console.log('   ✅ 로그인 성공');
            } else {
                console.log('   ❌ 로그인 실패:', response.data.message);
            }
        } catch (error) {
            console.log('   ❌ 오류:', error.response?.data?.message || error.message);
        }
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 테스트 완료!\n');
}

testPasswordValidation().catch(console.error);