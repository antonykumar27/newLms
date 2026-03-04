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
import { formatCurrency } from "../../utils/formatters";

const CashFlowChart = ({ data, fullWidth = false }) => {
  // Generate sample data if not provided
  const chartData =
    data?.data?.monthlyData ||
    Array.from({ length: 24 }, (_, i) => ({
      month: `M${i + 1}`,
      inflow: 3000000 + i * 500000,
      outflow: 3500000,
      netCashFlow: -500000 + i * 500000,
      cumulative: -42927770 + i * 1000000,
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
        Cash Flow Projection
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 1000000}M`}
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
          <Area
            type="monotone"
            dataKey="inflow"
            stroke="#10B981"
            fill="url(#colorInflow)"
            name="Inflow"
          />
          <Area
            type="monotone"
            dataKey="outflow"
            stroke="#EF4444"
            fill="url(#colorOutflow)"
            name="Outflow"
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={false}
            name="Cumulative"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Inflow
          </p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(chartData.reduce((sum, m) => sum + m.inflow, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Outflow
          </p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(chartData.reduce((sum, m) => sum + m.outflow, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Net Position
          </p>
          <p
            className={`text-lg font-bold ${
              chartData[chartData.length - 1]?.cumulative > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(chartData[chartData.length - 1]?.cumulative)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CashFlowChart;
