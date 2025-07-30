"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAnyRole = exports.hasRole = exports.getAuthUserId = void 0;
/**
 * Gets the authenticated user ID from the request
 * Throws an error if user is not authenticated
 */
const getAuthUserId = (req) => {
    if (!req.user || !req.user._id) {
        throw new Error('User not authenticated');
    }
    return req.user._id.toString();
};
exports.getAuthUserId = getAuthUserId;
/**
 * Returns true if the user has the specified role
 * Returns false if user is not authenticated or doesn't have the role
 */
const hasRole = (req, role) => {
    var _a;
    return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === role;
};
exports.hasRole = hasRole;
/**
 * Checks if the user has any of the specified roles
 * Returns false if user is not authenticated or doesn't have any of the roles
 */
const hasAnyRole = (req, roles) => {
    if (!req.user || !req.user.role)
        return false;
    return roles.includes(req.user.role);
};
exports.hasAnyRole = hasAnyRole;
