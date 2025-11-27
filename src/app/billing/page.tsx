"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Minus, Trash2, Printer, Save } from "lucide-react";
import { Product, CartItem } from "@/types";
import { toast } from "sonner";

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    saveCartToStorage();
  }, [cart, customerName, customerPhone, discountType, discountValue, taxPercentage]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?isActive=true&limit=100");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const loadCartFromStorage = () => {
    const saved = localStorage.getItem("current_bill");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCart(data.cart || []);
        setCustomerName(data.customerName || "");
        setCustomerPhone(data.customerPhone || "");
        setDiscountType(data.discountType || "percentage");
        setDiscountValue(data.discountValue || "");
        setTaxPercentage(data.taxPercentage || "0");
      } catch (error) {
        console.error("Failed to load saved cart");
      }
    }
  };

  const saveCartToStorage = () => {
    localStorage.setItem(
      "current_bill",
      JSON.stringify({
        cart,
        customerName,
        customerPhone,
        discountType,
        discountValue,
        taxPercentage,
      })
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter valid quantity");
      return;
    }

    const existingItem = cart.find((item) => item.productId === selectedProduct.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === selectedProduct.id
            ? {
                ...item,
                quantity: item.quantity + qty,
                lineTotal: (item.quantity + qty) * item.price,
              }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: qty,
        price: selectedProduct.sellingPrice,
        lineTotal: qty * selectedProduct.sellingPrice,
      };
      setCart([...cart, newItem]);
    }

    setSelectedProduct(null);
    setQuantity("1");
    setSearchTerm("");
    toast.success("Added to cart");
  };

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQty, lineTotal: newQty * item.price }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discVal = parseFloat(discountValue) || 0;

    if (discountType === "percentage") {
      return (subtotal * discVal) / 100;
    }
    return discVal;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const taxableAmount = subtotal - discount;
    const taxPct = parseFloat(taxPercentage) || 0;
    return (taxableAmount * taxPct) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const saveInvoice = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const subtotal = calculateSubtotal();
      const discountAmount = calculateDiscount();
      const discountPercentage = discountType === "percentage" ? parseFloat(discountValue) || 0 : 0;
      const taxAmount = calculateTax();
      const taxPct = parseFloat(taxPercentage) || 0;
      const grandTotal = calculateTotal();

      const payload = {
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          lineTotal: item.lineTotal,
        })),
        subtotal,
        discountAmount,
        discountPercentage,
        taxPercentage: taxPct,
        taxAmount,
        grandTotal,
        customerName: customerName.trim() || null,
        customerPhone: customerPhone.trim() || null,
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const invoice = await response.json();
        toast.success(`Invoice ${invoice.invoiceNumber} created successfully!`);
        
        // Print invoice
        printInvoice(invoice);

        // Clear cart
        clearCart();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create invoice");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
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

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscountValue("");
    setTaxPercentage("0");
    localStorage.removeItem("current_bill");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Billing / POS</h1>
            <p className="text-gray-600 mt-1">Create new invoice</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Product Selection */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Search Product</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {searchTerm && filteredProducts.length > 0 && (
                      <div className="mt-2 max-h-60 overflow-y-auto border rounded-md">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              setSelectedProduct(product);
                              setSearchTerm(product.name);
                            }}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                          >
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{product.sellingPrice} | Stock: {product.stockQuantity}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label>Selected Product</Label>
                      <Input value={selectedProduct?.name || ""} disabled />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={addToCart} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>

              {/* Cart Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cart.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Cart is empty</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium w-12 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold w-20 text-right">₹{item.lineTotal.toFixed(2)}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Billing Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Customer Name (Optional)</Label>
                    <Input
                      placeholder="Enter name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone Number (Optional)</Label>
                    <Input
                      placeholder="Enter phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Discount & Tax</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="amount">Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="0"
                      type="number"
                      step="0.01"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Tax / GST (%)</Label>
                    <Input
                      placeholder="0"
                      type="number"
                      step="0.01"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bill Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">-₹{calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  {calculateTax() > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({taxPercentage}%):</span>
                      <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Button
                      onClick={saveInvoice}
                      disabled={cart.length === 0 || isProcessing}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isProcessing ? "Processing..." : "Save & Print Invoice"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      disabled={cart.length === 0}
                      className="w-full"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
