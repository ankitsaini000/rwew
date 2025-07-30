import mongoose, { Schema, Document } from 'mongoose';

export interface ICreatorVerification extends Document {
  userId: mongoose.Types.ObjectId;
  email: {
    status: 'pending' | 'processing' | 'verified' | 'rejected';
    email?: string;
    verifiedAt?: Date;
    verificationCode: string;
    codeSentAt: Date;
  };
  phone: {
    status: 'pending' | 'processing' | 'verified' | 'rejected';
    phoneNumber?: string;
    verifiedAt?: Date;
    verificationCode?: string;
    codeSentAt?: Date;
  };
  pan: {
    status: 'pending' | 'processing' | 'verified' | 'rejected';
    panNumber?: string;
    documentUrl?: string;
    verifiedAt?: Date;
  };
  identity: {
    status: 'pending' | 'processing' | 'verified' | 'rejected';
    idType?: string;
    idNumber?: string;
    documentUrl?: string;
    verifiedAt?: Date;
  };
  payment: {
    upi: {
      status: 'pending' | 'processing' | 'verified' | 'rejected';
      upiId?: string;
      verifiedAt?: Date;
    };
    card: {
      status: 'pending' | 'processing' | 'verified' | 'rejected';
      lastFourDigits?: string;
      cardType?: string;
      verifiedAt?: Date;
    };
  };
  overallStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const creatorVerificationSchema = new Schema<ICreatorVerification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  email: {
    status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
    email: String,
    verifiedAt: Date,
    verificationCode: String,
    codeSentAt: Date,
  },
  phone: {
    status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
    phoneNumber: String,
    verifiedAt: Date,
    verificationCode: String,
    codeSentAt: Date,
  },
  pan: {
    status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
    panNumber: String,
    documentUrl: String,
    verifiedAt: Date,
  },
  identity: {
    status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
    idType: String,
    idNumber: String,
    documentUrl: String,
    verifiedAt: Date,
  },
  payment: {
    upi: {
      status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
      upiId: String,
      verifiedAt: Date,
    },
    card: {
      status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
      lastFourDigits: String,
      cardType: String,
      verifiedAt: Date,
    },
  },
  overallStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
}, { timestamps: true });

creatorVerificationSchema.pre('save', function(next) {
  const v = this as any;
  const required = [v.email.status, v.phone.status, v.pan.status, v.identity.status];
  const paymentVerified = v.payment.upi.status === 'verified' || v.payment.card.status === 'verified';
  if (required.every(s => s === 'verified') && paymentVerified) {
    v.overallStatus = 'verified';
  } else if (required.some(s => s === 'rejected') || (v.payment.upi.status === 'rejected' && v.payment.card.status === 'rejected')) {
    v.overallStatus = 'rejected';
  } else {
    v.overallStatus = 'pending';
  }
  next();
});

export default mongoose.model<ICreatorVerification>('CreatorVerification', creatorVerificationSchema); 