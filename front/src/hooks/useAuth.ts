import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import loginService from '../services/login';
import apiClient from '../services/apiClient';

type User = {
  id: number;
  name: string;
  username: string;
  role: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);

  // On mount, silently try to restore the session from the refresh cookie so a page reload doesn't log the user out.
  useEffect(() => {
    apiClient
      .getRefreshedToken()
      .then((data) => {
        setUser({ id: data.id, name: data.name, username: data.username, role: data.role });
      })
      // no valid refresh-cookie — not logged in, no error, just no user
      .catch(() => {})
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  // loginform does try catch and shows errors so no need to handle errors here, just return the loggedUser
  const login = useCallback(
    async (username: string, password: string) => {
      const loggedUser = await loginService.login({ username, password });
      apiClient.setAccessToken(loggedUser.token);
      setUser(loggedUser);
      navigate('/mywines');
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      await loginService.logout();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      apiClient.setAccessToken(null);
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);
  useEffect(() => {
    apiClient.setOnAuthExpired(logout);
  }, [logout]);

  return useMemo(
    () => ({ user, login, logout, isInitializing }),
    [user, login, logout, isInitializing]
  );
};
