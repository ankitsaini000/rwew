import redisClient from '../config/redis';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface DatabaseMetrics {
  operation: string;
  collection: string;
  executionTime: number;
  documentsProcessed: number;
  timestamp: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private dbMetrics: DatabaseMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics in memory

  // Track API endpoint performance
  trackEndpoint(metrics: Omit<PerformanceMetrics, 'timestamp'>) {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: new Date()
    };

    this.metrics.push(fullMetrics);

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Store in Redis for persistence
    this.storeMetricsInRedis(fullMetrics);

    // Log slow requests
    if (fullMetrics.responseTime > 1000) {
      console.warn(`Slow endpoint detected: ${fullMetrics.method} ${fullMetrics.endpoint} took ${fullMetrics.responseTime}ms`);
    }
  }

  // Track database operation performance
  trackDatabaseOperation(metrics: Omit<DatabaseMetrics, 'timestamp'>) {
    const fullMetrics: DatabaseMetrics = {
      ...metrics,
      timestamp: new Date()
    };

    this.dbMetrics.push(fullMetrics);

    // Keep only the last maxMetrics
    if (this.dbMetrics.length > this.maxMetrics) {
      this.dbMetrics = this.dbMetrics.slice(-this.maxMetrics);
    }

    // Log slow database operations
    if (fullMetrics.executionTime > 500) {
      console.warn(`Slow DB operation: ${fullMetrics.operation} on ${fullMetrics.collection} took ${fullMetrics.executionTime}ms`);
    }
  }

  // Get performance analytics
  getAnalytics(timeRange: '1h' | '24h' | '7d' = '24h') {
    const now = new Date();
    let cutoffTime: Date;

    switch (timeRange) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    const recentDbMetrics = this.dbMetrics.filter(m => m.timestamp >= cutoffTime);

    // Calculate endpoint performance
    const endpointStats = this.calculateEndpointStats(recentMetrics);
    const slowEndpoints = this.getSlowEndpoints(recentMetrics);
    const errorRates = this.calculateErrorRates(recentMetrics);

    // Calculate database performance
    const dbStats = this.calculateDatabaseStats(recentDbMetrics);
    const slowDbOperations = this.getSlowDbOperations(recentDbMetrics);

    return {
      timeRange,
      totalRequests: recentMetrics.length,
      totalDbOperations: recentDbMetrics.length,
      averageResponseTime: this.calculateAverage(recentMetrics.map(m => m.responseTime)),
      averageDbTime: this.calculateAverage(recentDbMetrics.map(m => m.executionTime)),
      endpointStats,
      slowEndpoints,
      errorRates,
      dbStats,
      slowDbOperations,
      recommendations: this.generateRecommendations(endpointStats, dbStats, errorRates)
    };
  }

  // Calculate endpoint statistics
  private calculateEndpointStats(metrics: PerformanceMetrics[]) {
    const endpointMap = new Map<string, { count: number; totalTime: number; minTime: number; maxTime: number }>();

    metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = endpointMap.get(key) || { count: 0, totalTime: 0, minTime: Infinity, maxTime: 0 };

      endpointMap.set(key, {
        count: existing.count + 1,
        totalTime: existing.totalTime + metric.responseTime,
        minTime: Math.min(existing.minTime, metric.responseTime),
        maxTime: Math.max(existing.maxTime, metric.responseTime)
      });
    });

    const stats: any[] = [];
    endpointMap.forEach((value, key) => {
      stats.push({
        endpoint: key,
        count: value.count,
        averageTime: value.totalTime / value.count,
        minTime: value.minTime,
        maxTime: value.maxTime
      });
    });

    return stats.sort((a, b) => b.count - a.count); // Sort by request count
  }

  // Get slow endpoints
  private getSlowEndpoints(metrics: PerformanceMetrics[]) {
    return metrics
      .filter(m => m.responseTime > 1000)
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 10);
  }

  // Calculate error rates
  private calculateErrorRates(metrics: PerformanceMetrics[]) {
    const total = metrics.length;
    const errors = metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = total > 0 ? (errors / total) * 100 : 0;

    return {
      total,
      errors,
      errorRate: errorRate.toFixed(2),
      statusCodeBreakdown: this.getStatusCodeBreakdown(metrics)
    };
  }

  // Get status code breakdown
  private getStatusCodeBreakdown(metrics: PerformanceMetrics[]) {
    const breakdown: { [key: number]: number } = {};
    metrics.forEach(m => {
      breakdown[m.statusCode] = (breakdown[m.statusCode] || 0) + 1;
    });
    return breakdown;
  }

  // Calculate database statistics
  private calculateDatabaseStats(metrics: DatabaseMetrics[]) {
    const collectionMap = new Map<string, { count: number; totalTime: number; totalDocs: number }>();

    metrics.forEach(metric => {
      const existing = collectionMap.get(metric.collection) || { count: 0, totalTime: 0, totalDocs: 0 };

      collectionMap.set(metric.collection, {
        count: existing.count + 1,
        totalTime: existing.totalTime + metric.executionTime,
        totalDocs: existing.totalDocs + metric.documentsProcessed
      });
    });

    const stats: any[] = [];
    collectionMap.forEach((value, collection) => {
      stats.push({
        collection,
        count: value.count,
        averageTime: value.totalTime / value.count,
        totalDocs: value.totalDocs,
        averageDocsPerOp: value.totalDocs / value.count
      });
    });

    return stats.sort((a, b) => b.count - a.count);
  }

  // Get slow database operations
  private getSlowDbOperations(metrics: DatabaseMetrics[]) {
    return metrics
      .filter(m => m.executionTime > 500)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);
  }

  // Calculate average
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Generate performance recommendations
  private generateRecommendations(endpointStats: any[], dbStats: any[], errorRates: any) {
    const recommendations: string[] = [];

    // Endpoint recommendations
    const slowEndpoints = endpointStats.filter(s => s.averageTime > 500);
    if (slowEndpoints.length > 0) {
      recommendations.push(`Consider optimizing ${slowEndpoints.length} slow endpoints`);
    }

    // Database recommendations
    const slowDbOps = dbStats.filter(s => s.averageTime > 200);
    if (slowDbOps.length > 0) {
      recommendations.push(`Consider adding indexes to ${slowDbOps.length} slow collections`);
    }

    // Error rate recommendations
    if (parseFloat(errorRates.errorRate) > 5) {
      recommendations.push('Error rate is high, investigate failing endpoints');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Performance is good, continue monitoring');
    }

    return recommendations;
  }

  // Store metrics in Redis for persistence
  private async storeMetricsInRedis(metrics: PerformanceMetrics) {
    try {
      const key = `perf:${metrics.timestamp.getTime()}`;
      await redisClient.set(key, metrics, 86400); // Store for 24 hours
    } catch (error) {
      console.error('Failed to store metrics in Redis:', error);
    }
  }

  // Clear old metrics
  clearOldMetrics() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp >= oneWeekAgo);
    this.dbMetrics = this.dbMetrics.filter(m => m.timestamp >= oneWeekAgo);
  }

  // Export metrics for external monitoring
  exportMetrics() {
    return {
      api: this.metrics,
      database: this.dbMetrics,
      summary: this.getAnalytics('24h')
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Clean up old metrics every hour
setInterval(() => {
  performanceMonitor.clearOldMetrics();
}, 60 * 60 * 1000);

export default performanceMonitor;
