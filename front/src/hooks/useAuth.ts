import { useState, useEffect, useMemo, useCallback } from 'react';
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
      try {
        const loggedUser = JSON.parse(loggedUserJSON);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(loggedUser);
        myWineService.setToken(loggedUser.token);
        userService.setToken(loggedUser.token);
      } catch (error) {
        console.error('Error parsing logged user JSON:', error);
        window.localStorage.removeItem('loggedWineappUser');
      }
    }
  }, []);

  // loginform does try catch and shows errors so no need to handle errors here, just return the loggedUser
  const login = useCallback(async (username: string, password: string) => {
    const loggedUser = await loginService.login({ username, password });
    window.localStorage.setItem('loggedWineappUser', JSON.stringify(loggedUser));
    myWineService.setToken(loggedUser.token);
    userService.setToken(loggedUser.token);
    setUser(loggedUser);
    navigate('/mywines');
  }, [navigate]);

  const logout = useCallback(() => {
    window.localStorage.removeItem('loggedWineappUser');
    myWineService.setToken('');
    userService.setToken('');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return useMemo(() => ({ user, login, logout }), [user, login, logout]);
};
