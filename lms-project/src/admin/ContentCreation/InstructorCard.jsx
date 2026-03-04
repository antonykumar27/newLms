import React from "react";
import { motion } from "framer-motion";
import { Users, User, Clock, DollarSign, PenTool, Video } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const InstructorCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Full-time Teachers */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Full-time Teachers
          </h3>
        </div>

        <div className="space-y-4">
          {data.fullTimeTeachers?.map((teacher, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {teacher.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {teacher.subject}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(teacher.monthlySalary)}/mo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Benefits: {formatCurrency(teacher.benefits)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Part-time Teachers */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Part-time Teachers
          </h3>
        </div>

        <div className="space-y-4">
          {data.partTimeTeachers?.map((teacher, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {teacher.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {teacher.subject} • {teacher.monthlyHours} hrs/month
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(teacher.monthlyPayment)}/mo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    ₹{teacher.hourlyRate}/hr
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Guest Lecturers */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Guest Lecturers
          </h3>
        </div>

        <div className="space-y-4">
          {data.guestLecturers?.map((guest, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {guest.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {guest.expertise} • {guest.sessionsPerYear} sessions/year
                  </p>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(guest.oneTimeFee)}/session
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Content Writers */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <PenTool className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Content Writers
          </h3>
        </div>

        <div className="space-y-4">
          {data.contentWriters?.map((writer, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {writer.type}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {writer.monthlyWords} words/month
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(writer.monthlyCost)}/mo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    ₹{writer.ratePerWord}/word
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Video Editors */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Video className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Video Editors
          </h3>
        </div>

        <div className="space-y-4">
          {data.videoEditors?.map((editor, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {editor.type}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {editor.videosPerMonth} videos/month
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(editor.monthlyCost)}/mo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    ₹{editor.ratePerVideo}/video
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Totals */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Monthly
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalInstructorMonthly || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Yearly
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalInstructorYearly || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              3 Years
            </p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(data.totalInstructorThreeYear || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCard;
