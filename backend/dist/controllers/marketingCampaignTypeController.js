"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMarketingCampaignType = exports.updateMarketingCampaignType = exports.createMarketingCampaignType = exports.getAllMarketingCampaignTypes = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const MarketingCampaignType_1 = require("../models/MarketingCampaignType");
// @desc    Get all marketing campaign types
// @route   GET /api/marketing-campaign-types
// @access  Public
exports.getAllMarketingCampaignTypes = (0, express_async_handler_1.default)(async (req, res) => {
    const types = await MarketingCampaignType_1.MarketingCampaignType.find();
    res.status(200).json({ success: true, data: types });
});
// @desc    Create a new marketing campaign type
// @route   POST /api/marketing-campaign-types
// @access  Admin
exports.createMarketingCampaignType = (0, express_async_handler_1.default)(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Marketing campaign type name is required');
    }
    const type = new MarketingCampaignType_1.MarketingCampaignType({ name });
    await type.save();
    res.status(201).json({ success: true, data: type });
});
// @desc    Update a marketing campaign type
// @route   PUT /api/marketing-campaign-types/:id
// @access  Admin
exports.updateMarketingCampaignType = (0, express_async_handler_1.default)(async (req, res) => {
    const { name } = req.body;
    const type = await MarketingCampaignType_1.MarketingCampaignType.findById(req.params.id);
    if (!type) {
        res.status(404);
        throw new Error('Marketing campaign type not found');
    }
    if (name)
        type.name = name;
    await type.save();
    res.status(200).json({ success: true, data: type });
});
// @desc    Delete a marketing campaign type
// @route   DELETE /api/marketing-campaign-types/:id
// @access  Admin
exports.deleteMarketingCampaignType = (0, express_async_handler_1.default)(async (req, res) => {
    const type = await MarketingCampaignType_1.MarketingCampaignType.findById(req.params.id);
    if (!type) {
        res.status(404);
        throw new Error('Marketing campaign type not found');
    }
    await type.deleteOne();
    res.status(200).json({ success: true, message: 'Marketing campaign type deleted' });
});
