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
const OrderSchema = new mongoose_1.Schema({
    creator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator reference is required']
    },
    client: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    orderID: {
        type: String,
        unique: true
    },
    clientName: {
        type: String,
        required: [true, 'Client name is required']
    },
    date: {
        type: Date,
        default: Date.now
    },
    service: {
        type: String,
        required: [true, 'Service type is required']
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'],
        default: 'pending'
    },
    statusHistory: [{
            status: String,
            date: {
                type: Date,
                default: Date.now
            }
        }],
    amount: {
        type: Number,
        required: [true, 'Order amount is required']
    },
    totalAmount: {
        type: Number
    },
    platform: {
        type: String,
        default: 'Other'
    },
    promotionType: {
        type: String,
        default: 'Other'
    },
    deliveryDate: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    description: {
        type: String
    },
    clientFeedback: {
        type: String
    },
    clientFeedbackDate: {
        type: Date
    },
    deliverables: {
        type: [String],
        default: []
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    paymentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    // Added fields for project requirements
    specialInstructions: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    },
    files: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});
// Generate a unique order ID before saving
OrderSchema.pre('save', async function (next) {
    if (!this.orderID) {
        // Format: ORD-YYYY-XXX where XXX is a sequential number
        const year = new Date().getFullYear();
        const count = await mongoose_1.default.model('Order').countDocuments();
        const sequential = (count + 1).toString().padStart(3, '0');
        this.orderID = `ORD-${year}-${sequential}`;
    }
    next();
});
// Create index for faster queries
OrderSchema.index({ creator: 1, date: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ promotionType: 1 });
const Order = mongoose_1.default.model('Order', OrderSchema);
exports.default = Order;
