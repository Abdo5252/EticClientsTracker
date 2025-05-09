import { useState } from "react";
import * as XLSX from 'xlsx';

export function useFileUpload() {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseExcelFile = async (file: File): Promise<any[]> => {
    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Get header row to verify columns exist
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
      const headers: string[] = [];

      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
        headers.push(cell?.v || '');
      }

      console.log("Excel headers:", headers);

      // Parse the sheet with proper options
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false,
        dateNF: 'yyyy-mm-dd',
        defval: '',
        header: headers
      });

      // Print some debug info
      if (jsonData.length > 0) {
        console.log("Sample parsed row:", jsonData[0]);
      }

      return jsonData;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error('فشل في قراءة ملف Excel');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    parseExcelFile,
    isProcessing
  };
}