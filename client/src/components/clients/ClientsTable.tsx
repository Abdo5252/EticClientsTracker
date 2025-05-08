import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Client } from "@shared/schema";

interface ClientsTableProps {
  clients: Client[] | undefined;
  isLoading: boolean;
  onEdit: (clientId: number) => void;
  onDelete: (clientId: number) => void;
}

export function ClientsTable({ clients, isLoading, onEdit, onDelete }: ClientsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }
  
  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-gray-500">{t('common.noData')}</div>
      </div>
    );
  }
  
  // Pagination
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = clients.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('clients.clientCode')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('clients.clientName')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('clients.salesRep')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('clients.currentBalance')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('clients.currency')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('clients.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedClients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {client.clientCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.salesRepName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {client.balance.toLocaleString('ar-EG')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {t(`common.currency.${client.currency}`)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="ghost" size="sm" onClick={() => {/* View client details */}}>
                      <i className="ri-eye-line text-primary hover:text-primary-700"></i>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(client.id)}>
                      <i className="ri-edit-line text-gray-500 hover:text-gray-700"></i>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {/* Generate client report */}}>
                      <i className="ri-file-chart-line text-gray-500 hover:text-gray-700"></i>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(client.id)}>
                      <i className="ri-delete-bin-line text-red-500 hover:text-red-700"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {t('clients.showing')} {startIndex + 1}-{Math.min(startIndex + itemsPerPage, clients.length)} {t('clients.of')} {clients.length} {t('clients.clients')}
          </div>
          <div className="flex space-x-1 space-x-reverse">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              {t('common.previous')}
            </Button>
            
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNumber = i + 1;
              return (
                <Button 
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
