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

const CostBreakdownChart = ({ data }) => {
  const chartData = data?.data?.breakdown
    ? [
        {
          name: "Office",
          value: data.data.breakdown.office.monthly,
          percentage: data.data.breakdown.office.percentage,
        },
        {
          name: "Salaries",
          value: data.data.breakdown.salaries.monthly,
          percentage: data.data.breakdown.salaries.percentage,
        },
        {
          name: "Legal",
          value: data.data.breakdown.legal.monthly,
          percentage:
            (
              ((data.data.breakdown.legal.yearly || 0) /
                12 /
                data.data.overview.totalMonthly) *
              100
            ).toFixed(1) + "%",
        },
        {
          name: "Technology",
          value: data.data.breakdown.tech.monthly,
          percentage: data.data.breakdown.tech.percentage,
        },
      ]
    : [
        { name: "Office", value: 53000, percentage: "7.1%" },
        { name: "Salaries", value: 668000, percentage: "89.0%" },
        { name: "Legal", value: 15000, percentage: "2.0%" },
        { name: "Technology", value: 14500, percentage: "1.9%" },
      ];

  const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

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
            label={({ name, percentage }) => `${name} ${percentage}`}
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
        {chartData.map((item, index) => (
          <div key={index} className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.name}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CostBreakdownChart;
