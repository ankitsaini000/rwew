"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const authIntent_1 = require("../middleware/authIntent");
const router = express_1.default.Router();
// Facebook Auth Routes - Generic login
router.get('/facebook', authController_1.facebookLogin);
// Facebook Auth for specific registration paths
router.get('/facebook/brand', (0, authIntent_1.trackAuthIntent)('brand'), authController_1.facebookLogin);
router.get('/facebook/creator', (0, authIntent_1.trackAuthIntent)('creator'), authController_1.facebookLogin);
// Facebook callback handler
router.get('/facebook/callback', passport_1.default.authenticate('facebook', { failureRedirect: '/login' }), authController_1.facebookCallback);
exports.default = router;
