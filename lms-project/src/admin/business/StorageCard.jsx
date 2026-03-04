import React from "react";
import { motion } from "framer-motion";
import {
  HardDrive,
  Cloud,
  Database,
  Shield,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const StorageCard = ({ data, isEditing, onInputChange }) => {
  const providerOptions = {
    videoStorage: ["awsS3", "cloudinary", "wasabi"],
    cdn: ["cloudflare", "awsCloudfront"],
  };

  const providerNames = {
    awsS3: "AWS S3",
    cloudinary: "Cloudinary",
    wasabi: "Wasabi",
    cloudflare: "Cloudflare",
    awsCloudfront: "AWS CloudFront",
  };

  const handleVideoStorageChange = (field, value) => {
    onInputChange("storageAndCDN", "videoStorage", field, value);

    // Recalculate monthly cost based on storage
    if (field === "monthlyStorage" || field === "provider") {
      const storage =
        field === "monthlyStorage" ? value : data.videoStorage.monthlyStorage;
      const provider =
        field === "provider" ? value : data.videoStorage.provider;

      // Pricing logic based on provider
      let costPerGB = 41; // AWS S3 default ₹41/GB
      if (provider === "cloudinary") costPerGB = 45;
      if (provider === "wasabi") costPerGB = 35;

      const monthlyCost = storage * costPerGB;
      onInputChange(
        "storageAndCDN",
        "videoStorage",
        "monthlyCost",
        monthlyCost,
      );
    }
  };

  const handleCDNChange = (field, value) => {
    onInputChange("storageAndCDN", "cdn", field, value);

    // Recalculate monthly cost based on bandwidth
    if (field === "monthlyBandwidth" || field === "provider") {
      const bandwidth =
        field === "monthlyBandwidth" ? value : data.cdn.monthlyBandwidth;
      const provider = field === "provider" ? value : data.cdn.provider;

      // Pricing logic based on provider
      let costPerGB = 8.5; // Cloudflare free, AWS CloudFront ~₹8.5/GB
      if (provider === "cloudflare") costPerGB = 0;

      const monthlyCost = bandwidth * costPerGB;
      onInputChange("storageAndCDN", "cdn", "monthlyCost", monthlyCost);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Storage */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Video Storage
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Provider
            </label>
            {isEditing ? (
              <select
                value={data.videoStorage.provider}
                onChange={(e) =>
                  handleVideoStorageChange("provider", e.target.value)
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {providerOptions.videoStorage.map((provider) => (
                  <option key={provider} value={provider}>
                    {providerNames[provider]}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {providerNames[data.videoStorage.provider]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Storage (GB)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.videoStorage.monthlyStorage}
                onChange={(e) =>
                  handleVideoStorageChange(
                    "monthlyStorage",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatNumber(data.videoStorage.monthlyStorage)} GB
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Monthly Cost
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.videoStorage.monthlyCost)}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Yearly Cost
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.videoStorage.monthlyCost * 12)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* CDN */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">CDN</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Provider
            </label>
            {isEditing ? (
              <select
                value={data.cdn.provider}
                onChange={(e) => handleCDNChange("provider", e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                {providerOptions.cdn.map((provider) => (
                  <option key={provider} value={provider}>
                    {providerNames[provider]}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {providerNames[data.cdn.provider]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Bandwidth (GB/month)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.cdn.monthlyBandwidth}
                onChange={(e) =>
                  handleCDNChange(
                    "monthlyBandwidth",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatNumber(data.cdn.monthlyBandwidth)} GB
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Monthly Cost
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.cdn.monthlyCost)}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Yearly Cost
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.cdn.monthlyCost * 12)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Backups */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Backups
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Automated Backups
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.backups.automatedBackups.monthly}
                onChange={(e) =>
                  onInputChange(
                    "storageAndCDN",
                    "backups",
                    "automatedBackups",
                    {
                      ...data.backups.automatedBackups,
                      monthly: parseInt(e.target.value) || 0,
                    },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.backups.automatedBackups.monthly)}/mo
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Retention (days)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.backups.automatedBackups.retention}
                onChange={(e) =>
                  onInputChange(
                    "storageAndCDN",
                    "backups",
                    "automatedBackups",
                    {
                      ...data.backups.automatedBackups,
                      retention: parseInt(e.target.value) || 30,
                    },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {data.backups.automatedBackups.retention} days
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Disaster Recovery
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.backups.disasterRecovery.monthly}
                onChange={(e) =>
                  onInputChange(
                    "storageAndCDN",
                    "backups",
                    "disasterRecovery",
                    {
                      ...data.backups.disasterRecovery,
                      monthly: parseInt(e.target.value) || 0,
                    },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.backups.disasterRecovery.monthly)}/mo
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Monthly Backup Cost
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                data.backups.automatedBackups.monthly +
                  data.backups.disasterRecovery.monthly,
              )}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StorageCard;
