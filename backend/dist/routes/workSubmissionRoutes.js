"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const workSubmissionController_1 = require("../controllers/workSubmissionController");
const router = express_1.default.Router();
// Protect all routes
router.use(auth_1.protect);
// Brand routes
router.get('/brand', (0, auth_1.authorize)('brand'), workSubmissionController_1.getBrandSubmissions);
router.put('/:submissionId/status', (0, auth_1.authorize)('brand'), workSubmissionController_1.updateSubmissionStatus);
router.post('/:submissionId/release-payment', (0, auth_1.authorize)('brand'), workSubmissionController_1.releasePayment);
// Admin route
router.get('/admin/all', auth_1.protect, workSubmissionController_1.getAllWorkSubmissionsAdmin);
// Single work submission by ID
router.get('/:id', auth_1.protect, workSubmissionController_1.getWorkSubmissionById);
exports.default = router;
