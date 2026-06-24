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

  //const wineFormRef = useRef();

  // useEffect(() => {
  //   console.log('effect');
  //   userService
  //     .getAll()
  //     .then((initialUsers) => {
  //       console.log('users from API:', initialUsers);
  //       setUsers(initialUsers);
  //     })
  //     .catch(() => setError('Unable to load items'));
  //   console.error('Error loading users');
  // }, []);
  // // console.log('render', items.length, 'items')

  // useEffect(() => {
  //   const loggedUserJSON = window.localStorage.getItem('loggedWineappUser');
  //   if (loggedUserJSON) {
  //     const user = JSON.parse(loggedUserJSON);
  //     console.log(user);
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     setUser(user);
  //     myWineService.setToken(user.token);
  //   }
  // }, []);

  // const addWine = (newWineObject: Wine) => {
  //   myWineService
  //     .create(newWineObject)
  //     .then((returnedWine) => {
  //       setWines((prev) => prev.concat(returnedWine));
  //       setError('');
  //     })
  //     .catch((err) => {
  //       const message = err.response?.data?.error ?? 'Error adding item';
  //       setError(message);
  //       setTimeout(() => setError(''), 5000);
  //     });
  // };

  //   const toggleImportanceOf = id => {
  //   const url = `http://localhost:3001/notes/${id}`
  //   const note = notes.find(n => n.id === id)
  //   const changedNote = { ...note, important: !note.important }

  //   axios.put(url, changedNote).then(response => {
  //     setNotes(notes.map(note => note.id === id ? response.data : note))
  //   })
  // }
  // const login = async (username: string, password: string) => {
  //   console.log('loggin with ', username, password);
  //   try {
  //     const user = await loginService.login({ username, password });
  //     window.localStorage.setItem('loggedWineappUser', JSON.stringify(user));
  //     myWineService.setToken(user.token);
  //     setUser(user);
  //   } catch (error) {
  //     console.log('error submitting', error);
  //     //setErrorMessage('wrong credentials');
  //     setTimeout(() => {
  //       //setErrorMessage(null);
  //     }, 5000);
  //   }
  // };

  // const handleLogout = () => {
  //   window.localStorage.removeItem('loggedWineappUser');
  //   myWineService.setToken('');
  //   setUser('');
  // };

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

  // const loginForm = () => (
  //   <Toggable buttonLabel="login">
  //     <LoginForm login={login} />
  //   </Toggable>
  // );
  // const myWineForm = () => (
  //   <Toggable buttonLabel="add wine">
  //     <MyWineForm addWine={addWine} />
  //   </Toggable>
  // );

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
              {/* <button onClick={() => deleteItem(item.id)}>Delete</button> */}
            </li>
          ))}
        </ul>
        {searched.trim() !== '' && filteredWines.length === 0 && <p>No matching wines found.</p>}
      </div>

      {/* {!user && loginForm()} */}

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

      {/* {user && myWineForm()} */}
      <br />
    </div>
  );
};
export default MyWines;
