import { Request, Response, NextFunction } from 'express';

// Not Found Error Handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General Error Handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
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