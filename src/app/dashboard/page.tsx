"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, ShoppingCart, FileText, IndianRupee, TrendingUp, AlertCircle, ArrowUpRight, Eye } from "lucide-react";
import { DashboardStats, DashboardAnalytics } from "@/types";
import { format } from "date-fns";
import { DailySalesChart } from "@/components/dashboard/DailySalesChart";
import { CategorySalesChart } from "@/components/dashboard/CategorySalesChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/dashboard/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome to Kumar Pooja Store Management System</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Today's Sales - Featured Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold tracking-wide uppercase opacity-90">Today's Sales</CardTitle>
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <IndianRupee className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold mb-2">
                  ₹{isLoading ? "..." : stats?.dailySales.toFixed(2) || "0.00"}
                </div>
                <div className="flex items-center text-sm text-orange-100">
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">Current day total</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Products */}
            <Card className="relative overflow-hidden border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Products</CardTitle>
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {isLoading ? "..." : stats?.totalProducts || 0}
                </div>
                <p className="text-sm text-gray-600 font-medium">Active inventory items</p>
              </CardContent>
            </Card>

            {/* Low Stock Items */}
            <Card className="relative overflow-hidden border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-amber-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Low Stock Items</CardTitle>
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {isLoading ? "..." : stats?.lowStockProducts || 0}
                </div>
                <p className="text-sm text-gray-600 font-medium">Below 10 units</p>
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card className="relative overflow-hidden border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Recent Invoices</CardTitle>
                <div className="p-2.5 bg-green-100 rounded-xl">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {isLoading ? "..." : stats?.recentInvoices.length || 0}
                </div>
                <p className="text-sm text-gray-600 font-medium">Last 5 transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="space-y-6">
            {/* Daily Sales Chart */}
            {isAnalyticsLoading ? (
              <Card className="border-gray-200 shadow-xl">
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent" />
                    <p className="text-gray-600 mt-4 font-medium">Loading analytics...</p>
                  </div>
                </CardContent>
              </Card>
            ) : analytics ? (
              <>
                <DailySalesChart data={analytics.dailySales} />
                
                {/* Category & Top Products Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CategorySalesChart data={analytics.salesByCategory} />
                  <TopProductsChart data={analytics.topProducts} />
                </div>
              </>
            ) : null}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/billing" className="group">
                <Card className="h-full border-2 border-gray-200 hover:border-orange-500 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50/30">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                          <ShoppingCart className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">New Bill</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">Create invoice</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/products" className="group">
                <Card className="h-full border-2 border-gray-200 hover:border-blue-500 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                          <Package className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Manage Products</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">Add or edit items</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/invoices" className="group">
                <Card className="h-full border-2 border-gray-200 hover:border-green-500 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-green-50/30">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                          <FileText className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">View Invoices</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">Sales history</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>

          {/* Recent Invoices */}
          <Card className="border-gray-200 shadow-xl">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Recent Invoices</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Latest transactions from your store</p>
                </div>
                <Link href="/invoices">
                  <Button variant="outline" size="default" className="shadow-sm hover:shadow-md transition-shadow border-gray-300 hover:border-orange-500 hover:text-orange-600 font-semibold">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent" />
                  <p className="text-gray-600 mt-4 font-medium">Loading invoices...</p>
                </div>
              ) : stats?.recentInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No invoices yet</p>
                  <p className="text-sm text-gray-500 mt-1">Create your first invoice to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.recentInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-5 border-2 border-gray-100 rounded-xl hover:border-orange-200 hover:shadow-lg transition-all duration-200 bg-white"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{invoice.invoiceNumber}</p>
                          <p className="text-sm font-medium text-gray-700 mt-0.5">
                            {invoice.customerName || "Walk-in Customer"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                            {format(new Date(invoice.createdAt), "dd MMM yyyy, hh:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-gray-900">₹{invoice.grandTotal.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Grand Total</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}