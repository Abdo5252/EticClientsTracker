
import { storage } from './storage';
import { readFileSync } from 'fs';
import path from 'path';
import { insertClientSchema } from '@shared/schema';

/**
 * Enhanced script to check clients in database and add clients from JSON if needed
 */
async function checkClients() {
  try {
    // First check current clients
    let clients = await storage.getClients();
    console.log('Current clients in database before adding data:');
    console.log(JSON.stringify(clients, null, 2));
    console.log(`Total clients before adding data: ${clients.length}`);

    // If no clients, add from JSON file
    if (clients.length === 0) {
      console.log('\nNo clients found. Importing from clients-data.json...');
      
      try {
        const filePath = path.resolve(process.cwd(), 'clients-data.json');
        console.log(`Importing clients from: ${filePath}`);
    
        // Read file
        const fileContent = readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
    
        console.log(`Found ${jsonData.length} records in file`);
    
        // Process first 5 clients for demonstration
        const sampleSize = Math.min(5, jsonData.length);
        const sampleData = jsonData.slice(0, sampleSize);
        
        console.log(`Processing first ${sampleSize} clients as sample...`);
        
        for (const row of sampleData) {
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
    
          try {
            // Validate client data
            const validatedData = insertClientSchema.parse(clientData);
    
            // Check if client code already exists
            const existingClient = await storage.getClientByCode(validatedData.clientCode);
            if (existingClient) {
              console.log(`Client with code ${validatedData.clientCode} already exists`);
              continue;
            }
    
            // Create client
            await storage.createClient(validatedData);
            console.log(`Added client: ${clientData.clientName}`);
          } catch (error: any) {
            console.error(`Error processing client: ${error.message}`);
          }
        }
        
        console.log('\nTo import all clients, run: npm run import-clients-json');
      } catch (error) {
        console.error('Error importing from JSON:', error);
        
        // Fallback to test clients if JSON import fails
        console.log('\nFalling back to test clients...');
        
        const testClients = [
          {
            clientCode: 'C001',
            clientName: 'شركة الأهرام للتجارة',
            salesRepName: 'أحمد محمود',
            currency: 'EGP'
          },
          {
            clientCode: 'C002',
            clientName: 'مؤسسة النيل للصناعات',
            salesRepName: 'محمد علي',
            currency: 'EGP'
          },
          {
            clientCode: 'C003',
            clientName: 'شركة المصرية للاستيراد',
            salesRepName: 'سمير حسن',
            currency: 'USD'
          },
          {
            clientCode: 'C004',
            clientName: 'مجموعة الدلتا التجارية',
            salesRepName: 'خالد إبراهيم',
            currency: 'EGP'
          },
          {
            clientCode: 'C005',
            clientName: 'شركة الإسكندرية للتصدير',
            salesRepName: 'طارق محمد',
            currency: 'EUR'
          }
        ];

        for (const client of testClients) {
          await storage.createClient(client);
          console.log(`Added test client: ${client.clientName}`);
        }
      }
      
      // Check again after adding
      clients = await storage.getClients();
      console.log('\nClients after adding data:');
      console.log(JSON.stringify(clients, null, 2));
      console.log(`Total clients after adding data: ${clients.length}`);
    }
  } catch (error) {
    console.error('Error checking clients:', error);
  }
}

checkClients();
