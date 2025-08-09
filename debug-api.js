// VeraChain API Debug Script
// 브라우저 콘솔에서 실행하세요 (F12 → Console)

const API_URL = 'http://localhost:5001/api';

// 1. Health Check
async function debugHealth() {
    console.log('🔍 Testing health endpoint...');
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('✅ Health check passed:', data);
        return data;
    } catch (error) {
        console.error('❌ Health check failed:', error);
        throw error;
    }
}

// 2. Products API
async function debugProducts() {
    console.log('🔍 Testing products endpoint...');
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        console.log('✅ Products API passed:', data);
        return data;
    } catch (error) {
        console.error('❌ Products API failed:', error);
        throw error;
    }
}

// 3. Registration
async function debugRegister() {
    console.log('🔍 Testing registration...');
    const testUser = {
        name: 'Debug User ' + Date.now(),
        email: 'debug' + Date.now() + '@example.com',
        password: 'DebugPass123!'
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Registration passed:', data);
        
        // Store for login test
        window.debugUser = testUser;
        window.debugToken = data.data?.token;
        
        return data;
    } catch (error) {
        console.error('❌ Registration failed:', error);
        throw error;
    }
}

// 4. Login
async function debugLogin(email = 'test1@test.com', password = 'password') {
    console.log('🔍 Testing login with:', email);
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Login passed:', data);
        
        // Store token
        window.debugToken = data.data?.token;
        
        return data;
    } catch (error) {
        console.error('❌ Login failed:', error);
        throw error;
    }
}

// 5. Protected endpoint test
async function debugProtected() {
    console.log('🔍 Testing protected endpoint...');
    const token = window.debugToken;
    
    if (!token) {
        console.error('❌ No token found. Run debugLogin() first.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Protected endpoint passed:', data);
        return data;
    } catch (error) {
        console.error('❌ Protected endpoint failed:', error);
        throw error;
    }
}

// 6. CORS Debug
async function debugCORS() {
    console.log('🔍 Testing CORS...');
    const headers = {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'OPTIONS',
            headers
        });
        
        console.log('CORS Response Headers:');
        for (const [key, value] of response.headers.entries()) {
            if (key.includes('access-control')) {
                console.log(`${key}: ${value}`);
            }
        }
        
        console.log('✅ CORS test completed');
        return response;
    } catch (error) {
        console.error('❌ CORS test failed:', error);
        throw error;
    }
}

// 7. Network diagnostics
function debugNetwork() {
    console.log('🔍 Network diagnostics...');
    console.log('Current URL:', window.location.href);
    console.log('API URL:', API_URL);
    console.log('User Agent:', navigator.userAgent);
    console.log('Online:', navigator.onLine);
    
    // Test basic fetch
    fetch(API_URL.replace('/api', '/'))
        .then(response => {
            console.log('✅ Basic server connection:', response.status);
        })
        .catch(error => {
            console.error('❌ Basic server connection failed:', error);
        });
}

// Run all tests
async function debugAll() {
    console.log('🚀 Running all API debug tests...\n');
    
    try {
        await debugNetwork();
        await debugHealth();
        await debugProducts();
        await debugLogin();
        await debugProtected();
        await debugCORS();
        
        console.log('\n✅ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
    }
}

// Export functions to global scope
window.debugHealth = debugHealth;
window.debugProducts = debugProducts;
window.debugRegister = debugRegister;
window.debugLogin = debugLogin;
window.debugProtected = debugProtected;
window.debugCORS = debugCORS;
window.debugNetwork = debugNetwork;
window.debugAll = debugAll;

console.log(`
🔧 VeraChain API Debug Tools loaded!

Available functions:
- debugAll()        // Run all tests
- debugHealth()     // Test health endpoint
- debugProducts()   // Test products API
- debugRegister()   // Test registration
- debugLogin()      // Test login
- debugProtected()  // Test protected endpoint
- debugCORS()       // Test CORS
- debugNetwork()    // Network diagnostics

Quick start: Run debugAll() to test everything
`);

// Auto-run basic tests
debugAll();