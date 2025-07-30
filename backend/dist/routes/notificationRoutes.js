"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.protect);
// GET /api/notifications - Get all notifications for user
router.get('/', notificationController_1.getNotifications);
// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', notificationController_1.markAsRead);
// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', notificationController_1.markAllAsRead);
// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', notificationController_1.getUnreadCount);
exports.default = router;
