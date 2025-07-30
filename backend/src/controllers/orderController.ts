import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Payment from '../models/Payment';
import Notification from '../models/Notification';
import path from 'path';
import fs from 'fs';
import CreatorMetrics from '../models/CreatorMetrics';
// Import User model for username lookup
import User, { IUser } from '../models/User';
// Import CreatorProfile model for additional lookup
import { CreatorProfile } from '../models/CreatorProfile';
import WorkSubmission from '../models/WorkSubmission';
import { v2 as cloudinary } from 'cloudinary';
import { Document, Types } from 'mongoose';
import { getIO } from '../sockets';
// @ts-ignore: json2csv is a runtime dependency for CSV export
import { Parser } from 'json2csv';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
    role: string;
    fullName?: string;
    email?: string;
    avatar?: string;
  };
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgzcfva4b',
  api_key: process.env.CLOUDINARY_API_KEY || '324744317225964',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mY31tPtm4lWqz33zLKK8b_JhH2w'
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file: Express.Multer.File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `work_submissions/${folder}`,
        resource_type: 'auto', // Automatically detect file type
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to stream and upload
    const bufferStream = new (require('stream').Readable)();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  console.log('Create order request received with body:', JSON.stringify(req.body, null, 2));
  
  // Destructure the request body
  const {
    creatorId,
    isUsername,
    packageType,
    packagePrice,
    platformFee,
    totalAmount,
    paymentMethod,
    specialInstructions,
    message,
    files,
    paymentStatus,
  } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!creatorId) missingFields.push('creatorId');
  if (!packageType) missingFields.push('packageType');
  if (!packagePrice) missingFields.push('packagePrice');
  if (!totalAmount) missingFields.push('totalAmount');
  if (!paymentMethod) missingFields.push('paymentMethod');

  if (missingFields.length > 0) {
    console.log('Missing required fields in order creation:', missingFields);
    res.status(400);
    throw new Error(`Please provide all required fields: ${missingFields.join(', ')}`);
  }

  try {
    // Get full user data
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Log user info for debugging
    console.log('User info:', {
      userId: user._id,
      username: user.fullName || user.username,
      role: user.role
    });

    // --- Added Logging Start ---
    console.log('Received creatorId:', creatorId);
    console.log('Received isUsername flag:', isUsername);
    // --- Added Logging End ---

    // If creatorId is a username, try to look up the actual creator Object ID
    let creatorObjectId = creatorId;
    if (isUsername && typeof creatorId === 'string') {
      console.log('Looking up creator by username:', creatorId);
      
      try {
        // Check multiple possible locations for the username in the schema
        const creator = await User.findOne({ 
          $or: [
            { username: creatorId },
            { 'personalInfo.username': creatorId },
            { name: creatorId },
            { email: creatorId }
          ]
        });
        
        if (creator) {
          creatorObjectId = creator._id;
          console.log('Found creator by username, using ObjectId:', creatorObjectId);
        } else {
          // Try creators collection if User lookup fails
          const creatorProfile = await CreatorProfile.findOne({
            $or: [
              { 'personalInfo.username': creatorId },
              { username: creatorId }
            ]
          });
          
          if (creatorProfile) {
            creatorObjectId = creatorProfile.userId || creatorProfile._id;
            console.log('Found creator in CreatorProfile, using ObjectId:', creatorObjectId);
          } else {
            console.log('Creator not found with username:', creatorId);
            res.status(400);
            throw new Error(`Creator not found with username: ${creatorId}`);
          }
        }
      } catch (lookupError) {
        console.error('Error looking up creator by username:', lookupError);
        // Continue with original creatorId - the error will be caught if invalid
      }
    }

    // --- Added Logging Start ---
    console.log('Determined creatorObjectId before saving:', creatorObjectId);
    // --- Added Logging End ---

    // Validate payment method
    const validPaymentMethods = ['card', 'paypal', 'upi', 'bankTransfer'];
    const normalizedPaymentMethod = paymentMethod.toLowerCase();
    
    if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
      console.log(`Invalid payment method: ${paymentMethod}. Acceptable values: ${validPaymentMethods.join(', ')}`);
      res.status(400);
      throw new Error(`Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`);
    }

    // Validate package type
    const validPackageTypes = ['basic', 'standard', 'premium'];
    const normalizedPackageType = packageType.toLowerCase();
    
    if (!validPackageTypes.includes(normalizedPackageType)) {
      console.log(`Invalid package type: ${packageType}. Acceptable values: ${validPackageTypes.join(', ')}`);
      res.status(400);
      throw new Error(`Invalid package type. Must be one of: ${validPackageTypes.join(', ')}`);
    }

    // Process and save files if they exist
    let fileUrls: string[] = [];
    if (files && files.length > 0) {
      // In a real implementation, you'd handle file uploads properly
      fileUrls = files.map((file: any) => {
        return file.path || file.url || file.name || 'Unnamed file';
      });
    }

    // Create order data
    const orderData = {
      user: user._id,
      creator: creatorObjectId,
      client: user._id,
      clientName: user.fullName || user.username || 'Client',
      service: packageType,
      amount: Number(totalAmount),
      packageType: normalizedPackageType,
      packagePrice: Number(packagePrice),
      platformFee: Number(platformFee),
      totalAmount: Number(totalAmount),
      paymentMethod: normalizedPaymentMethod,
      specialInstructions: specialInstructions || '',
      message: message || '',
      files: fileUrls,
      isPaid: paymentStatus === 'completed', // Mark as paid if payment was successful
      paidAt: paymentStatus === 'completed' ? new Date() : undefined,
      status: paymentStatus === 'failed' ? 'cancelled' : 'pending',
    };

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    // Create new order in the database
    const order = await Order.create(orderData);

    console.log('Order created successfully:', {
      orderId: order._id,
      creatorId: (order as any).creator,
      packageType: (order as any).packageType,
      paymentMethod: (order as any).paymentMethod,
      totalAmount: (order as any).totalAmount,
      status: (order as any).status
    });

    // Create payment record
    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
    const paymentData = {
      user: user._id,
      order: order._id,
      transactionId,
      amount: Number(totalAmount),
      paymentMethod: normalizedPaymentMethod,
      status: paymentStatus || 'pending',
      paymentDetails: {}
    };

    // Add payment details based on payment method
    if (normalizedPaymentMethod === 'card') {
      paymentData.paymentDetails = {
        cardLast4: req.body.cardLast4 || '1234', // Mock data for development
        cardBrand: req.body.cardBrand || 'Visa', // Mock data for development
      };
    } else if (normalizedPaymentMethod === 'paypal') {
      paymentData.paymentDetails = {
        paypalEmail: req.body.paypalEmail || user.email || 'user@example.com',
      };
    } else if (normalizedPaymentMethod === 'upi') {
      paymentData.paymentDetails = {
        upiId: req.body.upiId || 'user@bank',
      };
    }

    console.log('Creating payment record with data:', JSON.stringify(paymentData, null, 2));
    const payment = await Payment.create(paymentData);
    console.log('Payment record created successfully:', {
      paymentId: payment._id,
      transactionId: payment.transactionId,
      status: payment.status
    });

    // Return success response with created order data
    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        creatorId: (order as any).creator,
        packageType: (order as any).packageType,
        packagePrice: (order as any).packagePrice,
        platformFee: (order as any).platformFee,
        totalAmount: (order as any).totalAmount,
        paymentMethod: (order as any).paymentMethod,
        specialInstructions: (order as any).specialInstructions,
        message: (order as any).message,
        files: (order as any).files,
        isPaid: (order as any).isPaid,
        paidAt: (order as any).paidAt,
        orderDate: (order as any).createdAt,
        status: (order as any).status,
        paymentId: payment._id,
        transactionId: payment.transactionId
      }
    });

    // Create notification for the creator about new order
    try {
      const creatorNotification = await Notification.create({
        user: creatorObjectId,
        type: 'order',
        message: `New order received from ${user.fullName || user.email} for ${packageType} package`,
        fromUser: user._id,
        isRead: false
      });

      // Emit real-time notification to creator
      const io = getIO();
      io.to(creatorObjectId.toString()).emit('newNotification', {
        notification: {
          ...creatorNotification.toObject(),
          fromUser: {
            _id: user._id,
            fullName: user.fullName || user.email,
            avatar: user.avatar
          }
        }
      });

      console.log('Created notification for creator:', {
        notificationId: creatorNotification._id,
        creatorId: creatorObjectId,
        message: creatorNotification.message
      });
    } catch (notificationError) {
      console.error('Error creating creator notification:', notificationError);
      // Don't fail the order creation if notification fails
    }
  } catch (err) {
    console.error('Error creating order:', err);
    
    // Check for specific error types
    if (err instanceof Error && err.name === 'ValidationError') {
      console.error('Validation error details:', err.message);
      res.status(400);
      throw new Error(`Validation error: ${err.message}`);
    } else if (err instanceof Error && err.name === 'MongoError') {
      console.error('MongoDB error:', err.message);
      res.status(500);
      throw new Error(`Database error: ${err.message}`);
    } else {
      res.status(500);
      throw new Error(`Server error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log(`Finding order by ID: ${req.params.id}`);
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user._id);
    
    // Check if in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log(`Environment: ${isDevelopment ? 'Development' : 'Production'}`);
    
    // Try to find the order first
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      console.log(`Order not found with ID: ${req.params.id}`);
      
      // In development mode, try to find any recent order
      if (isDevelopment) {
        console.log('Development mode: Trying to find any recent order instead');
        
        const anyOrder = await Order.findOne({}).sort({ createdAt: -1 });
        
        if (anyOrder) {
          console.log('Development mode: Found a recent order with ID:', anyOrder._id);
          
          // Populate creator info with all necessary fields
          const populatedOrder = await Order.findById(anyOrder._id)
            .populate('user', 'fullName username email avatar')
            .populate('creator', 'fullName username email avatar role');
          
          console.log('Development mode: Returning a different order as fallback');
          res.json(populatedOrder || anyOrder);
          return;
        } else {
          console.log('Development mode: No orders available in the database');
        }
      }
      
      // If we reach here, no order was found
      res.status(404);
      throw new Error('Order not found');
    }
    
    // Order was found, print it for debugging
    console.log('Found order:', {
      _id: order._id,
      user: (order as any).user,
      creator: (order as any).creator,
      status: (order as any).status,
      totalAmount: (order as any).totalAmount
    });
    
    // In development mode, bypass permissions check
    if (isDevelopment) {
      console.log('Development mode: Bypassing permissions check');
      
      // Populate creator info with all necessary fields
      const populatedOrder = await Order.findById(req.params.id)
        .populate('user', 'fullName username email avatar')
        .populate('creator', 'fullName username email avatar role');
        
      console.log('Development mode: Returning populated order');
      res.json(populatedOrder || order);
      return;
    }
    
    // Check if the order belongs to the user, the user is the creator, or the user is an admin
    const orderDoc = order as any;
    const belongsToUser = orderDoc.user && orderDoc.user.toString() === req.user._id.toString();
    const isCreator = orderDoc.creator && orderDoc.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isBrand = req.user.role === 'brand';
    
    console.log('Order access check:', {
      belongsToUser,
      isCreator, 
      isAdmin,
      isBrand,
      orderUserId: orderDoc.user,
      orderCreatorId: orderDoc.creator,
      requestUserId: req.user._id,
      userRole: req.user.role
    });
    
    if (belongsToUser || isCreator || isAdmin || isBrand) {
      // Populate creator info with all necessary fields for order-confirmation page
      const populatedOrder = await Order.findById(req.params.id)
        .populate('user', 'fullName username email avatar')
        .populate('creator', 'fullName username email avatar role');
        
      console.log('Order found and access allowed');
      res.json(populatedOrder || order);
      return;
    } else {
      console.log('Unauthorized access attempt');
      res.status(403);
      throw new Error('Unauthorized access to order');
    }
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('Error in getOrderById:', error, error && (error as any).stack);
    // Check if this is a casting error (invalid ObjectId)
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400);
      throw new Error('Invalid order ID format');
    }
    // If error was already handled, pass it through
    if (res.statusCode === 404 || res.statusCode === 403) {
      throw error;
    }
    // Default to 500 for other errors
    res.status(500);
    throw new Error('Server error while fetching order: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check if the order belongs to the user or user is an admin
    if ((order as any).user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Unauthorized access to order');
    }

    (order as any).isPaid = true;
    (order as any).paidAt = new Date();
    order.status = 'in_progress';

    const updatedOrder = await order.save();
    console.log('Order updated to paid:', { orderId: updatedOrder._id });
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status to completed/delivered
// @route   PUT /api/orders/:id/complete
// @access  Private/Creator or Admin
export const completeOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Only admin or creator can mark an order as complete
    // In a real app, you'd check if the logged-in user is the creator for this order
    if (req.user.role !== 'admin' && req.user.role !== 'creator') {
      res.status(403);
      throw new Error('Unauthorized access');
    }

    (order as any).isDelivered = true;
    (order as any).deliveryDate = new Date();
    order.status = 'completed';

    const updatedOrder = await order.save();
    console.log('Order completed:', { orderId: updatedOrder._id });
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  console.log(`Retrieved ${orders.length} orders for user ${req.user._id}`);
  res.json(orders);
});

/**
 * @desc    Get all orders for a creator
 * @route   GET /api/orders
 * @access  Private (Creator only)
 */
export const getOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === 'admin') {
      // Admin: return all orders
      const orders = await Order.find({})
        .populate({
          path: 'user',
          select: 'name profilePicture username email',
          model: 'User'
        })
        .populate({
          path: 'client',
          select: 'name fullName profilePicture avatar username email',
          model: 'User'
        })
        .populate({
          path: 'creator',
          select: 'name fullName profilePicture avatar username email',
          model: 'User'
        })
        .sort({ createdAt: -1 });
      res.json({ success: true, count: orders.length, data: orders });
      return;
    }
    console.log('Getting orders for creator:', req.user._id);
    const creatorId = req.user._id;
    
    // Check if the user is a creator
    if (req.user.role !== 'creator') {
      console.log('User is not a creator:', req.user.role);
      res.status(403).json({
        success: false,
        message: 'Only creators can access orders'
      });
      return;
    }
    
    // Fetch orders for creator
    console.log('Fetching orders from database...');
    const orders = await Order.find({ creator: creatorId })
      .populate({
        path: 'user',
        select: 'name profilePicture username',
        model: 'User'
      })
      .populate({
        path: 'client',
        select: 'name fullName profilePicture avatar username', // <-- added avatar
        model: 'User'
      })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders`);
    
    // Get work submissions for these orders
    const orderIds = orders.map(order => order._id);
    const workSubmissions = await WorkSubmission.find({ order: { $in: orderIds } })
      .sort({ createdAt: -1 });
    
    // Create a map of order ID to work submission
    const submissionMap = new Map();
    workSubmissions.forEach(submission => {
      submissionMap.set(submission.order.toString(), submission);
    });
    
    // Format the orders for the response
    const formattedOrders = orders.map(order => {
      const submission = submissionMap.get(order._id.toString());
      const clientUser = order.client as any;
      return {
        _id: order._id,
        orderID: order.orderID,
        brandId: clientUser ? {
          _id: clientUser._id,
          brandName: clientUser.fullName || clientUser.name || 'N/A',
          brandUsername: clientUser.username || 'N/A',
          brandImage: clientUser.profilePicture || clientUser.avatar || null // <-- use avatar as fallback
        } : null,
        date: order.date,
        service: order.service,
        status: order.status,
        amount: order.amount,
        platform: order.platform,
        promotionType: order.promotionType,
        deliveryDate: order.deliveryDate,
        description: order.description,
        clientFeedback: order.clientFeedback,
        deliverables: order.deliverables,
        paymentStatus: order.paymentStatus,
        paymentDate: order.paymentDate,
        statusHistory: order.statusHistory,
        submittedWork: submission ? {
          description: submission.description,
          files: submission.files,
          status: submission.approvalStatus,
          rejectionReason: submission.rejectionReason,
          submittedAt: submission.submissionDate
        } : undefined
      };
    });
    
    res.json({
      success: true,
      count: orders.length,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @desc    Get a single order by ID
 * @route   GET /api/orders/:id
 * @access  Private (Creator only)
 */
export const getOrderByIdCreator = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.user._id;
    const orderId = req.params.id;
    // Check if the user is a creator
    if (req.user.role !== 'creator') {
      res.status(403).json({
        success: false,
        message: 'Only creators can access orders'
      });
      return;
    }
    // Find order by id that belongs to the creator
    const order = await Order.findOne({
      _id: orderId,
      creator: creatorId
    })
      .populate('user', 'name profilePicture username email');
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or not authorized to view'
      });
      return;
    }
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Creator only)
 */
