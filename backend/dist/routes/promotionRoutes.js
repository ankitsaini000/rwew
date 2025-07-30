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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const promotionController = __importStar(require("../controllers/promotionController"));
const router = express_1.default.Router();
// Public routes (no auth required)
router.get('/', promotionController.getPromotions);
router.get('/:id', promotionController.getPromotionById);
// Protected routes (requires authentication)
router.use(auth_1.protect);
// Brand-specific routes
router.post('/', (0, auth_1.authorize)('brand'), promotionController.createPromotion);
router.get('/brand/all', (0, auth_1.authorize)('brand'), promotionController.getBrandPromotions);
// Routes requiring ownership verification (handled in the controller)
router.route('/:id')
    .put((0, auth_1.authorize)('brand'), promotionController.updatePromotion)
    .delete((0, auth_1.authorize)('brand'), promotionController.deletePromotion);
router.put('/:id/publish', (0, auth_1.authorize)('brand'), promotionController.publishPromotion);
// Admin routes
router.get('/admin/check-deadlines', (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const result = await promotionController.checkAndUpdatePromotionStatuses();
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in deadline check route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check promotion deadlines'
        });
    }
});
exports.default = router;
