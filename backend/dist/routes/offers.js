"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const offerController_1 = require("../controllers/offerController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create a new offer
router.post('/', auth_1.protect, offerController_1.createOffer);
// Get offers for a specific conversation
router.get('/conversation/:conversationId', auth_1.protect, offerController_1.getOffersByConversation);
// Get user's offers (sent and received)
router.get('/user', auth_1.protect, offerController_1.getUserOffers);
// Get a specific offer by ID
router.get('/:offerId', auth_1.protect, offerController_1.getOfferById);
// Accept an offer
router.patch('/:offerId/accept', auth_1.protect, offerController_1.acceptOffer);
// Reject an offer
router.patch('/:offerId/reject', auth_1.protect, offerController_1.rejectOffer);
// Counter an offer
router.patch('/:offerId/counter', auth_1.protect, offerController_1.counterOffer);
exports.default = router;
