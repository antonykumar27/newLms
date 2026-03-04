import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const FinancialMetricsCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* MRR */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">MRR</h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.mrr}
              onChange={(e) =>
                onInputChange(
                  "financialMetrics",
                  "mrr",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.mrr)}
            </p>
          )}
        </motion.div>

        {/* ARR */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">ARR</h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.arr}
              onChange={(e) =>
                onInputChange(
                  "financialMetrics",
                  "arr",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.arr)}
            </p>
          )}
        </motion.div>

        {/* ARPU */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              ARPU
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.arpu}
              onChange={(e) =>
                onInputChange(
                  "financialMetrics",
                  "arpu",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.arpu)}
            </p>
          )}
        </motion.div>

        {/* LTV */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">LTV</h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.ltv}
              onChange={(e) =>
                onInputChange(
                  "financialMetrics",
                  "ltv",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.ltv)}
            </p>
          )}
        </motion.div>

        {/* CAC */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">CAC</h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.cac}
              onChange={(e) =>
                onInputChange(
                  "financialMetrics",
                  "cac",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.cac)}
            </p>
          )}
        </motion.div>

        {/* Churn Rate */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Churn Rate
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={data.churnRate}
              onChange={(e) =>
                onInputChange(
                  "financialMetrics",
                  "churnRate",
                  parseFloat(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.churnRate}%
            </p>
          )}
        </motion.div>
      </div>

      {/* Derived Metrics */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              LTV/CAC Ratio
            </p>
            <p
              className={`text-2xl font-bold ${
                data.ltvCacRatio >= 3 ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {data.ltvCacRatio.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Gross Margin
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              72%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Payback Period
            </p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {(data.cac / data.arpu).toFixed(1)} months
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMetricsCard;
