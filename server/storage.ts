
import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  invoices, type Invoice, type InsertInvoice,
  payments, type Payment, type InsertPayment,
  activities, type Activity, type InsertActivity,
  settings, type Setting, type InsertSetting,
  type ClientWithBalance
} from "@shared/schema";
import * as bcrypt from "bcrypt";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getClientByCode(code: string): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  getInvoicesByClientId(clientId: number): Promise<Invoice[]>;
  getAllInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByClientId(clientId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<Payment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;

  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;

  // Dashboard operations
  getDashboardData(): Promise<any>;
  getOverdueClients(): Promise<ClientWithBalance[]>;

  // Report operations
  getClientReport(clientId: number, startDate?: Date, endDate?: Date): Promise<any>;
  getMonthlyReport(startDate?: Date, endDate?: Date): Promise<any>;
  getAgingReport(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private invoices: Map<number, Invoice>;
  private payments: Map<number, Payment>;
  private activities: Map<number, Activity>;
  private settings: Map<string, Setting>;
  private currentUserId: number;
  private currentClientId: number;
  private currentInvoiceId: number;
  private currentPaymentId: number;
  private currentActivityId: number;
  private currentSettingId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.invoices = new Map();
    this.payments = new Map();
    this.activities = new Map();
    this.settings = new Map();
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentInvoiceId = 1;
    this.currentPaymentId = 1;
    this.currentActivityId = 1;
    this.currentSettingId = 1;

    // Initialize with a default admin user (admin/admin)
    this.createUser({
      username: 'admin',
      password: '$2a$10$VCJVrsLvhEf5U4ozELg8HuWf7/WEwHZK734QFRnYVoR8Jl8uEJnhW', // 'admin'
      displayName: 'مدير النظام',
      role: 'admin'
    });

    // Initialize with a plain text user (user/password)
    this.createPlainUser();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Helper to create a test user with plaintext password for debugging
  private async createPlainUser() {
    // Hash the plaintext password "password"
    const hashedPassword = await bcrypt.hash('password', 10);
    const id = this.currentUserId++;
    const user: User = {
      id,
      username: 'user',
      password: hashedPassword,
      displayName: 'Test User',
      role: 'user'
    };

    this.users.set(id, user);
    console.log(`Created test user: user/password`);
    return user;
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByCode(code: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(
      (client) => client.clientCode === code
    );
  }

  async getClients(): Promise<Client[]> {
    try {
      // Read clients from JSON file
      const fs = require('fs');
      const path = require('path');
      const clientsPath = path.resolve(process.cwd(), 'clients-data.json');
      
      if (!fs.existsSync(clientsPath)) {
        console.log('clients-data.json not found, returning in-memory clients');
        return Array.from(this.clients.values());
      }
      
      const clientsData = JSON.parse(fs.readFileSync(clientsPath, 'utf8'));
      
      // Map JSON data to client objects
      const clients: Client[] = clientsData.map((client: any, index: number) => {
        const id = index + 1;
        return {
          id,
          clientCode: String(client.clientCode || client.CODE || "").trim(),
          clientName: String(client.clientName || client['CUSTOMER NAME'] || "").trim(),
          salesRepName: String(client.salesRepName || client['SALES REP'] || "").trim(),
          currency: client.currency || "EGP",
          balance: client.balance || 0
        };
      });
      
      // Update in-memory store with clients from file
      this.clients.clear();
      clients.forEach(client => {
        this.clients.set(client.id, client);
      });
      
      return clients;
    } catch (error) {
      console.error('Error reading clients from JSON file:', error);
      return Array.from(this.clients.values());
    }
  }

  async createClient(client: InsertClient): Promise<Client> {
    console.log('Warning: Creating clients in-memory is deprecated. Update clients-data.json instead.');
    const id = this.currentClientId++;
    const newClient: Client = { ...client, id, balance: 0 };
    this.clients.set(id, newClient);

    // Log activity
    await this.createActivity({
      activityType: 'client_created',
      description: `تم إضافة عميل جديد: ${client.clientName}`,
      entityId: id,
      entityType: 'client'
    });

    return newClient;
  }

  async updateClient(id: number, clientData: Partial<Client>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updatedClient = { ...client, ...clientData };
    this.clients.set(id, updatedClient);

    // Log activity
    await this.createActivity({
      activityType: 'client_updated',
      description: `تم تحديث بيانات العميل: ${client.clientName}`,
      entityId: id,
      entityType: 'client'
    });

    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    const client = this.clients.get(id);
    if (!client) return false;

    // Check if client has invoices or payments
    const hasInvoices = Array.from(this.invoices.values()).some(
      invoice => invoice.clientId === id
    );

    const hasPayments = Array.from(this.payments.values()).some(
      payment => payment.clientId === id
    );

    if (hasInvoices || hasPayments) return false;

    const deleted = this.clients.delete(id);

    if (deleted) {
      // Log activity
      await this.createActivity({
        activityType: 'client_deleted',
        description: `تم حذف العميل: ${client.clientName}`,
        entityId: id,
        entityType: 'client'
      });
    }

    return deleted;
  }

  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      invoice => invoice.invoiceNumber === invoiceNumber
    );
  }

  async getInvoicesByClientId(clientId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      invoice => invoice.clientId === clientId
    );
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const newInvoice: Invoice = { 
      ...invoice, 
      id, 
      paidAmount: 0,
      status: 'open'
    };
    this.invoices.set(id, newInvoice);

    // Update client balance
    const client = this.clients.get(newInvoice.clientId);
    if (client) {
      client.balance += newInvoice.totalAmount;
      this.clients.set(client.id, client);
    }

    // Log activity
    await this.createActivity({
      activityType: 'invoice_created',
      description: `تم إضافة فاتورة جديدة رقم ${invoice.invoiceNumber} للعميل: ${client?.clientName}`,
      entityId: id,
      entityType: 'invoice'
    });

    return newInvoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    // Calculate balance difference if amount changed
    let balanceDiff = 0;
    if (invoiceData.totalAmount !== undefined && invoice.totalAmount !== invoiceData.totalAmount) {
      balanceDiff = invoiceData.totalAmount - invoice.totalAmount;
    }

    const updatedInvoice = { ...invoice, ...invoiceData };
    this.invoices.set(id, updatedInvoice);

    // Update client balance if needed
    if (balanceDiff !== 0) {
      const client = this.clients.get(invoice.clientId);
      if (client) {
        client.balance += balanceDiff;
        this.clients.set(client.id, client);
      }
    }

    // Log activity
    await this.createActivity({
      activityType: 'invoice_updated',
      description: `تم تحديث الفاتورة رقم ${invoice.invoiceNumber}`,
      entityId: id,
      entityType: 'invoice'
    });

    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const invoice = this.invoices.get(id);
    if (!invoice) return false;

    // Adjust client balance before deleting
    const client = this.clients.get(invoice.clientId);
    if (client) {
      client.balance -= (invoice.totalAmount - invoice.paidAmount);
      this.clients.set(client.id, client);
    }

    const deleted = this.invoices.delete(id);

    if (deleted) {
      // Log activity
      await this.createActivity({
        activityType: 'invoice_deleted',
        description: `تم حذف الفاتورة رقم ${invoice.invoiceNumber}`,
        entityId: id,
        entityType: 'invoice'
      });
    }

    return deleted;
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByClientId(clientId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.clientId === clientId
    );
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const newPayment: Payment = { ...payment, id };
    this.payments.set(id, newPayment);

    // Get client's invoices ordered by date (oldest first)
    const clientInvoices = Array.from(this.invoices.values())
      .filter(invoice => invoice.clientId === payment.clientId)
      .filter(invoice => invoice.totalAmount > invoice.paidAmount)
      .sort((a, b) => a.invoiceDate.getTime() - b.invoiceDate.getTime());

    // Apply payment to invoices starting from oldest
    let remainingAmount = payment.amount;
    for (const invoice of clientInvoices) {
      if (remainingAmount <= 0) break;

      const amountDue = invoice.totalAmount - invoice.paidAmount;
      const amountToApply = Math.min(amountDue, remainingAmount);

      // Update invoice
      invoice.paidAmount += amountToApply;
      invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 'partial';
      this.invoices.set(invoice.id, invoice);

      remainingAmount -= amountToApply;
    }

    // Update client balance
    const client = this.clients.get(payment.clientId);
    if (client) {
      client.balance -= payment.amount;
      this.clients.set(client.id, client);
    }

    // Log activity
    await this.createActivity({
      activityType: 'payment_created',
      description: `تم تسجيل دفعة جديدة بقيمة ${payment.amount} من العميل: ${client?.clientName}`,
      entityId: id,
      entityType: 'payment'
    });

    return newPayment;
  }

  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    // This is complicated because we need to recalculate how payments are applied to invoices
    // For simplicity, we don't support changing the amount after creation
    if (paymentData.amount !== undefined && payment.amount !== paymentData.amount) {
      throw new Error('Changing payment amount is not supported');
    }

    const updatedPayment = { ...payment, ...paymentData };
    this.payments.set(id, updatedPayment);

    // Log activity
    await this.createActivity({
      activityType: 'payment_updated',
      description: `تم تحديث بيانات الدفعة بتاريخ ${payment.paymentDate.toLocaleDateString()}`,
      entityId: id,
      entityType: 'payment'
    });

    return updatedPayment;
  }

  async deletePayment(id: number): Promise<boolean> {
    // Payment deletion is complex because we need to recalculate invoice payments
    // Not recommended for production but implementing for completeness
    const payment = this.payments.get(id);
    if (!payment) return false;

    // Restore client balance
    const client = this.clients.get(payment.clientId);
    if (client) {
      client.balance += payment.amount;
      this.clients.set(client.id, client);
    }

    // Get all client invoices and reset payments
    const clientInvoices = Array.from(this.invoices.values())
      .filter(invoice => invoice.clientId === payment.clientId);

    for (const invoice of clientInvoices) {
      invoice.paidAmount = 0;
      invoice.status = 'open';
      this.invoices.set(invoice.id, invoice);
    }

    // Now reapply all payments except the one being deleted
    const clientPayments = Array.from(this.payments.values())
      .filter(p => p.clientId === payment.clientId && p.id !== id)
      .sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime());

    for (const p of clientPayments) {
      let remainingAmount = p.amount;
      for (const invoice of clientInvoices.sort((a, b) => a.invoiceDate.getTime() - b.invoiceDate.getTime())) {
        if (remainingAmount <= 0) break;

        const amountDue = invoice.totalAmount - invoice.paidAmount;
        const amountToApply = Math.min(amountDue, remainingAmount);

        // Update invoice
        invoice.paidAmount += amountToApply;
        invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 'partial';
        this.invoices.set(invoice.id, invoice);

        remainingAmount -= amountToApply;
      }
    }

    const deleted = this.payments.delete(id);

    if (deleted) {
      // Log activity
      await this.createActivity({
        activityType: 'payment_deleted',
        description: `تم حذف دفعة بقيمة ${payment.amount}`,
        entityId: id,
        entityType: 'payment'
      });
    }

    return deleted;
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getActivities(limit?: number): Promise<Activity[]> {
    const all = Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? all.slice(0, limit) : all;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const timestamp = new Date();
    const newActivity: Activity = { ...activity, id, timestamp };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const setting = this.settings.get(key);
    if (!setting) return undefined;

    const updatedSetting = { ...setting, value };
    this.settings.set(key, updatedSetting);
    return updatedSetting;
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const id = this.currentSettingId++;
    const newSetting: Setting = { ...setting, id };
    this.settings.set(setting.key, newSetting);
    return newSetting;
  }

  // Dashboard operations
  async getDashboardData(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's invoices
    const todayInvoices = Array.from(this.invoices.values()).filter(
      invoice => new Date(invoice.invoiceDate).setHours(0, 0, 0, 0) === today.getTime()
    );

    const yesterdayInvoices = Array.from(this.invoices.values()).filter(
      invoice => new Date(invoice.invoiceDate).setHours(0, 0, 0, 0) === yesterday.getTime()
    );

    // Get today's payments
    const todayPayments = Array.from(this.payments.values()).filter(
      payment => new Date(payment.paymentDate).setHours(0, 0, 0, 0) === today.getTime()
    );

    const yesterdayPayments = Array.from(this.payments.values()).filter(
      payment => new Date(payment.paymentDate).setHours(0, 0, 0, 0) === yesterday.getTime()
    );

    // Calculate totals
    const totalSalesToday = todayInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalSalesYesterday = yesterdayInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    const totalPaymentsToday = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPaymentsYesterday = yesterdayPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get overdue clients (oversimplified: clients with balance > 0)
    const overdueClients = await this.getOverdueClients();

    // Get recent activities
    const recentActivities = await this.getActivities(10);

    // Get top clients by balance
    const topClients = Array.from(this.clients.values())
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);

    return {
      totalSalesToday,
      totalSalesYesterday,
      totalSalesChange: totalSalesYesterday > 0 
        ? (totalSalesToday - totalSalesYesterday) / totalSalesYesterday * 100 
        : 0,
      totalPaymentsToday,
      totalPaymentsYesterday,
      totalPaymentsChange: totalPaymentsYesterday > 0 
        ? (totalPaymentsToday - totalPaymentsYesterday) / totalPaymentsYesterday * 100 
        : 0,
      invoiceCount: todayInvoices.length,
      overdueClientsCount: overdueClients.length,
      recentActivities,
      topClients
    };
  }

  async getOverdueClients(): Promise<ClientWithBalance[]> {
    // In a real system, this would check invoice due dates
    // For simplicity, we'll just return clients with positive balance
    return Array.from(this.clients.values())
      .filter(client => client.balance > 0)
      .map(client => ({
        ...client,
        invoices: Array.from(this.invoices.values()).filter(
          invoice => invoice.clientId === client.id && invoice.status !== 'paid'
        )
      }));
  }

  // Report operations
  async getClientReport(clientId: number, startDate?: Date, endDate?: Date): Promise<any> {
    const client = await this.getClient(clientId);
    if (!client) throw new Error('Client not found');

    // Get invoices and filter by date if needed
    let clientInvoices = await this.getInvoicesByClientId(clientId);
    if (startDate) {
      clientInvoices = clientInvoices.filter(
        invoice => invoice.invoiceDate >= startDate
      );
    }
    if (endDate) {
      clientInvoices = clientInvoices.filter(
        invoice => invoice.invoiceDate <= endDate
      );
    }

    // Get payments and filter by date if needed
    let clientPayments = await this.getPaymentsByClientId(clientId);
    if (startDate) {
      clientPayments = clientPayments.filter(
        payment => payment.paymentDate >= startDate
      );
    }
    if (endDate) {
      clientPayments = clientPayments.filter(
        payment => payment.paymentDate <= endDate
      );
    }

    // Calculate totals
    const totalSales = clientInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalPayments = clientPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const balance = totalSales - totalPayments;

    return {
      client,
      invoices: clientInvoices,
      payments: clientPayments,
      totalSales,
      totalPayments,
      balance
    };
  }

  async getMonthlyReport(startDate?: Date, endDate?: Date): Promise<any> {
    // Get all clients
    const allClients = await this.getClients();

    // Filter invoices by date if needed
    let allInvoices = await this.getAllInvoices();
    if (startDate) {
      allInvoices = allInvoices.filter(
        invoice => invoice.invoiceDate >= startDate
      );
    }
    if (endDate) {
      allInvoices = allInvoices.filter(
        invoice => invoice.invoiceDate <= endDate
      );
    }

    // Filter payments by date if needed
    let allPayments = await this.getAllPayments();
    if (startDate) {
      allPayments = allPayments.filter(
        payment => payment.paymentDate >= startDate
      );
    }
    if (endDate) {
      allPayments = allPayments.filter(
        payment => payment.paymentDate <= endDate
      );
    }

    // Group invoices and payments by client
    const clientReports = allClients.map(client => {
      const clientInvoices = allInvoices.filter(invoice => invoice.clientId === client.id);
      const clientPayments = allPayments.filter(payment => payment.clientId === client.id);

      const totalSales = clientInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const totalPayments = clientPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const balance = client.balance;

      return {
        client,
        totalSales,
        totalPayments,
        balance
      };
    });

    const totalSales = allInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const totalPayments = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalBalance = allClients.reduce((sum, client) => sum + client.balance, 0);

    return {
      clientReports,
      totalSales,
      totalPayments,
      totalBalance
    };
  }

  async getAgingReport(): Promise<any> {
    const today = new Date();
    const allClients = await this.getClients();
    const allInvoices = await this.getAllInvoices();

    // For each client, group unpaid invoices by age
    const agingData = allClients.map(client => {
      const clientInvoices = allInvoices.filter(
        invoice => invoice.clientId === client.id && invoice.status !== 'paid'
      );

      // Group by month (simplified)
      const byMonth: Record<number, number> = {};

      for (const invoice of clientInvoices) {
        const ageInDays = Math.floor((today.getTime() - invoice.invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        const ageInMonths = Math.floor(ageInDays / 30);

        if (!byMonth[ageInMonths]) byMonth[ageInMonths] = 0;
        byMonth[ageInMonths] += invoice.totalAmount - invoice.paidAmount;
      }

      return {
        client,
        aging: byMonth,
        totalDue: clientInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0)
      };
    }).filter(item => item.totalDue > 0); // Only include clients with outstanding balances

    return {
      agingData,
      totalDue: agingData.reduce((sum, data) => sum + data.totalDue, 0)
    };
  }
}

export const storage = new MemStorage();
