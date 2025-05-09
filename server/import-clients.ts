import * as fs from 'fs';
import * as path from 'path';
import { insertClientSchema } from '@shared/schema';

/**
 * Import clients from JSON file
 * 
 * Usage:
 * npm run import-clients
 */
async function importClients() {
  try {
    const jsonFilePath = path.resolve(process.cwd(), 'clients-data.json');

    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error('Error: clients-data.json file not found');
      console.error('Create a clients-data.json file in the root directory');
      process.exit(1);
    }

    console.log(`Reading clients from: ${jsonFilePath}`);

    // Read file
    const fileContents = fs.readFileSync(jsonFilePath, 'utf8');
    const clientsData = JSON.parse(fileContents);

    console.log(`Found ${clientsData.length} clients in file`);

    // Validate the data format
    const results = {
      valid: 0,
      invalid: 0,
      errors: [] as string[]
    };

    for (const client of clientsData) {
      try {
        // Extract client data
        const clientData = {
          clientCode: String(client.clientCode || client.CODE || "").trim(),
          clientName: String(client.clientName || client['CUSTOMER NAME'] || "").trim(),
          salesRepName: String(client.salesRepName || client['SALES REP'] || "").trim(),
          currency: client.currency || "EGP"
        };

        // Skip empty rows
        if (!clientData.clientCode && !clientData.clientName) {
          console.log('Skipping empty row');
          continue;
        }

        // Validate client data
        insertClientSchema.parse(clientData);
        results.valid++;

      } catch (error: any) {
        results.invalid++;
        results.errors.push(`Error validating client: ${error.message}`);
      }
    }

    console.log('\n--- Validation Summary ---');
    console.log(`Valid clients: ${results.valid}`);
    console.log(`Invalid clients: ${results.invalid}`);

    if (results.errors.length > 0) {
      console.log('\nErrors:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    console.log('\nClients are loaded directly from clients-data.json file.');

  } catch (error) {
    console.error('Import failed:', error);
  }
}

importClients();