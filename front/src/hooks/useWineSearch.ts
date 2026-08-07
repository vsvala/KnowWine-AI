import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import wineListService from '../services/wineList';
import type { WineSearchResult } from '../types/wine';
import { WINES_STALE_TIME_MS, WINES_GC_TIME_MS } from './wineQueryConfig';

const MIN_SEARCH_LENGTH = 3;

// Search hits GrapeMinds' metered API (250 requests/month), so results are
// fetched on explicit submit rather than live as the user types - typing
// "riesling" with a couple of pauses would otherwise fire several separate
// (separately billed) queries for one search intent.
export const useWineSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  const submitSearch = () => setSubmittedSearch(searchTerm.trim());

  const hasSearched = submittedSearch.length >= MIN_SEARCH_LENGTH;

  const { data: searchResults = [] } = useQuery<WineSearchResult[]>({
    queryKey: ['wines', 'search', submittedSearch],
    queryFn: () => wineListService.searchAll(submittedSearch),
    enabled: hasSearched,
    staleTime: WINES_STALE_TIME_MS,
    gcTime: WINES_GC_TIME_MS,
  });

  return { searchTerm, setSearchTerm, searchResults, submitSearch, hasSearched };
};
