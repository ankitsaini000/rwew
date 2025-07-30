"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CustomQuoteRequestSchema = new mongoose_1.Schema({
    requesterId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    creatorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
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
}, {
    timestamps: true,
});
const CustomQuoteRequest = mongoose_1.default.model('CustomQuoteRequest', CustomQuoteRequestSchema);
exports.default = CustomQuoteRequest;
