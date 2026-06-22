import './App.css';
import { useState, useEffect } from 'react';
import myWineService from './services/myWines';

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Footer from './components/Footer';
import MyWineForm from './components/MyWineForm';
import MyWines from './components/MyWines';
import Home from './components/Home';

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
const App = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [error, setError] = useState('');

  //const wineFormRef = useRef();

  // useEffect: runs after the first render to perform side-effects.
  // Here it fetches the items from the backend API and sets state.
  // Runs once because the dependency array is empty (`[]`).
  useEffect(() => {
    console.log('effect');
    myWineService
      .getAll()
      .then((initialWines) => {
        setWines(initialWines);
      })
      .catch(() => setError('Unable to load items'));
    console.error('Error loading item');
  }, []);

  // const myWineForm = () => (
  //   <Toggable buttonLabel="add wine">
  //     <MyWineForm addItem={addItem} />
  //   </Toggable>
  // );
  const addWine = (newWineObject: Wine) => {
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

  const padding = {
    padding: 5,
  };

  return (
    <Router>
      <div>
        <Link style={padding} to="/">
          home
        </Link>
        <Link style={padding} to="/mywines">
          My Wines
        </Link>
        <Link style={padding} to="/addwine">
          Add Wine
        </Link>
      </div>

      <Routes>
        <Route path="/mywines" element={<MyWines wines={wines} deleteWine={deleteWine} />} />
        <Route path="/addwine" element={<MyWineForm addWine={addWine} />} />
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </Router>

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
