
import { storage } from './storage';

/**
 * Debug client data in the database
 */
async function debugClients() {
  try {
    console.log('Checking client data in database...');
    
    // Get all clients
    const clients = await storage.getClients();
    console.log(`Total clients in database: ${clients.length}`);
    
    if (clients.length > 0) {
      // Display the first 5 clients or all if fewer
      const sampleClients = clients.slice(0, Math.min(5, clients.length));
      console.log('Sample clients:');
      sampleClients.forEach(client => {
        console.log(`ID: ${client.id}, Code: ${client.clientCode}, Name: ${client.clientName}, Sales Rep: ${client.salesRepName}, Currency: ${client.currency}, Balance: ${client.balance}`);
      });
    } else {
      console.log('No clients found in the database.');
    }
    
    // Check API routes
    console.log('\nAPI route information:');
    console.log('GET /api/clients - Should return all clients');
    console.log('These routes should be defined in server/routes.ts');
    
  } catch (error) {
    console.error('Error debugging clients:', error);
  }
}

debugClients();
