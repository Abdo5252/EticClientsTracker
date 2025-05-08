import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { t } from '@/lib/i18n';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && location !== '/login') {
      setLocation('/login');
    }
  }, [loading, isAuthenticated, location, setLocation]);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedDesktopSidebarState = localStorage.getItem('desktopSidebarOpen');
    if (savedDesktopSidebarState !== null) {
      setIsDesktopSidebarOpen(savedDesktopSidebarState === 'true');
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('desktopSidebarOpen', isDesktopSidebarOpen.toString());
  }, [isDesktopSidebarOpen]);

  if (!loading && !isAuthenticated && location !== '/login') {
    return null;
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <div className="text-lg font-medium">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar - controlled by toggle */}
      <div className={`hidden md:block transition-all duration-300 ${isDesktopSidebarOpen ? 'w-64' : 'w-0'}`}>
        {isDesktopSidebarOpen && <Sidebar />}
      </div>
      
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
        <Header 
          title={title} 
          onToggleSidebar={toggleMobileSidebar}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          onToggleDesktopSidebar={toggleDesktopSidebar}
        />
        
        {/* Desktop Sidebar Toggle Button (fixed position) - properly positioned for RTL */}
        <button 
          onClick={toggleDesktopSidebar}
          className={`fixed top-4 ${isDesktopSidebarOpen ? 'right-[260px]' : 'right-4'} z-50 bg-blue-50 p-2 rounded-full shadow-lg border border-blue-200 hidden md:flex items-center justify-center hover:bg-blue-100 transition-all duration-300`}
          aria-label={isDesktopSidebarOpen ? t('navigation.closeSidebar') : t('navigation.openSidebar')}
        >
          {isDesktopSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-blue-700" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 text-blue-700" />
          )}
        </button>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
      </main>
      
      {/* Mobile navigation bar */}
      <MobileNavigation onToggleSidebar={toggleMobileSidebar} />
    </div>
  );
}
