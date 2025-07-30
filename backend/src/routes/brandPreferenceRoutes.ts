import express from 'express';
import {
  createBrandPreference,
  getBrandPreference,
  updateBrandPreference,
  deleteBrandPreference
} from '../controllers/brandPreferenceController';

const router = express.Router();

router.post('/', createBrandPreference);
router.get('/:brandId', getBrandPreference);
router.put('/:brandId', updateBrandPreference);
router.delete('/:brandId', deleteBrandPreference);

export default router; 