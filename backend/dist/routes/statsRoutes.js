"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const CreatorProfile_1 = require("../models/CreatorProfile");
const BrandProfile_1 = __importDefault(require("../models/BrandProfile"));
const router = express_1.default.Router();
// Helper to get monthly counts for a model
async function getMonthlyCounts(model, dateField = 'createdAt') {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const count = await model.countDocuments({
            [dateField]: { $gte: start, $lt: end }
        });
        months.push({ month: start.toLocaleString('default', { month: 'short' }), value: count });
    }
    return months;
}
router.get('/active-users/monthly', async (req, res) => {
    // You may want to filter for isActive: true, or use login logs if you have them
    const data = await getMonthlyCounts(User_1.default);
    res.json({ data });
});
router.get('/creators/monthly', async (req, res) => {
    const data = await getMonthlyCounts(CreatorProfile_1.CreatorProfile);
    res.json({ data });
});
router.get('/brands/monthly', async (req, res) => {
    const data = await getMonthlyCounts(BrandProfile_1.default);
    res.json({ data });
});
exports.default = router;
