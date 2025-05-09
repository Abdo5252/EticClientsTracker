
import { storage } from './storage';

/**
 * Add some test clients to the database
 */
async function addTestClients() {
  try {
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
      // Check if client already exists
      const existingClient = await storage.getClientByCode(client.clientCode);
      if (!existingClient) {
        await storage.createClient(client);
        console.log(`Added test client: ${client.clientName}`);
      } else {
        console.log(`Client ${client.clientName} already exists`);
      }
    }

    const clients = await storage.getClients();
    console.log(`Total clients after adding test data: ${clients.length}`);
  } catch (error) {
    console.error('Error adding test clients:', error);
  }
}

addTestClients();
