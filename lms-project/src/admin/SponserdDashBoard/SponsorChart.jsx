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

const SponsorChart = ({ data }) => {
  const chartData = [
    {
      name: "Platinum",
      value: data.sponsors
        .filter((s) => s.tier === "platinum")
        .reduce((sum, s) => sum + s.contributionAmount, 0),
    },
    {
      name: "Gold",
      value: data.sponsors
        .filter((s) => s.tier === "gold")
        .reduce((sum, s) => sum + s.contributionAmount, 0),
    },
    {
      name: "Silver",
      value: data.sponsors
        .filter((s) => s.tier === "silver")
        .reduce((sum, s) => sum + s.contributionAmount, 0),
    },
    {
      name: "Bronze",
      value: data.sponsors
        .filter((s) => s.tier === "bronze")
        .reduce((sum, s) => sum + s.contributionAmount, 0),
    },
  ];

  const yearlyData = [
    {
      name: "Year 1",
      platinum: data.sponsors.reduce(
        (sum, s) => sum + (s.sponsorshipYear1 || 0),
        0,
      ),
      gold:
        data.sponsors.reduce((sum, s) => sum + (s.sponsorshipYear1 || 0), 0) *
        0.6,
      silver:
        data.sponsors.reduce((sum, s) => sum + (s.sponsorshipYear1 || 0), 0) *
        0.3,
      bronze:
        data.sponsors.reduce((sum, s) => sum + (s.sponsorshipYear1 || 0), 0) *
        0.1,
    },
    {
      name: "Year 2",
      platinum: data.sponsors.reduce(
        (sum, s) => sum + (s.sponsorshipYear2 || 0),
        0,
      ),
      gold:
        data.sponsors.reduce((sum, s) => sum + (s.sponsorshipYear2 || 0), 0) *
        0.6,
      silver:
        data.sponsors.reduce((sum, s) => sum + (s.sponsorshipYear2 || 0), 0) *
        0.3,
      bronze:
        data.sponsors.reduce((sum, s) => sum + (s.sponsorshipYear2 || 0), 0) *
        0.1,
    },
    {
      name: "Year 3",
      platinum: data.sponsors.reduce(
        (sum, s) => sum + (s.sponsorshipYear3 || 0),
        0,
      ),
      gold:
        data.sponsors.reduce((sum, s) => sum + (s.sponsorshipYear3 || 0), 0) *
        0.6,
      silver:
        data.sponsors.reduce((sum, s) => sum + (s.sponsorshipYear3 || 0), 0) *
        0.3,
      bronze:
        data.sponsors.reduce((sum, s) => sum + (s.sponsorshipYear3 || 0), 0) *
        0.1,
    },
  ];

  const COLORS = {
    platinum: "#8B5CF6",
    gold: "#F59E0B",
    silver: "#6B7280",
    bronze: "#B45309",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Sponsorship by Tier
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={yearlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis
            stroke="#9CA3AF"
            tickFormatter={(value) => `₹${value / 100000}L`}
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
          <Bar dataKey="platinum" stackId="a" fill={COLORS.platinum} />
          <Bar dataKey="gold" stackId="a" fill={COLORS.gold} />
          <Bar dataKey="silver" stackId="a" fill={COLORS.silver} />
          <Bar dataKey="bronze" stackId="a" fill={COLORS.bronze} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((item) => (
          <div key={item.name} className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[item.name.toLowerCase()] }}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.name}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SponsorChart;
