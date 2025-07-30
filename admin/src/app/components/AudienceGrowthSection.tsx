import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import React, { useState, useEffect } from 'react';

const TABS = [
  { key: 'activeUsers', label: 'Active Users' },
  { key: 'creators', label: 'Creators Count' },
  { key: 'brands', label: 'Brands Count' },
] as const;

type TabKey = typeof TABS[number]['key'];

const BACKEND_URL = 'http://localhost:5001';
const ENDPOINTS: Record<TabKey, string> = {
  activeUsers: `${BACKEND_URL}/api/stats/active-users/monthly`,
  creators: `${BACKEND_URL}/api/stats/creators/monthly`,
  brands: `${BACKEND_URL}/api/stats/brands/monthly`,
};

export default function AudienceGrowthSection() {
  const [selectedTab, setSelectedTab] = useState<TabKey>('activeUsers');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      setChartData([]);
      try {
        const url = ENDPOINTS[selectedTab];
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setChartData(result.data || []);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedTab]);

  return (
    <div style={{
      background: 'white',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(37,99,235,0.10), 0 1.5px 6px #2563eb11',
      padding: 32,
      marginBottom: 32,
      width: '100%',
      maxWidth: 700
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 18 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            style={{
              background: selectedTab === tab.key ? (tab.key === 'brands' ? '#eab308' : '#f3f4f6') : '#f3f4f6',
              border: 'none',
              borderRadius: 16,
              padding: '12px 32px',
              fontWeight: 700,
              color: selectedTab === tab.key ? (tab.key === 'brands' ? '#fff' : '#18181b') : '#18181b',
              fontSize: 22,
              marginRight: 16,
              cursor: 'pointer',
              boxShadow: selectedTab === tab.key && tab.key === 'brands' ? '0 2px 8px #eab30833' : undefined,
              outline: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}
            onClick={() => setSelectedTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: 32 }}>{error}</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 14, fill: '#888' }} />
            <YAxis tick={{ fontSize: 14, fill: '#888' }} allowDecimals={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip formatter={v => v.toLocaleString()} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorGrowth)"
              dot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#fff', filter: 'drop-shadow(0 2px 8px #2563eb33)' }}
              activeDot={{ r: 8, fill: '#2563eb', stroke: '#fff', strokeWidth: 3, filter: 'drop-shadow(0 2px 8px #2563eb33)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
} 