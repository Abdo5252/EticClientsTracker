import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for currency
export const currencyEnum = pgEnum('currency', ['EGP', 'USD', 'EUR']);

// Enum for payment methods
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'transfer', 'check', 'card']);

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default('user'),
});

// Clients schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  clientCode: text("client_code").notNull().unique(),
  clientName: text("client_name").notNull(),
  salesRepName: text("sales_rep_name").notNull().default(''),
  balance: doublePrecision("balance").notNull().default(0),
  currency: currencyEnum("currency").notNull().default('EGP'),
});

// Invoices schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  invoiceDate: timestamp("invoice_date").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  paidAmount: doublePrecision("paid_amount").notNull().default(0),
  currency: currencyEnum("currency").notNull().default('EGP'),
  status: text("status").notNull().default('open'),
});

// Payments schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  amount: doublePrecision("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  checkNumber: text("check_number"),
  transactionId: text("transaction_id"),
  notes: text("notes"),
  currency: currencyEnum("currency").notNull().default('EGP'),
});

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  entityId: integer("entity_id"),
  entityType: text("entity_type"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// Insert schemas for each table
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  role: true,
});

export const insertClientSchema = createInsertSchema(clients).pick({
  clientCode: true,
  clientName: true,
  salesRepName: true,
  currency: true,
});

export const insertInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  clientId: z.number().int().positive(),
  invoiceDate: z.date(),
  totalAmount: z.number().positive(),
  currency: z.string().min(1).default("EGP"),
  paidAmount: z.number().default(0),
  status: z.enum(["open", "partial", "paid"]).default("open"),
  exchangeRate: z.number().default(1),
  extraDiscount: z.number().default(0),
  activityCode: z.string().nullable().optional(),
  documentType: z.string().nullable().optional(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  clientId: true,
  amount: true,
  paymentDate: true,
  paymentMethod: true,
  checkNumber: true,
  transactionId: true,
  notes: true,
  currency: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  activityType: true,
  description: true,
  entityId: true,
  entityType: true,
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Client with invoices related type
export type ClientWithBalance = Client & {
  invoices?: Invoice[];
  payments?: Payment[];
}