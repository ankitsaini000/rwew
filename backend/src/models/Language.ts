import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
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
  levels: {
    type: [String],
    enum: ['basic', 'conversational', 'fluent', 'native'],
    required: true
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

languageSchema.index({ code: 1, name: 1 }, { unique: true });

languageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Language = mongoose.model('Language', languageSchema);

export interface ILanguage extends mongoose.Document {
  name: string;
  code: string;
  levels: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default Language; 