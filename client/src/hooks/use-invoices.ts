import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirestoreInvoices, Invoice } from './use-firestore-invoices';

export interface InvoiceFormData {
  invoiceNumber: string;
  clientId: string;
  invoiceDate: Date;
  totalAmount: number;
  currency: string;
}

export interface UploadInvoiceResult {
  success: number;
  failed: number;
  errors?: string[];
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

  // Use real Firestore data
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
  
  // Real upload invoices function
  const uploadInvoicesReal = async (data: any[]): Promise<UploadInvoiceResult> => {
    console.log("Uploading invoices to Firestore:", data);
    
    const results: UploadInvoiceResult = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Process each invoice
    for (const invoice of data) {
      try {
        // Check if client exists
        const clientsRef = collection(db, 'clients');
        const clientQuery = query(clientsRef, where('clientNumber', '==', invoice.clientNumber));
        const clientSnapshot = await getDocs(clientQuery);
        
        if (clientSnapshot.empty) {
          results.failed++;
          results.errors?.push(`عميل غير موجود: ${invoice.clientNumber}`);
          continue;
        }
        
        const clientId = clientSnapshot.docs[0].id;
        
        // Add the invoice
        await addInvoice({
          invoiceNumber: invoice.invoiceNumber,
          clientId: clientId,
          invoiceDate: new Date(invoice.invoiceDate),
          totalAmount: invoice.totalAmount,
          currency: invoice.currency || 'EGP'
        });
        
        results.success++;
      } catch (error) {
        console.error("Error uploading invoice:", error);
        results.failed++;
        results.errors?.push(`خطأ في معالجة الفاتورة ${invoice.invoiceNumber}: ${error}`);
      }
    }
    
    return results;
  };
  
  const uploadInvoicesMutation = useMutation({
    mutationFn: uploadInvoicesReal,
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
    uploadInvoices: uploadInvoicesMutation,
    getClientInvoices,
    refetch: fetchInvoices
  };
}