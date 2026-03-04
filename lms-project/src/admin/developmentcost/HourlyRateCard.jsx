import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, DollarSign, TrendingUp, Edit, Save, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const HourlyRateCard = ({ data, isEditing, onUpdate }) => {
  const [editingSection, setEditingSection] = useState(null);
  const [rates, setRates] = useState({
    frontend: data.webApp.frontend.reactJs.ratePerHour,
    backend: data.webApp.backend.nodeJs.ratePerHour,
    mobile: data.mobileApp.crossPlatform.reactNative.ratePerHour,
    design: 2000, // Default design rate
    qa: 1800, // Default QA rate
  });

  const handleSave = () => {
    // Update frontend rate
    onUpdate("webApp", "frontend", "reactJs", "ratePerHour", rates.frontend);
    // Update backend rate
    onUpdate("webApp", "backend", "nodeJs", "ratePerHour", rates.backend);
    // Update mobile rate
    onUpdate(
      "mobileApp",
      "crossPlatform",
      "reactNative",
      "ratePerHour",
      rates.mobile,
    );

    setEditingSection(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Hourly Rates
          </h3>
        </div>
        {isEditing && editingSection === null && (
          <button
            onClick={() => setEditingSection("rates")}
            className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>

      {editingSection === "rates" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Frontend (React)
              </label>
              <input
                type="number"
                value={rates.frontend}
                onChange={(e) =>
                  setRates({
                    ...rates,
                    frontend: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Backend (Node.js)
              </label>
              <input
                type="number"
                value={rates.backend}
                onChange={(e) =>
                  setRates({ ...rates, backend: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Mobile (React Native)
              </label>
              <input
                type="number"
                value={rates.mobile}
                onChange={(e) =>
                  setRates({ ...rates, mobile: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Design
              </label>
              <input
                type="number"
                value={rates.design}
                onChange={(e) =>
                  setRates({ ...rates, design: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                QA & Testing
              </label>
              <input
                type="number"
                value={rates.qa}
                onChange={(e) =>
                  setRates({ ...rates, qa: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={() => setEditingSection(null)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Frontend</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{rates.frontend}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Backend</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{rates.backend}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Mobile</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{rates.mobile}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Design</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{rates.design}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">QA</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{rates.qa}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Average Rate
          </span>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            ₹
            {Math.round(
              (rates.frontend +
                rates.backend +
                rates.mobile +
                rates.design +
                rates.qa) /
                5,
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default HourlyRateCard;
