import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  Building,
  Warehouse,
  Zap,
  Droplet,
  Wifi,
  Wrench,
  Landmark,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const OfficeSpaceCard = ({ data, isEditing, onInputChange }) => {
  const getOfficeIcon = () => {
    switch (data.type) {
      case "rented":
        return <Building className="w-5 h-5" />;
      case "owned":
        return <Home className="w-5 h-5" />;
      case "coworking":
        return <Warehouse className="w-5 h-5" />;
      default:
        return <Building className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Office Type */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          {getOfficeIcon()}
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Office Type
          </h3>
        </div>

        <div>
          {isEditing ? (
            <select
              value={data.type}
              onChange={(e) =>
                onInputChange("officeSpace", "type", e.target.value)
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="rented">Rented</option>
              <option value="owned">Owned</option>
              <option value="coworking">Co-working</option>
            </select>
          ) : (
            <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
              {data.type}
            </p>
          )}
        </div>
      </motion.div>

      {/* Rent & Deposit */}
      {data.type === "rented" && (
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Landmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Rent & Deposit
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Monthly Rent
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={data.monthlyRent || 0}
                  onChange={(e) =>
                    onInputChange(
                      "officeSpace",
                      "monthlyRent",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.monthlyRent || 0)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Security Deposit
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={data.securityDeposit || 0}
                  onChange={(e) =>
                    onInputChange(
                      "officeSpace",
                      "securityDeposit",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.securityDeposit || 0)}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Maintenance */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Wrench className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Maintenance
          </h3>
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Monthly Maintenance
          </label>
          {isEditing ? (
            <input
              type="number"
              value={data.maintenance?.monthly || 0}
              onChange={(e) =>
                onInputChange(
                  "officeSpace",
                  "maintenance",
                  "monthly",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.maintenance?.monthly || 0)}
            </p>
          )}
        </div>
      </motion.div>

      {/* Utilities */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Utilities
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Electricity
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.utilities?.electricity || 0}
                onChange={(e) =>
                  onInputChange(
                    "officeSpace",
                    "utilities",
                    "electricity",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.utilities?.electricity || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Water
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.utilities?.water || 0}
                onChange={(e) =>
                  onInputChange(
                    "officeSpace",
                    "utilities",
                    "water",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.utilities?.water || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Internet
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.utilities?.internet || 0}
                onChange={(e) =>
                  onInputChange(
                    "officeSpace",
                    "utilities",
                    "internet",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.utilities?.internet || 0)}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Totals */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Monthly
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalMonthly)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total 3 Years
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(data.totalThreeYear)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeSpaceCard;
