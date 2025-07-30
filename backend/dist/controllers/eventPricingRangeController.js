"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventPricingRange = exports.updateEventPricingRange = exports.createEventPricingRange = exports.getAllEventPricingRanges = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const EventPricingRange_1 = __importDefault(require("../models/EventPricingRange"));
// @desc    Get all event pricing ranges
// @route   GET /api/event-pricing-ranges
// @access  Public
exports.getAllEventPricingRanges = (0, express_async_handler_1.default)(async (req, res) => {
    const ranges = await EventPricingRange_1.default.find();
    res.status(200).json({ success: true, data: ranges });
});
// @desc    Create a new event pricing range
// @route   POST /api/event-pricing-ranges
// @access  Admin
exports.createEventPricingRange = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, code, min, max } = req.body;
    if (!name || !code) {
        res.status(400);
        throw new Error('Event pricing range name and code are required');
    }
    const range = new EventPricingRange_1.default({ name, code, min, max });
    await range.save();
    res.status(201).json({ success: true, data: range });
});
// @desc    Update an event pricing range
// @route   PUT /api/event-pricing-ranges/:id
// @access  Admin
exports.updateEventPricingRange = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, code, min, max } = req.body;
    const range = await EventPricingRange_1.default.findById(req.params.id);
    if (!range) {
        res.status(404);
        throw new Error('Event pricing range not found');
    }
    if (name)
        range.name = name;
    if (code)
        range.code = code;
    if (min !== undefined)
        range.min = min;
    if (max !== undefined)
        range.max = max;
    await range.save();
    res.status(200).json({ success: true, data: range });
});
// @desc    Delete an event pricing range
// @route   DELETE /api/event-pricing-ranges/:id
// @access  Admin
exports.deleteEventPricingRange = (0, express_async_handler_1.default)(async (req, res) => {
    const range = await EventPricingRange_1.default.findById(req.params.id);
    if (!range) {
        res.status(404);
        throw new Error('Event pricing range not found');
    }
    await range.deleteOne();
    res.status(200).json({ success: true, message: 'Event pricing range deleted' });
});
