import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Trophy } from "lucide-react";

interface TopProductsChartProps {
  data: Array<{
    name: string;
    revenue: number;
  }>;
}

const COLORS = ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa"];

export const TopProductsChart = ({ data }: TopProductsChartProps) => {
  const maxRevenue = Math.max(...data.map((p) => p.revenue), 0);

  return (
    <Card className="border-gray-200 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-green-600" />
              Top 5 Products by Revenue
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Best-selling items in your store</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No sales data available</p>
            <p className="text-sm text-gray-500 mt-1">Start selling to see top products</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis 
                type="number" 
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `₹${value}`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number) => [`₹${value.toFixed(2)}`, "Revenue"]}
                labelStyle={{ fontWeight: 600, color: "#111827" }}
                cursor={{ fill: "rgba(234, 88, 12, 0.1)" }}
              />
              <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
