import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import WineCard from '../components/WineCard';
import { useWineListContext } from '../context/WineListContext';
import { useWineSearch } from '../hooks/useWineSearch';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const WineList = () => {
  const { wineList, isLoading } = useWineListContext();
  const { searchTerm, setSearchTerm, searchResults } = useWineSearch();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      <h2>Search wines</h2>

      <div className="search-container">
        <input type="text" placeholder="Search.." value={searchTerm} onChange={handleSearch} />
      </div>

      <div className="search-container">
        <p>Search Results</p>
        <ul>
          {searchResults.map((wine) => (
            <li key={wine.id}>
              <Link to={`/wines/${wine.id}`}>{wine.display_name} </Link>
            </li>
          ))}
        </ul>
        {searchTerm.trim() !== '' && searchResults.length === 0 && <p>No matching wines found.</p>}
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
                {wineList.map((wine) => (
                  <WineCard key={wine.id} wine={wine}  />
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