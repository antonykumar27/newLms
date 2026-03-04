import React, { useState } from "react";
import { motion } from "framer-motion";
import { Video, Image, Sparkles, Film, Edit, Save, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const ProductionCard = ({
  data,
  isEditing,
  onInputChange,
  onUpdateVideo,
  planId,
}) => {
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoForm, setVideoForm] = useState({
    costPerMinute: data.videoProduction?.costPerMinute || 1000,
    minutesPerMonth: data.videoProduction?.minutesPerMonth || 100,
  });

  const handleVideoSubmit = () => {
    onUpdateVideo(videoForm);
    setEditingVideo(false);
  };

  return (
    <div className="space-y-6">
      {/* Video Production */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Film className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Video Production
            </h3>
          </div>
          {isEditing && !editingVideo && (
            <button
              onClick={() => setEditingVideo(true)}
              className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>

        {editingVideo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Cost per Minute (₹)
                </label>
                <input
                  type="number"
                  value={videoForm.costPerMinute}
                  onChange={(e) =>
                    setVideoForm({
                      ...videoForm,
                      costPerMinute: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Minutes per Month
                </label>
                <input
                  type="number"
                  value={videoForm.minutesPerMonth}
                  onChange={(e) =>
                    setVideoForm({
                      ...videoForm,
                      minutesPerMonth: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleVideoSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setEditingVideo(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Cost per Minute
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.videoProduction?.costPerMinute || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Minutes/Month
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {data.videoProduction?.minutesPerMonth || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Monthly Cost
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.videoProduction?.monthlyCost || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                3 Year Cost
              </p>
              <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                {formatCurrency(data.videoProduction?.threeYearCost || 0)}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Graphic Design */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Image className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Graphic Design
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Cost per Asset
            </p>
            {isEditing ? (
              <input
                type="number"
                value={data.graphicDesign?.costPerAsset || 0}
                onChange={(e) =>
                  onInputChange(
                    "contentProduction",
                    "graphicDesign",
                    "costPerAsset",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.graphicDesign?.costPerAsset || 0)}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Assets per Month
            </p>
            {isEditing ? (
              <input
                type="number"
                value={data.graphicDesign?.assetsPerMonth || 0}
                onChange={(e) =>
                  onInputChange(
                    "contentProduction",
                    "graphicDesign",
                    "assetsPerMonth",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {data.graphicDesign?.assetsPerMonth || 0}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Monthly Cost
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.graphicDesign?.monthlyCost || 0)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Animation */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Animation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Cost per Second
            </p>
            {isEditing ? (
              <input
                type="number"
                value={data.animation?.costPerSecond || 0}
                onChange={(e) =>
                  onInputChange(
                    "contentProduction",
                    "animation",
                    "costPerSecond",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(data.animation?.costPerSecond || 0)}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Seconds per Month
            </p>
            {isEditing ? (
              <input
                type="number"
                value={data.animation?.secondsPerMonth || 0}
                onChange={(e) =>
                  onInputChange(
                    "contentProduction",
                    "animation",
                    "secondsPerMonth",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {data.animation?.secondsPerMonth || 0}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Monthly Cost
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formatCurrency(data.animation?.monthlyCost || 0)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Totals */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Monthly Production
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalProductionMonthly || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total 3 Year Production
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(data.totalProductionThreeYear || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionCard;
