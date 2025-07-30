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
Object.defineProperty(exports, "__esModule", { value: true });
// Use require syntax to avoid TypeScript import issues
const express = require('express');
const auth_1 = require("../middleware/auth");
const creatorDashboardController = __importStar(require("../controllers/creatorDashboardController"));
const router = express.Router();
// Add a test route that doesn't require authorization for debugging
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Creator dashboard routes are working' });
});
// Apply protection middleware to all protected routes
router.use(auth_1.protect);
router.use((0, auth_1.authorize)('creator'));
// Dashboard routes
router.get('/', creatorDashboardController.getDashboardData);
router.put('/metrics', creatorDashboardController.updateCreatorMetrics);
router.put('/performance', creatorDashboardController.updatePerformanceData);
// New specific dashboard endpoints
router.get('/metrics', creatorDashboardController.getDashboardMetrics);
router.get('/social-metrics', creatorDashboardController.getSocialMetrics);
router.post('/test-response-data', creatorDashboardController.createTestResponseData);
// Log registered routes
console.log('Creator Dashboard Routes:');
router.stack.forEach((r) => {
    if (r.route) {
        console.log(`${Object.keys(r.route.methods).join(',')} /api/creator-dashboard${r.route.path}`);
    }
});
exports.default = router;