export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const creatorId = req.user._id;
    
    // Check if the user is a creator
    if (req.user.role !== 'creator') {
      res.status(403).json({
        success: false,
        message: 'Only creators can update orders'
      });
      return;
    }
    
    // Check if status is valid
    const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Status must be one of: pending, in-progress, completed, cancelled'
      });
      return;
    }
    
    // Find order by id that belongs to the creator
    const order = await Order.findOne({
      _id: id,
      creator: creatorId
    }).populate('user', 'fullName email avatar');
    
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or not authorized to update'
      });
      return;
    }
    
    const previousStatus = order.status;
    
    // Update order status
    order.status = status;
    order.statusHistory.push({
      status,
      date: new Date()
    });
    
    // If status is completed, update the completion date
    if (status === 'completed') {
      order.completedAt = new Date();
    }
    
    await order.save();
    
    // Create notifications for status change
    try {
      const io = getIO();
      const orderData = order as any;
      
      // Notify client about status change
      if (orderData.user) {
        const clientNotification = await Notification.create({
          user: orderData.user._id,
          type: 'order',
          message: `Your order status has been updated to "${status}"`,
          fromUser: creatorId,
          isRead: false
        });

        // Emit real-time notification to client
        io.to(orderData.user._id.toString()).emit('newNotification', {
          notification: {
            ...clientNotification.toObject(),
            fromUser: {
              _id: creatorId,
              fullName: req.user.fullName || req.user.email,
              avatar: req.user.avatar
            }
          }
        });

        console.log('Created status change notification for client:', {
          notificationId: clientNotification._id,
          clientId: orderData.user._id,
          status: status
        });
      }
      
      // Notify creator about status change (for their own reference)
      const creatorNotification = await Notification.create({
        user: creatorId,
        type: 'order',
        message: `Order status updated to "${status}"`,
        fromUser: creatorId,
        isRead: false
      });

      // Emit real-time notification to creator
      io.to(creatorId.toString()).emit('newNotification', {
        notification: {
          ...creatorNotification.toObject(),
          fromUser: {
            _id: creatorId,
            fullName: req.user.fullName || req.user.email,
            avatar: req.user.avatar
          }
        }
      });

      console.log('Created status change notification for creator:', {
        notificationId: creatorNotification._id,
        creatorId: creatorId,
        status: status
      });
      
    } catch (notificationError) {
      console.error('Error creating status change notifications:', notificationError);
      // Don't fail the status update if notification fails
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

/**
 * @desc    Add client feedback to an order
 * @route   PUT /api/orders/:id/feedback
 * @access  Private (Creator only)
 */
export const addOrderFeedback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { clientFeedback } = req.body;
    const creatorId = req.user._id;
    
    // Check if the user is a creator
    if (req.user.role !== 'creator') {
      res.status(403).json({
        success: false,
        message: 'Only creators can update orders'
      });
      return;
    }
    
    // Validate feedback
    if (!clientFeedback || clientFeedback.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Feedback cannot be empty'
      });
      return;
    }
    
    // Find order by id that belongs to the creator
    const order = await Order.findOne({
      _id: id,
      creator: creatorId
    });
    
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or not authorized to update'
      });
      return;
    }
    
    // Add feedback to order
    order.clientFeedback = clientFeedback;
    order.clientFeedbackDate = new Date();
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order feedback added successfully',
      data: order
    });
  } catch (error) {
    console.error('Error adding order feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding order feedback'
    });
  }
});

