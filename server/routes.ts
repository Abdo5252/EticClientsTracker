
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import * as fs from 'fs';
import * as path from 'path';
import { 
  collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, 
  where, orderBy, serverTimestamp, Timestamp, setDoc 
} from "firebase/firestore";
import { db } from "./firebase";

export function setupRoutes(app) {
  // Authentication middleware
  function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Authentication required" });
  }

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Check user in Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        const userDoc = querySnapshot.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() };
        
        // Compare password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    })
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const userDoc = await getDoc(doc(db, "users", id));
      if (!userDoc.exists()) {
        return done(null, false);
      }
      done(null, { id: userDoc.id, ...userDoc.data() });
    } catch (error) {
      done(error);
    }
  });

  // Initialize session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "eticclients-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
      }
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Invalid username or password"
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ success: false, message: "Failed to establish session" });
        }
        
        return res.json({ 
          success: true, 
          user: { 
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role
          } 
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout(function(err) {
      if (err) {
        return res.status(500).json({ message: "Error during logout", error: err });
      }
      res.json({ success: true });
    });
  });

  // Check if authenticated
  app.get("/api/auth", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        authenticated: true, 
        user: { 
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName,
          role: req.user.role
        } 
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Get all clients
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const clientsRef = collection(db, "clients");
      const q = query(clientsRef, orderBy("clientName"));
      const querySnapshot = await getDocs(q);
      
      const clients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get specific client
  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const clientDoc = await getDoc(doc(db, "clients", req.params.id));
      if (!clientDoc.exists()) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const client = {
        id: clientDoc.id,
        ...clientDoc.data(),
        createdAt: clientDoc.data().createdAt?.toDate() || new Date()
      };
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Create client
  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const { clientCode, clientName, salesRepName, currency } = req.body;
      
      // Validate required fields
      if (!clientCode || !clientName) {
        return res.status(400).json({ message: "Client code and name are required" });
      }
      
      // Check for duplicate client code
      const clientsRef = collection(db, "clients");
      const q = query(clientsRef, where("clientCode", "==", clientCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return res.status(400).json({ message: "Client code already exists" });
      }
      
      // Create new client
      const newClient = {
        clientCode,
        clientName,
        salesRepName: salesRepName || "",
        currency: currency || "EGP",
        balance: 0,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(clientsRef, newClient);
      
      // Log activity
      await addDoc(collection(db, "activities"), {
        activityType: "client_created",
        description: `تم إضافة عميل جديد: ${clientName}`,
        entityId: docRef.id,
        entityType: "client",
        timestamp: serverTimestamp()
      });
      
      res.status(201).json({ 
        id: docRef.id, 
        ...newClient,
        createdAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Update client
  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const { clientCode, clientName, salesRepName, currency } = req.body;
      
      // Validate required fields
      if (!clientCode || !clientName) {
        return res.status(400).json({ message: "Client code and name are required" });
      }
      
      // Get client
      const clientDoc = await getDoc(doc(db, "clients", id));
      if (!clientDoc.exists()) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check for duplicate client code (if code is being changed)
      const existingData = clientDoc.data();
      if (clientCode !== existingData.clientCode) {
        const clientsRef = collection(db, "clients");
        const q = query(clientsRef, where("clientCode", "==", clientCode));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty && querySnapshot.docs[0].id !== id) {
          return res.status(400).json({ message: "Client code already exists" });
        }
      }
      
      // Update client
      const updatedClient = {
        clientCode,
        clientName,
        salesRepName: salesRepName || "",
        currency: currency || "EGP",
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, "clients", id), updatedClient);
      
      // Log activity
      await addDoc(collection(db, "activities"), {
        activityType: "client_updated",
        description: `تم تحديث بيانات العميل: ${clientName}`,
        entityId: id,
        entityType: "client",
        timestamp: serverTimestamp()
      });
      
      res.json({ 
        id, 
        ...updatedClient,
        balance: existingData.balance,
        createdAt: existingData.createdAt?.toDate() || new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Delete client
  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      
      // Check if client exists
      const clientDoc = await getDoc(doc(db, "clients", id));
      if (!clientDoc.exists()) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const clientData = clientDoc.data();
      
      // Check if client has invoices or payments
      const invoicesQuery = query(collection(db, "invoices"), where("clientId", "==", id));
      const invoiceSnapshot = await getDocs(invoicesQuery);
      
      const paymentsQuery = query(collection(db, "payments"), where("clientId", "==", id));
      const paymentSnapshot = await getDocs(paymentsQuery);
      
      if (!invoiceSnapshot.empty || !paymentSnapshot.empty) {
        return res.status(400).json({ message: "Cannot delete client with invoices or payments" });
      }
      
      // Delete client
      await deleteDoc(doc(db, "clients", id));
      
      // Log activity
      await addDoc(collection(db, "activities"), {
        activityType: "client_deleted",
        description: `تم حذف العميل: ${clientData.clientName}`,
        entityId: id,
        entityType: "client",
        timestamp: serverTimestamp()
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all invoices
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoicesRef = collection(db, "invoices");
      const q = query(invoicesRef, orderBy("invoiceDate", "desc"));
      const querySnapshot = await getDocs(q);
      
      const invoices = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        invoiceDate: doc.data().invoiceDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get invoices for specific client
  app.get("/api/clients/:id/invoices", requireAuth, async (req, res) => {
    try {
      const clientId = req.params.id;
      
      // Check if client exists
      const clientDoc = await getDoc(doc(db, "clients", clientId));
      if (!clientDoc.exists()) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Get invoices for client
      const invoicesRef = collection(db, "invoices");
      const q = query(
        invoicesRef, 
        where("clientId", "==", clientId),
        orderBy("invoiceDate", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const invoices = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        invoiceDate: doc.data().invoiceDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Create invoice
  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const { 
        invoiceNumber, 
        clientId, 
        invoiceDate, 
        totalAmount, 
        currency,
        status = "open",
        paidAmount = 0
      } = req.body;
      
      // Validate required fields
      if (!invoiceNumber || !clientId || !invoiceDate || !totalAmount) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if client exists
      const clientDoc = await getDoc(doc(db, "clients", clientId));
      if (!clientDoc.exists()) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check for duplicate invoice number
      const invoicesRef = collection(db, "invoices");
      const q = query(invoicesRef, where("invoiceNumber", "==", invoiceNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return res.status(400).json({ message: "Invoice number already exists" });
      }
      
      // Create new invoice
      const newInvoice = {
        invoiceNumber,
        clientId,
        invoiceDate: Timestamp.fromDate(new Date(invoiceDate)),
        totalAmount: Number(totalAmount),
        paidAmount: Number(paidAmount),
        currency: currency || "EGP",
        status,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(invoicesRef, newInvoice);
      
      // Update client balance
      const clientData = clientDoc.data();
      await updateDoc(doc(db, "clients", clientId), {
        balance: (clientData.balance || 0) + Number(totalAmount)
      });
      
      // Log activity
      await addDoc(collection(db, "activities"), {
        activityType: "invoice_created",
        description: `تم إضافة فاتورة جديدة رقم ${invoiceNumber} للعميل: ${clientData.clientName}`,
        entityId: docRef.id,
        entityType: "invoice",
        timestamp: serverTimestamp()
      });
      
      res.status(201).json({ 
        id: docRef.id, 
        ...newInvoice,
        invoiceDate: new Date(invoiceDate),
        createdAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Update invoice
  app.put("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const { 
        invoiceNumber, 
        clientId, 
        invoiceDate, 
        totalAmount, 
        paidAmount,
        status,
        currency 
      } = req.body;
      
      // Validate required fields
      if (!invoiceNumber || !clientId || !invoiceDate || !totalAmount) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get invoice
      const invoiceDoc = await getDoc(doc(db, "invoices", id));
      if (!invoiceDoc.exists()) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const existingInvoice = invoiceDoc.data();
      
      // Check for duplicate invoice number (if number is being changed)
      if (invoiceNumber !== existingInvoice.invoiceNumber) {
        const invoicesRef = collection(db, "invoices");
        const q = query(invoicesRef, where("invoiceNumber", "==", invoiceNumber));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty && querySnapshot.docs[0].id !== id) {
          return res.status(400).json({ message: "Invoice number already exists" });
        }
      }
      
      // Calculate balance diff
      const balanceDiff = Number(totalAmount) - Number(existingInvoice.totalAmount);
      
      // Update invoice
      const updatedInvoice = {
        invoiceNumber,
        clientId,
        invoiceDate: Timestamp.fromDate(new Date(invoiceDate)),
        totalAmount: Number(totalAmount),
        paidAmount: Number(paidAmount || 0),
        status: status || "open",
        currency: currency || "EGP",
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, "invoices", id), updatedInvoice);
      
      // Update client balance if needed
      if (balanceDiff !== 0) {
        const clientDoc = await getDoc(doc(db, "clients", clientId));
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          await updateDoc(doc(db, "clients", clientId), {
            balance: (clientData.balance || 0) + balanceDiff
          });
        }
      }
      
      // Log activity
      await addDoc(collection(db, "activities"), {
        activityType: "invoice_updated",
        description: `تم تحديث الفاتورة رقم ${invoiceNumber}`,
        entityId: id,
        entityType: "invoice",
        timestamp: serverTimestamp()
      });
      
      res.json({ 
        id, 
        ...updatedInvoice,
        invoiceDate: new Date(invoiceDate),
        updatedAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Delete invoice
  app.delete("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      
      // Get invoice
      const invoiceDoc = await getDoc(doc(db, "invoices", id));
      if (!invoiceDoc.exists()) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const invoice = invoiceDoc.data();
      
      // Update client balance
      const clientDoc = await getDoc(doc(db, "clients", invoice.clientId));
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        await updateDoc(doc(db, "clients", invoice.clientId), {
          balance: (clientData.balance || 0) - (invoice.totalAmount - invoice.paidAmount)
        });
      }
      
      // Delete invoice
      await deleteDoc(doc(db, "invoices", id));
      
      // Log activity
      await addDoc(collection(db, "activities"), {
        activityType: "invoice_deleted",
        description: `تم حذف الفاتورة رقم ${invoice.invoiceNumber}`,
        entityId: id,
        entityType: "invoice",
        timestamp: serverTimestamp()
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all payments
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const paymentsRef = collection(db, "payments");
      const q = query(paymentsRef, orderBy("paymentDate", "desc"));
      const querySnapshot = await getDocs(q);
      
      const payments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get payments for specific client
  app.get("/api/clients/:id/payments", requireAuth, async (req, res) => {
    try {
      const clientId = req.params.id;
      
      // Check if client exists
      const clientDoc = await getDoc(doc(db, "clients", clientId));
      if (!clientDoc.exists()) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Get payments for client
      const paymentsRef = collection(db, "payments");
      const q = query(
        paymentsRef, 
        where("clientId", "==", clientId),
        orderBy("paymentDate", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      
      const payments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Create payment
  app.post("/api/payments", requireAuth, async (req, res) => {
    try {
      const { 
        clientId, 
        amount, 
        paymentDate, 
        paymentMethod, 
        checkNumber, 
        transactionId, 
        notes, 
        currency 
      } = req.body;
      
      // Validate required fields
      if (!clientId || !amount || !paymentDate || !paymentMethod) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if client exists
      const clientDoc = await getDoc(doc(db, "clients", clientId));
      if (!clientDoc.exists()) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Create new payment
      const newPayment = {
        clientId,
        amount: Number(amount),
        paymentDate: Timestamp.fromDate(new Date(paymentDate)),
        paymentMethod,
        checkNumber: checkNumber || null,
        transactionId: transactionId || null,
        notes: notes || null,
        currency: currency || "EGP",
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "payments"), newPayment);
      
      // Get client's invoices ordered by date (oldest first)
      const invoicesRef = collection(db, "invoices");
      const q = query(
        invoicesRef,
        where("clientId", "==", clientId),
        where("status", "in", ["open", "partial"]),
        orderBy("invoiceDate")
      );
      
      const invoiceSnapshot = await getDocs(q);
      const invoices = invoiceSnapshot.docs;
      
      // Apply payment to invoices
      let remainingAmount = Number(amount);
      for (const invoiceDoc of invoices) {
        if (remainingAmount <= 0) break;
        
        const invoice = invoiceDoc.data();
        const amountDue = invoice.totalAmount - invoice.paidAmount;
        const amountToApply = Math.min(amountDue, remainingAmount);
        
        if (amountToApply > 0) {
          const newPaidAmount = invoice.paidAmount + amountToApply;
          const newStatus = newPaidAmount >= invoice.totalAmount ? "paid" : "partial";
          
          await updateDoc(doc(db, "invoices", invoiceDoc.id), {
            paidAmount: newPaidAmount,
            status: newStatus
          });
          
          remainingAmount -= amountToApply;
        }
      }
      
      // Update client balance
      const clientData = clientDoc.data();
      await updateDoc(doc(db, "clients", clientId), {
        balance: (clientData.balance || 0) - Number(amount)
      });
      
      // Log activity
      await addDoc(collection(db, "activities"), {
        activityType: "payment_created",
        description: `تم تسجيل دفعة جديدة بقيمة ${amount} من العميل: ${clientData.clientName}`,
        entityId: docRef.id,
        entityType: "payment",
        timestamp: serverTimestamp()
      });
      
      res.status(201).json({ 
        id: docRef.id, 
        ...newPayment,
        paymentDate: new Date(paymentDate),
        createdAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Update payment
  app.put("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const { 
        paymentDate, 
        paymentMethod, 
        checkNumber, 
        transactionId, 
        notes, 
        currency 
      } = req.body;
      
      // Get payment
      const paymentDoc = await getDoc(doc(db, "payments", id));
      if (!paymentDoc.exists()) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      const existingPayment = paymentDoc.data();
      
      // For simplicity, we don't allow changing the amount
      if (req.body.amount && req.body.amount !== existingPayment.amount) {
        return res.status(400).json({ message: "Changing payment amount is not supported" });
      }
      
      // Update payment
      const updatedPayment = {
        paymentDate: paymentDate ? Timestamp.fromDate(new Date(paymentDate)) : existingPayment.paymentDate,
        paymentMethod: paymentMethod || existingPayment.paymentMethod,
        checkNumber: checkNumber || existingPayment.checkNumber,
        transactionId: transactionId || existingPayment.transactionId,
        notes: notes || existingPayment.notes,
        currency: currency || existingPayment.currency,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, "payments", id), updatedPayment);
      
      // Log activity
      await addDoc(collection(db, "activities"), {
        activityType: "payment_updated",
        description: `تم تحديث بيانات الدفعة بتاريخ ${new Date(paymentDate || existingPayment.paymentDate.toDate()).toLocaleDateString()}`,
        entityId: id,
        entityType: "payment",
        timestamp: serverTimestamp()
      });
      
      res.json({ 
        id, 
        ...existingPayment,
        ...updatedPayment,
        paymentDate: new Date(paymentDate || existingPayment.paymentDate.toDate()),
        updatedAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Delete payment
  app.delete("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      
      // Get payment
      const paymentDoc = await getDoc(doc(db, "payments", id));
      if (!paymentDoc.exists()) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      const payment = paymentDoc.data();
      
      // Restore client balance
      const clientDoc = await getDoc(doc(db, "clients", payment.clientId));
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        await updateDoc(doc(db, "clients", payment.clientId), {
          balance: (clientData.balance || 0) + Number(payment.amount)
        });
      }
      
      // Get client's invoices
      const invoicesRef = collection(db, "invoices");
      const q = query(
        invoicesRef,
        where("clientId", "==", payment.clientId)
      );
      
      const invoiceSnapshot = await getDocs(q);
      
      // Reset all invoices to unpaid status
      for (const invoiceDoc of invoiceSnapshot.docs) {
        await updateDoc(doc(db, "invoices", invoiceDoc.id), {
          paidAmount: 0,
          status: "open"
        });
      }
      
      // Get all other payments except this one
      const paymentsRef = collection(db, "payments");
      const pq = query(
        paymentsRef,
        where("clientId", "==", payment.clientId),
        orderBy("paymentDate")
      );
      
      const paymentSnapshot = await getDocs(pq);
      const otherPayments = paymentSnapshot.docs
        .filter(doc => doc.id !== id)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Reapply all other payments
      for (const otherPayment of otherPayments) {
        let remainingAmount = otherPayment.amount;
        
        // Get updated invoice list and sort by date
        const updatedInvoiceSnapshot = await getDocs(q);
        const invoices = updatedInvoiceSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.invoiceDate.toMillis() - b.invoiceDate.toMillis());
        
        // Apply payment to invoices
        for (const invoice of invoices) {
          if (remainingAmount <= 0) break;
          
          const amountDue = invoice.totalAmount - invoice.paidAmount;
          const amountToApply = Math.min(amountDue, remainingAmount);
          
          if (amountToApply > 0) {
            const newPaidAmount = invoice.paidAmount + amountToApply;
            const newStatus = newPaidAmount >= invoice.totalAmount ? "paid" : "partial";
            
            await updateDoc(doc(db, "invoices", invoice.id), {
              paidAmount: newPaidAmount,
              status: newStatus
            });
            
            remainingAmount -= amountToApply;
          }
        }
      }
      
      // Delete payment
      await deleteDoc(doc(db, "payments", id));
      
      // Log activity
      await addDoc(collection(db, "activities"), {
        activityType: "payment_deleted",
        description: `تم حذف دفعة بقيمة ${payment.amount}`,
        entityId: id,
        entityType: "payment",
        timestamp: serverTimestamp()
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get activities
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const activitiesRef = collection(db, "activities");
      const q = query(
        activitiesRef,
        orderBy("timestamp", "desc"),
        limit
      );
      
      const querySnapshot = await getDocs(q);
      
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get dashboard data
  app.get("/api/dashboard", requireAuth, async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStart = Timestamp.fromDate(today);
      const todayEnd = Timestamp.fromDate(new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1));
      const yesterdayStart = Timestamp.fromDate(yesterday);
      const yesterdayEnd = Timestamp.fromDate(new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1));
      
      // Get today's invoices
      const invoicesRef = collection(db, "invoices");
      const todayInvoicesQuery = query(
        invoicesRef,
        where("invoiceDate", ">=", todayStart),
        where("invoiceDate", "<=", todayEnd)
      );
      
      const yesterdayInvoicesQuery = query(
        invoicesRef,
        where("invoiceDate", ">=", yesterdayStart),
        where("invoiceDate", "<=", yesterdayEnd)
      );
      
      const [todayInvoicesSnapshot, yesterdayInvoicesSnapshot] = await Promise.all([
        getDocs(todayInvoicesQuery),
        getDocs(yesterdayInvoicesQuery)
      ]);
      
      // Get today's payments
      const paymentsRef = collection(db, "payments");
      const todayPaymentsQuery = query(
        paymentsRef,
        where("paymentDate", ">=", todayStart),
        where("paymentDate", "<=", todayEnd)
      );
      
      const yesterdayPaymentsQuery = query(
        paymentsRef,
        where("paymentDate", ">=", yesterdayStart),
        where("paymentDate", "<=", yesterdayEnd)
      );
      
      const [todayPaymentsSnapshot, yesterdayPaymentsSnapshot] = await Promise.all([
        getDocs(todayPaymentsQuery),
        getDocs(yesterdayPaymentsQuery)
      ]);
      
      // Calculate totals
      const totalSalesToday = todayInvoicesSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().totalAmount, 0
      );
      
      const totalSalesYesterday = yesterdayInvoicesSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().totalAmount, 0
      );
      
      const totalPaymentsToday = todayPaymentsSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().amount, 0
      );
      
      const totalPaymentsYesterday = yesterdayPaymentsSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().amount, 0
      );
      
      // Get overdue clients
      const clientsRef = collection(db, "clients");
      const overdueClientsQuery = query(
        clientsRef,
        where("balance", ">", 0)
      );
      
      const overdueSnapshot = await getDocs(overdueClientsQuery);
      
      // Get recent activities
      const activitiesRef = collection(db, "activities");
      const activitiesQuery = query(
        activitiesRef,
        orderBy("timestamp", "desc"),
        limit(10)
      );
      
      const activitiesSnapshot = await getDocs(activitiesQuery);
      
      // Get top clients by balance
      const topClientsQuery = query(
        clientsRef,
        orderBy("balance", "desc"),
        limit(5)
      );
      
      const topClientsSnapshot = await getDocs(topClientsQuery);
      
      const dashboardData = {
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
        invoiceCount: todayInvoicesSnapshot.size,
        overdueClientsCount: overdueSnapshot.size,
        recentActivities: activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        })),
        topClients: topClientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
      
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get client report
  app.get("/api/reports/client/:id", requireAuth, async (req, res) => {
    try {
      const clientId = req.params.id;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      // Check if client exists
      const clientDoc = await getDoc(doc(db, "clients", clientId));
      if (!clientDoc.exists()) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const client = { id: clientDoc.id, ...clientDoc.data() };
      
      // Get invoices and filter by date if needed
      const invoicesRef = collection(db, "invoices");
      let invoicesQuery = query(
        invoicesRef,
        where("clientId", "==", clientId),
        orderBy("invoiceDate", "desc")
      );
      
      // Get payments and filter by date if needed
      const paymentsRef = collection(db, "payments");
      let paymentsQuery = query(
        paymentsRef,
        where("clientId", "==", clientId),
        orderBy("paymentDate", "desc")
      );
      
      const [invoicesSnapshot, paymentsSnapshot] = await Promise.all([
        getDocs(invoicesQuery),
        getDocs(paymentsQuery)
      ]);
      
      let clientInvoices = invoicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        invoiceDate: doc.data().invoiceDate?.toDate()
      }));
      
      let clientPayments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate()
      }));
      
      // Filter by date if needed
      if (startDate) {
        clientInvoices = clientInvoices.filter(
          invoice => invoice.invoiceDate >= startDate
        );
        
        clientPayments = clientPayments.filter(
          payment => payment.paymentDate >= startDate
        );
      }
      
      if (endDate) {
        clientInvoices = clientInvoices.filter(
          invoice => invoice.invoiceDate <= endDate
        );
        
        clientPayments = clientPayments.filter(
          payment => payment.paymentDate <= endDate
        );
      }
      
      // Calculate totals
      const totalSales = clientInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const totalPayments = clientPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      res.json({
        client,
        invoices: clientInvoices,
        payments: clientPayments,
        totalSales,
        totalPayments,
        balance: client.balance
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get monthly report
  app.get("/api/reports/monthly", requireAuth, async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      // Get all clients
      const clientsRef = collection(db, "clients");
      const clientsSnapshot = await getDocs(clientsRef);
      
      // Get invoices filtered by date if needed
      const invoicesRef = collection(db, "invoices");
      let invoicesQuery = query(invoicesRef);
      
      // Get payments filtered by date if needed
      const paymentsRef = collection(db, "payments");
      let paymentsQuery = query(paymentsRef);
      
      const [invoicesSnapshot, paymentsSnapshot] = await Promise.all([
        getDocs(invoicesQuery),
        getDocs(paymentsQuery)
      ]);
      
      let allInvoices = invoicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        invoiceDate: doc.data().invoiceDate?.toDate()
      }));
      
      let allPayments = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate()
      }));
      
      // Filter by date if needed
      if (startDate) {
        allInvoices = allInvoices.filter(
          invoice => invoice.invoiceDate >= startDate
        );
        
        allPayments = allPayments.filter(
          payment => payment.paymentDate >= startDate
        );
      }
      
      if (endDate) {
        allInvoices = allInvoices.filter(
          invoice => invoice.invoiceDate <= endDate
        );
        
        allPayments = allPayments.filter(
          payment => payment.paymentDate <= endDate
        );
      }
      
      // Group by client
      const clientReports = clientsSnapshot.docs.map(doc => {
        const client = { id: doc.id, ...doc.data() };
        
        const clientInvoices = allInvoices.filter(invoice => invoice.clientId === client.id);
        const clientPayments = allPayments.filter(payment => payment.clientId === client.id);
        
        const totalSales = clientInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        const totalPayments = clientPayments.reduce((sum, payment) => sum + payment.amount, 0);
        
        return {
          client,
          totalSales,
          totalPayments,
          balance: client.balance
        };
      });
      
      const totalSales = allInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const totalPayments = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const totalBalance = clientsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().balance || 0), 0
      );
      
      res.json({
        clientReports,
        totalSales,
        totalPayments,
        totalBalance
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get aging report
  app.get("/api/reports/aging", requireAuth, async (req, res) => {
    try {
      const today = new Date();
      
      // Get all clients
      const clientsRef = collection(db, "clients");
      const clientsSnapshot = await getDocs(clientsRef);
      
      // Get all invoices
      const invoicesRef = collection(db, "invoices");
      const invoicesQuery = query(
        invoicesRef,
        where("status", "in", ["open", "partial"])
      );
      
      const invoicesSnapshot = await getDocs(invoicesQuery);
      
      const agingData = [];
      
      for (const clientDoc of clientsSnapshot.docs) {
        const client = { id: clientDoc.id, ...clientDoc.data() };
        
        // Skip clients with no balance
        if (client.balance <= 0) continue;
        
        const clientInvoices = invoicesSnapshot.docs
          .filter(doc => doc.data().clientId === client.id)
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            invoiceDate: doc.data().invoiceDate?.toDate()
          }));
        
        if (clientInvoices.length === 0) continue;
        
        // Group by month
        const byMonth = {};
        let totalDue = 0;
        
        for (const invoice of clientInvoices) {
          const ageInDays = Math.floor((today.getTime() - invoice.invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
          const ageInMonths = Math.floor(ageInDays / 30);
          const outstandingAmount = invoice.totalAmount - invoice.paidAmount;
          
          if (!byMonth[ageInMonths]) byMonth[ageInMonths] = 0;
          byMonth[ageInMonths] += outstandingAmount;
          totalDue += outstandingAmount;
        }
        
        agingData.push({
          client,
          aging: byMonth,
          totalDue
        });
      }
      
      const totalDue = agingData.reduce((sum, data) => sum + data.totalDue, 0);
      
      res.json({
        agingData,
        totalDue
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Add a default user if none exists
  app.get("/api/setup", async (req, res) => {
    try {
      // Check if any users exist
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      
      if (usersSnapshot.empty) {
        // Create default admin user
        const hashedPassword = await bcrypt.hash("admin", 10);
        await addDoc(usersRef, {
          username: "admin",
          password: hashedPassword,
          displayName: "مدير النظام",
          role: "admin",
          createdAt: serverTimestamp()
        });
        
        // Create default user
        const userPassword = await bcrypt.hash("password", 10);
        await addDoc(usersRef, {
          username: "user",
          password: userPassword,
          displayName: "Test User",
          role: "user",
          createdAt: serverTimestamp()
        });
        
        res.json({ message: "Default users created", success: true });
      } else {
        res.json({ message: "Users already exist", success: false });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Import clients from clients-data.json to Firestore (one-time operation)
  app.get("/api/import-clients", requireAuth, async (req, res) => {
    try {
      const filePath = path.join(process.cwd(), 'clients-data.json');
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "clients-data.json file not found" });
      }
      
      // Read JSON file
      const jsonData = fs.readFileSync(filePath, 'utf8');
      const clientsData = JSON.parse(jsonData);
      
      // Process data
      const results = {
        success: 0,
        skipped: 0,
        failed: 0,
        errors: []
      };
      
      const clientsRef = collection(db, "clients");
      
      for (const row of clientsData) {
        try {
          // Extract client data
          const clientData = {
            clientCode: String(row.CODE || row.clientCode || "").trim(),
            clientName: String(row['CUSTOMER NAME'] || row.clientName || "").trim(),
            salesRepName: String(row['SALES REP'] || row.salesRepName || "").trim(),
            currency: row.currency || "EGP",
            balance: 0,
            createdAt: serverTimestamp()
          };
          
          // Skip empty records
          if (!clientData.clientCode || !clientData.clientName) {
            results.skipped++;
            continue;
          }
          
          // Check for duplicates
          const q = query(clientsRef, where("clientCode", "==", clientData.clientCode));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            results.skipped++;
            continue;
          }
          
          // Add to Firestore
          await addDoc(clientsRef, clientData);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(error.message);
        }
      }
      
      res.json({ 
        message: "Import completed", 
        success: true,
        results
      });
    } catch (error) {
      res.status(500).json({ message: "Import failed", error: error.message });
    }
  });
}
