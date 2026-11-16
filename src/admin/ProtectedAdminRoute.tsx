import React, { useEffect } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminLayout } from './AdminLayout';

export const ProtectedAdminRoute: React.FC = () => {
  const { isAuthenticated, authLoading, activeSection } = useAdmin();

  useEffect(() => {
    if (authLoading) return;

    const currentPath = window.location.pathname.toLowerCase();

    if (!isAuthenticated) {
      if (currentPath !== '/admin/login') {
        window.history.replaceState(null, '', '/admin/login');
      }
      return;
    }

    // Authenticated admin: prevent staying on /admin or /admin/login
    if (currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/login') {
      const target = activeSection ? `/admin/${activeSection}` : '/admin/dashboard';
      window.history.replaceState(null, '', target);
    }
  }, [isAuthenticated, authLoading, activeSection]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-[#1C1917]">
        <div className="w-12 h-12 rounded-full bg-[#F4EFEB] border border-[#E8E0D5] flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-[#1C1917] stroke-[1.5]" />
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#57534E] font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-[#1C1917]" />
          <span>Verifying Studio Session</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return <AdminLayout />;
};
