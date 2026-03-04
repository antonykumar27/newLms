// components/WeeklyChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WeeklyChart = ({ data = [] }) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const chartData = days.map((day, index) => ({
    day,
    minutes: data[index] || 0,
    fill:
      data[index] > 60 ? "#22c55e" : data[index] > 30 ? "#eab308" : "#94a3b8",
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Weekly Activity 📊
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span className="text-gray-600 dark:text-gray-400">{">"} 1hr</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
            <span className="text-gray-600 dark:text-gray-400">30-60min</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {"<"} 30min
            </span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "0.5rem",
                color: "#fff",
              }}
              formatter={(value) => [`${value} minutes`, "Watch Time"]}
            />
            <Bar dataKey="minutes" fill="#8884d8" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Bar key={index} dataKey="minutes" fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {calculateTotal(data)}m
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(calculateAverage(data))}m
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Daily Avg</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {calculateActiveDays(data)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Active Days
          </p>
        </div>
      </div>
    </div>
  );
};

const calculateTotal = (data) => data.reduce((a, b) => a + b, 0);
const calculateAverage = (data) =>
  calculateTotal(data) / data.filter((d) => d > 0).length || 0;
const calculateActiveDays = (data) => data.filter((d) => d > 0).length;

export default WeeklyChart;
