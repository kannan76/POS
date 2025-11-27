import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";

interface DailySalesChartProps {
  data: Array<{
    date: string;
    sales: number;
  }>;
}

export const DailySalesChart = ({ data }: DailySalesChartProps) => {
  const formattedData = data.map((item) => ({
    ...item,
    dateLabel: format(parseISO(item.date), "MMM dd"),
  }));

  const totalWeeklySales = data.reduce((sum, item) => sum + item.sales, 0);
  const avgDailySales = totalWeeklySales / 7;

  return (
    <Card className="border-gray-200 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              Sales Trend (Last 7 Days)
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Daily revenue performance</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Weekly Total</p>
            <p className="text-2xl font-bold text-orange-600">₹{totalWeeklySales.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Avg: ₹{avgDailySales.toFixed(2)}/day</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="dateLabel" 
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis 
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`₹${value.toFixed(2)}`, "Sales"]}
              labelStyle={{ fontWeight: 600, color: "#111827" }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#ea580c"
              strokeWidth={3}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
