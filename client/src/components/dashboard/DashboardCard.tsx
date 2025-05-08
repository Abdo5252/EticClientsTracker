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
      border: 'border-blue-600',
      bg: 'bg-blue-100',
      text: 'text-blue-800'
    },
    secondary: {
      border: 'border-purple-600',
      bg: 'bg-purple-100',
      text: 'text-purple-800'
    },
    warning: {
      border: 'border-orange-600',
      bg: 'bg-orange-100',
      text: 'text-orange-800'
    },
    success: {
      border: 'border-green-600',
      bg: 'bg-green-100',
      text: 'text-green-800'
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
              change >= 0 ? "text-green-700" : "text-red-700"
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
