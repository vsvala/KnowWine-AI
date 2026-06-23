import { useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import myWineService from '../services/myWines';
import userService from '../services/users';
import loginService from '../services/login';
import LoginForm from './LoginForm';
import Toggable from './Toggable';
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
type User = {
  id: number;
  name: string;
  username: string;
};

interface WineListProps {
  wineList: Wine[];
}

const WineList = ({ wineList }: WineListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [user, setUser] = useState('');
  const [searched, setSearched] = useState('');

  useEffect(() => {
    console.log('effect');
    userService
      .getAll()
      .then((initialUsers) => {
        console.log('users from API:', initialUsers);
        setUsers(initialUsers);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load users');
      });
  }, []);
  // console.log('render', items.length, 'items')

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedWineappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      console.log(user);
      setUser(user);
      myWineService.setToken(user.token);
    }
  }, []);

  const login = async (username: string, password: string) => {
    console.log('loggin with ', username, password);
    try {
      const user = await loginService.login({ username, password });
      window.localStorage.setItem('loggedWineappUser', JSON.stringify(user));
      myWineService.setToken(user.token);
      setUser(user);
    } catch (error) {
      console.log('error submitting', error);
      //setErrorMessage('wrong credentials');
      setTimeout(() => {
        //setErrorMessage(null);
      }, 5000);
    }
  };

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
        <ul>
          {wineList.map((wine: Wine) => (
            <li className="favourite-item" key={wine.id}>
              <Link to={`/wines/${wine.id}`}>
                <strong>
                  {wine.display_name}, {wine.type} , {wine.sub_type}{' '}
                </strong>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {error && <div className="error">{error}</div>}
      <br />
    </div>
  );
};
export default WineList;
