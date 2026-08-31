import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import userServise from '../services/users';
import { useNotificationContext } from '../context/NotificationContext';

type User = {
  id: number;
  name: string;
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { showNotification } = useNotificationContext();
  const navigate = useNavigate();

  // useEffect: runs after the first render to perform side-effects.
  // Here it fetches the items from the backend API and sets state.
  // Runs once because the dependency array is empty (`[]`).
  // TODO move to hooks
  useEffect(() => {
    userServise
      .getAll()
      .then((initialUsers: User[]) => {
        setUsers(initialUsers);
      })
      .catch((error: unknown) => {
        // GET /api/users is admin-only server-side (403 for everyone else) —
        // send non-admins back home instead of showing an empty/broken page.
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          navigate('/');
          return;
        }
        console.error('Error loading users');
        showNotification('Unable to load users', 'error');
      });
  }, [navigate, showNotification]);

  return (
    <div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
