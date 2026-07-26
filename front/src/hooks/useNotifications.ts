import { useState, useRef } from 'react';

export const useNotifications = () => {
  const [notification, setNotification] = useState<{
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ text, type });
    // Clear any pending dismissal so an earlier notification's timer can't
    // hide this new one before its own 5s has elapsed.
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return { notification, showNotification };
};
