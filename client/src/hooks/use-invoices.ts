import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

type Invoice = {
  id: number;
  invoiceNumber: string;
  clientId: number;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
};

export function useInvoices() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['/api/invoices'],
    queryFn: async () => {
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    }
  });

  const addInvoice = useMutation({
    mutationFn: async (invoiceData: Omit<Invoice, 'id'>) => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error('Failed to add invoice');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
  });

  const uploadInvoices = useMutation({
    mutationFn: async (data: any[]) => {
      console.log("Raw data from Excel:", data);
      
      // Map Excel columns based on the exact format from the image
      const mappedData = data.map(row => {
        console.log("Processing row:", row);
        
        return {
          // Handle exact Excel column names as seen in the screenshot
          documentType: row['Document Type'],
          invoiceNumber: row['Document Number'],
          invoiceDate: row['Document Date'],
          clientCode: row['Customer Code'],
          currency: row['Currency Code'],
          exchangeRate: row['Exchange Rate'] ? parseFloat(row['Exchange Rate']) : 1,
          extraDiscount: row['Extra Discount'] ? parseFloat(row['Extra Discount']) : 0,
          activityCode: row['Activity Code'] || null,
          totalAmount: parseFloat(String(row['Total Amount']).replace(/,/g, '')) || 0
        };
      });

      console.log("Mapped data:", mappedData);

      const response = await fetch('/api/invoices/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: mappedData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload invoices');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
  });

  return {
    invoices,
    isLoading,
    addInvoice,
    uploadInvoices
  };
}