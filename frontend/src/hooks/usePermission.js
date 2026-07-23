import { useAuth } from '../context/AuthContext';

/**
 * usePermission — Checks if the current user has one of the allowed roles.
 *
 * Usage:
 *   const canCreate = usePermission(['admin', 'receptionist']);
 *   {canCreate && <Button>Add Patient</Button>}
 *
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
function usePermission(allowedRoles = []) {
  const { user } = useAuth();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export default usePermission;
