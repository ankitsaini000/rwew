"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminVerificationController_1 = require("../controllers/adminVerificationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/verification-documents', auth_1.protect, adminVerificationController_1.getAllVerificationDocuments);
router.patch('/verification-documents/:id/status', auth_1.protect, adminVerificationController_1.updateVerificationDocumentStatus);
exports.default = router;
