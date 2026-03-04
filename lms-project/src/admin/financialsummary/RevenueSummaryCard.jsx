import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Award,
  Gift,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const RevenueSummaryCard = ({ data }) => {
  const revenueItems = [
    {
      name: "B2C Revenue",
      value: data.b2cRevenue,
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      name: "B2B Revenue",
      value: data.b2bRevenue,
      icon: Building2,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    },
    {
      name: "Other Revenue",
      value: data.otherRevenue,
      icon: Award,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      name: "Sponsorships",
      value: data.sponsorships,
      icon: Gift,
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    },
    {
      name: "Investments",
      value: data.investments,
      icon: Briefcase,
      color: "text-red-600 bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {revenueItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(item.value)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {((item.value / data.grandTotalRevenue) * 100).toFixed(1)}% of
              total
            </p>
          </motion.div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Grand Total Revenue
          </span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.grandTotalRevenue)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueSummaryCard;
