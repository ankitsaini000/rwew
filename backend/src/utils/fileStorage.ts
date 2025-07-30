import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
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
export const uploadFile = async (file: Express.Multer.File, path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: path,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          // Return the secure URL from Cloudinary
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to stream and upload
    const bufferStream = new (require('stream').Readable)();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param publicId The public ID of the file to delete
 */
export const deleteFile = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}; 