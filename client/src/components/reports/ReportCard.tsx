import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

interface ReportCardProps {
  title: string;
  description: string;
  icon: string;
  color: 'primary' | 'secondary' | 'warning' | 'success';
  onClick: () => void;
}

export function ReportCard({ title, description, icon, color, onClick }: ReportCardProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary'
    },
    secondary: {
      bg: 'bg-secondary-light',
      text: 'text-secondary'
    },
    warning: {
      bg: 'bg-accent-light',
      text: 'text-warning'
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-success'
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-4", colorClasses[color].bg)}>
        <i className={cn(icon, "text-xl", colorClasses[color].text)}></i>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-700 mb-4">{description}</p>
      <Button 
        onClick={onClick}
        className={cn(
          "w-full px-4 py-2 text-white rounded-lg",
          color === 'primary' && "bg-primary-800 hover:bg-primary-700",
          color === 'secondary' && "bg-secondary hover:bg-blue-500",
          color === 'warning' && "bg-warning hover:bg-amber-500",
          color === 'success' && "bg-success hover:bg-green-600"
        )}
      >
        {t('reports.createReport')}
      </Button>
    </div>
  );
}
