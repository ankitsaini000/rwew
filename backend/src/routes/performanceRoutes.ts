import express from 'express';
import { protect, admin } from '../middleware/auth';
import performanceMonitor from '../services/performanceMonitor';
import { getConnectionStatus, healthCheck } from '../config/database';
import redisClient from '../config/redis';

const router = express.Router();

// @desc    Get performance analytics
// @route   GET /api/performance/analytics
// @access  Private (Admin only)
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    const analytics = performanceMonitor.getAnalytics(timeRange as '1h' | '24h' | '7d');
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get performance analytics',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// @desc    Get system health status
// @route   GET /api/performance/health
// @access  Public
router.get('/health', async (req, res) => {
  try {
    const dbStatus = getConnectionStatus();
    const dbHealth = await healthCheck();
    const redisHealth = await redisClient.exists('health-check');
    
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbHealth ? 'healthy' : 'unhealthy',
        connection: dbStatus,
        ping: dbHealth
      },
      redis: {
        status: redisHealth ? 'healthy' : 'unhealthy',
        connected: redisHealth
      },
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      cpu: {
        usage: process.cpuUsage()
      }
    };

    const overallStatus = dbHealth && redisHealth ? 200 : 503;
    
    res.status(overallStatus).json({
      success: overallStatus === 200,
      data: healthStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get health status',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// @desc    Get real-time performance metrics
// @route   GET /api/performance/metrics
// @access  Private (Admin only)
router.get('/metrics', protect, admin, async (req, res) => {
  try {
    const metrics = performanceMonitor.exportMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// @desc    Clear performance metrics
// @route   DELETE /api/performance/metrics
// @access  Private (Admin only)
router.delete('/metrics', protect, admin, async (req, res) => {
  try {
    // Clear in-memory metrics
    performanceMonitor.clearOldMetrics();
    
    // Clear Redis cache
    await redisClient.invalidatePattern('perf:*');
    
    res.json({
      success: true,
      message: 'Performance metrics cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear performance metrics',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// @desc    Get cache statistics
// @route   GET /api/performance/cache
// @access  Private (Admin only)
router.get('/cache', protect, admin, async (req, res) => {
  try {
    // This would require Redis INFO command implementation
    // For now, return basic cache status
    const cacheStatus = {
      redis: {
        connected: await redisClient.exists('health-check'),
        status: 'operational'
      },
      message: 'Cache statistics require Redis INFO command implementation'
    };
    
    res.json({
      success: true,
      data: cacheStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

// @desc    Flush cache
// @route   POST /api/performance/cache/flush
// @access  Private (Admin only)
router.post('/cache/flush', protect, admin, async (req, res) => {
  try {
    await redisClient.flush();
    
    res.json({
      success: true,
      message: 'Cache flushed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to flush cache',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
    });
  }
});

export default router;
