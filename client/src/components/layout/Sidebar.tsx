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
    <aside className={cn("bg-blue-900 text-white w-64 flex-shrink-0 flex flex-col h-screen border-l border-blue-800", className)}>
      <div className="p-4 border-b border-blue-800">
        <h2 className="text-xl font-bold text-white">{t('common.appName')}</h2>
        <p className="text-sm text-blue-200">{t('common.appDescription')}</p>
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
                    ? "bg-blue-800 text-white" 
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                )}
              >
                <span className="ml-3 flex items-center justify-center text-white">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center ml-3 text-white">
              <span className="text-lg font-semibold">
                {user.displayName && user.displayName.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-white">{user.displayName}</h4>
              <p className="text-xs text-blue-200">{user.role === 'admin' ? 'مدير النظام' : 'مستخدم'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center py-2 px-4 rounded-lg border border-blue-700 bg-blue-800 text-white hover:bg-blue-700 transition-colors"
          >
            <LogOut className="h-4 w-4 ml-2" />
            <span>{t('common.logout')}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
