import { Navigate, Outlet } from 'react-router-dom';

type User = {
  id: number;
  name: string;
  username: string;
};

type PrivateRouteProps = {
  user: User | null;
  redirectPath?: string;
};

const PrivateRoute = ({ user, redirectPath = '/' }: PrivateRouteProps) => {
  //console.log(user)

  return user ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default PrivateRoute;
