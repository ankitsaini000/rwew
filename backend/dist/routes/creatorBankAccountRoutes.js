"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const creatorBankAccountController_1 = require("../controllers/creatorBankAccountController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.protect);
// Get all bank accounts for the authenticated creator
router.get('/', creatorBankAccountController_1.getBankAccounts);
// Create a new bank account
router.post('/', creatorBankAccountController_1.createBankAccount);
// Update a bank account by id
router.put('/:id', creatorBankAccountController_1.updateBankAccount);
// Delete a bank account by id
router.delete('/:id', creatorBankAccountController_1.deleteBankAccount);
// Add a test route to verify route loading
router.get('/test', (req, res) => {
    res.json({ message: 'Bank account route is working!' });
});
exports.default = router;
