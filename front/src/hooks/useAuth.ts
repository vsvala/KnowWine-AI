import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import loginService from '../services/login';
import myWineService from '../services/myWines';
import userService from '../services/users';

type User = {
  id: number;
  name: string;
  username: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedWineappUser');
    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(loggedUser);
      myWineService.setToken(loggedUser.token);
      userService.setToken(loggedUser.token);
    }
  }, []);
  
  const login = async (username: string, password: string) => {
    console.log('loggin in ');
    const user = await loginService.login({ username, password });
    window.localStorage.setItem('loggedWineappUser', JSON.stringify(user));
    myWineService.setToken(user.token);
    userService.setToken(user.token);
    setUser(user);
    navigate('/mywines');
  };

  const logout = () => {
    window.localStorage.removeItem('loggedWineappUser');
    myWineService.setToken('');
    userService.setToken('');
    setUser(null);
    navigate('/login');
  };
  return { user, login, logout };
};
