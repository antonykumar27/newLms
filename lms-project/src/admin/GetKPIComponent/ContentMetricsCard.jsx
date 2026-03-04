import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Video,
  TrendingUp,
  Award,
  Star,
  BarChart3,
} from "lucide-react";
import { formatNumber, formatCurrency } from "../../utils/formatters";

const ContentMetricsCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Total Courses
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.totalCourses}
              onChange={(e) =>
                onInputChange(
                  "contentMetrics",
                  "totalCourses",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.totalCourses}
            </p>
          )}
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Video className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Total Hours
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.totalVideoHours}
              onChange={(e) =>
                onInputChange(
                  "contentMetrics",
                  "totalVideoHours",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.totalVideoHours}h
            </p>
          )}
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              New/Month
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={data.newContentPerMonth}
              onChange={(e) =>
                onInputChange(
                  "contentMetrics",
                  "newContentPerMonth",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.newContentPerMonth}h
            </p>
          )}
        </motion.div>
      </div>

      {/* Popular Courses */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Popular Courses
          </h3>
        </div>

        <div className="space-y-3">
          {data.popularCourses?.map((course, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {course.courseName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(course.enrollments)} enrollments
                    </p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(course.revenue)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Category Distribution
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.categoryWise?.map((category, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {category.category}
                </h4>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {category.courses} courses
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Enrollments
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatNumber(category.enrollments)}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (category.enrollments /
                        data.categoryWise.reduce(
                          (sum, c) => sum + c.enrollments,
                          0,
                        )) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ContentMetricsCard;
