import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  Handshake,
  TrendingUp,
  Plus,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const BusinessDevelopmentCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Sales Team */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Sales Team
            </h3>
          </div>
          {isEditing && (
            <button className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {data.salesTeam?.map((member, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Role
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {member.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Count
                  </p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={member.count}
                      onChange={(e) => {
                        const newTeam = [...data.salesTeam];
                        newTeam[index].count = parseInt(e.target.value) || 0;
                        onInputChange(
                          "businessDevelopment",
                          "salesTeam",
                          newTeam,
                        );
                      }}
                      className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.count}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Salary
                  </p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={member.monthlySalary}
                      onChange={(e) => {
                        const newTeam = [...data.salesTeam];
                        newTeam[index].monthlySalary =
                          parseInt(e.target.value) || 0;
                        newTeam[index].totalCompensation =
                          (parseInt(e.target.value) || 0) + member.commission;
                        onInputChange(
                          "businessDevelopment",
                          "salesTeam",
                          newTeam,
                        );
                      }}
                      className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(member.monthlySalary)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Commission
                  </p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={member.commission}
                      onChange={(e) => {
                        const newTeam = [...data.salesTeam];
                        newTeam[index].commission =
                          parseInt(e.target.value) || 0;
                        newTeam[index].totalCompensation =
                          member.monthlySalary +
                          (parseInt(e.target.value) || 0);
                        onInputChange(
                          "businessDevelopment",
                          "salesTeam",
                          newTeam,
                        );
                      }}
                      className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(member.commission)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(member.totalCompensation)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Partnerships */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Handshake className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Partnerships
          </h3>
        </div>

        {/* College Partnerships */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            College Partnerships
          </h4>
          <div className="space-y-3">
            {data.partnerships?.collegePartnerships?.map((college, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {college.college}
                  </h5>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {college.revenueShare}% revenue share
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Corporate Training */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Corporate Training
          </h4>
          <div className="space-y-3">
            {data.partnerships?.corporateTraining?.map((corp, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {corp.company}
                  </h5>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(corp.contractValue)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Totals */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total BD Monthly
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalBDMonthly || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total BD Yearly
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(data.totalBDYearly || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              % of Total Marketing
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              15%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDevelopmentCard;
