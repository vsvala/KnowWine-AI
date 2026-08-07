import WineCard from '../components/WineCard';
import { useWineListContext } from '../context/WineListContext';
import { useWineSearch } from '../hooks/useWineSearch';
import type { WineSearchResult } from '../types/wine';
import Pagination from '@mui/material/Pagination';
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

const MAX_BROWSABLE_PAGES = 5;

const WineList = () => {
  const { wineList, isLoading, page, setPage  } = useWineListContext();
  const { searchTerm, setSearchTerm, searchResults, submitSearch, hasSearched } = useWineSearch();

  return (
    <div>  
      <SearchList<WineSearchResult>
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSubmit={submitSearch}
        hasSearched={hasSearched}
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
                  <TableCell sx={{ color: '#fff' }}>Color</TableCell>
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
        <Pagination
          count={MAX_BROWSABLE_PAGES}
          page={page}
          onChange={(_, value) => setPage(value)}
          sx={{ mt: 2, '& .MuiPaginationItem-root': { color: '#fff' } }}
        />
      </div>
      <br />
    </div>
  );
};
export default WineList;
