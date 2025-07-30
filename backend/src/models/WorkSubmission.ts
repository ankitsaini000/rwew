import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkSubmission extends Document {
  order: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  files: Array<{
    filename: string;
    mimetype: string;
    size: number;
    path?: string;
  }>;
  description: string;
  submissionDate: Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalDate?: Date;
  clientFeedback?: string;
  revisionRequested?: boolean;
  revisionNotes?: string;
  rejectionReason?: string;
  paymentReleased: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkSubmissionSchema = new Schema<IWorkSubmission>(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required']
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required']
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client reference is required']
    },
    files: [{
      filename: {
        type: String,
        required: true
      },
      mimetype: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      path: {
        type: String
      }
    }],
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    submissionDate: {
      type: Date,
      default: Date.now
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvalDate: {
      type: Date
    },
    clientFeedback: {
      type: String
    },
    revisionRequested: {
      type: Boolean,
      default: false
    },
    revisionNotes: {
      type: String
    },
    rejectionReason: {
      type: String
    },
    paymentReleased: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for faster queries
WorkSubmissionSchema.index({ order: 1 });
WorkSubmissionSchema.index({ creator: 1 });
WorkSubmissionSchema.index({ client: 1 });
WorkSubmissionSchema.index({ approvalStatus: 1 });

const WorkSubmission = mongoose.model<IWorkSubmission>('WorkSubmission', WorkSubmissionSchema);

export default WorkSubmission; 