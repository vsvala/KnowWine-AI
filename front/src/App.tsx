import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';

import NavBar from './components/common/NavBar';
import Footer from './components/common/Footer';
import Notification from './components/common/Notification';
import WineDetail from './components/WineDetail';
import MyWine from './components/MyWine';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import LoginForm from './pages/LoginForm';
import WineList from './pages/WineList';
import MyWines from './pages/MyWines';
import MyWineForm from './pages/MyWineForm';
import Users from './pages/Users';

const App = () => {
  return (
    //sx is MUI's styling prop a shortcut for inline styles
    <div>
      <NavBar />
      <Container sx={{ padding: '30px 0 ' }}>
        <Notification />
        <Routes>
          <Route element={<PrivateRoute redirectPath="/login" />}>
            <Route path="/addwine" element={<MyWineForm />} />
            <Route path="/mywines" element={<MyWines />} />
            <Route path="/mywines/:id" element={<MyWine />} />
            <Route path="/users" element={<Users />} />
          </Route>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/wines" element={<WineList />} />
          <Route path="/wines/:id" element={<WineDetail />} />
        </Routes>
      </Container>
      <Footer />
    </div>
  );
};
export default App;
