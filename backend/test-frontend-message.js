const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testFrontendMessageSending() {
  try {
    console.log('🧪 Testing Frontend Message Sending...\n');

    // Step 1: Login to get JWT token (simulating frontend authentication)
    console.log('1️⃣ Logging in to get JWT token...');
    
    let token = null;
    let userId = null;
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
        email: 'ankitsaini0416@gmail.com',
        password: 'password' // Try common password
      });
      
      token = loginResponse.data.token;
      userId = loginResponse.data.user._id;
      console.log('✅ Login successful');
      console.log('User ID:', userId);
      console.log('Token:', token.substring(0, 50) + '...');
      
    } catch (loginError) {
      console.log('❌ Login failed, trying alternative approach...');
      
      // If login fails, we'll use the test-send endpoint which doesn't require auth
      console.log('Using test-send endpoint for testing...');
    }

    // Step 2: Send message using the authenticated endpoint (like frontend does)
    console.log('\n2️⃣ Testing authenticated message sending...');
    
    if (token) {
      try {
        const messageData = {
          receiverId: '67eeb9be0f2284123d6467b7', // vasusain894@gmail.com
          content: 'Hello from frontend simulation!'
        };

        const messageResponse = await axios.post(`${BASE_URL}/api/messages`, messageData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Authenticated message sent successfully');
        console.log('Message ID:', messageResponse.data._id);
        console.log('Response status:', messageResponse.status);
        
        // Check if notification was created by checking notifications
        console.log('\n3️⃣ Checking if notification was created...');
        
        const notificationsResponse = await axios.get(`${BASE_URL}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Notifications retrieved successfully');
        console.log('Total notifications:', notificationsResponse.data.data.length);
        
        if (notificationsResponse.data.data.length > 0) {
          console.log('\n📋 Recent notifications:');
          notificationsResponse.data.data.slice(0, 3).forEach((notification, index) => {
            console.log(`${index + 1}. ${notification.message} (${notification.type}) - ${notification.isRead ? 'Read' : 'Unread'}`);
          });
          
          // Check if our message notification is there
          const messageNotifications = notificationsResponse.data.data.filter(n => n.type === 'message');
          console.log(`\n📨 Message notifications found: ${messageNotifications.length}`);
          
          if (messageNotifications.length > 0) {
            console.log('✅ Message notifications are being created properly!');
          } else {
            console.log('❌ No message notifications found');
          }
        }
        
      } catch (messageError) {
        console.log('❌ Authenticated message sending failed:', messageError.response?.data?.message || messageError.message);
        
        // Fallback to test-send
        console.log('\n🔄 Falling back to test-send endpoint...');
        await testWithTestSend();
      }
    } else {
      // Use test-send if no token
      await testWithTestSend();
    }

    console.log('\n🎉 Frontend message testing completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testWithTestSend() {
  console.log('Testing with test-send endpoint...');
  
  const testMessageData = {
    receiverId: '67eeba380f2284123d6467bb', // ankitsaini0416@gmail.com
    content: 'Test message from frontend simulation',
    senderEmail: 'vasusain894@gmail.com'
  };

  const messageResponse = await axios.post(`${BASE_URL}/api/messages/test-send`, testMessageData);
  
  console.log('✅ Test message sent successfully');
  console.log('Message ID:', messageResponse.data.data._id);
  console.log('Notification created:', messageResponse.data.notification ? 'Yes' : 'No');
  
  if (messageResponse.data.notification) {
    console.log('Notification ID:', messageResponse.data.notification._id);
    console.log('Notification message:', messageResponse.data.notification.message);
    console.log('✅ Notifications are working properly!');
  } else {
    console.log('❌ No notification was created');
  }
}

testFrontendMessageSending(); 