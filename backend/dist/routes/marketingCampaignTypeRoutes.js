"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const marketingCampaignTypeController_1 = require("../controllers/marketingCampaignTypeController");
const router = express_1.default.Router();
router.get('/', marketingCampaignTypeController_1.getAllMarketingCampaignTypes);
router.post('/', marketingCampaignTypeController_1.createMarketingCampaignType);
router.put('/:id', marketingCampaignTypeController_1.updateMarketingCampaignType);
router.delete('/:id', marketingCampaignTypeController_1.deleteMarketingCampaignType);
exports.default = router;
