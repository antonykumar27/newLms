import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const BenchmarkCard = ({ data }) => {
  if (!data) return null;

  const benchmarks = [
    {
      name: "Active Rate",
      value: data.userMetrics?.activeRate?.value || "45%",
      benchmark: data.userMetrics?.activeRate?.benchmark || "40%",
      status: data.userMetrics?.activeRate?.status || "Above",
    },
    {
      name: "Session Duration",
      value: data.userMetrics?.sessionDuration?.value || "25 min",
      benchmark: data.userMetrics?.sessionDuration?.benchmark || "20 min",
      status: data.userMetrics?.sessionDuration?.status || "Above",
    },
    {
      name: "LTV/CAC Ratio",
      value: data.financialMetrics?.ltvCacRatio?.value || "3.2",
      benchmark: data.financialMetrics?.ltvCacRatio?.benchmark || "3.0",
      status: data.financialMetrics?.ltvCacRatio?.status || "Above",
    },
    {
      name: "Churn Rate",
      value: data.financialMetrics?.churnRate?.value || "4.2%",
      benchmark: data.financialMetrics?.churnRate?.benchmark || "5%",
      status: data.financialMetrics?.churnRate?.status || "Good",
    },
    {
      name: "ARPU",
      value: data.financialMetrics?.arpu?.value || "₹520",
      benchmark: data.financialMetrics?.arpu?.benchmark || "₹500",
      status: data.financialMetrics?.arpu?.status || "Above",
    },
    {
      name: "Completion Rate",
      value: data.engagementMetrics?.completionRate?.value || "72%",
      benchmark: data.engagementMetrics?.completionRate?.benchmark || "60%",
      status: data.engagementMetrics?.completionRate?.status || "Above",
    },
  ];

  const getStatusIcon = (status) => {
    if (status === "Above" || status === "Good") {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (status === "Below" || status === "High") {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Minus className="w-4 h-4 text-yellow-600" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Industry Benchmarks Comparison
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {benchmarks.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {item.name}
              </h4>
              {getStatusIcon(item.status)}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Benchmark: {item.benchmark}
                </p>
              </div>
              <div
                className={`text-sm font-medium ${
                  item.status === "Above" || item.status === "Good"
                    ? "text-green-600"
                    : item.status === "Below" || item.status === "High"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                {item.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          <span className="font-semibold">Insight:</span> Your metrics are
          performing above industry benchmarks in most categories. Focus on
          improving churn rate to achieve market leadership.
        </p>
      </div>
    </motion.div>
  );
};

export default BenchmarkCard;
