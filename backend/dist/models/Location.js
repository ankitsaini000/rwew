"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the Location schema
const locationSchema = new mongoose_1.default.Schema({
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
locationSchema.on('index', function (error) {
    if (error) {
        console.log('Index creation error:', error);
    }
});
// Pre-save middleware to update the updatedAt field
locationSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
// Static method to get all states of India
locationSchema.statics.getIndianStates = function () {
    return this.find({ country: 'India', isActive: true }).select('state').sort('state');
};
// Static method to check if a state exists
locationSchema.statics.isValidState = function (state) {
    return this.findOne({ country: 'India', state: state, isActive: true });
};
// Instance method to get formatted location string
locationSchema.methods.getFormattedLocation = function () {
    return `${this.state}, ${this.country}`;
};
// Export the model
const Location = mongoose_1.default.model('Location', locationSchema);
exports.default = Location;
