import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order';
import Payment from '../models/Payment';
import Notification from '../models/Notification';
import mongoose from 'mongoose';
import { getIO } from '../sockets';
import Razorpay from 'razorpay';
import crypto from 'crypto';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
    role: string;
    fullName?: string;
    email?: string;
    avatar?: string;
  };
}

// Razorpay instance (use env or fallback to provided test keys)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Jlvb5wZpEue8k0',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mWcXw7wleDOr2FOu5wWSctcK',
});

// @desc    Process payment
// @route   POST /api/payments
// @access  Private
export const processPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, amount, transactionId, paymentMethod, paymentDetails } = req.body;

  // Validate required fields
  if (!orderId || !amount || !transactionId || !paymentMethod) {
    res.status(400);
    throw new Error('Please provide all required payment information');
  }

  // Check if order exists
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Verify the order belongs to the user
  if (order.client.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized: Not your order');
  }

  // Verify payment amount matches order amount
  if (Number(amount) !== Number(order.amount)) {
    console.log(`Payment amount mismatch: Expected ${order.amount}, got ${amount}`);
    res.status(400);
    throw new Error('Payment amount does not match order total');
  }

  // Check if payment with transaction ID already exists
  const existingPayment = await Payment.findOne({ transactionId });
  if (existingPayment) {
    res.status(400);
    throw new Error('Payment with this transaction ID already exists');
  }

  // Create payment record
  const payment = new Payment({
    user: req.user._id,
    order: orderId,
    transactionId,
    amount,
    paymentMethod,
    status: 'completed',
    paymentDetails
  });

  await payment.save();

  // Update order payment status
  order.paymentStatus = 'paid';
  order.paymentDate = new Date();
  order.status = 'in_progress';
  await order.save();

  // Create notification for creator about payment received
  try {
    const orderData = order as any;
    if (orderData.creator) {
      const creatorNotification = await Notification.create({
        user: orderData.creator,
        type: 'order',
        message: `Payment received for order! Amount: $${amount}`,
        fromUser: req.user._id,
        isRead: false
      });

      // Emit real-time notification to creator
      const io = getIO();
      io.to(orderData.creator.toString()).emit('newNotification', {
        notification: {
          ...creatorNotification.toObject(),
          fromUser: {
            _id: req.user._id,
            fullName: req.user.fullName || req.user.email,
            avatar: req.user.avatar
          }
        }
      });

      console.log('Created payment notification for creator:', {
        notificationId: creatorNotification._id,
        creatorId: orderData.creator,
        amount: amount
      });
    }
  } catch (notificationError) {
    console.error('Error creating payment notification:', notificationError);
    // Don't fail the payment if notification fails
  }

  res.status(201).json({
    success: true,
    payment
  });
});

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const payment = await Payment.findById(req.params.id);
  
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  
  // Verify user has access to this payment
  if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Unauthorized: Cannot access this payment');
  }
  
  res.json(payment);
});

// @desc    Get payment by order ID
// @route   GET /api/payments/by-order/:orderId
// @access  Private
export const getPaymentByOrderId = asyncHandler(async (req: Request, res: Response) => {
  console.log(`Fetching payment for order ID: ${req.params.orderId}`);
  
  // Check if order ID is valid
  if (!req.params.orderId || !mongoose.Types.ObjectId.isValid(req.params.orderId)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }
  
  // Find payment associated with the order
  const payment = await Payment.findOne({ order: req.params.orderId });
  
  if (!payment) {
    res.status(404);
    throw new Error('No payment found for this order');
  }
  
  // Get order to check if user has access rights
  const order = await Order.findById(req.params.orderId);
  
  // Check if order exists
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if user is creator or client of the order
  // For development mode, allow any authenticated user to access
  if (process.env.NODE_ENV !== 'development') {
    const isAuthorized = 
      order.creator.toString() === req.user?._id.toString() || 
      order.client.toString() === req.user?._id.toString();
    
    if (!isAuthorized) {
      res.status(403);
      throw new Error('You are not authorized to view this payment');
    }
  }
  
  res.json(payment);
});

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
export const processRefund = asyncHandler(async (req: Request, res: Response) => {
  const { amount, reason } = req.body;
  
  if (!amount || !reason) {
    res.status(400);
    throw new Error('Please provide refund amount and reason');
  }

  const payment = await Payment.findById(req.params.id);

  if (payment) {
    // Only admin can process refunds
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized: Only admins can process refunds');
    }

    if (payment.status === 'refunded') {
      res.status(400);
      throw new Error('Payment has already been refunded');
    }

    // Validate refund amount
    if (Number(amount) > Number(payment.amount)) {
      res.status(400);
      throw new Error('Refund amount cannot exceed original payment amount');
    }

    // In a real app, you would make a call to payment gateway for refund
    // Update payment status
    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundReason = reason;

    const updatedPayment = await payment.save();
    
    // Update the associated order if needed
    const order = await Order.findById(payment.order);
    if (order) {
      order.status = 'cancelled';
      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: updatedPayment
    });
  } else {
    res.status(404);
    throw new Error('Payment not found');
  }
});

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
export const getUserPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  // Get all payments made by this user
  const payments = await Payment.find({ user: req.user?._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(payments);
});

// @desc    Create Razorpay order
// @route   POST /api/payments/razorpay/order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response) => {
  const { amount, currency = 'INR', receipt } = req.body;
  if (!amount) {
    res.status(400).json({ success: false, error: 'Amount is required' });
    return;
  }
  try {
    const options = {
      amount: Math.round(Number(amount)), // amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = asyncHandler(async (req: Request, res: Response) => {
  console.log('Razorpay verification request received:', req.body);
  console.log('User:', req.user);
  
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'oZNOReqThIGP6wGSILuoaD7m';
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.log('Missing required fields:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });
    res.status(400).json({ success: false, error: 'Missing required fields' });
    return;
  }
  
  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSign = crypto.createHmac('sha256', key_secret)
    .update(sign)
    .digest('hex');
    
  console.log('Signature verification:', {
    received: razorpay_signature,
    expected: expectedSign,
    match: razorpay_signature === expectedSign
  });
  
  if (razorpay_signature === expectedSign) {
    console.log('Payment verification successful');
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    console.log('Payment verification failed - invalid signature');
    res.status(400).json({ success: false, error: 'Invalid payment signature' });
  }
});

// Export the controller functions
export default {
  processPayment,
  getPaymentById,
  getPaymentByOrderId,
  getUserPaymentHistory,
  createRazorpayOrder,
  verifyRazorpayPayment
}; 