import mongoose from 'mongoose';

const targetAudienceAgeRangeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  min: {
    type: Number,
    required: false
  },
  max: {
    type: Number,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

targetAudienceAgeRangeSchema.index({ code: 1, name: 1 }, { unique: true });

targetAudienceAgeRangeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const TargetAudienceAgeRange = mongoose.model('TargetAudienceAgeRange', targetAudienceAgeRangeSchema);

export interface ITargetAudienceAgeRange extends mongoose.Document {
  name: string;
  code: string;
  min?: number;
  max?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default TargetAudienceAgeRange; 