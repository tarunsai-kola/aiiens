import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { path: '/admin/profile', label: 'Hospital Profile', icon: '🏥' },
  { path: '/admin/departments', label: 'Departments', icon: '🏢' },
  { path: '/admin/staff', label: 'Staff Directory', icon: '👥' },
  { path: '/admin/doctors', label: 'Doctor Profiles', icon: '👨‍⚕️' },
  { path: '/admin/roles', label: 'Roles & Permissions', icon: '🔐' },
  { path: '/admin/settings', label: 'General Settings', icon: '⚙️' },
];

export default function AdminLayout() {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950">
      {/* Settings Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Administration</h2>
          <p className="text-sm text-gray-500 mt-1">Manage hospital configurations</p>
        </div>
        
        <nav className="px-4 pb-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
