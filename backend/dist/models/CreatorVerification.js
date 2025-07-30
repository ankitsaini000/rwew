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
const creatorVerificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    email: {
        status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
        email: String,
        verifiedAt: Date,
        verificationCode: String,
        codeSentAt: Date,
    },
    phone: {
        status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
        phoneNumber: String,
        verifiedAt: Date,
        verificationCode: String,
        codeSentAt: Date,
    },
    pan: {
        status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
        panNumber: String,
        documentUrl: String,
        verifiedAt: Date,
    },
    identity: {
        status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
        idType: String,
        idNumber: String,
        documentUrl: String,
        verifiedAt: Date,
    },
    payment: {
        upi: {
            status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
            upiId: String,
            verifiedAt: Date,
        },
        card: {
            status: { type: String, enum: ['pending', 'processing', 'verified', 'rejected'], default: 'pending' },
            lastFourDigits: String,
            cardType: String,
            verifiedAt: Date,
        },
    },
    overallStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
}, { timestamps: true });
creatorVerificationSchema.pre('save', function (next) {
    const v = this;
    const required = [v.email.status, v.phone.status, v.pan.status, v.identity.status];
    const paymentVerified = v.payment.upi.status === 'verified' || v.payment.card.status === 'verified';
    if (required.every(s => s === 'verified') && paymentVerified) {
        v.overallStatus = 'verified';
    }
    else if (required.some(s => s === 'rejected') || (v.payment.upi.status === 'rejected' && v.payment.card.status === 'rejected')) {
        v.overallStatus = 'rejected';
    }
    else {
        v.overallStatus = 'pending';
    }
    next();
});
exports.default = mongoose_1.default.model('CreatorVerification', creatorVerificationSchema);
