import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute — Renders children only if user's role is in allowed list.
 * Redirects to /unauthorized otherwise.
 *
 * Usage:
 *   <Route element={<RoleRoute roles={['admin', 'doctor']} />}>
 *     <Route path="..." element={<SecurePage />} />
 *   </Route>
 */
function RoleRoute({ roles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const roleSlug = user?.roleId?.slug || user?.role;
  if (!roles.includes(roleSlug)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
