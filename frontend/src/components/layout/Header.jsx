import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import { notificationApi } from '../../api/notifications.api';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/patients':     'Patients',
  '/doctors':      'Doctors',
  '/appointments': 'Appointments',
  '/billing':      'Billing',
  '/pharmacy':     'Pharmacy',
  '/laboratory':   'Laboratory',
};

function Header() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Setup Socket
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token: localStorage.getItem('token') }
      });
      
      socket.on('notification', (data) => {
        toast.success(data.title + ': ' + data.message);
        setNotifications(prev => [data, ...prev]);
      });

      return () => socket.disconnect();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationApi.getMyNotifications();
      setNotifications(data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const title = PAGE_TITLES[pathname] || PAGE_TITLES[`/${pathname.split('/')[1]}`] || 'HMS';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <span className="text-xs text-gray-500">{unreadCount} unread</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} onClick={() => markAsRead(n._id)} className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${n.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}>
                      <div className="font-bold text-sm text-gray-800">{n.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                      <div className="text-[10px] text-gray-400 mt-2">{new Date(n.timestamp || n.createdAt).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Logout */}
        <Button variant="ghost" size="sm" onClick={logout} id="logout-btn">
          Sign out
        </Button>
      </div>
    </header>
  );
}

export default Header;
