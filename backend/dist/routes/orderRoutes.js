"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const orderController_1 = __importDefault(require("../controllers/orderController"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});
// Client routes
router.post('/', auth_1.protect, orderController_1.default.createOrder);
router.post('/test-order', auth_1.protect, orderController_1.default.createTestOrder);
router.get('/myorders', auth_1.protect, orderController_1.default.getMyOrders);
router.get('/brand', auth_1.protect, orderController_1.default.getBrandOrders);
// Creator and Admin routes
router.get('/', auth_1.protect, (0, auth_1.authorize)('creator', 'admin'), orderController_1.default.getOrders);
// Order by ID routes (must be after /myorders to avoid conflict)
router.route('/:id')
    .get(auth_1.protect, (req, res, next) => {
    if (req.user.role === 'creator') {
        return orderController_1.default.getOrderByIdCreator(req, res, next);
    }
    return orderController_1.default.getOrderById(req, res, next);
});
// Order update routes
router.put('/:id/status', auth_1.protect, (0, auth_1.authorize)('creator'), orderController_1.default.updateOrderStatus);
router.put('/:id/feedback', auth_1.protect, (0, auth_1.authorize)('creator'), orderController_1.default.addOrderFeedback);
router.put('/:id/pay', auth_1.protect, orderController_1.default.updateOrderToPaid);
router.put('/:id/complete', auth_1.protect, orderController_1.default.completeOrder);
// Route for creator to submit work for client approval
router.put('/:orderId/submit-work', auth_1.protect, (0, auth_1.authorize)('creator'), upload.array('files', 5), // Allow up to 5 files
orderController_1.default.submitWorkForApproval);
// Export brand-creator interactions (admin only recommended)
router.get('/brand-creator-interactions', auth_1.protect, (0, auth_1.authorize)('admin'), orderController_1.default.exportBrandCreatorInteractions);
exports.default = router;
