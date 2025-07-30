"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventPricingRangeController_1 = require("../controllers/eventPricingRangeController");
const router = express_1.default.Router();
router.get('/', eventPricingRangeController_1.getAllEventPricingRanges);
router.post('/', eventPricingRangeController_1.createEventPricingRange);
router.put('/:id', eventPricingRangeController_1.updateEventPricingRange);
router.delete('/:id', eventPricingRangeController_1.deleteEventPricingRange);
exports.default = router;
