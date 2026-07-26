import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
//import myWineService from '../services/myWines';
//import userService from '../services/users';
//import loginService from '../services/login';
//import MyWineForm from './MyWineForm';

type Wine = {
  id: number;
  name: string;
  description: string;
};

interface MyWinesProps {
  wines: Wine[];
  deleteWine: (id: number) => void;
}

const MyWines = ({ wines }: MyWinesProps) => {
  //const [wines, setWines] = useState<Wine[]>([]);
  //const [users, setUsers] = useState<User[]>([]);
  // const [user, setUser] = useState('');
  const [searched, setSearched] = useState('');


  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearched(e.target.value);
  };

  const filteredWines =
    searched.trim() === ''
      ? []
      : wines.filter((wine) => {
          const lowerSearch = searched.toLowerCase().trim();
          return (
            wine.name.toLowerCase().includes(lowerSearch) ||
            wine.description.toLowerCase().includes(lowerSearch)
          );
        });

  return (
    <div>
      <h2>Search wines</h2>
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search.." 
          value={searched} 
          onChange={handleSearch} />
      </div>

      <div className="search-container">
        <h2>Search Results</h2>
        <ul>
          {filteredWines.map((wine) => (
            <li key={wine.id}>
              <Link to={`/mywines/${wine.id}`}>{wine.name}</Link>
              {/* <strong>{wine.name}</strong>: {wine.description}{' '} */}
            </li>
          ))}
        </ul>
        {searched.trim() !== '' && filteredWines.length === 0 && <p>No matching wines found.</p>}
      </div>

      <div className="search-container">
        <h2>My Wines</h2>
        <ul>
          {wines.map((wine: Wine) => (
            <li className="favourite-item" key={wine.id}>
              <Link to={`/mywines/${wine.id}`}>
                <strong>{wine.name}</strong>
              </Link>
              {/* <strong>{wine.name}</strong>: {wine.description}{' '} */}
              {/* <button onClick={() => deleteWine(wine.id)}>Delete</button> */}
            </li>
          ))}
        </ul>
      </div>

      <br />
    </div>
  );
};
export default MyWines;
