"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBankAccount = exports.updateBankAccount = exports.getBankAccounts = exports.createBankAccount = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CreatorBankAccount_1 = __importDefault(require("../models/CreatorBankAccount"));
// Create a new bank account
exports.createBankAccount = (0, express_async_handler_1.default)(async (req, res) => {
    const creatorId = req.user._id;
    const { accountHolderName, bankName, accountNumber, ifscOrSwift, branch, accountType, documentUrl, isDefault } = req.body;
    // If isDefault is true, unset previous default
    if (isDefault) {
        await CreatorBankAccount_1.default.updateMany({ creatorId }, { isDefault: false });
    }
    const bankAccount = await CreatorBankAccount_1.default.create({
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
exports.getBankAccounts = (0, express_async_handler_1.default)(async (req, res) => {
    const creatorId = req.user._id;
    const accounts = await CreatorBankAccount_1.default.find({ creatorId });
    res.json({ success: true, data: accounts });
});
// Update a bank account (by _id)
exports.updateBankAccount = (0, express_async_handler_1.default)(async (req, res) => {
    const creatorId = req.user._id;
    const { id } = req.params;
    const update = req.body;
    // Only allow update if the account belongs to the user
    const account = await CreatorBankAccount_1.default.findOne({ _id: id, creatorId });
    if (!account) {
        res.status(404);
        throw new Error('Bank account not found');
    }
    // If setting as default, unset previous default
    if (update.isDefault) {
        await CreatorBankAccount_1.default.updateMany({ creatorId }, { isDefault: false });
    }
    Object.assign(account, update, { updatedAt: new Date() });
    await account.save();
    res.json({ success: true, data: account });
});
// Delete a bank account (by _id)
exports.deleteBankAccount = (0, express_async_handler_1.default)(async (req, res) => {
    const creatorId = req.user._id;
    const { id } = req.params;
    const account = await CreatorBankAccount_1.default.findOneAndDelete({ _id: id, creatorId });
    if (!account) {
        res.status(404);
        throw new Error('Bank account not found');
    }
    res.json({ success: true, message: 'Bank account deleted' });
});
