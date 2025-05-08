import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { 
  LayoutDashboard, 
  Users, 
  FileUp, 
  CreditCard, 
  MoreHorizontal,
  BarChart3
} from 'lucide-react';

export function MobileNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/', label: t('navigation.dashboard'), icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/clients', label: t('navigation.clients'), icon: <Users className="h-5 w-5" /> },
    { path: '/invoices', label: t('navigation.invoices'), icon: <FileUp className="h-5 w-5" /> },
    { path: '/payments', label: t('navigation.payments'), icon: <CreditCard className="h-5 w-5" /> },
    { path: '/reports', label: t('navigation.reports'), icon: <BarChart3 className="h-5 w-5" /> }
  ];
  
  return (
    <div className="md:hidden fixed bottom-0 right-0 left-0 bg-primary-800 z-50 shadow-lg border-t border-primary-700">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <a 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors",
              location === item.path 
                ? "text-white" 
                : "text-primary-200 hover:text-white"
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
