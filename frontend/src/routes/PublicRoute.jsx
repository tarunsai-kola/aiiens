import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute — Redirects authenticated users away from login/register pages.
 */
function PublicRoute() {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) return null;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default PublicRoute;
