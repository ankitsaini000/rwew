import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  type: 'text' | 'image' | 'file' | 'link';
  isRead: boolean;
  readAt?: Date;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Conversation'
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    receiver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    content: {
      type: String
    },
    fileUrl: {
      type: String
    },
    fileName: {
      type: String
    },
    fileType: {
      type: String
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'link'],
      default: 'text'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
messageSchema.index({ conversation: 1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ sentAt: -1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message; 