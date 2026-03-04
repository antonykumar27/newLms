import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatters";

const ChannelPerformanceChart = ({ data }) => {
  if (!data?.data) return null;

  // Transform data for radar chart
  const chartData = [
    {
      subject: "SEO",
      effectiveness: 85,
      cost: 45000,
      fullMark: 100,
    },
    {
      subject: "Social Media",
      effectiveness: 75,
      cost: 70000,
      fullMark: 100,
    },
    {
      subject: "Paid Ads",
      effectiveness: 90,
      cost: 110000,
      fullMark: 100,
    },
    {
      subject: "Email",
      effectiveness: 65,
      cost: 20000,
      fullMark: 100,
    },
    {
      subject: "Traditional",
      effectiveness: 55,
      cost: 85000,
      fullMark: 100,
    },
    {
      subject: "BD",
      effectiveness: 80,
      cost: 165000,
      fullMark: 100,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Channel Performance Analysis
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" />
          <Radar
            name="Effectiveness"
            dataKey="effectiveness"
            stroke="#EC4899"
            fill="#EC4899"
            fillOpacity={0.3}
          />
          <Radar
            name="Cost Efficiency"
            dataKey="cost"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            hide
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
            formatter={(value, name) => {
              if (name === "cost") return formatCurrency(value);
              return `${value}%`;
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Key Insights
        </h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Paid Ads showing highest effectiveness (90%)
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Traditional marketing needs optimization (55%)
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Email marketing is most cost-efficient
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default ChannelPerformanceChart;
