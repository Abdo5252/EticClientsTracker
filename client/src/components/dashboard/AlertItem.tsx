import { cn } from '@/lib/utils';

interface AlertItemProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
}

export function AlertItem({ type, title, description }: AlertItemProps) {
  const typeConfig = {
    error: {
      icon: 'ri-error-warning-line',
      bg: 'bg-red-100',
      border: 'border-red-600',
      textTitle: 'text-red-800',
    },
    warning: {
      icon: 'ri-alert-line',
      bg: 'bg-yellow-100',
      border: 'border-yellow-600',
      textTitle: 'text-yellow-800',
    },
    info: {
      icon: 'ri-information-line',
      bg: 'bg-blue-100',
      border: 'border-blue-600',
      textTitle: 'text-blue-800',
    },
    success: {
      icon: 'ri-checkbox-circle-line',
      bg: 'bg-green-100',
      border: 'border-green-600',
      textTitle: 'text-green-800',
    }
  };

  const config = typeConfig[type];

  return (
    <div className={cn(config.bg, "border-r-4", config.border, "px-4 py-3 rounded")}>
      <div className="flex">
        <div className="flex-shrink-0 ml-3">
          <i className={cn(config.icon, config.textTitle)}></i>
        </div>
        <div>
          <p className={cn("text-sm font-medium", config.textTitle)}>{title}</p>
          <p className="text-xs text-gray-800">{description}</p>
        </div>
      </div>
    </div>
  );
}
