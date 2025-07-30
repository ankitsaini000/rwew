import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  subcategories: [subcategorySchema]
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema); 