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
        
        // Enhanced field finder function with more flexible matching
        const findField = (possibleNames: string[]) => {
          // Try direct matches first
          for (const name of possibleNames) {
            // Exact match
            if (row[name] !== undefined) {
              return row[name];
            }
            
            // Case-insensitive exact match
            const caseInsensitiveKey = Object.keys(row).find(k => 
              k.toLowerCase() === name.toLowerCase()
            );
            if (caseInsensitiveKey) {
              return row[caseInsensitiveKey];
            }
          }
          
          // Try partial matches
          for (const name of possibleNames) {
            // Find keys that contain the field name
            const partialMatches = Object.keys(row).filter(k => 
              k.toLowerCase().includes(name.toLowerCase())
            );
            
            if (partialMatches.length > 0) {
              return row[partialMatches[0]];
            }
          }
          
          // Try alternative naming patterns (common in Arabic Excel files)
          const alternativeNames = new Map([
            ['Document Type', ['نوع المستند', 'النوع', 'Type']],
            ['Document Number', ['رقم المستند', 'رقم الفاتورة', 'Invoice Number', 'رقم']],
            ['Document Date', ['تاريخ المستند', 'تاريخ الفاتورة', 'Invoice Date', 'تاريخ']],
            ['Customer Code', ['رمز العميل', 'كود العميل', 'Customer ID', 'عميل']],
            ['Total Amount', ['المبلغ الإجمالي', 'إجمالي المبلغ', 'Amount', 'المبلغ', 'قيمة']]
          ]);
          
          const mainField = possibleNames[0];
          const altNames = alternativeNames.get(mainField);
          
          if (altNames) {
            for (const altName of altNames) {
              // Exact match
              if (row[altName] !== undefined) {
                return row[altName];
              }
              
              // Case-insensitive match
              const altCaseKey = Object.keys(row).find(k => 
                k.toLowerCase() === altName.toLowerCase()
              );
              if (altCaseKey) {
                return row[altCaseKey];
              }
              
              // Partial match
              const altPartialMatches = Object.keys(row).filter(k => 
                k.toLowerCase().includes(altName.toLowerCase())
              );
              
              if (altPartialMatches.length > 0) {
                return row[altPartialMatches[0]];
              }
            }
          }
          
          return null;
        };
        
        // Get all necessary fields with enhanced matching
        const documentType = findField(['Document Type']);
        const documentNumber = findField(['Document Number']);
        const documentDate = findField(['Document Date']);
        const customerCode = findField(['Customer Code']);
        const totalAmount = findField(['Total Amount']);
        const currencyCode = findField(['Currency Code', 'Currency']);
        const exchangeRateValue = findField(['Exchange Rate']);
        const extraDiscountValue = findField(['Extra Discount']);
        const activityCodeValue = findField(['Activity Code']);
        
        console.log("Extracted fields:", {
          documentType,
          documentNumber,
          documentDate,
          customerCode,
          totalAmount
        });
        
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