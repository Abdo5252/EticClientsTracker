import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import expressSession from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import * as bcrypt from "bcrypt";
import * as XLSX from "xlsx";
import { 
  insertClientSchema,
  insertInvoiceSchema,
  insertPaymentSchema,
  insertSettingSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session storage
  app.use(
    expressSession({
      secret: process.env.SESSION_SECRET || "eticclients-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Attempting login for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log(`User found, checking password for: ${username}`);
        console.log(`User password hash: ${user.password}`);
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log(`Password valid: ${isValidPassword}`);
        
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log(`Login successful for: ${username}`);
        return done(null, user);
      } catch (error) {
        console.error('Login error:', error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    });
  });

  // Client routes
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      
      // Check if client code already exists
      const existingClient = await storage.getClientByCode(validatedData.clientCode);
      if (existingClient) {
        return res.status(400).json({ message: "Client code already exists" });
      }
      
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingClient = await storage.getClient(id);
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const validatedData = insertClientSchema.partial().parse(req.body);
      const updatedClient = await storage.updateClient(id, validatedData);
      res.json(updatedClient);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteClient(id);
      if (!result) {
        return res.status(404).json({ message: "Client not found or cannot be deleted" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Upload initial client data
  app.post("/api/clients/upload", requireAuth, async (req, res) => {
    try {
      if (!req.body || !req.body.data || !Array.isArray(req.body.data)) {
        return res.status(400).json({ message: "Invalid data format" });
      }
      
      const clients = req.body.data;
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };
      
      console.log('Received client data:', clients);
      
      for (const client of clients) {
        try {
          // Extract client data
          const clientData = {
            clientCode: String(client.clientCode || client.CODE || "").trim(),
            clientName: String(client.clientName || client['CUSTOMER NAME'] || "").trim(),
            salesRepName: String(client.salesRepName || client['SALES REP'] || "").trim(),
            currency: client.currency || "EGP"
          };
          
          console.log('Processing client:', clientData);
          
          // Skip empty rows
          if (!clientData.clientCode && !clientData.clientName) {
            console.log('Skipping empty row');
            continue;
          }
          
          // Validate client data
          const validatedData = insertClientSchema.parse(clientData);
          
          // Check if client code already exists
          const existingClient = await storage.getClientByCode(validatedData.clientCode);
          if (existingClient) {
            results.failed++;
            results.errors.push(`العميل برمز ${validatedData.clientCode} موجود بالفعل`);
            continue;
          }
          
          // Create client
          await storage.createClient(validatedData);
          results.success++;
        } catch (error) {
          results.failed++;
          if (error instanceof ZodError) {
            results.errors.push(`خطأ في بيانات العميل: ${error.errors.map(e => e.message).join(', ')}`);
          } else {
            results.errors.push(`خطأ في العميل: ${client.clientName || client.name || "غير معروف"}`);
          }
        }
      }
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(parseInt(req.params.id));
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/clients/:id/invoices", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByClientId(parseInt(req.params.id));
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      
      // Check if invoice number already exists
      const existingInvoice = await storage.getInvoiceByNumber(validatedData.invoiceNumber);
      if (existingInvoice) {
        return res.status(400).json({ message: "Invoice number already exists" });
      }
      
      // Check if client exists
      const client = await storage.getClient(validatedData.clientId);
      if (!client) {
        return res.status(400).json({ message: "Client not found" });
      }
      
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Upload invoices
  app.post("/api/invoices/upload", requireAuth, async (req, res) => {
    try {
      if (!req.body || !req.body.data || !Array.isArray(req.body.data)) {
        return res.status(400).json({ message: "Invalid data format" });
      }
      
      const invoices = req.body.data;
      const results = {
        success: 0,
        failed: 0,
        modified: 0,
        errors: [] as string[]
      };
      
      for (const invoice of invoices) {
        try {
          // Find client by code or name
          let client;
          if (invoice.clientCode) {
            client = await storage.getClientByCode(invoice.clientCode);
          }
          
          if (!client && invoice.clientName) {
            // Find client by name (simplified)
            const allClients = await storage.getClients();
            client = allClients.find(c => c.clientName === invoice.clientName);
          }
          
          if (!client) {
            results.failed++;
            results.errors.push(`لم يتم العثور على العميل للفاتورة رقم ${invoice.invoiceNumber}`);
            continue;
          }
          
          // Check if invoice already exists
          const existingInvoice = await storage.getInvoiceByNumber(invoice.invoiceNumber);
          if (existingInvoice) {
            results.failed++;
            results.errors.push(`الفاتورة رقم ${invoice.invoiceNumber} موجودة بالفعل`);
            continue;
          }
          
          // Create invoice data
          const invoiceData = {
            invoiceNumber: invoice.invoiceNumber,
            clientId: client.id,
            invoiceDate: new Date(invoice.invoiceDate),
            totalAmount: parseFloat(invoice.totalAmount),
            currency: invoice.currency || client.currency || "EGP"
          };
          
          // Validate invoice data
          const validatedData = insertInvoiceSchema.parse(invoiceData);
          
          // Create invoice
          await storage.createInvoice(validatedData);
          results.success++;
        } catch (error) {
          results.failed++;
          if (error instanceof ZodError) {
            results.errors.push(`خطأ في بيانات الفاتورة: ${error.errors.map(e => e.message).join(', ')}`);
          } else {
            results.errors.push(`خطأ في الفاتورة رقم: ${invoice.invoiceNumber || "غير معروف"}`);
          }
        }
      }
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Payment routes
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const payment = await storage.getPayment(parseInt(req.params.id));
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/clients/:id/payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getPaymentsByClientId(parseInt(req.params.id));
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/payments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      
      // Check if client exists
      const client = await storage.getClient(validatedData.clientId);
      if (!client) {
        return res.status(400).json({ message: "Client not found" });
      }
      
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Activity routes
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Settings routes
  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/settings/:key", requireAuth, async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/settings", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSettingSchema.parse(req.body);
      
      // Check if setting already exists
      const existingSetting = await storage.getSetting(validatedData.key);
      if (existingSetting) {
        // Update existing setting
        const updatedSetting = await storage.updateSetting(validatedData.key, validatedData.value);
        return res.json(updatedSetting);
      }
      
      // Create new setting
      const setting = await storage.createSetting(validatedData);
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard", requireAuth, async (req, res) => {
    try {
      const dashboardData = await storage.getDashboardData();
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Report routes
  app.get("/api/reports/client/:id", requireAuth, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      
      // Parse start and end dates if provided
      let startDate = undefined;
      let endDate = undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }
      
      const report = await storage.getClientReport(clientId, startDate, endDate);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/reports/monthly", requireAuth, async (req, res) => {
    try {
      // Parse start and end dates if provided
      let startDate = undefined;
      let endDate = undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }
      
      const report = await storage.getMonthlyReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/reports/aging", requireAuth, async (req, res) => {
    try {
      const report = await storage.getAgingReport();
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  return httpServer;
}
