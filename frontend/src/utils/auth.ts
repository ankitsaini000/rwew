export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};