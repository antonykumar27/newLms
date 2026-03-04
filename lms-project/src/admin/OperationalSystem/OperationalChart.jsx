import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatters";

const OperationalChart = ({ data }) => {
  // Generate monthly data for the chart
  const generateMonthlyData = () => {
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

    const baseOffice = data.officeSpace.totalMonthly;
    const baseSalary = data.totalSalaryMonthly;
    const baseLegal = data.legalCompliance.totalYearly / 12;
    const baseTech = data.technologyTools.totalMonthly;

    return months.map((month, index) => ({
      month,
      office: baseOffice * (1 + Math.sin(index) * 0.05),
      salary: baseSalary * (1 + Math.cos(index) * 0.03),
      legal: baseLegal * (1 + Math.random() * 0.1),
      tech: baseTech * (1 + Math.sin(index + 2) * 0.04),
    }));
  };

  const chartData = generateMonthlyData();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Monthly Cost Trends
      </h3>

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
            dataKey="office"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Office"
          />
          <Line
            type="monotone"
            dataKey="salary"
            stroke="#10B981"
            strokeWidth={2}
            name="Salaries"
          />
          <Line
            type="monotone"
            dataKey="legal"
            stroke="#8B5CF6"
            strokeWidth={2}
            name="Legal"
          />
          <Line
            type="monotone"
            dataKey="tech"
            stroke="#F59E0B"
            strokeWidth={2}
            name="Technology"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Office</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Salaries</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Legal</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Tech</span>
          </div>
        </div>
        <div className="text-amber-600 dark:text-amber-400">
          Avg. Monthly: {formatCurrency(data.totalOperationalMonthly)}
        </div>
      </div>
    </motion.div>
  );
};

export default OperationalChart;
