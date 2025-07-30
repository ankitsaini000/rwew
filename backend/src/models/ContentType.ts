import mongoose from 'mongoose';

const contentTypeSchema = new mongoose.Schema({
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

contentTypeSchema.index({ code: 1, name: 1 }, { unique: true });

contentTypeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ContentType = mongoose.model('ContentType', contentTypeSchema);

export interface IContentType extends mongoose.Document {
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default ContentType; 