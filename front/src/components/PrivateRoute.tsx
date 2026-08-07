import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';


type PrivateRouteProps = {
  redirectPath?: string;
};

const PrivateRoute = ({ redirectPath = '/' }: PrivateRouteProps) => {
  //console.log(user)
const { user } = useAuthContext();

  return user ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default PrivateRoute;
