import React from "react";
import { motion } from "framer-motion";
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const CloudHostingCard = ({ data, isEditing, onInputChange, onUpgrade }) => {
  const tierOptions = {
    backend: ["small", "medium", "large"],
    database: ["free", "m10", "m20", "m30"],
    redis: ["free", "small", "medium"],
  };

  const tierPrices = {
    small: 3700,
    medium: 7500,
    large: 15000,
    free: 0,
    m10: 4100,
    m20: 8200,
    m30: 16400,
  };

  const tierSpecs = {
    small: { cpu: 2, ram: 4, storage: 80, bandwidth: 1000 },
    medium: { cpu: 4, ram: 8, storage: 160, bandwidth: 2000 },
    large: { cpu: 8, ram: 16, storage: 320, bandwidth: 5000 },
    free: { storage: 0.5, connections: 100 },
    m10: { storage: 1, connections: 500 },
    m20: { storage: 2, connections: 1000 },
    m30: { storage: 4, connections: 2000 },
  };

  const handleTierChange = (type, tier) => {
    const price = tierPrices[tier] || 0;
    const specs = tierSpecs[tier] || {};

    if (type === "backend") {
      onInputChange("cloudHosting", "backendServers", "tier", tier);
      onInputChange("cloudHosting", "backendServers", "monthly", price);
      onInputChange("cloudHosting", "backendServers", "yearly", price * 12);
      onInputChange("cloudHosting", "backendServers", "threeYear", price * 36);
      onInputChange("cloudHosting", "backendServers", "specs", specs);
    } else if (type === "database") {
      onInputChange("cloudHosting", "databaseServers", "tier", tier);
      onInputChange("cloudHosting", "databaseServers", "monthly", price);
      onInputChange("cloudHosting", "databaseServers", "yearly", price * 12);
      onInputChange("cloudHosting", "databaseServers", "threeYear", price * 36);
      onInputChange("cloudHosting", "databaseServers", "specs", specs);
    } else if (type === "redis") {
      onInputChange("cloudHosting", "redisServers", "tier", tier);
      onInputChange("cloudHosting", "redisServers", "monthly", price);
      onInputChange("cloudHosting", "redisServers", "yearly", price * 12);
      onInputChange("cloudHosting", "redisServers", "threeYear", price * 36);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Backend Servers */}
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Backend Servers
            </h3>
          </div>
          {!isEditing && (
            <button
              onClick={() => onUpgrade("backend")}
              className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Zap className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditing ? (
          <select
            value={data.backendServers.tier}
            onChange={(e) => handleTierChange("backend", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {tierOptions.backend.map((tier) => (
              <option key={tier} value={tier}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} - ₹
                {tierPrices[tier].toLocaleString()}/mo
              </option>
            ))}
          </select>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.backendServers.tier.charAt(0).toUpperCase() +
                  data.backendServers.tier.slice(1)}
              </span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Tier
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">CPU</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.backendServers.specs.cpu} vCPU
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">RAM</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.backendServers.specs.ram} GB
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Storage
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.backendServers.specs.storage} GB SSD
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Bandwidth
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.backendServers.specs.bandwidth} GB
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(data.backendServers.monthly)}
                </span>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Database Servers */}
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Database Servers
            </h3>
          </div>
          {!isEditing && (
            <button
              onClick={() => onUpgrade("database")}
              className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <Zap className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditing ? (
          <select
            value={data.databaseServers.tier}
            onChange={(e) => handleTierChange("database", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          >
            {tierOptions.database.map((tier) => (
              <option key={tier} value={tier}>
                {tier === "free" ? "Free" : tier.toUpperCase()} -{" "}
                {tier === "free"
                  ? "Free"
                  : `₹${tierPrices[tier].toLocaleString()}/mo`}
              </option>
            ))}
          </select>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.databaseServers.tier === "free"
                  ? "Free"
                  : data.databaseServers.tier.toUpperCase()}
              </span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Tier
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Storage
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.databaseServers.specs.storage} GB
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Connections
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.databaseServers.specs.connections}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(data.databaseServers.monthly)}
                </span>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Redis Servers */}
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Redis Cache
            </h3>
          </div>
        </div>

        {isEditing ? (
          <select
            value={data.redisServers.tier}
            onChange={(e) => handleTierChange("redis", e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          >
            {tierOptions.redis.map((tier) => (
              <option key={tier} value={tier}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} -{" "}
                {tier === "free"
                  ? "Free"
                  : `₹${tierPrices[tier].toLocaleString()}/mo`}
              </option>
            ))}
          </select>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.redisServers.tier.charAt(0).toUpperCase() +
                  data.redisServers.tier.slice(1)}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(data.redisServers.monthly)}
                </span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CloudHostingCard;
