const fetch = require('node-fetch');

async function testSearchHistory() {
  const baseUrl = 'http://localhost:5001';
  
  console.log('🧪 Testing Search History Backend Implementation...\n');

  // Test 1: Save search history
  console.log('Test 1: Save search history');
  try {
    const saveResponse = await fetch(`${baseUrl}/api/search-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token_here' // Replace with actual token
      },
      body: JSON.stringify({
        query: 'fashion creators',
        searchType: 'text',
        filters: {
          category: 'Fashion',
          tags: ['lifestyle', 'beauty'],
          priceMin: 1000,
          priceMax: 5000
        },
        resultsCount: 25
      })
    });

    if (saveResponse.ok) {
      const saveData = await saveResponse.json();
      console.log('✅ Search history saved successfully:', saveData.message || 'Success');
    } else {
      const errorData = await saveResponse.json();
      console.log('❌ Save search history failed:', errorData.message);
    }
  } catch (error) {
    console.log('❌ Save search history error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Get recent searches
  console.log('Test 2: Get recent searches');
  try {
    const recentResponse = await fetch(`${baseUrl}/api/search-history/recent?limit=5`, {
      headers: {
        'Authorization': 'Bearer test_token_here' // Replace with actual token
      }
    });

    if (recentResponse.ok) {
      const recentData = await recentResponse.json();
      console.log('✅ Recent searches retrieved successfully');
      console.log('📊 Found', recentData.data?.length || 0, 'recent searches');
    } else {
      const errorData = await recentResponse.json();
      console.log('❌ Get recent searches failed:', errorData.message);
    }
  } catch (error) {
    console.log('❌ Get recent searches error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Get search analytics
  console.log('Test 3: Get search analytics');
  try {
    const analyticsResponse = await fetch(`${baseUrl}/api/search-history/analytics?days=30`, {
      headers: {
        'Authorization': 'Bearer test_token_here' // Replace with actual token
      }
    });

    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Search analytics retrieved successfully');
      console.log('📈 Total searches:', analyticsData.data?.totalSearches || 0);
    } else {
      const errorData = await analyticsResponse.json();
      console.log('❌ Get search analytics failed:', errorData.message);
    }
  } catch (error) {
    console.log('❌ Get search analytics error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Get search recommendations
  console.log('Test 4: Get search recommendations');
  try {
    const recommendationsResponse = await fetch(`${baseUrl}/api/search-history/recommendations?limit=3`, {
      headers: {
        'Authorization': 'Bearer test_token_here' // Replace with actual token
      }
    });

    if (recommendationsResponse.ok) {
      const recommendationsData = await recommendationsResponse.json();
      console.log('✅ Search recommendations retrieved successfully');
      console.log('💡 Found', recommendationsData.data?.length || 0, 'recommendation types');
    } else {
      const errorData = await recommendationsResponse.json();
      console.log('❌ Get search recommendations failed:', errorData.message);
    }
  } catch (error) {
    console.log('❌ Get search recommendations error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Clear search history
  console.log('Test 5: Clear search history');
  try {
    const clearResponse = await fetch(`${baseUrl}/api/search-history`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer test_token_here' // Replace with actual token
      }
    });

    if (clearResponse.ok) {
      const clearData = await clearResponse.json();
      console.log('✅ Search history cleared successfully:', clearData.message);
    } else {
      const errorData = await clearResponse.json();
      console.log('❌ Clear search history failed:', errorData.message);
    }
  } catch (error) {
    console.log('❌ Clear search history error:', error.message);
  }

  console.log('\n🎉 Search History Backend Testing Complete!');
  console.log('\n📝 Note: Replace "test_token_here" with actual JWT token for full testing');
}

// Run the test
testSearchHistory().catch(console.error);
