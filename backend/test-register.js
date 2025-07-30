// Simple script to test user registration
const axios = require('axios');

const testUserRegistration = async () => {
  try {
    console.log('Testing user registration API...');
    
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    };
    
    console.log('Sending request with data:', userData);
    
    const response = await axios.post('http://localhost:5000/api/users', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Registration failed with error:');
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
  }
};

// Execute the test
testUserRegistration(); 