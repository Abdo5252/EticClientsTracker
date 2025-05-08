import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { t } from '@/lib/i18n';
import { 
  Menu, 
  Bell, 
  Calendar, 
  ChevronDown, 
  Search,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
  isDesktopSidebarOpen?: boolean;
  onToggleDesktopSidebar?: () => void;
}

export function Header({ 
  title, 
  onToggleSidebar, 
  isDesktopSidebarOpen, 
  onToggleDesktopSidebar 
}: HeaderProps) {
  const [location] = useLocation();
  const [timeFilter, setTimeFilter] = useState<string>('today');
  
  // Get title based on current location
  const getTitle = () => {
    if (title) return title;
    
    switch (location) {
      case '/':
        return t('dashboard.title');
      case '/clients':
        return t('clients.title');
      case '/invoices':
        return t('invoices.title');
      case '/payments':
        return t('payments.title');
      case '/reports':
        return t('reports.title');
      case '/client-upload':
        return t('clientUpload.title');
      case '/settings':
        return t('settings.title');
      default:
        return t('common.appName');
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button 
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors" 
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* Desktop sidebar toggle (visible only on medium and larger screens) */}
        <div className="hidden md:block">
          <button 
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors" 
            onClick={onToggleDesktopSidebar}
            aria-label={isDesktopSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isDesktopSidebarOpen ? (
              <PanelLeftClose className="h-6 w-6" />
            ) : (
              <PanelLeftOpen className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Page Title */}
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl flex-1 text-right md:text-center">{getTitle()}</h1>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notifications */}
          <button className="relative text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          {/* Time Filter Dropdown - Only show on dashboard */}
          {location === '/' && (
            <div className="relative">
              <button className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 text-sm hover:border-blue-500 transition-colors">
                <Calendar className="h-4 w-4 ml-2 text-gray-500" />
                <span>
                  {timeFilter === 'today' && t('dashboard.today')}
                  {timeFilter === 'yesterday' && t('dashboard.yesterday')}
                  {timeFilter === 'week' && t('dashboard.week')}
                  {timeFilter === 'month' && t('dashboard.month')}
                </span>
                <ChevronDown className="mr-1 h-4 w-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Search Bar - Only show on relevant pages */}
      {(location === '/clients' || location === '/invoices' || location === '/payments') && (
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('clients.search')}
              className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </div>
        </div>
      )}
    </header>
  );
}
