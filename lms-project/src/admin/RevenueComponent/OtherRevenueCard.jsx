import React from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, Users, Radio, Calendar } from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const OtherRevenueCard = ({ data, isEditing, onInputChange, selectedYear }) => {
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
      {/* Placement Fees */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Placement Fees
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Per Placement
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.placementFees.perPlacement)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Placements
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(
                getYearValue(
                  data.placementFees.placementsYear1,
                  data.placementFees.placementsYear2,
                  data.placementFees.placementsYear3,
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
                  data.placementFees.revenueYear1,
                  data.placementFees.revenueYear2,
                  data.placementFees.revenueYear3,
                ),
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Advertising */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Advertising
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Platform Ads
            </h4>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Monthly
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(data.advertising.platformAds.monthly)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Yearly</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.advertising.platformAds.monthly * 12)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sponsored Content
            </h4>
            <div className="space-y-2">
              {data.advertising.sponsoredContent.map((sponsor, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {sponsor.sponsor}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {sponsor.duration} months
                      </p>
                    </div>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(sponsor.amount * sponsor.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Other Revenue Totals */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Year 1
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalOtherYear1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Year 2
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalOtherYear2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Year 3
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalOtherYear3)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total 3Y
            </p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(
                data.totalOtherYear1 +
                  data.totalOtherYear2 +
                  data.totalOtherYear3,
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherRevenueCard;
