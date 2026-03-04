import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const MetricsChart = ({ data, type, title }) => {
  // Generate sample data if no real data
  const generateSampleData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((month, index) => ({
      month,
      value:
        type === "users"
          ? 1000 + Math.floor(Math.random() * 500) + index * 100
          : 500000 + Math.floor(Math.random() * 100000) + index * 50000,
      previous:
        type === "users"
          ? 900 + Math.floor(Math.random() * 400) + index * 90
          : 450000 + Math.floor(Math.random() * 90000) + index * 45000,
    }));
  };

  const chartData = data?.data?.trends || generateSampleData();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis
            stroke="#9CA3AF"
            tickFormatter={(value) =>
              type === "users" ? formatNumber(value) : `₹${value / 1000}K`
            }
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
            formatter={(value) =>
              type === "users" ? formatNumber(value) : formatCurrency(value)
            }
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366F1"
            fillOpacity={1}
            fill="url(#colorValue)"
            name="Current Year"
          />
          <Area
            type="monotone"
            dataKey="previous"
            stroke="#94A3B8"
            fillOpacity={1}
            fill="url(#colorPrevious)"
            name="Previous Year"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Current Year
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Previous Year
            </span>
          </div>
        </div>
        <div className="text-green-600 dark:text-green-400">
          ↑ {type === "users" ? "+15%" : "+18%"} growth
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsChart;
