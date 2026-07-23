import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * DashboardLayout — Shell that wraps all authenticated pages.
 * Sidebar (left) + Header (top) + main content area (right).
 */
function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6 animate-fade-in"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
