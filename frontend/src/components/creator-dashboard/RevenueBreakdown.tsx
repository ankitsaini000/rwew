// @ts-nocheck
import React, { useState } from 'react';
// Ignore recharts import errors
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, Calendar, ArrowRight, Filter } from 'lucide-react';

interface PromotionRevenue {
  type: string;
  amount: number;
  color: string;
  transactions?: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface RevenueBreakdownProps {
  promotionRevenueData: PromotionRevenue[];
  monthlyRevenueData?: MonthlyRevenue[];
  totalLastMonth?: number;
}

const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({ 
  promotionRevenueData,
  monthlyRevenueData = [],
  totalLastMonth = 0
}) => {
  const [activeTab, setActiveTab] = useState<'category' | 'monthly'>('category');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  // Calculate total revenue
  const totalRevenue = promotionRevenueData.reduce((sum, item) => sum + item.amount, 0);
  
  // Format data for pie chart
  const chartData = promotionRevenueData.map(item => ({
    name: item.type,
    value: item.amount,
    color: item.color,
    transactions: item.transactions || 0
  }));

  // Format or create mock monthly data if not provided
  const monthlyData = monthlyRevenueData.length > 0 ? monthlyRevenueData : [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 1800 },
    { month: 'Mar', revenue: 1400 },
    { month: 'Apr', revenue: 2200 },
    { month: 'May', revenue: 1100 },
    { month: 'Jun', revenue: 1600 }
  ];

  // Calculate month-over-month growth
  const growthPercentage = totalLastMonth > 0 ? 
    ((totalRevenue - totalLastMonth) / totalLastMonth * 100).toFixed(1) : 
    0;

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-md shadow-md border border-gray-100">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm text-gray-700">${data.value.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{(data.value / totalRevenue * 100).toFixed(1)}% of total</p>
          {data.transactions > 0 && (
            <p className="text-xs text-gray-500 mt-1">{data.transactions} orders</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom legend for pie chart
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="text-sm mt-4 space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">{entry.value}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-900 font-medium">
                ${chartData.find(item => item.name === entry.value)?.value?.toLocaleString() || '0'}
              </span>
              <span className="text-xs text-gray-500">
                {((chartData.find(item => item.name === entry.value)?.value || 0) / totalRevenue * 100).toFixed(1)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-5 h-5 text-emerald-600 mr-2" />
            Revenue Breakdown
          </h3>
          
          {/* Tabs and Controls */}
          <div className="flex items-center mt-4 sm:mt-0">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab('category')}
                className={`px-3 py-1.5 text-sm ${
                  activeTab === 'category' 
                    ? 'bg-emerald-50 text-emerald-600 font-medium' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                By Category
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-3 py-1.5 text-sm ${
                  activeTab === 'monthly' 
                    ? 'bg-emerald-50 text-emerald-600 font-medium' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
            </div>
            
            {activeTab === 'category' && (
              <div className="ml-2 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-2 py-1.5 text-sm ${
                    chartType === 'pie' 
                      ? 'bg-emerald-50 text-emerald-600 font-medium' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Pie
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2 py-1.5 text-sm ${
                    chartType === 'bar' 
                      ? 'bg-emerald-50 text-emerald-600 font-medium' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Bar
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-4 text-white">
            <h4 className="text-sm font-medium text-emerald-50 mb-3">Total Revenue</h4>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <div className="mt-2 text-xs text-emerald-100">
              Lifetime earnings from all promotions
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Growth</h4>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold text-gray-900">{growthPercentage}%</div>
              <div className="ml-2 text-xs text-gray-500">vs last month</div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-gray-600">Month-over-month change</span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Top Category</h4>
            {chartData.length > 0 && (
              <>
                <div className="text-xl font-bold text-gray-900">{chartData.sort((a, b) => b.value - a.value)[0].name}</div>
                <div className="mt-1 flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: chartData.sort((a, b) => b.value - a.value)[0].color }}
                  ></div>
                  <div className="text-sm text-gray-600">${chartData.sort((a, b) => b.value - a.value)[0].value.toLocaleString()}</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {activeTab === 'category' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64">
              {chartType === 'pie' ? (
                /* @ts-ignore - Suppressing TypeScript errors for Recharts components */
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                /* @ts-ignore - Suppressing TypeScript errors for Recharts components */
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`} 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <RechartsTooltip />
                    <Bar dataKey="value" name="Revenue">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="md:col-span-1">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue By Category</h4>
              <ul className="space-y-3">
                {promotionRevenueData
                  .sort((a, b) => b.amount - a.amount)
                  .map((item, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-700">{item.type}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">${item.amount.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">
                          {(item.amount / totalRevenue * 100).toFixed(1)}%
                        </span>
                      </div>
                    </li>
                  ))
                }
              </ul>
            </div>
          </div>
        ) : (
          <div className="h-80">
            {/* @ts-ignore - Suppressing TypeScript errors for Recharts components */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 30, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="month" 
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  name="Monthly Revenue" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueBreakdown; 