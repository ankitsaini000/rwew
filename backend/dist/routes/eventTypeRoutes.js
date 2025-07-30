"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventTypeController_1 = require("../controllers/eventTypeController");
const router = express_1.default.Router();
router.get('/', eventTypeController_1.getAllEventTypes);
router.post('/', eventTypeController_1.createEventType);
router.put('/:id', eventTypeController_1.updateEventType);
router.delete('/:id', eventTypeController_1.deleteEventType);
exports.default = router;
