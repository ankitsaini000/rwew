import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomQuoteRequest extends Document {
  requesterId: mongoose.Schema.Types.ObjectId; // User requesting the quote (brand)
  creatorId: mongoose.Schema.Types.ObjectId; // Creator for whom the quote is requested
  promotionType: string; // e.g., "Social Media Post", "Video Integration", "Event Appearance"
  campaignObjective: string; // e.g., "Brand Awareness", "Lead Generation", "Sales"
  platformPreference: string[]; // e.g., ["Instagram", "TikTok", "YouTube"]
  contentFormat: string[]; // e.g., ["Video", "Image", "Carousel", "Story"]
  contentGuidelines: string; // Detailed description of content expectations
  attachments: string[]; // URLs to reference files or previous campaigns
  audienceTargeting: {
    demographics: string;
    interests: string;
    geography: string;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    deliveryDeadlines: string; // Specific deadlines for drafts, final content
  };
  budget: {
    min: number;
    max: number;
    currency: string;
    compensationDetails: string; // e.g., "Flat Fee", "Commission", "Per Post"
  };
  additionalNotes: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  response?: string;
  isPrivateEvent: boolean; // Flag to indicate if this is a private event request
  eventDetails?: {
    eventName: string;
    eventType: string;
    eventDate: Date;
    eventLocation: string;
    expectedAttendance: number;
    eventDescription: string;
    specialRequirements: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CustomQuoteRequestSchema: Schema = new Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  promotionType: { type: String, required: true },
  campaignObjective: { type: String, required: true },
  platformPreference: { type: [String], default: [] },
  contentFormat: { type: [String], default: [] },
  contentGuidelines: { type: String, required: true },
  attachments: { type: [String], default: [] },
  audienceTargeting: {
    demographics: { type: String, default: '' },
    interests: { type: String, default: '' },
    geography: { type: String, default: '' },
  },
  timeline: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    deliveryDeadlines: { type: String, default: '' },
  },
  budget: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    compensationDetails: { type: String, default: '' },
  },
  additionalNotes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  response: { type: String },
  isPrivateEvent: { type: Boolean, default: false },
  eventDetails: {
    eventName: { type: String },
    eventType: { type: String },
    eventDate: { type: Date },
    eventLocation: { type: String },
    expectedAttendance: { type: Number },
    eventDescription: { type: String },
    specialRequirements: { type: String },
  },
},
{
  timestamps: true,
});

const CustomQuoteRequest = mongoose.model<ICustomQuoteRequest>('CustomQuoteRequest', CustomQuoteRequestSchema);

export default CustomQuoteRequest; 