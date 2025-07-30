# Influencer Marketplace Backend

This is the backend API for the Influencer Marketplace project.

## Technology Stack

- Node.js
- Express
- TypeScript
- MongoDB
- JSON Web Tokens for authentication

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v14+)
- MongoDB (local install or MongoDB Atlas account)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root of the backend directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/influencer_marketplace
JWT_SECRET=your_secret_key_here
```

Replace `your_secret_key_here` with a secure random string.

## Fixing TypeScript Errors

If you encounter TypeScript errors related to missing type definitions, install them with:

```bash
npm install @types/express @types/mongoose @types/bcrypt @types/jsonwebtoken @types/cors @types/morgan @types/multer @types/node
```

## Running the Project

### Development

```bash
npm run dev
```

This will start the server using nodemon, which will automatically restart when you make changes.

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Users
- POST /api/users - Register a new user
- POST /api/users/login - Login user & get token
- GET /api/users/profile - Get user profile (protected)
- PUT /api/users/profile - Update user profile (protected)

### Creator Profiles
- GET /api/creators - Get all creator profiles (with filtering)
- POST /api/creators - Create a creator profile (protected, creator role)
- GET /api/creators/me - Get logged in user's creator profile (protected)
- PUT /api/creators/me - Update creator profile (protected)
- GET /api/creators/:id - Get creator profile by ID

### Reviews
- POST /api/reviews - Create a new review (protected)
- GET /api/reviews/:creatorId - Get reviews for a creator
- PUT /api/reviews/:id - Update a review (protected)
- DELETE /api/reviews/:id - Delete a review (protected)

### Messages
- POST /api/messages - Send a new message (protected)
- GET /api/messages/conversations - Get user conversations (protected)
- GET /api/messages/:userId - Get conversation between two users (protected)
- PUT /api/messages/:messageId/read - Mark message as read (protected) 