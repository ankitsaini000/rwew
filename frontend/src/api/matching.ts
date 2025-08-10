import axios from 'axios';

export async function fetchBrandMatches(brandId: string, campaignId?: string) {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api'}/match/brand/${brandId}`;
    if (campaignId) url += `?campaignId=${campaignId}`;
    const response = await axios.get(url);
    return response.data.matches || [];
  } catch (error) {
    console.error('Error fetching brand matches:', error);
    return []; // Return empty array instead of throwing error
  }
}