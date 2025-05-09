import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

type Payment = {
  id: number;
  clientId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  currency: string;
  checkNumber?: string;
  transactionId?: string;
};

type PaymentFormData = {
  clientId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  currency: string;
  checkNumber?: string;
  transactionId?: string;
};

export function usePayments() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: async () => {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      return response.json();
    }
  });

  const addPayment = useMutation({
    mutationFn: async (paymentData: PaymentFormData) => {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to add payment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
  });

  return {
    payments,
    isLoading,
    addPayment
  };
}