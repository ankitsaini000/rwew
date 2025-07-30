"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const twilio_1 = __importDefault(require("twilio"));
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
const client = (0, twilio_1.default)(accountSid, authToken);
const sendSMS = async (to, body) => {
    if (process.env.MOCK_SMS === 'true') {
        console.log(`[MOCK SMS] To: ${to} | Body: ${body}`);
        return;
    }
    return client.messages.create({
        body,
        from,
        to,
    });
};
exports.sendSMS = sendSMS;
