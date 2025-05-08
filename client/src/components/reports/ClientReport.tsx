import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClients } from '@/hooks/use-clients';
import { formatDate, getInvoiceStatusText, getInvoiceStatusClass, getPaymentMethodText } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface ClientReportProps {
  onBack: () => void;
}

export function ClientReport({ onBack }: ClientReportProps) {
  const { clients, isLoading: isLoadingClients } = useClients();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Fetch client report data
  const { data: reportData, isLoading: isLoadingReport, refetch } = useQuery({
    queryKey: ['/api/reports/client', selectedClientId, startDate, endDate],
    enabled: false, // Don't fetch automatically
  });
  
  const handleGenerateReport = async () => {
    if (!selectedClientId) return;
    
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
          <h2 className="text-xl font-bold">{t('reports.clientReport.title')}</h2>
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reports.client')}
            </label>
            <Select 
              value={selectedClientId} 
              onValueChange={setSelectedClientId}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('reports.selectClient')} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingClients ? (
                  <SelectItem value="loading" disabled>{t('common.loading')}</SelectItem>
                ) : clients && clients.length > 0 ? (
                  clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.clientName} ({client.clientCode})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>{t('common.noData')}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
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
          
          <div className="md:col-span-4 flex justify-end">
            <Button 
              onClick={handleGenerateReport}
              disabled={!selectedClientId || isGenerating}
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
                <h4 className="text-gray-700 text-sm mb-1 font-medium">{t('reports.summary.totalSales')}</h4>
                <div className="font-bold text-2xl">
                  {reportData.totalSales.toLocaleString('ar-EG')} 
                  <span className="text-sm font-medium">{t(`common.currency.${reportData.client.currency}`)}</span>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-gray-700 text-sm mb-1 font-medium">{t('reports.summary.totalPayments')}</h4>
                <div className="font-bold text-2xl">
                  {reportData.totalPayments.toLocaleString('ar-EG')} 
                  <span className="text-sm font-medium">{t(`common.currency.${reportData.client.currency}`)}</span>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-gray-700 text-sm mb-1 font-medium">{t('reports.summary.remainingBalance')}</h4>
                <div className="font-bold text-2xl">
                  {reportData.balance.toLocaleString('ar-EG')} 
                  <span className="text-sm font-medium">{t(`common.currency.${reportData.client.currency}`)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{t('reports.invoices')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.invoiceNumber')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.date')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.amount')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.paidAmount')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.remainingAmount')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.invoices.length > 0 ? (
                    reportData.invoices.map((invoice: any) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(invoice.invoiceDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {invoice.totalAmount.toLocaleString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {invoice.paidAmount.toLocaleString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {(invoice.totalAmount - invoice.paidAmount).toLocaleString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getInvoiceStatusClass(invoice.status)}`}>
                            {getInvoiceStatusText(invoice.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        {t('common.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('reports.payments')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.date')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.amount')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.paymentMethod')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.checkTransNumber')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('reports.notes')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.payments.length > 0 ? (
                    reportData.payments.map((payment: any) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {payment.amount.toLocaleString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {getPaymentMethodText(payment.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {payment.checkNumber || payment.transactionId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {payment.notes || '-'}
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
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
