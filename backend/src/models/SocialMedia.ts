import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialMediaAccount extends Document {
  userId: mongoose.Types.ObjectId;
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin' | 'other';
  username: string;
  url: string;
  followerCount: number;
  platformId: string;
  accessToken?: string;
  tokenExpiry?: Date;
  refreshToken?: string;
  metadata?: Record<string, any>;
  connected: boolean;
  lastUpdated: Date;
}

const SocialMediaAccountSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'other'],
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: false,
    },
    followerCount: {
      type: Number,
      default: 0,
    },
    platformId: {
      type: String,
      required: false,
    },
    accessToken: {
      type: String,
      required: false,
    },
    tokenExpiry: {
      type: Date,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    connected: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index to quickly find accounts by user and platform
SocialMediaAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.model<ISocialMediaAccount>('SocialMediaAccount', SocialMediaAccountSchema); 