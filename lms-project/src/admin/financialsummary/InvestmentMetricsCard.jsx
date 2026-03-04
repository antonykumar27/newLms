import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Clock,
  Users,
  Target,
  PieChart,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const InvestmentMetricsCard = ({ data }) => {
  if (!data?.data) {
    // Return default/placeholder data if no data provided
    const defaultData = {
      totalInvestment: 42927770,
      totalRevenue: 236267590,
      netProfit: 193339820,
      roi: 450.3,
      paybackPeriod: 8,
      investmentBreakdown: {
        bySource: {
          internal: 22927770,
          external: 20000000,
          sponsorships: 17000000,
        },
        byCategory: {
          development: "13.0%",
          infrastructure: "1.5%",
          content: "2.9%",
          marketing: "10.5%",
          operational: "62.9%",
        },
      },
      returnMetrics: {
        returnOnInvestment: "450.3%",
        returnOnEquity: "450.3%",
        earningsPerYear: "64446606",
        paybackStatus: "Profitable",
      },
    };

    data = { data: defaultData };
  }

  const {
    totalInvestment,
    totalRevenue,
    netProfit,
    roi,
    paybackPeriod,
    investmentBreakdown,
    returnMetrics,
  } = data.data;

  const metrics = [
    {
      name: "Total Investment",
      value: totalInvestment,
      icon: Briefcase,
      color: "text-blue-600",
      format: "currency",
    },
    {
      name: "Total Revenue",
      value: totalRevenue,
      icon: TrendingUp,
      color: "text-green-600",
      format: "currency",
    },
    {
      name: "Net Profit",
      value: netProfit,
      icon: DollarSign,
      color: "text-purple-600",
      format: "currency",
    },
    {
      name: "ROI",
      value: roi,
      icon: Percent,
      color: "text-orange-600",
      format: "percentage",
    },
    {
      name: "Payback Period",
      value: paybackPeriod,
      icon: Clock,
      color: "text-red-600",
      format: "months",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
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

      {/* Investment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Source */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            Investment by Source
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Internal Funding
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(investmentBreakdown.bySource.internal)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (investmentBreakdown.bySource.internal /
                        totalInvestment) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  External Investment
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(investmentBreakdown.bySource.external)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (investmentBreakdown.bySource.external /
                        totalInvestment) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Sponsorships
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(investmentBreakdown.bySource.sponsorships)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (investmentBreakdown.bySource.sponsorships /
                        totalInvestment) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* By Category */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            Investment by Category
          </h3>

          <div className="space-y-3">
            {Object.entries(investmentBreakdown.byCategory).map(
              ([key, value], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {key}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {value}
                  </span>
                </div>
              ),
            )}
          </div>
        </motion.div>
      </div>

      {/* Return Metrics */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Return Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm opacity-90 mb-1">Return on Investment</p>
            <p className="text-2xl font-bold">
              {returnMetrics.returnOnInvestment}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Return on Equity</p>
            <p className="text-2xl font-bold">{returnMetrics.returnOnEquity}</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Earnings per Year</p>
            <p className="text-2xl font-bold">
              {formatCurrency(returnMetrics.earningsPerYear)}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Payback Status</p>
            <p className="text-2xl font-bold flex items-center">
              {returnMetrics.paybackStatus === "Profitable" ? (
                <>
                  <ArrowUp className="w-5 h-5 mr-1" />
                  {returnMetrics.paybackStatus}
                </>
              ) : (
                <>
                  <ArrowDown className="w-5 h-5 mr-1" />
                  {returnMetrics.paybackStatus}
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Investment Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Investment Efficiency
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Revenue Multiple</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(totalRevenue / totalInvestment).toFixed(2)}x
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Profit Multiple</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(netProfit / totalInvestment).toFixed(2)}x
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Annualized Returns
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Year 1</span>
                <span className="font-medium text-green-600">
                  +{((30000000 / totalInvestment) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Year 2</span>
                <span className="font-medium text-green-600">
                  +{((57000000 / totalInvestment) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Year 3</span>
                <span className="font-medium text-green-600">
                  +{((95267590 / totalInvestment) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InvestmentMetricsCard;
