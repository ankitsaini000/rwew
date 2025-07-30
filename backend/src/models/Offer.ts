import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  conversationId: string;
  senderId: mongoose.Schema.Types.ObjectId;
  recipientId: mongoose.Schema.Types.ObjectId;
  type: 'brand_to_creator' | 'creator_to_brand';
  service: string;
  description: string;
  price: number;
  currency: string;
  deliveryTime: number; // in days
  revisions: number;
  deliverables: string[];
  terms: string;
  validUntil: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered';
  counterOffer?: {
    price: number;
    deliveryTime: number;
    revisions: number;
    terms: string;
    message: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema: Schema = new Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['brand_to_creator', 'creator_to_brand'],
    required: true
  },
  service: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: '₹'
  },
  deliveryTime: {
    type: Number,
    required: true,
    min: 1
  },
  revisions: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  deliverables: [{
    type: String
  }],
  terms: {
    type: String,
    default: ''
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired', 'countered'],
    default: 'pending'
  },
  counterOffer: {
    price: Number,
    deliveryTime: Number,
    revisions: Number,
    terms: String,
    message: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
OfferSchema.index({ conversationId: 1, createdAt: -1 });
OfferSchema.index({ senderId: 1, status: 1 });
OfferSchema.index({ recipientId: 1, status: 1 });
OfferSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired offers

const Offer = mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer; 