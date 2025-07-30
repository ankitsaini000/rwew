import axios from 'axios';

export async function fetchBrandMatches(brandId: string, campaignId?: string) {
  let url = `http://localhost:5001/api/match/brand/${brandId}`;
  if (campaignId) url += `?campaignId=${campaignId}`;
  const response = await axios.get(url);
  return response.data.matches;
} 