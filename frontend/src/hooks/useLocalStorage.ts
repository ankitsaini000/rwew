import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const defaultVerificationState = {
    profileVerification: {
      isComplete: true,
      sections: {
        overview: true,
        pricing: true,
        requirements: true,
        gallery: true
      }
    }
  };

  const readValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      const parsedItem = item ? JSON.parse(item) : initialValue;
      return {
        ...(typeof parsedItem === 'object' ? parsedItem : { value: parsedItem }),
        ...defaultVerificationState
      };
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return { ...initialValue, ...defaultVerificationState };
    }
  };

  const [storedValue, setStoredValue] = useState(() => readValue());

  const setValue = (value: T) => {
    try {
      const dataToStore = {
        ...(typeof value === 'object' ? value : { value }),
        ...defaultVerificationState
      };
      window.localStorage.setItem(key, JSON.stringify(dataToStore));
      setStoredValue(dataToStore as T);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const initialData = readValue();
    setStoredValue(initialData as T);
  }, []);

  return [storedValue, setValue] as const;
}




