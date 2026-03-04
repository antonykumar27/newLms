// components/LeaderboardPreview.jsx
import React from "react";
import { UserGroupIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { TrophyIcon } from "@heroicons/react/24/solid";

const LeaderboardPreview = ({ leaderboard }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Class Leaderboard
        </h3>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          View All <ChevronRightIcon className="h-4 w-4 ml-1" />
        </button>
      </div>

      {leaderboard?.class ? (
        <div className="space-y-3">
          {/* User Rank */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                  {leaderboard.class.rank}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Your Rank
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Top {leaderboard.class.percentile}%
                  </p>
                </div>
              </div>
              <TrophyIcon className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          {/* Top Performers */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Top Performers
            </p>
            {leaderboard.class.topPerformers?.map((performer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-600"
                        : index === 1
                          ? "bg-gray-100 text-gray-600"
                          : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {performer.rank}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {performer.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {performer.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No leaderboard data available
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPreview;
