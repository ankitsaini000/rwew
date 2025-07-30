import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import EventType from '../models/EventType';

// @desc    Get all event types
// @route   GET /api/event-types
// @access  Public
export const getAllEventTypes = asyncHandler(async (req: Request, res: Response) => {
  const types = await EventType.find();
  res.status(200).json({ success: true, data: types });
});

// @desc    Create a new event type
// @route   POST /api/event-types
// @access  Admin
export const createEventType = asyncHandler(async (req: Request, res: Response) => {
  const { name, code } = req.body;
  if (!name || !code) {
    res.status(400);
    throw new Error('Event type name and code are required');
  }
  const type = new EventType({ name, code });
  await type.save();
  res.status(201).json({ success: true, data: type });
});

// @desc    Update an event type
// @route   PUT /api/event-types/:id
// @access  Admin
export const updateEventType = asyncHandler(async (req: Request, res: Response) => {
  const { name, code } = req.body;
  const type = await EventType.findById(req.params.id);
  if (!type) {
    res.status(404);
    throw new Error('Event type not found');
  }
  if (name) type.name = name;
  if (code) type.code = code;
  await type.save();
  res.status(200).json({ success: true, data: type });
});

// @desc    Delete an event type
// @route   DELETE /api/event-types/:id
// @access  Admin
export const deleteEventType = asyncHandler(async (req: Request, res: Response) => {
  const type = await EventType.findById(req.params.id);
  if (!type) {
    res.status(404);
    throw new Error('Event type not found');
  }
  await type.deleteOne();
  res.status(200).json({ success: true, message: 'Event type deleted' });
}); 