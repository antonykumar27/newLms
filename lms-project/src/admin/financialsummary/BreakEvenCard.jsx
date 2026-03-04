import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const BreakEvenCard = ({ data }) => {
  if (!data?.data) return null;

  const { breakEvenPoint, currentStatus, monthlyMetrics, scenarios } =
    data.data;

  return (
    <div className="space-y-6">
      {/* Break Even Point */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Target className="w-6 h-6 mr-2" />
          Break Even Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <Users className="w-5 h-5 mb-2" />
            <p className="text-sm opacity-90">Users Required</p>
            <p className="text-2xl font-bold">
              {breakEvenPoint.usersRequired.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <Calendar className="w-5 h-5 mb-2" />
            <p className="text-sm opacity-90">Months Required</p>
            <p className="text-2xl font-bold">
              {breakEvenPoint.monthsRequired}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <DollarSign className="w-5 h-5 mb-2" />
            <p className="text-sm opacity-90">Revenue Required</p>
            <p className="text-2xl font-bold">
              {formatCurrency(breakEvenPoint.revenueRequired)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Cost
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentStatus.totalCost)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentStatus.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Current Profit
              </span>
              <span
                className={`font-bold ${
                  currentStatus.currentProfit > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(currentStatus.currentProfit)}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Months to Break Even
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {currentStatus.monthsToBreakEven}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Revenue Required
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentStatus.revenueRequired)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Users Required
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {currentStatus.usersRequired.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scenarios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
          <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Optimistic Scenario
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Revenue Increase: {scenarios.optimistic.revenueIncrease}%
          </p>
          <p className="text-lg font-bold text-green-600">
            {scenarios.optimistic.monthsToBreakEven} months to break even
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
          <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2" />
            Pessimistic Scenario
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Revenue Decrease: {scenarios.pessimistic.revenueDecrease}%
          </p>
          <p className="text-lg font-bold text-red-600">
            {scenarios.pessimistic.monthsToBreakEven} months to break even
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BreakEvenCard;
