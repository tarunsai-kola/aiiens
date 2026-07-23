import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  // ── Generic / Admin / Other Roles ──
  { to: '/dashboard',    label: 'Dashboard',    icon: '🏠', roles: ['admin','doctor','nurse','pharmacist','lab_technician','patient'] },
  { to: '/patients',     label: 'Patients',     icon: '🧑‍⚕️', roles: ['admin','doctor','nurse'] },
  { to: '/doctors',      label: 'Doctors',      icon: '👨‍⚕️', roles: ['admin','doctor'] },
  { to: '/appointments', label: 'Appointments', icon: '📅', roles: ['admin','doctor','nurse'] },
  { to: '/billing',      label: 'Billing',      icon: '💳', roles: ['admin'] },
  { to: '/pharmacy',     label: 'Pharmacy',     icon: '💊', roles: ['admin','pharmacist'] },
  { to: '/laboratory',   label: 'Laboratory',   icon: '🔬', roles: ['admin','lab_technician','doctor'] },
  { to: '/admin/staff',  label: 'Staff Directory', icon: '👥', roles: ['admin'] },

  // ── Receptionist (OP Desk) Custom ──
  { to: '/opdesk',             label: 'Internal Home',      icon: '🏥', roles: ['receptionist'] },
  { to: '/opdesk/registration',label: 'OPD Registration',   icon: '👤', roles: ['receptionist'] },
  { to: '/opdesk/vitals',      label: 'Vital Screening',    icon: '📈', roles: ['receptionist'] },
  { to: '/opdesk/history',     label: 'Previous OPD\'s',    icon: '🕒', roles: ['receptionist'] },
  { to: '/opdesk/billing',     label: 'Payments & Billing', icon: '💳', roles: ['receptionist'] },
  { to: '/opdesk/emergency',   label: 'Emergency OPD',      icon: '🚑', roles: ['receptionist'] },
  { to: '/opdesk/staff',       label: 'Staff Management',   icon: '👥', roles: ['receptionist'] },
];

function Sidebar() {
  const { user } = useAuth();
  const roleSlug = user?.roleId?.slug || user?.role;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !roleSlug || item.roles.includes(roleSlug)
  );

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
          H
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm">HMS</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
            {user?.firstName?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{roleSlug}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
