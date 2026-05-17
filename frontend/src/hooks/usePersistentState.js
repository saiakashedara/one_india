import { useEffect, useState } from 'react';

const readStoredValue = (key, fallbackValue) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
};

const usePersistentState = (key, fallbackValue) => {
  const [value, setValue] = useState(() => readStoredValue(key, fallbackValue));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Storage can be unavailable in private browsing; keep the in-memory state.
    }
  }, [key, value]);

  return [value, setValue];
};

export default usePersistentState;
