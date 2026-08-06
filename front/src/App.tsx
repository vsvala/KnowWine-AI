import './App.css';

import { Routes, Route, Link, useMatch } from 'react-router-dom';
import Footer from './components/common/Footer';
import MyWineForm from './pages/MyWineForm';
import MyWines from './pages/MyWines';
import WineDetail from './components/WineDetail';

import WineList from './pages/WineList';
import MyWine from './components/MyWine';
import Home from './pages/Home';
import LoginForm from './pages/LoginForm';
import { Container, AppBar, Toolbar, Button } from '@mui/material';
import Notification from './components/common/Notification';
//import { useNavigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { useAuthContext } from './context/AuthContext';
import { useNotificationContext } from './context/NotificationContext';
import { useMyWinesContext } from './context/MyWinesContext';
import { useWineListContext } from './context/WineListContext';

// curl http://localhost:3001/api/users
// TODO aDD to favourotes list (wine) after search... changing importannce  2
// TODO revent the user from being able to add same wine multiple
//window.localStorage.removeItem('loggedNoteappUser')copy
// kokonaan nollaavaa komentoa:window.localStorage.clear()

const App = () => {
  const { user, logout } = useAuthContext();
  const { notification } = useNotificationContext();
  const { myWines, addWine } = useMyWinesContext();
  const { wineList, isLoading: wineListLoading } = useWineListContext();

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

  const padding = {
    padding: 5,
  };

  const match = useMatch('/mywines/:id');
  const wine = match ? myWines.find((w) => w.id === Number(match.params.id)) : null;

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
          <Route element={<PrivateRoute user={user} redirectPath="/login" />}>
            <Route path="/addwine" element={<MyWineForm addWine={addWine} />} />
            <Route path="/mywines" element={<MyWines />} />
            <Route path="/mywines/:id" element={<MyWine id={wine?.id} wine={wine} />} />
          </Route>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/wines" element={<WineList wineList={wineList} isLoading={wineListLoading} />}/>
          <Route path="/wines/:id" element={<WineDetail wine={wineListItem} />} />
        </Routes>
      </Container>
      <Footer />
    </div>
  );
};
export default App;
