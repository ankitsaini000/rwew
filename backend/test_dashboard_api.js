/**
 * Test script for creator dashboard API endpoints
 * Run this with: node test_dashboard_api.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5001';
const TEST_TOKEN = 'Bearer YOUR_TEST_TOKEN'; // Replace with a valid JWT token for a creator user

// Helper function for API calls
async function callApi(endpoint, method = 'GET', data = null) {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Authorization': TEST_TOKEN,
        'Content-Type': 'application/json'
      },
      data
    });
    return response.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.response?.data || error.message);
    return null;
  }
}

// Test functions
async function testGetDashboardData() {
  console.log('Testing GET /api/creator-dashboard');
  const response = await callApi('/api/creator-dashboard');
  if (response?.success) {
    console.log('✅ Dashboard data retrieved successfully');
    console.log('Data sample:', JSON.stringify(response.data?.metrics, null, 2));
  } else {
    console.log('❌ Failed to retrieve dashboard data');
  }
}

async function testUpdateMetrics() {
  console.log('\nTesting PUT /api/creator-dashboard/metrics');
  const response = await callApi('/api/creator-dashboard/metrics', 'PUT', {
    followers: 5000,
    responseRate: 95
  });
  if (response?.success) {
    console.log('✅ Metrics updated successfully');
    console.log('Updated metrics:', JSON.stringify(response.data, null, 2));
  } else {
    console.log('❌ Failed to update metrics');
  }
}

async function testUpdatePerformanceData() {
  console.log('\nTesting PUT /api/creator-dashboard/performance');
  const response = await callApi('/api/creator-dashboard/performance', 'PUT', {
    views: [250, 300, 350, 400, 450, 400, 350],
    likes: [50, 60, 70, 80, 90, 80, 70],
    messages: [10, 15, 20, 25, 30, 25, 20],
    earnings: [500, 600, 700, 800, 900, 800, 700]
  });
  if (response?.success) {
    console.log('✅ Performance data updated successfully');
    console.log('Performance data dates:', response.data?.dates);
  } else {
    console.log('❌ Failed to update performance data');
  }
}

// Run tests
async function runTests() {
  console.log('🧪 CREATOR DASHBOARD API TESTS');
  console.log('==============================');
  
  await testGetDashboardData();
  await testUpdateMetrics();
  await testUpdatePerformanceData();
  
  console.log('\n✅ Tests completed');
}

runTests().catch(console.error); 