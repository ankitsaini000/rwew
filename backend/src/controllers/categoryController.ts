import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Category } from '../models/Category';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find();
  res.status(200).json({ success: true, data: categories });
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Admin
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, subcategories } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }
  const category = new Category({ name, subcategories });
  await category.save();
  res.status(201).json({ success: true, data: category });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, subcategories } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  if (name) category.name = name;
  if (subcategories) category.subcategories = subcategories;
  await category.save();
  res.status(200).json({ success: true, data: category });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted' });
}); 