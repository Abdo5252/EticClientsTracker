import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirestoreInvoices, Invoice } from './use-firestore-invoices';

export interface InvoiceFormData {
  invoiceNumber: string;
  clientId: string;
  invoiceDate: Date;
  totalAmount: number;
  currency: string;
}

export function useInvoices() {
  const queryClient = useQueryClient();
  const { 
    invoices, 
    loading, 
    error, 
    fetchInvoices, 
    fetchClientInvoices,
    getInvoice, 
    addInvoice, 
    updateInvoice, 
    deleteInvoice 
  } = useFirestoreInvoices();

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    refetchOnWindowFocus: true
  });

  const addInvoiceMutation = useMutation({
    mutationFn: addInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceFormData> }) => {
      return updateInvoice(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const getClientInvoices = (clientId: string) => {
    return useQuery({
      queryKey: ['client-invoices', clientId],
      queryFn: () => fetchClientInvoices(clientId),
      enabled: !!clientId
    });
  };

  return {
    invoices: invoices || [],
    isLoading: loading || invoicesQuery.isLoading,
    isError: error || invoicesQuery.isError,
    error: invoicesQuery.error,
    addInvoice: addInvoiceMutation.mutate,
    updateInvoice: updateInvoiceMutation.mutate,
    deleteInvoice: deleteInvoiceMutation.mutate,
    getClientInvoices,
    refetch: fetchInvoices
  };
}