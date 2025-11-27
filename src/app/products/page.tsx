"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Product } from "@/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  mrp: z.string().min(1, "MRP is required"),
  sellingPrice: z.string().min(1, "Selling price is required"),
  unit: z.string().min(1, "Unit is required"),
  barcode: z.string().optional(),
  stockQuantity: z.string().min(0, "Stock quantity is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

const categories = ["Pooja Items", "Groceries", "Stationary", "Personal Care"];
const units = ["piece", "kg", "liter", "packet", "box"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?limit=100");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const payload = {
        name: data.name,
        category: data.category,
        mrp: parseFloat(data.mrp),
        sellingPrice: parseFloat(data.sellingPrice),
        unit: data.unit,
        barcode: data.barcode || null,
        stockQuantity: parseInt(data.stockQuantity),
        isActive: true,
      };

      if (editingProduct) {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          toast.success("Product updated successfully");
          fetchProducts();
          setIsDialogOpen(false);
          setEditingProduct(null);
          reset();
        } else {
          toast.error("Failed to update product");
        }
      } else {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          toast.success("Product added successfully");
          fetchProducts();
          setIsDialogOpen(false);
          reset();
        } else {
          toast.error("Failed to add product");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setValue("name", product.name);
    setValue("category", product.category);
    setValue("mrp", product.mrp.toString());
    setValue("sellingPrice", product.sellingPrice.toString());
    setValue("unit", product.unit);
    setValue("barcode", product.barcode || "");
    setValue("stockQuantity", product.stockQuantity.toString());
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    reset();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">Manage your inventory</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingProduct(null); reset(); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input id="name" {...register("name")} />
                      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => setValue("category", value)} defaultValue={editingProduct?.category}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="mrp">MRP (₹) *</Label>
                      <Input id="mrp" type="number" step="0.01" {...register("mrp")} />
                      {errors.mrp && <p className="text-sm text-destructive">{errors.mrp.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                      <Input id="sellingPrice" type="number" step="0.01" {...register("sellingPrice")} />
                      {errors.sellingPrice && <p className="text-sm text-destructive">{errors.sellingPrice.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="unit">Unit *</Label>
                      <Select onValueChange={(value) => setValue("unit", value)} defaultValue={editingProduct?.unit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                      <Input id="stockQuantity" type="number" {...register("stockQuantity")} />
                      {errors.stockQuantity && <p className="text-sm text-destructive">{errors.stockQuantity.message}</p>}
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="barcode">Barcode (Optional)</Label>
                      <Input id="barcode" {...register("barcode")} />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProduct ? "Update" : "Add"} Product
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          {isLoading ? (
            <p className="text-center py-8">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No products found</p>
                <p className="text-gray-600">Add your first product to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">MRP:</span>
                        <span className="font-medium">₹{product.mrp.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Selling Price:</span>
                        <span className="font-medium text-green-600">₹{product.sellingPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Stock:</span>
                        <span className={`font-medium ${product.stockQuantity < 10 ? "text-amber-600" : ""}`}>
                          {product.stockQuantity} {product.unit}
                        </span>
                      </div>
                      {product.barcode && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Barcode:</span>
                          <span className="text-xs font-mono">{product.barcode}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
