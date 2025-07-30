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
const brandVerificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    email: {
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        email: String,
        verifiedAt: Date,
        rejectionReason: String,
        verificationCode: String,
        codeSentAt: Date
    },
    phone: {
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        phoneNumber: String,
        verifiedAt: Date,
        rejectionReason: String,
        verificationCode: String,
        codeSentAt: Date
    },
    pan: {
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        panNumber: String,
        documentUrl: String,
        verifiedAt: Date,
        rejectionReason: String
    },
    gst: {
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'not_submitted'],
            default: 'not_submitted'
        },
        gstNumber: String,
        documentUrl: String,
        verifiedAt: Date,
        rejectionReason: String
    },
    idProof: {
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        idType: {
            type: String,
            enum: ['aadhaar', 'passport', 'voter', 'driving']
        },
        documentUrl: String,
        verifiedAt: Date,
        rejectionReason: String
    },
    payment: {
        upi: {
            status: {
                type: String,
                enum: ['pending', 'verified', 'rejected'],
                default: 'pending'
            },
            upiId: String,
            verifiedAt: Date,
            rejectionReason: String
        },
        card: {
            status: {
                type: String,
                enum: ['pending', 'verified', 'rejected'],
                default: 'pending'
            },
            lastFourDigits: String,
            cardType: String,
            verifiedAt: Date,
            rejectionReason: String
        }
    },
    overallStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    notes: String
}, {
    timestamps: true
});
// Create indexes for efficient queries
brandVerificationSchema.index({ userId: 1 });
brandVerificationSchema.index({ overallStatus: 1 });
// Pre-save middleware to update overall status
brandVerificationSchema.pre('save', function (next) {
    const verification = this;
    // Check if all required verifications are complete
    const requiredVerifications = [
        verification.email.status,
        verification.phone.status,
        verification.pan.status,
        verification.idProof.status
    ];
    // Check payment (either UPI or card should be verified)
    const paymentVerified = verification.payment.upi.status === 'verified' ||
        verification.payment.card.status === 'verified';
    // GST is optional, so we don't include it in required verifications
    const gstStatus = verification.gst.status;
    // Update overall status
    if (requiredVerifications.every(status => status === 'verified') && paymentVerified) {
        verification.overallStatus = 'verified';
    }
    else if (requiredVerifications.some(status => status === 'rejected') ||
        (verification.payment.upi.status === 'rejected' && verification.payment.card.status === 'rejected')) {
        verification.overallStatus = 'rejected';
    }
    else {
        verification.overallStatus = 'pending';
    }
    next();
});
const BrandVerification = mongoose_1.default.model('BrandVerification', brandVerificationSchema);
exports.default = BrandVerification;
