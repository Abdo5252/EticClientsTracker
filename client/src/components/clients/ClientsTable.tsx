import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Client } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, FileText, Trash2, CreditCard } from "lucide-react";

interface ClientsTableProps {
  clients: Client[] | undefined;
  isLoading: boolean;
  onEdit: (clientId: number) => void;
  onDelete: (clientId: number) => void;
  onSelectClient?: (clientId: number) => void;
}

export function ClientsTable({ 
  clients, 
  isLoading, 
  onEdit, 
  onDelete, 
  onSelectClient 
}: ClientsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const itemsPerPage = 10;
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
        <div className="text-md text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }
  
  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div className="text-lg text-gray-500 mb-1">{t('common.noData')}</div>
        <div className="text-sm text-gray-400">لا توجد بيانات عملاء متاحة</div>
      </div>
    );
  }
  
  // Pagination
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = clients.slice(startIndex, startIndex + itemsPerPage);
  
  const handleRowClick = (clientId: number) => {
    setSelectedId(clientId);
    if (onSelectClient) {
      onSelectClient(clientId);
    }
  };
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
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
                {t('clients.status')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('clients.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedClients.map((client) => (
              <tr 
                key={client.id} 
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedId === client.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleRowClick(client.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {client.clientCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {client.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.salesRepName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col">
                    <span className={`${client.balance > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {formatCurrency(client.balance, client.currency)}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {t(`common.currency.${client.currency}`)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge 
                    variant="outline" 
                    className={client.balance > 0 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-green-50 text-green-700 border-green-200'
                    }
                  >
                    {client.balance > 0 ? 'مستحق' : 'سداد كامل'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-1 space-x-reverse" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleRowClick(client.id)}
                    >
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(client.id)}
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                    >
                      <FileText className="h-4 w-4 text-gray-500" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                    >
                      <CreditCard className="h-4 w-4 text-blue-500" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onDelete(client.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty state if no filtered clients */}
      {clients.length > 0 && paginatedClients.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">لا توجد نتائج مطابقة لمعايير البحث</div>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t pt-4">
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
