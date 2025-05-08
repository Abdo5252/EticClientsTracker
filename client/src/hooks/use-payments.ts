import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: number;
  clientId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  checkNumber?: string;
  transactionId?: string;
  notes?: string;
  currency: string;
}

interface PaymentInput {
  clientId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  checkNumber?: string;
  transactionId?: string;
  notes?: string;
  currency: string;
}

export function usePayments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all payments
  const { data: payments, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/payments'],
  });

  // Get a specific payment
  const getPayment = (id: number) => {
    return useQuery({
      queryKey: ['/api/payments', id],
      enabled: !!id,
    });
  };

  // Get payments for a specific client
  const getClientPayments = (clientId: number) => {
    return useQuery({
      queryKey: ['/api/clients', clientId, 'payments'],
      enabled: !!clientId,
    });
  };

  // Create a new payment
  const createPayment = useMutation({
    mutationFn: async (payment: PaymentInput) => {
      const res = await apiRequest('POST', '/api/payments', payment);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['/api/payments']});
      queryClient.invalidateQueries({queryKey: ['/api/clients', data.clientId, 'payments']});
      queryClient.invalidateQueries({queryKey: ['/api/clients', data.clientId, 'invoices']});
      queryClient.invalidateQueries({queryKey: ['/api/clients']});
      queryClient.invalidateQueries({queryKey: ['/api/invoices']});
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة الدفعة بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الدفعة',
        variant: 'destructive',
      });
    },
  });

  return {
    payments,
    isLoading,
    error,
    refetch,
    getPayment,
    getClientPayments,
    createPayment,
  };
}
