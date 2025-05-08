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
            className="ml-2 hover:bg-gray-100 text-gray-700 hover:text-blue-700"
          >
            <i className="ri-arrow-right-line text-lg"></i>
          </Button>
          <h2 className="text-xl font-bold">{t('reports.agingReport.title')}</h2>
        </div>
        
        {reportData && (
          <div className="flex space-x-2 space-x-reverse">
            <Button 
              variant="outline" 
              className="inline-flex items-center gap-2 border-gray-400 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              onClick={handleExportPDF}
            >
              <i className="ri-file-pdf-line text-red-600"></i>
              <span>{t('reports.exportPDF')}</span>
            </Button>
            <Button 
              variant="outline" 
              className="inline-flex items-center gap-2 border-gray-400 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
              onClick={handleExportExcel}
            >
              <i className="ri-file-excel-line text-green-600"></i>
              <span>{t('reports.exportExcel')}</span>
            </Button>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2"
        >
          {isGenerating || isLoadingReport ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('common.loading')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <i className="ri-file-chart-2-line"></i>
              <span>{t('reports.generateReport')}</span>
            </div>
          )}
        </Button>
      </div>
      
      {reportData && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-full mr-3">
                    <i className="ri-alarm-warning-line text-red-600 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-gray-500 text-sm mb-1">{t('reports.aging.total')}</h4>
                    <div className="font-bold text-2xl">
                      {reportData.totalDue.toLocaleString('ar-EG')} 
                      <span className="text-sm font-normal">{t(`common.currency.EGP`)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-full mr-3">
                    <i className="ri-calendar-line text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-gray-500 text-sm mb-1">{t('reports.aging.moreThan90')}</h4>
                    <div className="font-bold text-2xl text-red-700">
                      {(reportData.agingData.reduce((sum, client) => sum + ((client.aging && client.aging[6]) || 0), 0)).toLocaleString('ar-EG')}
                      <span className="text-sm font-normal">{t(`common.currency.EGP`)}</span>
                    </div>
                  </div>
                </div>
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
                  {[0, 1, 2, 3, 4, 5, 6].map(month => {
                    // Define gradient colors based on aging period for headers
                    let bgColorClass = "";
                    let textColorClass = "text-gray-500";
                    
                    if (month === 0) {
                      bgColorClass = "bg-green-100";
                    } else if (month === 1) {
                      bgColorClass = "bg-blue-100";
                    } else if (month === 2) {
                      bgColorClass = "bg-yellow-100";
                    } else if (month >= 3 && month <= 4) {
                      bgColorClass = "bg-orange-100";
                      textColorClass = "text-orange-800";
                    } else if (month >= 5) {
                      bgColorClass = "bg-red-100";
                      textColorClass = "text-red-800";
                    }
                    
                    return (
                      <th 
                        key={month} 
                        scope="col" 
                        className={`px-6 py-3 text-right text-xs font-medium ${textColorClass} uppercase tracking-wider ${bgColorClass}`}
                      >
                        {getMonthName(month)}
                      </th>
                    );
                  })}
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
                      {[0, 1, 2, 3, 4, 5, 6].map(month => {
                        // Define gradient colors based on aging period
                        let bgColorClass = "";
                        let textColorClass = "text-gray-900";
                        
                        if (month === 0) {
                          bgColorClass = "bg-green-50";
                        } else if (month === 1) {
                          bgColorClass = "bg-blue-50";
                        } else if (month === 2) {
                          bgColorClass = "bg-yellow-50";
                        } else if (month >= 3 && month <= 4) {
                          bgColorClass = "bg-orange-50";
                          textColorClass = "text-orange-700";
                        } else if (month >= 5) {
                          bgColorClass = "bg-red-50";
                          textColorClass = "text-red-700 font-medium";
                        }
                        
                        return (
                          <td 
                            key={month} 
                            className={`px-6 py-4 whitespace-nowrap text-sm ${textColorClass} ${bgColorClass}`}
                          >
                            {((clientAging.aging && clientAging.aging[month]) || 0).toLocaleString('ar-EG')}
                          </td>
                        );
                      })}
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
