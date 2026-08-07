import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMyWinesContext } from '../context/MyWinesContext';
//import { useAuthContext } from '../context/AuthContext';

const MyWines = () => {
  //const [users, setUsers] = useState<User[]>([]);
  // const [user, setUser] = useState('');
   // const { user } = useAuthContext();
   // console.log(user)
  
  const [searched, setSearched] = useState('');
  const { myWines } = useMyWinesContext();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearched(e.target.value);
  };

  const filteredWines =
    searched.trim() === ''
      ? []
      : myWines.filter((wine) => {
          const lowerSearch = searched.toLowerCase().trim();
          return (
            wine.name.toLowerCase().includes(lowerSearch) ||
            wine.description.toLowerCase().includes(lowerSearch)
          );
        });

  //  const redWines  =  myWines.filter(wine => wine.type="red")
  //  console.log(redWines)

  //  const whiteWines  =  myWines.filter(wine => wine.type="red")
  //  console.log(redWines)

  //  const sparklingWines  =  myWines.filter(wine => wine.type="red")
  //  console.log(redWines)

  //  const wineRegion  =  myWines.filter(wine => wine.type="red")
  //  console.log(redWines)

  //counrty
  //grapes

  return (
    <div>
      <h2>Search wines</h2>
      <div className="search-container">
        <input type="text" placeholder="Search.." value={searched} onChange={handleSearch} />
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
          {myWines.map((wine) => (
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
