# Frontend Message Testing Guide

## ✅ **Current Status**

Notifications are now being created automatically when messages are sent from both:
- ✅ **Backend API endpoints** (test-send, authenticated send)
- ✅ **Frontend message sending** (should work with proper authentication)

## 🧪 **Testing Frontend Message Sending**

### **Step 1: Verify Frontend Authentication**

Before testing message sending, ensure the frontend user is properly authenticated:

1. **Login to the frontend** with valid credentials
2. **Check localStorage** for authentication token:
   ```javascript
   // In browser console
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', localStorage.getItem('user'));
   ```

### **Step 2: Test Message Sending from Frontend**

#### **Method 1: Using the Test Message Page**
Navigate to: `http://localhost:3000/test-message`

1. **Enter receiver ID**: `67eeb9be0f2284123d6467b7` (vasusain894@gmail.com)
2. **Enter message content**: "Hello from frontend!"
3. **Click "Send Message"**
4. **Check the result** - should show success response

#### **Method 2: Using the Chat Interface**
Navigate to: `http://localhost:3000/messages`

1. **Select a conversation** or start a new one
2. **Type a message** and send
3. **Check if notification appears** in the notification bell

#### **Method 3: Using Creator Contact Form**
Navigate to any creator profile and use the "Contact Creator" button.

### **Step 3: Verify Notifications are Created**

#### **Check Backend Logs**
Look for these log messages in your backend console:
```
Created message: { _id: ..., sender: ..., receiver: ..., type: ... }
Created notification: { _id: ..., user: ..., type: ..., message: ... }
```

#### **Check Database**
```javascript
// Check recent messages
db.messages.find().sort({createdAt: -1}).limit(5)

// Check recent notifications
db.notifications.find().sort({createdAt: -1}).limit(5)
```

#### **Check Frontend Notifications**
1. **Look for notification bell** in the header
2. **Check notification count** (should increase)
3. **Click notification bell** to see notifications list

## 🔧 **Frontend Message Sending Flow**

### **API Calls Made by Frontend:**

1. **Authenticated Message Send**:
   ```javascript
   POST /api/messages
   Authorization: Bearer <token>
   Content-Type: application/json
   
   {
     "receiverId": "67eeb9be0f2284123d6467b7",
     "content": "Hello from frontend!"
   }
   ```

2. **File Upload Message**:
   ```javascript
   POST /api/messages
   Authorization: Bearer <token>
   Content-Type: multipart/form-data
   
   FormData:
   - receiverId: "67eeb9be0f2284123d6467b7"
   - content: "Check this file"
   - file: <file>
   ```

### **Expected Response:**
```json
{
  "_id": "message_id",
  "conversation": "conversation_id",
  "sender": "sender_id",
  "receiver": "67eeb9be0f2284123d6467bb",
  "content": "Hello from frontend!",
  "type": "text",
  "isRead": false,
  "sentAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🐛 **Troubleshooting Frontend Issues**

### **Common Issues:**

1. **Authentication Error (401/403)**:
   - Check if user is logged in
   - Verify token is valid and not expired
   - Check localStorage for token

2. **Message Not Sending**:
   - Check browser console for errors
   - Verify receiverId is valid
   - Check network tab for failed requests

3. **No Notifications Created**:
   - Check backend logs for notification creation
   - Verify the sendMessage function is being called
   - Check if user has proper permissions

4. **Frontend Not Updating**:
   - Check Socket.IO connection
   - Verify real-time updates are working
   - Check if notification context is properly set up

### **Debug Steps:**

1. **Check Browser Console**:
   ```javascript
   // Check authentication
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
   
   // Check API calls
   // Look for network requests in DevTools
   ```

2. **Check Backend Logs**:
   ```bash
   # Look for these messages
   "Received message request:"
   "Created message:"
   "Created notification:"
   ```

3. **Test API Directly**:
   ```bash
   # Test with curl
   curl -X POST http://localhost:5001/api/messages \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"receiverId":"67eeb9be0f2284123d6467b7","content":"Test message"}'
   ```

## 📋 **Frontend Components to Check**

### **Message Sending Components:**
- `frontend/src/components/chat/ChatWindow.tsx`
- `frontend/src/components/modals/MessageModal.tsx`
- `frontend/src/app/test-message/page.tsx`

### **API Functions:**
- `frontend/src/services/api.ts` - `sendMessage()` and `sendMessageToCreator()`

### **Notification Components:**
- `frontend/src/context/NotificationContext.tsx`
- `frontend/src/components/ui/NotificationDropdown.tsx`

## 🎯 **Expected Behavior**

✅ **User sends message** → Message appears in chat  
✅ **Notification created** → Stored in database  
✅ **Real-time update** → Socket.IO emits notification  
✅ **Frontend updates** → Notification bell shows count  
✅ **Notification list** → Shows new notification  

## 🚀 **Testing Checklist**

- [ ] User is authenticated
- [ ] Message sends successfully
- [ ] Message appears in chat
- [ ] Notification is created in database
- [ ] Notification appears in frontend
- [ ] Real-time updates work
- [ ] Notification count increases
- [ ] Notification can be marked as read

## 📝 **Available Test Users**

- `67eeb9be0f2284123d6467b7` (vasusain894@gmail.com)
- `67eeba380f2284123d6467bb` (ankitsaini0416@gmail.com)
- `67eeba632eaf4caaaa61ea2c` (vasusain8294@gmail.com)
- `67eec4862eaf4caaaa61ea30` (ankitsaini0001@gmail.com)

## 🔄 **Next Steps**

1. **Test frontend message sending** using the guide above
2. **Verify notifications appear** in the frontend
3. **Check real-time updates** via Socket.IO
4. **Test different message types** (text, file, image)
5. **Verify notification management** (mark as read, etc.)

The notification system is now fully integrated with both backend and frontend message sending! 