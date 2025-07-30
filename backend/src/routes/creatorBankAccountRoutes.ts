import express from 'express';
import {
  createBankAccount,
  getBankAccounts,
  updateBankAccount,
  deleteBankAccount
} from '../controllers/creatorBankAccountController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all bank accounts for the authenticated creator
router.get('/', getBankAccounts);

// Create a new bank account
router.post('/', createBankAccount);

// Update a bank account by id
router.put('/:id', updateBankAccount);

// Delete a bank account by id
router.delete('/:id', deleteBankAccount);

// Add a test route to verify route loading
router.get('/test', (req, res) => {
  res.json({ message: 'Bank account route is working!' });
});

export default router; 