// @desc    Get brand's orders
// @route   GET /api/orders/brand
// @access  Private
export const getBrandOrders = asyncHandler(async (req: Request, res: Response) => {
  // Get query parameters
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const statusFilter = req.query.status as string | undefined;
  
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
  
  // Build the filter
  const filter: any = { client: req.user._id };
  
  // Add status filter if provided
  if (statusFilter) {
    filter.status = statusFilter;
  }
  
  console.log(`Getting brand orders with filter:`, filter);
  
  // Get orders created by this user
  const orders = await Order.find(filter)
    .populate('creator', 'name firstName lastName username profileImage avatar email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
  
  // Get total count for pagination
  const total = await Order.countDocuments(filter);
  
  // Format the response data to match expected format in frontend
  const formattedOrders = orders.map(order => {
    // Get creator details
    const creatorData = order.creator as any; // Type casting to access properties
    
    return {
      _id: order._id,
      creatorId: order.creator,
      creatorName: creatorData?.name || (creatorData?.firstName && creatorData?.lastName) ? 
        `${creatorData.firstName} ${creatorData.lastName}` : 'Creator',
      creatorUsername: creatorData?.username || 'creator',
      creatorImage: creatorData?.profileImage || creatorData?.avatar || null,
      creatorEmail: creatorData?.email || null,
      packageName: order.service || 'Package',
      packageType: 'standard', // Default package type since Order model doesn't have packageType
      packagePrice: order.amount,
      platformFee: Math.round(order.amount * 0.05), // Assuming 5% platform fee
      totalAmount: order.totalAmount || order.amount,
      createdAt: order.date, // Use date field from Order model
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      paymentMethod: 'card', // Default payment method since Order model doesn't have paymentMethod
      deliveryDate: order.deliveryDate,
      description: order.description,
      platform: order.platform,
      promotionType: order.promotionType
    };
  });
  
  res.json({
    orders: formattedOrders,
    total,
    page,
    pages: Math.ceil(total / limit)
  });
});

/**
 * @desc    Creator submits work for client approval
 * @route   PUT /api/orders/:orderId/submit-work
 * @access  Private/Creator
 */
export const submitWorkForApproval = asyncHandler(async (req: any, res: any) => {
  try {
    const creatorId = req.user._id;
    const { orderId } = req.params;
    const { description } = req.body;
    const files = req.files as Express.Multer.File[];

    // Find the order
    const order = await Order.findOne({ _id: orderId, creator: creatorId })
      .populate('client', '_id fullName email avatar');

    if (!order) {
      res.status(404);
      throw new Error('Order not found or does not belong to this creator');
    }

    if (order.status !== 'in_progress') {
      res.status(400);
      throw new Error(`Order status is ${order.status}. Work can only be submitted for orders in_progress.`);
    }

    if (!description && (!files || files.length === 0)) {
       res.status(400);
       throw new Error('Please provide a description or upload files.');
    }

    // Upload files to Cloudinary and create file information array
    const fileInfo = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const cloudinaryUrl = await uploadToCloudinary(file, orderId);
          fileInfo.push({
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: cloudinaryUrl // Store Cloudinary URL instead of local path
          });
        } catch (uploadError: any) {
          console.error('Error uploading file to Cloudinary:', uploadError);
          throw new Error(`Failed to upload file ${file.originalname}: ${uploadError.message || 'Unknown error'}`);
        }
      }
    }

    // Create new work submission
    const workSubmission = await WorkSubmission.create({
      order: orderId,
      creator: creatorId,
      client: order.client._id,
      files: fileInfo,
      description: description || '',
      submissionDate: new Date(),
      approvalStatus: 'pending'
    });

    // Update order status
    order.status = 'delivered';
    order.statusHistory.push({
      status: 'delivered',
      date: new Date()
    });

    await order.save();

    // Create notification for client about work submission
    try {
      const orderData = order as any;
      if (orderData.client) {
        const clientNotification = await Notification.create({
          user: orderData.client._id,
          type: 'order',
          message: `Work has been submitted for your order! Please review and approve.`,
          fromUser: creatorId,
          isRead: false
        });

        // Emit real-time notification to client
        const io = getIO();
        io.to(orderData.client._id.toString()).emit('newNotification', {
          notification: {
            ...clientNotification.toObject(),
            fromUser: {
              _id: creatorId,
              fullName: req.user.fullName || req.user.email,
              avatar: req.user.avatar
            }
          }
        });

        console.log('Created work submission notification for client:', {
          notificationId: clientNotification._id,
          clientId: orderData.client._id,
          orderId: orderId
        });
      } else {
        console.log('No client found for order:', orderId);
      }
    } catch (notificationError) {
      console.error('Error creating work submission notification:', notificationError);
      // Don't fail the work submission if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Work submitted for approval successfully!',
      data: {
        workSubmission,
        order
      }
    });
  } catch (error: any) {
    console.error('Error submitting work for approval:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit work for approval',
      message: error.message,
    });
  }
});

