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
      {isDesktopSidebarOpen && (
        <Sidebar className="hidden md:flex" />
      )}
      
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
        
        {/* Desktop Sidebar Toggle Button (fixed position) */}
        <button 
          onClick={toggleDesktopSidebar}
          className="fixed top-20 right-5 z-40 bg-white p-2 rounded-full shadow-md border border-gray-200 hidden md:flex hover:bg-gray-100 transition-colors"
          aria-label={isDesktopSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isDesktopSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-gray-600" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 text-gray-600" />
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
