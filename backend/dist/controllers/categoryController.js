"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Category_1 = require("../models/Category");
// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = (0, express_async_handler_1.default)(async (req, res) => {
    const categories = await Category_1.Category.find();
    res.status(200).json({ success: true, data: categories });
});
// @desc    Create a new category
// @route   POST /api/categories
// @access  Admin
exports.createCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, subcategories } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Category name is required');
    }
    const category = new Category_1.Category({ name, subcategories });
    await category.save();
    res.status(201).json({ success: true, data: category });
});
// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, subcategories } = req.body;
    const category = await Category_1.Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    if (name)
        category.name = name;
    if (subcategories)
        category.subcategories = subcategories;
    await category.save();
    res.status(200).json({ success: true, data: category });
});
// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const category = await Category_1.Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted' });
});
