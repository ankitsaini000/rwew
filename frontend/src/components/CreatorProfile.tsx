import React, { useEffect, useState } from 'react';

export function CreatorProfile() {
  const [metrics, setMetrics] = useState({
    followers: '0',
    engagement: '0',
    likes: '0'
  });
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const getMetricsData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
        console.error('Error fetching metrics:', err);
      }
    };

    getMetricsData();
  }, []);

  if (error) {
    return <div>Error loading profile: {error}</div>;
  }

  return (
    <div>
      {isClient && (
        <>
          <span>{metrics.followers}</span>
        </>
      )}
    </div>
  );
}