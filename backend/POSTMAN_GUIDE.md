# Testing APIs with Postman

This guide will help you test all the backend APIs using Postman.

## Setup

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create a new collection named "Influencer Marketplace API"

## Authentication

Most of the API endpoints require authentication. After registering or logging in, you'll receive a token that needs to be included in protected requests:

1. In Postman, after a successful login/register, copy the token from the response
2. For protected endpoints, add a header:
   - Key: `Authorization`
   - Value: `Bearer your_token_here`

## API Endpoints to Test

### User APIs

#### Register a User
- **URL**: `http://localhost:5000/api/users`
- **Method**: `POST`
- **Body** (JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }
  ```

#### Login
- **URL**: `http://localhost:5000/api/users/login`
- **Method**: `POST`
- **Body** (JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

#### Get User Profile
- **URL**: `http://localhost:5000/api/users/profile`
- **Method**: `GET`
- **Headers**: Include the Authorization header with your token

#### Update User Profile
- **URL**: `http://localhost:5000/api/users/profile`
- **Method**: `PUT`
- **Headers**: Include the Authorization header with your token
- **Body** (JSON):
  ```json
  {
    "fullName": "Updated Name",
    "avatar": "https://example.com/avatar.jpg"
  }
  ```

### Creator Profile APIs

#### Create Creator Profile
- **URL**: `http://localhost:5000/api/creators`
- **Method**: `POST`
- **Headers**: Include the Authorization header with your token
- **Body** (JSON):
  ```json
  {
    "overview": {
      "title": "Professional Photographer",
      "category": "Photography",
      "subcategory": "Product Photography"
    },
    "pricing": {
      "basic": 50,
      "standard": 100,
      "premium": 200
    },
    "description": "I specialize in product photography with over 5 years of experience...",
    "requirements": ["Product details", "Specific requirements"],
    "gallery": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "social": {
      "instagram": "https://instagram.com/username",
      "website": "https://myportfolio.com"
    }
  }
  ```

#### Get All Creator Profiles
- **URL**: `http://localhost:5000/api/creators`
- **Method**: `GET`
- **Query Parameters** (optional):
  - `page`: Page number (default: 1)
  - `category`: Filter by category
  - `subcategory`: Filter by subcategory
  - `search`: Search by title

#### Get Creator Profile by ID
- **URL**: `http://localhost:5000/api/creators/:id`
- **Method**: `GET`
- **URL Parameter**: Replace `:id` with the actual creator profile ID

#### Get My Creator Profile
- **URL**: `http://localhost:5000/api/creators/me`
- **Method**: `GET`
- **Headers**: Include the Authorization header with your token

#### Update Creator Profile
- **URL**: `http://localhost:5000/api/creators/me`
- **Method**: `PUT`
- **Headers**: Include the Authorization header with your token
- **Body** (JSON):
  ```json
  {
    "overview": {
      "title": "Updated Title"
    },
    "status": "published"
  }
  ```

### Reviews APIs

#### Create a Review
- **URL**: `http://localhost:5000/api/reviews`
- **Method**: `POST`
- **Headers**: Include the Authorization header with your token
- **Body** (JSON):
  ```json
  {
    "creatorId": "creator_profile_id_here",
    "rating": 5,
    "comment": "Excellent work! Very professional and timely delivery."
  }
  ```

#### Get Reviews for a Creator
- **URL**: `http://localhost:5000/api/reviews/:creatorId`
- **Method**: `GET`
- **URL Parameter**: Replace `:creatorId` with the actual creator profile ID

#### Update a Review
- **URL**: `http://localhost:5000/api/reviews/:id`
- **Method**: `PUT`
- **Headers**: Include the Authorization header with your token
- **URL Parameter**: Replace `:id` with the actual review ID
- **Body** (JSON):
  ```json
  {
    "rating": 4,
    "comment": "Updated review comment"
  }
  ```

#### Delete a Review
- **URL**: `http://localhost:5000/api/reviews/:id`
- **Method**: `DELETE`
- **Headers**: Include the Authorization header with your token
- **URL Parameter**: Replace `:id` with the actual review ID

### Messages APIs

#### Send a Message
- **URL**: `http://localhost:5000/api/messages`
- **Method**: `POST`
- **Headers**: Include the Authorization header with your token
- **Body** (JSON):
  ```json
  {
    "receiverId": "user_id_here",
    "content": "Hello, I'm interested in your services!"
  }
  ```

#### Get Conversations
- **URL**: `http://localhost:5000/api/messages/conversations`
- **Method**: `GET`
- **Headers**: Include the Authorization header with your token

#### Get Conversation with a User
- **URL**: `http://localhost:5000/api/messages/:userId`
- **Method**: `GET`
- **Headers**: Include the Authorization header with your token
- **URL Parameter**: Replace `:userId` with the user ID you're conversing with

#### Mark Message as Read
- **URL**: `http://localhost:5000/api/messages/:messageId/read`
- **Method**: `PUT`
- **Headers**: Include the Authorization header with your token
- **URL Parameter**: Replace `:messageId` with the actual message ID

## Testing Flow

To test the complete flow:

1. Register a user
2. Login to get the token
3. Update the user to have a "creator" role (you might need to do this directly in the database for now)
4. Create a creator profile
5. Register another user
6. Login with the second user
7. Browse creator profiles
8. Leave a review for a creator
9. Send messages between users
10. Test the conversation functionality

## Troubleshooting

- If you receive a 401 error, make sure your token is valid and correctly formatted in the Authorization header
- If you receive a 403 error when creating a creator profile, ensure the user has the "creator" role
- MongoDB connection issues can be resolved by checking your MongoDB URI in the .env file 