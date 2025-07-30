import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { MarketingCampaignType } from '../models/MarketingCampaignType';

// @desc    Get all marketing campaign types
// @route   GET /api/marketing-campaign-types
// @access  Public
export const getAllMarketingCampaignTypes = asyncHandler(async (req: Request, res: Response) => {
  const types = await MarketingCampaignType.find();
  res.status(200).json({ success: true, data: types });
});

// @desc    Create a new marketing campaign type
// @route   POST /api/marketing-campaign-types
// @access  Admin
export const createMarketingCampaignType = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Marketing campaign type name is required');
  }
  const type = new MarketingCampaignType({ name });
  await type.save();
  res.status(201).json({ success: true, data: type });
});

// @desc    Update a marketing campaign type
// @route   PUT /api/marketing-campaign-types/:id
// @access  Admin
export const updateMarketingCampaignType = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const type = await MarketingCampaignType.findById(req.params.id);
  if (!type) {
    res.status(404);
    throw new Error('Marketing campaign type not found');
  }
  if (name) type.name = name;
  await type.save();
  res.status(200).json({ success: true, data: type });
});

// @desc    Delete a marketing campaign type
// @route   DELETE /api/marketing-campaign-types/:id
// @access  Admin
export const deleteMarketingCampaignType = asyncHandler(async (req: Request, res: Response) => {
  const type = await MarketingCampaignType.findById(req.params.id);
  if (!type) {
    res.status(404);
    throw new Error('Marketing campaign type not found');
  }
  await type.deleteOne();
  res.status(200).json({ success: true, message: 'Marketing campaign type deleted' });
}); 