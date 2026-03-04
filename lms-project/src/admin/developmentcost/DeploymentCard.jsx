import React from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Apple,
  Globe,
  Lock,
  Server,
  Cloud,
  Settings,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const DeploymentCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* App Store Accounts */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Apple className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            App Store Accounts
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Apple Developer
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.appStoreAccounts.appleDeveloper.yearly}
                  onChange={(e) =>
                    onInputChange(
                      "deployment",
                      "appStoreAccounts",
                      "appleDeveloper",
                      "yearly",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
                  placeholder="Yearly"
                />
                <input
                  type="number"
                  value={data.appStoreAccounts.appleDeveloper.threeYear}
                  onChange={(e) =>
                    onInputChange(
                      "deployment",
                      "appStoreAccounts",
                      "appleDeveloper",
                      "threeYear",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
                  placeholder="3 Year"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.appStoreAccounts.appleDeveloper.threeYear,
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Yearly:{" "}
                  {formatCurrency(data.appStoreAccounts.appleDeveloper.yearly)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Google Play Console
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.appStoreAccounts.googlePlay.oneTime}
                onChange={(e) =>
                  onInputChange(
                    "deployment",
                    "appStoreAccounts",
                    "googlePlay",
                    "oneTime",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500"
                placeholder="One Time"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.appStoreAccounts.googlePlay.oneTime)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              App Store Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.appStoreAccounts.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Domain & SSL */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Domain & SSL
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Domain Name
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.domainAndSSL.domainName.purchase}
                  onChange={(e) =>
                    onInputChange(
                      "deployment",
                      "domainAndSSL",
                      "domainName",
                      "purchase",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Purchase"
                />
                <input
                  type="number"
                  value={data.domainAndSSL.domainName.renewal}
                  onChange={(e) =>
                    onInputChange(
                      "deployment",
                      "domainAndSSL",
                      "domainName",
                      "renewal",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Renewal"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.domainAndSSL.domainName.purchase +
                      data.domainAndSSL.domainName.renewal,
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Purchase:{" "}
                  {formatCurrency(data.domainAndSSL.domainName.purchase)} •
                  Renewal:{" "}
                  {formatCurrency(data.domainAndSSL.domainName.renewal)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              SSL Certificate
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.domainAndSSL.sslCertificate.letzEncrypt}
                  onChange={(e) =>
                    onInputChange(
                      "deployment",
                      "domainAndSSL",
                      "sslCertificate",
                      "letzEncrypt",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Let's Encrypt"
                />
                <input
                  type="number"
                  value={data.domainAndSSL.sslCertificate.premium}
                  onChange={(e) =>
                    onInputChange(
                      "deployment",
                      "domainAndSSL",
                      "sslCertificate",
                      "premium",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Premium"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.domainAndSSL.sslCertificate.letzEncrypt +
                      data.domainAndSSL.sslCertificate.premium,
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Let's Encrypt:{" "}
                  {formatCurrency(data.domainAndSSL.sslCertificate.letzEncrypt)}{" "}
                  • Premium:{" "}
                  {formatCurrency(data.domainAndSSL.sslCertificate.premium)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Domain & SSL Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.domainAndSSL.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Server Setup */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Server className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Server Setup
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Configuration
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.serverSetup.configuration.hours}
                onChange={(e) =>
                  onInputChange(
                    "deployment",
                    "serverSetup",
                    "configuration",
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
                  {formatCurrency(data.serverSetup.configuration.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.serverSetup.configuration.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Load Balancer
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.serverSetup.loadBalancer.setup}
                onChange={(e) =>
                  onInputChange(
                    "deployment",
                    "serverSetup",
                    "loadBalancer",
                    "setup",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Setup"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.serverSetup.loadBalancer.setup)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Auto Scaling
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.serverSetup.autoScaling.setup}
                onChange={(e) =>
                  onInputChange(
                    "deployment",
                    "serverSetup",
                    "autoScaling",
                    "setup",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Setup"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.serverSetup.autoScaling.setup)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Server Setup Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.serverSetup.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Total Deployment */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Deployment Total
          </span>
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(data.totalDeployment)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeploymentCard;
