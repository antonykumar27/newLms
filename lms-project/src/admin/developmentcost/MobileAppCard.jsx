import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Apple,
  Wifi,
  Fingerprint,
  CreditCard,
  DollarSign,
  Wallet,
  Download,
  Bell,
  Shield,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const MobileAppCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Cross Platform */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Cross Platform (React Native)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Development Hours
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.crossPlatform.reactNative.hours}
                  onChange={(e) =>
                    onInputChange(
                      "mobileApp",
                      "crossPlatform",
                      "reactNative",
                      "hours",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Hours"
                />
                <input
                  type="number"
                  value={data.crossPlatform.reactNative.ratePerHour}
                  onChange={(e) =>
                    onInputChange(
                      "mobileApp",
                      "crossPlatform",
                      "reactNative",
                      "ratePerHour",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Rate/hr"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.crossPlatform.reactNative.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.crossPlatform.reactNative.hours} hrs @ ₹
                  {data.crossPlatform.reactNative.ratePerHour}/hr
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Code Sharing Savings
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.crossPlatform.codeSharing.savings}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "crossPlatform",
                    "codeSharing",
                    "savings",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Savings"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-green-600 dark:text-green-400">
                  -{formatCurrency(data.crossPlatform.codeSharing.savings)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Saved by code reuse
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Cross Platform Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.crossPlatform.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* iOS Specific */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Apple className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            iOS Specific
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Swift Helpers
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.ioSpecific.swiftHelpers.hours}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "ioSpecific",
                    "swiftHelpers",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.ioSpecific.swiftHelpers.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.ioSpecific.swiftHelpers.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              App Store Connect
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.ioSpecific.appStoreConnect.setup}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "ioSpecific",
                    "appStoreConnect",
                    "setup",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
                placeholder="Setup Cost"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.ioSpecific.appStoreConnect.setup)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Push Notifications
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.ioSpecific.pushNotifications.hours}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "ioSpecific",
                    "pushNotifications",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.ioSpecific.pushNotifications.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.ioSpecific.pushNotifications.hours} hrs
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              iOS Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.ioSpecific.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Android Specific */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Android Specific
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Kotlin Helpers
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.androidSpecific.kotlinHelpers.hours}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "androidSpecific",
                    "kotlinHelpers",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.androidSpecific.kotlinHelpers.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.androidSpecific.kotlinHelpers.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Google Play Services
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.androidSpecific.googlePlayServices.hours}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "androidSpecific",
                    "googlePlayServices",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.androidSpecific.googlePlayServices.total,
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.androidSpecific.googlePlayServices.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Firebase Integration
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.androidSpecific.firebaseIntegration.hours}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "androidSpecific",
                    "firebaseIntegration",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.androidSpecific.firebaseIntegration.total,
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.androidSpecific.firebaseIntegration.hours} hrs
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Android Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.androidSpecific.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Mobile Features */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Wifi className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Mobile Features
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Offline Access
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.mobileFeatures.offlineAccess.hours}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "mobileFeatures",
                    "offlineAccess",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.mobileFeatures.offlineAccess.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.mobileFeatures.offlineAccess.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Push Notifications
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.mobileFeatures.pushNotifications.hours}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "mobileFeatures",
                    "pushNotifications",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.mobileFeatures.pushNotifications.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.mobileFeatures.pushNotifications.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Biometric Auth
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.mobileFeatures.biometricAuth.hours}
                onChange={(e) =>
                  onInputChange(
                    "mobileApp",
                    "mobileFeatures",
                    "biometricAuth",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.mobileFeatures.biometricAuth.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.mobileFeatures.biometricAuth.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Mobile Payments
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.mobileFeatures.mobilePayments.upi}
                  onChange={(e) =>
                    onInputChange(
                      "mobileApp",
                      "mobileFeatures",
                      "mobilePayments",
                      "upi",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="UPI"
                />
                <input
                  type="number"
                  value={data.mobileFeatures.mobilePayments.wallet}
                  onChange={(e) =>
                    onInputChange(
                      "mobileApp",
                      "mobileFeatures",
                      "mobilePayments",
                      "wallet",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Wallet"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.mobileFeatures.mobilePayments.upi +
                      data.mobileFeatures.mobilePayments.wallet,
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  UPI: {formatCurrency(data.mobileFeatures.mobilePayments.upi)}{" "}
                  • Wallet:{" "}
                  {formatCurrency(data.mobileFeatures.mobilePayments.wallet)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Mobile Features Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.mobileFeatures.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Total Mobile */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Mobile App Total
          </span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(data.totalMobile)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobileAppCard;
