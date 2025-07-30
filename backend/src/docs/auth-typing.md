# Authentication and TypeScript

This document explains how to properly handle authentication and user information in Express with TypeScript.

## Type Definitions

The Express `Request` object is extended with a `user` property, which can be accessed in route handlers after authentication middleware has been applied:

```typescript
// This is automatically defined in src/types/express.d.ts
declare global {
  namespace Express {
    interface User extends IUser {}
    
    interface Request {
      user?: User;
    }
  }
}
```

## Best Practices for Handling req.user

Since `req.user` is optional (it may be undefined if the user is not authenticated), you should always handle it safely:

### Pattern 1: Using utility functions

Use the utility functions in `src/utils/auth.ts`:

```typescript
import { getAuthUserId, hasRole } from '../utils/auth';

// In your controller
const userId = getAuthUserId(req); // This will throw if user is not authenticated
const isAdmin = hasRole(req, 'admin');
```

### Pattern 2: Early validation

Check for user authentication at the beginning of your function:

```typescript
if (!req.user) {
  res.status(401);
  throw new Error('User not authenticated');
}

// Safe to use req.user after this point
const { _id, role, email } = req.user;
```

### Pattern 3: Optional chaining

Use optional chaining to safely access properties:

```typescript
const userId = req.user?._id?.toString();
const userRole = req.user?.role || 'unknown';
```

## Authentication Middleware

The `protect` middleware in `src/middleware/auth.ts` or `src/middleware/authMiddleware.ts` sets `req.user` when a valid JWT token is provided.

### Role-Based Authorization

Use the `authorize` middleware to restrict routes to specific roles:

```typescript
import { protect, authorize } from '../middleware/auth';

// Route accessible only to admins
router.get('/admin-only', protect, authorize('admin'), adminController.getAdminData);

// Route accessible to admins and creators
router.get('/creator-data', protect, authorize('admin', 'creator'), creatorController.getData);
```

## Example Usage

See `src/controllers/demoAuthController.ts` for complete examples of proper `req.user` handling patterns. 