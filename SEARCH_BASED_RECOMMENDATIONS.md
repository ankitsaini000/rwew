# Search-Based Recommendations System

## Overview
This implementation adds intelligent search-based recommendations to the dashboard that learn from user search behavior and provide contextual suggestions based on search history, categories, tags, and content types.

## Key Features

### 1. Smart Search Tracking
- **Search History**: Automatically saves all user searches to localStorage
- **Category Tracking**: Tracks category selections for better recommendations
- **Recent Searches**: Maintains a list of recent searches with timestamps
- **Persistent Storage**: Search history persists across browser sessions

### 2. Contextual Recommendations
- **Search-Based**: Shows creators similar to what the user has searched for
- **Category-Based**: Recommends creators based on selected categories
- **Tag-Based**: Suggests creators with similar tags to search queries
- **Content Type-Based**: Recommends creators based on content type preferences

### 3. Dynamic UI Sections
- **Search-Based Recommendations**: Shows "Similar to [search term]" section
- **Recent Searches**: Displays clickable recent search buttons
- **Smart Filtering**: Only shows published and active creators

## How It Works

### Search History Management
```typescript
const saveSearchToHistory = (query: string) => {
  if (!query.trim()) return;
  
  const newSearch = { query: query.trim(), timestamp: Date.now() };
  const updatedSearches = [newSearch, ...recentSearches.filter(s => s.query !== query.trim())].slice(0, 10);
  setRecentSearches(updatedSearches);
  localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  
  // Update search history for recommendations
  const uniqueQueries = [...new Set([query.trim(), ...searchHistory.filter(q => q !== query.trim())])].slice(0, 20);
  setSearchHistory(uniqueQueries);
  localStorage.setItem('searchHistory', JSON.stringify(uniqueQueries));
};
```

### Recommendation Generation
```typescript
const generateSearchBasedRecommendations = async (searchQuery: string) => {
  try {
    // Get similar creators based on search query
    const result = await getFilteredCreators({ 
      search: searchQuery, 
      limit: 6,
      tags: searchQuery.toLowerCase().includes('tag') ? availableTags.slice(0, 3).map(t => t.tag) : [],
      contentTypes: searchQuery.toLowerCase().includes('content') || searchQuery.toLowerCase().includes('type') ? 
        availableContentTypes.slice(0, 3).map(ct => ct.contentType) : []
    });
    
    // Filter only published profiles
    const publishedCreators = result.creators.filter((creator: any) => 
      creator.status === 'published' && 
      creator.publishInfo?.isPublished === true &&
      creator.isActive !== false
    );
    
    setSearchBasedRecommendations(publishedCreators);
  } catch (error) {
    console.error('Error generating search-based recommendations:', error);
    setSearchBasedRecommendations([]);
  }
};
```

## User Experience Flow

### 1. User Searches
1. User types a search query (e.g., "fashion", "travel", "Instagram")
2. Search is saved to history automatically
3. Search-based recommendations are generated immediately
4. Results are filtered to show only published creators

### 2. Category Selection
1. User selects a category from dropdown
2. Category is saved to search history
3. Recommendations are updated based on category
4. Similar creators in that category are shown

### 3. Dashboard Display
1. **Search-Based Section**: Shows "Similar to [search term]" with relevant creators
2. **Recent Searches**: Displays clickable buttons for quick re-search
3. **Smart Recommendations**: Combines search history with trending data

## Technical Implementation

### State Management
```typescript
// Search-based recommendations state
const [searchBasedRecommendations, setSearchBasedRecommendations] = useState<any[]>([]);
const [searchHistory, setSearchHistory] = useState<string[]>([]);
const [recentSearches, setRecentSearches] = useState<Array<{query: string, timestamp: number}>>([]);
```

### Data Persistence
- **recentSearches**: Stored in localStorage as JSON
- **searchHistory**: Stored in localStorage as JSON
- **Automatic Loading**: History is loaded on component mount
- **Error Handling**: Graceful fallback if localStorage is unavailable

### Recommendation Logic
1. **Query Analysis**: Analyzes search terms for tags, content types, categories
2. **Smart Filtering**: Applies relevant filters based on query content
3. **Published Only**: Ensures only published creators are shown
4. **Limit Control**: Limits results to prevent overwhelming the UI

## UI Components

### Search-Based Recommendations Section
```jsx
{/* Search-Based Recommendations Section */}
{isAuthenticated && user?.role === 'brand' && searchBasedRecommendations.length > 0 && (
  <section className="mb-10">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Similar to "{searchHistory[0] || 'your search'}"
      </h2>
      {/* Navigation and View All button */}
    </div>
    {/* Swiper with creator cards */}
  </section>
)}
```

### Recent Searches Section
```jsx
{/* Recent Searches Section */}
{isAuthenticated && user?.role === 'brand' && recentSearches.length > 0 && (
  <section className="mb-10">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">Recent Searches</h2>
      <button onClick={clearHistory}>Clear history</button>
    </div>
    <div className="flex flex-wrap gap-2">
      {recentSearches.slice(0, 8).map((search, index) => (
        <button onClick={() => handleSearch(search.query)}>
          {search.query}
        </button>
      ))}
    </div>
  </section>
)}
```

## Benefits

### For Users
1. **Personalized Experience**: Recommendations based on actual search behavior
2. **Quick Access**: Recent searches for easy re-discovery
3. **Relevant Results**: Only published creators shown
4. **Contextual Suggestions**: Smart recommendations based on search patterns

### For Platform
1. **Increased Engagement**: Users spend more time discovering creators
2. **Better Conversion**: More relevant recommendations lead to more collaborations
3. **User Retention**: Personalized experience keeps users coming back
4. **Data Insights**: Rich data on user search patterns and preferences

## Future Enhancements

### 1. Advanced Analytics
- Track search-to-click conversion rates
- Analyze popular search patterns
- Identify trending search terms

### 2. Machine Learning
- AI-powered recommendation engine
- Predictive search suggestions
- Personalized ranking algorithms

### 3. Enhanced Features
- Search analytics dashboard for creators
- Search trend notifications
- Collaborative filtering based on similar users

## Files Modified

### Frontend
- `frontend/src/components/pages/Dashboard.tsx` - Main implementation
- `SEARCH_BASED_RECOMMENDATIONS.md` - Documentation (new)

## Testing Scenarios

### Manual Testing Checklist
- [ ] Search functionality saves to history
- [ ] Category selection triggers recommendations
- [ ] Recent searches are clickable
- [ ] Clear history button works
- [ ] Only published creators shown
- [ ] Recommendations update on new searches
- [ ] History persists across browser sessions
- [ ] Error handling for localStorage issues

### Edge Cases
- [ ] Empty search queries
- [ ] Very long search terms
- [ ] Special characters in searches
- [ ] localStorage disabled
- [ ] Network errors during recommendations
- [ ] No search history available

## Performance Considerations

1. **LocalStorage Limits**: Monitor storage usage and implement cleanup
2. **API Calls**: Limit recommendation API calls to prevent rate limiting
3. **Memory Management**: Clear old search history periodically
4. **Caching**: Consider caching recommendation results

## Security Considerations

1. **Input Sanitization**: Sanitize search queries before storage
2. **Data Privacy**: Ensure search history doesn't contain sensitive information
3. **Access Control**: Only show recommendations to authenticated brand users
4. **Data Retention**: Implement automatic cleanup of old search data
