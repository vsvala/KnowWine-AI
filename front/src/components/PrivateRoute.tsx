import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { MyWinesProvider } from '../context/MyWinesContext';

type PrivateRouteProps = {
  redirectPath?: string;
};

const PrivateRoute = ({ redirectPath = '/' }: PrivateRouteProps) => {
const { user, isInitializing } = useAuthContext();

  if (isInitializing) return null; // tai esim. latausanimaatio
  if (!user) return <Navigate to={redirectPath} replace />;

  return (
    <MyWinesProvider>
      <Outlet />
    </MyWinesProvider>
  );
};

export default PrivateRoute;
