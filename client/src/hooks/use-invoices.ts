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
        
        // Get all available keys for debugging
        const availableKeys = Object.keys(row);
        console.log("Available keys in row:", availableKeys);
        
        // Find fields by flexible matching
        const findField = (possibleNames: string[]) => {
          for (const name of possibleNames) {
            // Try exact match
            if (row[name] !== undefined) {
              return row[name];
            }
            
            // Try case-insensitive match
            const caseInsensitiveKey = Object.keys(row).find(k => 
              k.toLowerCase() === name.toLowerCase()
            );
            if (caseInsensitiveKey) {
              return row[caseInsensitiveKey];
            }
          }
          return null;
        };
        
        // Get document type and number
        const documentType = findField(['Document Type']);
        const documentNumber = findField(['Document Number']);
        const documentDate = findField(['Document Date']);
        const customerCode = findField(['Customer Code']);
        const totalAmount = findField(['Total Amount']);
        const currencyCode = findField(['Currency Code', 'Currency']);
        const exchangeRateValue = findField(['Exchange Rate']);
        const extraDiscountValue = findField(['Extra Discount']);
        const activityCodeValue = findField(['Activity Code']);
        
        return {
          documentType,
          invoiceNumber: documentNumber,
          invoiceDate: documentDate,
          clientCode: customerCode,
          currency: currencyCode || 'EGP',
          exchangeRate: exchangeRateValue ? parseFloat(String(exchangeRateValue)) : 1,
          extraDiscount: extraDiscountValue ? parseFloat(String(extraDiscountValue)) : 0,
          activityCode: activityCodeValue || null,
          totalAmount: totalAmount ? parseFloat(String(totalAmount).replace(/,/g, '')) : 0
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