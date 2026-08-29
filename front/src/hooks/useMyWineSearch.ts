import { useState } from 'react';
import { useMyWinesContext } from '../context/MyWinesContext';
import type { MyWine } from '../types/wine';

export const useMyWineSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { myWines } = useMyWinesContext();

  const searchResults: MyWine[] =
    searchTerm.trim() === ''
      ? []
      : myWines.filter((wine) => {
          const lowerSearch = searchTerm.toLowerCase().trim();
          return (
            wine.name.toLowerCase().includes(lowerSearch) ||
            wine.description.toLowerCase().includes(lowerSearch)
          );
        });

  return { searchTerm, setSearchTerm, searchResults };
};
