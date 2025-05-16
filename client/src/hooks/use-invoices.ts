import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirestoreInvoices, Invoice } from './use-firestore-invoices';

export interface InvoiceFormData {
  invoiceNumber: string;
  clientId: string;
  invoiceDate: Date;
  totalAmount: number;
  currency: string;
}

// Mock data for development mode
const MOCK_INVOICES = [
  {
    id: '1',
    invoiceNumber: 'INV-2023-001',
    clientId: '101',
    invoiceDate: new Date(2023, 5, 15),
    totalAmount: 7500,
    paidAmount: 3000,
    currency: 'EGP',
    status: 'partial',
    createdAt: new Date(2023, 5, 15)
  },
  {
    id: '2',
    invoiceNumber: 'INV-2023-002',
    clientId: '102',
    invoiceDate: new Date(2023, 5, 20),
    totalAmount: 4200,
    paidAmount: 4200,
    currency: 'EGP',
    status: 'paid',
    createdAt: new Date(2023, 5, 20)
  },
  {
    id: '3',
    invoiceNumber: 'INV-2023-003',
    clientId: '103',
    invoiceDate: new Date(2023, 5, 25),
    totalAmount: 8900,
    paidAmount: 0,
    currency: 'EGP',
    status: 'open',
    createdAt: new Date(2023, 5, 25)
  }
];

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

  // In development mode, use mock data instead of Firebase
  const mockFetchInvoices = async () => {
    console.log("Using mock invoice data for development");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return MOCK_INVOICES;
  };

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: mockFetchInvoices, // Use mock data in development
    refetchOnWindowFocus: true
  });

  // Development mode mock mutation functions
  const mockAddInvoice = async (data: any) => {
    console.log("Mock adding invoice:", data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return "new-invoice-id";
  };

  const mockUpdateInvoice = async (params: { id: string; data: any }) => {
    console.log("Mock updating invoice:", params);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  };

  const mockDeleteInvoice = async (id: string) => {
    console.log("Mock deleting invoice:", id);
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  };

  const addInvoiceMutation = useMutation({
    mutationFn: mockAddInvoice, // Use mock function in development
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceFormData> }) => {
      return mockUpdateInvoice({ id, data }); // Use mock function in development
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: mockDeleteInvoice, // Use mock function in development
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