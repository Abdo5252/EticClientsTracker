
import { storage } from './storage';

/**
 * Debug function to check if clients are in the database 
 */
async function debugClients() {
  try {
    console.log("Checking client data in database...");
    
    // Get all clients
    const clients = await storage.getClients();
    console.log(`Found ${clients.length} clients in database`);
    
    if (clients.length > 0) {
      console.log("First 5 clients:");
      clients.slice(0, 5).forEach(client => {
        console.log(JSON.stringify(client, null, 2));
      });
    } else {
      console.log("No clients found in database");
      
      // Check for any database issues
      console.log("Checking database connection...");
      const dbTest = await storage.testConnection();
      console.log("Database connection:", dbTest ? "OK" : "FAILED");
    }
  } catch (error) {
    console.error("Error debugging clients:", error);
  }
}

debugClients();
