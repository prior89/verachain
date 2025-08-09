const axios = require('axios');
const readline = require('readline');

// Test configuration
const API_URL = 'http://localhost:5001/api';
const FRONTEND_URL = 'http://localhost:3001';

// Create readline interface for user interaction simulation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Test state
const testState = {
  user: null,
  authToken: '',
  createdProducts: [],
  certificates: [],
  testStartTime: new Date()
};

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const icon = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: '💡',
    user: '👤',
    system: '🔧'
  }[type] || '📝';
  
  console.log(`[${timestamp}] ${icon} ${message}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 ${title.toUpperCase()}`);
  console.log('='.repeat(60));
}

async function pause(seconds = 1) {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function testAPI(name, method, endpoint, data = null, expectSuccess = true) {
  try {
    const config = {
      method,
      url: endpoint,
      data
    };
    
    if (testState.authToken) {
      config.headers = { Authorization: `Bearer ${testState.authToken}` };
    }
    
    const response = await api(config);
    
    if (expectSuccess) {
      log(`${name}: SUCCESS`, 'success');
      results.passed.push(name);
      return response.data;
    } else {
      log(`${name}: Unexpected success`, 'warning');
      results.warnings.push(name);
      return response.data;
    }
  } catch (error) {
    if (!expectSuccess) {
      log(`${name}: Failed as expected (${error.response?.status})`, 'success');
      results.passed.push(name);
      return null;
    } else {
      log(`${name}: FAILED - ${error.response?.data?.message || error.message}`, 'error');
      results.failed.push(name);
      return null;
    }
  }
}

async function simulateUserOnboarding() {
  logSection('NEW USER ONBOARDING EXPERIENCE');
  
  // 1. Check if system is healthy
  log('Checking system health...', 'system');
  const health = await testAPI('System Health Check', 'get', '/health');
  if (!health) return false;
  
  // 2. Simulate new user registration
  const userEmail = `realuser${Date.now()}@verachain.com`;
  const userPassword = 'SecurePass123!';
  
  log('New user attempting registration...', 'user');
  const registerData = await testAPI(
    'User Registration', 
    'post', 
    '/auth/register',
    {
      name: 'Jane Smith',
      email: userEmail,
      password: userPassword
    }
  );
  
  if (!registerData) return false;
  
  testState.user = registerData.data;
  testState.authToken = registerData.token;
  
  log(`User registered successfully: ${testState.user.name} (${testState.user.email})`, 'success');
  
  // 3. Test immediate login after registration
  log('Testing login after registration...', 'user');
  const loginData = await testAPI(
    'User Login',
    'post',
    '/auth/login',
    { email: userEmail, password: userPassword }
  );
  
  if (loginData) {
    testState.authToken = loginData.token;
    log('Login successful - user is now authenticated', 'success');
  }
  
  return true;
}

async function simulateProductManagement() {
  logSection('PRODUCT MANAGEMENT WORKFLOW');
  
  if (!testState.authToken) {
    log('User not authenticated - skipping product management', 'warning');
    return false;
  }
  
  // 1. Check existing products (should be empty for new user)
  log('Checking user\'s existing products...', 'user');
  const existingProducts = await testAPI('Get User Products', 'get', '/products/user/my-products');
  
  // 2. Add first product
  log('User adding their first luxury item...', 'user');
  const productData = {
    name: 'Rolex Submariner',
    brand: 'Rolex',
    category: 'Watch',
    description: 'Professional diving watch, purchased from authorized dealer',
    serialNumber: `RLX${Date.now()}`,
    price: 8500,
    currency: 'USD',
    purchaseDate: new Date().toISOString(),
    purchaseLocation: 'Authorized Rolex Dealer NYC'
  };
  
  const createdProduct = await testAPI('Create Product', 'post', '/products', productData);
  
  if (createdProduct) {
    testState.createdProducts.push(createdProduct.data);
    log(`Product created: ${createdProduct.data.name} (ID: ${createdProduct.data._id})`, 'success');
  }
  
  // 3. Add second product
  log('User adding second item - a designer handbag...', 'user');
  const secondProduct = {
    name: 'Hermès Birkin 25',
    brand: 'Hermès',
    category: 'Handbag', 
    description: 'Authentic Birkin bag in Togo leather',
    serialNumber: `HER${Date.now()}`,
    price: 12500,
    currency: 'USD'
  };
  
  const createdProduct2 = await testAPI('Create Second Product', 'post', '/products', secondProduct);
  
  if (createdProduct2) {
    testState.createdProducts.push(createdProduct2.data);
  }
  
  // 4. View updated product list
  log('User viewing their product collection...', 'user');
  const updatedProducts = await testAPI('View Updated Products', 'get', '/products/user/my-products');
  
  if (updatedProducts) {
    log(`User now has ${updatedProducts.count} products in their collection`, 'info');
  }
  
  // 5. Search products
  log('User searching for Rolex items...', 'user');
  await testAPI('Search Products', 'get', '/products/search?query=Rolex');
  
  return true;
}

async function simulateVerificationWorkflow() {
  logSection('PRODUCT VERIFICATION & SCANNING');
  
  log('User wants to verify the authenticity of their items...', 'user');
  
  // 1. Test different scanning methods
  const testScans = [
    {
      name: 'Scan Product Barcode',
      endpoint: '/verify/barcode',
      data: { barcode: '1234567890123' },
      description: 'User scans barcode with phone camera'
    },
    {
      name: 'Scan Serial Number',
      endpoint: '/verify/serial', 
      data: { serialNumber: testState.createdProducts[0]?.serialNumber || 'RLX123456' },
      description: 'User manually enters serial number'
    },
    {
      name: 'Scan QR Code',
      endpoint: '/verify/qr',
      data: { qrData: 'verachain-cert-xyz123' },
      description: 'User scans QR code from certificate'
    }
  ];
  
  for (const scan of testScans) {
    log(scan.description, 'user');
    await testAPI(scan.name, 'post', scan.endpoint, scan.data);
    await pause(0.5);
  }
  
  // 2. Test AI scanning features
  log('User tries AI-powered scanning...', 'user');
  const aiScanData = { imageData: 'base64-encoded-image-data-from-camera' };
  
  await testAPI('AI Product Scan', 'post', '/ai/scan', aiScanData);
  await testAPI('AI Text Extraction', 'post', '/ai/extract-text', aiScanData);
  
  // 3. Check AI service status
  await testAPI('AI Service Status', 'get', '/ai/status');
  
  return true;
}

async function simulateNFTWorkflow() {
  logSection('NFT & CERTIFICATE MANAGEMENT');
  
  log('User checking their certificates and NFTs...', 'user');
  
  // 1. View certificates
  const certificates = await testAPI('Get Certificates', 'get', '/certificates');
  
  if (certificates) {
    log(`User has ${certificates.count} certificates`, 'info');
    testState.certificates = certificates.data;
  }
  
  // 2. View NFTs
  const nfts = await testAPI('Get NFTs', 'get', '/nft/list');
  
  if (nfts) {
    log(`User has ${nfts.nfts?.length || 0} NFTs`, 'info');
  }
  
  // 3. Try to mint NFT (may require product verification first)
  if (testState.createdProducts.length > 0) {
    log('User attempting to mint NFT for their verified product...', 'user');
    await testAPI(
      'Mint NFT', 
      'post', 
      '/nft/mint',
      { 
        productId: testState.createdProducts[0]._id,
        metadata: {
          name: 'Verified Rolex Submariner Certificate',
          description: 'Blockchain certificate of authenticity'
        }
      }
    );
  }
  
  return true;
}

async function simulateProfileManagement() {
  logSection('PROFILE & SETTINGS MANAGEMENT');
  
  log('User wants to update their profile information...', 'user');
  
  // 1. Get current profile
  const profile = await testAPI('Get Profile', 'get', '/auth/profile');
  
  if (profile) {
    log(`Current profile: ${profile.data.name} - ${profile.data.membershipTier} member`, 'info');
  }
  
  // 2. Update profile information
  log('User updating their profile...', 'user');
  await testAPI(
    'Update Profile',
    'put',
    '/auth/update-profile',
    {
      name: 'Jane Smith-Updated',
      preferences: {
        notifications: true,
        newsletter: false
      }
    }
  );
  
  // 3. Test password change
  log('User changing password for security...', 'user');
  await testAPI(
    'Change Password',
    'put', 
    '/auth/update-password',
    {
      currentPassword: 'SecurePass123!',
      newPassword: 'NewSecurePass456!'
    }
  );
  
  return true;
}

async function simulateAdvertisementExperience() {
  logSection('ADVERTISEMENT SYSTEM EXPERIENCE');
  
  log('User browsing the app and seeing advertisements...', 'user');
  
  // 1. Get current advertisements
  const ads = await testAPI('View Advertisements', 'get', '/ads');
  
  if (ads && ads.ads) {
    log(`${ads.count} advertisements available`, 'info');
    
    // 2. Get current featured ad
    const currentAd = await testAPI('Get Current Featured Ad', 'get', '/ads/current');
    
    if (currentAd) {
      log(`Featured ad: ${currentAd.ad.title} by ${currentAd.ad.brand}`, 'info');
      
      // 3. Simulate user viewing the ad
      log('User views advertisement for 5 seconds...', 'user');
      await testAPI(
        'Track Ad Impression',
        'post',
        '/ads/impression', 
        {
          adId: currentAd.ad.id,
          duration: 5000,
          userAgent: 'VeraChain-Test-User'
        }
      );
    }
  }
  
  // 4. Get ad schedule
  await testAPI('Check Ad Schedule', 'get', '/ads/schedule');
  
  return true;
}

async function simulateErrorScenarios() {
  logSection('ERROR HANDLING & EDGE CASES');
  
  log('Testing system behavior with invalid inputs...', 'system');
  
  // 1. Test invalid authentication
  const originalToken = testState.authToken;
  testState.authToken = 'invalid-token-123';
  
  await testAPI('Invalid Token Test', 'get', '/products/user/my-products', null, false);
  
  // Restore token
  testState.authToken = originalToken;
  
  // 2. Test missing required fields
  await testAPI('Empty Product Creation', 'post', '/products', {}, false);
  
  // 3. Test invalid scan data
  await testAPI('Invalid Barcode Scan', 'post', '/verify/barcode', { barcode: '' }, false);
  
  // 4. Test non-existent resources
  await testAPI('Get Non-existent Product', 'get', '/products/nonexistent123', null, false);
  
  return true;
}

async function generateTestReport() {
  logSection('COMPREHENSIVE TEST REPORT');
  
  const totalTests = results.passed.length + results.failed.length + results.warnings.length;
  const successRate = Math.round((results.passed.length / totalTests) * 100);
  const testDuration = Math.round((new Date() - testState.testStartTime) / 1000);
  
  console.log('\n📊 USER EXPERIENCE TEST RESULTS');
  console.log('=' .repeat(50));
  console.log(`👤 Test User: ${testState.user?.name || 'Unknown'} (${testState.user?.email || 'N/A'})`);
  console.log(`⏱️  Test Duration: ${testDuration} seconds`);
  console.log(`📱 Products Created: ${testState.createdProducts.length}`);
  console.log(`📜 Certificates: ${testState.certificates.length}`);
  console.log('\n📈 Test Statistics:');
  console.log(`   ✅ Passed: ${results.passed.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  console.log(`   ⚠️  Warnings: ${results.warnings.length}`);
  console.log(`   📊 Success Rate: ${successRate}%`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => console.log(`   - ${test}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  // Overall assessment
  console.log('\n🎯 USER EXPERIENCE ASSESSMENT:');
  
  if (successRate >= 90) {
    console.log('   🌟 EXCELLENT - Ready for production use');
  } else if (successRate >= 75) {
    console.log('   👍 GOOD - Minor issues need attention');  
  } else if (successRate >= 50) {
    console.log('   ⚠️  FAIR - Several issues need fixing');
  } else {
    console.log('   🔧 NEEDS WORK - Major issues prevent good user experience');
  }
  
  console.log('\n💡 Key User Journey Status:');
  console.log(`   📝 Registration & Login: ${results.passed.includes('User Registration') && results.passed.includes('User Login') ? '✅' : '❌'}`);
  console.log(`   📦 Product Management: ${results.passed.includes('Create Product') ? '✅' : '❌'}`);
  console.log(`   🔍 Verification System: ${results.passed.includes('Scan Product Barcode') ? '✅' : '❌'}`);
  console.log(`   🎨 NFT Features: ${results.passed.includes('Get NFTs') ? '✅' : '❌'}`);
  console.log(`   👤 Profile Management: ${results.passed.includes('Get Profile') ? '✅' : '❌'}`);
  console.log(`   📺 Advertisement System: ${results.passed.includes('View Advertisements') ? '✅' : '❌'}`);
  
  return successRate >= 75;
}

async function runCompleteUserExperienceTest() {
  console.log('🚀 VERACHAIN COMPLETE USER EXPERIENCE TEST');
  console.log('Testing as if I\'m a real user from start to finish...\n');
  
  try {
    // Run through complete user journey
    await simulateUserOnboarding();
    await pause(1);
    
    await simulateProductManagement();
    await pause(1);
    
    await simulateVerificationWorkflow();
    await pause(1);
    
    await simulateNFTWorkflow();
    await pause(1);
    
    await simulateProfileManagement();
    await pause(1);
    
    await simulateAdvertisementExperience();
    await pause(1);
    
    await simulateErrorScenarios();
    await pause(1);
    
    // Generate final report
    const testPassed = await generateTestReport();
    
    console.log('\n🏁 USER EXPERIENCE TEST COMPLETED');
    console.log(`Result: ${testPassed ? '✅ SYSTEM READY FOR USERS' : '❌ NEEDS IMPROVEMENT'}`);
    
    return testPassed;
    
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR during user experience test:', error.message);
    log('Test aborted due to critical error', 'error');
    return false;
  }
}

// Run the complete test
runCompleteUserExperienceTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });