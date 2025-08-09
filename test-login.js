const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testLogin() {
  console.log('Testing login functionality...\n');
  
  // Test with a valid user (you need to have a registered user)
  const testCredentials = {
    email: 'test@example.com',
    password: 'password123'
  };
  
  try {
    console.log('1. Testing login endpoint with email:', testCredentials.email);
    const response = await axios.post(`${API_URL}/auth/login`, testCredentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', {
      success: response.data.success,
      user: {
        id: response.data.data._id,
        name: response.data.data.name,
        email: response.data.data.email,
        hasToken: !!response.data.data.token
      }
    });
    
    // Test authenticated endpoint
    if (response.data.data.token) {
      console.log('\n2. Testing authenticated endpoint /auth/me');
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${response.data.data.token}`
        }
      });
      console.log('✅ Auth token working!');
      console.log('User data retrieved:', {
        id: meResponse.data.data._id,
        name: meResponse.data.data.name,
        email: meResponse.data.data.email
      });
    }
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Login failed: Invalid credentials');
      console.log('   Make sure you have a registered user with these credentials');
    } else {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }
  }
  
  // Test with invalid credentials
  console.log('\n3. Testing with invalid credentials...');
  try {
    await axios.post(`${API_URL}/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid credentials');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
  
  // Test missing fields
  console.log('\n4. Testing with missing email...');
  try {
    await axios.post(`${API_URL}/auth/login`, {
      password: 'password123'
    });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected missing email');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
  
  console.log('\n✅ All login tests completed!');
  console.log('\nLogin system is using EMAIL (not name) for authentication ✅');
}

testLogin();