"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventType = exports.updateEventType = exports.createEventType = exports.getAllEventTypes = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const EventType_1 = __importDefault(require("../models/EventType"));
// @desc    Get all event types
// @route   GET /api/event-types
// @access  Public
exports.getAllEventTypes = (0, express_async_handler_1.default)(async (req, res) => {
    const types = await EventType_1.default.find();
    res.status(200).json({ success: true, data: types });
});
// @desc    Create a new event type
// @route   POST /api/event-types
// @access  Admin
exports.createEventType = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, code } = req.body;
    if (!name || !code) {
        res.status(400);
        throw new Error('Event type name and code are required');
    }
    const type = new EventType_1.default({ name, code });
    await type.save();
    res.status(201).json({ success: true, data: type });
});
// @desc    Update an event type
// @route   PUT /api/event-types/:id
// @access  Admin
exports.updateEventType = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, code } = req.body;
    const type = await EventType_1.default.findById(req.params.id);
    if (!type) {
        res.status(404);
        throw new Error('Event type not found');
    }
    if (name)
        type.name = name;
    if (code)
        type.code = code;
    await type.save();
    res.status(200).json({ success: true, data: type });
});
// @desc    Delete an event type
// @route   DELETE /api/event-types/:id
// @access  Admin
exports.deleteEventType = (0, express_async_handler_1.default)(async (req, res) => {
    const type = await EventType_1.default.findById(req.params.id);
    if (!type) {
        res.status(404);
        throw new Error('Event type not found');
    }
    await type.deleteOne();
    res.status(200).json({ success: true, message: 'Event type deleted' });
});
