import './App.css';

import { Routes, Route, useMatch } from 'react-router-dom';
import NavBAr from './components/common/NavBar';
import Footer from './components/common/Footer';
import MyWineForm from './pages/MyWineForm';
import MyWines from './pages/MyWines';
import WineDetail from './components/WineDetail';
import { Container } from '@mui/material';

import WineList from './pages/WineList';
import MyWine from './components/MyWine';
import Home from './pages/Home';
import LoginForm from './pages/LoginForm';
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
  const { user } = useAuthContext();
  const { notification } = useNotificationContext();
  const { myWines, addWine, isLoading: myWinesLoading } = useMyWinesContext();
  const { wineList, isLoading: wineListLoading } = useWineListContext();

  const match = useMatch('/mywines/:id');
  const wine = match ? myWines.find((w) => w.id === Number(match.params.id)) : null;

  const wineListMatch = useMatch('/wines/:id');
  const wineListItem = wineListMatch
    ? wineList.find((w) => w.id === Number(wineListMatch.params.id))
    : null;

  return (
    //sx is MUI's styling prop a shortcut for inline styles
    <div>
      <NavBAr />
      <Container sx={{ padding: '30px 0 ' }}>
        <Notification notification={notification} />
        <Routes>
          <Route element={<PrivateRoute user={user} redirectPath="/login" />}>
            <Route path="/addwine" element={<MyWineForm addWine={addWine} />} />
            <Route path="/mywines" element={<MyWines />} />
            <Route path="/mywines/:id" element={<MyWine id={wine?.id} wine={wine} isLoading={myWinesLoading} />} />
          </Route>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/wines" element={<WineList wineList={wineList} isLoading={wineListLoading} />}/>
          <Route path="/wines/:id" element={<WineDetail wine={wineListItem} isLoading={wineListLoading} />} />
        </Routes>
      </Container>
      <Footer />
    </div>
  );
};
export default App;
