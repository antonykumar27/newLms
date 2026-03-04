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

const RevenueChart = ({ data, selectedYear }) => {
  const getRevenueData = () => {
    if (selectedYear === "year1") {
      return [
        { name: "B2C", value: data.b2cRevenue.totalB2CYear1 },
        { name: "B2B", value: data.b2bRevenue.totalB2BYear1 },
        { name: "Other", value: data.otherRevenue.totalOtherYear1 },
      ];
    } else if (selectedYear === "year2") {
      return [
        { name: "B2C", value: data.b2cRevenue.totalB2CYear2 },
        { name: "B2B", value: data.b2bRevenue.totalB2BYear2 },
        { name: "Other", value: data.otherRevenue.totalOtherYear2 },
      ];
    } else if (selectedYear === "year3") {
      return [
        { name: "B2C", value: data.b2cRevenue.totalB2CYear3 },
        { name: "B2B", value: data.b2bRevenue.totalB2BYear3 },
        { name: "Other", value: data.otherRevenue.totalOtherYear3 },
      ];
    } else {
      return [
        { name: "B2C", value: data.b2cRevenue.totalB2CThreeYear },
        { name: "B2B", value: data.b2bRevenue.totalB2BThreeYear },
        {
          name: "Other",
          value:
            data.otherRevenue.totalOtherYear1 +
            data.otherRevenue.totalOtherYear2 +
            data.otherRevenue.totalOtherYear3,
        },
      ];
    }
  };

  const chartData = getRevenueData();
  const COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B"];

  const yearlyData = [
    {
      name: "Year 1",
      B2C: data.b2cRevenue.totalB2CYear1,
      B2B: data.b2bRevenue.totalB2BYear1,
      Other: data.otherRevenue.totalOtherYear1,
    },
    {
      name: "Year 2",
      B2C: data.b2cRevenue.totalB2CYear2,
      B2B: data.b2bRevenue.totalB2BYear2,
      Other: data.otherRevenue.totalOtherYear2,
    },
    {
      name: "Year 3",
      B2C: data.b2cRevenue.totalB2CYear3,
      B2B: data.b2bRevenue.totalB2BYear3,
      Other: data.otherRevenue.totalOtherYear3,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Revenue Distribution
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={selectedYear === "all" ? yearlyData : chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="name" stroke="#9CA3AF" />
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
          {selectedYear === "all" ? (
            <>
              <Bar dataKey="B2C" stackId="a" fill="#3B82F6" />
              <Bar dataKey="B2B" stackId="a" fill="#8B5CF6" />
              <Bar dataKey="Other" stackId="a" fill="#F59E0B" />
            </>
          ) : (
            <Bar dataKey="value" fill="#3B82F6">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              B2C
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(
              selectedYear === "all"
                ? data.b2cRevenue.totalB2CThreeYear
                : chartData[0]?.value,
            )}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              B2B
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(
              selectedYear === "all"
                ? data.b2bRevenue.totalB2BThreeYear
                : chartData[1]?.value,
            )}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Other
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(
              selectedYear === "all"
                ? data.otherRevenue.totalOtherYear1 +
                    data.otherRevenue.totalOtherYear2 +
                    data.otherRevenue.totalOtherYear3
                : chartData[2]?.value,
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueChart;
