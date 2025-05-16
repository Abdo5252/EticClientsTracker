
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { readFileSync } from 'fs';
import path from 'path';
import { db } from './firebase';

async function importClientsToFirestore() {
  try {
    console.log('Starting import of clients to Firestore...');

    // Read the JSON file
    const filePath = path.join(process.cwd(), 'clients-data.json');
    const jsonData = readFileSync(filePath, 'utf8');
    const clientsData = JSON.parse(jsonData);

    console.log(`Found ${clientsData.length} clients to import.`);

    // Get a reference to the 'clients' collection
    const clientsCollection = collection(db, 'clients');

    // Import each client to Firestore
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const client of clientsData) {
      try {
        // Create a properly formatted client object with all required fields
        const clientData = {
          clientCode: String(client.CODE || client.clientCode || "").trim(),
          clientName: String(client['CUSTOMER NAME'] || client.clientName || "").trim(),
          salesRepName: String(client['SALES REP'] || client.salesRepName || "").trim(),
          currency: client.currency || "EGP", // Default currency
          balance: Number(client.balance || 0),      // Initial balance
          createdAt: serverTimestamp()
        };

        // Skip empty or invalid entries
        if (!clientData.clientCode || !clientData.clientName) {
          console.log(`Skipping client with missing code or name: ${JSON.stringify(client)}`);
          skipCount++;
          continue;
        }

        // Check if client already exists
        const clientQuery = query(
          clientsCollection, 
          where("clientCode", "==", clientData.clientCode)
        );
        
        const existingClients = await getDocs(clientQuery);
        
        if (!existingClients.empty) {
          console.log(`Client with code ${clientData.clientCode} already exists in Firestore`);
          skipCount++;
          continue;
        }

        // Add client to Firestore
        await addDoc(clientsCollection, clientData);
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`Progress: ${successCount} clients imported successfully`);
        }
      } catch (error) {
        console.error(`Error importing client ${client.CODE || client.clientCode || 'unknown'}:`, error);
        errorCount++;
      }
    }

    console.log(`\nImport completed:`);
    console.log(`- Successfully imported: ${successCount} clients`);
    console.log(`- Skipped: ${skipCount} clients`);
    console.log(`- Errors: ${errorCount} clients`);
    
    // Add a log entry to Firestore activities
    if (successCount > 0) {
      await addDoc(collection(db, 'activities'), {
        activityType: 'system',
        description: `تم استيراد ${successCount} عميل الى قاعدة البيانات`,
        timestamp: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error in import process:', error);
  }
}

// Run the import function
importClientsToFirestore();
