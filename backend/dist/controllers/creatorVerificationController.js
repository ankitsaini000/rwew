"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatorVerificationByAdmin = exports.verifyCreatorPhoneCode = exports.submitCreatorPhoneVerification = exports.verifyCreatorEmailCode = exports.submitCreatorEmailVerification = exports.verifyCreatorVerificationPayment = exports.createCreatorVerificationPaymentOrder = exports.submitCreatorVerification = exports.getCreatorVerificationStatus = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CreatorVerification_1 = __importDefault(require("../models/CreatorVerification"));
const razorpay_1 = require("../utils/razorpay");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const twilio_1 = require("../utils/twilio");
// @desc    Get creator verification status
// @route   GET /api/creator-verification
// @access  Private
exports.getCreatorVerificationStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const verification = await CreatorVerification_1.default.findOne({ userId });
    if (!verification) {
        res.status(200).json({ success: true, verification: null });
        return;
    }
    res.status(200).json({ success: true, verification });
});
// @desc    Submit or update creator verification
// @route   POST /api/creator-verification
// @access  Private
exports.submitCreatorVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const data = req.body;
    // If PAN document is submitted, set status to 'processing'
    if (data.pan && (data.pan.documentUrl || data.pan.panNumber)) {
        data.pan.status = 'processing';
    }
    // If identity document is submitted, set status to 'processing'
    if (data.identity && (data.identity.documentUrl || data.identity.idNumber)) {
        data.identity.status = 'processing';
    }
    // Optionally handle file uploads for PAN/identity here
    const verification = await CreatorVerification_1.default.findOneAndUpdate({ userId }, { $set: data }, { new: true, upsert: true });
    console.log('Creator verification data stored:', verification);
    res.status(200).json({ success: true, verification });
});
// @desc    Create Razorpay order for creator verification payment
// @route   POST /api/creator-verification/payment/order
// @access  Private
exports.createCreatorVerificationPaymentOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const { amount, currency, receipt, notes } = req.body;
    const order = await (0, razorpay_1.createRazorpayOrder)(amount, currency, receipt, notes);
    res.status(200).json({ success: true, order });
});
// @desc    Verify Razorpay payment for creator verification
// @route   POST /api/creator-verification/payment/verify
// @access  Private
exports.verifyCreatorVerificationPayment = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { orderId, paymentId, signature, method, upiId, cardLast4 } = req.body;
    const isValid = (0, razorpay_1.verifyRazorpaySignature)(orderId, paymentId, signature);
    if (!isValid) {
        res.status(400).json({ success: false, message: 'Invalid payment signature' });
        return;
    }
    // Update creator verification payment status
    const update = {};
    if (method === 'upi') {
        update['payment.upi'] = { status: 'verified', upiId, verifiedAt: new Date() };
    }
    else {
        update['payment.card'] = { status: 'verified', lastFourDigits: cardLast4, verifiedAt: new Date() };
    }
    const verification = await CreatorVerification_1.default.findOneAndUpdate({ userId }, { $set: update }, { new: true, upsert: true });
    console.log('Creator payment verified and updated:', verification);
    res.status(200).json({ success: true, verification });
});
// @desc    Send email verification OTP for creator
// @route   POST /api/creator-verification/email
// @access  Private
exports.submitCreatorEmailVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }
    let verification = await CreatorVerification_1.default.findOne({ userId });
    if (!verification) {
        verification = new CreatorVerification_1.default({ userId });
    }
    verification.email.email = email;
    verification.email.status = 'pending';
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verification.email.verificationCode = code;
    verification.email.codeSentAt = new Date();
    await verification.save();
    try {
        await (0, sendEmail_1.default)({
            email,
            subject: 'Verify your email address',
            message: `<p>Your verification code is: <b>${code}</b></p><p>Enter this code in the app to verify your email address.</p>`
        });
        res.status(200).json({
            success: true,
            message: 'Verification code sent! Please check your email for the code.',
            verification
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to send verification email. Please try again later.',
            error: err instanceof Error ? err.message : err
        });
    }
});
// @desc    Verify creator email OTP code
// @route   POST /api/creator-verification/email/verify
// @access  Private
exports.verifyCreatorEmailCode = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { email, code } = req.body;
    const verification = await CreatorVerification_1.default.findOne({ userId });
    if (!verification || verification.email.email !== email) {
        res.status(400).json({ success: false, error: 'Email not found.' });
        return;
    }
    if (verification.email.verificationCode !== code) {
        res.status(400).json({ success: false, error: 'Invalid or expired code.' });
        return;
    }
    verification.email.status = 'verified';
    verification.email.verifiedAt = new Date();
    verification.email.verificationCode = undefined;
    await verification.save();
    res.json({ success: true, message: 'Email verified successfully.' });
});
// @desc    Send phone verification OTP for creator
// @route   POST /api/creator-verification/phone
// @access  Private
exports.submitCreatorPhoneVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ success: false, message: 'Phone number is required' });
        return;
    }
    let verification = await CreatorVerification_1.default.findOne({ userId });
    if (!verification) {
        verification = new CreatorVerification_1.default({ userId });
    }
    verification.phone.phoneNumber = phone;
    verification.phone.status = 'pending';
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verification.phone.verificationCode = code;
    verification.phone.codeSentAt = new Date();
    await verification.save();
    try {
        await (0, twilio_1.sendSMS)(phone, `Your verification code is: ${code}`);
        res.status(200).json({ success: true, message: 'Verification code sent! Please check your phone for the code.', verification });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to send verification SMS. Please try again later.', error: err instanceof Error ? err.message : err });
    }
});
// @desc    Verify creator phone OTP code
// @route   POST /api/creator-verification/phone/verify
// @access  Private
exports.verifyCreatorPhoneCode = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { phone, code } = req.body;
    const verification = await CreatorVerification_1.default.findOne({ userId });
    if (!verification || verification.phone.phoneNumber !== phone) {
        res.status(400).json({ success: false, error: 'Phone number not found.' });
        return;
    }
    if (verification.phone.verificationCode !== code) {
        res.status(400).json({ success: false, error: 'Invalid or expired code.' });
        return;
    }
    verification.phone.status = 'verified';
    verification.phone.verifiedAt = new Date();
    verification.phone.verificationCode = undefined;
    verification.phone.codeSentAt = undefined;
    await verification.save();
    res.json({ success: true, message: 'Phone verified successfully.' });
});
// Get creator verification by userId (admin)
exports.getCreatorVerificationByAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    const { userId } = req.params;
    const verification = await CreatorVerification_1.default.findOne({ userId });
    if (!verification) {
        res.status(200).json({ success: true, verification: null });
        return;
    }
    res.status(200).json({ success: true, verification });
});
