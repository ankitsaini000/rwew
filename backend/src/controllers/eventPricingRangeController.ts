import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import EventPricingRange from '../models/EventPricingRange';

// @desc    Get all event pricing ranges
// @route   GET /api/event-pricing-ranges
// @access  Public
export const getAllEventPricingRanges = asyncHandler(async (req: Request, res: Response) => {
  const ranges = await EventPricingRange.find();
  res.status(200).json({ success: true, data: ranges });
});

// @desc    Create a new event pricing range
// @route   POST /api/event-pricing-ranges
// @access  Admin
export const createEventPricingRange = asyncHandler(async (req: Request, res: Response) => {
  const { name, code, min, max } = req.body;
  if (!name || !code) {
    res.status(400);
    throw new Error('Event pricing range name and code are required');
  }
  const range = new EventPricingRange({ name, code, min, max });
  await range.save();
  res.status(201).json({ success: true, data: range });
});

// @desc    Update an event pricing range
// @route   PUT /api/event-pricing-ranges/:id
// @access  Admin
export const updateEventPricingRange = asyncHandler(async (req: Request, res: Response) => {
  const { name, code, min, max } = req.body;
  const range = await EventPricingRange.findById(req.params.id);
  if (!range) {
    res.status(404);
    throw new Error('Event pricing range not found');
  }
  if (name) range.name = name;
  if (code) range.code = code;
  if (min !== undefined) range.min = min;
  if (max !== undefined) range.max = max;
  await range.save();
  res.status(200).json({ success: true, data: range });
});

// @desc    Delete an event pricing range
// @route   DELETE /api/event-pricing-ranges/:id
// @access  Admin
export const deleteEventPricingRange = asyncHandler(async (req: Request, res: Response) => {
  const range = await EventPricingRange.findById(req.params.id);
  if (!range) {
    res.status(404);
    throw new Error('Event pricing range not found');
  }
  await range.deleteOne();
  res.status(200).json({ success: true, message: 'Event pricing range deleted' });
}); 