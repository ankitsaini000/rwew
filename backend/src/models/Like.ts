import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreatorProfile',
      required: [true, 'Creator ID is required']
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index to ensure a user can only like a creator once
likeSchema.index({ userId: 1, creatorId: 1 }, { unique: true });

const Like = mongoose.model<ILike>('Like', likeSchema);
export default Like; 