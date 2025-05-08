import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export function MobileNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/', label: t('navigation.dashboard'), icon: 'ri-dashboard-line' },
    { path: '/clients', label: t('navigation.clients'), icon: 'ri-user-line' },
    { path: '/invoices', label: t('navigation.invoices'), icon: 'ri-file-upload-line' },
    { path: '/payments', label: t('navigation.payments'), icon: 'ri-money-dollar-circle-line' },
    { path: '/more', label: t('navigation.more'), icon: 'ri-more-line' }
  ];
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-primary-800 z-50">
      <div className="flex justify-around py-3">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a className={cn(
              "text-center",
              location === item.path ? "text-white" : "text-primary-200"
            )}>
              <i className={cn(item.icon, "block text-xl")}></i>
              <span className="text-xs">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
