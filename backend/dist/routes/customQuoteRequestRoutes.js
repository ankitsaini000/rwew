"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customQuoteRequestController_1 = __importDefault(require("../controllers/customQuoteRequestController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Create a new quote request (brand only)
router.post('/', authMiddleware_1.protect, customQuoteRequestController_1.default.createCustomQuoteRequest);
// Get all quote requests for the currently logged-in creator
router.get('/creator', authMiddleware_1.protect, customQuoteRequestController_1.default.getRequestsForCurrentCreator);
// Get all quote requests for a creator
router.get('/creator/:creatorId', authMiddleware_1.protect, customQuoteRequestController_1.default.getRequestsForCreator);
// Get all custom quote requests made by a specific brand
router.get('/brand/:brandId', authMiddleware_1.protect, customQuoteRequestController_1.default.getRequestsByBrand);
// Get all custom quote requests for a brand by username
router.get('/brand-username/:username', authMiddleware_1.protect, customQuoteRequestController_1.default.getRequestsByBrandUsername);
// Get all quote requests (admin only)
router.get('/admin/all', authMiddleware_1.protect, customQuoteRequestController_1.default.getAllQuoteRequestsAdmin);
// Get a single custom quote request by ID
router.get('/:requestId', authMiddleware_1.protect, customQuoteRequestController_1.default.getCustomQuoteRequestById);
// Update the status of a custom quote request (creator only)
router.patch('/:requestId/status', authMiddleware_1.protect, customQuoteRequestController_1.default.updateRequestStatus);
// Accept a quote request (creator only)
router.post('/:requestId/accept', authMiddleware_1.protect, customQuoteRequestController_1.default.acceptQuoteRequest);
// Reject a quote request (creator only)
router.post('/:requestId/reject', authMiddleware_1.protect, customQuoteRequestController_1.default.rejectQuoteRequest);
exports.default = router;
