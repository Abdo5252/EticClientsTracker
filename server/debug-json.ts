
/**
 * Debug script to validate the clients-data.json file
 */
import * as fs from 'fs';
import * as path from 'path';

function debugJsonFile() {
  try {
    const jsonFilePath = path.resolve(process.cwd(), 'clients-data.json');

    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error('Error: clients-data.json file not found');
      console.error('Expected path:', jsonFilePath);
      process.exit(1);
    }

    console.log(`Reading clients from: ${jsonFilePath}`);

    // Read file
    const fileContents = fs.readFileSync(jsonFilePath, 'utf8');
    
    try {
      const clientsData = JSON.parse(fileContents);
      console.log(`✅ Successfully parsed JSON file`);
      console.log(`Found ${clientsData.length} clients in file`);

      // Show the first record for debugging
      if (clientsData.length > 0) {
        console.log('Sample first record:');
        console.log(clientsData[0]);
        
        // Show the keys that exist in the first record
        console.log('\nAvailable keys in the first record:');
        console.log(Object.keys(clientsData[0]));
      }

    } catch (parseError) {
      console.error('❌ Failed to parse JSON file:', parseError);
      console.log('First 100 characters of file:');
      console.log(fileContents.substring(0, 100));
    }
  } catch (error) {
    console.error('Error accessing JSON file:', error);
  }
}

debugJsonFile();
