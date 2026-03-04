import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, Clock, Target, X, Calculator } from "lucide-react";

const ResourceCalculator = ({ isOpen, onClose, onCalculate }) => {
  const [formData, setFormData] = useState({
    projectScope: "medium",
    timeline: 6,
    frontend: 2,
    backend: 2,
    mobile: 2,
    designer: 1,
    qa: 2,
    projectManager: 1,
    devOps: 0,
  });

  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const monthlyRates = {
    frontend: 60000,
    backend: 65000,
    mobile: 65000,
    designer: 55000,
    qa: 50000,
    projectManager: 80000,
    devOps: 70000,
  };

  const handleScopeChange = (scope) => {
    const scopes = {
      small: {
        frontend: 1,
        backend: 1,
        mobile: 1,
        designer: 1,
        qa: 1,
        projectManager: 0.5,
        devOps: 0,
      },
      medium: {
        frontend: 2,
        backend: 2,
        mobile: 2,
        designer: 1,
        qa: 2,
        projectManager: 1,
        devOps: 0,
      },
      large: {
        frontend: 3,
        backend: 3,
        mobile: 3,
        designer: 2,
        qa: 3,
        projectManager: 1,
        devOps: 1,
      },
    };

    setFormData({ ...formData, ...scopes[scope], projectScope: scope });
  };

  const calculateResources = () => {
    const monthlyCost = Object.entries(formData).reduce((sum, [key, value]) => {
      if (key !== "projectScope" && key !== "timeline" && monthlyRates[key]) {
        return sum + monthlyRates[key] * value;
      }
      return sum;
    }, 0);

    const totalCost = monthlyCost * formData.timeline;
    const teamSize =
      Object.entries(formData).reduce((sum, [key, value]) => {
        if (key !== "projectScope" && key !== "timeline" && key !== "devOps") {
          return sum + value;
        }
        return sum;
      }, 0) + (formData.devOps || 0);

    const result = {
      monthlyCost,
      totalCost,
      teamSize,
      breakdown: Object.entries(formData)
        .filter(([key]) => key !== "projectScope" && key !== "timeline")
        .map(([key, value]) => ({
          role: key,
          count: value,
          monthlyRate: monthlyRates[key] || 0,
          monthlyTotal: (monthlyRates[key] || 0) * value,
        })),
    };

    setResult(result);
    onCalculate(result);
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Resource Calculator
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
          {/* Project Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Scope
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["small", "medium", "large"].map((scope) => (
                <button
                  key={scope}
                  onClick={() => handleScopeChange(scope)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.projectScope === scope
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <span className="block text-sm font-medium capitalize">
                    {scope}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeline (months)
            </label>
            <input
              type="range"
              min="1"
              max="24"
              value={formData.timeline}
              onChange={(e) =>
                setFormData({ ...formData, timeline: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                1 month
              </span>
              <span className="text-sm font-medium text-purple-600">
                {formData.timeline} months
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                24 months
              </span>
            </div>
          </div>

          {/* Resource Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData)
              .filter(([key]) => key !== "projectScope" && key !== "timeline")
              .map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={key === "projectManager" ? "0.5" : "1"}
                    value={value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
          </div>

          <button
            onClick={calculateResources}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Calculator className="w-5 h-5" />
            <span>Calculate Resources</span>
          </button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Cost Estimation
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Team Size
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.teamSize}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monthly Cost
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{(result.monthlyCost / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Cost
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ₹{(result.totalCost / 100000).toFixed(1)}L
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Breakdown
                </h5>
                <div className="space-y-2">
                  {result.breakdown.map((item) => (
                    <div
                      key={item.role}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {item.role} ({item.count})
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{(item.monthlyTotal / 1000).toFixed(0)}K/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResourceCalculator;
