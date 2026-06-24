import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

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
//import Toggable from './Toggable';
//import winesListService from '../services/WinesList';
//import MyWineForm from './MyWineForm';

type Wine = {
  id: number;
  display_name: string;
  color: string;
  type: string;
  sub_type: string;
  residual_sugar: string | null;
  producer: object;
  region: string | null;
};

interface WineListProps {
  wineList: Wine[];
}

const WineList = ({ wineList }: WineListProps) => {
  const [searched, setSearched] = useState('');

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearched(e.target.value);
  };

  const filteredWines =
    searched.trim() === ''
      ? []
      : wineList.filter((wine) => {
          const lowerSearch = searched.toLowerCase().trim();
          return (
            wine.display_name.toLowerCase().includes(lowerSearch) ||
            wine.type.toLowerCase().includes(lowerSearch)
          );
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
              <Link to={`/mywines/${wine.id}`}>{wine.display_name} </Link>
              {/* <strong>{wine.name}</strong>: {wine.description}{' '} */}
              {/* <button onClick={() => deleteItem(item.id)}>Delete</button> */}
            </li>
          ))}
        </ul>
        {searched.trim() !== '' && filteredWines.length === 0 && <p>No matching wines found.</p>}
      </div>

      <div className="search-container">
        <h2>Wines</h2>

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
                <TableRow key={wine.id}>
                  <TableCell>
                    <Link to={`/wines/${wine.id}`}>
                      <strong>{wine.display_name}</strong>
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}>{wine.type}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{wine.sub_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <br />
    </div>
  );
};
export default WineList;
