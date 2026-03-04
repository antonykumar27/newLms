// components/AchievementMilestones.jsx
import React from "react";
import { TrophyIcon, FireIcon } from "@heroicons/react/24/solid";

const AchievementMilestones = ({ milestones = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Next Milestones 🎯
      </h3>

      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div key={index} className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                {milestone.type === "streak" ? (
                  <FireIcon className="h-4 w-4 text-orange-500" />
                ) : (
                  <TrophyIcon className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {milestone.type === "streak"
                    ? `${milestone.target} Day Streak`
                    : `Complete ${milestone.target} Pages`}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {milestone.current}/{milestone.target}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ width: `${milestone.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {milestone.target - milestone.current} more to go!
            </p>
          </div>
        ))}

        {milestones.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              You're on a roll! Keep going to unlock milestones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementMilestones;
