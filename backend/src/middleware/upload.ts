import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgzcfva4b',
  api_key: process.env.CLOUDINARY_API_KEY || '324744317225964',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mY31tPtm4lWqz33zLKK8b_JhH2w'
});

// Create Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary as any,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    format: 'jpg',
    secure: true, // Ensure HTTPS URLs
    resource_type: 'auto' // Automatically detect resource type
  } as any
});

// File filter to allow only certain file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images and videos
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|mov|avi|mkv/;
  
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (file.mimetype.startsWith('image/') && allowedImageTypes.test(ext)) {
    return cb(null, true);
  } else if (file.mimetype.startsWith('video/') && allowedVideoTypes.test(ext)) {
    return cb(null, true);
  } else {
    return cb(new Error('Only image and video files are allowed!'));
  }
};

// Initialize multer upload with Cloudinary storage
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter,
});

export default upload; 