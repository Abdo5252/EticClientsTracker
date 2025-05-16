import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { db } from './firebase';

async function importClientsToFirestore() {
  try {
    console.log('Starting import of clients to Firestore...');

    // Read the JSON file
    const filePath = path.join(process.cwd(), 'clients-data.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const clients = JSON.parse(jsonData);

    console.log(`Found ${clients.length} clients to import.`);

    // Get a reference to the 'clients' collection
    const clientsCollection = collection(db, 'clients');

    // Import each client to Firestore
    let successCount = 0;
    for (const client of clients) {
      try {
        // Add client to Firestore
        await addDoc(clientsCollection, client);
        successCount++;
        console.log(`Imported client: ${client.clientName} (${successCount}/${clients.length})`);
      } catch (error) {
        console.error(`Error importing client ${client.clientName}:`, error);
      }
    }

    console.log(`Import completed. Successfully imported ${successCount} out of ${clients.length} clients.`);
  } catch (error) {
    console.error('Error in import process:', error);
  }
}

// Run the import function
importClientsToFirestore();