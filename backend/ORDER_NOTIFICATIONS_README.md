# Order Notifications System

## Overview

The order notification system provides real-time notifications for all order-related activities in the influencer marketplace. Notifications are automatically created and delivered to relevant users when order events occur.

## Features

### ✅ Implemented Notifications

1. **New Order Creation**
   - **Trigger**: When a client creates a new order
   - **Recipient**: Creator
   - **Message**: "New order received from [Client Name] for [Package Type] package"
   - **Type**: `order`

2. **Order Status Changes**
   - **Trigger**: When creator updates order status (pending → in-progress → completed)
   - **Recipients**: Both creator and client
   - **Message**: "Your order status has been updated to [status]"
   - **Type**: `order`

3. **Order Acceptance**
   - **Trigger**: When creator accepts an order
   - **Recipient**: Client
   - **Message**: "Your order has been accepted and work has started!"
   - **Type**: `order`

4. **Work Submission**
   - **Trigger**: When creator submits work for approval
   - **Recipient**: Client
   - **Message**: "Work has been submitted for your order! Please review and approve."
   - **Type**: `order`

5. **Payment Completion**
   - **Trigger**: When payment is processed successfully
   - **Recipient**: Creator
   - **Message**: "Payment received for order! Amount: $[amount]"
   - **Type**: `order`

6. **Order Completion**
   - **Trigger**: When order is marked as completed
   - **Recipients**: Both creator and client
   - **Message**: "Order status updated to completed"
   - **Type**: `order`

## Technical Implementation

### Backend Components

#### 1. Notification Model
```typescript
// backend/src/models/Notification.ts
interface INotification {
  user: mongoose.Types.ObjectId;        // Recipient
  type: 'message' | 'like' | 'order' | 'promotion';
  message: string;                      // Notification text
  fromUser?: mongoose.Types.ObjectId;   // Sender
  isRead: boolean;                      // Read status
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. Controllers with Notifications

**Order Controller** (`backend/src/controllers/orderController.ts`):
- `createOrder()` - Creates notification for creator when new order is placed
- `updateOrderStatus()` - Creates notifications for both parties on status changes

**Creator Controller** (`backend/src/controllers/creatorController.ts`):
- `acceptOrder()` - Creates notification for client when order is accepted

**Work Submission Controller** (`backend/src/controllers/workSubmissionController.ts`):
- `submitWorkForApproval()` - Creates notification for client when work is submitted

**Payment Controller** (`backend/src/controllers/paymentController.ts`):
- `processPayment()` - Creates notification for creator when payment is received

#### 3. Real-time Delivery

All notifications are delivered in real-time using Socket.IO:

```typescript
// Emit notification to specific user
const io = getIO();
io.to(userId.toString()).emit('newNotification', {
  notification: {
    ...notification.toObject(),
    fromUser: {
      _id: senderId,
      fullName: senderName,
      avatar: senderAvatar
    }
  }
});
```

### Frontend Integration

#### 1. Notification Context
The frontend uses `NotificationContext` to manage notifications state and real-time updates.

#### 2. Notification Components
- `NotificationDropdown` - Shows notification bell with unread count
- `NotificationsPage` - Dedicated page to view all notifications

#### 3. Real-time Updates
Frontend automatically receives and displays new notifications in real-time through Socket.IO connection.

## API Endpoints

### Get Notifications
```
GET /api/notifications
Authorization: Bearer <token>
```

### Mark as Read
```
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

## Testing

### Test Scripts

1. **Simple Order Notification Test** (`scripts/test-order-notifications-simple.js`)
   - Tests order creation notification
   - Tests mark as read functionality
   - Verifies real-time delivery

2. **Comprehensive Order Notification Test** (`scripts/test-order-notifications.js`)
   - Tests all order notification types
   - Tests complete order workflow

### Running Tests

```bash
# Test order creation notification
node scripts/test-order-notifications-simple.js

# Test comprehensive order notifications
node scripts/test-order-notifications.js
```

## Usage Examples

### Creating an Order (Client)
```javascript
const response = await axios.post('/api/orders', {
  creatorId: 'creator_id',
  packageType: 'standard',
  packagePrice: 100,
  platformFee: 10,
  totalAmount: 110,
  paymentMethod: 'card',
  specialInstructions: 'Custom requirements',
  message: 'Order message',
  paymentStatus: 'completed'
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Updating Order Status (Creator)
```javascript
const response = await axios.put(`/api/orders/${orderId}/status`, {
  status: 'in-progress'
}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Accepting an Order (Creator)
```javascript
const response = await axios.post(`/api/creators/orders/${orderId}/accept`, {}, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Notification Flow

```
1. Client creates order
   ↓
2. Creator receives "New order" notification
   ↓
3. Creator accepts order
   ↓
4. Client receives "Order accepted" notification
   ↓
5. Creator updates status to "in-progress"
   ↓
6. Client receives "Status updated" notification
   ↓
7. Creator submits work
   ↓
8. Client receives "Work submitted" notification
   ↓
9. Creator marks order as "completed"
   ↓
10. Client receives "Order completed" notification
```

## Error Handling

- Notifications are created in try-catch blocks
- If notification creation fails, the main operation continues
- Errors are logged but don't break the user experience
- Socket.IO errors are handled gracefully

## Performance Considerations

- Notifications are indexed for efficient queries
- Real-time delivery uses user-specific rooms
- Database queries are optimized with proper indexing
- Notification creation is non-blocking

## Future Enhancements

1. **Email Notifications**: Send email notifications in addition to in-app
2. **Push Notifications**: Mobile push notifications
3. **Notification Preferences**: Allow users to customize notification types
4. **Notification Templates**: More sophisticated message templates
5. **Notification History**: Extended notification history and archiving

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check Socket.IO connection
   - Verify user authentication
   - Check notification creation in database

2. **Real-time updates not working**
   - Ensure Socket.IO is properly initialized
   - Check user room joining
   - Verify event emission

3. **Permission errors**
   - Check user roles and permissions
   - Verify order ownership
   - Ensure proper authentication

### Debug Commands

```bash
# Check notifications in database
node scripts/checkNotifications.js

# Test notification API
curl -H "Authorization: Bearer <token>" http://localhost:5001/api/notifications

# Test Socket.IO connection
# Check browser console for Socket.IO events
```

## Conclusion

The order notification system provides comprehensive real-time updates for all order-related activities. It enhances user experience by keeping both creators and clients informed about order progress, payments, and status changes.

The system is production-ready and includes proper error handling, real-time delivery, and comprehensive testing. 