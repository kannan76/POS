import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table with role-based access
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('staff'), // 'admin' or 'staff'
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Products table for retail inventory
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  mrp: real('mrp').notNull(),
  sellingPrice: real('selling_price').notNull(),
  unit: text('unit').notNull().default('piece'), // 'piece', 'kg', 'liter', 'packet', 'box'
  barcode: text('barcode'),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Invoices table for billing
export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  subtotal: real('subtotal').notNull(),
  discountAmount: real('discount_amount').notNull().default(0),
  discountPercentage: real('discount_percentage').notNull().default(0),
  taxPercentage: real('tax_percentage').notNull().default(0),
  taxAmount: real('tax_amount').notNull().default(0),
  grandTotal: real('grand_total').notNull(),
  createdAt: text('created_at').notNull(),
  createdBy: integer('created_by').references(() => users.id),
});

// Invoice items for line-level details
export const invoiceItems = sqliteTable('invoice_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id),
  productId: integer('product_id').references(() => products.id),
  productName: text('product_name').notNull(), // Snapshot for historical data
  quantity: real('quantity').notNull(),
  price: real('price').notNull(),
  lineTotal: real('line_total').notNull(),
  createdAt: text('created_at').notNull(),
});

// Stock movements for inventory tracking
export const stockMovements = sqliteTable('stock_movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id),
  movementType: text('movement_type').notNull(), // 'sale', 'adjustment', 'return'
  quantity: real('quantity').notNull(),
  referenceId: integer('reference_id'), // Optional reference to invoice or other entity
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  createdBy: integer('created_by').references(() => users.id),
});


// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});