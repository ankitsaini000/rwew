import { Request, Response, NextFunction } from 'express';

declare module 'express-async-handler' {
  function expressAsyncHandler<P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
    handler: (
      req: Request<P, ResBody, ReqBody, ReqQuery>,
      res: Response,
      next: NextFunction
    ) => Promise<any> | any
  ): (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response,
    next: NextFunction
  ) => void;

  export = expressAsyncHandler;
} 