import { Request, Response } from 'express';
import BrandPreference from '../models/BrandPreference';

export const createBrandPreference = async (req: Request, res: Response) => {
  try {
    const { brandId, ...data } = req.body;
    const existing = await BrandPreference.findOne({ brandId });
    if (existing) {
      return res.status(400).json({ message: 'Preference already exists for this brand.' });
    }
    const preference = new BrandPreference({ brandId, ...data });
    await preference.save();
    res.status(201).json(preference);
  } catch (error) {
    res.status(500).json({ message: 'Error creating brand preference', error });
  }
};

export const getBrandPreference = async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const preference = await BrandPreference.findOne({ brandId });
    if (!preference) {
      // Return 404 so frontend can catch this and show popup
      return res.status(404).json({ message: 'No preferences found' });
    }
    res.json(preference);
  } catch (error) {
    // Return 500 error so frontend can catch this and show popup
    res.status(500).json({ message: 'Error fetching brand preference', error });
  }
};

export const updateBrandPreference = async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const update = req.body;
    const preference = await BrandPreference.findOneAndUpdate(
      { brandId },
      update,
      { new: true, runValidators: true }
    );
    if (!preference) {
      return res.status(404).json({ message: 'Preference not found' });
    }
    res.json(preference);
  } catch (error) {
    res.status(500).json({ message: 'Error updating brand preference', error });
  }
};

export const deleteBrandPreference = async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const result = await BrandPreference.findOneAndDelete({ brandId });
    if (!result) {
      return res.status(404).json({ message: 'Preference not found' });
    }
    res.json({ message: 'Preference deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting brand preference', error });
  }
};