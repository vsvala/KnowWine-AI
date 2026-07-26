import './App.css';
import { useState, useEffect } from 'react';
import myWineService from './services/myWines';
//import userService from './services/users';
//import loginService from './services/login';
import wineListService from './services/wineList';

import {  Routes, Route, Link, useMatch } from 'react-router-dom';
import Footer from './components/Footer';
import MyWineForm from './pages/MyWineForm';
import MyWines from './pages/MyWines';
import WineSingle from './components/WineSingle';

import WineList from './pages/WineList';
import MyWine from './components/MyWine';
import Home from './pages/Home';
import LoginForm from './pages/LoginForm';
import { Container, AppBar, Toolbar, Button } from '@mui/material';
import Notification from './components/Notification';
//import { useNavigate } from 'react-router-dom';
import PrivateRoute from './components/common/PrivateRoute'
import { useAuthContext } from './context/AuthContext';
import { useNotificationContext } from './context/NotificationContext';

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

const App = () => {
  const { user, logout } = useAuthContext();
  const [wines, setWines] = useState<Wine[]>([]);
  const [wineList, setWineList] = useState<WineLi[]>([]);
  const { notification, showNotification } = useNotificationContext();

  // useEffect: runs after the first render to perform side-effects.
  // Here it fetches the items from the backend API and sets state.
  // Runs once because the dependency array is empty (`[]`).

  // useEffect(() => {
  //   console.log('useeffect get all users');
  //   userService
  //     .getAll()
  //     .then((initialUsers) => {
  //       setUser(initialUsers);
  //     })
  //     .catch(() => {
  //       console.error('Error loading users');
  //       setNotification({ text: 'Unable to load users', type: 'error' });
  //     });
  // }, []);
  // // console.log('render', items.length, 'items')



  useEffect(() => {
    console.log('effect');
    myWineService
      .getAll()
      .then((initialMyWines) => {
        setWines(initialMyWines);
      })
      .catch(() => showNotification('Unable to load wines', 'error'));
  }, []);

  useEffect(() => {
    //fetch('http://localhost:3001/api/wines')
    wineListService
      .getAll()
      // .then((res) => res.json())
      .then((initialWineList) => {
        setWineList(initialWineList);
      })
      .catch(() => showNotification('Unable to load wineList', 'error'));
    //console.error(err));
  }, []);

  const addWine = (newWineObject: Wine) => {
    console.log(newWineObject);
    myWineService
      .create(newWineObject)
      .then((returnedWine) => {
        setWines((prev) => prev.concat(returnedWine));
        showNotification(  `Wine '${returnedWine.name}' added!`, 'success' );
      })
      .catch((err) => {
        const message = err.response?.data?.error ?? 'Error adding item';
        showNotification(  message, 'error' );
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
        showNotification('Error deleting item', 'error' );
      });
  };


  const padding = {
    padding: 5,
  };

  const match = useMatch('/mywines/:id');
  const wine = match ? wines.find((w) => w.id === Number(match.params.id)) : null;

  const wineListMatch = useMatch('/wines/:id');
  const wineListItem = wineListMatch
    ? wineList.find((w) => w.id === Number(wineListMatch.params.id))
    : null;

  const style = { '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } };

  return (
    //sx is MUI's styling prop a shortcut for inline styles

    <div>
      <AppBar position="static" sx={{ backgroundColor: '#57244d', width: '100%' }}>
        <Toolbar sx={{ padding: 'auto', textAlign: 'center', justifyContent: 'center' }}>
          <Button color="inherit" component={Link} to="/" sx={style}>
            Home
          </Button>
          <Button color="inherit" component={Link} to="/wines" sx={style}>
            Wines
          </Button>
          {user ? (
            <Button color="inherit" component={Link} to="/mywines" sx={style}>
              {' '}
              MyWines
            </Button>
          ) : (
            ''
          )}
          {user ? (
            <Button color="inherit" component={Link} to="/addwine" sx={style}>
              Add Wine
            </Button>
          ) : (
            ''
          )}

          {user ? (
            <button onClick={logout}>Log out ({user.name})</button>
          ) : (
            <Link style={padding} to="/login">
              Login
            </Link>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ padding: '30px; 0px ' }}>
        <Notification notification={notification} />
        <Routes>
         
          <Route element={<PrivateRoute user = {user} redirectPath="/login" />}>
            <Route path="/addwine" element={<MyWineForm addWine={addWine} />} />
            <Route
              path="/mywines/:id"
              element={<MyWine id={wine?.id} wine={wine} deleteWine={deleteWine} />}
            />
            <Route path="/mywines" element={<MyWines wines={wines} deleteWine={deleteWine} />} />
          </Route> 
         
          
          <Route path="/wines" element={<WineList wineList={wineList} />} />
          <Route path="/wines/:id" element={<WineSingle wine={wineListItem} />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm/>} />
        </Routes>
      </Container>
      <Footer />
    </div>
  );
};
export default App;
