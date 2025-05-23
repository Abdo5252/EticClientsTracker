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
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: 'text-blue-700'
    },
    secondary: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      icon: 'text-indigo-700'
    },
    warning: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      icon: 'text-amber-700'
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: 'text-green-700'
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className={cn("h-16 w-16 rounded-full flex items-center justify-center mb-5", colorClasses[color].bg)}>
        <i className={cn(icon, "text-2xl", colorClasses[color].icon)}></i>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-sm text-gray-800 mb-5 line-clamp-2">{description}</p>
      <Button 
        onClick={onClick}
        className={cn(
          "w-full px-4 py-2.5 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2",
          color === 'primary' && "bg-blue-700 hover:bg-blue-800",
          color === 'secondary' && "bg-indigo-700 hover:bg-indigo-800",
          color === 'warning' && "bg-amber-700 hover:bg-amber-800",
          color === 'success' && "bg-green-700 hover:bg-green-800"
        )}
      >
        <i className="ri-file-chart-line"></i>
        <span>{t('reports.createReport')}</span>
      </Button>
    </div>
  );
}
