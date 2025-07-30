import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import CreatorBankAccount from '../models/CreatorBankAccount';

// Create a new bank account
export const createBankAccount = asyncHandler(async (req: Request, res: Response) => {
  const creatorId = req.user._id;
  const {
    accountHolderName,
    bankName,
    accountNumber,
    ifscOrSwift,
    branch,
    accountType,
    documentUrl,
    isDefault
  } = req.body;

  // If isDefault is true, unset previous default
  if (isDefault) {
    await CreatorBankAccount.updateMany({ creatorId }, { isDefault: false });
  }

  const bankAccount = await CreatorBankAccount.create({
    creatorId,
    accountHolderName,
    bankName,
    accountNumber,
    ifscOrSwift,
    branch,
    accountType,
    documentUrl,
    isDefault: !!isDefault
  });

  res.status(201).json({ success: true, data: bankAccount });
});

// Get all bank accounts for the authenticated creator
export const getBankAccounts = asyncHandler(async (req: Request, res: Response) => {
  const creatorId = req.user._id;
  const accounts = await CreatorBankAccount.find({ creatorId });
  res.json({ success: true, data: accounts });
});

// Update a bank account (by _id)
export const updateBankAccount = asyncHandler(async (req: Request, res: Response) => {
  const creatorId = req.user._id;
  const { id } = req.params;
  const update = req.body;

  // Only allow update if the account belongs to the user
  const account = await CreatorBankAccount.findOne({ _id: id, creatorId });
  if (!account) {
    res.status(404);
    throw new Error('Bank account not found');
  }

  // If setting as default, unset previous default
  if (update.isDefault) {
    await CreatorBankAccount.updateMany({ creatorId }, { isDefault: false });
  }

  Object.assign(account, update, { updatedAt: new Date() });
  await account.save();
  res.json({ success: true, data: account });
});

// Delete a bank account (by _id)
export const deleteBankAccount = asyncHandler(async (req: Request, res: Response) => {
  const creatorId = req.user._id;
  const { id } = req.params;
  const account = await CreatorBankAccount.findOneAndDelete({ _id: id, creatorId });
  if (!account) {
    res.status(404);
    throw new Error('Bank account not found');
  }
  res.json({ success: true, message: 'Bank account deleted' });
}); 