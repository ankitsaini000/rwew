"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgzcfva4b',
    api_key: process.env.CLOUDINARY_API_KEY || '324744317225964',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'mY31tPtm4lWqz33zLKK8b_JhH2w'
});
// Create Cloudinary storage engine
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        format: 'jpg',
        secure: true, // Ensure HTTPS URLs
        resource_type: 'auto' // Automatically detect resource type
    }
});
// Initialize multer upload with Cloudinary storage
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    }
});
exports.default = upload;
