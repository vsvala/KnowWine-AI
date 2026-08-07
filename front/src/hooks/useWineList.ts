import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import wineListService from '../services/wineList';
import { useNotificationContext } from '../context/NotificationContext';
import type { Wine } from '../types/wine';
import { WINES_STALE_TIME_MS, WINES_GC_TIME_MS } from './wineQueryConfig';

export const useWineList = () => {
  const { showNotification } = useNotificationContext();
  const [page, setPage] = useState(1);

  const {
    data: wineList = [],
    error,
    isLoading,
  } = useQuery<Wine[]>({
    queryKey: ['wines', page],
    queryFn: () => wineListService.getAll(page),
    staleTime: WINES_STALE_TIME_MS,
    gcTime: WINES_GC_TIME_MS,
  });

  useEffect(() => {
    if (error) {
      showNotification('Unable to load wineList', 'error');
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps
  return useMemo(() => ({ wineList, isLoading, page, setPage }), [wineList, isLoading, page]);
};
