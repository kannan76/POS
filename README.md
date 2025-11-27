# Kumar Pooja Store - Billing & Inventory Management System

![Kumar Pooja Store](https://img.shields.io/badge/Status-Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

A complete web-based billing and product management system for retail shops built with Next.js 15, TypeScript, and Turso database.

## 🌟 Features

### ✅ Complete Feature Set

- **🔐 Authentication System**
  - Email/password login and registration
  - Secure session management with Better Auth
  - Protected routes with role-based access control
  
- **📦 Product Management**
  - Add, edit, delete products
  - Category organization (Pooja Items, Groceries, Stationary, Personal Care)
  - Stock quantity tracking
  - Barcode support
  - Search and filter products
  - Mark products as active/inactive
  
- **🛒 POS/Billing System**
  - Fast product selection with search
  - Cart management with quantity adjustment
  - Auto-calculations (subtotal, discount, tax, grand total)
  - Flexible discount (percentage or fixed amount)
  - GST/tax support
  - Customer details (optional name and phone)
  - Auto-save to local storage (recover on refresh)
  - Auto-generated invoice numbers: `KPS-YYYYMMDD-001`
  
- **🧾 Invoice Management**
  - Complete invoice history
  - Search by invoice number, customer, or phone
  - Filter by date range
  - View and reprint any invoice
  - Export to CSV/Excel
  - Dashboard statistics (total sales, average sale, invoice count)
  
- **📊 Dashboard**
  - Today's sales summary
  - Total products count
  - Low stock alerts (< 10 units)
  - Recent invoices preview
  - Quick action cards

- **🖨️ Professional Invoice Printing**
  - Thermal/receipt printer friendly layout
  - Store name, address, and contact details
  - Invoice number and date/time
  - Customer details
  - Itemized list with quantities and prices
  - Discount and tax breakdown
  - Grand total
  - "Thank you" message

## 🏪 Store Details

**Kumar Pooja Store**  
Ambai Rd, opposite to TPV Multiplex  
Alangulam, Tamil Nadu 627851  
Phone: 9489657260, 094898 30438

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **UI Library**: Shadcn/UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Database**: Turso (LibSQL/SQLite in the cloud)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner (toast notifications)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun runtime
- Git

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Environment variables are already configured**
   
   The `.env` file is already set up with:
   - Turso database connection
   - Authentication secret
   - All necessary credentials

3. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Login

1. Go to the login page
2. Click "Don't have an account? Register"
3. Create your account with email and password
4. Login and start using the system!

## 📖 User Guide

### Creating Your First Invoice

1. **Login** to the system
2. Navigate to **Billing** from the top menu
3. **Search for a product** by name or barcode
4. Select the product and enter quantity
5. Click **Add to Cart**
6. Repeat for all items
7. *(Optional)* Add customer name and phone
8. *(Optional)* Apply discount or tax
9. Click **Save & Print Invoice**
10. Invoice will be saved and print dialog will open

### Managing Products

1. Navigate to **Products**
2. Click **Add Product** button
3. Fill in product details (name, category, prices, unit, stock)
4. Click **Add Product**
5. Use search and filters to find products
6. Edit or delete products as needed

### Viewing Invoice History

1. Navigate to **Invoices**
2. Use search to find specific invoices
3. Filter by date range
4. Click **View/Print** to see or reprint any invoice
5. Click **Export CSV** to download all filtered invoices

## 🗄️ Database Schema

### Main Tables

1. **users** - User accounts with roles (admin/staff)
2. **products** - Inventory items with pricing and stock
3. **invoices** - Invoice headers with totals
4. **invoice_items** - Line items for each invoice
5. **stock_movements** - Inventory tracking (optional)

### Sample Data

The database comes pre-loaded with **30 products** across 4 categories:
- Pooja Items (8 products)
- Groceries (8 products)
- Stationary (7 products)
- Personal Care (7 products)

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `TURSO_CONNECTION_URL`
   - `TURSO_AUTH_TOKEN`
   - `BETTER_AUTH_SECRET`
5. Click Deploy

Your app will be live at `your-project.vercel.app`

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables (same as above)
6. Deploy

## 🎨 Customization

### Change Store Name and Address

Update these files with your store details:

1. **src/app/billing/page.tsx** - Invoice print template
2. **src/app/invoices/page.tsx** - Invoice print template
3. **src/components/Navbar.tsx** - Navigation bar
4. **src/app/login/page.tsx** - Login page header

### Add New Product Categories

Edit **src/app/products/page.tsx**:

```typescript
const categories = ["Pooja Items", "Groceries", "Stationary", "Personal Care", "Your Category"];
```

### Customize Invoice Number Format

Edit **src/app/api/invoices/route.ts**:

```typescript
const invoiceNumber = `YOUR_PREFIX-${dateStr}-${String(sequenceNumber).padStart(3, '0')}`;
```

## 📱 Mobile Friendly

The entire application is fully responsive and works perfectly on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop computers

## 🐛 Troubleshooting

### Login Issues
- Clear browser cache and cookies
- Check browser console for errors
- Verify you've registered an account

### Products Not Loading
- Check server logs in terminal
- Verify database connection in `.env`
- Restart development server

### Print Issues
- Allow pop-ups in your browser
- Try Chrome for best compatibility
- Check printer settings

### More Help
See **SETUP_GUIDE.md** for detailed troubleshooting steps.

## 📚 Documentation

- **SETUP_GUIDE.md** - Complete setup and user guide
- **API Documentation** - See `/src/app/api/` for endpoint details
- **Database Schema** - See `/src/db/schema.ts`

## 🎯 Key Features Summary

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Complete |
| Product Management | ✅ Complete |
| POS/Billing | ✅ Complete |
| Invoice History | ✅ Complete |
| Dashboard | ✅ Complete |
| Print Invoices | ✅ Complete |
| Export CSV | ✅ Complete |
| Mobile Responsive | ✅ Complete |
| Multi-device Support | ✅ Complete |
| Auto-save Cart | ✅ Complete |

## 🙏 Credits

Built with ❤️ for **Kumar Pooja Store**

- Framework: [Next.js](https://nextjs.org)
- UI Components: [Shadcn/UI](https://ui.shadcn.com)
- Database: [Turso](https://turso.tech)
- Authentication: [Better Auth](https://better-auth.com)

---

**Made with 💙 for small retail shops**

Start billing today! 🚀