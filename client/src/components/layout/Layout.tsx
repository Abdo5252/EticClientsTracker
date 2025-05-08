import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { t } from '@/lib/i18n';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && location !== '/login') {
      setLocation('/login');
    }
  }, [loading, isAuthenticated, location, setLocation]);

  if (!loading && !isAuthenticated && location !== '/login') {
    return null;
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:flex" />
      
      {/* Mobile Sidebar - conditionally shown */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={toggleMobileSidebar}></div>
          <Sidebar className="absolute w-64 h-full" />
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Header title={title} onToggleSidebar={toggleMobileSidebar} />
        {children}
      </main>
      
      {/* Mobile navigation bar */}
      <MobileNavigation />
    </div>
  );
}
