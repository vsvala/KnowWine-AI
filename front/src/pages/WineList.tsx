import WineCard from '../components/WineCard';
import { useWineListContext } from '../context/WineListContext';
import { useWineSearch } from '../hooks/useWineSearch';
import type { Wine } from '../types/wine';
import SearchList from '../components/common/SearchList';
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


  return (
    <div>  
      <SearchList<Wine>
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        results={searchResults}
        itemKey={(wine) => wine.id}
        itemHref={(wine) => `/wines/${wine.id}`}
        itemLabel={(wine) => wine.display_name}
      />
    
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
