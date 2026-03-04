import React from "react";
import { motion } from "framer-motion";
import {
  X,
  Award,
  Mail,
  Phone,
  Globe,
  Calendar,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";

const SponsorDetailsModal = ({ isOpen, onClose, sponsor }) => {
  if (!isOpen || !sponsor) return null;

  const tierColors = {
    platinum: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    gold: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    silver: "text-gray-600 bg-gray-100 dark:bg-gray-700",
    bronze: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  };

  const isActive = new Date(sponsor.endDate) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {sponsor.logo ? (
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className={`p-4 rounded-xl ${tierColors[sponsor.tier]}`}>
                  <Award className="w-8 h-8" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sponsor.name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      tierColors[sponsor.tier]
                    }`}
                  >
                    {sponsor.tier}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                      isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    {isActive ? "Active" : "Expired"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contribution */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contribution Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(sponsor.contributionAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Type
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                  {sponsor.contributionType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Duration
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatDate(sponsor.startDate)} -{" "}
                  {formatDate(sponsor.endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Benefits Provided
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sponsor.benefitsProvided?.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Yearly Sponsorship
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Year 1
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(sponsor.sponsorshipYear1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Year 2
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(sponsor.sponsorshipYear2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Year 3
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(sponsor.sponsorshipYear3)}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {sponsor.contactPerson && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Person
              </h3>
              <div className="space-y-3">
                <p className="flex items-center text-gray-700 dark:text-gray-300">
                  <User className="w-5 h-5 mr-3 text-gray-500" />
                  {sponsor.contactPerson.name}
                </p>
                <p className="flex items-center text-gray-700 dark:text-gray-300">
                  <Mail className="w-5 h-5 mr-3 text-gray-500" />
                  <a
                    href={`mailto:${sponsor.contactPerson.email}`}
                    className="hover:text-purple-600"
                  >
                    {sponsor.contactPerson.email}
                  </a>
                </p>
                <p className="flex items-center text-gray-700 dark:text-gray-300">
                  <Phone className="w-5 h-5 mr-3 text-gray-500" />
                  <a
                    href={`tel:${sponsor.contactPerson.phone}`}
                    className="hover:text-purple-600"
                  >
                    {sponsor.contactPerson.phone}
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Website */}
          {sponsor.website && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Website
              </h3>
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                <Globe className="w-5 h-5 mr-2" />
                {sponsor.website}
              </a>
            </div>
          )}

          {/* Renewal Option */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Renewal Information
            </h3>
            <p className="flex items-center text-gray-700 dark:text-gray-300">
              {sponsor.renewalOption ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Renewal option available
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  No renewal option
                </>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SponsorDetailsModal;
