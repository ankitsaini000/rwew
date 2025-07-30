import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import * as creatorController from '../controllers/creatorController';
import multer from 'multer';
import { deactivateCreator } from '../controllers/creatorController';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Public routes
router.get('/', creatorController.getPublishedCreators);
router.get('/creators', creatorController.getCreators);
router.get('/published', creatorController.getPublishedCreators);
router.post('/similar', creatorController.getSimilarCreators);
router.get('/creators/:username', creatorController.getPublicCreatorProfile);
router.post('/test', creatorController.testCreator);
router.get('/check-username/:username', creatorController.checkUsername);

// Profile creation routes (requires auth)
router.post('/', protect, creatorController.createCreatorProfile);
router.get('/profile-data', protect, creatorController.getProfileData);
router.post('/upgrade-role', protect, creatorController.upgradeToCreator);

// Dashboard route
router.get('/dashboard', protect, authorize(['creator']), creatorController.getCreatorDashboardData);

// Sync metrics route
router.post('/sync-metrics', protect, authorize(['creator']), creatorController.syncCreatorMetrics);

// Creator section update routes (requires creator role)
router.route('/me')
  .get(protect, authorize(['creator']), creatorController.getMyCreatorProfile)
  .put(protect, authorize(['creator']), creatorController.updateCreatorProfile);

router.post('/personal-info', protect, authorize(['creator']), creatorController.savePersonalInfo);
router.post('/basic-info', protect, authorize(['creator']), creatorController.saveBasicInfo);
router.post('/professional-info', protect, authorize(['creator']), creatorController.saveProfessionalInfo);
router.post('/description', protect, authorize(['creator']), creatorController.saveDescription);
router.post('/social-info', protect, authorize(['creator']), creatorController.saveSocialInfo);
router.post('/pricing', protect, authorize(['creator']), creatorController.savePricing);
router.post('/requirements', protect, authorize(['creator']), creatorController.saveRequirements);
router.post('/gallery', protect, authorize(['creator']), creatorController.saveGallery);
router.post('/publish', protect, authorize(['creator']), creatorController.publishProfile);
router.put('/publish', protect, authorize(['creator']), creatorController.publishProfile);
router.get('/completion-status', protect, authorize(['creator']), creatorController.getCompletionStatus);

// Admin/Debug routes (should be restricted in production)
router.post('/force-complete', protect, authorize(['creator']), creatorController.forceCompleteProfile);
router.post('/emergency-fix', protect, authorize(['admin']), creatorController.emergencyFixProfile);
router.get('/debug/:userId', protect, authorize(['admin']), creatorController.debugProfileData);
router.post('/test-gallery', protect, authorize(['creator']), creatorController.testGalleryStorage);
router.put('/admin/:username/deactivate', deactivateCreator);
router.put('/admin/:username/reactivate', creatorController.reactivateCreator);
// Remove protect/authorize for testing
router.get('/admin/suspended', creatorController.getSuspendedCreators);

// Order related routes (requires creator role)
router.post('/orders/:orderId/accept', protect, authorize(['creator']), creatorController.acceptOrder);

router.post('/upload-profile-image', protect, upload.single('profileImage'), creatorController.uploadProfileImage);
router.post('/force-update-completeness', protect, creatorController.forceUpdateCompleteness);

// Add dashboard impression route
router.post('/dashboard-impression', protect, authorize(['brand', 'creator']), creatorController.dashboardImpression);

export default router;