import { useState, useRef, useCallback, useMemo } from 'react';

export const useNotifications = () => {
  const [notification, setNotification] = useState<{
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  // useRef: stores the pending setTimeout id in a mutable box that survives
  // re-renders without itself causing one (unlike useState). We need this
  // reference so a new notification can cancel the previous one's timer.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // useCallback: keeps this function's identity stable across re-renders
  // (empty deps = created once). Without it, every render would create a
  // new function, which would change the context value below on every
  // render and force all consumers to re-render even when nothing changed.
  const showNotification = useCallback(
    (text: string, type: 'success' | 'error' | 'info' | 'warning') => {
      setNotification({ text, type });
      // Clear any pending dismissal so an earlier notification's timer can't
      // hide this new one before its own 5s has elapsed.
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, 5000);
    },
    []
  );
  // useMemo: returns the same object reference as long as `notification`
  // and `showNotification` haven't changed. This is what actually stops
  // context consumers from re-rendering on unrelated parent re-renders —
  // React context re-renders consumers whenever the value's reference
  // changes, not just when its contents differ.
  return useMemo(() => ({ notification, showNotification }), [notification, showNotification]);
};
