"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
// Not Found Error Handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
// General Error Handler
const errorHandler = (err, req, res, next) => {
    // Set status code (use the response status code if already set, otherwise 500)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    // Set response status
    res.status(statusCode);
    // Send JSON response with error message and stack trace in development
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};
exports.errorHandler = errorHandler;
