import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: number | string;
  currency?: string;
  icon: string;
  change?: number;
  color: 'primary' | 'secondary' | 'warning' | 'success';
  unit?: string;
}

export function DashboardCard({ 
  title, 
  value, 
  currency, 
  icon, 
  change, 
  color,
  unit
}: DashboardCardProps) {
  const colorClasses = {
    primary: {
      border: 'border-primary',
      bg: 'bg-primary-50',
      text: 'text-primary'
    },
    secondary: {
      border: 'border-secondary',
      bg: 'bg-secondary-light',
      text: 'text-secondary'
    },
    warning: {
      border: 'border-warning',
      bg: 'bg-accent-light',
      text: 'text-warning'
    },
    success: {
      border: 'border-success',
      bg: 'bg-green-50',
      text: 'text-success'
    }
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-sm p-6 border-t-4", colorClasses[color].border)}>
      <div className="flex justify-between">
        <div>
          <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
          <div className="font-bold text-2xl">
            {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
            {' '}
            <span className="text-sm font-normal">{currency || unit || ''}</span>
          </div>
          {change !== undefined && (
            <div className={cn(
              "mt-1 text-xs flex items-center",
              change >= 0 ? "text-success" : "text-error"
            )}>
              <i className={cn(
                "ml-1",
                change >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"
              )}></i>
              <span>{Math.abs(change)}% مقارنة بالأمس</span>
            </div>
          )}
        </div>
        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", colorClasses[color].bg)}>
          <i className={cn(icon, "text-xl", colorClasses[color].text)}></i>
        </div>
      </div>
    </div>
  );
}
