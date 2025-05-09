
/**
 * Debug utility for JSON data
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

async function debugJsonFile() {
  try {
    // Get path to clients-data.json
    const filePath = path.resolve(process.cwd(), 'clients-data.json');
    console.log(`Reading clients from: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Error: clients-data.json file not found');
      return;
    }
    
    // Read and parse the file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    try {
      const clientsData = JSON.parse(fileContents);
      console.log('✅ Successfully parsed JSON file');
      
      if (!Array.isArray(clientsData)) {
        console.error('❌ Error: JSON data is not an array');
        console.log('Data type:', typeof clientsData);
        return;
      }
      
      console.log(`Found ${clientsData.length} clients in file`);
      
      if (clientsData.length > 0) {
        const firstClient = clientsData[0];
        console.log('Sample first record:');
        console.log(firstClient);
        
        console.log('\nAvailable keys in the first record:');
        console.log(Object.keys(firstClient));
        
        // Test mapping for client data
        console.log('\nTesting field mapping for clients:');
        const fieldMappings = [
          { field: 'Client Code', options: ['CODE', 'Client Code', 'ClientCode', 'Customer Code', 'CustomerCode', 'رمز العميل'] },
          { field: 'Client Name', options: ['CUSTOMER NAME', 'Customer Name', 'CustomerName', 'Client Name', 'ClientName', 'اسم العميل'] }
        ];
        
        for (const mapping of fieldMappings) {
          console.log(`\n${mapping.field} mapping:`);
          for (const option of mapping.options) {
            if (firstClient[option] !== undefined) {
              console.log(`- Match found: ${option} = ${firstClient[option]}`);
            }
          }
        }
        
        // Validate sample formatted client
        console.log('\nSample formatted client would be:');
        const sampleFormatted = {
          id: 1,
          clientCode: String(firstClient.CODE || firstClient['Client Code'] || "").trim(),
          clientName: String(firstClient['CUSTOMER NAME'] || firstClient['Customer Name'] || "").trim(),
          salesRepName: "",
          balance: 0,
          currency: "EGP"
        };
        console.log(sampleFormatted);
      }
    } catch (parseError) {
      console.error('❌ Error parsing JSON file:', parseError);
      
      // If parsing fails, check for common JSON issues
      console.log('\nAnalyzing file for common JSON issues:');
      
      // Check for BOM
      if (fileContents.charCodeAt(0) === 0xFEFF) {
        console.log('- File has UTF-8 BOM character at the beginning');
      }
      
      // Check for common syntax errors
      if (fileContents.includes('}\n{')) {
        console.log('- Multiple JSON objects without array wrapper');
      }
      
      if (fileContents.includes(',\n]')) {
        console.log('- Trailing comma in array');
      }
      
      // Print first few characters for diagnosis
      console.log(`- First 100 characters: ${fileContents.substring(0, 100).replace(/\n/g, '\\n')}`);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Run the debug function
debugJsonFile();
