import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { t } from '@/lib/i18n';

interface HeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
}

export function Header({ title, onToggleSidebar }: HeaderProps) {
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
        <div className="md:hidden">
          <button className="text-gray-500 hover:text-gray-700" onClick={onToggleSidebar}>
            <i className="ri-menu-line text-2xl"></i>
          </button>
        </div>
        
        <h1 className="text-xl font-bold text-gray-800 md:text-2xl hidden md:block">{getTitle()}</h1>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          <button className="relative text-gray-500 hover:text-gray-700">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-error"></span>
          </button>
          
          <div className="relative">
            <button className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-500">
              <span>
                {timeFilter === 'today' && t('dashboard.today')}
                {timeFilter === 'yesterday' && t('dashboard.yesterday')}
                {timeFilter === 'week' && t('dashboard.week')}
                {timeFilter === 'month' && t('dashboard.month')}
              </span>
              <i className="ri-arrow-down-s-line mr-1"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder={t('clients.search')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" 
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
        </div>
      </div>
    </header>
  );
}
