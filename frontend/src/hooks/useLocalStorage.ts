import { useState, useEffect } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

// Safe localStorage utility functions
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  getJSON: <T>(key: string, defaultValue: T): T => {
    const item = safeLocalStorage.getItem(key);
    if (!item) return defaultValue;
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing JSON from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  setJSON: <T>(key: string, value: T): boolean => {
    try {
      return safeLocalStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error stringifying JSON for localStorage key "${key}":`, error);
      return false;
    }
  }
};

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Initialize state with a function to avoid SSR mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load value from localStorage on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const item = safeLocalStorage.getJSON(key, initialValue);
      setStoredValue(item);
      setIsInitialized(true);
    }
  }, [key, initialValue, isInitialized]);

  // Return a wrapped version of useState's setter function
  const setValue: SetValue<T> = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage (client-side only)
      if (typeof window !== 'undefined') {
        safeLocalStorage.setJSON(key, valueToStore);
      }
    } catch (error) {
      console.error(`Error in useLocalStorage setValue for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Helper function for components that need immediate localStorage access
export function useSafeLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = safeLocalStorage.getJSON(key, initialValue);
      setValue(stored);
    }
  }, [key, initialValue]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    if (mounted && typeof window !== 'undefined') {
      safeLocalStorage.setJSON(key, newValue);
    }
  };

  return [value, setStoredValue];
}
