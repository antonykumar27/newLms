import React from "react";
import { motion } from "framer-motion";
import { Newspaper, Calendar, MapPin, Award, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const TraditionalMarketingCard = ({ data, isEditing, onInputChange }) => {
  return (
    <div className="space-y-6">
      {/* Print Ads */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Print Ads
            </h3>
          </div>
          {isEditing && (
            <button className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Newspapers */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Newspapers
          </h4>
          <div className="space-y-3">
            {data.printAds?.newspapers?.map((paper, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {paper.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {paper.adsPerYear} ads/year
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={paper.costPerAd}
                        onChange={(e) => {
                          const newPapers = [...data.printAds.newspapers];
                          newPapers[index].costPerAd =
                            parseInt(e.target.value) || 0;
                          onInputChange(
                            "traditionalMarketing",
                            "printAds",
                            "newspapers",
                            newPapers,
                          );
                        }}
                        className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(paper.costPerAd)}/ad
                      </span>
                    )}
                    {isEditing && (
                      <button className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Magazines */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Magazines
          </h4>
          <div className="space-y-3">
            {data.printAds?.magazines?.map((magazine, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {magazine.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {magazine.adsPerYear} ads/year
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(magazine.costPerAd)}/ad
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Brochures */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Design Cost
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.printAds?.brochures?.design || 0}
                onChange={(e) =>
                  onInputChange(
                    "traditionalMarketing",
                    "printAds",
                    "brochures",
                    {
                      ...data.printAds?.brochures,
                      design: parseInt(e.target.value) || 0,
                    },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.printAds?.brochures?.design || 0)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Printing Cost
            </label>
            {isEditing ? (
              <input
                type="number"
                value={data.printAds?.brochures?.printing || 0}
                onChange={(e) =>
                  onInputChange(
                    "traditionalMarketing",
                    "printAds",
                    "brochures",
                    {
                      ...data.printAds?.brochures,
                      printing: parseInt(e.target.value) || 0,
                    },
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.printAds?.brochures?.printing || 0)}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Events & Sponsorships */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Events & Sponsorships
          </h3>
        </div>

        {/* Education Fairs */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Education Fairs
          </h4>
          <div className="space-y-3">
            {data.eventsAndSponsorships?.educationFairs?.map((fair, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {fair.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {fair.perYear} time/year
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(fair.cost)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* College Visits */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            College Visits
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Cost per Visit
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={
                    data.eventsAndSponsorships?.collegeVisits?.costPerVisit || 0
                  }
                  onChange={(e) =>
                    onInputChange(
                      "traditionalMarketing",
                      "eventsAndSponsorships",
                      "collegeVisits",
                      {
                        ...data.eventsAndSponsorships?.collegeVisits,
                        costPerVisit: parseInt(e.target.value) || 0,
                      },
                    )
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    data.eventsAndSponsorships?.collegeVisits?.costPerVisit ||
                      0,
                  )}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Visits per Year
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={
                    data.eventsAndSponsorships?.collegeVisits?.visitsPerYear ||
                    0
                  }
                  onChange={(e) =>
                    onInputChange(
                      "traditionalMarketing",
                      "eventsAndSponsorships",
                      "collegeVisits",
                      {
                        ...data.eventsAndSponsorships?.collegeVisits,
                        visitsPerYear: parseInt(e.target.value) || 0,
                      },
                    )
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {data.eventsAndSponsorships?.collegeVisits?.visitsPerYear ||
                    0}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sponsorships */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sponsorships
          </h4>
          <div className="space-y-3">
            {data.eventsAndSponsorships?.sponsorships?.map((sponsor, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {sponsor.event}
                  </h5>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(sponsor.amount)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Total Traditional Marketing */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Total Traditional Marketing (Yearly)
          </span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(
              data.printAds?.totalYearly +
                data.eventsAndSponsorships?.totalYearly || 0,
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TraditionalMarketingCard;
