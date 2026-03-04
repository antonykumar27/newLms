import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatters";

const ROIAnalysisChart = ({ data }) => {
  if (!data?.data?.channelBreakdown) return null;

  const chartData = data.data.channelBreakdown.map((channel) => ({
    name: channel.name,
    spend: channel.spend,
    revenue: channel.revenue,
    roi: parseFloat(channel.roi),
  }));

  const COLORS = ["#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        ROI Analysis by Channel
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis
            yAxisId="left"
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 1000}K`}
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
              if (name === "roi") return `${value}%`;
              return formatCurrency(value);
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="spend" fill="#EC4899" name="Spend" />
          <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue" />
          <Bar yAxisId="right" dataKey="roi" fill="#10B981" name="ROI %">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.roi > 100
                    ? "#10B981"
                    : entry.roi > 50
                      ? "#F59E0B"
                      : "#EF4444"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {data.data?.overview && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Spend
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.data.overview.totalSpend)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Revenue
            </p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(data.data.overview.estimatedRevenue)}
            </p>
          </div>
          <div className="text-center col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overall ROI
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.data.overview.roi}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ROIAnalysisChart;
