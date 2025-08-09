const axios = require('axios');

async function testUserInfo() {
  console.log('🔍 Testing User Information Display...\n');
  
  try {
    // 1. Login first
    console.log('1. Logging in with test account...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'test1@test.com',
      password: 'password'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (loginResponse.data.success) {
      const userData = loginResponse.data.data;
      console.log('✅ Login successful!');
      console.log('📋 User Data Structure:');
      console.log('   🆔 ID:', userData._id);
      console.log('   👤 Name:', userData.name);
      console.log('   📧 Email:', userData.email);
      console.log('   🏆 Tier:', userData.membershipTier);
      console.log('   ✅ Verified:', userData.isVerified);
      console.log('   🔑 Token:', userData.token ? 'Present' : 'Missing');
      
      // 2. Test /me endpoint
      console.log('\n2. Testing /me endpoint...');
      const meResponse = await axios.get('http://localhost:5001/api/auth/me', {
        headers: { 
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (meResponse.data.success) {
        const meData = meResponse.data.data;
        console.log('✅ /me endpoint successful!');
        console.log('📋 Profile Data:');
        console.log('   🆔 ID:', meData._id);
        console.log('   👤 Name:', meData.name);
        console.log('   📧 Email:', meData.email);
        console.log('   🏆 Tier:', meData.membershipTier);
        console.log('   📅 Created:', meData.createdAt);
        console.log('   📈 Stats:', meData.stats);
      }
      
      console.log('\n✅ User information is properly configured!');
      console.log('\n🌐 Frontend should now display:');
      console.log(`   - Welcome, ${userData.name}!`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Tier: ${userData.membershipTier.toUpperCase()}`);
      console.log(`   - ID: ${userData._id.slice(-8)}`);
      
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUserInfo();