import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  Building2, LayoutDashboard, CreditCard, 
  LifeBuoy, ServerCrash, LogOut
} from 'lucide-react';

export default function SaaSLayout() {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Platform Overview', path: '/saas/dashboard', icon: LayoutDashboard },
    { name: 'Hospitals (Tenants)', path: '/saas/hospitals', icon: Building2 },
    { name: 'Subscription Plans', path: '/saas/plans', icon: CreditCard },
    { name: 'Support Tickets', path: '/saas/tickets', icon: LifeBuoy },
    { name: 'System Logs', path: '/saas/logs', icon: ServerCrash },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Aiiens Global
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-widest">SaaS Super Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
             <div className="text-sm">
                <p className="font-bold">{user?.firstName}</p>
                <p className="text-xs text-slate-500">Platform Admin</p>
             </div>
             <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-red-500/10 rounded-lg transition-colors">
               <LogOut size={16} />
             </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-8">
           <span className="text-sm text-slate-500 font-mono">Platform Command Center / <span className="text-slate-300">Live Environment</span></span>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
