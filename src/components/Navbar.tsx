"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Store, Home, Package, ShoppingCart, FileText, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, refetch } = useSession();

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");

    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    if (error?.code) {
      toast.error("Sign out failed");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/login");
      toast.success("Signed out successfully");
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    { href: "/billing", label: "Billing", icon: ShoppingCart },
    { href: "/invoices", label: "Invoices", icon: FileText },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md group-hover:shadow-lg transition-all">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent hidden sm:block">
                Kumar Pooja Store
              </span>
            </Link>

            <div className="hidden md:flex md:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {session?.user && (
              <>
                <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {session.user.email}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="default" 
                  onClick={handleSignOut}
                  className="shadow-sm hover:shadow-md transition-all border-gray-300 hover:border-red-300 hover:text-red-600 font-semibold"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-3 flex space-x-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all",
                  isActive
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                )}
              >
                <Icon className="h-4 w-4 mr-1.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}