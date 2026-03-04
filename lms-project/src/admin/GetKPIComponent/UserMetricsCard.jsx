import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";
import { formatNumber } from "../../utils/formatters";

const UserMetricsCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Registered Users */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Total Users
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.totalRegisteredUsers}
              onChange={(e) =>
                onInputChange(
                  "userMetrics",
                  "totalRegisteredUsers",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.totalRegisteredUsers)}
            </p>
          )}
        </motion.div>

        {/* Monthly Active Users */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Monthly Active
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.activeUsersMonthly}
              onChange={(e) =>
                onInputChange(
                  "userMetrics",
                  "activeUsersMonthly",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.activeUsersMonthly)}
            </p>
          )}
        </motion.div>

        {/* Daily Active Users */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Daily Active
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.activeUsersDaily}
              onChange={(e) =>
                onInputChange(
                  "userMetrics",
                  "activeUsersDaily",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.activeUsersDaily)}
            </p>
          )}
        </motion.div>

        {/* New Users This Month */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <UserPlus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              New Users
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.newUsersThisMonth}
              onChange={(e) =>
                onInputChange(
                  "userMetrics",
                  "newUsersThisMonth",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.newUsersThisMonth)}
            </p>
          )}
        </motion.div>

        {/* Average Session Duration */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Avg Session (min)
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.averageSessionDuration}
              onChange={(e) =>
                onInputChange(
                  "userMetrics",
                  "averageSessionDuration",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.averageSessionDuration} min
            </p>
          )}
        </motion.div>

        {/* Course Completion Rate */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Completion Rate
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              min="0"
              max="100"
              value={data.courseCompletionRate}
              onChange={(e) =>
                onInputChange(
                  "userMetrics",
                  "courseCompletionRate",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.courseCompletionRate}%
            </p>
          )}
        </motion.div>
      </div>

      {/* Derived Metrics */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Stickiness (DAU/MAU)
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {(
                (data.activeUsersDaily / data.activeUsersMonthly) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Conversion Rate
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {(
                (data.newUsersThisMonth / data.totalRegisteredUsers) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Engagement Score
            </p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {((data.averageSessionDuration / 30) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMetricsCard;
