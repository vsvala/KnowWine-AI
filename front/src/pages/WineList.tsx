import { useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import wineListService from '../services/wineList';
import WineCard from '../components/WineCard';
import type { Wine } from '../types/wine';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

//import LoginForm from './LoginForm';
//import winesListService from '../services/WinesList';
//import MyWineForm from './MyWineForm';

interface WineListProps {
  wineList: Wine[];
  isLoading?: boolean;
}

const WineList = ({ wineList, isLoading }: WineListProps) => {
  const [searched, setSearched] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      setDebouncedSearch(searched);
    }, 300);

    return () => clearTimeout(timeOutId);
  }, [searched]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearched(e.target.value);
  };


  const { data: filteredWines = [] } = useQuery<Wine[]>({
    queryKey: ['wines', 'search', debouncedSearch],
    queryFn: () => wineListService.searchAll(debouncedSearch),
    enabled: debouncedSearch.trim().length >= 2,
  });

  return (
    <div>
      <h2>Search wines</h2>

      <div className="search-container">
        <input type="text" placeholder="Search.." value={searched} onChange={handleSearch} />
      </div>

      <div className="search-container">
        <p>Search Results</p>
        <ul>
          {filteredWines.map((wine) => (
            <li key={wine.id}>
              <Link to={`/wines/${wine.id}`}>{wine.display_name} </Link>
              {/* <strong>{wine.name}</strong>: {wine.description}{' '} */}
              {/* <button onClick={() => deleteItem(item.id)}>Delete</button> */}
            </li>
          ))}
        </ul>
        {searched.trim() !== '' && filteredWines.length === 0 && <p>No matching wines found.</p>}
      </div>

      <div className="search-container">
        <h2>Wines</h2>

        {isLoading ? (
          <p>Loading wines...</p>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: '#000', color: '#fff' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff' }}>Name</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Type</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Subtype</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {wineList.map((wine: Wine) => (
                  <WineCard key={wine.id} wine={wine} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      <br />
    </div>
  );
};
export default WineList;

    //     const filteredWines =
    // //debouncedSearch.trim() === ''
    // debouncedSearch.trim().length < 2
    //   ? []
      // : wineList.filter((wine) => {
      //     const lowerSearch = debouncedSearch.toLowerCase().trim();
      //     return (
      //       wine.display_name.toLowerCase().includes(lowerSearch) ||
      //       wine.type.toLowerCase().includes(lowerSearch)
     //     );
     //  });