import mongoose from 'mongoose';

export interface ISearchHistory extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  query: string;
  searchType: 'text' | 'category' | 'tag' | 'contentType';
  filters?: {
    category?: string;
    tags?: string[];
    contentTypes?: string[];
    platform?: string;
    priceMin?: number;
    priceMax?: number;
    followersMin?: number;
    followersMax?: number;
  };
  resultsCount?: number;
  clickedCreators?: mongoose.Types.ObjectId[];
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const searchHistorySchema = new mongoose.Schema<ISearchHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    query: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    searchType: {
      type: String,
      enum: ['text', 'category', 'tag', 'contentType'],
      default: 'text',
      required: true
    },
    filters: {
      category: String,
      tags: [String],
      contentTypes: [String],
      platform: String,
      priceMin: Number,
      priceMax: Number,
      followersMin: Number,
      followersMax: Number
    },
    resultsCount: {
      type: Number,
      default: 0
    },
    clickedCreators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreatorProfile'
    }],
    sessionId: String,
    userAgent: String,
    ipAddress: String
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ brandId: 1, createdAt: -1 });
searchHistorySchema.index({ query: 1, searchType: 1 });
searchHistorySchema.index({ createdAt: -1 });

// Compound index for analytics
searchHistorySchema.index({ userId: 1, searchType: 1, createdAt: -1 });

export default mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema);
