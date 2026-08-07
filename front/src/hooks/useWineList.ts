import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import wineListService from '../services/wineList';
import { useNotificationContext } from '../context/NotificationContext';
import type { Wine } from '../types/wine';

export const useWineList = () => {
  const { showNotification } = useNotificationContext();
  console.log('useWinelist hook is called');

  const {
    data: wineList = [],
    error,
    isLoading,
  } = useQuery<Wine[]>({
    queryKey: ['wines'],
    queryFn: wineListService.getAll,
    staleTime: 24 * 60 * 60 * 1000, // or even Infinity, given the 60-day Redis TTL
  });

  useEffect(() => {
    if (error) {
      showNotification('Unable to load wineList', 'error');
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps
  return useMemo(() => ({ wineList, isLoading }), [wineList, isLoading]);
};
