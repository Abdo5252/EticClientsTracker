import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  Users, 
  FileUp, 
  CreditCard, 
  BarChart3, 
  FileSpreadsheet, 
  Settings, 
  LogOut
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Navigation items with Lucide React icons
  const navItems = [
    { path: '/', label: t('navigation.dashboard'), icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/clients', label: t('navigation.clients'), icon: <Users className="h-5 w-5" /> },
    { path: '/invoices', label: t('navigation.invoices'), icon: <FileUp className="h-5 w-5" /> },
    { path: '/payments', label: t('navigation.payments'), icon: <CreditCard className="h-5 w-5" /> },
    { path: '/reports', label: t('navigation.reports'), icon: <BarChart3 className="h-5 w-5" /> },
    { path: '/client-upload', label: t('navigation.clientUpload'), icon: <FileSpreadsheet className="h-5 w-5" /> },
    { path: '/settings', label: t('navigation.settings'), icon: <Settings className="h-5 w-5" /> }
  ];
  
  return (
    <aside className={cn("bg-primary-800 text-white w-64 flex-shrink-0 flex flex-col h-screen border-l border-primary-700", className)}>
      <div className="p-4 border-b border-primary-700">
        <h2 className="text-xl font-bold">{t('common.appName')}</h2>
        <p className="text-sm text-primary-200">{t('common.appDescription')}</p>
      </div>
      
      <nav className="mt-4 px-2 flex-grow overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <a 
                href={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg transition-colors",
                  location === item.path 
                    ? "bg-primary-700 text-white" 
                    : "text-primary-100 hover:bg-primary-700 hover:text-white"
                )}
              >
                <span className="ml-3 flex items-center justify-center">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </a>
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
            className="mt-3 w-full flex items-center justify-center py-2 px-4 rounded-lg border border-primary-600 text-primary-200 hover:bg-primary-700 transition-colors"
          >
            <LogOut className="h-4 w-4 ml-2" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
