import express from 'express';
import { protect, authorize } from '../middleware/auth';
import orderController from '../controllers/orderController';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Client routes
router.post('/', protect, orderController.createOrder);
router.post('/test-order', protect, orderController.createTestOrder);
router.get('/myorders', protect, orderController.getMyOrders);
router.get('/brand', protect, orderController.getBrandOrders);

// Creator and Admin routes
router.get('/', protect, authorize('creator', 'admin'), orderController.getOrders);

// Order by ID routes (must be after /myorders to avoid conflict)
router.route('/:id')
  .get(protect, (req, res, next) => {
    if (req.user.role === 'creator') {
      return orderController.getOrderByIdCreator(req, res, next);
    }
    return orderController.getOrderById(req, res, next);
  });

// Order update routes
router.put('/:id/status', protect, authorize('creator'), orderController.updateOrderStatus);
router.put('/:id/feedback', protect, authorize('creator'), orderController.addOrderFeedback);
router.put('/:id/pay', protect, orderController.updateOrderToPaid);
router.put('/:id/complete', protect, orderController.completeOrder);

// Route for creator to submit work for client approval
router.put(
  '/:orderId/submit-work',
  protect,
  authorize('creator'),
  upload.array('files', 5), // Allow up to 5 files
  orderController.submitWorkForApproval
);

// Export brand-creator interactions (admin only recommended)
router.get('/brand-creator-interactions', protect, authorize('admin'), orderController.exportBrandCreatorInteractions);

export default router; 