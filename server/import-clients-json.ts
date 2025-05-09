
import { storage } from './storage';
import { insertClientSchema } from '@shared/schema';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * Import clients from JSON file
 * 
 * Usage:
 * npm run import-clients-json
 */
async function importClientsFromJson() {
  try {
    const filePath = path.resolve(process.cwd(), 'clients-data.json');
    console.log(`Importing clients from: ${filePath}`);

    // Read file
    const fileContent = readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    console.log(`Found ${jsonData.length} records in file`);

    // Log the first row to see column names
    if (jsonData.length > 0) {
      console.log('First row data sample:', jsonData[0]);
    }

    // Process data
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const row of jsonData) {
      try {
        // Extract client data from JSON object
        const clientData = {
          clientCode: String(row.CODE || "").trim(),
          clientName: String(row['CUSTOMER NAME'] || "").trim(),
          salesRepName: "", // Default empty string as salesRepName is not in the JSON
          currency: "EGP" // Default currency
        };

        // Skip empty rows
        if (!clientData.clientCode && !clientData.clientName) {
          console.log('Skipping empty row');
          continue;
        }

        console.log('Processing client:', clientData);

        // Validate client data
        const validatedData = insertClientSchema.parse(clientData);

        // Check if client code already exists
        const existingClient = await storage.getClientByCode(validatedData.clientCode);
        if (existingClient) {
          results.failed++;
          results.errors.push(`Client with code ${validatedData.clientCode} already exists`);
          continue;
        }

        // Create client
        const newClient = await storage.createClient(validatedData);
        results.success++;
        console.log(`Successfully added client: ${clientData.clientName}`, newClient);
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error processing client: ${error.message}`);
      }
    }

    console.log('\n--- Import Summary ---');
    console.log(`Successful imports: ${results.success}`);
    console.log(`Failed imports: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log('\nErrors:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

  } catch (error) {
    console.error('Import failed:', error);
  }
}

importClientsFromJson();
