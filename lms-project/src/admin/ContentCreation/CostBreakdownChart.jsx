import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatters";

const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

const CostBreakdownChart = ({ data }) => {
  if (!data?.data?.categories) return null;

  const chartData = data.data.categories.map((cat) => ({
    name: cat.name,
    value: cat.cost,
    percentage: cat.percentage,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Cost Breakdown
      </h3>

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
            label={({ name, percentage }) => `${name} ${percentage}%`}
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
            formatter={(value) => formatCurrency(value)}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.data.categories.map((cat, index) => (
          <div key={index} className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {cat.name}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(cat.cost)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CostBreakdownChart;
