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
const WorkSubmissionSchema = new mongoose_1.Schema({
    order: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order reference is required']
    },
    creator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator reference is required']
    },
    client: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client reference is required']
    },
    files: [{
            filename: {
                type: String,
                required: true
            },
            mimetype: {
                type: String,
                required: true
            },
            size: {
                type: Number,
                required: true
            },
            path: {
                type: String
            }
        }],
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvalDate: {
        type: Date
    },
    clientFeedback: {
        type: String
    },
    revisionRequested: {
        type: Boolean,
        default: false
    },
    revisionNotes: {
        type: String
    },
    rejectionReason: {
        type: String
    },
    paymentReleased: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Create indexes for faster queries
WorkSubmissionSchema.index({ order: 1 });
WorkSubmissionSchema.index({ creator: 1 });
WorkSubmissionSchema.index({ client: 1 });
WorkSubmissionSchema.index({ approvalStatus: 1 });
const WorkSubmission = mongoose_1.default.model('WorkSubmission', WorkSubmissionSchema);
exports.default = WorkSubmission;
