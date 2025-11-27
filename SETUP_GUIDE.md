# Kumar Pooja Store - Complete Setup Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Setup](#database-setup)
4. [Local Development](#local-development)
5. [Deployment](#deployment)
6. [User Guide](#user-guide)
7. [Troubleshooting](#troubleshooting)

---

## 🏪 System Overview

**Kumar Pooja Store Billing System** is a complete web-based retail management solution featuring:

- **Authentication**: Secure login with email/password
- **Products Management**: Add, edit, delete, and track inventory
- **POS/Billing**: Fast billing with auto-calculations and invoice generation
- **Invoice History**: Search, filter, view, and export past invoices
- **Multi-device Support**: Access from any device with internet
- **Cloud Storage**: All data stored securely in Turso database

**Store Details:**
- Name: Kumar Pooja Store
- Address: Ambai Rd, opposite to TPV Multiplex, Alangulam, Tamil Nadu 627851
- Phone: 9489657260, 094898 30438

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Shadcn/UI + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **State Management**: React Hooks

### Backend
- **Database**: Turso (LibSQL) - Cloud SQLite
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **API**: Next.js API Routes

### Deployment
- **Frontend**: Vercel (recommended) or Netlify
- **Database**: Turso (already configured)

---

## 🗄️ Database Setup

### Database Schema

The system uses **5 main tables**:

#### 1. **users** - User accounts and roles
```sql
- id (integer, primary key)
- email (text, unique)
- name (text)
- role (text) - 'admin' or 'staff'
- isActive (boolean)
- createdAt, updatedAt (text)
```

#### 2. **products** - Inventory items
```sql
- id (integer, primary key)
- name (text)
- category (text) - 'Pooja Items', 'Groceries', 'Stationary', 'Personal Care'
- mrp (real) - Maximum Retail Price
- sellingPrice (real) - Actual selling price
- unit (text) - 'piece', 'kg', 'liter', 'packet', 'box'
- barcode (text, optional)
- stockQuantity (integer)
- isActive (boolean)
- createdAt, updatedAt (text)
```

#### 3. **invoices** - Bill headers
```sql
- id (integer, primary key)
- invoiceNumber (text, unique) - Format: KPS-YYYYMMDD-001
- customerName (text, optional)
- customerPhone (text, optional)
- subtotal (real)
- discountAmount (real)
- discountPercentage (real)
- taxPercentage (real)
- taxAmount (real)
- grandTotal (real)
- createdAt (text)
- createdBy (integer, FK to users)
```

#### 4. **invoice_items** - Bill line items
```sql
- id (integer, primary key)
- invoiceId (integer, FK to invoices)
- productId (integer, FK to products)
- productName (text) - Snapshot for history
- quantity (real)
- price (real)
- lineTotal (real)
- createdAt (text)
```

#### 5. **stock_movements** - Inventory tracking (optional)
```sql
- id (integer, primary key)
- productId (integer, FK to products)
- movementType (text) - 'sale', 'adjustment', 'return'
- quantity (real)
- referenceId (integer, optional)
- notes (text)
- createdAt (text)
- createdBy (integer, FK to users)
```

### Database Connection

Your database is already set up with Turso. The connection details are in `.env`:

```env
TURSO_CONNECTION_URL=libsql://db-451e8741-65f0-410a-a393-d946c228f7ab-orchids.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

**✅ Database is already created and populated with 30 sample products!**

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ or Bun runtime
- Git
- A code editor (VS Code recommended)

### Step 1: Install Dependencies

```bash
# Using npm
npm install

# OR using bun (faster)
bun install
```

### Step 2: Environment Variables

Your `.env` file is already configured with:
```env
TURSO_CONNECTION_URL=...
TURSO_AUTH_TOKEN=...
BETTER_AUTH_SECRET=...
```

**No changes needed!**

### Step 3: Run Development Server

```bash
# Using npm
npm run dev

# OR using bun
bun dev
```

The application will start at **http://localhost:3000**

### Step 4: Access the Application

1. Open **http://localhost:3000** in your browser
2. You'll be redirected to the login page
3. **Create a new account** OR use demo credentials:
   - Email: `admin@kumarpoojastore.com`
   - Password: `admin123` (you'll need to create this account first)

---

## 🚀 Deployment

### Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - **Add Environment Variables**:
     - `TURSO_CONNECTION_URL`
     - `TURSO_AUTH_TOKEN`
     - `BETTER_AUTH_SECRET`
   - Click "Deploy"

3. **Done!** Your app will be live at `your-project.vercel.app`

### Option 2: Deploy to Netlify

1. **Push code to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables (same as Vercel)
   - Click "Deploy"

---

## 📱 User Guide

### 1. Login / Registration

- Navigate to the login page
- Register with email and password
- After registration, login with your credentials
- You'll be redirected to the dashboard

### 2. Dashboard

The dashboard shows:
- **Today's Sales**: Total amount of invoices created today
- **Total Products**: Number of active products in inventory
- **Low Stock Items**: Products with quantity less than 10
- **Recent Invoices**: Last 5 invoices

Quick action cards:
- **New Bill**: Go to billing page
- **Manage Products**: Go to products page
- **View Invoices**: Go to invoice history

### 3. Products Management

#### Add a New Product
1. Click "Add Product" button
2. Fill in the form:
   - **Product Name**: e.g., "Camphor"
   - **Category**: Select from dropdown (Pooja Items, Groceries, etc.)
   - **MRP**: Maximum Retail Price (₹)
   - **Selling Price**: Actual selling price (₹)
   - **Unit**: piece, kg, liter, packet, box
   - **Stock Quantity**: Current inventory
   - **Barcode** (optional): For barcode scanner
3. Click "Add Product"

#### Edit a Product
1. Click the **Edit** (pencil) icon on any product card
2. Update the information
3. Click "Update Product"

#### Delete a Product
1. Click the **Delete** (trash) icon
2. Confirm deletion

#### Search and Filter
- Use the search box to find products by name or barcode
- Use the category dropdown to filter by category

### 4. Billing / POS

This is the main screen for creating invoices.

#### Creating an Invoice

**Step 1: Add Products to Cart**
1. Type product name or scan barcode in the search box
2. Select the product from dropdown
3. Enter quantity
4. Click "Add to Cart"
5. Repeat for all items

**Step 2: Adjust Quantities**
- Use + / - buttons to change quantity
- Click trash icon to remove an item

**Step 3: Add Customer Details (Optional)**
- Enter customer name
- Enter phone number

**Step 4: Apply Discount (Optional)**
- Select discount type: Percentage (%) or Amount (₹)
- Enter discount value

**Step 5: Add Tax (Optional)**
- Enter tax/GST percentage (e.g., 18 for 18% GST)

**Step 6: Save & Print**
- Review the bill summary on the right
- Click "Save & Print Invoice"
- Invoice will be saved to database
- Print dialog will open automatically
- Cart will be cleared for next bill

#### Auto-Save Feature
Your current bill is automatically saved to browser storage. If you accidentally close the browser, your cart will be restored when you return.

#### Keyboard Shortcuts (Coming Soon)
- Press `Enter` after typing quantity to add to cart
- Press `Esc` to clear search

### 5. Invoice History

View and manage past invoices.

#### Search and Filter
- **Search**: Enter invoice number, customer name, or phone
- **Date Range**: Filter by start and end date
- Click "Clear Filters" to reset

#### View/Print Invoice
1. Click "View/Print" button on any invoice
2. Invoice will open in a new window
3. Print dialog will open automatically
4. You can print or save as PDF

#### Export to CSV
1. Apply filters if needed (optional)
2. Click "Export CSV" button
3. Excel file will be downloaded with all filtered invoices

#### Statistics
- **Total Invoices**: Count of filtered invoices
- **Total Sales**: Sum of grand totals
- **Average Sale**: Average invoice amount

---

## 🔧 Customization

### Change Store Name and Address

Edit the following files:

1. **src/app/billing/page.tsx** (around line 400+)
   ```typescript
   <h1>Kumar Pooja Store</h1>
   <p>Ambai Rd, opposite to TPV Multiplex</p>
   <p>Alangulam, Tamil Nadu 627851</p>
   <p>Phone: 9489657260, 094898 30438</p>
   ```

2. **src/app/invoices/page.tsx** (around line 100+)
   Same HTML structure as above

3. **src/components/Navbar.tsx** (around line 50+)
   ```typescript
   <span className="font-bold text-lg">Kumar Pooja Store</span>
   ```

4. **src/app/login/page.tsx** (around line 70+)
   ```typescript
   <CardTitle>Kumar Pooja Store</CardTitle>
   ```

### Add More Product Categories

Edit **src/app/products/page.tsx**:
```typescript
const categories = ["Pooja Items", "Groceries", "Stationary", "Personal Care", "NEW_CATEGORY"];
```

### Change Invoice Number Format

Edit **src/app/api/invoices/route.ts**:
```typescript
const invoiceNumber = `KPS-${dateStr}-${String(sequenceNumber).padStart(3, '0')}`;
// Change "KPS" to your preferred prefix
```

---

## 🐛 Troubleshooting

### Problem: Login not working

**Solution:**
1. Check if you've registered an account
2. Clear browser cache and cookies
3. Check browser console for errors
4. Verify database connection in `.env`

### Problem: Products not loading

**Solution:**
1. Check server logs: `bun dev` output
2. Verify database connection
3. Open browser DevTools → Network tab → Check API responses
4. Try: `bun install` to reinstall dependencies

### Problem: Invoice printing not working

**Solution:**
1. Check if pop-ups are blocked in browser
2. Allow pop-ups for your domain
3. Try different browser (Chrome recommended)

### Problem: Can't export CSV

**Solution:**
1. Ensure there are invoices in the filtered results
2. Check browser download settings
3. Try a different browser

### Problem: Auto-save not working

**Solution:**
1. Check browser localStorage support
2. Try incognito/private mode
3. Clear browser data and retry

### Problem: Deployment failed

**Solution:**
1. Ensure all environment variables are added
2. Check build logs for errors
3. Verify `.env` values are correct
4. Try redeploying

---

## 📞 Support

For technical issues or questions:

1. **Check this guide first** - most common issues are covered
2. **Browser Console**: Press F12 → Console tab for error messages
3. **Server Logs**: Check terminal output where `bun dev` is running
4. **Database Status**: Visit Turso dashboard to check database health

---

## 🎉 Features Summary

✅ **Authentication** - Email/password login with secure sessions  
✅ **Products Management** - Full CRUD with search, filter, categories  
✅ **Billing/POS** - Fast checkout with auto-calculations  
✅ **Invoice Generation** - Auto-numbered (KPS-YYYYMMDD-001)  
✅ **Discount & Tax** - Flexible discount (% or ₹) and GST support  
✅ **Customer Details** - Optional name and phone tracking  
✅ **Print Invoice** - Clean thermal/receipt printer layout  
✅ **Invoice History** - Search, filter, view, reprint  
✅ **Export CSV** - Download invoice data for Excel  
✅ **Auto-save** - Cart saved to local storage  
✅ **Multi-device** - Access from any device  
✅ **Cloud Database** - Turso for reliable data storage  
✅ **Responsive UI** - Works on mobile, tablet, and desktop  

---

## 📊 Sample Data

The database comes pre-loaded with **30 products** across 4 categories:

- **Pooja Items** (8): Camphor, Agarbatti, Dhoop, Kumkum, Haldi, Diya, Pooja Oil, Coconut
- **Groceries** (8): Rice, Dal, Oil, Flour, Sugar, Tea, Salt, Chilli Powder
- **Stationary** (7): Notebooks, Pens, Pencils, Erasers, Sharpeners, Scale, Geometry Box
- **Personal Care** (7): Soap, Toothpaste, Shampoo, Hair Oil, Face Wash, Talcum Powder, Body Lotion

You can edit, delete, or add more products as needed!

---

## 🚦 Quick Start Checklist

- [ ] Install dependencies: `bun install`
- [ ] Check `.env` file exists with database credentials
- [ ] Start development server: `bun dev`
- [ ] Open http://localhost:3000
- [ ] Create an account / login
- [ ] Explore dashboard
- [ ] Add/edit products
- [ ] Create a test invoice
- [ ] View invoice history
- [ ] Export CSV
- [ ] Deploy to Vercel/Netlify
- [ ] Share live URL with team

---

**Congratulations! 🎊 Your billing system is ready to use!**

Happy billing! 🛒💰
