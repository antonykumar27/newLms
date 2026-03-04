import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Instagram, Facebook, Youtube, Globe } from "lucide-react";

const AddPlatformModal = ({ isOpen, onClose, onSubmit, type }) => {
  const [formData, setFormData] = useState({
    name: "instagram",
    monthlyBudget: 10000,
  });

  const [campaignData, setCampaignData] = useState({
    name: "",
    channel: "social",
    budget: 50000,
    startDate: "",
    endDate: "",
    goals: {
      leads: 100,
      revenue: 500000,
    },
  });

  const platformIcons = {
    instagram: Instagram,
    facebook: Facebook,
    youtube: Youtube,
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === "platform") {
      onSubmit(formData);
    } else {
      onSubmit(campaignData);
    }
  };

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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {type === "platform"
              ? "Add Social Platform"
              : "Create New Campaign"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "platform" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["instagram", "facebook", "youtube"].map((platform) => {
                    const Icon = platformIcons[platform] || Globe;
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, name: platform })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.name === platform
                            ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-pink-300"
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                        <span className="text-xs capitalize">{platform}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Budget (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.monthlyBudget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyBudget: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignData.name}
                  onChange={(e) =>
                    setCampaignData({ ...campaignData, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., Summer Sale 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channel
                </label>
                <select
                  value={campaignData.channel}
                  onChange={(e) =>
                    setCampaignData({
                      ...campaignData,
                      channel: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                >
                  <option value="social">Social Media</option>
                  <option value="search">Search Ads</option>
                  <option value="email">Email Marketing</option>
                  <option value="traditional">Traditional</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={campaignData.startDate}
                    onChange={(e) =>
                      setCampaignData({
                        ...campaignData,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={campaignData.endDate}
                    onChange={(e) =>
                      setCampaignData({
                        ...campaignData,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={campaignData.budget}
                  onChange={(e) =>
                    setCampaignData({
                      ...campaignData,
                      budget: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Leads
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={campaignData.goals.leads}
                    onChange={(e) =>
                      setCampaignData({
                        ...campaignData,
                        goals: {
                          ...campaignData.goals,
                          leads: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Revenue (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={campaignData.goals.revenue}
                    onChange={(e) =>
                      setCampaignData({
                        ...campaignData,
                        goals: {
                          ...campaignData.goals,
                          revenue: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
            >
              {type === "platform" ? "Add Platform" : "Create Campaign"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddPlatformModal;
