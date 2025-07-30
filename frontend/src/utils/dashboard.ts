/**
 * Utility functions for the dashboard
 */

/**
 * Formats a number for display, adding K for thousands, M for millions
 * @param num Number to format
 * @returns Formatted string
 */
export const formatNumber = (num: number): string => {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
};

/**
 * Determines the influencer tier based on follower count
 * @param followers Number of followers
 * @returns Tier name (Standard, Professional, Elite, VIP)
 */
export const getInfluencerTier = (followers: number): string => {
  if (followers >= 100000) {
    return 'VIP';
  }
  
  if (followers >= 50000) {
    return 'Elite';
  }
  
  if (followers >= 10000) {
    return 'Professional';
  }
  
  return 'Standard';
};

/**
 * Determines the service tier based on completed projects and response rate
 * @param completedProjects Number of completed projects
 * @param responseRate Response rate percentage
 * @returns Tier name (Standard, Professional, Elite, VIP)
 */
export const getServiceTier = (completedProjects: number, responseRate: number): string => {
  if (completedProjects >= 100 && responseRate >= 95) {
    return 'VIP';
  }
  
  if (completedProjects >= 50 && responseRate >= 90) {
    return 'Elite';
  }
  
  if (completedProjects >= 20 && responseRate >= 85) {
    return 'Professional';
  }
  
  return 'Standard';
};

/**
 * Formats a currency amount for display
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formats a date for display
 * @param dateString Date string to format
 * @param format Format type ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    
    case 'long':
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    
    case 'medium':
    default:
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
  }
};

/**
 * Calculates growth percentage between two numbers
 * @param current Current value
 * @param previous Previous value
 * @returns Growth percentage
 */
export const calculateGrowth = (current: number, previous: number): number => {
  if (!previous) return 0;
  
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
};

/**
 * Generates mock data for testing dashboard components
 * @returns Mock dashboard data
 */
export const generateMockDashboardData = () => {
  return {
    followers: 25800,
    totalEarnings: 18500,
    completedProjects: 47,
    responseRate: 92,
    tierProgress: 68,
    profileViews: 1253,
    repeatClientRate: 68,
    averageResponseTime: 3.2,
    profileCompleteness: 85,
    totalReach: 42300,
    primaryPlatform: 'Instagram',
    socialProfiles: {
      instagram: 15800,
      youtube: 12500,
      twitter: 7800,
      facebook: 4500,
      linkedin: 1700
    },
    monthlyGrowth: {
      followers: 5.4,
      earnings: 8.2,
      projects: 3.7
    }
  };
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Format percentage with a + or - sign
 */
export const formatPercentChange = (percent: number): string => {
  return percent > 0 ? `+${percent}%` : `${percent}%`;
};

/**
 * Generate a color based on performance
 */
export const getPerformanceColor = (percent: number): string => {
  if (percent > 0) return 'text-green-600';
  if (percent < 0) return 'text-red-600';
  return 'text-gray-600';
};

/**
 * Calculate tier progress percentage
 */
export const calculateTierProgress = (followers: number): number => {
  if (followers >= 1000000) {
    return 100;
  } else if (followers >= 500000) {
    return 80 + ((followers - 500000) / 500000) * 20;
  } else if (followers >= 100000) {
    return 60 + ((followers - 100000) / 400000) * 20;
  } else if (followers >= 50000) {
    return 40 + ((followers - 50000) / 50000) * 20;
  } else {
    return (followers / 50000) * 40;
  }
}; 