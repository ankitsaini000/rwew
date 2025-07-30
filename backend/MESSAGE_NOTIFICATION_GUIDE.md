# Message Notification Testing Guide

## ✅ **Issue Fixed!**

Notifications are now being created automatically when messages are sent. The following changes were made:

1. **Added notification creation to `sendMessage` function** in `messageController.ts`
2. **Added notification creation to `test-send` route** in `messageRoutes.ts`
3. **Added Socket.IO notification emission** for real-time updates

## 🧪 **Testing in Postman**

### **Method 1: Test Send (No Authentication Required)**

**Request:**
```http
POST http://localhost:5001/api/messages/test-send
Content-Type: application/json

{
  "receiverId": "67eeba380f2284123d6467bb",
  "content": "Hello! This is a test message",
  "senderEmail": "vasusain894@gmail.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test message sent successfully",
  "data": {
    "_id": "message_id",
    "sender": "sender_id",
    "receiver": "67eeba380f2284123d6467bb",
    "conversation": "conversation_id",
    "content": "Hello! This is a test message",
    "isRead": false,
    "sentAt": "2024-01-15T10:30:00.000Z"
  },
  "notification": {
    "_id": "notification_id",
    "user": "67eeba380f2284123d6467bb",
    "type": "message",
    "message": "New message from Pankaj Shrivastav",
    "fromUser": "sender_id",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **Method 2: Regular Message Send (Authentication Required)**

**Step 1: Login to get JWT token**
```http
POST http://localhost:5001/api/users/login
Content-Type: application/json

{
  "email": "ankitsaini0416@gmail.com",
  "password": "your_password"
}
```

**Step 2: Send message with authentication**
```http
POST http://localhost:5001/api/messages
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "receiverId": "67eeb9be0f2284123d6467bb",
  "content": "Hello from authenticated user!"
}
```

### **Method 3: Check Notifications**

**Get all notifications for user:**
```http
GET http://localhost:5001/api/notifications
Authorization: Bearer YOUR_JWT_TOKEN
```

**Get unread notification count:**
```http
GET http://localhost:5001/api/notifications/unread-count
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🔍 **What Happens When a Message is Sent**

1. **Message is created** in the database
2. **Notification is automatically created** for the receiver
3. **Socket.IO emits real-time updates** to connected clients
4. **Conversation is updated** with latest message and unread count

## 📊 **Testing Different Scenarios**

### **Scenario 1: New Conversation**
- Send message to user you've never messaged before
- Should create new conversation
- Should create notification

### **Scenario 2: Existing Conversation**
- Send message to user you've messaged before
- Should update existing conversation
- Should create notification

### **Scenario 3: File/Image Message**
- Send message with file attachment
- Should create message with file info
- Should create notification

## 🐛 **Debugging**

### **Check Server Logs**
Look for these log messages:
```
Created message: { _id: ..., sender: ..., receiver: ..., type: ... }
Created notification: { _id: ..., user: ..., type: ..., message: ... }
```

### **Check Database**
```javascript
// Check messages
db.messages.find().sort({createdAt: -1}).limit(5)

// Check notifications
db.notifications.find().sort({createdAt: -1}).limit(5)
```

### **Common Issues**

1. **No notification created**: Check if Notification model is imported
2. **Socket error**: Check if Socket.IO is properly initialized
3. **User not found**: Verify receiverId exists in database

## 🎯 **Expected Behavior**

✅ **Message sent** → Notification created automatically  
✅ **Real-time updates** via Socket.IO  
✅ **Database storage** of both message and notification  
✅ **Frontend notification** display (if connected)  

## 📝 **Available User IDs for Testing**

- `67eeb9be0f2284123d6467b7` (vasusain894@gmail.com)
- `67eeba380f2284123d6467bb` (ankitsaini0416@gmail.com)
- `67eeba632eaf4caaaa61ea2c` (vasusain8294@gmail.com)
- `67eec4862eaf4caaaa61ea30` (ankitsaini0001@gmail.com)

## 🚀 **Next Steps**

1. **Test with Postman** using the examples above
2. **Verify notifications appear** in the frontend
3. **Check real-time updates** via Socket.IO
4. **Test different message types** (text, file, image)

The notification system is now fully integrated with the message sending functionality! 