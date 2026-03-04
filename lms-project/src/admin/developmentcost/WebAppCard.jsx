import React from "react";
import { motion } from "framer-motion";
import { Globe, Code, Database, Plug, DollarSign, Clock } from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const WebAppCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Frontend */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Frontend Development
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              React.js
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.frontend.reactJs.hours}
                  onChange={(e) =>
                    onInputChange(
                      "webApp",
                      "frontend",
                      "reactJs",
                      "hours",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Hours"
                />
                <input
                  type="number"
                  value={data.frontend.reactJs.ratePerHour}
                  onChange={(e) =>
                    onInputChange(
                      "webApp",
                      "frontend",
                      "reactJs",
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
                  {formatCurrency(data.frontend.reactJs.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.frontend.reactJs.hours} hrs @ ₹
                  {data.frontend.reactJs.ratePerHour}/hr
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Redux
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.frontend.reduxStateManagement.hours}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "frontend",
                    "reduxStateManagement",
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
                  {formatCurrency(data.frontend.reduxStateManagement.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.frontend.reduxStateManagement.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Tailwind CSS
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.frontend.tailwindCss.hours}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "frontend",
                    "tailwindCss",
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
                  {formatCurrency(data.frontend.tailwindCss.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.frontend.tailwindCss.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Responsive Design
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.frontend.responsiveDesign.hours}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "frontend",
                    "responsiveDesign",
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
                  {formatCurrency(data.frontend.responsiveDesign.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.frontend.responsiveDesign.hours} hrs
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Frontend Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.frontend.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Backend */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Backend Development
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Node.js
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.backend.nodeJs.hours}
                  onChange={(e) =>
                    onInputChange(
                      "webApp",
                      "backend",
                      "nodeJs",
                      "hours",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Hours"
                />
                <input
                  type="number"
                  value={data.backend.nodeJs.ratePerHour}
                  onChange={(e) =>
                    onInputChange(
                      "webApp",
                      "backend",
                      "nodeJs",
                      "ratePerHour",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  placeholder="Rate/hr"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.backend.nodeJs.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.backend.nodeJs.hours} hrs @ ₹
                  {data.backend.nodeJs.ratePerHour}/hr
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Express.js
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.backend.expressFramework.hours}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "backend",
                    "expressFramework",
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
                  {formatCurrency(data.backend.expressFramework.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.backend.expressFramework.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              API Development
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.backend.apiDevelopment.hours}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "backend",
                    "apiDevelopment",
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
                  {formatCurrency(data.backend.apiDevelopment.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.backend.apiDevelopment.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Database Design
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.backend.databaseDesign.hours}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "backend",
                    "databaseDesign",
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
                  {formatCurrency(data.backend.databaseDesign.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.backend.databaseDesign.hours} hrs
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Authentication
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.backend.authentication.hours}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "backend",
                    "authentication",
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
                  {formatCurrency(data.backend.authentication.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.backend.authentication.hours} hrs
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Backend Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.backend.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Database */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Database
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              MongoDB Atlas
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.database.mongodbAtlas.setup}
                  onChange={(e) =>
                    onInputChange(
                      "webApp",
                      "database",
                      "mongodbAtlas",
                      "setup",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Setup"
                />
                <input
                  type="number"
                  value={data.database.mongodbAtlas.optimization}
                  onChange={(e) =>
                    onInputChange(
                      "webApp",
                      "database",
                      "mongodbAtlas",
                      "optimization",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Optimization"
                />
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.database.mongodbAtlas.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Setup: {formatCurrency(data.database.mongodbAtlas.setup)} •
                  Opt: {formatCurrency(data.database.mongodbAtlas.optimization)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Redis Cache
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.database.redisCache.setup}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "database",
                    "redisCache",
                    "setup",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                placeholder="Setup"
              />
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.database.redisCache.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Setup: {formatCurrency(data.database.redisCache.setup)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Data Migration
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.database.dataMigration.hours}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "database",
                    "dataMigration",
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
                  {formatCurrency(data.database.dataMigration.total)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {data.database.dataMigration.hours} hrs
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Database Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.database.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Third Party */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Plug className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Third Party Integrations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Payment Gateway
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={data.thirdParty.paymentGateway.setup}
                  onChange={(e) =>
                    onInputChange(
                      "webApp",
                      "thirdParty",
                      "paymentGateway",
                      "setup",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  placeholder="Setup"
                />
                <input
                  type="number"
                  value={data.thirdParty.paymentGateway.integration}
                  onChange={(e) =>
                    onInputChange(
                      "webApp",
                      "thirdParty",
                      "paymentGateway",
                      "integration",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  placeholder="Integration"
                />
              </div>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(
                  data.thirdParty.paymentGateway.setup +
                    data.thirdParty.paymentGateway.integration,
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Email Service
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.thirdParty.emailService.setup}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "thirdParty",
                    "emailService",
                    "setup",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                placeholder="Setup"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.thirdParty.emailService.setup)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              SMS Service
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.thirdParty.smsService.setup}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "thirdParty",
                    "smsService",
                    "setup",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                placeholder="Setup"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.thirdParty.smsService.setup)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Video Conferencing
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.thirdParty.videoConferencing.setup}
                onChange={(e) =>
                  onInputChange(
                    "webApp",
                    "thirdParty",
                    "videoConferencing",
                    "setup",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                placeholder="Setup"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.thirdParty.videoConferencing.setup)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Third Party Subtotal
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.thirdParty.subTotal)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Web App Total
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(data.totalWeb)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WebAppCard;
