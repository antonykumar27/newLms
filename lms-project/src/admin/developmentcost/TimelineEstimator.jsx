import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Target,
  TrendingUp,
  Calculator,
} from "lucide-react";

const TimelineEstimator = ({ onEstimate }) => {
  const [formData, setFormData] = useState({
    totalHours: 2000,
    teamSize: 5,
    workingDaysPerWeek: 5,
    hoursPerDay: 8,
  });

  const [result, setResult] = useState(null);

  const calculateTimeline = () => {
    const totalDays = Math.ceil(
      formData.totalHours / (formData.teamSize * formData.hoursPerDay),
    );
    const totalWeeks = Math.ceil(totalDays / formData.workingDaysPerWeek);
    const totalMonths = Math.ceil(totalWeeks / 4);

    const result = {
      days: totalDays,
      weeks: totalWeeks,
      months: totalMonths,
      perPersonHours: Math.ceil(formData.totalHours / formData.teamSize),
      dailyProgress: formData.teamSize * formData.hoursPerDay,
      weeklyProgress:
        formData.teamSize * formData.hoursPerDay * formData.workingDaysPerWeek,
    };

    setResult(result);
    onEstimate({ ...formData, ...result });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Timeline Estimator
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Hours
          </label>
          <input
            type="number"
            value={formData.totalHours}
            onChange={(e) =>
              setFormData({
                ...formData,
                totalHours: parseInt(e.target.value) || 0,
              })
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Team Size
          </label>
          <input
            type="number"
            value={formData.teamSize}
            onChange={(e) =>
              setFormData({
                ...formData,
                teamSize: parseInt(e.target.value) || 1,
              })
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Days/Week
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={formData.workingDaysPerWeek}
            onChange={(e) =>
              setFormData({
                ...formData,
                workingDaysPerWeek: parseInt(e.target.value) || 5,
              })
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Hours/Day
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={formData.hoursPerDay}
            onChange={(e) =>
              setFormData({
                ...formData,
                hoursPerDay: parseInt(e.target.value) || 8,
              })
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <button
        onClick={calculateTimeline}
        className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 mb-6"
      >
        <Calculator className="w-5 h-5" />
        <span>Calculate Timeline</span>
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6"
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Estimated Timeline
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.days}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Weeks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.weeks}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Months</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {result.months}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-orange-200 dark:border-orange-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Per person:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {result.perPersonHours} hrs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Daily progress:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {result.dailyProgress} hrs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Weekly progress:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {result.weeklyProgress} hrs
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TimelineEstimator;
