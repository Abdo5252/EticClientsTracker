import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { useAuth } from '@/hooks/use-auth';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Navigation items
  const navItems = [
    { path: '/', label: t('navigation.dashboard'), icon: 'ri-dashboard-line' },
    { path: '/clients', label: t('navigation.clients'), icon: 'ri-user-line' },
    { path: '/invoices', label: t('navigation.invoices'), icon: 'ri-file-upload-line' },
    { path: '/payments', label: t('navigation.payments'), icon: 'ri-money-dollar-circle-line' },
    { path: '/reports', label: t('navigation.reports'), icon: 'ri-file-chart-line' },
    { path: '/client-upload', label: t('navigation.clientUpload'), icon: 'ri-file-excel-line' },
    { path: '/settings', label: t('navigation.settings'), icon: 'ri-settings-line' }
  ];
  
  return (
    <aside className={cn("bg-primary-800 text-white w-64 flex-shrink-0 hidden md:flex md:flex-col h-screen", className)}>
      <div className="p-4 border-b border-primary-700">
        <h2 className="text-xl font-bold">{t('common.appName')}</h2>
        <p className="text-sm text-primary-200">{t('common.appDescription')}</p>
      </div>
      
      <nav className="mt-6 px-2 flex-grow overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a className={cn(
                  "flex items-center px-4 py-3 rounded-lg",
                  location === item.path 
                    ? "bg-primary-700" 
                    : "hover:bg-primary-700"
                )}>
                  <i className={cn(item.icon, "ml-3 text-xl")}></i>
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center ml-3">
              <span className="text-lg font-semibold">
                {user.displayName && user.displayName.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-medium">{user.displayName}</h4>
              <p className="text-xs text-primary-200">{user.role === 'admin' ? 'مدير النظام' : 'مستخدم'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center py-2 px-4 rounded-lg border border-primary-600 text-primary-200 hover:bg-primary-700"
          >
            <i className="ri-logout-box-line ml-2"></i>
            <span>{t('common.logout')}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
