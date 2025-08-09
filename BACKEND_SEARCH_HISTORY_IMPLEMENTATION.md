# Backend Search History Implementation

## Overview
This implementation creates a complete backend system for storing and managing user search history, providing analytics, and enabling intelligent recommendations based on search patterns.

## Database Schema

### SearchHistory Model
```typescript
interface ISearchHistory {
  userId: mongoose.Types.ObjectId;        // User who performed the search
  brandId?: mongoose.Types.ObjectId;      // Brand ID if user is a brand
  query: string;                          // Search query
  searchType: 'text' | 'category' | 'tag' | 'contentType';
  filters?: {                             // Applied filters
    category?: string;
    tags?: string[];
    contentTypes?: string[];
    platform?: string;
    priceMin?: number;
    priceMax?: number;
    followersMin?: number;
    followersMax?: number;
  };
  resultsCount?: number;                  // Number of results found
  clickedCreators?: mongoose.Types.ObjectId[]; // Creators clicked from results
  sessionId?: string;                     // Session tracking
  userAgent?: string;                     // Browser info
  ipAddress?: string;                     // IP address
  createdAt: Date;                        // Timestamp
  updatedAt: Date;                        // Last update
}
```

## API Endpoints

### 1. Save Search History
```http
POST /api/search-history
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "fashion creators",
  "searchType": "text",
  "filters": {
    "category": "Fashion",
    "tags": ["lifestyle", "beauty"],
    "priceMin": 1000,
    "priceMax": 5000
  },
  "resultsCount": 25
}
```

### 2. Get Search History
```http
GET /api/search-history?limit=20&page=1&searchType=text
Authorization: Bearer <token>
```

### 3. Get Recent Searches
```http
GET /api/search-history/recent?limit=10
Authorization: Bearer <token>
```

### 4. Get Search Analytics (Brand Only)
```http
GET /api/search-history/analytics?days=30
Authorization: Bearer <token>
```

### 5. Update Search Click
```http
PUT /api/search-history/:id/click
Authorization: Bearer <token>
Content-Type: application/json

{
  "creatorId": "creator_id_here"
}
```

### 6. Clear Search History
```http
DELETE /api/search-history
Authorization: Bearer <token>
```

### 7. Get Search Recommendations
```http
GET /api/search-history/recommendations?limit=5
Authorization: Bearer <token>
```

## Features

### 1. Smart Search Tracking
- **Automatic Storage**: Every search is automatically saved to the database
- **Filter Tracking**: Captures all applied filters (category, tags, price range, etc.)
- **Results Count**: Tracks how many results were found
- **Click Tracking**: Records which creators were clicked from search results

### 2. Analytics & Insights
- **Search Statistics**: Daily/weekly/monthly search patterns
- **Popular Searches**: Most frequently searched terms
- **Search Type Distribution**: Breakdown by text, category, tag, content type
- **Brand Analytics**: Special analytics for brand users

### 3. Intelligent Recommendations
- **Pattern Analysis**: Analyzes user search patterns
- **Query Recommendations**: Suggests similar searches
- **Category Insights**: Identifies preferred categories
- **Tag Preferences**: Tracks popular tags

### 4. Performance Optimizations
- **Database Indexes**: Optimized for fast queries
- **Pagination**: Efficient data loading
- **Selective Fields**: Only fetch necessary data
- **Aggregation Pipelines**: Efficient analytics queries

## Implementation Details

### Database Indexes
```javascript
// Primary indexes for performance
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ brandId: 1, createdAt: -1 });
searchHistorySchema.index({ query: 1, searchType: 1 });
searchHistorySchema.index({ createdAt: -1 });

// Compound index for analytics
searchHistorySchema.index({ userId: 1, searchType: 1, createdAt: -1 });
```

### Analytics Aggregation
```javascript
// Search statistics aggregation
const searchStats = await SearchHistory.aggregate([
  { 
    $match: { 
      brandId: userId,
      createdAt: { $gte: startDate }
    } 
  },
  {
    $group: {
      _id: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        searchType: "$searchType"
      },
      count: { $sum: 1 },
      uniqueQueries: { $addToSet: "$query" }
    }
  },
  {
    $group: {
      _id: "$_id.date",
      totalSearches: { $sum: "$count" },
      searchTypes: {
        $push: {
          type: "$_id.searchType",
          count: "$count",
          uniqueQueries: { $size: "$uniqueQueries" }
        }
      }
    }
  },
  { $sort: { _id: 1 } }
]);
```

