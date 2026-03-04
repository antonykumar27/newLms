import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  Building2,
  Landmark,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const B2BRevenueCard = ({ data, isEditing, onInputChange, selectedYear }) => {
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
      {/* Corporate Training */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Corporate Training
          </h3>
        </div>

        <div className="space-y-3">
          {data.corporateTraining.map((corp, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {corp.companyName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contract: {formatCurrency(corp.contractValue)} •{" "}
                    {corp.contractDuration} months
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(
                      getYearValue(
                        corp.revenueYear1,
                        corp.revenueYear2,
                        corp.revenueYear3,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* College Partnerships */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            College Partnerships
          </h3>
        </div>

        <div className="space-y-3">
          {data.collegePartnerships.map((college, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {college.collegeName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {college.studentsCount} students • {college.revenueShare}%
                    share • ₹{college.annualFees}/student
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(
                      getYearValue(
                        college.revenueYear1,
                        college.revenueYear2,
                        college.revenueYear3,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Government Contracts */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Landmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Government Contracts
          </h3>
        </div>

        <div className="space-y-3">
          {data.governmentContracts.map((gov, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {gov.department}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tender Value: {formatCurrency(gov.tenderValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(
                      getYearValue(
                        gov.revenueYear1,
                        gov.revenueYear2,
                        gov.revenueYear3,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* B2B Totals */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Year 1
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalB2BYear1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Year 2
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalB2BYear2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Year 3
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalB2BYear3)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total 3Y
            </p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(data.totalB2BThreeYear)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BRevenueCard;
