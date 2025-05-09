
import { useState } from 'react';
import * as XLSX from 'xlsx';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process Excel file and return parsed data
  const processExcelFile = async (file: File): Promise<any[]> => {
    setIsUploading(true);
    setError(null);

    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            if (!e.target || !e.target.result) {
              throw new Error('Failed to read file');
            }

            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            
            // Get first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON with raw values
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });
            
            // Log sample of the data for debugging
            if (jsonData.length > 0) {
              console.log('Sample Excel data:', jsonData[0]);
              console.log('Available fields:', Object.keys(jsonData[0]));
            }
            
            resolve(jsonData);
          } catch (error) {
            console.error('Error processing Excel file:', error);
            reject(error instanceof Error ? error : new Error('Unknown error processing Excel file'));
          }
        };

        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };

        // Read file as binary
        reader.readAsBinaryString(file);
      });
    } catch (error) {
      console.error('File upload error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    error,
    processExcelFile
  };
}
