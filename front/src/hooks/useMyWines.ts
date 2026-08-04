import { useState, useEffect } from 'react';
import { useNotificationContext } from '../context/NotificationContext';
import { useAuthContext } from '../context/AuthContext';
import myWineService from '../services/myWines';

type Wine = {
  id: number;
  name: string;
  description: string;
};

export const useMyWines = () => {
  const [myWines, setMyWines] = useState<Wine[]>([]);
  const { showNotification } = useNotificationContext();
  const { user } = useAuthContext();

  useEffect(() => {
    // Skip the fetch until a user is logged in - the endpoint requires
    // auth, and firing it while logged out just produces a spurious 401.
    if (!user) return;
    myWineService
      .getAll()
      .then((initialMyWines) => {
        setMyWines(initialMyWines);
      })
      .catch(() => showNotification('Unable to load myWines', 'error'));
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const addWine = (newWineObject: Wine) => {
    console.log(newWineObject);
    myWineService
      .create(newWineObject)
      .then((returnedWine) => {
        setMyWines((prev) => prev.concat(returnedWine));
        showNotification(`Wine '${returnedWine.name}' added!`, 'success');
      })
      .catch((err) => {
        const message = err.response?.data?.error ?? 'Error adding item';
        showNotification(message, 'error');
      });
  };
  const deleteWine = (id: number) => {
    const wineToDelete = myWines.find((item) => item.id === id);
    console.log('delete wine with id', id, wineToDelete);

    return myWineService
      .deleteWine(id)
      .then(() => {
        console.log('wine deleted', id);
        setMyWines((prev) => prev.filter((item) => item.id !== id));
        showNotification(`Wine '${wineToDelete?.name}' deleted!`, 'success');
        return true;
      })
      .catch(() => {
        showNotification('Error deleting item', 'error');
        return false;
      });
  };
  return { myWines, addWine, deleteWine };
};
