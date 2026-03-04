import React from "react";
import { motion } from "framer-motion";
import {
  TestTube,
  Bug,
  Shield,
  Smartphone,
  Laptop,
  Server,
  Zap,
  Lock,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const QATestingCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Manual Testing */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Bug className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Manual Testing
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Functional Testing
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.manualTesting.functional.hours}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "manualTesting",
                    "functional",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.manualTesting.functional.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.manualTesting.functional.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Regression Testing
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.manualTesting.regression.hours}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "manualTesting",
                    "regression",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.manualTesting.regression.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.manualTesting.regression.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              UX Testing
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.manualTesting.uxTesting.hours}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "manualTesting",
                    "uxTesting",
                    "hours",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Hours"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.manualTesting.uxTesting.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.manualTesting.uxTesting.hours} hrs
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Manual Testing Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.manualTesting.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Automated Testing */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Automated Testing
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Jest Setup
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.automatedTesting.jestSetup.hours}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "automatedTesting",
                    "jestSetup",
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
                  {formatCurrency(data.automatedTesting.jestSetup.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.automatedTesting.jestSetup.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Cypress
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.automatedTesting.cypress.hours}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "automatedTesting",
                    "cypress",
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
                  {formatCurrency(data.automatedTesting.cypress.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.automatedTesting.cypress.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Load Testing
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.automatedTesting.loadTesting.hours}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "automatedTesting",
                    "loadTesting",
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
                  {formatCurrency(data.automatedTesting.loadTesting.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.automatedTesting.loadTesting.hours} hrs
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Automated Testing Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.automatedTesting.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Device Testing */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Device Testing
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              iOS Devices
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.deviceTesting.iosDevices.count}
                  onChange={(e) =>
                    onInputChange(
                      "qaTesting",
                      "deviceTesting",
                      "iosDevices",
                      "count",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Count"
                />
                <input
                  type="number"
                  value={data.deviceTesting.iosDevices.rental}
                  onChange={(e) =>
                    onInputChange(
                      "qaTesting",
                      "deviceTesting",
                      "iosDevices",
                      "rental",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Rental"
                />
              </div>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.deviceTesting.iosDevices.rental)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Android Devices
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.deviceTesting.androidDevices.count}
                  onChange={(e) =>
                    onInputChange(
                      "qaTesting",
                      "deviceTesting",
                      "androidDevices",
                      "count",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Count"
                />
                <input
                  type="number"
                  value={data.deviceTesting.androidDevices.rental}
                  onChange={(e) =>
                    onInputChange(
                      "qaTesting",
                      "deviceTesting",
                      "androidDevices",
                      "rental",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Rental"
                />
              </div>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.deviceTesting.androidDevices.rental)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              BrowserStack
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.deviceTesting.browserStack.subscription}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "deviceTesting",
                    "browserStack",
                    "subscription",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                placeholder="Subscription"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.deviceTesting.browserStack.subscription)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Device Testing Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.deviceTesting.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Security Audit */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Security Audit
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Penetration Testing
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.securityAudit.penetrationTesting.cost}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "securityAudit",
                    "penetrationTesting",
                    "cost",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                placeholder="Cost"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.securityAudit.penetrationTesting.cost)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Vulnerability Scan
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.securityAudit.vulnerabilityScan.cost}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "securityAudit",
                    "vulnerabilityScan",
                    "cost",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                placeholder="Cost"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.securityAudit.vulnerabilityScan.cost)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              SSL Setup
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.securityAudit.sslSetup.cost}
                onChange={(e) =>
                  onInputChange(
                    "qaTesting",
                    "securityAudit",
                    "sslSetup",
                    "cost",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                placeholder="Cost"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.securityAudit.sslSetup.cost)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Security Audit Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.securityAudit.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Total QA */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            QA & Testing Total
          </span>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(data.totalQA)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QATestingCard;
