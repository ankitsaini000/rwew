import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'message' | 'like' | 'order' | 'promotion' | 'quote_request' | 'quote_accepted' | 'quote_rejected';
  message: string;
  fromUser?: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['message', 'like', 'order', 'promotion', 'quote_request', 'quote_accepted', 'quote_rejected'],
    required: true,
    default: 'message'
  },
  message: {
    type: String,
    required: true
  },
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema); 