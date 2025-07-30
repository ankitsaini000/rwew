import express from 'express';
import {
  getAllMarketingCampaignTypes,
  createMarketingCampaignType,
  updateMarketingCampaignType,
  deleteMarketingCampaignType
} from '../controllers/marketingCampaignTypeController';

const router = express.Router();

router.get('/', getAllMarketingCampaignTypes);
router.post('/', createMarketingCampaignType);
router.put('/:id', updateMarketingCampaignType);
router.delete('/:id', deleteMarketingCampaignType);

export default router; 