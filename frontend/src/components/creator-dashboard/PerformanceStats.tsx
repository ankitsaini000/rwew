'use client';

import React, { useState } from 'react';
// @ts-ignore - Ignore recharts import errors
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerformanceData {
  views: number[];
  likes: number[];
  messages: number[];
  earnings: number[];
  dates?: string[];
}

interface PerformanceStatsProps {
  performanceData?: PerformanceData;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ performanceData = {
  views: [],
  likes: [],
  messages: [],
  earnings: [],
  dates: []
} }) => {
  const [activeMetric, setActiveMetric] = useState<'views' | 'likes' | 'messages' | 'earnings'>('views');
  const metrics = [
    { id: 'views', name: 'Profile Views', color: '#3b82f6' },
    { id: 'likes', name: 'Likes', color: '#ec4899' },
    { id: 'messages', name: 'Messages', color: '#8b5cf6' },
    { id: 'earnings', name: 'Earnings ($)', color: '#10b981' }
  ];

  // Initialize arrays with default values if undefined
  const safePerformanceData = {
    views: performanceData?.views || [],
    likes: performanceData?.likes || [],
    messages: performanceData?.messages || [],
    earnings: performanceData?.earnings || [],
    dates: performanceData?.dates || []
  };

  // Ensure all arrays have the same length
  const maxLength = Math.max(
    safePerformanceData.views.length,
    safePerformanceData.likes.length,
    safePerformanceData.messages.length,
    safePerformanceData.earnings.length
  );

  // Generate dates if not provided or if length doesn't match
  const dates = safePerformanceData.dates.length === maxLength 
    ? safePerformanceData.dates 
    : Array.from({ length: maxLength }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (maxLength - i - 1));
        return d.toISOString().split('T')[0];
      });

  // Format data for the chart
  let chartData;
  if (activeMetric === 'earnings') {
    // Use only the dates that match the earnings array
    const earningsDates = dates.slice(0, safePerformanceData.earnings.length);
    // Convert cumulative to daily values
    const dailyValues = safePerformanceData.earnings.map((val, idx, arr) =>
      idx === 0 ? val : val - arr[idx - 1]
    );
    // Plot every entry (no grouping)
    chartData = earningsDates.map((date, idx) => ({
      date: date.split('T')[0],
      earnings: dailyValues[idx]
    }));
  } else if (activeMetric === 'views') {
    // Convert cumulative to daily values
    const dailyValues = safePerformanceData.views.map((val, idx, arr) =>
      idx === 0 ? val : val - arr[idx - 1]
    );
    // Group by date (sum all values for the same date)
    const dateValueMap: { [key: string]: number } = {};
    dates.forEach((date, idx) => {
      const day = date.split('T')[0];
      dateValueMap[day] = (dateValueMap[day] || 0) + dailyValues[idx];
    });
    chartData = Object.entries(dateValueMap).map(([day, value]) => ({
      date: day,
      views: value
    }));
  } else {
    chartData = dates.map((date, index) => ({
      date,
      [activeMetric]: safePerformanceData[activeMetric][index] || 0
    }));
  }

  // Calculate statistics
  const getStats = (data: number[]) => {
    if (!data.length) return { total: 0, avg: 0, max: 0, change: 0 };
    const total = data.reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);
    const avg = data.length ? Math.round(total / data.length) : 0;
    const max = data.length ? Math.max(...data.map(v => isNaN(v) ? 0 : v)) : 0;
    let change = 0;
    if (data.length >= 14) {
      const firstWeek = data.slice(0, 7).reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);
      const lastWeek = data.slice(-7).reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);
      change = firstWeek > 0 ? Math.round((lastWeek - firstWeek) / firstWeek * 100) : 0;
    } else if (data.length > 1) {
      const first = isNaN(data[0]) ? 0 : data[0];
      const last = isNaN(data[data.length - 1]) ? 0 : data[data.length - 1];
      change = first > 0 ? Math.round((last - first) / first * 100) : 0;
    }
    return { total: isNaN(total) ? 0 : total, avg: isNaN(avg) ? 0 : avg, max: isNaN(max) ? 0 : max, change: isNaN(change) ? 0 : change };
  };

  // Use daily values for earnings stats
  let earningsStatsData = safePerformanceData.earnings;
  if (safePerformanceData.earnings && safePerformanceData.earnings.length > 0) {
    earningsStatsData = safePerformanceData.earnings.map((val, idx, arr) =>
      idx === 0 ? val : val - arr[idx - 1]
    );
  }

  const stats = {
    views: getStats(safePerformanceData.views),
    likes: getStats(safePerformanceData.likes),
    messages: getStats(safePerformanceData.messages),
    earnings: getStats(earningsStatsData)
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Stats</h3>
          
          <div className="flex mt-4 md:mt-0 space-x-1 bg-gray-100 p-1 rounded-lg">
            {metrics.map(metric => (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  activeMetric === metric.id
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {metric.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">
              {activeMetric === 'views'
                ? (safePerformanceData.views.length > 0 && !isNaN(safePerformanceData.views[safePerformanceData.views.length - 1]) ? safePerformanceData.views[safePerformanceData.views.length - 1] : 0)
                : (activeMetric === 'earnings' ? `$${isNaN(stats[activeMetric].total) ? 0 : stats[activeMetric].total}` : (isNaN(stats[activeMetric].total) ? 0 : stats[activeMetric].total))
              }
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Average</p>
            <p className="text-xl font-bold text-gray-900">
              {activeMetric === 'earnings' ? `$${isNaN(stats[activeMetric].avg) ? 0 : stats[activeMetric].avg}` : (isNaN(stats[activeMetric].avg) ? 0 : stats[activeMetric].avg)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Peak</p>
            <p className="text-xl font-bold text-gray-900">
              {activeMetric === 'earnings' ? `$${isNaN(stats[activeMetric].max) ? 0 : stats[activeMetric].max}` : (isNaN(stats[activeMetric].max) ? 0 : stats[activeMetric].max)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Change</p>
            <p className={`text-xl font-bold ${stats[activeMetric].change > 0 ? 'text-green-600' : stats[activeMetric].change < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {stats[activeMetric].change > 0 ? '+' : ''}{isNaN(stats[activeMetric].change) ? 0 : stats[activeMetric].change}%
            </p>
          </div>
        </div>
        
        <div className="h-80">
          {/* @ts-ignore - Suppressing TypeScript errors for Recharts components */}
          <ResponsiveContainer width="100%" height="100%">
            {/* @ts-ignore */}
            <LineChart 
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              {/* @ts-ignore */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              {/* @ts-ignore */}
              <XAxis 
                dataKey="date" 
                tickFormatter={(date: string) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              {/* @ts-ignore */}
              <YAxis 
                hide={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => activeMetric === 'earnings' ? `$${value}` : value.toString()}
                width={40}
              />
              {/* @ts-ignore */}
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'earnings') return [`$${value}`, 'Earnings'];
                  if (name === 'views') return [value, 'Profile Views'];
                  if (name === 'likes') return [value, 'Likes'];
                  if (name === 'messages') return [value, 'Messages'];
                  return [value, name];
                }}
                labelFormatter={(date: string) => new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              />
              {/* @ts-ignore */}
              {activeMetric === 'views' && <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />}
              {/* @ts-ignore */}
              {activeMetric === 'likes' && <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />}
              {/* @ts-ignore */}
              {activeMetric === 'messages' && <Line type="monotone" dataKey="messages" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />}
              {/* @ts-ignore */}
              {activeMetric === 'earnings' && <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats; 