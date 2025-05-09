
import { storage } from './storage';

/**
 * Enhanced script to check clients in database and add test clients if needed
 */
async function checkClients() {
  try {
    // First check current clients
    let clients = await storage.getClients();
    console.log('Current clients in database before adding test data:');
    console.log(JSON.stringify(clients, null, 2));
    console.log(`Total clients before adding test data: ${clients.length}`);

    // If no clients, add test clients
    if (clients.length === 0) {
      console.log('\nNo clients found. Adding test clients...');
      
      // Add some test clients
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
      
      // Check again after adding
      clients = await storage.getClients();
      console.log('\nClients after adding test data:');
      console.log(JSON.stringify(clients, null, 2));
      console.log(`Total clients after adding test data: ${clients.length}`);
    }
  } catch (error) {
    console.error('Error checking clients:', error);
  }
}

checkClients();
