"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const brandDashboardController_1 = require("../controllers/brandDashboardController");
const router = express_1.default.Router();
// Protect all routes
router.use(auth_1.protect);
// Brand routes
router.get('/dashboard-stats', (0, auth_1.authorize)('brand'), brandDashboardController_1.getBrandDashboardStats);
router.post('/test-orders', (0, auth_1.authorize)('brand'), brandDashboardController_1.createTestOrders);
router.post('/dashboard-recommendations', (0, auth_1.authorize)('brand'), brandDashboardController_1.getDashboardRecommendations);
router.get('/dashboard-profiles-you-may-like', (0, auth_1.authorize)('brand'), brandDashboardController_1.getProfilesYouMayLike);
router.get('/dashboard-best-creators', (0, auth_1.authorize)('brand'), brandDashboardController_1.getBestCreatorsForBrand);
exports.default = router;
