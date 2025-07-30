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
const authMiddleware_1 = require("../middleware/authMiddleware");
const creatorController = __importStar(require("../controllers/creatorController"));
const multer_1 = __importDefault(require("multer"));
const creatorController_1 = require("../controllers/creatorController");
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// Public routes
router.get('/', creatorController.getPublishedCreators);
router.get('/creators', creatorController.getCreators);
router.get('/published', creatorController.getPublishedCreators);
router.post('/similar', creatorController.getSimilarCreators);
router.get('/creators/:username', creatorController.getPublicCreatorProfile);
router.post('/test', creatorController.testCreator);
router.get('/check-username/:username', creatorController.checkUsername);
// Profile creation routes (requires auth)
router.post('/', authMiddleware_1.protect, creatorController.createCreatorProfile);
router.get('/profile-data', authMiddleware_1.protect, creatorController.getProfileData);
router.post('/upgrade-role', authMiddleware_1.protect, creatorController.upgradeToCreator);
// Dashboard route
router.get('/dashboard', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.getCreatorDashboardData);
// Sync metrics route
router.post('/sync-metrics', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.syncCreatorMetrics);
// Creator section update routes (requires creator role)
router.route('/me')
    .get(authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.getMyCreatorProfile)
    .put(authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.updateCreatorProfile);
router.post('/personal-info', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.savePersonalInfo);
router.post('/basic-info', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.saveBasicInfo);
router.post('/professional-info', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.saveProfessionalInfo);
router.post('/description', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.saveDescription);
router.post('/social-info', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.saveSocialInfo);
router.post('/pricing', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.savePricing);
router.post('/requirements', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.saveRequirements);
router.post('/gallery', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.saveGallery);
router.post('/publish', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.publishProfile);
router.put('/publish', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.publishProfile);
router.get('/completion-status', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.getCompletionStatus);
// Admin/Debug routes (should be restricted in production)
router.post('/force-complete', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.forceCompleteProfile);
router.post('/emergency-fix', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['admin']), creatorController.emergencyFixProfile);
router.get('/debug/:userId', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['admin']), creatorController.debugProfileData);
router.post('/test-gallery', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.testGalleryStorage);
router.put('/admin/:username/deactivate', creatorController_1.deactivateCreator);
router.put('/admin/:username/reactivate', creatorController.reactivateCreator);
// Remove protect/authorize for testing
router.get('/admin/suspended', creatorController.getSuspendedCreators);
// Order related routes (requires creator role)
router.post('/orders/:orderId/accept', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['creator']), creatorController.acceptOrder);
router.post('/upload-profile-image', authMiddleware_1.protect, upload.single('profileImage'), creatorController.uploadProfileImage);
router.post('/force-update-completeness', authMiddleware_1.protect, creatorController.forceUpdateCompleteness);
// Add dashboard impression route
router.post('/dashboard-impression', authMiddleware_1.protect, (0, authMiddleware_1.authorize)(['brand', 'creator']), creatorController.dashboardImpression);
exports.default = router;
