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
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <div className="text-lg font-medium">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:flex" />
      
      {/* Mobile Sidebar - conditionally shown with overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity" 
            onClick={toggleMobileSidebar}
            aria-hidden="true"
          ></div>
          <div className="absolute top-0 right-0 h-full w-64 transition-transform">
            <Sidebar className="shadow-xl" />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} onToggleSidebar={toggleMobileSidebar} />
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
      </main>
      
      {/* Mobile navigation bar */}
      <MobileNavigation />
    </div>
  );
}
