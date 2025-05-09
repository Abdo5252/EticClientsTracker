import { useState } from 'react';
import * as XLSX from 'xlsx';

export function useFileUpload() {
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse Excel file to JSON
  const parseExcelFile = async (file: File): Promise<any[]> => {
    setIsProcessing(true);
    
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const data = event.target?.result;
            if (!data) {
              reject(new Error('Failed to read file'));
              return;
            }
            
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert Excel sheet to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // Map the data to match the expected format based on the Excel structure
            const mappedData = jsonData.map((row: any) => {
              return {
                clientCode: row['CODE'] || row['كود العميل'] || row['Client Code'] || row['clientCode'] || '',
                clientName: row['CUSTOMER NAME'] || row['اسم العميل'] || row['Client Name'] || row['clientName'] || '',
                salesRepName: row['SALES REP'] || row['اسم مندوب المبيعات'] || row['Sales Rep Name'] || row['salesRepName'] || '',
                invoiceNumber: row['رقم الفاتورة'] || row['Invoice Number'] || row['invoiceNumber'] || '',
                invoiceDate: row['تاريخ الفاتورة'] || row['Invoice Date'] || row['invoiceDate'] || new Date().toISOString().split('T')[0],
                totalAmount: parseFloat(row['إجمالي المبلغ'] || row['Total Amount'] || row['totalAmount'] || 0),
                currency: row['العملة'] || row['Currency'] || row['currency'] || 'EGP',
              };
            });
            
            resolve(mappedData);
          } catch (error) {
            reject(error);
          } finally {
            setIsProcessing(false);
          }
        };
        
        reader.onerror = (error) => {
          reject(error);
          setIsProcessing(false);
        };
        
        // Read the file
        reader.readAsBinaryString(file);
      });
    } catch (error) {
      setIsProcessing(false);
      throw error;
    }
  };

  return {
    parseExcelFile,
    isProcessing,
  };
}
