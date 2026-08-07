import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import wineListService from '../services/wineList';
import { useNotificationContext } from '../context/NotificationContext';
import type { Wine } from '../types/wine';
import { WINES_STALE_TIME_MS, WINES_GC_TIME_MS } from './wineQueryConfig';

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
    staleTime: WINES_STALE_TIME_MS,
    gcTime: WINES_GC_TIME_MS,
  });

  useEffect(() => {
    if (error) {
      showNotification('Unable to load wineList', 'error');
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps
  return useMemo(() => ({ wineList, isLoading }), [wineList, isLoading]);
};
