export interface Product {
  id: number;
  name: string;
  category: string;
  mrp: number;
  sellingPrice: number;
  unit: string;
  barcode?: string | null;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  createdAt: string;
  createdBy?: number | null;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  productId?: number | null;
  productName: string;
  quantity: number;
  price: number;
  lineTotal: number;
  createdAt: string;
}

export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface DashboardStats {
  dailySales: number;
  totalProducts: number;
  lowStockProducts: number;
  recentInvoices: Invoice[];
}

export interface DashboardAnalytics {
  dailySales: Array<{
    date: string;
    sales: number;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
  }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}