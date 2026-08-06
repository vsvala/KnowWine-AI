 import { AppBar, Button, Toolbar } from '@mui/material';  
import {  Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
const NavBar = () => {
      const { user, logout } = useAuthContext();
  
const padding = { padding: 5,};
  const style = { '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } };

   
    return (

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
              {null}
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
    )
   }
export default NavBar;
