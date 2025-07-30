import mongoose from 'mongoose';

const eventTypeSchema = new mongoose.Schema({
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

eventTypeSchema.index({ code: 1, name: 1 }, { unique: true });

eventTypeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const EventType = mongoose.model('EventType', eventTypeSchema);

export interface IEventType extends mongoose.Document {
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default EventType; 