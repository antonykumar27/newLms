import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const B2CRevenueCard = ({ data, isEditing, onInputChange, selectedYear }) => {
  const getYearValue = (year1, year2, year3) => {
    switch (selectedYear) {
      case "year1":
        return year1;
      case "year2":
        return year2;
      case "year3":
        return year3;
      default:
        return year1 + year2 + year3;
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription Plans Summary */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Subscription Plans
            </h3>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {data.subscriptionPlans.length} Active Plans
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.subscriptionPlans.map((plan, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {plan.name}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    plan.tier === "basic"
                      ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      : plan.tier === "premium"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                  }`}
                >
                  {plan.tier}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Monthly
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(plan.monthlyPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Yearly
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(plan.yearlyPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subscribers
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatNumber(
                      getYearValue(
                        plan.projectedSubscribers.year1,
                        plan.projectedSubscribers.year2,
                        plan.projectedSubscribers.year3,
                      ),
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Revenue
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(
                        getYearValue(
                          plan.projectedRevenue.year1,
                          plan.projectedRevenue.year2,
                          plan.projectedRevenue.year3,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Individual Courses */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Individual Courses
          </h3>
        </div>

        <div className="space-y-3">
          {data.oneTimePurchases.individualCourses.map((course, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {course.courseName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Price: {formatCurrency(course.price)} • Sales:{" "}
                    {formatNumber(
                      getYearValue(
                        course.salesYear1,
                        course.salesYear2,
                        course.salesYear3,
                      ),
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(
                      getYearValue(
                        course.revenueYear1,
                        course.revenueYear2,
                        course.revenueYear3,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Certifications */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Certifications
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Price per Certificate
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                data.oneTimePurchases.certifications.pricePerCert,
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Certificates Sold
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(
                getYearValue(
                  data.oneTimePurchases.certifications.certificatesYear1,
                  data.oneTimePurchases.certifications.certificatesYear2,
                  data.oneTimePurchases.certifications.certificatesYear3,
                ),
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Revenue
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(
                getYearValue(
                  data.oneTimePurchases.certifications.revenueYear1,
                  data.oneTimePurchases.certifications.revenueYear2,
                  data.oneTimePurchases.certifications.revenueYear3,
                ),
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* B2C Totals */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Year 1
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalB2CYear1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Year 2
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalB2CYear2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Year 3
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalB2CYear3)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total 3Y
            </p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(data.totalB2CThreeYear)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2CRevenueCard;
