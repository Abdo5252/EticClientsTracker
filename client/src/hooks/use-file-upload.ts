import * as XLSX from 'xlsx';
import { useState } from 'react';

export function useFileUpload() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processExcelFile = async (file: File): Promise<any[]> => {
    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Enable header row detection and raw values
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 'A',
        raw: false,
        defval: ''
      });

      // Skip header row
      const headerRow = jsonData[0];
      console.log('Excel header row:', headerRow);

      // Find column indices
      const codeIndex = Object.keys(headerRow).find(key => 
        headerRow[key].toString().toUpperCase().includes('CODE'));
      const nameIndex = Object.keys(headerRow).find(key => 
        headerRow[key].toString().toUpperCase().includes('CUSTOMER') || 
        headerRow[key].toString().toUpperCase().includes('NAME'));
      const salesRepIndex = Object.keys(headerRow).find(key => 
        headerRow[key].toString().toUpperCase().includes('SALES') || 
        headerRow[key].toString().toUpperCase().includes('REP'));

      console.log('Column indices:', { codeIndex, nameIndex, salesRepIndex });

      // Process rows (skip header)
      const processedData = jsonData.slice(1).map(row => {
        const processedRow: Record<string, string> = {};

        if (codeIndex) processedRow['CODE'] = row[codeIndex]?.toString() || '';
        if (nameIndex) processedRow['CUSTOMER NAME'] = row[nameIndex]?.toString() || '';
        if (salesRepIndex) processedRow['SALES REP'] = row[salesRepIndex]?.toString() || '';

        return processedRow;
      });

      console.log('Processed Excel data:', processedData.slice(0, 3));
      return processedData;
    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw new Error('Failed to process the Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processExcelFile,
    isProcessing
  };
}