// @desc    Create test order for order-confirmation testing
// @route   POST /api/orders/test-order
// @access  Private (For testing only)
export const createTestOrder = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Creating test order for order-confirmation testing');
    
    // Get the current user
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }
    
    // Create a test creator user if it doesn't exist
    let testCreator = await User.findOne({ email: 'testcreator@example.com' });
    if (!testCreator) {
      testCreator = await User.create({
        email: 'testcreator@example.com',
        passwordHash: 'testpassword123',
        fullName: 'Professional Creator',
        username: 'procreator',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        role: 'creator'
      });
      console.log('Created test creator:', testCreator._id);
    }
    
    // Create test order data
    const orderData = {
      user: user._id,
      creator: testCreator._id,
      client: user._id,
      clientName: user.fullName || user.username || 'Test Client',
      service: 'BASIC PROMO',
      amount: 868,
      packageType: 'basic',
      packagePrice: 868,
      platformFee: 43,
      totalAmount: 911,
      paymentMethod: 'card',
      specialInstructions: 'Please ensure the content aligns with our brand guidelines.',
      message: 'Looking forward to working with you on this project!',
      files: [] as string[],
      isPaid: true,
      paidAt: new Date(),
      status: 'pending',
    };
    
    console.log('Creating test order with data:', JSON.stringify(orderData, null, 2));
    
    // Create the order
    const order = await Order.create(orderData);
    
    // Create payment record
    const paymentData = {
      user: user._id,
      order: order._id,
      transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
      amount: 911,
      paymentMethod: 'card',
      status: 'completed',
      paymentDetails: {
        cardLast4: '1234',
        cardBrand: 'Visa'
      }
    };
    
    const payment = await Payment.create(paymentData);
    
    console.log('Test order created successfully:', {
      orderId: order._id,
      creatorId: order.creator,
      paymentId: payment._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Test order created successfully',
      data: {
        orderId: order._id,
        creatorId: order.creator,
        paymentId: payment._id,
        testUrl: `/order-confirmation?orderId=${order._id}&packageType=basic&creatorId=${testCreator.username}&status=success`
      }
    });
    
  } catch (error) {
    console.error('Error creating test order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test order'
    });
  }
});

// @desc    Export brand-creator interactions as CSV
// @route   GET /api/orders/brand-creator-interactions
// @access  Private (admin only recommended)
export const exportBrandCreatorInteractions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ status: 'completed' }).select('client creator');
    const data = orders
      .filter(order => order.client && order.creator)
      .map(order => ({
        brand_id: order.client,
        creator_id: order.creator,
        interaction: 1
      }));
    const fields = ['brand_id', 'creator_id', 'interaction'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('brand_creator_interactions.csv');
    res.send(csv);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to export interactions' });
    return;
  }
});

export default {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  addOrderFeedback,
  getOrderByIdCreator,
  getMyOrders,
  updateOrderToPaid,
  completeOrder,
  getBrandOrders,
  submitWorkForApproval,
  createTestOrder,
  exportBrandCreatorInteractions
}; 