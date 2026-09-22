import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Scroll to top on navigation within admin
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-200 flex">
      {/* Sidebar Component */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Admin Header */}
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dynamic Admin Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
