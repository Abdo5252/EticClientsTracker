
/**
 * Debug utility for testing Excel parsing
 */
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

async function debugExcel(filePath?: string) {
  try {
    // Use provided file path or look for Excel files in the project root
    const targetPath = filePath || findExcelFile();
    
    if (!targetPath) {
      console.error('No Excel file found. Please specify a file path.');
      return;
    }
    
    console.log(`Reading Excel file: ${targetPath}`);
    
    // Read file
    const workbook = XLSX.readFile(targetPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });
    
    console.log(`Found ${jsonData.length} rows in sheet "${sheetName}"`);
    
    if (jsonData.length > 0) {
      const sampleRow = jsonData[0];
      console.log('\nSample Row:');
      console.log(sampleRow);
      
      console.log('\nAvailable Fields:');
      const fields = Object.keys(sampleRow);
      fields.forEach(field => {
        console.log(`- ${field}: ${typeof sampleRow[field]} = ${sampleRow[field]}`);
      });
      
      // Test field mappings
      testFieldMapping(jsonData);
    } else {
      console.log('No data found in the Excel file.');
    }
    
  } catch (error) {
    console.error('Error debugging Excel file:', error);
  }
}

function findExcelFile(): string | null {
  const rootDir = process.cwd();
  const files = fs.readdirSync(rootDir);
  
  // Look for Excel files
  const excelFile = files.find(file => {
    const ext = path.extname(file).toLowerCase();
    return ext === '.xlsx' || ext === '.xls';
  });
  
  return excelFile ? path.join(rootDir, excelFile) : null;
}

function testFieldMapping(data: any[]) {
  console.log('\nTesting field mapping for invoice upload:');
  
  const firstRow = data[0];
  const fieldMappings = [
    { name: 'Document Type', possibleNames: ['Document Type', 'نوع المستند', 'النوع', 'Type'] },
    { name: 'Document Number', possibleNames: ['Document Number', 'رقم المستند', 'رقم الفاتورة', 'Invoice Number', 'رقم'] },
    { name: 'Document Date', possibleNames: ['Document Date', 'تاريخ المستند', 'تاريخ الفاتورة', 'Invoice Date', 'تاريخ'] },
    { name: 'Customer Code', possibleNames: ['Customer Code', 'رمز العميل', 'كود العميل', 'Customer ID', 'عميل'] },
    { name: 'Total Amount', possibleNames: ['Total Amount', 'المبلغ الإجمالي', 'إجمالي المبلغ', 'Amount', 'المبلغ', 'قيمة'] }
  ];
  
  // Test each mapping
  for (const mapping of fieldMappings) {
    console.log(`\nMapping for ${mapping.name}:`);
    
    // Test exact matches
    const exactMatch = mapping.possibleNames.find(name => firstRow[name] !== undefined);
    if (exactMatch) {
      console.log(`- Exact match found: ${exactMatch} = ${firstRow[exactMatch]}`);
    }
    
    // Test case-insensitive matches
    const caseInsensitiveMatch = Object.keys(firstRow).find(key => 
      mapping.possibleNames.some(name => key.toLowerCase() === name.toLowerCase())
    );
    
    if (caseInsensitiveMatch) {
      console.log(`- Case-insensitive match found: ${caseInsensitiveMatch} = ${firstRow[caseInsensitiveMatch]}`);
    }
    
    // Test partial matches
    const partialMatches = Object.keys(firstRow).filter(key => 
      mapping.possibleNames.some(name => key.toLowerCase().includes(name.toLowerCase()))
    );
    
    if (partialMatches.length > 0) {
      console.log(`- Partial matches found: ${partialMatches.join(', ')}`);
    }
    
    if (!exactMatch && !caseInsensitiveMatch && partialMatches.length === 0) {
      console.log(`- No match found for ${mapping.name}`);
    }
  }
}

// Run the debug function
debugExcel();
