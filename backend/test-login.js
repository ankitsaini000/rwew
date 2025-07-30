// Simple script to test user login
const axios = require('axios');

const testUserLogin = async () => {
  try {
    console.log('Testing user login API...');
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('Sending login request with data:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/users/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    // Test protected route with the token
    const token = response.data.token;
    console.log('\nTesting protected route with token...');
    
    const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Profile request successful!');
    console.log('Profile data:', profileResponse.data);
    
  } catch (error) {
    console.error('Login or profile request failed with error:');
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
  }
};

// Execute the test
testUserLogin(); 