import { useState, useEffect } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useApi<T = any>(url: string, options?: any) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const source = axios.CancelToken.source();
    
    const fetchData = async () => {
      try {
        const response: AxiosResponse<T> = await axios({
          url,
          cancelToken: source.token,
          ...options,
        });
        
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (axios.isCancel(error)) {
          // Request was cancelled, we don't need to do anything
          return;
        }
        
        setState({
          data: null,
          isLoading: false,
          error: error as Error,
        });
      }
    };

    fetchData();

    return () => {
      source.cancel('Component unmounted');
    };
  }, [url, JSON.stringify(options)]);

  return state;
}

export async function fetchApi<T = any>(url: string, options?: any): Promise<T> {
  try {
    const response = await axios({
      url,
      ...options,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.message);
  }
}

export default useApi; 