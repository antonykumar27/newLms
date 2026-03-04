import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const ScenarioAnalysisModal = ({ isOpen, onClose, onAnalyze, currentData }) => {
  const [scenarios, setScenarios] = useState([
    {
      name: "Optimistic",
      costChange: -10,
      revenueChange: 20,
    },
    {
      name: "Moderate",
      costChange: 0,
      revenueChange: 10,
    },
    {
      name: "Pessimistic",
      costChange: 15,
      revenueChange: -10,
    },
  ]);

  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await onAnalyze(scenarios);
      setResults(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateScenario = (index, field, value) => {
    const newScenarios = [...scenarios];
    newScenarios[index][field] = value;
    setScenarios(newScenarios);
  };

  const addScenario = () => {
    setScenarios([
      ...scenarios,
      {
        name: `Scenario ${scenarios.length + 1}`,
        costChange: 0,
        revenueChange: 0,
      },
    ]);
  };

  const removeScenario = (index) => {
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Scenario Analysis
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Scenarios Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Define Scenarios
              </h4>
              <button
                onClick={addScenario}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
              >
                + Add Scenario
              </button>
            </div>

            {scenarios.map((scenario, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={scenario.name}
                    onChange={(e) =>
                      updateScenario(index, "name", e.target.value)
                    }
                    className="bg-transparent font-medium text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none"
                  />
                  {index >= 3 && (
                    <button
                      onClick={() => removeScenario(index)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Cost Change (%)
                    </label>
                    <input
                      type="number"
                      value={scenario.costChange}
                      onChange={(e) =>
                        updateScenario(
                          index,
                          "costChange",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Revenue Change (%)
                    </label>
                    <input
                      type="number"
                      value={scenario.revenueChange}
                      onChange={(e) =>
                        updateScenario(
                          index,
                          "revenueChange",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Run Analysis</span>
              </>
            )}
          </button>

          {/* Results */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h4 className="font-medium text-gray-900 dark:text-white">
                Analysis Results
              </h4>

              {results.data.scenarios.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 ${
                    result.name === "Optimistic"
                      ? "bg-green-50 dark:bg-green-900/20"
                      : result.name === "Pessimistic"
                        ? "bg-red-50 dark:bg-red-900/20"
                        : "bg-blue-50 dark:bg-blue-900/20"
                  }`}
                >
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {result.name}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Net Profit
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(result.results.netProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Net Margin
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {result.results.netMargin}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ROI
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {result.results.roi}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Break Even
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {result.results.breakEvenMonths} months
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScenarioAnalysisModal;
