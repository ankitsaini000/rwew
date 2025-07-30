"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandVerificationByUserId = exports.verifyBrandVerificationPayment = exports.createBrandVerificationPaymentOrder = exports.updateVerificationStatus = exports.getBrandVerificationById = exports.getAllBrandVerifications = exports.submitCardVerification = exports.submitUPIVerification = exports.submitIDProofVerification = exports.submitGSTVerification = exports.submitPANVerification = exports.verifyPhoneCode = exports.submitPhoneVerification = exports.verifyEmailCode = exports.submitEmailVerification = exports.getBrandVerificationStatus = exports.initializeBrandVerification = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BrandVerification_1 = __importDefault(require("../models/BrandVerification"));
const cloudinary_1 = require("../utils/cloudinary");
const razorpay_1 = require("../utils/razorpay");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const twilio_1 = require("../utils/twilio");
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Initialize brand verification for a new user
// @route   POST /api/brand-verification/initialize
// @access  Private
exports.initializeBrandVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    // Check if verification already exists
    const existingVerification = await BrandVerification_1.default.findOne({ userId });
    if (existingVerification) {
        res.status(200).json({
            success: true,
            message: 'Brand verification already initialized',
            verification: existingVerification
        });
        return;
    }
    // Create new verification record
    const verification = await BrandVerification_1.default.create({
        userId,
        email: { status: 'pending' },
        phone: { status: 'pending' },
        pan: { status: 'pending' },
        gst: { status: 'not_submitted' },
        idProof: { status: 'pending' },
        payment: {
            upi: { status: 'pending' },
            card: { status: 'pending' }
        },
        overallStatus: 'pending'
    });
    res.status(201).json({
        success: true,
        message: 'Brand verification initialized successfully',
        verification
    });
});
// @desc    Get brand verification status for logged in user
// @route   GET /api/brand-verification
// @access  Private
exports.getBrandVerificationStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const verification = await BrandVerification_1.default.findOne({ userId });
    if (!verification) {
        // Initialize verification if it doesn't exist
        const newVerification = await BrandVerification_1.default.create({
            userId,
            email: { status: 'pending' },
            phone: { status: 'pending' },
            pan: { status: 'pending' },
            gst: { status: 'not_submitted' },
            idProof: { status: 'pending' },
            payment: {
                upi: { status: 'pending' },
                card: { status: 'pending' }
            },
            overallStatus: 'pending'
        });
        res.status(200).json({
            success: true,
            verification: newVerification
        });
        return;
    }
    res.status(200).json({
        success: true,
        verification
    });
});
// @desc    Submit email verification
// @route   POST /api/brand-verification/email
// @access  Private
exports.submitEmailVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.body;
    console.log('submitEmailVerification endpoint called');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }
    const verification = await BrandVerification_1.default.findOne({ userId });
    if (!verification) {
        res.status(404);
        throw new Error('Brand verification record not found');
    }
    verification.email.email = email;
    verification.email.status = 'pending';
    verification.email.rejectionReason = undefined;
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verification.email.verificationCode = code;
    verification.email.codeSentAt = new Date();
    await verification.save();
    // Send the code via email with robust error handling
    try {
        console.log('About to send email to', email);
        await (0, sendEmail_1.default)({
            email,
            subject: 'Verify your email address',
            message: `<p>Your verification code is: <b>${code}</b></p><p>Enter this code in the app to verify your email address.</p>`
        });
        console.log('sendEmail function completed');
        res.status(200).json({
            success: true,
            message: 'Verification code sent! Please check your email for the code.',
            verification
        });
    }
    catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification email. Please try again later.',
            error: err instanceof Error ? err.message : err
        });
    }
});
// @desc    Verify email OTP code
// @route   POST /api/brand-verification/email/verify
// @access  Private
exports.verifyEmailCode = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { email, code } = req.body;
    const verification = await BrandVerification_1.default.findOne({ userId });
    // Debug logging for troubleshooting
    console.log('DEBUG: Stored email:', verification === null || verification === void 0 ? void 0 : verification.email.email, 'Submitted email:', email);
    console.log('DEBUG: Stored code:', verification === null || verification === void 0 ? void 0 : verification.email.verificationCode, 'Submitted code:', code);
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
// @desc    Submit phone verification (send OTP)
// @route   POST /api/brand-verification/phone
// @access  Private
exports.submitPhoneVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { phone } = req.body;
    if (!phone) {
        res.status(400);
        throw new Error('Phone number is required');
    }
    let verification = await BrandVerification_1.default.findOne({ userId });
    if (!verification) {
        verification = await BrandVerification_1.default.create({
            userId,
            email: { status: 'pending' },
            phone: { status: 'pending' },
            pan: { status: 'pending' },
            gst: { status: 'not_submitted' },
            idProof: { status: 'pending' },
            payment: {
                upi: { status: 'pending' },
                card: { status: 'pending' }
            },
            overallStatus: 'pending'
        });
    }
    verification.phone.phoneNumber = phone;
    verification.phone.status = 'pending';
    verification.phone.rejectionReason = undefined;
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verification.phone.verificationCode = code;
    verification.phone.codeSentAt = new Date();
    await verification.save();
    // Send SMS (mock or real)
    try {
        await (0, twilio_1.sendSMS)(phone, `Your verification code is: ${code}`);
        res.status(200).json({
            success: true,
            message: 'Verification code sent! Please check your phone for the code.',
            verification
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to send verification SMS. Please try again later.',
            error: err instanceof Error ? err.message : err
        });
    }
});
// @desc    Verify phone OTP code
// @route   POST /api/brand-verification/phone/verify
// @access  Private
exports.verifyPhoneCode = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { phone, code } = req.body;
    const verification = await BrandVerification_1.default.findOne({ userId });
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
// @desc    Submit PAN verification
// @route   POST /api/brand-verification/pan
// @access  Private
exports.submitPANVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { panNumber } = req.body;
    const file = req.file;
    if (!panNumber) {
        res.status(400);
        throw new Error('PAN number is required');
    }
    if (!file) {
        res.status(400);
        throw new Error('PAN document is required');
    }
    const verification = await BrandVerification_1.default.findOne({ userId });
    if (!verification) {
        res.status(404);
        throw new Error('Brand verification record not found');
    }
    // Upload document to Cloudinary
    const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file, 'brand-verification/pan');
    verification.pan.panNumber = panNumber;
    verification.pan.documentUrl = uploadResult;
    verification.pan.status = 'pending';
    verification.pan.rejectionReason = undefined;
    await verification.save();
    res.status(200).json({
        success: true,
        message: 'PAN verification submitted successfully',
        verification
    });
});
// @desc    Submit GST verification
// @route   POST /api/brand-verification/gst
// @access  Private
exports.submitGSTVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { gstNumber } = req.body;
    const file = req.file;
    const verification = await BrandVerification_1.default.findOne({ userId });
    if (!verification) {
        res.status(404);
        throw new Error('Brand verification record not found');
    }
    let documentUrl;
    if (file) {
        // Upload document to Cloudinary
        const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file, 'brand-verification/gst');
        documentUrl = uploadResult;
    }
    verification.gst.gstNumber = gstNumber;
    verification.gst.documentUrl = documentUrl;
    verification.gst.status = 'pending';
    verification.gst.rejectionReason = undefined;
    await verification.save();
    res.status(200).json({
        success: true,
        message: 'GST verification submitted successfully',
        verification
    });
});
// @desc    Submit ID proof verification
// @route   POST /api/brand-verification/id-proof
// @access  Private
exports.submitIDProofVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { idType } = req.body;
    const file = req.file;
    if (!idType) {
        res.status(400);
        throw new Error('ID type is required');
    }
    if (!file) {
        res.status(400);
        throw new Error('ID proof document is required');
    }
    const verification = await BrandVerification_1.default.findOne({ userId });
    if (!verification) {
        res.status(404);
        throw new Error('Brand verification record not found');
    }
    // Upload document to Cloudinary
    const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file, 'brand-verification/id-proof');
    verification.idProof.idType = idType;
    verification.idProof.documentUrl = uploadResult;
    verification.idProof.status = 'pending';
    verification.idProof.rejectionReason = undefined;
    await verification.save();
    res.status(200).json({
        success: true,
        message: 'ID proof verification submitted successfully',
        verification
    });
});
// @desc    Submit UPI verification
// @route   POST /api/brand-verification/upi
// @access  Private
exports.submitUPIVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { upiId } = req.body;
    if (!upiId) {
        res.status(400);
        throw new Error('UPI ID is required');
    }
    const verification = await BrandVerification_1.default.findOne({ userId });
    if (!verification) {
        res.status(404);
        throw new Error('Brand verification record not found');
    }
    verification.payment.upi.upiId = upiId;
    verification.payment.upi.status = 'pending';
    verification.payment.upi.rejectionReason = undefined;
    await verification.save();
    // TODO: Implement actual UPI verification
    // For now, we'll simulate UPI verification
    setTimeout(async () => {
        verification.payment.upi.status = 'verified';
        verification.payment.upi.verifiedAt = new Date();
        await verification.save();
    }, 2000);
    res.status(200).json({
        success: true,
        message: 'UPI verification submitted successfully',
        verification
    });
});
// @desc    Submit credit card verification
// @route   POST /api/brand-verification/card
// @access  Private
exports.submitCardVerification = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { cardNumber, expiryDate, cvv } = req.body;
    if (!cardNumber || !expiryDate || !cvv) {
        res.status(400);
        throw new Error('All card details are required');
    }
    const verification = await BrandVerification_1.default.findOne({ userId });
    if (!verification) {
        res.status(404);
        throw new Error('Brand verification record not found');
    }
    // Extract last 4 digits and card type
    const lastFourDigits = cardNumber.slice(-4);
    const cardType = cardNumber.startsWith('4') ? 'Visa' :
        cardNumber.startsWith('5') ? 'Mastercard' :
            cardNumber.startsWith('3') ? 'American Express' : 'Unknown';
    verification.payment.card.lastFourDigits = lastFourDigits;
    verification.payment.card.cardType = cardType;
    verification.payment.card.status = 'pending';
    verification.payment.card.rejectionReason = undefined;
    await verification.save();
    // TODO: Implement actual card verification
    // For now, we'll simulate card verification
    setTimeout(async () => {
        verification.payment.card.status = 'verified';
        verification.payment.card.verifiedAt = new Date();
        await verification.save();
    }, 2000);
    res.status(200).json({
        success: true,
        message: 'Credit card verification submitted successfully',
        verification
    });
});
// @desc    Get all brand verifications (Admin only)
// @route   GET /api/brand-verification/admin/all
// @access  Private (Admin only)
exports.getAllBrandVerifications = (0, express_async_handler_1.default)(async (req, res) => {
    const verifications = await BrandVerification_1.default.find()
        .populate('userId', 'email fullName username avatar')
        .populate('reviewedBy', 'email fullName username')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        count: verifications.length,
        verifications
    });
});
// @desc    Get brand verification by ID (Admin only)
// @route   GET /api/brand-verification/admin/:id
// @access  Private (Admin only)
exports.getBrandVerificationById = (0, express_async_handler_1.default)(async (req, res) => {
    const verification = await BrandVerification_1.default.findById(req.params.id)
        .populate('userId', 'email fullName username avatar')
        .populate('reviewedBy', 'email fullName username');
    if (!verification) {
        res.status(404);
        throw new Error('Brand verification not found');
    }
    res.status(200).json({
        success: true,
        verification
    });
});
// @desc    Update verification status (Admin only)
// @route   PUT /api/brand-verification/admin/:id/status
// @access  Private (Admin only)
exports.updateVerificationStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { verificationType, status, rejectionReason, notes } = req.body;
    if (!verificationType || !status) {
        res.status(400);
        throw new Error('Verification type and status are required');
    }
    const verification = await BrandVerification_1.default.findById(req.params.id);
    if (!verification) {
        res.status(404);
        throw new Error('Brand verification not found');
    }
    // Update the specific verification type
    if (verificationType === 'email') {
        verification.email.status = status;
        verification.email.rejectionReason = rejectionReason;
        if (status === 'verified')
            verification.email.verifiedAt = new Date();
    }
    else if (verificationType === 'phone') {
        verification.phone.status = status;
        verification.phone.rejectionReason = rejectionReason;
        if (status === 'verified')
            verification.phone.verifiedAt = new Date();
    }
    else if (verificationType === 'pan') {
        verification.pan.status = status;
        verification.pan.rejectionReason = rejectionReason;
        if (status === 'verified')
            verification.pan.verifiedAt = new Date();
    }
    else if (verificationType === 'gst') {
        verification.gst.status = status;
        verification.gst.rejectionReason = rejectionReason;
        if (status === 'verified')
            verification.gst.verifiedAt = new Date();
    }
    else if (verificationType === 'idProof') {
        verification.idProof.status = status;
        verification.idProof.rejectionReason = rejectionReason;
        if (status === 'verified')
            verification.idProof.verifiedAt = new Date();
    }
    else if (verificationType === 'upi') {
        verification.payment.upi.status = status;
        verification.payment.upi.rejectionReason = rejectionReason;
        if (status === 'verified')
            verification.payment.upi.verifiedAt = new Date();
    }
    else if (verificationType === 'card') {
        verification.payment.card.status = status;
        verification.payment.card.rejectionReason = rejectionReason;
        if (status === 'verified')
            verification.payment.card.verifiedAt = new Date();
    }
    // Update admin review info
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    verification.notes = notes;
    await verification.save();
    res.status(200).json({
        success: true,
        message: `${verificationType} verification status updated successfully`,
        verification
    });
});
// @desc    Create Razorpay order for brand verification payment
// @route   POST /api/brand-verification/payment/order
// @access  Private
exports.createBrandVerificationPaymentOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const { amount, currency, receipt, notes } = req.body;
    const order = await (0, razorpay_1.createRazorpayOrder)(amount, currency, receipt, notes);
    res.status(200).json({ success: true, order });
});
// @desc    Verify Razorpay payment for brand verification
// @route   POST /api/brand-verification/payment/verify
// @access  Private
exports.verifyBrandVerificationPayment = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { orderId, paymentId, signature, method, upiId, cardLast4 } = req.body;
    const isValid = (0, razorpay_1.verifyRazorpaySignature)(orderId, paymentId, signature);
    if (!isValid) {
        res.status(400).json({ success: false, message: 'Invalid payment signature' });
        return;
    }
    // Update brand verification payment status
    const update = {};
    if (method === 'upi') {
        update['payment.upi'] = { status: 'verified', upiId, verifiedAt: new Date() };
    }
    else {
        update['payment.card'] = { status: 'verified', lastFourDigits: cardLast4, verifiedAt: new Date() };
    }
    const verification = await BrandVerification_1.default.findOneAndUpdate({ userId }, { $set: update }, { new: true, upsert: true });
    console.log('Brand payment verified and updated:', verification);
    res.status(200).json({ success: true, verification });
});
// @desc    Get brand verification by userId (brandId)
// @route   GET /api/brand-verification/:userId
// @access  Private
exports.getBrandVerificationByUserId = (0, express_async_handler_1.default)(async (req, res) => {
    let userId = req.params.userId;
    // Always use ObjectId for query
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: 'Invalid userId' });
        return;
    }
    const verification = await BrandVerification_1.default.findOne({ userId: new mongoose_1.default.Types.ObjectId(userId) })
        .populate('userId', 'email fullName username avatar');
    if (!verification) {
        res.status(404).json({ message: 'No verification found for this brand' });
        return;
    }
    res.status(200).json({ verificationRequest: verification });
});
