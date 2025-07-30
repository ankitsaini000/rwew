"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = void 0;
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgzcfva4b',
    api_key: process.env.CLOUDINARY_API_KEY || '324744317225964',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'mY31tPtm4lWqz33zLKK8b_JhH2w'
});
/**
 * Upload a file to Cloudinary
 * @param file The file to upload
 * @param path The path/folder to store the file in
 * @returns The URL of the uploaded file
 */
const uploadFile = async (file, path) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: path,
            resource_type: 'auto',
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
            }
            else {
                // Return the secure URL from Cloudinary
                resolve(result.secure_url);
            }
        });
        // Convert buffer to stream and upload
        const bufferStream = new (require('stream').Readable)();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
    });
};
exports.uploadFile = uploadFile;
/**
 * Delete a file from Cloudinary
 * @param publicId The public ID of the file to delete
 */
const deleteFile = async (publicId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};
exports.deleteFile = deleteFile;
