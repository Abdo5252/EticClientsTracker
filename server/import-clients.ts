import * as XLSX from 'xlsx';
import { storage } from './storage';
import { insertClientSchema } from '@shared/schema';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * Import clients from Excel file
 * 
 * Usage:
 * npm run import-clients -- path/to/your/excel-file.xlsx
 */
async function importClients() {
  try {
    // Get file path from command line args
    const filePath = process.argv[2];

    if (!filePath) {
      console.error('Please provide a file path as an argument');
      console.error('Example: npm run import-clients -- ./clients-data.xlsx');
      process.exit(1);
    }

    console.log(`Importing clients from: ${filePath}`);

    // Read file
    console.log('Reading file from path:', path.resolve(process.cwd(), filePath));
    const fileBuffer = readFileSync(path.resolve(process.cwd(), filePath));
    console.log('File size:', fileBuffer.length, 'bytes');
    const workbook = XLSX.read(fileBuffer);
    console.log('Workbook sheet names:', workbook.SheetNames);

    // Get first sheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${jsonData.length} records in file`);

    // Log the first row to see column names
    if (jsonData.length > 0) {
      console.log('First row column names:', Object.keys(jsonData[0]));
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
        // Extract client data from excel columns
        const clientData = {
          clientCode: String(row.CODE || row.clientCode || "").trim(),
          clientName: String(row['CUSTOMER NAME'] || row.clientName || "").trim(),
          salesRepName: String(row['SALES REP'] || row.salesRepName || "").trim(),
          currency: row.currency || "EGP"
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
        await storage.createClient(validatedData);
        results.success++;
        console.log(`Successfully added client: ${clientData.clientName}`);
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

importClients();