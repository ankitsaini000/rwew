"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brandPreferenceController_1 = require("../controllers/brandPreferenceController");
const router = express_1.default.Router();
router.post('/', brandPreferenceController_1.createBrandPreference);
router.get('/:brandId', brandPreferenceController_1.getBrandPreference);
router.put('/:brandId', brandPreferenceController_1.updateBrandPreference);
router.delete('/:brandId', brandPreferenceController_1.deleteBrandPreference);
exports.default = router;
