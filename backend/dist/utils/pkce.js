"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeVerifier = generateCodeVerifier;
exports.generateCodeChallenge = generateCodeChallenge;
exports.storeCodeVerifier = storeCodeVerifier;
exports.getCodeVerifier = getCodeVerifier;
const crypto_1 = __importDefault(require("crypto"));
function generateCodeVerifier(length = 64) {
    return crypto_1.default.randomBytes(length).toString('base64url').slice(0, length);
}
function generateCodeChallenge(codeVerifier) {
    return crypto_1.default.createHash('sha256').update(codeVerifier).digest('base64url');
}
// Store code verifier in session
function storeCodeVerifier(session, codeVerifier) {
    session.pkceCodeVerifier = codeVerifier;
}
// Retrieve code verifier from session
function getCodeVerifier(session) {
    return session.pkceCodeVerifier;
}
