const fetch = require('node-fetch');

async function testUsernameLogin() {
  const baseUrl = 'http://localhost:5001';
  
  console.log('Testing username login functionality...\n');
  
  // Test 1: Login with email (existing functionality)
  console.log('Test 1: Login with email');
  try {
    const emailResponse = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const emailData = await emailResponse.json();
    console.log('Email login response status:', emailResponse.status);
    console.log('Email login response:', emailData.message || 'Success');
  } catch (error) {
    console.log('Email login error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Login with username (new functionality)
  console.log('Test 2: Login with username');
  try {
    const usernameResponse = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    });
    
    const usernameData = await usernameResponse.json();
    console.log('Username login response status:', usernameResponse.status);
    console.log('Username login response:', usernameData.message || 'Success');
  } catch (error) {
    console.log('Username login error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Login with invalid credentials
  console.log('Test 3: Login with invalid credentials');
  try {
    const invalidResponse = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'nonexistentuser',
        password: 'wrongpassword'
      })
    });
    
    const invalidData = await invalidResponse.json();
    console.log('Invalid login response status:', invalidResponse.status);
    console.log('Invalid login response:', invalidData.message);
  } catch (error) {
    console.log('Invalid login error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Login with missing credentials
  console.log('Test 4: Login with missing credentials');
  try {
    const missingResponse = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'password123'
      })
    });
    
    const missingData = await missingResponse.json();
    console.log('Missing credentials response status:', missingResponse.status);
    console.log('Missing credentials response:', missingData.message);
  } catch (error) {
    console.log('Missing credentials error:', error.message);
  }
}

// Run the test
testUsernameLogin().catch(console.error);
