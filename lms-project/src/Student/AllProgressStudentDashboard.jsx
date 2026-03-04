// components/AllProgressStudentDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  // Core Icons
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  XCircleIcon,
  FunnelIcon,
  ChevronDownIcon,
  SparklesIcon,
  FireIcon,
  CalendarIcon,
  TrophyIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PuzzlePieceIcon,

  // Additional Icons
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ShareIcon,
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  Square3Stack3DIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  Bars3Icon,
  HeartIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

import { useGetUserStandardQuery } from "../store/api/LoginUserApi";
import {
  formatDistanceToNow,
  format,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import { useGetUserAllProgressQuery } from "../store/api/ProgressApi";

// Import all custom components
import StreakCard from "./StreakCard";
import WeeklyChart from "./WeeklyChart";
import BadgesGrid from "./BadgesGrid";
import SmartInsights from "./SmartInsights";
import ActivityHeatmap from "./ActivityHeatmap";
import SubjectProgressCard from "./SubjectProgressCard";
import RecentActivityFeed from "./RecentActivityFeed";
import AchievementMilestones from "./AchievementMilestones";
import QuickStats from "./QuickStats";
import LeaderboardPreview from "./LeaderboardPreview";
import VideoProgressList from "./VideoProgressList";
import QuizPerformance from "./QuizPerformance";
import LearningPath from "./LearningPath";
import StudyReminder from "./StudyReminder";
import RecommendedContent from "./RecommendedContent";

const AllProgressStudentDashboard = () => {
  // ==================== ALL STATE VARIABLES ====================

  // Complete filter state matching backend query parameters
  const [filters, setFilters] = useState({
    // Standard filters
    standardId: "",
    subjectId: "",
    chapterId: "",
    pageId: "",

    // Content filters
    search: "",
    contentType: "",
    completionStatus: "",

    // Date filters
    fromDate: "",
    toDate: "",

    // Pagination
    limit: 20,
    page: 1,

    // Sorting
    sortBy: "lastAccessed",
    sortOrder: "desc",

    // Response sections
    include:
      "overall,streak,watchtime,quiz,content,engagement,achievements,leaderboard,heatmap,activity,analytics,recommendations,learningpath",

    // View type
    view: "comprehensive",

    // Year for heatmap
    heatmapYear: new Date().getFullYear(),
  });

  // UI State
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("week");
  const [expandedSections, setExpandedSections] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [selectedView, setSelectedView] = useState("grid");

  // ==================== DATA FETCHING ====================

  // Get user's standard details
  const {
    data: UserStandardDetails,
    isLoading: isLoadingUser,
    error: isError,
    refetch: refetchUser,
  } = useGetUserStandardQuery();

  // Get master dashboard data with all query parameters
  const {
    data: dashboardData,
    isLoading,
    refetch,
    error: dashboardError,
    isFetching,
  } = useGetUserAllProgressQuery(filters, {
    skip: !UserStandardDetails?.data?.standardId,
  });

  // ==================== SIDE EFFECTS ====================

  // Set initial standard when data loads
  useEffect(() => {
    if (UserStandardDetails?.data) {
      const standard = UserStandardDetails.data;
      setSelectedStandard(standard);
      setFilters((prev) => ({
        ...prev,
        standardId: standard.standardId,
      }));
    }
  }, [UserStandardDetails]);

  // Update date range based on selected time range
  useEffect(() => {
    const today = new Date();
    let fromDate = "";

    switch (selectedTimeRange) {
      case "today":
        fromDate = format(today, "yyyy-MM-dd");
        break;
      case "week":
        fromDate = format(subWeeks(today, 1), "yyyy-MM-dd");
        break;
      case "month":
        fromDate = format(subMonths(today, 1), "yyyy-MM-dd");
        break;
      case "quarter":
        fromDate = format(subMonths(today, 3), "yyyy-MM-dd");
        break;
      case "year":
        fromDate = format(subYears(today, 1), "yyyy-MM-dd");
        break;
      default:
        fromDate = "";
    }

    setFilters((prev) => ({
      ...prev,
      fromDate: fromDate,
      toDate: format(today, "yyyy-MM-dd"),
    }));
  }, [selectedTimeRange]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ==================== HANDLER FUNCTIONS ====================

  // Subject change handler
  const handleSubjectChange = useCallback((subject) => {
    setSelectedSubject(subject);
    setSelectedChapter(null);
    setFilters((prev) => ({
      ...prev,
      subjectId: subject?.subjectId || "",
      chapterId: "",
      pageId: "",
      page: 1,
    }));
  }, []);

  // Chapter change handler
  const handleChapterChange = useCallback((chapter) => {
    setSelectedChapter(chapter);
    setFilters((prev) => ({
      ...prev,
      chapterId: chapter?.chapterId || "",
      pageId: "",
      page: 1,
    }));
  }, []);

  // Page change handler
  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({
      ...prev,
      pageId: page?.pageId || "",
      page: 1,
    }));
  }, []);

  // Search handlers
  const handleSearch = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setFilters((prev) => ({
      ...prev,
      search: "",
      page: 1,
    }));
  }, []);

  // Filter change handlers
  const handleContentTypeChange = useCallback((e) => {
    setFilters((prev) => ({
      ...prev,
      contentType: e.target.value,
      page: 1,
    }));
  }, []);

  const handleCompletionStatusChange = useCallback((e) => {
    setFilters((prev) => ({
      ...prev,
      completionStatus: e.target.value,
      page: 1,
    }));
  }, []);

  // Sort handler
  const handleSortChange = useCallback((e) => {
    const [sortBy, sortOrder] = e.target.value.split(",");
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1,
    }));
  }, []);

  // Limit handler
  const handleLimitChange = useCallback((e) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(e.target.value),
      page: 1,
    }));
  }, []);

  // Page navigation handlers
  const handleNextPage = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, []);

  const handlePrevPage = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }));
  }, []);

  const handleGoToPage = useCallback((pageNum) => {
    setFilters((prev) => ({
      ...prev,
      page: pageNum,
    }));
  }, []);

  // View handler
  const handleViewChange = useCallback((e) => {
    setFilters((prev) => ({
      ...prev,
      view: e.target.value,
    }));
  }, []);

  // Include sections handler
  const handleIncludeSection = useCallback((section) => {
    setFilters((prev) => {
      const includes = prev.include.split(",");
      if (includes.includes(section)) {
        return {
          ...prev,
          include: includes.filter((s) => s !== section).join(","),
        };
      } else {
        return {
          ...prev,
          include: [...includes, section].join(","),
        };
      }
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSearchInput("");
    setFilters({
      standardId: selectedStandard?.standardId || "",
      subjectId: "",
      chapterId: "",
      pageId: "",
      search: "",
      contentType: "",
      completionStatus: "",
      fromDate: "",
      toDate: "",
      limit: 20,
      page: 1,
      sortBy: "lastAccessed",
      sortOrder: "desc",
      include:
        "overall,streak,watchtime,quiz,content,engagement,achievements,leaderboard,heatmap,activity,analytics,recommendations,learningpath",
      view: "comprehensive",
      heatmapYear: new Date().getFullYear(),
    });
    setSelectedTimeRange("week");
  }, [selectedStandard]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode);
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  }, []);

  // Toggle section expansion
  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Bookmark handlers
  const toggleBookmark = useCallback((itemId, itemType) => {
    setBookmarkedItems((prev) => {
      const key = `${itemType}_${itemId}`;
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  }, []);

  // Export data
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `learning-progress-${format(new Date(), "yyyy-MM-dd")}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [dashboardData]);

  // ==================== COMPUTED PROPERTIES ====================

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.subjectId) count++;
    if (filters.chapterId) count++;
    if (filters.search) count++;
    if (filters.contentType) count++;
    if (filters.completionStatus) count++;
    if (filters.fromDate || filters.toDate) count++;
    return count;
  }, [filters]);

  // Get current user
  const currentUser = useMemo(() => {
    return dashboardData?.user || UserStandardDetails?.data || {};
  }, [dashboardData, UserStandardDetails]);

  // Get standard data
  const standardData = useMemo(() => {
    return UserStandardDetails?.data || {};
  }, [UserStandardDetails]);

  // Get dashboard data with proper structure
  const data = useMemo(() => {
    return dashboardData?.data || {};
  }, [dashboardData]);

  // Get pagination info
  const pagination = useMemo(() => {
    return (
      data.pagination || {
        currentPage: filters.page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: filters.limit,
        hasNextPage: false,
        hasPrevPage: false,
      }
    );
  }, [data.pagination, filters.page, filters.limit]);

  // ==================== RENDER LOGIC ====================

  if (isLoadingUser || isLoading)
    return <DashboardSkeleton darkMode={darkMode} />;

  if (isError || dashboardError)
    return (
      <DashboardError
        error={isError || dashboardError}
        onRetry={() => {
          refetchUser();
          refetch();
        }}
        darkMode={darkMode}
      />
    );

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* ========== MOBILE HEADER ========== */}
        <MobileHeader
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          showMobileSearch={showMobileSearch}
          setShowMobileSearch={setShowMobileSearch}
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          searchInput={searchInput}
          onSearch={handleSearch}
          onClearSearch={clearSearch}
          activeFilterCount={activeFilterCount}
          standardData={standardData}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        {/* ========== MOBILE MENU ========== */}
        {showMobileMenu && (
          <MobileMenu
            onClose={() => setShowMobileMenu(false)}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            user={currentUser}
            onExport={exportData}
            onLogout={() => console.log("Logout")}
          />
        )}

        {/* ========== MOBILE SEARCH ========== */}
        {showMobileSearch && (
          <MobileSearch
            searchInput={searchInput}
            onSearch={handleSearch}
            onClear={clearSearch}
            onClose={() => setShowMobileSearch(false)}
            darkMode={darkMode}
          />
        )}

        {/* ========== MOBILE FILTERS ========== */}
        {showMobileFilters && (
          <MobileFilters
            filters={filters}
            selectedStandard={selectedStandard}
            selectedSubject={selectedSubject}
            selectedChapter={selectedChapter}
            onSubjectChange={handleSubjectChange}
            onChapterChange={handleChapterChange}
            onPageChange={handlePageChange}
            onContentTypeChange={handleContentTypeChange}
            onCompletionStatusChange={handleCompletionStatusChange}
            onSortChange={handleSortChange}
            onLimitChange={handleLimitChange}
            onViewChange={handleViewChange}
            onClear={clearFilters}
            activeFilterCount={activeFilterCount}
            selectedTimeRange={selectedTimeRange}
            setSelectedTimeRange={setSelectedTimeRange}
            onClose={() => setShowMobileFilters(false)}
            darkMode={darkMode}
          />
        )}

        {/* ========== MAIN CONTENT ========== */}
        <div className="flex-1 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
            {/* ========== DESKTOP HEADER ========== */}
            <DesktopHeader
              user={currentUser}
              standardData={standardData}
              timestamp={data?.timestamp}
              onRefresh={refetch}
              isFetching={isFetching}
              onExport={exportData}
              notifications={notifications}
              setShowNotifications={setShowNotifications}
              showNotifications={showNotifications}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />

            {/* ========== DESKTOP FILTERS ========== */}
            <DesktopFilters
              filters={filters}
              selectedStandard={selectedStandard}
              selectedSubject={selectedSubject}
              selectedChapter={selectedChapter}
              onSubjectChange={handleSubjectChange}
              onChapterChange={handleChapterChange}
              onPageChange={handlePageChange}
              searchInput={searchInput}
              onSearch={handleSearch}
              onClearSearch={clearSearch}
              onContentTypeChange={handleContentTypeChange}
              onCompletionStatusChange={handleCompletionStatusChange}
              onSortChange={handleSortChange}
              onLimitChange={handleLimitChange}
              onViewChange={handleViewChange}
              onClear={clearFilters}
              activeFilterCount={activeFilterCount}
              selectedTimeRange={selectedTimeRange}
              setSelectedTimeRange={setSelectedTimeRange}
              onIncludeSection={handleIncludeSection}
              currentInclude={filters.include}
              darkMode={darkMode}
            />

            {/* ========== ACTIVE FILTER TAGS ========== */}
            <ActiveFilterTags
              filters={filters}
              selectedSubject={selectedSubject}
              selectedChapter={selectedChapter}
              onRemoveSubject={() => handleSubjectChange(null)}
              onRemoveChapter={() => handleChapterChange(null)}
              onRemoveContentType={() =>
                setFilters((prev) => ({ ...prev, contentType: "" }))
              }
              onRemoveStatus={() =>
                setFilters((prev) => ({ ...prev, completionStatus: "" }))
              }
              onRemoveSearch={clearSearch}
              darkMode={darkMode}
            />

            {/* ========== STREAK CARD ========== */}
            <div className="mb-6">
              <StreakCard
                streak={data?.streak?.current || 0}
                longest={data?.streak?.longest || 0}
                lastActive={data?.streak?.lastActiveDate}
                nextMilestone={data?.streak?.nextMilestone}
                daysToNext={data?.streak?.daysToNextMilestone}
                darkMode={darkMode}
              />
            </div>

            {/* ========== QUICK STATS ========== */}
            <QuickStats
              overall={data?.overall}
              className="mb-8"
              view={selectedView}
              onViewChange={setSelectedView}
              darkMode={darkMode}
            />

            {/* ========== TAB NAVIGATION ========== */}
            <TabNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              darkMode={darkMode}
              tabs={[
                { id: "overview", label: "Overview", icon: HomeIcon },
                { id: "content", label: "Content", icon: Square3Stack3DIcon },
                { id: "videos", label: "Videos", icon: VideoCameraIcon },
                { id: "quiz", label: "Quizzes", icon: PuzzlePieceIcon },
                { id: "analytics", label: "Analytics", icon: ChartBarIcon },
                {
                  id: "achievements",
                  label: "Achievements",
                  icon: TrophyIcon,
                },
                {
                  id: "learningpath",
                  label: "Learning Path",
                  icon: ArrowTrendingUpIcon,
                },
                {
                  id: "recommendations",
                  label: "For You",
                  icon: SparklesIcon,
                },
              ]}
            />

            {/* ========== PAGINATION CONTROLS ========== */}
            <PaginationControls
              pagination={pagination}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              onGoToPage={handleGoToPage}
              onLimitChange={handleLimitChange}
              currentLimit={filters.limit}
              darkMode={darkMode}
            />

            {/* ========== TAB CONTENT ========== */}
            <div className="mt-6">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <OverviewTab
                  data={data}
                  onViewAll={(section) => setActiveTab(section)}
                  onVideoClick={(videoId) =>
                    window.open(`/video/${videoId}`, "_blank")
                  }
                  bookmarkedItems={bookmarkedItems}
                  onToggleBookmark={toggleBookmark}
                  darkMode={darkMode}
                />
              )}

              {/* CONTENT TAB */}
              {activeTab === "content" && (
                <ContentTab
                  content={data?.content}
                  onChapterClick={(chapterId) => {
                    setFilters((prev) => ({ ...prev, chapterId }));
                    setActiveTab("videos");
                  }}
                  expandedSections={expandedSections}
                  onToggleSection={toggleSection}
                  darkMode={darkMode}
                />
              )}

              {/* VIDEOS TAB */}
              {activeTab === "videos" && (
                <VideosTab
                  watchTime={data?.watchTime}
                  filters={filters}
                  onVideoClick={(videoId) =>
                    window.open(`/video/${videoId}`, "_blank")
                  }
                  onBookmark={toggleBookmark}
                  bookmarkedItems={bookmarkedItems}
                  view={selectedView}
                  darkMode={darkMode}
                />
              )}

              {/* QUIZ TAB */}
              {activeTab === "quiz" && (
                <QuizTab
                  quiz={data?.quiz}
                  onQuizClick={(quizId) =>
                    window.open(`/quiz/${quizId}`, "_blank")
                  }
                  darkMode={darkMode}
                />
              )}

              {/* ANALYTICS TAB */}
              {activeTab === "analytics" && (
                <AnalyticsTab
                  data={data}
                  showHeatmap={showHeatmap}
                  setShowHeatmap={setShowHeatmap}
                  selectedTimeRange={selectedTimeRange}
                  setSelectedTimeRange={setSelectedTimeRange}
                  darkMode={darkMode}
                />
              )}

              {/* ACHIEVEMENTS TAB */}
              {activeTab === "achievements" && (
                <AchievementsTab
                  achievements={data?.achievements}
                  streak={data?.streak}
                  badges={data?.achievements?.badges}
                  leaderboard={data?.leaderboard}
                  darkMode={darkMode}
                />
              )}

              {/* LEARNING PATH TAB */}
              {activeTab === "learningpath" && (
                <LearningPath
                  data={data?.learningpath}
                  onNodeClick={(nodeId) => console.log("Navigate to:", nodeId)}
                  darkMode={darkMode}
                />
              )}

              {/* RECOMMENDATIONS TAB */}
              {activeTab === "recommendations" && (
                <RecommendedContent
                  recommendations={data?.recommendations}
                  onContentClick={(contentId) =>
                    window.open(`/content/${contentId}`, "_blank")
                  }
                  darkMode={darkMode}
                />
              )}
            </div>
          </div>
        </div>

        {/* ========== STUDY REMINDER ========== */}
        <StudyReminder
          streak={data?.streak?.current || 0}
          lastActive={data?.streak?.lastActiveDate}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

// ==================== DASHBOARD SKELETON ====================

const DashboardSkeleton = ({ darkMode }) => (
  <div className={darkMode ? "dark" : ""}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Streak Card Skeleton */}
        <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl mb-6 animate-pulse"></div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white dark:bg-gray-800 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex space-x-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-white dark:bg-gray-800 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ==================== DASHBOARD ERROR ====================

const DashboardError = ({ error, onRetry, darkMode }) => (
  <div className={darkMode ? "dark" : ""}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Oops! Something went wrong
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error?.message ||
            "Failed to load your learning progress. Please try again."}
        </p>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ==================== SECTION 1: HEADER COMPONENTS ====================

const MobileHeader = ({
  showMobileMenu,
  setShowMobileMenu,
  showMobileSearch,
  setShowMobileSearch,
  showMobileFilters,
  setShowMobileFilters,
  searchInput,
  onSearch,
  onClearSearch,
  activeFilterCount,
  standardData,
  darkMode,
  toggleDarkMode,
  notifications,
  showNotifications,
  setShowNotifications,
}) => (
  <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              My Learning
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Class {standardData?.standard}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
          >
            <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={() => {
              setShowMobileSearch(!showMobileSearch);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            {searchInput && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </button>

          {/* Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Notifications
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <p className="text-sm text-gray-900 dark:text-white">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500">{notif.time}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

const MobileMenu = ({
  onClose,
  darkMode,
  toggleDarkMode,
  user,
  onExport,
  onLogout,
}) => (
  <div className="fixed inset-0 z-40 lg:hidden">
    <div className="fixed inset-0 bg-black/50" onClick={onClose} />
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <UserCircleIcon className="h-10 w-10 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      <div className="p-2">
        <button
          onClick={onExport}
          className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Export Data
        </button>
        <button
          onClick={toggleDarkMode}
          className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-between"
        >
          <span>Dark Mode</span>
          {darkMode ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={onLogout}
          className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

const MobileSearch = ({
  searchInput,
  onSearch,
  onClear,
  onClose,
  darkMode,
}) => (
  <div className="fixed inset-0 z-40 lg:hidden bg-white dark:bg-gray-800">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search videos, chapters, subjects..."
            value={searchInput}
            onChange={onSearch}
            className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            autoFocus
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {searchInput && (
            <button onClick={onClear} className="absolute right-3 top-2.5">
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>
      </div>
    </div>
    <div className="p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {searchInput
          ? `Searching for "${searchInput}"...`
          : "Type to search videos, chapters, and subjects..."}
      </p>
    </div>
  </div>
);

const DesktopHeader = ({
  user,
  standardData,
  timestamp,
  onRefresh,
  isFetching,
  onExport,
  notifications,
  setShowNotifications,
  showNotifications,
  darkMode,
  toggleDarkMode,
}) => (
  <div className="hidden lg:flex lg:items-center lg:justify-between mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome back, {user?.name?.split(" ")[0] || "Learner"}! 👋
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Track your learning journey and celebrate your progress
      </p>
    </div>

    <div className="flex items-center space-x-4">
      {/* Standard Badge */}
      {standardData && (
        <div className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <AcademicCapIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">Class {standardData.standard}</span>
        </div>
      )}

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        {darkMode ? (
          <SunIcon className="h-5 w-5 text-yellow-500" />
        ) : (
          <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isFetching}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <ArrowPathIcon
          className={`h-5 w-5 text-gray-600 dark:text-gray-300 ${isFetching ? "animate-spin" : ""}`}
        />
      </button>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <ShareIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative"
        >
          <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <p className="text-sm text-gray-900 dark:text-white">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500">{notif.time}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No new notifications
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Last updated:{" "}
        {timestamp
          ? format(new Date(timestamp), "hh:mm a")
          : format(new Date(), "hh:mm a")}
      </div>
    </div>
  </div>
);

// ==================== SECTION 2: FILTER COMPONENTS ====================

const DesktopFilters = ({
  filters,
  selectedStandard,
  selectedSubject,
  selectedChapter,
  onSubjectChange,
  onChapterChange,
  onPageChange,
  searchInput,
  onSearch,
  onClearSearch,
  onContentTypeChange,
  onCompletionStatusChange,
  onSortChange,
  onLimitChange,
  onViewChange,
  onClear,
  activeFilterCount,
  selectedTimeRange,
  setSelectedTimeRange,
  onIncludeSection,
  currentInclude,
  darkMode,
}) => (
  <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filters
        </h2>
        {activeFilterCount > 0 && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
            {activeFilterCount} active
          </span>
        )}
      </div>
      <button
        onClick={onClear}
        className="text-sm text-red-600 dark:text-red-400 hover:text-red-700"
      >
        Clear All
      </button>
    </div>

    {/* Filter Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchInput}
            onChange={onSearch}
            className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {searchInput && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-2.5"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subject
        </label>
        <select
          value={filters.subjectId}
          onChange={(e) => {
            const subject = selectedStandard?.subjects?.find(
              (s) => s.subjectId === e.target.value,
            );
            onSubjectChange(subject);
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Subjects</option>
          {selectedStandard?.subjects?.map((subject) => (
            <option key={subject.subjectId} value={subject.subjectId}>
              {subject.subjectName}
            </option>
          ))}
        </select>
      </div>

      {/* Chapter Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chapter
        </label>
        <select
          value={filters.chapterId}
          onChange={(e) => {
            const chapter = selectedSubject?.chapters?.find(
              (c) => c.chapterId === e.target.value,
            );
            onChapterChange(chapter);
          }}
          disabled={!selectedSubject}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50 text-gray-900 dark:text-white"
        >
          <option value="">All Chapters</option>
          {selectedSubject?.chapters?.map((chapter) => (
            <option key={chapter.chapterId} value={chapter.chapterId}>
              Chapter {chapter.chapterNumber}: {chapter.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content Type
        </label>
        <select
          value={filters.contentType}
          onChange={onContentTypeChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="video">Video</option>
          <option value="quiz">Quiz</option>
          <option value="article">Article</option>
          <option value="interactive">Interactive</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      {/* Completion Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          value={filters.completionStatus}
          onChange={onCompletionStatusChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All</option>
          <option value="completed">Completed</option>
          <option value="inProgress">In Progress</option>
          <option value="notStarted">Not Started</option>
        </select>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time Range
        </label>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sort By
        </label>
        <select
          onChange={onSortChange}
          value={`${filters.sortBy},${filters.sortOrder}`}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="lastAccessed,desc">Recently Viewed</option>
          <option value="lastAccessed,asc">Oldest Viewed</option>
          <option value="progress,desc">Highest Progress</option>
          <option value="progress,asc">Lowest Progress</option>
          <option value="title,asc">Title A-Z</option>
          <option value="title,desc">Title Z-A</option>
        </select>
      </div>

      {/* Items Per Page */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Items Per Page
        </label>
        <select
          value={filters.limit}
          onChange={onLimitChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>

    {/* Include Sections */}
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Show Sections
      </label>
      <div className="flex flex-wrap gap-2">
        {[
          { id: "overall", label: "Overall" },
          { id: "streak", label: "Streak" },
          { id: "watchtime", label: "Watch Time" },
          { id: "quiz", label: "Quiz" },
          { id: "content", label: "Content" },
          { id: "engagement", label: "Engagement" },
          { id: "achievements", label: "Achievements" },
          { id: "leaderboard", label: "Leaderboard" },
          { id: "heatmap", label: "Heatmap" },
          { id: "activity", label: "Activity" },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => onIncludeSection(section.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentInclude.includes(section.id)
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const MobileFilters = ({
  filters,
  selectedStandard,
  selectedSubject,
  selectedChapter,
  onSubjectChange,
  onChapterChange,
  onPageChange,
  onContentTypeChange,
  onCompletionStatusChange,
  onSortChange,
  onLimitChange,
  onViewChange,
  onClear,
  activeFilterCount,
  selectedTimeRange,
  setSelectedTimeRange,
  onClose,
  darkMode,
}) => (
  <div className="fixed inset-0 z-40 lg:hidden bg-white dark:bg-gray-800 overflow-y-auto">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          className="text-sm text-red-600 dark:text-red-400"
        >
          Clear All
        </button>
      </div>
    </div>

    <div className="p-4 space-y-4">
      {/* Subject Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subject
        </label>
        <select
          value={filters.subjectId}
          onChange={(e) => {
            const subject = selectedStandard?.subjects?.find(
              (s) => s.subjectId === e.target.value,
            );
            onSubjectChange(subject);
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Subjects</option>
          {selectedStandard?.subjects?.map((subject) => (
            <option key={subject.subjectId} value={subject.subjectId}>
              {subject.subjectName}
            </option>
          ))}
        </select>
      </div>

      {/* Chapter Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chapter
        </label>
        <select
          value={filters.chapterId}
          onChange={(e) => {
            const chapter = selectedSubject?.chapters?.find(
              (c) => c.chapterId === e.target.value,
            );
            onChapterChange(chapter);
          }}
          disabled={!selectedSubject}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 disabled:opacity-50 text-gray-900 dark:text-white"
        >
          <option value="">All Chapters</option>
          {selectedSubject?.chapters?.map((chapter) => (
            <option key={chapter.chapterId} value={chapter.chapterId}>
              Ch {chapter.chapterNumber}: {chapter.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content Type
        </label>
        <select
          value={filters.contentType}
          onChange={onContentTypeChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="video">Video</option>
          <option value="quiz">Quiz</option>
          <option value="article">Article</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          value={filters.completionStatus}
          onChange={onCompletionStatusChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All</option>
          <option value="completed">Completed</option>
          <option value="inProgress">In Progress</option>
          <option value="notStarted">Not Started</option>
        </select>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time Range
        </label>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sort By
        </label>
        <select
          onChange={onSortChange}
          value={`${filters.sortBy},${filters.sortOrder}`}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="lastAccessed,desc">Recently Viewed</option>
          <option value="lastAccessed,asc">Oldest Viewed</option>
          <option value="progress,desc">Highest Progress</option>
          <option value="progress,asc">Lowest Progress</option>
        </select>
      </div>

      {/* Items Per Page */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Items Per Page
        </label>
        <select
          value={filters.limit}
          onChange={onLimitChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      {/* Apply Button */}
      <button
        onClick={onClose}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Apply Filters
      </button>
    </div>
  </div>
);

const ActiveFilterTags = ({
  filters,
  selectedSubject,
  selectedChapter,
  onRemoveSubject,
  onRemoveChapter,
  onRemoveContentType,
  onRemoveStatus,
  onRemoveSearch,
  darkMode,
}) => {
  if (
    !filters.search &&
    !filters.subjectId &&
    !filters.chapterId &&
    !filters.contentType &&
    !filters.completionStatus
  ) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 py-1">
        Active filters:
      </span>

      {filters.search && (
        <FilterTag
          key="search"
          label={`"${filters.search}"`}
          onRemove={onRemoveSearch}
          darkMode={darkMode}
        />
      )}

      {filters.subjectId && selectedSubject && (
        <FilterTag
          key="subject"
          label={selectedSubject.subjectName}
          onRemove={onRemoveSubject}
          darkMode={darkMode}
        />
      )}

      {filters.chapterId && selectedChapter && (
        <FilterTag
          key="chapter"
          label={`Ch ${selectedChapter.chapterNumber}: ${selectedChapter.name}`}
          onRemove={onRemoveChapter}
          darkMode={darkMode}
        />
      )}

      {filters.contentType && (
        <FilterTag
          key="contentType"
          label={`Type: ${filters.contentType}`}
          onRemove={onRemoveContentType}
          darkMode={darkMode}
        />
      )}

      {filters.completionStatus && (
        <FilterTag
          key="status"
          label={`Status: ${filters.completionStatus === "inProgress" ? "In Progress" : filters.completionStatus}`}
          onRemove={onRemoveStatus}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

const FilterTag = ({ label, onRemove, darkMode }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
    {label}
    <button
      onClick={onRemove}
      className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
    >
      ×
    </button>
  </span>
);

// ==================== SECTION 3: NAVIGATION COMPONENTS ====================

const TabNavigation = ({ activeTab, setActiveTab, tabs, darkMode }) => (
  <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
    <nav className="flex space-x-4 md:space-x-8 min-w-max px-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors flex items-center whitespace-nowrap ${
            activeTab === tab.id
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <tab.icon className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);

const PaginationControls = ({
  pagination,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onLimitChange,
  currentLimit,
  darkMode,
}) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} -{" "}
        {Math.min(
          pagination.currentPage * pagination.itemsPerPage,
          pagination.totalItems,
        )}{" "}
        of {pagination.totalItems} items
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevPage}
          disabled={!pagination.hasPrevPage}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          Previous
        </button>

        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>

        <button
          onClick={onNextPage}
          disabled={!pagination.hasNextPage}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ==================== SECTION 4: TAB COMPONENTS ====================

const OverviewTab = ({
  data,
  onViewAll,
  onVideoClick,
  bookmarkedItems,
  onToggleBookmark,
  darkMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Your Learning Overview</h2>
        <p className="opacity-90">
          Here's what's happening with your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="h-6 w-6 text-blue-500" />
            <span className="text-xs text-gray-500">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.floor(data?.watchTime?.totalMinutes / 60)}h{" "}
            {data?.watchTime?.totalMinutes % 60}m
          </p>
          <p className="text-sm text-gray-500">
            +{data?.watchTime?.weeklyGrowth || 0}% this week
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            <span className="text-xs text-gray-500">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data?.content?.completed || 0}
          </p>
          <p className="text-sm text-gray-500">
            out of {data?.content?.total || 0} items
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <FireIcon className="h-6 w-6 text-orange-500" />
            <span className="text-xs text-gray-500">Streak</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data?.streak?.current || 0} days
          </p>
          <p className="text-sm text-gray-500">
            Longest: {data?.streak?.longest || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <StarIcon className="h-6 w-6 text-yellow-500" />
            <span className="text-xs text-gray-500">Quiz Score</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data?.quiz?.averageScore || 0}%
          </p>
          <p className="text-sm text-gray-500">
            {data?.quiz?.totalTaken || 0} quizzes taken
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <RecentActivityFeed activities={data?.activity?.recent || []} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subject Progress
          </h3>
          <SubjectProgressCard
            subjects={data?.content?.subjectProgress || []}
          />
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Activity
        </h3>
        <WeeklyChart data={data?.engagement?.weekly || []} />
      </div>

      {/* Continue Watching */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Continue Watching
          </h3>
          <button
            onClick={() => onViewAll("videos")}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>
        <VideoProgressList
          videos={data?.watchTime?.inProgress || []}
          onVideoClick={onVideoClick}
          onBookmark={onToggleBookmark}
          bookmarkedItems={bookmarkedItems}
        />
      </div>
    </div>
  );
};

const ContentTab = ({
  content,
  onChapterClick,
  expandedSections,
  onToggleSection,
  darkMode,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subject Progress
        </h3>

        <div className="space-y-4">
          {content?.subjectProgress?.map((subject) => (
            <div
              key={subject.subjectId}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {subject.subjectName}
                </h4>
                <span className="text-sm text-gray-500">
                  {subject.completed} / {subject.total} chapters
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${subject.progress}%` }}
                />
              </div>

              <button
                onClick={() => onToggleSection(subject.subjectId)}
                className="text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                {expandedSections[subject.subjectId]
                  ? "Hide Details"
                  : "Show Details"}
              </button>

              {expandedSections[subject.subjectId] && (
                <div className="mt-4 space-y-2">
                  {subject.chapters?.map((chapter) => (
                    <div
                      key={chapter.chapterId}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                      onClick={() => onChapterClick(chapter.chapterId)}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Chapter {chapter.number}: {chapter.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {chapter.completedVideos}/{chapter.totalVideos} videos
                        </p>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const VideosTab = ({
  watchTime,
  filters,
  onVideoClick,
  onBookmark,
  bookmarkedItems,
  view,
  darkMode,
}) => {
  const videos = watchTime?.videos || [];

  if (videos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
        <VideoCameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Videos Found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters to see more content
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        view === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-4"
      }
    >
      {videos.map((video) => (
        <div
          key={video.videoId}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative">
            <img
              src={video.thumbnail || "/api/placeholder/320/180"}
              alt={video.title}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {video.duration}
            </div>
          </div>

          <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
            {video.title}
          </h4>
          <p className="text-sm text-gray-500 mb-2">
            {video.subject} • Chapter {video.chapterNumber}
          </p>

          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{video.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${video.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => onVideoClick(video.videoId)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <PlayIcon className="h-4 w-4 mr-1" />
              {video.progress > 0 ? "Continue" : "Start"}
            </button>

            <button
              onClick={() => onBookmark(video.videoId, "video")}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <BookmarkIcon
                className={`h-4 w-4 ${
                  bookmarkedItems.includes(`video_${video.videoId}`)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-400"
                }`}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const QuizTab = ({ quiz, onQuizClick, darkMode }) => {
  const quizzes = quiz?.quizzes || [];

  return (
    <div className="space-y-6">
      {/* Quiz Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Average Score</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {quiz?.averageScore || 0}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Quizzes Taken</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {quiz?.totalTaken || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Best Score</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {quiz?.bestScore || 0}%
          </p>
        </div>
      </div>

      {/* Quiz List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Recent Quizzes
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => onQuizClick(quiz.quizId)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {quiz.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {quiz.subject} • Chapter {quiz.chapterNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {quiz.score}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {quiz.questionsCorrect}/{quiz.totalQuestions} correct
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No quizzes taken yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnalyticsTab = ({
  data,
  showHeatmap,
  setShowHeatmap,
  selectedTimeRange,
  setSelectedTimeRange,
  darkMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-2">
          {["week", "month", "quarter", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                selectedTimeRange === range
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Watch Time Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Watch Time Distribution
          </h3>
          <WeeklyChart data={data?.engagement?.weekly || []} type="watchTime" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subject-wise Progress
          </h3>
          <SubjectProgressCard
            subjects={data?.content?.subjectProgress || []}
            showChart
          />
        </div>
      </div>

      {/* Activity Heatmap Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity Heatmap
          </h3>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showHeatmap ? "Hide" : "Show"} Heatmap
          </button>
        </div>

        {showHeatmap && (
          <ActivityHeatmap
            data={data?.heatmap?.data || []}
            year={data?.heatmap?.year || new Date().getFullYear()}
          />
        )}
      </div>

      {/* Quiz Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quiz Performance Over Time
        </h3>
        <QuizPerformance data={data?.quiz?.history || []} />
      </div>
    </div>
  );
};

const AchievementsTab = ({
  achievements,
  streak,
  badges,
  leaderboard,
  darkMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Current Streak</h3>
            <p className="text-4xl font-bold">{streak?.current || 0} days</p>
            <p className="text-sm opacity-90 mt-1">
              Longest: {streak?.longest || 0} days
            </p>
          </div>
          <FireIcon className="h-16 w-16 opacity-80" />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Badges
        </h3>
        <BadgesGrid badges={badges || []} />
      </div>

      {/* Achievement Milestones */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Achievement Milestones
        </h3>
        <AchievementMilestones achievements={achievements?.milestones || []} />
      </div>

      {/* Leaderboard Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Leaderboard
        </h3>
        <LeaderboardPreview data={leaderboard || []} />
      </div>
    </div>
  );
};

export default AllProgressStudentDashboard;
