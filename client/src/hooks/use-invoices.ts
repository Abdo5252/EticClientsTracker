import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  invoiceDate: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  status: string;
}

interface InvoiceInput {
  invoiceNumber: string;
  clientId: number;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
}

export function useInvoices() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all invoices
  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/invoices'],
  });

  // Get a specific invoice
  const getInvoice = (id: number) => {
    return useQuery({
      queryKey: ['/api/invoices', id],
      enabled: !!id,
    });
  };

  // Get invoices for a specific client
  const getClientInvoices = (clientId: number) => {
    return useQuery({
      queryKey: ['/api/clients', clientId, 'invoices'],
      enabled: !!clientId,
    });
  };

  // Create a new invoice
  const createInvoice = useMutation({
    mutationFn: async (invoice: InvoiceInput) => {
      const res = await apiRequest('POST', '/api/invoices', invoice);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['/api/invoices']});
      queryClient.invalidateQueries({queryKey: ['/api/clients', data.clientId, 'invoices']});
      queryClient.invalidateQueries({queryKey: ['/api/clients']});
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة الفاتورة بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الفاتورة',
        variant: 'destructive',
      });
    },
  });

  // Upload invoices (Excel)
  const uploadInvoices = useMutation({
    mutationFn: async (data: any[]) => {
      const res = await apiRequest('POST', '/api/invoices/upload', { data });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['/api/invoices']});
      queryClient.invalidateQueries({queryKey: ['/api/clients']});
      toast({
        title: 'تم بنجاح',
        description: `تم إضافة ${data.success} فاتورة بنجاح${data.failed > 0 ? ` وفشل إضافة ${data.failed} فاتورة` : ''}${data.modified > 0 ? ` وتم تعديل ${data.modified} فاتورة` : ''}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الفواتير',
        variant: 'destructive',
      });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    refetch,
    getInvoice,
    getClientInvoices,
    createInvoice,
    uploadInvoices,
  };
}
