import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  creator: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  orderID: string;
  clientName: string;
  date: Date;
  service: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  statusHistory: Array<{status: string, date: Date}>;
  amount: number;
  totalAmount?: number;
  platform: string;
  promotionType: string;
  deliveryDate: Date;
  completedAt: Date;
  description: string;
  clientFeedback: string;
  clientFeedbackDate: Date;
  deliverables: string[];
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentDate: Date;
  submittedDeliverables: {
    files: string[];
    description: string;
    submissionDate: Date;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalDate: Date;
  paymentId?: mongoose.Types.ObjectId;
  // Added fields for project requirements
  specialInstructions?: string;
  message?: string;
  files?: string[];
}

const OrderSchema = new Schema<IOrder>(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required']
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    orderID: {
      type: String,
      unique: true
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required']
    },
    date: {
      type: Date,
      default: Date.now
    },
    service: {
      type: String,
      required: [true, 'Service type is required']
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'],
      default: 'pending'
    },
    statusHistory: [{
      status: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    amount: {
      type: Number,
      required: [true, 'Order amount is required']
    },
    totalAmount: {
      type: Number
    },
    platform: {
      type: String,
      default: 'Other'
    },
    promotionType: {
      type: String,
      default: 'Other'
    },
    deliveryDate: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    description: {
      type: String
    },
    clientFeedback: {
      type: String
    },
    clientFeedbackDate: {
      type: Date
    },
    deliverables: {
      type: [String],
      default: []
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    paymentDate: {
      type: Date
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    // Added fields for project requirements
    specialInstructions: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    files: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Generate a unique order ID before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderID) {
    // Format: ORD-YYYY-XXX where XXX is a sequential number
    const year = new Date().getFullYear();
    const count = await mongoose.model('Order').countDocuments();
    const sequential = (count + 1).toString().padStart(3, '0');
    this.orderID = `ORD-${year}-${sequential}`;
  }
  next();
});

// Create index for faster queries
OrderSchema.index({ creator: 1, date: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ promotionType: 1 });

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order; 