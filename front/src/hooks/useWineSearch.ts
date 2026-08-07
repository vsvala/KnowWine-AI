import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import wineListService from '../services/wineList';
import type { Wine } from '../types/wine';
import { WINES_STALE_TIME_MS, WINES_GC_TIME_MS } from './wineQueryConfig';

const DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 1;

export const useWineSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearch(searchTerm), DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const { data: searchResults = [] } = useQuery<Wine[]>({
    queryKey: ['wines', 'search', debouncedSearch],
    queryFn: () => wineListService.searchAll(debouncedSearch),
    enabled: debouncedSearch.trim().length >= MIN_SEARCH_LENGTH,
    staleTime: WINES_STALE_TIME_MS,
    gcTime: WINES_GC_TIME_MS,
  });

  return { searchTerm, setSearchTerm, searchResults };
};
