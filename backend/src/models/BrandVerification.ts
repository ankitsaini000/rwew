import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandVerification extends Document {
  userId: mongoose.Types.ObjectId;
  email: {
    status: 'pending' | 'verified' | 'rejected';
    email?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
    verificationCode: string;
    codeSentAt: Date;
  };
  phone: {
    status: 'pending' | 'verified' | 'rejected';
    phoneNumber?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
    verificationCode?: string;
    codeSentAt?: Date;
  };
  pan: {
    status: 'pending' | 'verified' | 'rejected';
    panNumber?: string;
    documentUrl?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
  };
  gst: {
    status: 'pending' | 'verified' | 'rejected' | 'not_submitted';
    gstNumber?: string;
    documentUrl?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
  };
  idProof: {
    status: 'pending' | 'verified' | 'rejected';
    idType?: 'aadhaar' | 'passport' | 'voter' | 'driving';
    documentUrl?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
  };
  payment: {
    upi: {
      status: 'pending' | 'verified' | 'rejected';
      upiId?: string;
      verifiedAt?: Date;
      rejectionReason?: string;
    };
    card: {
      status: 'pending' | 'verified' | 'rejected';
      lastFourDigits?: string;
      cardType?: string;
      verifiedAt?: Date;
      rejectionReason?: string;
    };
  };
  overallStatus: 'pending' | 'verified' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const brandVerificationSchema = new Schema<IBrandVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    email: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      email: String,
      verifiedAt: Date,
      rejectionReason: String,
      verificationCode: String,
      codeSentAt: Date
    },
    phone: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      phoneNumber: String,
      verifiedAt: Date,
      rejectionReason: String,
      verificationCode: String,
      codeSentAt: Date
    },
    pan: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      panNumber: String,
      documentUrl: String,
      verifiedAt: Date,
      rejectionReason: String
    },
    gst: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'not_submitted'],
        default: 'not_submitted'
      },
      gstNumber: String,
      documentUrl: String,
      verifiedAt: Date,
      rejectionReason: String
    },
    idProof: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      idType: {
        type: String,
        enum: ['aadhaar', 'passport', 'voter', 'driving']
      },
      documentUrl: String,
      verifiedAt: Date,
      rejectionReason: String
    },
    payment: {
      upi: {
        status: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending'
        },
        upiId: String,
        verifiedAt: Date,
        rejectionReason: String
      },
      card: {
        status: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending'
        },
        lastFourDigits: String,
        cardType: String,
        verifiedAt: Date,
        rejectionReason: String
      }
    },
    overallStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    notes: String
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient queries
brandVerificationSchema.index({ userId: 1 });
brandVerificationSchema.index({ overallStatus: 1 });

// Pre-save middleware to update overall status
brandVerificationSchema.pre('save', function(next) {
  const verification = this;
  
  // Check if all required verifications are complete
  const requiredVerifications = [
    verification.email.status,
    verification.phone.status,
    verification.pan.status,
    verification.idProof.status
  ];
  
  // Check payment (either UPI or card should be verified)
  const paymentVerified = verification.payment.upi.status === 'verified' || 
                         verification.payment.card.status === 'verified';
  
  // GST is optional, so we don't include it in required verifications
  const gstStatus = verification.gst.status;
  
  // Update overall status
  if (requiredVerifications.every(status => status === 'verified') && paymentVerified) {
    verification.overallStatus = 'verified';
  } else if (requiredVerifications.some(status => status === 'rejected') || 
             (verification.payment.upi.status === 'rejected' && verification.payment.card.status === 'rejected')) {
    verification.overallStatus = 'rejected';
  } else {
    verification.overallStatus = 'pending';
  }
  
  next();
});

const BrandVerification = mongoose.model<IBrandVerification>('BrandVerification', brandVerificationSchema);

export default BrandVerification; 