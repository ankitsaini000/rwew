import mongoose from 'mongoose';

// Define the Location schema
const locationSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    default: 'India',
    enum: ['India'] // Currently only supporting India, can be extended
  },
  state: {
    type: String,
    required: true,
    enum: [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal',
      // Union Territories
      'Andaman and Nicobar Islands',
      'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi',
      'Jammu and Kashmir',
      'Ladakh',
      'Lakshadweep',
      'Puducherry'
    ]
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

// Create a compound index for country and state to ensure uniqueness
locationSchema.index({ country: 1, state: 1 }, { unique: true });

// Remove any existing indexes that might conflict
locationSchema.on('index', function(error) {
  if (error) {
    console.log('Index creation error:', error);
  }
});

// Pre-save middleware to update the updatedAt field
locationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get all states of India
locationSchema.statics.getIndianStates = function() {
  return this.find({ country: 'India', isActive: true }).select('state').sort('state');
};

// Static method to check if a state exists
locationSchema.statics.isValidState = function(state: string) {
  return this.findOne({ country: 'India', state: state, isActive: true });
};

// Instance method to get formatted location string
locationSchema.methods.getFormattedLocation = function() {
  return `${this.state}, ${this.country}`;
};

// Export the model
const Location = mongoose.model('Location', locationSchema);

// Export the interface
export interface ILocation extends mongoose.Document {
  country: string;
  state: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  getFormattedLocation(): string;
}

// Export static methods interface
export interface ILocationModel extends mongoose.Model<ILocation> {
  getIndianStates(): Promise<ILocation[]>;
  isValidState(state: string): Promise<ILocation | null>;
}

export default Location; 