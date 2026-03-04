import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  TrendingDown,
  TrendingUp,
  Clock,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const CashFlowCard = ({ data }) => {
  const [showAllMonths, setShowAllMonths] = useState(false);
  const displayedMonths = showAllMonths
    ? data.cashFlowMonths
    : data.cashFlowMonths.slice(0, 12);

  const getNetCashFlowColor = (value) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Banknote className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Initial Investment
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data.initialInvestment)}
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Monthly Burn Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(data.monthlyBurnRate)}
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Runway
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.runway} months
          </p>
        </motion.div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Cash Flow
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {displayedMonths.map((month, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Month {month.month}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">In:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(month.inflow)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Out:</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(month.outflow)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`text-sm font-medium ${getNetCashFlowColor(month.netCashFlow)}`}
                  >
                    {month.netCashFlow > 0 ? "+" : ""}
                    {formatCurrency(month.netCashFlow)}
                  </span>
                  <span className="text-sm font-medium text-purple-600">
                    {formatCurrency(month.cumulativeCash)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {data.cashFlowMonths.length > 12 && (
          <button
            onClick={() => setShowAllMonths(!showAllMonths)}
            className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {showAllMonths
              ? "Show Less"
              : `Show All ${data.cashFlowMonths.length} Months`}
          </button>
        )}
      </div>
    </div>
  );
};

export default CashFlowCard;
