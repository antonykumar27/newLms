import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Share2,
  DollarSign,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Globe,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const DigitalMarketingCard = ({ data, isEditing, onInputChange }) => {
  const platformIcons = {
    instagram: Instagram,
    facebook: Facebook,
    youtube: Youtube,
    twitter: Twitter,
  };

  return (
    <div className="space-y-6">
      {/* SEO */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">SEO</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Keyword Research
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.seo?.keywordResearch?.monthly || 0}
                onChange={(e) =>
                  onInputChange("digitalMarketing", "seo", "keywordResearch", {
                    monthly: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.seo?.keywordResearch?.monthly || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              On-Page Optimization
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.seo?.onPageOptimization?.monthly || 0}
                onChange={(e) =>
                  onInputChange(
                    "digitalMarketing",
                    "seo",
                    "onPageOptimization",
                    { monthly: parseInt(e.target.value) || 0 },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.seo?.onPageOptimization?.monthly || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Link Building
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.seo?.linkBuilding?.monthly || 0}
                onChange={(e) =>
                  onInputChange("digitalMarketing", "seo", "linkBuilding", {
                    monthly: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.seo?.linkBuilding?.monthly || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Content Marketing
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.seo?.contentMarketing?.monthly || 0}
                onChange={(e) =>
                  onInputChange("digitalMarketing", "seo", "contentMarketing", {
                    monthly: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.seo?.contentMarketing?.monthly || 0)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total SEO Monthly
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.seo?.totalMonthly || 0)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Social Media */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Social Media
            </h3>
          </div>
        </div>

        {/* Platforms */}
        <div className="space-y-4 mb-4">
          {data.socialMedia?.platforms?.map((platform, index) => {
            const Icon = platformIcons[platform.name] || Globe;
            return (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {platform.name}
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={platform.monthlyBudget || 0}
                      onChange={(e) => {
                        const newPlatforms = [...data.socialMedia.platforms];
                        newPlatforms[index].monthlyBudget =
                          parseInt(e.target.value) || 0;
                        onInputChange(
                          "digitalMarketing",
                          "socialMedia",
                          "platforms",
                          newPlatforms,
                        );
                      }}
                      className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(platform.monthlyBudget || 0)}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Content Creation
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.socialMedia?.contentCreation?.monthly || 0}
                onChange={(e) =>
                  onInputChange(
                    "digitalMarketing",
                    "socialMedia",
                    "contentCreation",
                    { monthly: parseInt(e.target.value) || 0 },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(
                  data.socialMedia?.contentCreation?.monthly || 0,
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Community Management
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.socialMedia?.communityManagement?.monthly || 0}
                onChange={(e) =>
                  onInputChange(
                    "digitalMarketing",
                    "socialMedia",
                    "communityManagement",
                    { monthly: parseInt(e.target.value) || 0 },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(
                  data.socialMedia?.communityManagement?.monthly || 0,
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Influencer Marketing (Yearly)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.socialMedia?.influencerMarketing?.yearly || 0}
                onChange={(e) =>
                  onInputChange(
                    "digitalMarketing",
                    "socialMedia",
                    "influencerMarketing",
                    { yearly: parseInt(e.target.value) || 0 },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(
                  data.socialMedia?.influencerMarketing?.yearly || 0,
                )}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Social Media Monthly
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.socialMedia?.totalMonthly || 0)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Paid Ads */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Paid Ads
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Google Ads
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.paidAds?.googleAds?.monthly || 0}
                onChange={(e) =>
                  onInputChange("digitalMarketing", "paidAds", "googleAds", {
                    monthly: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.paidAds?.googleAds?.monthly || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Facebook Ads
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.paidAds?.facebookAds?.monthly || 0}
                onChange={(e) =>
                  onInputChange("digitalMarketing", "paidAds", "facebookAds", {
                    monthly: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.paidAds?.facebookAds?.monthly || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Instagram Ads
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.paidAds?.instagramAds?.monthly || 0}
                onChange={(e) =>
                  onInputChange("digitalMarketing", "paidAds", "instagramAds", {
                    monthly: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.paidAds?.instagramAds?.monthly || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              YouTube Ads
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.paidAds?.youtubeAds?.monthly || 0}
                onChange={(e) =>
                  onInputChange("digitalMarketing", "paidAds", "youtubeAds", {
                    monthly: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.paidAds?.youtubeAds?.monthly || 0)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Paid Ads Monthly
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.paidAds?.totalMonthly || 0)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Email Marketing */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Email Marketing
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Platform
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.emailMarketing?.platform?.monthly || 0}
                onChange={(e) =>
                  onInputChange(
                    "digitalMarketing",
                    "emailMarketing",
                    "platform",
                    { monthly: parseInt(e.target.value) || 0 },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.emailMarketing?.platform?.monthly || 0)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Newsletter Creation
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.emailMarketing?.newsletterCreation?.monthly || 0}
                onChange={(e) =>
                  onInputChange(
                    "digitalMarketing",
                    "emailMarketing",
                    "newsletterCreation",
                    { monthly: parseInt(e.target.value) || 0 },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(
                  data.emailMarketing?.newsletterCreation?.monthly || 0,
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Automation (Monthly)
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.emailMarketing?.automation?.monthly || 0}
                onChange={(e) =>
                  onInputChange(
                    "digitalMarketing",
                    "emailMarketing",
                    "automation",
                    {
                      ...data.emailMarketing?.automation,
                      monthly: parseInt(e.target.value) || 0,
                    },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.emailMarketing?.automation?.monthly || 0)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Email Marketing Monthly
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.emailMarketing?.totalMonthly || 0)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Digital Marketing Total */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Digital Monthly
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                (data.seo?.totalMonthly || 0) +
                  (data.socialMedia?.totalMonthly || 0) +
                  (data.paidAds?.totalMonthly || 0) +
                  (data.emailMarketing?.totalMonthly || 0),
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Digital 3 Year
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(
                ((data.seo?.totalMonthly || 0) +
                  (data.socialMedia?.totalMonthly || 0) +
                  (data.paidAds?.totalMonthly || 0) +
                  (data.emailMarketing?.totalMonthly || 0)) *
                  36,
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              % of Total Marketing
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              75%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalMarketingCard;
