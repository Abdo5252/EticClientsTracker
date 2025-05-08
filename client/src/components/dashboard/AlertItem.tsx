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
      bg: 'bg-red-50',
      border: 'border-error',
      textTitle: 'text-error',
    },
    warning: {
      icon: 'ri-alert-line',
      bg: 'bg-yellow-50',
      border: 'border-warning',
      textTitle: 'text-warning',
    },
    info: {
      icon: 'ri-information-line',
      bg: 'bg-blue-50',
      border: 'border-primary',
      textTitle: 'text-primary',
    },
    success: {
      icon: 'ri-checkbox-circle-line',
      bg: 'bg-green-50',
      border: 'border-success',
      textTitle: 'text-success',
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
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
