import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNotificationContext } from '../context/NotificationContext';
import { useAuthContext } from '../context/AuthContext';
import myWineService from '../services/myWines';
import type { MyWine } from '../types/wine';

export const useMyWines = () => {
  const [myWines, setMyWines] = useState<MyWine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotificationContext();
  const { user } = useAuthContext();

  useEffect(() => {
    // Skip the fetch until a user is logged in - the endpoint requires
    // auth, and firing it while logged out just produces a spurious 401.
    if (!user) return;
    const fetchMyWines = async () => {
      try {
        const initialMyWines = await myWineService.getAll();
        setMyWines(initialMyWines);
      } catch (error) {
        // Auth failures already trigger a redirect via apiClient's onAuthExpired handler,
        // so skip the toast here to avoid a confusing double message.
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        showNotification('Unable to load myWines', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyWines();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // prevent unnecessary re-renders by memoizing the addWine and deleteWine functions
  const addWine = useCallback(
    async (newWineObject: MyWine) => {
      try {
        const returnedWine = await myWineService.create(newWineObject);
        setMyWines((prev) => prev.concat(returnedWine));
        showNotification(`Wine '${returnedWine.name}' added!`, 'success');
        return true;
      } catch (error) {
        const message = axios.isAxiosError<{ error: string }>(error)
          ? error.response?.data?.error
          : undefined;
        showNotification(message ?? 'Error adding item', 'error');
        return false;
      }
    },
    [showNotification]
  );
  // prevent unnecessary re-renders by memoizing the addWine and deleteWine functions
  const deleteWine = useCallback(
    async (id: number) => {
      const wineToDelete = myWines.find((item) => item.id === id);
      try {
        await myWineService.deleteWine(id);
        setMyWines((prev) => prev.filter((item) => item.id !== id));
        showNotification(`Wine '${wineToDelete?.name}' deleted!`, 'success');
        return true;
      } catch {
        showNotification('Error deleting item', 'error');
        return false;
      }
    },
    [myWines, showNotification]
  );

  // Return a memoized object containing the state and functions to prevent unnecessary re-renders
  return useMemo(
    () => ({ myWines, addWine, deleteWine, isLoading }),
    [myWines, addWine, deleteWine, isLoading]
  );
};
