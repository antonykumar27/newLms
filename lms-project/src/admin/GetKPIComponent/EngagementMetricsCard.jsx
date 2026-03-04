import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Award,
  GraduationCap,
  MessageCircle,
  TrendingUp,
  Target,
} from "lucide-react";
import { formatNumber } from "../../utils/formatters";

const EngagementMetricsCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Average Watch Time */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Avg Watch Time
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.averageWatchTime}
              onChange={(e) =>
                onInputChange(
                  "engagementMetrics",
                  "averageWatchTime",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.averageWatchTime} min
            </p>
          )}
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Completion Rate
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              min="0"
              max="100"
              value={data.completionRate}
              onChange={(e) =>
                onInputChange(
                  "engagementMetrics",
                  "completionRate",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.completionRate}%
            </p>
          )}
        </motion.div>

        {/* Quiz Pass Rate */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Quiz Pass Rate
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              min="0"
              max="100"
              value={data.quizPassRate}
              onChange={(e) =>
                onInputChange(
                  "engagementMetrics",
                  "quizPassRate",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.quizPassRate}%
            </p>
          )}
        </motion.div>

        {/* Certificates Earned */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Certificates
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.certificateEarned}
              onChange={(e) =>
                onInputChange(
                  "engagementMetrics",
                  "certificateEarned",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.certificateEarned)}
            </p>
          )}
        </motion.div>

        {/* Discussion Posts */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Discussions
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.discussionPosts}
              onChange={(e) =>
                onInputChange(
                  "engagementMetrics",
                  "discussionPosts",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(data.discussionPosts)}
            </p>
          )}
        </motion.div>
      </div>

      {/* Derived Metrics */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Engagement Score
            </p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {(
                ((data.averageWatchTime / 30 +
                  data.completionRate / 100 +
                  data.quizPassRate / 100) /
                  3) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Community Activity
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(data.discussionPosts / 1000).toFixed(2)}K posts
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Certification Rate
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {((data.certificateEarned / 1000) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementMetricsCard;
