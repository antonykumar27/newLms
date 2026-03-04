import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  DollarSign,
  Percent,
} from "lucide-react";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

const ProfitabilityCard = ({ data }) => {
  const metrics = [
    {
      name: "Gross Profit",
      value: data.grossProfit,
      icon: TrendingUp,
      color: "text-green-600",
      format: "currency",
    },
    {
      name: "Gross Margin",
      value: data.grossMargin,
      icon: Percent,
      color: "text-green-600",
      format: "percentage",
    },
    {
      name: "Net Profit",
      value: data.netProfit,
      icon: TrendingUp,
      color: "text-blue-600",
      format: "currency",
    },
    {
      name: "Net Margin",
      value: data.netMargin,
      icon: Percent,
      color: "text-blue-600",
      format: "percentage",
    },
    {
      name: "ROI",
      value: data.roi,
      icon: Target,
      color: "text-purple-600",
      format: "percentage",
    },
    {
      name: "Payback Period",
      value: data.paybackPeriod,
      icon: Clock,
      color: "text-orange-600",
      format: "months",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
              <span className={`text-sm font-medium ${metric.color}`}>
                {metric.name}
              </span>
            </div>
            <p className={`text-2xl font-bold ${metric.color}`}>
              {metric.format === "currency" && formatCurrency(metric.value)}
              {metric.format === "percentage" && `${metric.value}%`}
              {metric.format === "months" && `${metric.value} months`}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Break Even Point
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Users Required
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {data.breakEvenPoint.usersRequired.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Months Required
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {data.breakEvenPoint.monthsRequired}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Revenue Required
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.breakEvenPoint.revenueRequired)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityCard;
