"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const cloudinaryUpload_1 = __importDefault(require("../middleware/cloudinaryUpload"));
const router = express_1.default.Router();
// @desc    Upload a single file
// @route   POST /api/upload/single
// @access  Private
router.post('/single', auth_1.protect, cloudinaryUpload_1.default.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }
    try {
        // The file is already uploaded to Cloudinary by the middleware
        // We can access the Cloudinary URL from req.file.path
        res.status(200).json({
            success: true,
            data: {
                fileName: req.file.originalname,
                fileUrl: req.file.path, // This is the Cloudinary URL
                fileType: req.file.mimetype,
                size: req.file.size
            }
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// @desc    Upload multiple files (max 5)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', auth_1.protect, cloudinaryUpload_1.default.array('files', 5), async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No files uploaded'
        });
    }
    try {
        // Files are already uploaded to Cloudinary by the middleware
        const fileData = files.map(file => ({
            fileName: file.originalname,
            fileUrl: file.path, // This is the Cloudinary URL
            fileType: file.mimetype,
            size: file.size
        }));
        res.status(200).json({
            success: true,
            count: files.length,
            data: fileData
        });
    }
    catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading files',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// @desc    Upload gallery files (up to 10 images and 3 videos)
// @route   POST /api/upload/gallery
// @access  Private
router.post('/gallery', auth_1.protect, async (req, res) => {
    const galleryUpload = cloudinaryUpload_1.default.fields([
        { name: 'images', maxCount: 10 },
        { name: 'videos', maxCount: 3 }
    ]);
    galleryUpload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }
        try {
            // Files are already uploaded to Cloudinary by the middleware
            const response = { success: true };
            if (files.images) {
                response.images = files.images.map(file => file.path); // These are Cloudinary URLs
            }
            if (files.videos) {
                response.videos = files.videos.map(file => file.path); // These are Cloudinary URLs
            }
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Gallery upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading gallery files',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});
exports.default = router;
