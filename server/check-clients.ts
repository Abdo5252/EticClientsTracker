
import { storage } from './storage';

/**
 * Simple script to check clients in database
 */
async function checkClients() {
  try {
    const clients = await storage.getClients();
    console.log('Current clients in database:');
    console.log(JSON.stringify(clients, null, 2));
    console.log(`Total clients: ${clients.length}`);
  } catch (error) {
    console.error('Error checking clients:', error);
  }
}

checkClients();
