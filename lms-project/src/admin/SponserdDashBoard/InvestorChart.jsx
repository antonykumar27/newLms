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

const InvestorChart = ({ data }) => {
  const chartData = [
    {
      name: "Angel",
      value: data.investors
        .filter((i) => i.type === "angel")
        .reduce((sum, i) => sum + i.investmentAmount, 0),
      count: data.investors.filter((i) => i.type === "angel").length,
    },
    {
      name: "Venture Capital",
      value: data.investors
        .filter((i) => i.type === "vc")
        .reduce((sum, i) => sum + i.investmentAmount, 0),
      count: data.investors.filter((i) => i.type === "vc").length,
    },
    {
      name: "Strategic",
      value: data.investors
        .filter((i) => i.type === "strategic")
        .reduce((sum, i) => sum + i.investmentAmount, 0),
      count: data.investors.filter((i) => i.type === "strategic").length,
    },
  ];

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Investment by Type
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
            formatter={(value) => formatCurrency(value)}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {chartData.map((item, index) => (
          <div key={item.name} className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.name}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {item.count}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default InvestorChart;
