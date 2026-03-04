// components/AllProgressDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  XCircleIcon,
  FunnelIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useGetUserAllProgressQuery } from "../../store/api/ProgressApi";
import { useGetUserStandardQuery } from "../../store/api/LoginUserApi";
import { formatDistanceToNow } from "date-fns";

const AllProgressDashboard = () => {
  const [filters, setFilters] = useState({
    standardId: "",
    subjectId: "",
    chapterId: "",
    pageId: "",
  });

  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Get user's standard details
  const {
    data: UserStandardDetails,
    isLoading: isLoadingUser,
    error: isError,
  } = useGetUserStandardQuery();

  // Should show: {standardId: '698c6cae3fb7f6f365a27019', standard: 6, subjects: Array(1)}

  // 🔥 Set initial standard when data loads
  useEffect(() => {
    if (UserStandardDetails?.data) {
      const standard = UserStandardDetails.data;
      setSelectedStandard(standard);
      setFilters((prev) => ({
        ...prev,
        standardId: standard.standardId, // Use standardId for API
      }));
    }
  }, [UserStandardDetails]);

  // Get progress data with filters
  const { data, isLoading, error } = useGetUserAllProgressQuery(filters, {
    skip: !filters.standardId,
  });

  // Handle subject change
  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setSelectedChapter(null);
    setFilters((prev) => ({
      ...prev,
      subjectId: subject?.subjectId || "",
      chapterId: "",
      pageId: "",
    }));
  };

  // Handle chapter change
  const handleChapterChange = (chapter) => {
    setSelectedChapter(chapter);
    setFilters((prev) => ({
      ...prev,
      chapterId: chapter?.chapterId || "",
      pageId: "",
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      pageId: page?.pageId || "",
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSubject(null);
    setSelectedChapter(null);
    setFilters({
      standardId: selectedStandard?.standardId || "",
      subjectId: "",
      chapterId: "",
      pageId: "",
    });
  };

  if (isLoadingUser) return <DashboardSkeleton />;
  if (isError) return <DashboardError error={isError} />;

  const progress = data?.data;
  const standardData = UserStandardDetails?.data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Learning Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress across all videos
          </p>
          {/* 🔥 Display current standard */}
          {standardData && (
            <div className="mt-2 inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg">
              <span className="font-medium">Class {standardData.standard}</span>
            </div>
          )}
        </div>

        {/* 🔥 FILTER SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </h2>
            {(selectedSubject || selectedChapter || filters.pageId) && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 🔥 Standard Display (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Standard
              </label>
              <div className="relative">
                <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white">
                  {standardData
                    ? `Class ${standardData.standard}`
                    : "Loading..."}
                </div>
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <div className="relative">
                <select
                  value={filters.subjectId}
                  onChange={(e) => {
                    const subject = selectedStandard?.subjects?.find(
                      (s) => s.subjectId === e.target.value,
                    );
                    handleSubjectChange(subject);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={!selectedStandard}
                >
                  <option value="">All Subjects</option>
                  {selectedStandard?.subjects?.map((subject) => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Chapter Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chapter
              </label>
              <div className="relative">
                <select
                  value={filters.chapterId}
                  onChange={(e) => {
                    const chapter = selectedSubject?.chapters?.find(
                      (c) => c.chapterId === e.target.value,
                    );
                    handleChapterChange(chapter);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={!selectedSubject}
                >
                  <option value="">All Chapters</option>
                  {selectedSubject?.chapters?.map((chapter) => (
                    <option key={chapter.chapterId} value={chapter.chapterId}>
                      Chapter {chapter.chapterNumber}:{" "}
                      {chapter.name || `Chapter ${chapter.chapterNumber}`}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Page Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page
              </label>
              <div className="relative">
                <select
                  value={filters.pageId}
                  onChange={(e) => {
                    const page = selectedChapter?.pages?.find(
                      (p) => p.pageId === e.target.value,
                    );
                    handlePageChange(page);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={!selectedChapter}
                >
                  <option value="">All Pages</option>
                  {selectedChapter?.pages?.map((page) => (
                    <option key={page.pageId} value={page.pageId}>
                      {page.title || `Page ${page.pageNumber || ""}`}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedSubject || selectedChapter || filters.pageId) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active filters:
              </span>
              {selectedSubject && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedSubject.subjectName}
                  <button
                    onClick={() => handleSubjectChange(null)}
                    className="ml-2 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedChapter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Chapter {selectedChapter.chapterNumber}
                  <button
                    onClick={() => handleChapterChange(null)}
                    className="ml-2 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.pageId && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Specific Page
                  <button
                    onClick={() => handlePageChange(null)}
                    className="ml-2 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {!isLoading && progress && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <StatCard
                label="Total Videos"
                value={progress?.total || 0}
                icon={BookOpenIcon}
                color="blue"
              />
              <StatCard
                label="Completed"
                value={progress?.completed?.count || 0}
                icon={CheckCircleIcon}
                color="green"
              />
              <StatCard
                label="In Progress"
                value={progress?.inProgress?.count || 0}
                icon={PlayIcon}
                color="yellow"
              />
              <StatCard
                label="Not Started"
                value={progress?.notStarted?.count || 0}
                icon={XCircleIcon}
                color="gray"
              />
              <StatCard
                label="Total Watch Time"
                value={formatDuration(progress?.totalWatchTime || 0)}
                icon={ClockIcon}
                color="purple"
              />
              <StatCard
                label="Avg Progress"
                value={`${Math.round(progress?.averageProgress || 0)}%`}
                icon={AcademicCapIcon}
                color="indigo"
              />
            </div>

            {/* Sections */}
            <div className="space-y-8">
              <ProgressSection
                title="Continue Watching"
                items={progress?.inProgress?.items}
                emptyMessage="No videos in progress"
                type="in-progress"
              />

              <ProgressSection
                title="Completed"
                items={progress?.completed?.items}
                emptyMessage="No completed videos yet"
                type="completed"
              />

              <ProgressSection
                title="Not Started"
                items={progress?.notStarted?.items}
                emptyMessage="All videos started! Great job!"
                type="not-started"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to format duration
const formatDuration = (seconds) => {
  if (!seconds) return "0 min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-emerald-600",
    yellow: "from-yellow-500 to-orange-500",
    gray: "from-gray-500 to-gray-600",
    purple: "from-purple-500 to-purple-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 bg-gradient-to-r ${colors[color]} rounded-lg shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
};

// Progress Section Component
const ProgressSection = ({ title, items, emptyMessage, type }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayItems = isExpanded ? items : items?.slice(0, 5);

  if (!items?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title} ({items.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayItems.map((item) => (
          <ProgressItem key={item._id} item={item} type={type} />
        ))}
      </div>

      {items.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {isExpanded ? "Show Less" : `Show ${items.length - 5} More`}
        </button>
      )}
    </div>
  );
};

// Progress Item Component
const ProgressItem = ({ item, type }) => {
  const getStatusColor = () => {
    switch (type) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "in-progress":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor()}`}>
              {type === "completed" ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : type === "in-progress" ? (
                <PlayIcon className="h-5 w-5" />
              ) : (
                <XCircleIcon className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.videoId?.title || "Untitled Video"}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{item.subject?.name || "No Subject"}</span>
                <span>•</span>
                <span>{item.chapter?.name || "No Chapter"}</span>
                <span>•</span>
                <span>{item.page?.title || "No Page"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {item.progress > 0 && (
            <div className="w-24">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.progress}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    type === "completed" ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}

          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(item.lastWatchedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Skeleton Component
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="h-20"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Error Component
const DashboardError = ({ error }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Failed to Load Dashboard
        </h3>
        <p className="text-red-600 dark:text-red-400">
          {error?.data?.error || "An unexpected error occurred"}
        </p>
      </div>
    </div>
  </div>
);

export default AllProgressDashboard;
