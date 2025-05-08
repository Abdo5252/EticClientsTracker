import { useState } from 'react';
import { formatDate, getInvoiceStatusText, getInvoiceStatusClass } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { Invoice } from '@shared/schema';
import { Button } from '@/components/ui/button';

interface InvoiceHistoryTableProps {
  invoices: Invoice[] | undefined;
  isLoading: boolean;
}

export function InvoiceHistoryTable({ invoices, isLoading }: InvoiceHistoryTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }
  
  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-gray-500">{t('common.noData')}</div>
      </div>
    );
  }
  
  // Group invoices by date (for display as upload history)
  const groupedInvoices: Record<string, Invoice[]> = {};
  invoices.forEach(invoice => {
    const dateKey = formatDate(invoice.invoiceDate);
    if (!groupedInvoices[dateKey]) {
      groupedInvoices[dateKey] = [];
    }
    groupedInvoices[dateKey].push(invoice);
  });
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedInvoices).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('invoices.date')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('invoices.invoiceCount')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('invoices.status')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('invoices.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedDates.map(date => (
            <tr key={date}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {groupedInvoices[date].length}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {t('invoices.successStatus')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedInvoice(groupedInvoices[date][0])}
                >
                  <i className="ri-file-list-line text-primary hover:text-primary-700"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{t('invoices.viewDetails')}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedInvoice(null)}
              >
                <i className="ri-close-line text-xl"></i>
              </Button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('invoices.invoiceNumber')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedInvoice.invoiceNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('invoices.invoiceDate')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedInvoice.invoiceDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('invoices.totalAmount')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedInvoice.totalAmount.toLocaleString('ar-EG')} {selectedInvoice.currency}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('invoices.paidAmount')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedInvoice.paidAmount.toLocaleString('ar-EG')} {selectedInvoice.currency}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('invoices.remainingAmount')}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString('ar-EG')} {selectedInvoice.currency}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('invoices.status')}</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getInvoiceStatusClass(selectedInvoice.status)}`}>
                      {getInvoiceStatusText(selectedInvoice.status)}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setSelectedInvoice(null)}
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
