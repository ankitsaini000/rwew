import mongoose from 'mongoose';

const targetAudienceGenderSchema = new mongoose.Schema({
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

targetAudienceGenderSchema.index({ code: 1, name: 1 }, { unique: true });

targetAudienceGenderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const TargetAudienceGender = mongoose.model('TargetAudienceGender', targetAudienceGenderSchema);

export interface ITargetAudienceGender extends mongoose.Document {
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default TargetAudienceGender; 