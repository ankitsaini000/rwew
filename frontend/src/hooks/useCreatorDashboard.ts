import { useState, useEffect } from 'react';
import { getCreatorDashboardMetrics, getCreatorSocialMetrics } from '../services/creatorApi';
import { testApiConnection } from '../services/api';

/**
 * Custom hook to fetch creator dashboard data
 * @returns Object containing creator dashboard metrics and loading/error states
 */
export const useCreatorDashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [socialData, setSocialData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure metrics have proper structure with defaults
  const normalizeMetricsData = (data: any) => {
    if (!data) return null;
    
    // Ensure core metrics have defaults
    return {
      followers: data.followers || 0,
      totalEarnings: data.totalEarnings || 0,
      completedProjects: data.completedProjects || 0,
      responseRate: data.responseRate || 0,
      tierProgress: data.tierProgress || 0,
      
      // Performance metrics with defaults
      profileViews: data.profileViews || 0,
      repeatClientRate: data.repeatClientRate || 0,
      averageResponseTime: data.averageResponseTime || 0,
      profileCompleteness: data.profileCompleteness || 0,
      dashboardImpressions: data.dashboardImpressions || 0,
      
      // Tiers
      influencerTier: data.influencerTier || 'Standard',
      serviceTier: data.serviceTier || 'Standard',
      
      // Growth metrics with defaults
      monthlyGrowth: data.monthlyGrowth || {
        followers: 2.5,
        earnings: 3.0,
        projects: 1.5
      },
      
      ...data // Include any other fields from the original data
    };
  };

  // Helper function to normalize social media data
  const normalizeSocialMediaData = (data: any) => {
    if (!data) return null;
    
    // Extract social profiles from the correct path if available
    // First try the socialMedia.socialProfiles path (from CreatorProfile model)
    const socialProfiles = data.socialMedia?.socialProfiles || data.profiles || {};
    
    // Create a unified format for social media data
    const normalizedData = {
      totalReach: data.totalReach || 0,
      primaryPlatform: data.primaryPlatform || 'Instagram',
      
      // Normalized social profiles with followers
      socialProfiles: {
        instagram: socialProfiles.instagram?.followers || data.profiles?.instagram || 0,
        youtube: socialProfiles.youtube?.subscribers || data.profiles?.youtube || 0,
        twitter: socialProfiles.twitter?.followers || data.profiles?.twitter || 0,
        facebook: socialProfiles.facebook?.followers || data.profiles?.facebook || 0,
        linkedin: socialProfiles.linkedin?.connections || data.profiles?.linkedin || 0
      },
      
      // Normalized social media links and handles
      socialMedia: {
        instagram: {
          username: socialProfiles.instagram?.handle || data.socialMedia?.instagram?.username || '',
          url: socialProfiles.instagram?.url || ''
        },
        youtube: {
          username: socialProfiles.youtube?.handle || data.socialMedia?.youtube?.username || '',
          url: socialProfiles.youtube?.url || ''
        },
        twitter: {
          username: socialProfiles.twitter?.handle || data.socialMedia?.twitter?.username || '',
          url: socialProfiles.twitter?.url || ''
        },
        facebook: {
          username: socialProfiles.facebook?.handle || data.socialMedia?.facebook?.username || '',
          url: socialProfiles.facebook?.url || ''
        },
        linkedin: {
          username: socialProfiles.linkedin?.handle || data.socialMedia?.linkedin?.username || '',
          url: socialProfiles.linkedin?.url || ''
        },
        website: socialProfiles.website?.url || data.socialMedia?.website || ''
      }
    };
    
    console.log('Normalized social media data:', normalizedData);
    return normalizedData;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Testing API connection first...');
        const connectionTest = await testApiConnection();
        console.log('API connection test result:', connectionTest);
        
        // Fetch metrics data
        console.log('Fetching dashboard metrics data...');
        const metricsResponse = await getCreatorDashboardMetrics();
        console.log('Dashboard metrics response:', metricsResponse);
        
        if (metricsResponse.success && metricsResponse.data) {
          // Normalize the metrics data
          const normalizedMetrics = normalizeMetricsData(metricsResponse.data);
          console.log('Normalized metrics data:', normalizedMetrics);
          
          // Log specific metrics to verify their presence
          console.log('Profile metrics values after normalization:', {
            profileViews: normalizedMetrics.profileViews,
            repeatClientRate: normalizedMetrics.repeatClientRate,
            averageResponseTime: normalizedMetrics.averageResponseTime,
            profileCompleteness: normalizedMetrics.profileCompleteness
          });
          
          setMetrics(normalizedMetrics);
        } else {
          console.error('Failed to fetch metrics data:', metricsResponse.error);
          setError(metricsResponse.error || 'Failed to fetch metrics data');
        }
        
        // Fetch social data
        console.log('Fetching social metrics data...');
        const socialResponse = await getCreatorSocialMetrics();
        console.log('Social metrics response:', socialResponse);
        
        if (socialResponse.success && socialResponse.data) {
          // Normalize social media data
          const normalizedSocialData = normalizeSocialMediaData(socialResponse.data);
          console.log('Setting normalized social data:', normalizedSocialData);
          setSocialData(normalizedSocialData);
        } else {
          console.error('Failed to fetch social data:', socialResponse.error);
          // Don't override the metrics error if it exists
          if (!metricsResponse.success) {
            setError(socialResponse.error || 'Failed to fetch social data');
          }
        }
      } catch (err: any) {
        console.error('Error in useCreatorDashboard:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Combine all metrics into one object
  const combinedMetrics = metrics && socialData ? {
    ...metrics,
    ...socialData
  } : metrics;
  
  // Log the final combined metrics
  useEffect(() => {
    if (combinedMetrics) {
      console.log('Final combined metrics object:', combinedMetrics);
    }
  }, [combinedMetrics]);
  
  return { 
    metrics: combinedMetrics, 
    loading, 
    error,
    // Add refetch capability if needed
    refetch: () => {
      setLoading(true);
      setError(null);
      // This will trigger the useEffect again
      setMetrics(null);
      setSocialData(null);
    }
  };
};

export default useCreatorDashboard; 