
import { readFileSync } from 'fs';
import path from 'path';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

/**
 * Script to import clients from JSON file to Firestore
 * 
 * Usage:
 * npm run import-clients-to-firestore
 */
async function importClientsToFirestore() {
  try {
    const filePath = path.resolve(process.cwd(), 'clients-data.json');
    console.log(`Reading clients from: ${filePath}`);

    // Read file
    const fileContent = readFileSync(filePath, 'utf8');
    const clientsData = JSON.parse(fileContent);

    console.log(`Found ${clientsData.length} clients in file`);

    // Process data
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    };

    const clientsCollection = collection(db, 'clients');

    for (const client of clientsData) {
      try {
        // Extract client data from JSON object
        const clientData = {
          clientCode: String(client.CODE || "").trim(),
          clientName: String(client['CUSTOMER NAME'] || "").trim(),
          salesRepName: "", // Default empty string as salesRepName is not in the JSON
          currency: "EGP", // Default currency
          balance: 0,
          createdAt: new Date()
        };

        // Skip empty rows
        if (!clientData.clientCode && !clientData.clientName) {
          console.log('Skipping empty row');
          results.skipped++;
          continue;
        }

        // Check if client code already exists in Firestore
        const clientQuery = query(
          clientsCollection, 
          where("clientCode", "==", clientData.clientCode)
        );
        
        const existingClients = await getDocs(clientQuery);
        
        if (!existingClients.empty) {
          console.log(`Client with code ${clientData.clientCode} already exists in Firestore`);
          results.skipped++;
          continue;
        }

        // Add client to Firestore
        await addDoc(clientsCollection, clientData);
        results.success++;
        console.log(`Successfully added client: ${clientData.clientName} (${clientData.clientCode})`);
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error processing client: ${error.message}`);
        console.error(`Error processing client:`, error);
      }
    }

    console.log('\n--- Import Summary ---');
    console.log(`Successful imports: ${results.success}`);
    console.log(`Failed imports: ${results.failed}`);
    console.log(`Skipped imports: ${results.skipped}`);

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

// Run the import function
importClientsToFirestore();
