import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { 
  LayoutDashboard, 
  Users, 
  FileUp, 
  CreditCard, 
  MoreHorizontal,
  BarChart3,
  Menu
} from 'lucide-react';

interface MobileNavigationProps {
  onToggleSidebar?: () => void;
}

export function MobileNavigation({ onToggleSidebar }: MobileNavigationProps) {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/', label: t('navigation.dashboard'), icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/clients', label: t('navigation.clients'), icon: <Users className="h-5 w-5" /> },
    { path: '/invoices', label: t('navigation.invoices'), icon: <FileUp className="h-5 w-5" /> },
    { path: '/payments', label: t('navigation.payments'), icon: <CreditCard className="h-5 w-5" /> },
    { path: '/reports', label: t('navigation.reports'), icon: <BarChart3 className="h-5 w-5" /> }
  ];
  
  return (
    <div className="md:hidden fixed bottom-0 right-0 left-0 bg-blue-900 z-50 shadow-lg border-t border-blue-800">
      <div className="flex justify-around py-2">
        {/* Sidebar toggle button */}
        <button
          onClick={onToggleSidebar}
          className="flex flex-col items-center justify-center px-3 py-2 rounded-lg text-white hover:text-white hover:bg-blue-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <div className="mb-1">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">{t('navigation.menu')}</span>
        </button>
        
        {/* Navigation links */}
        {navItems.map((item) => (
          <a 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors",
              location === item.path 
                ? "text-white bg-blue-800" 
                : "text-white hover:text-white hover:bg-blue-800"
            )}
          >
            <div className="mb-1">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
