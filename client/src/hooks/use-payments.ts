import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirestorePayments, Payment } from './use-firestore-payments';

export interface PaymentFormData {
  clientId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  checkNumber?: string;
  transactionId?: string;
  notes?: string;
  currency: string;
}

export function usePayments() {
  const queryClient = useQueryClient();
  const { 
    payments, 
    loading, 
    error, 
    fetchPayments, 
    fetchClientPayments,
    getPayment, 
    addPayment, 
    updatePayment, 
    deletePayment 
  } = useFirestorePayments();

  // Use real Firestore data
  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
    refetchOnWindowFocus: true
  });

  const addPaymentMutation = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentFormData> }) => {
      return updatePayment(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const getClientPayments = (clientId: string) => {
    return useQuery({
      queryKey: ['client-payments', clientId],
      queryFn: () => fetchClientPayments(clientId),
      enabled: !!clientId
    });
  };

  return {
    payments: payments || [],
    isLoading: loading || paymentsQuery.isLoading,
    isError: error || paymentsQuery.isError,
    error: paymentsQuery.error,
    addPayment: addPaymentMutation.mutate,
    updatePayment: updatePaymentMutation.mutate,
    deletePayment: deletePaymentMutation.mutate,
    getClientPayments,
    refetch: fetchPayments
  };
}