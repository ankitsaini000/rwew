import express from 'express';
import { protect } from '../middleware/auth';
import * as likeController from '../controllers/likeController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Like and get all likes routes
router.route('/')
  .post(likeController.likeCreator)
  .get(likeController.getLikedCreators);

// Check if liked and unlike routes
router.route('/:creatorId')
  .get(likeController.checkIfLiked)
  .delete(likeController.unlikeCreator);

export default router; 