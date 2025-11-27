
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Invoice } from "@/types";
import { format } from "date-fns";
import { Search, Download, Eye, Calendar, IndianRupee } from "lucide-react";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, startDate, endDate]);

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams();
      params.append("limit", "100");
      
      const response = await fetch(`/api/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.customerPhone?.includes(searchTerm)
      );
    }

    if (startDate) {
      filtered = filtered.filter((inv) => new Date(inv.createdAt) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter((inv) => new Date(inv.createdAt) <= new Date(endDate + "T23:59:59"));
    }

    setFilteredInvoices(filtered);
  };

  const viewInvoice = async (id: number) => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      if (response.ok) {
        const invoice = await response.json();
        printInvoice(invoice);
      } else {
        toast.error("Failed to load invoice");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const printInvoice = (invoice: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 20px; }
          .header p { margin: 2px 0; font-size: 11px; }
          .info { margin: 15px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
          th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; }
          td { padding: 5px 0; border-bottom: 1px dashed #ccc; }
          .totals { margin-top: 15px; font-size: 12px; }
          .totals div { display: flex; justify-content: space-between; margin: 5px 0; }
          .grand-total { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 5px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Kumar Pooja Store</h1>
          <p>Ambai Rd, opposite to TPV Multiplex</p>
          <p>Alangulam, Tamil Nadu 627851</p>
          <p>Phone: 9489657260, 094898 30438</p>
        </div>
        
        <div class="info">
          <div><strong>Invoice:</strong> ${invoice.invoiceNumber}</div>
          <div><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleString()}</div>
          ${invoice.customerName ? `<div><strong>Customer:</strong> ${invoice.customerName}</div>` : ""}
          ${invoice.customerPhone ? `<div><strong>Phone:</strong> ${invoice.customerPhone}</div>` : ""}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td>${item.productName}</td>
                <td style="text-align: right;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="text-align: right;">₹${item.lineTotal.toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal:</span><span>₹${invoice.subtotal.toFixed(2)}</span></div>
          ${invoice.discountAmount > 0 ? `<div><span>Discount:</span><span>-₹${invoice.discountAmount.toFixed(2)}</span></div>` : ""}
          ${invoice.taxAmount > 0 ? `<div><span>Tax (${invoice.taxPercentage}%):</span><span>₹${invoice.taxAmount.toFixed(2)}</span></div>` : ""}
          <div class="grand-total"><span>Grand Total:</span><span>₹${invoice.grandTotal.toFixed(2)}</span></div>
        </div>

        <div class="footer">
          <p><strong>Thank you! Visit again.</strong></p>
        </div>

        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const exportToCSV = () => {
    if (filteredInvoices.length === 0) {
      toast.error("No invoices to export");
      return;
    }

    const headers = ["Invoice Number", "Date", "Customer Name", "Phone", "Subtotal", "Discount", "Tax", "Grand Total"];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      format(new Date(inv.createdAt), "dd/MM/yyyy HH:mm"),
      inv.customerName || "Walk-in",
      inv.customerPhone || "-",
      inv.subtotal.toFixed(2),
      inv.discountAmount.toFixed(2),
      inv.taxAmount.toFixed(2),
      inv.grandTotal.toFixed(2),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoices_${format(new Date(), "yyyyMMdd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Invoices exported successfully");
  };

  const calculateTotalSales = () => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice History</h1>
              <p className="text-gray-600 mt-1">View and manage past invoices</p>
            </div>
            <Button onClick={exportToCSV} disabled={filteredInvoices.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredInvoices.length}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredInvoices.length !== invoices.length ? "Filtered results" : "All time"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{calculateTotalSales().toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">From selected invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{filteredInvoices.length > 0 ? (calculateTotalSales() / filteredInvoices.length).toFixed(2) : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Per invoice</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Invoice no, customer, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {(searchTerm || startDate || endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Invoice List */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8">Loading invoices...</p>
              ) : filteredInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No invoices found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Invoice No</th>
                        <th className="text-left py-3 px-4">Date & Time</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-right py-3 px-4">Amount</th>
                        <th className="text-right py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {format(new Date(invoice.createdAt), "dd MMM yyyy, hh:mm a")}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{invoice.customerName || "Walk-in Customer"}</p>
                              {invoice.customerPhone && (
                                <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold">₹{invoice.grandTotal.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewInvoice(invoice.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View/Print
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
