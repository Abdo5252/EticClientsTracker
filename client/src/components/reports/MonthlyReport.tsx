import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MonthlyReportProps {
  onBack: () => void;
}

export function MonthlyReport({ onBack }: MonthlyReportProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Fetch monthly report data
  const { data: reportData, isLoading: isLoadingReport, refetch } = useQuery({
    queryKey: ['/api/reports/monthly', startDate, endDate],
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
          <h2 className="text-xl font-bold">{t('reports.monthlyReport.title')}</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reports.startDate')}
            </label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reports.endDate')}
            </label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          
          <div className="md:col-span-2 flex items-end">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating || isLoadingReport ? t('common.loading') : t('reports.createReport')}
            </Button>
          </div>
        </div>
      </div>
      
      {reportData && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-gray-500 text-sm mb-1">{t('reports.summary.totalSales')}</h4>
                <div className="font-bold text-2xl">
                  {reportData.totalSales.toLocaleString('ar-EG')} 
                  <span className="text-sm font-normal">{t(`common.currency.EGP`)}</span>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-gray-500 text-sm mb-1">{t('reports.summary.totalPayments')}</h4>
                <div className="font-bold text-2xl">
                  {reportData.totalPayments.toLocaleString('ar-EG')} 
                  <span className="text-sm font-normal">{t(`common.currency.EGP`)}</span>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-gray-500 text-sm mb-1">{t('reports.summary.remainingBalance')}</h4>
                <div className="font-bold text-2xl">
                  {reportData.totalBalance.toLocaleString('ar-EG')} 
                  <span className="text-sm font-normal">{t(`common.currency.EGP`)}</span>
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
                    {t('reports.summary.totalSales')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('reports.summary.totalPayments')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('reports.summary.remainingBalance')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clients.currency')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.clientReports.length > 0 ? (
                  reportData.clientReports.map((clientReport: any) => (
                    <tr key={clientReport.client.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {clientReport.client.clientName} ({clientReport.client.clientCode})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {clientReport.totalSales.toLocaleString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {clientReport.totalPayments.toLocaleString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {clientReport.balance.toLocaleString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t(`common.currency.${clientReport.client.currency}`)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      {t('common.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {t('common.total')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {reportData.totalSales.toLocaleString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {reportData.totalPayments.toLocaleString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {reportData.totalBalance.toLocaleString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    EGP
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
