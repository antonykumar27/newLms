import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatters";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];

const CostChart = ({ data, type }) => {
  if (!data) return null;

  const renderMonthlyChart = () => {
    const chartData = data?.data?.cashFlowMonths?.slice(0, 12) || [];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 1000}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
            formatter={(value) => formatCurrency(value)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="inflow"
            stroke="#10B981"
            strokeWidth={2}
            name="Inflow"
          />
          <Line
            type="monotone"
            dataKey="outflow"
            stroke="#EF4444"
            strokeWidth={2}
            name="Outflow"
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Cumulative"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderOptimizationChart = () => {
    const chartData = [
      { name: "Cloud", value: 45 },
      { name: "Storage", value: 30 },
      { name: "Third Party", value: 20 },
      { name: "Other", value: 5 },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {type === "monthly" ? "Monthly Cost Trends" : "Cost Distribution"}
      </h3>
      {type === "monthly" ? renderMonthlyChart() : renderOptimizationChart()}
    </motion.div>
  );
};

export default CostChart;
