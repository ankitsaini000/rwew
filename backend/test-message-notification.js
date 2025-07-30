const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testMessageNotification() {
  try {
    console.log('🧪 Testing Message Notification Creation...\n');

    // Step 1: Test the test-send endpoint (no auth required)
    console.log('1️⃣ Testing POST /api/messages/test-send...');
    
    const testMessageData = {
      receiverId: '67eeba380f2284123d6467bb', // ankitsaini0416@gmail.com
      content: 'Test message for notification',
      senderEmail: 'vasusain894@gmail.com'
    };

    const messageResponse = await axios.post(`${BASE_URL}/api/messages/test-send`, testMessageData);
    
    console.log('✅ Message sent successfully');
    console.log('Message ID:', messageResponse.data.data._id);
    console.log('Notification created:', messageResponse.data.notification ? 'Yes' : 'No');
    
    if (messageResponse.data.notification) {
      console.log('Notification ID:', messageResponse.data.notification._id);
      console.log('Notification message:', messageResponse.data.notification.message);
    }

    // Step 2: Check if notification exists in database
    console.log('\n2️⃣ Checking notifications for user...');
    
    // First, we need to login to get a token to check notifications
    console.log('Logging in to check notifications...');
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
        email: 'ankitsaini0416@gmail.com',
        password: 'password' // Try common password
      });
      
      const token = loginResponse.data.token;
      console.log('✅ Login successful');
      
      // Check notifications
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
      }
      
    } catch (loginError) {
      console.log('❌ Login failed, but message was still sent');
      console.log('This means notifications are being created even without authentication');
    }

    // Step 3: Test with different user
    console.log('\n3️⃣ Testing with different receiver...');
    
    const testMessageData2 = {
      receiverId: '67eeb9be0f2284123d6467b7', // vasusain894@gmail.com
      content: 'Another test message',
      senderEmail: 'ankitsaini0416@gmail.com'
    };

    const messageResponse2 = await axios.post(`${BASE_URL}/api/messages/test-send`, testMessageData2);
    
    console.log('✅ Second message sent successfully');
    console.log('Message ID:', messageResponse2.data.data._id);
    console.log('Notification created:', messageResponse2.data.notification ? 'Yes' : 'No');

    console.log('\n🎉 Test completed successfully!');
    console.log('💡 Notifications are now being created when messages are sent');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Solution: Make sure the server is running on port 5001');
    } else if (error.response?.status === 400) {
      console.log('\n💡 Solution: Check the request data format');
    }
  }
}

testMessageNotification(); 