### Frontend Integration
```typescript
// Save search to backend
const saveSearchHistory = async (searchData: {
  query: string;
  searchType: 'text' | 'category' | 'tag' | 'contentType';
  filters?: any;
  resultsCount?: number;
}) => {
  const response = await fetch(`${API_BASE_URL}/search-history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(searchData)
  });
  return response.json();
};
```

## Security Features

### 1. Authentication
- All endpoints require valid JWT token
- User-specific data isolation
- Role-based access control

### 2. Data Privacy
- IP address and user agent tracking for analytics
- Session-based tracking
- Automatic data cleanup options

### 3. Input Validation
- Query length limits (500 characters)
- Search type validation
- Filter validation

## Error Handling

### 1. Graceful Degradation
- Frontend fallback to localStorage if backend fails
- Non-blocking search history saving
- Error logging without breaking main functionality

### 2. Error Responses
```javascript
// Standard error response format
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Performance Considerations

### 1. Database Optimization
- Efficient indexes for common queries
- Aggregation pipelines for analytics
- Selective field projection

### 2. Caching Strategy
- Recent searches caching
- Analytics data caching
- Query result caching

### 3. Rate Limiting
- API rate limiting for search endpoints
- Bulk operation limits
- Analytics query limits

## Monitoring & Analytics

### 1. Search Metrics
- Total searches per user/brand
- Search success rates
- Popular search terms
- Search type distribution

### 2. User Behavior
- Click-through rates
- Search refinement patterns
- Session duration
- Search frequency

### 3. System Performance
- API response times
- Database query performance
- Error rates
- Storage usage

## Future Enhancements

### 1. Machine Learning
- AI-powered search suggestions
- Personalized ranking algorithms
- Predictive search patterns
- Recommendation engine

### 2. Advanced Analytics
- Real-time search trends
- Cross-user pattern analysis
- Search conversion tracking
- A/B testing framework

### 3. Enhanced Features
- Search export functionality
- Advanced filtering options
- Search history sharing
- Collaborative filtering

## Files Created/Modified

### Backend Files
- `backend/src/models/SearchHistory.ts` - Database model
- `backend/src/controllers/searchHistoryController.ts` - API controllers
- `backend/src/routes/searchHistoryRoutes.ts` - API routes
- `backend/src/app.ts` - Route registration

### Frontend Files
- `frontend/src/services/api.ts` - API service functions
- `frontend/src/components/pages/Dashboard.tsx` - Dashboard integration
- `frontend/src/app/find-creators/page.tsx` - Search page integration

### Documentation
- `BACKEND_SEARCH_HISTORY_IMPLEMENTATION.md` - This documentation

## Testing

### Manual Testing Checklist
- [ ] Search history saving works
- [ ] Recent searches retrieval works
- [ ] Analytics endpoint works for brands
- [ ] Search click tracking works
- [ ] Clear history functionality works
- [ ] Error handling works properly
- [ ] Authentication works correctly
- [ ] Data persistence works

### API Testing
```bash
# Test search history saving
curl -X POST http://localhost:5001/api/search-history \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"test search","searchType":"text"}'

# Test recent searches
curl -X GET http://localhost:5001/api/search-history/recent \
  -H "Authorization: Bearer <token>"

# Test analytics
curl -X GET http://localhost:5001/api/search-history/analytics \
  -H "Authorization: Bearer <token>"
```

## Deployment Considerations

### 1. Database Migration
- Create SearchHistory collection
- Set up indexes
- Configure backup strategy

### 2. Environment Variables
- Database connection settings
- API rate limiting
- Analytics configuration

### 3. Monitoring Setup
- Error tracking
- Performance monitoring
- Usage analytics

This implementation provides a robust, scalable, and feature-rich search history system that enhances user experience while providing valuable insights for platform optimization.
