import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface AgingReportProps {
  onBack: () => void;
}

export function AgingReport({ onBack }: AgingReportProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Fetch aging report data
  const { data: reportData, isLoading: isLoadingReport, refetch } = useQuery({
    queryKey: ['/api/reports/aging'],
    enabled: false, // Don't fetch automatically
  });
  
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    await refetch();
    setIsGenerating(false);
  };
  
  const handleExportPDF = () => {
    // PDF export functionality would be implemented here
    alert('تصدير PDF قيد التطوير');
  };
  
  const handleExportExcel = () => {
    // Excel export functionality would be implemented here
    alert('تصدير Excel قيد التطوير');
  };
  
  const getMonthName = (monthIndex: number) => {
    const months = [
      'الشهر الحالي',
      'شهر واحد',
      'شهرين',
      '3 أشهر',
      '4 أشهر',
      '5 أشهر',
      '6 أشهر فأكثر'
    ];
    
    return months[Math.min(monthIndex, 6)];
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="ml-2"
          >
            <i className="ri-arrow-right-line"></i>
          </Button>
          <h2 className="text-xl font-bold">{t('reports.agingReport.title')}</h2>
        </div>
        
        {reportData && (
          <div className="flex space-x-2 space-x-reverse">
            <Button 
              variant="outline" 
              className="inline-flex items-center"
              onClick={handleExportPDF}
            >
              <i className="ri-file-pdf-line ml-1"></i>
              <span>{t('reports.exportPDF')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="inline-flex items-center"
              onClick={handleExportExcel}
            >
              <i className="ri-file-excel-line ml-1"></i>
              <span>{t('reports.exportExcel')}</span>
            </Button>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating || isLoadingReport ? t('common.loading') : t('reports.createReport')}
        </Button>
      </div>
      
      {reportData && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="text-gray-500 text-sm mb-1">إجمالي المبالغ المستحقة</h4>
              <div className="font-bold text-2xl">
                {reportData.totalDue.toLocaleString('ar-EG')} 
                <span className="text-sm font-normal">{t(`common.currency.EGP`)}</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('reports.client')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجمالي المستحق
                  </th>
                  {[0, 1, 2, 3, 4, 5, 6].map(month => (
                    <th 
                      key={month} 
                      scope="col" 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {getMonthName(month)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.agingData.length > 0 ? (
                  reportData.agingData.map((clientAging: any) => (
                    <tr key={clientAging.client.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {clientAging.client.clientName} ({clientAging.client.clientCode})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {clientAging.totalDue.toLocaleString('ar-EG')}
                      </td>
                      {[0, 1, 2, 3, 4, 5, 6].map(month => (
                        <td 
                          key={month} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {((clientAging.aging && clientAging.aging[month]) || 0).toLocaleString('ar-EG')}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      {t('common.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
