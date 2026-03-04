import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  CreditCard,
  Video,
  Activity,
  DollarSign,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const ThirdPartyCard = ({ data, isEditing, onInputChange }) => {
  const paymentProviders = ["razorpay", "ccavenue"];
  const videoProviders = ["zoom", "agora"];
  const emailProviders = ["sendgrid", "awsSes", "mailchimp"];
  const smsProviders = ["msg91", "twilio", "exotel"];

  const providerNames = {
    razorpay: "Razorpay",
    ccavenue: "CCAvenue",
    zoom: "Zoom",
    agora: "Agora",
    sendgrid: "SendGrid",
    awsSes: "AWS SES",
    mailchimp: "Mailchimp",
    msg91: "MSG91",
    twilio: "Twilio",
    exotel: "Exotel",
  };

  return (
    <div className="space-y-6">
      {/* Email Service */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Email Service
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Provider
            </label>
            {isEditing ? (
              <select
                value={data.emailService.provider}
                onChange={(e) =>
                  onInputChange(
                    "thirdPartyServices",
                    "emailService",
                    "provider",
                    e.target.value,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {emailProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {providerNames[provider] || provider}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {providerNames[data.emailService.provider] ||
                  data.emailService.provider}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Monthly Limit
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.emailService.monthlyLimit}
                onChange={(e) =>
                  onInputChange(
                    "thirdPartyServices",
                    "emailService",
                    "monthlyLimit",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatNumber(data.emailService.monthlyLimit)} emails
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Monthly Cost
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.emailService.monthlyCost)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* SMS Service */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            SMS Service
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Provider
            </label>
            {isEditing ? (
              <select
                value={data.smsService.provider}
                onChange={(e) =>
                  onInputChange(
                    "thirdPartyServices",
                    "smsService",
                    "provider",
                    e.target.value,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                {smsProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {providerNames[provider] || provider}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {providerNames[data.smsService.provider] ||
                  data.smsService.provider}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Monthly Limit
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.smsService.monthlyLimit}
                onChange={(e) =>
                  onInputChange(
                    "thirdPartyServices",
                    "smsService",
                    "monthlyLimit",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatNumber(data.smsService.monthlyLimit)} SMS
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Monthly Cost
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.smsService.monthlyCost)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Payment Gateway */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Payment Gateway
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Provider
            </label>
            {isEditing ? (
              <select
                value={data.paymentGateway.provider}
                onChange={(e) =>
                  onInputChange(
                    "thirdPartyServices",
                    "paymentGateway",
                    "provider",
                    e.target.value,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                {paymentProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {providerNames[provider]}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {providerNames[data.paymentGateway.provider]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Setup Fee
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.paymentGateway.setupFee)}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Monthly Fee
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.paymentGateway.monthlyFee)}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Transaction Fee
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {data.paymentGateway.transactionFee}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Video Conferencing */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Video className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Video Conferencing
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Provider
            </label>
            {isEditing ? (
              <select
                value={data.videoConferencing.provider}
                onChange={(e) =>
                  onInputChange(
                    "thirdPartyServices",
                    "videoConferencing",
                    "provider",
                    e.target.value,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                {videoProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {providerNames[provider]}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {providerNames[data.videoConferencing.provider]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Monthly Minutes
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.videoConferencing.monthlyMinutes}
                onChange={(e) =>
                  onInputChange(
                    "thirdPartyServices",
                    "videoConferencing",
                    "monthlyMinutes",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatNumber(data.videoConferencing.monthlyMinutes)} mins
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Monthly Cost
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.videoConferencing.monthlyCost)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Monitoring */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Monitoring
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sentry
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly Cost
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.monitoring.sentry.monthly)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Events Limit
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(data.monitoring.sentry.events)}/mo
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Datadog
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly Cost
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(data.monitoring.datadog.monthly)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Monthly Monitoring Cost
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                data.monitoring.sentry.monthly +
                  data.monitoring.datadog.monthly,
              )}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThirdPartyCard;
