import { cn } from '@/lib/utils';
import { getRelativeTime } from '@/lib/utils';

interface ActivityItemProps {
  type: 'invoice' | 'payment' | 'overdue' | 'report';
  title: string;
  description: string;
  timestamp: string;
}

export function ActivityItem({ type, title, description, timestamp }: ActivityItemProps) {
  const typeConfig = {
    invoice: {
      icon: 'ri-file-add-line',
      color: 'border-primary',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary'
    },
    payment: {
      icon: 'ri-money-dollar-circle-line',
      color: 'border-secondary',
      bgColor: 'bg-secondary-light',
      textColor: 'text-secondary'
    },
    overdue: {
      icon: 'ri-alert-line',
      color: 'border-warning',
      bgColor: 'bg-accent-light',
      textColor: 'text-warning'
    },
    report: {
      icon: 'ri-mail-send-line',
      color: 'border-success',
      bgColor: 'bg-green-50',
      textColor: 'text-success'
    }
  };

  const config = typeConfig[type];

  return (
    <div className={cn("flex items-start p-3 border-r-4 rounded-md hover:bg-gray-50", config.color)}>
      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center ml-4", config.bgColor)}>
        <i className={cn(config.icon, config.textColor)}></i>
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="font-medium">{title}</h4>
          <span className="text-xs text-gray-500">{getRelativeTime(timestamp)}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
