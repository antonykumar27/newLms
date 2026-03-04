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

const BudgetProjectionChart = ({ data, fullWidth = false }) => {
  if (!data?.data?.monthlyProjection) return null;

  const chartData = data.data.monthlyProjection.slice(0, 12).map((item) => ({
    month: `M${item.month}`,
    instructor: item.instructorCost,
    production: item.productionCost,
    total: item.total,
    cumulative: item.cumulative / 1000000, // Convert to millions for display
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${
        fullWidth ? "col-span-2" : ""
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Monthly Budget Projection (First 12 Months)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis yAxisId="left" stroke="#9CA3AF" />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value}M`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
            formatter={(value, name) => {
              if (name === "cumulative") return `₹${value}M`;
              return formatCurrency(value);
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="instructor"
            stroke="#8B5CF6"
            strokeWidth={2}
            name="Instructor Cost"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="production"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Production Cost"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total"
            stroke="#10B981"
            strokeWidth={2}
            name="Total Monthly"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke="#F59E0B"
            strokeWidth={2}
            name="Cumulative (₹M)"
          />
        </LineChart>
      </ResponsiveContainer>

      {data.data?.monthlyBreakdown && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monthly Instructor
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.data.monthlyBreakdown.instructorCost)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monthly Production
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.data.monthlyBreakdown.productionCost)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Equipment Amortized
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                data.data.monthlyBreakdown.studioEquipmentAmortized,
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Monthly
            </p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(data.data.monthlyBreakdown.totalMonthly)}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BudgetProjectionChart;
