import './App.css';
import { useState, useEffect } from 'react';
import myWineService from './services/myWines';
import userService from './services/users';
import loginService from './services/login';
import wineListService from './services/wineList';

import { Routes, Route, Link, useMatch } from 'react-router-dom';
import Footer from './components/Footer';
import MyWineForm from './components/MyWineForm';
import MyWines from './components/MyWines';
import WineSingle from './components/WineSingle';

import WineList from './components/WineList';
import MyWine from './components/MyWine';
import Home from './components/Home';
import LoginForm from './components/LoginForm';

// curl http://localhost:3001/api/users
// TODO aDD to favourotes list (wine) after search... changing importannce  2
// TODO revent the user from being able to add same wine multiple
//window.localStorage.removeItem('loggedNoteappUser')copy
// kokonaan nollaavaa komentoa:window.localStorage.clear()
type Wine = {
  id: number;
  name: string;
  description: string;
};

type WineLi = {
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
const App = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [error, setError] = useState('');
  const [wineList, setWineList] = useState<WineLi[]>([]);
  const [user, setUser] = useState('');

  //const wineFormRef = useRef();

  // useEffect: runs after the first render to perform side-effects.
  // Here it fetches the items from the backend API and sets state.
  // Runs once because the dependency array is empty (`[]`).

  useEffect(() => {
    console.log('effect');
    userService
      .getAll()
      .then((initialUsers) => {
        console.log('users from API:', initialUsers);
        setUser(initialUsers);
      })
      .catch(() => setError('Unable to load items'));
    console.error('Error loading users');
  }, []);
  // console.log('render', items.length, 'items')

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedWineappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      console.log(user);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setUser(user);
      myWineService.setToken(user.token);
    }
  }, []);

  useEffect(() => {
    console.log('effect');
    myWineService
      .getAll()
      .then((initialMyWines) => {
        setWines(initialMyWines);
      })
      .catch(() => setError('Unable to load wines'));
  }, []);

  useEffect(() => {
    //fetch('http://localhost:3001/api/wines')
    wineListService
      .getAll()
      // .then((res) => res.json())
      .then((initialWineList) => {
        setWineList(initialWineList);
      })
      .catch((err) => setError(err + 'Unable to load wineList'));
    //console.error(err));
  }, []);

  const addWine = (newWineObject: Wine) => {
    console.log(newWineObject);
    myWineService
      .create(newWineObject)
      .then((returnedWine) => {
        setWines((prev) => prev.concat(returnedWine));
        setError('');
      })
      .catch((err) => {
        const message = err.response?.data?.error ?? 'Error adding item';
        setError(message);
        setTimeout(() => setError(''), 5000);
      });
  };

  const deleteWine = (id: number) => {
    const wineToDelete = wines.find((item) => item.id === id);
    console.log('delete wine with id', id, wineToDelete);

    myWineService
      .deleteWine(id)
      .then(() => {
        console.log('wine deleted', id);
        setWines((prev) => prev.filter((item) => item.id !== id));
      })
      .catch(() => {
        setError('Error deleting item');
      });
  };

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

  const handleLogout = () => {
    window.localStorage.removeItem('loggedWineappUser');
    myWineService.setToken('');
    setUser('');
  };

  const padding = {
    padding: 5,
  };

  const match = useMatch('/mywines/:id');
  const wine = match ? wines.find((wine) => wine.id === Number(match.params.id)) : null;

  return (
    <div>
      <Link style={padding} to="/">
        home
      </Link>
      <Link style={padding} to="/wines">
        Wines
      </Link>
      <Link style={padding} to="/mywines">
        MyWines
      </Link>
      <Link style={padding} to="/addwine">
        Add Wine
      </Link>
      {user ? (
        <button onClick={handleLogout}>Log out ({user.name})</button>
      ) : (
        <Link style={padding} to="/login">
          Login
        </Link>
      )}

      <Routes>
        <Route path="/wines/:id" element={<WineSingle wine={wine} />} />
        <Route
          path="/mywines/:id"
          element={<MyWine id={wine?.id} wine={wine} deleteWine={deleteWine} />}
        />
        <Route path="/mywines" element={<MyWines wines={wines} deleteWine={deleteWine} />} />
        <Route path="/wines" element={<WineList wineList={wineList} />} />
        <Route path="/addwine" element={<MyWineForm addWine={addWine} />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm login={login} />} />
      </Routes>

      <Footer />
    </div>

    //   <h2>Search wines</h2>
    //   <div className="search-container">
    //     <input type="text" placeholder="Search.." value={searched} onChange={handleSearch} />
    //   </div>

    //   <div className="search-container">
    //     <h2>Search Results</h2>
    //     <ul>
    //       {filteredItems.map((item) => (
    //         <li key={item.id}>
    //           <strong>{item.name}</strong>: {item.description}{' '}
    //           {/* <button onClick={() => deleteItem(item.id)}>Delete</button> */}
    //         </li>
    //       ))}
    //     </ul>
    //     {searched.trim() !== '' && filteredItems.length === 0 && <p>No matching wines found.</p>}
    //   </div>

    //   <div className="search-container">
    //     <h2>My favourites</h2>
    //     <ul>
    //       {items.map((item) => (
    //         <li className="favourite-item" key={item.id}>
    //           <strong>{item.name}</strong>: {item.description}{' '}
    //           <button onClick={() => deleteItem(item.id)}>Delete</button>
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    //   {error && <div className="error">{error}</div>}
    //   {user && myWineForm()}
    //   <br />
    //   <div>
    //     {users[0]?.name}
    //     <ul>
    //       {users.map((item) => (
    //         <li key={item.id}>
    //           <strong>{item.name}</strong>:{' '}
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    //   <Footer />
    // </div>
  );
};
export default App;
