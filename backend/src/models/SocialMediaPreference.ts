import mongoose from 'mongoose';

const socialMediaPreferenceSchema = new mongoose.Schema({
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

socialMediaPreferenceSchema.index({ code: 1, name: 1 }, { unique: true });

socialMediaPreferenceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const SocialMediaPreference = mongoose.model('SocialMediaPreference', socialMediaPreferenceSchema);

export interface ISocialMediaPreference extends mongoose.Document {
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default SocialMediaPreference; 