import 'express-session';

declare module 'express-session' {
  interface SessionData {
    authIntent?: 'brand' | 'creator';
    passport?: {
      user: string;
    };
  }
} 