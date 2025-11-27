import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChartIcon } from "lucide-react";

interface CategorySalesChartProps {
  data: Array<{
    category: string;
    sales: number;
  }>;
}

const COLORS = [
  "#ea580c", // orange-600
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
];

export const CategorySalesChart = ({ data }: CategorySalesChartProps) => {
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

  const chartData = data.map((item) => ({
    ...item,
    percentage: ((item.sales / totalSales) * 100).toFixed(1),
  }));

  return (
    <Card className="border-gray-200 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PieChartIcon className="h-6 w-6 text-blue-600" />
              Sales by Category
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Revenue distribution across product categories</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <PieChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No sales data available</p>
            <p className="text-sm text-gray-500 mt-1">Start selling to see category breakdown</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="sales"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => `₹${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 w-full space-y-2">
              {chartData.map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-semibold text-gray-900">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{item.sales.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
