import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatters";

const ProfitChart = ({ data }) => {
  // Generate sample data if not provided
  const chartData = data?.data?.yearlyComparison || [
    {
      year: "Year 1",
      revenue: 45000000,
      costs: 15000000,
      profit: 30000000,
      margin: 66.7,
    },
    {
      year: "Year 2",
      revenue: 75000000,
      costs: 18000000,
      profit: 57000000,
      margin: 76.0,
    },
    {
      year: "Year 3",
      revenue: 116267590,
      costs: 21000000,
      profit: 95267590,
      margin: 81.9,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Profit & Loss Statement
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="year" stroke="#9CA3AF" />
          <YAxis
            yAxisId="left"
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 1000000}M`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#9CA3AF"
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
            formatter={(value, name) => {
              if (name === "margin") return `${value}%`;
              return formatCurrency(value);
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue" />
          <Bar yAxisId="left" dataKey="costs" fill="#EF4444" name="Costs" />
          <Bar yAxisId="left" dataKey="profit" fill="#10B981" name="Profit" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="margin"
            stroke="#8B5CF6"
            strokeWidth={2}
            name="Margin %"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Revenue
          </p>
          <p className="text-xl font-bold text-blue-600">
            {formatCurrency(chartData.reduce((sum, y) => sum + y.revenue, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Costs
          </p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(chartData.reduce((sum, y) => sum + y.costs, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Profit
          </p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(chartData.reduce((sum, y) => sum + y.profit, 0))}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfitChart;
