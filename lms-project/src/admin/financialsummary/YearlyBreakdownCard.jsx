import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const YearlyBreakdownCard = ({ data }) => {
  return (
    <div className="space-y-4">
      {data.map((year, index) => (
        <motion.div
          key={index}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Year {year.year}
            </h3>
            <div className="flex items-center space-x-2">
              <span
                className={`text-sm font-medium ${
                  year.profit > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {year.profit > 0 ? (
                  <ArrowUp className="w-4 h-4 inline mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 inline mr-1" />
                )}
                {((year.profit / year.revenue) * 100).toFixed(1)}% margin
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Revenue
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(year.revenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Costs
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(year.costs)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Profit
              </p>
              <p
                className={`text-xl font-bold ${
                  year.profit > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(year.profit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Cumulative
              </p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(year.cumulativeProfit)}
              </p>
            </div>
          </div>

          {index < data.length - 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  YoY Growth
                </span>
                <span className="font-medium text-green-600">
                  +
                  {(
                    ((data[index + 1].revenue - year.revenue) / year.revenue) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Total 3-Year Profit
          </span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.reduce((sum, year) => sum + year.profit, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default YearlyBreakdownCard;
