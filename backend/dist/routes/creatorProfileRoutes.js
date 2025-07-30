"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CreatorProfile_1 = require("../models/CreatorProfile");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET /api/creator-profile/follower-counts
router.get('/follower-counts', auth_1.isAuthenticated, async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const userId = req.user._id;
        const profile = await CreatorProfile_1.CreatorProfile.findOne({ userId });
        if (!profile || !profile.socialMedia || !profile.socialMedia.socialProfiles) {
            return res.json({ success: true, data: {} });
        }
        const sp = profile.socialMedia.socialProfiles;
        res.json({
            success: true,
            data: {
                instagram: ((_a = sp.instagram) === null || _a === void 0 ? void 0 : _a.followers) || 0,
                youtube: ((_b = sp.youtube) === null || _b === void 0 ? void 0 : _b.subscribers) || 0,
                twitter: ((_c = sp.twitter) === null || _c === void 0 ? void 0 : _c.followers) || 0,
                facebook: ((_d = sp.facebook) === null || _d === void 0 ? void 0 : _d.followers) || 0,
                linkedin: ((_e = sp.linkedin) === null || _e === void 0 ? void 0 : _e.connections) || 0
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
