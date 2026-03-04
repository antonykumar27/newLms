// components/BadgesGrid.jsx
import React from "react";
import { TrophyIcon, FireIcon, StarIcon } from "@heroicons/react/24/solid";

const BadgesGrid = ({ badges = [] }) => {
  const getBadgeIcon = (category) => {
    switch (category) {
      case "streak":
        return FireIcon;
      case "completion":
        return TrophyIcon;
      default:
        return StarIcon;
    }
  };

  const getBadgeColor = (category) => {
    switch (category) {
      case "streak":
        return "text-orange-500";
      case "completion":
        return "text-yellow-500";
      default:
        return "text-purple-500";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Achievements 🏆
      </h3>

      {badges.length === 0 ? (
        <div className="text-center py-8">
          <TrophyIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">
            Complete videos to earn badges!
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            First badge: Complete 10 videos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {badges.map((badge, index) => {
            const Icon = getBadgeIcon(badge.category);
            return (
              <div key={index} className="relative group">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg text-center hover:scale-105 transition-transform">
                  <Icon
                    className={`h-8 w-8 mx-auto ${getBadgeColor(badge.category)}`}
                  />
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    {badge.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {badge.description || badge.name}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Next Badges Preview */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Next Achievable
        </h4>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <FireIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="ml-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                7 Day Streak
              </p>
              <p className="text-xs text-gray-400">2 days left</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgesGrid;
