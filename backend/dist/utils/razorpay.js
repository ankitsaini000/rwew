"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRazorpaySignature = exports.createRazorpayOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Jlvb5wZpEue8k0',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'mWcXw7wleDOr2FOu5wWSctcK',
});
// Create a new Razorpay order (for payments/transactions)
const createRazorpayOrder = async (amount, currency = 'INR', receipt = '', notes = {}) => {
    const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency,
        receipt,
        payment_capture: 1,
        notes,
    };
    return await razorpay.orders.create(options);
};
exports.createRazorpayOrder = createRazorpayOrder;
// Verify Razorpay payment signature (for verification)
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    const hmac = crypto_1.default.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'oZNOReqThIGP6wGSILuoaD7m');
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
};
exports.verifyRazorpaySignature = verifyRazorpaySignature;
exports.default = razorpay;
