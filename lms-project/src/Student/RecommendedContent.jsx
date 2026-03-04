// components/RecommendedContent.jsx
import React, { useState } from "react";
import {
  SparklesIcon,
  PlayIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  HeartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const RecommendedContent = ({ recommendations = [], onContentClick }) => {
  const [savedItems, setSavedItems] = useState([]);
  const [dismissedItems, setDismissedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
        <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Recommendations Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Keep learning to get personalized recommendations
        </p>
      </div>
    );
  }

  // Filter out dismissed items
  const visibleRecommendations = recommendations.filter(
    (item) => !dismissedItems.includes(item.id),
  );

  // Group by category
  const categories = [
    "all",
    ...new Set(visibleRecommendations.map((item) => item.category)),
  ];

  const filteredRecommendations =
    activeCategory === "all"
      ? visibleRecommendations
      : visibleRecommendations.filter(
          (item) => item.category === activeCategory,
        );

  const handleSave = (itemId, e) => {
    e.stopPropagation();
    setSavedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleDismiss = (itemId, e) => {
    e.stopPropagation();
    setDismissedItems((prev) => [...prev, itemId]);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "video":
        return PlayIcon;
      case "quiz":
        return AcademicCapIcon;
      case "article":
        return BookOpenIcon;
      default:
        return SparklesIcon;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Recommendations
            </h2>
            <p className="text-sm text-gray-500">
              Personalized based on your learning style
            </p>
          </div>
        </div>

        {/* Saved Items Count */}
        {savedItems.length > 0 && (
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm">
            {savedItems.length} saved
          </span>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
              activeCategory === category
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecommendations.map((item) => {
          const CategoryIcon = getCategoryIcon(item.category);
          const isSaved = savedItems.includes(item.id);
          const matchScore =
            item.matchScore || Math.floor(Math.random() * 30 + 70); // Fallback

          return (
            <div
              key={item.id}
              onClick={() => onContentClick?.(item.id)}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
            >
              {/* Thumbnail/Image */}
              <div className="relative h-32 bg-gradient-to-br from-purple-500 to-pink-500">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                {/* Category Icon */}
                <div className="absolute top-2 left-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                  <CategoryIcon className="h-4 w-4 text-white" />
                </div>

                {/* Match Score */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-white">
                  {matchScore}% Match
                </div>

                {/* Difficulty */}
                {item.difficulty && (
                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}
                    >
                      {item.difficulty}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {item.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                  {item.duration && (
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {item.duration}
                    </span>
                  )}
                  {item.lessons && (
                    <span className="flex items-center">
                      <BookOpenIcon className="h-3 w-3 mr-1" />
                      {item.lessons} lessons
                    </span>
                  )}
                  {item.rating && (
                    <span className="flex items-center">
                      <ChartBarIcon className="h-3 w-3 mr-1" />
                      {item.rating}
                    </span>
                  )}
                </div>

                {/* Reason */}
                <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
                  {item.reason || "Recommended for you"}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Start Learning
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleSave(item.id, e)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {isSaved ? (
                        <HeartSolid className="h-4 w-4 text-red-500" />
                      ) : (
                        <HeartIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDismiss(item.id, e)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredRecommendations.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500">No recommendations in this category</p>
        </div>
      )}
    </div>
  );
};

export default RecommendedContent;
