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
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatters";

const RevenueForecastChart = ({ data }) => {
  // Generate forecast data if not provided
  const generateForecastData = () => {
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
      actual: index < 6 ? 1500000 + Math.random() * 500000 : null,
      forecast: 1500000 + Math.random() * 800000 + index * 100000,
      lowerBound: 1400000 + Math.random() * 400000 + index * 80000,
      upperBound: 1600000 + Math.random() * 600000 + index * 120000,
    }));
  };

  const chartData = data?.data?.monthly || generateForecastData();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Revenue Forecast (24 Months)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 1000}K`}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
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
            dataKey="upperBound"
            stroke="none"
            fill="url(#colorConfidence)"
            name="Confidence Interval"
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stroke="none"
            fill="url(#colorConfidence)"
            name=""
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#6366F1"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            name="Forecast"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Actual Revenue
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Forecast</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2 opacity-30"></div>
            <span className="text-gray-600 dark:text-gray-400">
              95% Confidence
            </span>
          </div>
        </div>
        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
          Projected ARR:{" "}
          {formatCurrency(chartData[chartData.length - 1]?.forecast * 12)}
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueForecastChart;
