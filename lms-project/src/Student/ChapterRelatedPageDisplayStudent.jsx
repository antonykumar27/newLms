// ChapterRelatedPageDisplayStudent.jsx - UPDATED WITH REAL PROGRESS DATA

import React, { useState, useEffect } from "react";
import {
  useGetChapterByIdQuery,
  useGetChapterByPageIdQuery,
  useGetChapterQuizByPageIdQuery, // 👈 This gives progress data
} from "../store/api/MathsLessonApi";
import { useParams, useNavigate } from "react-router-dom";
import {
  Eye,
  Brain,
  Sparkles,
  Search,
  BookOpen,
  Image as ImageIcon,
  FileText,
  Edit,
  Video,
  Music,
  Zap,
  Clock,
  Layers,
  Bookmark,
  Filter,
  Grid,
  Moon,
  Sun,
  ChevronRight,
  Trophy,
  Target,
  AlertCircle,
  CheckCircle,
  Crown,
  Lock,
  Unlock,
  Gift,
  Info,
  BarChart3,
  Circle,
  CircleCheck,
  PlayCircle,
} from "lucide-react";
import LoadingSpinner from "../Student/LoadingSpinner";
import EmptyState from "../admin/EmptyState";
import { useAuth } from "../common/AuthContext";

// ====================== REUSABLE HELPERS ======================
// const isPageLocked = (page, user, subscriptionData) => {
//   if (subscriptionData?.hasSubscription === true) {
//     return false;
//   }
//   const previewPagesCount = subscriptionData?.previewPages || 1;
//   return page.pageNumber > previewPagesCount;
// };
const isPageLocked = (page, user, subscriptionData) => {
  return page.isLocked === true;
};
const getLockedMessage = (page, user, subscriptionData) => {
  if (subscriptionData?.hasSubscription === true) {
    return "Premium Access";
  }
  const previewPagesCount = subscriptionData?.previewPages || 1;
  if (page.pageNumber <= previewPagesCount) {
    return `Free Preview (Page ${page.pageNumber}/${previewPagesCount})`;
  }
  return `🔒 Premium Required - Page ${page.pageNumber}+`;
};

const handleLockedAction = ({
  locked,
  navigate,
  onAllowed,
  page,
  chapterTitle,
  chapterId,
  actionType = "page_lock",
  subscriptionData,
}) => {
  if (locked) {
    navigate("/studentDetails/subscription", {
      state: {
        from: actionType,
        pageNumber: page.pageNumber,
        pageTitle: page.pageTitle,
        chapterTitle: chapterTitle || "Untitled Chapter",
        chapterId: chapterId,
        action: actionType,
        requiredPage: page.pageNumber,
        previewPages: subscriptionData?.previewPages || 1,
      },
    });
  } else {
    onAllowed();
  }
};

// ====================== INDIVIDUAL PAGE PROGRESS COMPONENT (UPDATED) ======================
const PageProgress = ({ page, progressData, darkMode }) => {
  // Get progress for this specific page from progressData
  const pageProgress = progressData?.data?.pages?.find(
    (p) => p.pageId.toString() === page._id.toString(),
  );

  const progress = pageProgress?.progress || 0;
  const isCompleted = progress >= 95; // Consider completed if >95%

  // If page is locked, show minimal progress info
  if (isPageLocked(page, null, page.subscriptionData)) {
    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          <span className="text-gray-500 dark:text-gray-400">Locked</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full w-0 bg-gray-400 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          Progress
        </span>
        <span
          className={`font-medium ${
            isCompleted
              ? "text-green-600 dark:text-green-400"
              : "text-blue-600 dark:text-blue-400"
          }`}
        >
          {progress.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCompleted
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-blue-500 to-purple-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress indicator */}
      <div className="flex justify-end mt-1">
        <span className="text-[10px] text-gray-400">
          {isCompleted ? "✅ Completed" : "📖 In progress"}
        </span>
      </div>
    </div>
  );
};

// ====================== COMMON PROGRESS COMPONENT (UPDATED) ======================
const LearningProgress = ({
  pages,
  progressData,
  subscriptionData,
  isPaidUser,
  isStudent,
  darkMode,
}) => {
  if (!isStudent || pages.length === 0) return null;

  // Extract progress data
  const chapterProgress = progressData?.data || {};
  const pagesProgress = chapterProgress.pages || [];

  // Calculate stats from real progress data
  const completedPages = pagesProgress.filter((p) => p.progress >= 95).length;
  const totalPages = pages.length;
  const progressPercentage =
    Math.round((completedPages / totalPages) * 100) || 0;

  // Calculate average page progress from real data
  const averagePageProgress =
    pagesProgress.length > 0
      ? Math.round(
          pagesProgress.reduce((acc, page) => acc + page.progress, 0) /
            pagesProgress.length,
        )
      : 0;

  const previewPagesCount = subscriptionData?.previewPages || 1;
  const premiumPages = pages.filter(
    (p) => p.pageNumber > previewPagesCount,
  ).length;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Learning Progress
        </h2>
        {!isPaidUser && (
          <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full">
            Free Preview Mode
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-1 w-full">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              Chapter Completion
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {averagePageProgress}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${averagePageProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>
              Completed {completedPages} of {totalPages} pages
            </span>
            <span>Avg. page progress: {averagePageProgress}%</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row - Using real progress data */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {completedPages}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Pages Completed
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {
              pagesProgress.filter((p) => p.progress > 0 && p.progress < 95)
                .length
            }
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            In Progress
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {pagesProgress.filter((p) => p.progress === 0).length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Not Started
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================== BADGE COMPONENTS ======================
const AccessBadge = ({ locked, darkMode, subscriptionData }) => (
  <span
    className={`px-3 py-1 text-sm font-bold rounded-full shadow-lg flex items-center gap-1 ${
      locked
        ? "bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white"
        : subscriptionData?.hasSubscription
          ? "bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white"
          : darkMode
            ? "bg-gray-900/80 text-white"
            : "bg-white/90 text-gray-800"
    }`}
  >
    {subscriptionData?.hasSubscription ? (
      <>
        <Crown className="h-3 w-3" />
        <span>Premium</span>
      </>
    ) : locked ? (
      <>
        <Lock className="h-3 w-3" />
        <span>Locked</span>
      </>
    ) : (
      <>
        <Unlock className="h-3 w-3" />
        <span>Free</span>
      </>
    )}
  </span>
);

const PageNumberBadge = ({
  pageNumber,
  darkMode,
  isPreview,
  subscriptionData,
}) => {
  const previewPagesCount = subscriptionData?.previewPages || 1;
  const isPreviewPage = pageNumber <= previewPagesCount;

  return (
    <span
      className={`px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 ${
        isPreviewPage && !subscriptionData?.hasSubscription
          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400 border border-green-500/30"
          : darkMode
            ? "bg-gray-700 text-gray-300"
            : "bg-gray-100 text-gray-600"
      }`}
    >
      {isPreviewPage && !subscriptionData?.hasSubscription && (
        <Gift className="h-3 w-3" />
      )}
      <span>Page {pageNumber}</span>
      {isPreviewPage && !subscriptionData?.hasSubscription && (
        <span className="text-[10px]">(Free)</span>
      )}
    </span>
  );
};

const MediaIndicator = ({ type, locked, darkMode }) => {
  const icons = {
    video: Video,
    audio: Music,
    quiz: Brain,
  };

  const colors = {
    video: locked
      ? "bg-gray-800/80 text-gray-400"
      : darkMode
        ? "bg-red-900/80 text-red-300"
        : "bg-red-500/20 text-red-600",
    audio: locked
      ? "bg-gray-800/80 text-gray-400"
      : darkMode
        ? "bg-blue-900/80 text-blue-300"
        : "bg-blue-500/20 text-blue-600",
    quiz: locked
      ? "bg-gray-800/80 text-gray-400"
      : darkMode
        ? "bg-green-900/80 text-green-300"
        : "bg-green-500/20 text-green-600",
  };

  const Icon = icons[type];

  return Icon ? (
    <div className={`p-1.5 rounded-full ${colors[type]}`}>
      <Icon className="h-3 w-3" />
    </div>
  ) : null;
};

// ====================== PAGE CARD COMPONENT (UPDATED) ======================
const PageCard = ({
  page,
  progressData,
  darkMode,
  onEdit,
  onView,
  onCreateVideo,
  onCreateAudio,
  onPreview,
  onCreateQuiz,
  onPlayQuiz,
  user,
  navigate,
  chapterId,
  chapterTitle,
  subscriptionData,
}) => {
  const mainImage = page.media?.find((m) => m.type === "image");
  const hasVideo = page.media?.some((m) => m.type === "video");
  const hasAudio = page.media?.some((m) => m.type === "audio");

  const locked = isPageLocked(page, user, subscriptionData);
  const lockedMessage = getLockedMessage(page, user, subscriptionData);
  const isSubscribed = subscriptionData?.hasSubscription === true;
  const previewPagesCount = subscriptionData?.previewPages || 1;
  const isPreviewPage = page.pageNumber <= previewPagesCount;

  // Get progress for this page
  const pageProgress = progressData?.data?.pages?.find(
    (p) => p.pageId === page._id,
  );
  const progress = pageProgress?.progress || 0;
  const isCompleted = progress >= 95;

  // Handle Learn button click
  const handleLearnClick = () => {
    handleLockedAction({
      locked,
      navigate,
      chapterId,
      onAllowed: onView,
      page,
      chapterTitle,
      actionType: "page_lock",
      subscriptionData,
    });
  };

  // Handle Quiz button click
  const handleQuizClick = () => {
    handleLockedAction({
      locked,
      navigate,
      onAllowed: onPlayQuiz,
      page,
      chapterTitle,
      chapterId,
      actionType: "quiz_lock",
      subscriptionData,
    });
  };

  return (
    <div
      className={`group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border relative ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } ${locked ? "opacity-90" : ""} ${
        isPreviewPage && !isSubscribed && !locked
          ? "ring-2 ring-green-500/50"
          : ""
      }`}
    >
      {/* LOCK OVERLAY */}
      {locked && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 rounded-2xl">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border-2 border-purple-500/30 mb-3">
              <Crown className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">
              Premium Content
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              This is page {page.pageNumber} • Preview available for first{" "}
              {previewPagesCount} pages
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/studentDetails/subscription", {
                state: {
                  chapterId,
                  chapterTitle,
                  returnTo: window.location.pathname,
                },
              })
            }
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Premium
            <ChevronRight className="h-4 w-4" />
          </button>

          <p className="text-gray-400 text-xs mt-4 text-center">
            🆓 First {previewPagesCount} page{previewPagesCount > 1 ? "s" : ""}{" "}
            free • 🔒 Pages {previewPagesCount + 1}+ require Premium
          </p>
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-48 rounded-t-2xl overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={page.pageTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              darkMode
                ? "bg-gray-700"
                : "bg-gradient-to-br from-blue-50 to-indigo-50"
            }`}
          >
            <ImageIcon
              className={`h-16 w-16 ${darkMode ? "text-gray-600" : "text-blue-300"}`}
            />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <AccessBadge
            locked={locked}
            darkMode={darkMode}
            subscriptionData={subscriptionData}
          />

          {isPreviewPage && !isSubscribed && !locked && (
            <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full border border-green-500/30 flex items-center gap-1">
              <Gift className="h-3 w-3" />
              Free Preview
            </span>
          )}
        </div>

        {/* Media Type Indicators */}
        <div className="absolute top-4 right-4 flex gap-2">
          {hasVideo && (
            <MediaIndicator type="video" locked={locked} darkMode={darkMode} />
          )}
          {hasAudio && (
            <MediaIndicator type="audio" locked={locked} darkMode={darkMode} />
          )}
          {page.hasQuiz && (
            <MediaIndicator type="quiz" locked={locked} darkMode={darkMode} />
          )}
        </div>

        {/* Access Indicator */}
        <div className="absolute bottom-4 left-4">
          <span
            className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${
              locked
                ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-300 border border-amber-500/30"
                : isSubscribed
                  ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-300 border border-purple-500/30"
                  : "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-300 border border-green-500/30"
            }`}
          >
            {locked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
            {lockedMessage}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button
            onClick={handleLearnClick}
            className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
              locked
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                : "bg-white/90 text-gray-800 hover:bg-white"
            }`}
          >
            {locked ? "🔓 Unlock with Premium" : "Start Learning"}
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3
            className={`text-lg font-bold line-clamp-2 ${
              darkMode ? "text-white" : "text-gray-800"
            } ${locked ? "opacity-75" : ""}`}
          >
            {locked && "🔒 "}
            {page.pageTitle}
          </h3>
          {isCompleted && !locked && (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
        </div>

        {page.description && (
          <p
            className={`text-sm mb-4 line-clamp-2 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            } ${locked ? "opacity-60" : ""}`}
          >
            {page.description}
          </p>
        )}

        {/* INDIVIDUAL PAGE PROGRESS BAR - WITH REAL DATA */}
        {!locked && (
          <PageProgress
            page={page}
            progressData={progressData}
            darkMode={darkMode}
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleLearnClick}
            className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all ${
              locked
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            }`}
          >
            {locked ? (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Upgrade</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                <span>Learn</span>
              </>
            )}
          </button>

          <button
            onClick={handleQuizClick}
            disabled={user?.user?.role !== "student" || locked}
            className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all ${
              user?.user?.role !== "student" || locked
                ? "bg-gradient-to-r from-gray-600 to-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
            }`}
          >
            <Brain className="h-4 w-4" />
            <span>Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================== MAIN COMPONENT (UPDATED) ======================
const ChapterRelatedPageDisplayStudent = () => {
  const { id: ChapterId } = useParams();

  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // API calls
  const {
    data: responseData,
    isLoading,
    refetch,
    error,
  } = useGetChapterByIdQuery(ChapterId);

  // 👇 PROGRESS API CALL
  const {
    data: progressData,
    isLoading: isProgressLoading,
    refetch: refetchProgress,
    error: progressError,
  } = useGetChapterByPageIdQuery(ChapterId);

  // 👇 PROGRESS API CALL
  const { data: quizData } = useGetChapterQuizByPageIdQuery(ChapterId);

  // Data extraction
  const chapterData = responseData?.data?.chapter || null;
  const pages = responseData?.data?.pages || [];
  const subjectInfo = responseData?.data?.subject || {};
  const subscriptionData = responseData?.data?.subscription || {
    hasSubscription: false,
    locked: true,
    previewPages: 1,
    totalPages: pages.length,
  };

  // Refetch on mount
  useEffect(() => {
    refetch();
    refetchProgress(); // 👈 Also refetch progress data
  }, [refetch, refetchProgress]);

  // User status
  const isPaidUser = subscriptionData?.hasSubscription === true;
  const isTeacher = user?.primaryStudents !== "primaryStudent";
  const isStudent = user?.user.role === "student";

  // Filter pages based on search query
  const filteredPages = searchQuery
    ? pages.filter(
        (page) =>
          page?.pageTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page?.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          page?.pageNumber?.toString().includes(searchQuery),
      )
    : pages;

  // Get preview pages count
  const previewPagesCount = subscriptionData?.previewPages || 1;
  const freePages = pages.filter(
    (p) => p.pageNumber <= previewPagesCount,
  ).length;
  const premiumPages = pages.filter(
    (p) => p.pageNumber > previewPagesCount,
  ).length;

  // Navigation handlers
  const handleCreatePage = () => {
    if (chapterData?._id) {
      navigate(`/teacherDetails/teacherCreateCourseForm/${chapterData._id}`);
    }
  };

  const handleCreateMathPage = () => {
    if (chapterData?._id) {
      navigate(
        `/teacherDetails/eachChapterChunkContentCreate/create/${chapterData._id}`,
      );
    }
  };

  const handleEditChapter = () => {
    if (chapterData?._id) {
      navigate(`/teacherDetails/chapters/edit/${chapterData._id}`);
    }
  };

  const handleViewAllPages = () => {
    if (chapterData?._id) {
      navigate(`/teacherDetails/ChapterRelatedpages/${chapterData._id}`);
    }
  };

  const handleCreateQuiz = () => {
    if (chapterData?._id) {
      navigate(`/teacherDetails/eachChapterRelatedQuiz/${chapterData._id}`);
    }
  };

  const handleTakeQuiz = () => {
    if (chapterData?._id) {
      navigate(`/studentDetails/playQuiz/${chapterData._id}`, {
        state: {
          chapterId: chapterData._id,
        },
      });
    }
  };

  // Page action handlers
  const handleEditPage = (pageId) => {
    navigate(`/teacherDetails/chapterRelatedPageDisplay/edit/${pageId}`);
  };

  const handleViewPage = (pageId) => {
    navigate(`/studentDetails/eachChapterStudy/watch/${pageId}`);
  };

  const handleCreateVideoForPage = (pageId) => {
    navigate(`/teacherDetails/teacherCreateCourseForm/${pageId}`, {
      state: { chapterId: chapterData?._id },
    });
  };

  const handleCreateAudioForPage = (pageId) => {
    navigate(`/teacherDetails/page/audio/create/${pageId}`, {
      state: { chapterId: chapterData?._id },
    });
  };

  const handlePreviewPage = (pageId) => {
    navigate(`/teacherDetails/pages/view/${pageId}`);
  };

  const handleCreatePageQuiz = (pageId) => {
    navigate(`/teacherDetails/eachChapterRelatedQuiz/${pageId}`, {
      state: { chapterId: chapterData?._id },
    });
  };

  const handlePlayPageQuiz = (pageId) => {
    navigate(`/studentDetails/playQuiz/${pageId}`);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Navigate to first free page
  const goToFirstFreePage = () => {
    const firstFreePage = pages.find((p) => p.pageNumber === 1);
    if (firstFreePage) {
      navigate(`/teacherDetails/eachChapterStudy/watch/${firstFreePage._id}`);
    }
  };

  // Loading state
  if (isLoading || isProgressLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error || progressError) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-red-600 dark:text-red-400 mb-4 text-lg">
          Failed to load chapter pages
        </div>
        <button
          onClick={() => {
            refetch();
            refetchProgress();
          }}
          className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // No chapter found
  if (!chapterData) {
    return (
      <EmptyState
        title="Chapter not found"
        message="The requested chapter could not be found."
        actionText="Back to Chapters"
        onAction={() => navigate(-1)}
        icon={
          <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600" />
        }
      />
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "dark bg-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 via-white to-blue-50/30 text-gray-900"
      }`}
    >
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />

        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg">
                  Chapter {chapterData.chapterNumber}
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    chapterData.isActive
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-800 dark:to-gray-700 dark:text-gray-300"
                  }`}
                >
                  {chapterData.isActive ? "Active" : "Draft"}
                </span>

                {/* Subscription Status Badge */}
                {subscriptionData?.hasSubscription ? (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Premium Member
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Free Preview ({previewPagesCount}{" "}
                    {previewPagesCount === 1 ? "page" : "pages"})
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3">
                {chapterData.chapterTitle}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
                {subjectInfo.subject} • {subjectInfo.standard}{" "}
                {subjectInfo.part ? `• Part ${subjectInfo.part}` : ""}
              </p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-xl ${
                darkMode
                  ? "bg-gray-800 text-yellow-400"
                  : "bg-white text-gray-700 shadow-lg"
              } hover:shadow-xl transition-all`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Pages
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {pages.length}
                  </p>
                </div>
                <Layers className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Free Preview Pages
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {freePages}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    {previewPagesCount}{" "}
                    {previewPagesCount === 1 ? "page" : "pages"} free
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Premium Pages
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {premiumPages}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Pages {previewPagesCount + 1}+
                  </p>
                </div>
                <Crown className="h-8 w-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {progressData?.data?.pages?.filter((p) => p.progress >= 95)
                      .length || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Subscription Status Message */}
          {!isPaidUser && (
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 mb-4 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Free Preview Mode:</span> You
                    can access the first {previewPagesCount}{" "}
                    {previewPagesCount === 1 ? "page" : "pages"} for free.
                    Upgrade to Premium to unlock all {pages.length} pages!
                  </p>
                </div>
                <button
                  onClick={() => navigate("/studentDetails/subscription")}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* LEARNING PROGRESS - WITH REAL DATA */}
        <LearningProgress
          pages={pages}
          progressData={progressData} // 👈 Pass progress data
          subscriptionData={subscriptionData}
          isPaidUser={isPaidUser}
          isStudent={isStudent}
          darkMode={darkMode}
        />

        {/* Upgrade Banner */}
        {!isPaidUser && isStudent && pages.length > previewPagesCount && (
          <div className="mb-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border-l-4 border-purple-500 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      Unlock Full Chapter Access
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      First {previewPagesCount}{" "}
                      {previewPagesCount === 1 ? "page is" : "pages are"} free!
                      Upgrade to Premium for all {pages.length} pages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {freePages} Free {freePages === 1 ? "Page" : "Pages"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {premiumPages} Premium{" "}
                      {premiumPages === 1 ? "Page" : "Pages"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/studentDetails/subscription")}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade Now
                </button>

                <button
                  onClick={goToFirstFreePage}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-medium hover:bg-purple-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
                >
                  <Gift className="h-4 w-4" />
                  Try Free Page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Action Bar */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${pages.length} pages by title, description...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pages Grid */}
        {pages.length === 0 ? (
          <EmptyState
            title="No pages yet"
            message="This chapter doesn't have any pages yet."
            actionText="Create First Page"
            onAction={handleCreatePage}
            icon={
              <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600" />
            }
          />
        ) : filteredPages.length === 0 ? (
          <EmptyState
            title="No matching pages"
            message={`No pages found matching "${searchQuery}"`}
            actionText="Clear Search"
            onAction={() => setSearchQuery("")}
            icon={
              <Search className="h-16 w-16 text-gray-400 dark:text-gray-600" />
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <PageCard
                key={page._id}
                page={page}
                progressData={progressData} // 👈 Pass progress data
                darkMode={darkMode}
                onEdit={() => handleEditPage(page._id)}
                onView={() => handleViewPage(page._id)}
                onCreateVideo={() => handleCreateVideoForPage(page._id)}
                onCreateAudio={() => handleCreateAudioForPage(page._id)}
                onPreview={() => handlePreviewPage(page._id)}
                onCreateQuiz={() => handleCreatePageQuiz(page._id)}
                onPlayQuiz={() => handlePlayPageQuiz(page._id)}
                user={user}
                navigate={navigate}
                chapterTitle={chapterData.chapterTitle}
                chapterId={ChapterId}
                subscriptionData={subscriptionData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterRelatedPageDisplayStudent;

// import React, { useState, useEffect } from "react";
// import {
//   useGetChapterByIdQuery,
//   useGetChapterByPageIdQuery,
// } from "../store/api/MathsLessonApi";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Eye,
//   Brain,
//   Sparkles,
//   Search,
//   BookOpen,
//   Image as ImageIcon,
//   FileText,
//   Edit,
//   Video,
//   Music,
//   Zap,
//   Clock,
//   Layers,
//   Bookmark,
//   Filter,
//   Grid,
//   Moon,
//   Sun,
//   ChevronRight,
//   Trophy,
//   Target,
//   AlertCircle,
//   CheckCircle,
//   Crown,
//   Lock,
//   Unlock,
//   Gift,
//   Info,
//   BarChart3,
//   Circle,
//   CircleCheck,
//   PlayCircle,
// } from "lucide-react";
// import LoadingSpinner from "../Student/LoadingSpinner";
// import EmptyState from "../admin/EmptyState";
// import { useAuth } from "../common/AuthContext";

// // ====================== REUSABLE HELPERS ======================
// // Access control helper functions using REAL subscription data
// const isPageLocked = (page, user, subscriptionData) => {
//   // If user has subscription (paid), they can access everything
//   if (subscriptionData?.hasSubscription === true) {
//     return false;
//   }

//   // For users without subscription:
//   // Only pages up to previewPages count are free, others are locked
//   const previewPagesCount = subscriptionData?.previewPages || 1; // Default to 1 if not specified
//   return page.pageNumber > previewPagesCount;
// };

// const getLockedMessage = (page, user, subscriptionData) => {
//   if (subscriptionData?.hasSubscription === true) {
//     return "Premium Access";
//   }

//   const previewPagesCount = subscriptionData?.previewPages || 1;

//   if (page.pageNumber <= previewPagesCount) {
//     return `Free Preview (Page ${page.pageNumber}/${previewPagesCount})`;
//   }

//   return `🔒 Premium Required - Page ${page.pageNumber}+`;
// };

// const getSubscriptionBadgeText = (subscriptionData) => {
//   if (subscriptionData?.hasSubscription) {
//     return "✨ Premium Member";
//   }
//   return `🆓 Free Preview (${subscriptionData?.previewPages || 1} pages)`;
// };

// // Reusable locked action handler
// const handleLockedAction = ({
//   locked,
//   navigate,
//   onAllowed,
//   page,
//   chapterTitle,
//   chapterId,
//   actionType = "page_lock",
//   subscriptionData,
// }) => {
//   if (locked) {
//     navigate("/studentDetails/subscription", {
//       state: {
//         from: actionType,
//         pageNumber: page.pageNumber,
//         pageTitle: page.pageTitle,
//         chapterTitle: chapterTitle || "Untitled Chapter",
//         chapterId: chapterId,
//         action: actionType,
//         requiredPage: page.pageNumber,
//         previewPages: subscriptionData?.previewPages || 1,
//       },
//     });
//   } else {
//     onAllowed();
//   }
// };

// // ====================== INDIVIDUAL PAGE PROGRESS COMPONENT ======================
// const PageProgress = ({ page, darkMode }) => {
//   // Calculate page progress based on completed sections
//   // You can customize this logic based on your data structure
//   const hasMedia = page.media?.length > 0;
//   const hasQuiz = page.hasQuiz;

//   // Example progress calculation - modify based on your actual progress data
//   const completedSections = [
//     page.isCompleted, // Page itself completed
//     page.videoWatched, // Video watched
//     page.quizCompleted, // Quiz completed
//   ].filter(Boolean).length;

//   const totalSections = 3; // Adjust based on your actual sections
//   const progress = Math.round((completedSections / totalSections) * 100);

//   // If page is locked, show minimal progress info
//   if (isPageLocked(page, null, page.subscriptionData)) {
//     return (
//       <div className="mt-3">
//         <div className="flex justify-between text-xs mb-1">
//           <span className="text-gray-500 dark:text-gray-400">Progress</span>
//           <span className="text-gray-500 dark:text-gray-400">Locked</span>
//         </div>
//         <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//           <div className="h-full w-0 bg-gray-400 rounded-full" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-3">
//       <div className="flex justify-between text-xs mb-1">
//         <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
//           <BarChart3 className="h-3 w-3" />
//           Progress
//         </span>
//         <span
//           className={`font-medium ${
//             progress === 100
//               ? "text-green-600 dark:text-green-400"
//               : "text-blue-600 dark:text-blue-400"
//           }`}
//         >
//           {progress}%
//         </span>
//       </div>
//       <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//         <div
//           className={`h-full rounded-full transition-all duration-500 ${
//             progress === 100
//               ? "bg-gradient-to-r from-green-500 to-emerald-500"
//               : "bg-gradient-to-r from-blue-500 to-purple-500"
//           }`}
//           style={{ width: `${progress}%` }}
//         />
//       </div>

//       {/* Mini section indicators */}
//       <div className="flex gap-2 mt-2">
//         {hasMedia && (
//           <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
//             {page.videoWatched ? (
//               <CircleCheck className="h-2.5 w-2.5 text-green-500" />
//             ) : (
//               <Circle className="h-2.5 w-2.5 text-gray-400" />
//             )}
//             Video
//           </span>
//         )}
//         {hasQuiz && (
//           <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
//             {page.quizCompleted ? (
//               <CircleCheck className="h-2.5 w-2.5 text-green-500" />
//             ) : (
//               <Circle className="h-2.5 w-2.5 text-gray-400" />
//             )}
//             Quiz
//           </span>
//         )}
//         <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
//           {page.isCompleted ? (
//             <CircleCheck className="h-2.5 w-2.5 text-green-500" />
//           ) : (
//             <Circle className="h-2.5 w-2.5 text-gray-400" />
//           )}
//           Read
//         </span>
//       </div>
//     </div>
//   );
// };

// // ====================== COMMON PROGRESS COMPONENT (NOW AT TOP) ======================
// const LearningProgress = ({
//   pages,
//   subscriptionData,
//   isPaidUser,
//   isStudent,
//   darkMode,
// }) => {
//   console.log("pages", pages);
//   console.log("isStudent", isStudent);
//   if (!isStudent || pages.length === 0) return null;

//   const previewPagesCount = subscriptionData?.previewPages || 1;
//   const premiumPages = pages.filter(
//     (p) => p.pageNumber > previewPagesCount,
//   ).length;
//   const completedPages = pages.filter((p) => p.isCompleted).length;
//   const progressPercentage = Math.round((completedPages / pages.length) * 100);

//   // Calculate average page progress
//   const averagePageProgress = Math.round(
//     pages.reduce((acc, page) => {
//       const completedSections = [
//         page.isCompleted,
//         page.videoWatched,
//         page.quizCompleted,
//       ].filter(Boolean).length;
//       return acc + (completedSections / 3) * 100;
//     }, 0) / pages.length,
//   );

//   return (
//     <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-xl font-bold flex items-center gap-2">
//           <Trophy className="h-5 w-5 text-yellow-500" />
//           Your Learning Progress
//         </h2>
//         {!isPaidUser && (
//           <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full">
//             Free Preview Mode
//           </span>
//         )}
//       </div>

//       <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
//         <div className="flex-1 w-full">
//           <div className="flex justify-between text-sm mb-2">
//             <span className="text-gray-600 dark:text-gray-400">
//               Chapter Completion
//             </span>
//             <span className="font-bold text-gray-900 dark:text-white">
//               {progressPercentage}%
//             </span>
//           </div>
//           <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
//               style={{ width: `${progressPercentage}%` }}
//             />
//           </div>
//           <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
//             <span>
//               Completed {completedPages} of {pages.length} pages
//             </span>
//             <span>Avg. page progress: {averagePageProgress}%</span>
//           </div>
//         </div>

//         <div className="flex gap-4 w-full md:w-auto">
//           <div className="flex-1 md:flex-none text-center px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//             <div className="text-2xl font-bold text-green-500">
//               {pages.length - premiumPages}
//             </div>
//             <div className="text-xs text-gray-500 dark:text-gray-400">
//               Free Pages
//             </div>
//           </div>

//           <div className="flex-1 md:flex-none text-center px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//             <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//               {premiumPages}
//             </div>
//             <div className="text-xs text-gray-500 dark:text-gray-400">
//               Premium Pages
//             </div>
//             {!isPaidUser && premiumPages > 0 && (
//               <button
//                 onClick={() => navigate("/studentDetails/subscription")}
//                 className="mt-2 text-xs text-purple-500 hover:text-purple-600 font-medium flex items-center justify-center gap-1"
//               >
//                 Unlock all <ChevronRight className="h-3 w-3" />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Quick Stats Row */}
//       <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//         <div className="text-center">
//           <div className="text-sm font-medium text-gray-900 dark:text-white">
//             {pages.filter((p) => p.isCompleted).length}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">
//             Pages Done
//           </div>
//         </div>
//         <div className="text-center">
//           <div className="text-sm font-medium text-gray-900 dark:text-white">
//             {pages.filter((p) => p.videoWatched).length}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">
//             Videos Watched
//           </div>
//         </div>
//         <div className="text-center">
//           <div className="text-sm font-medium text-gray-900 dark:text-white">
//             {pages.filter((p) => p.quizCompleted).length}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">
//             Quizzes Done
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ====================== BADGE COMPONENTS ======================
// const AccessBadge = ({ locked, darkMode, subscriptionData }) => (
//   <span
//     className={`px-3 py-1 text-sm font-bold rounded-full shadow-lg flex items-center gap-1 ${
//       locked
//         ? "bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white"
//         : subscriptionData?.hasSubscription
//           ? "bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white"
//           : darkMode
//             ? "bg-gray-900/80 text-white"
//             : "bg-white/90 text-gray-800"
//     }`}
//   >
//     {subscriptionData?.hasSubscription ? (
//       <>
//         <Crown className="h-3 w-3" />
//         <span>Premium</span>
//       </>
//     ) : locked ? (
//       <>
//         <Lock className="h-3 w-3" />
//         <span>Locked</span>
//       </>
//     ) : (
//       <>
//         <Unlock className="h-3 w-3" />
//         <span>Free</span>
//       </>
//     )}
//   </span>
// );

// const PageNumberBadge = ({
//   pageNumber,
//   darkMode,
//   isPreview,
//   subscriptionData,
// }) => {
//   const previewPagesCount = subscriptionData?.previewPages || 1;
//   const isPreviewPage = pageNumber <= previewPagesCount;

//   return (
//     <span
//       className={`px-2 py-0.5 text-xs font-bold rounded flex items-center gap-1 ${
//         isPreviewPage && !subscriptionData?.hasSubscription
//           ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 dark:text-green-400 border border-green-500/30"
//           : darkMode
//             ? "bg-gray-700 text-gray-300"
//             : "bg-gray-100 text-gray-600"
//       }`}
//     >
//       {isPreviewPage && !subscriptionData?.hasSubscription && (
//         <Gift className="h-3 w-3" />
//       )}
//       <span>Page {pageNumber}</span>
//       {isPreviewPage && !subscriptionData?.hasSubscription && (
//         <span className="text-[10px]">(Free)</span>
//       )}
//     </span>
//   );
// };

// const MediaIndicator = ({ type, locked, darkMode }) => {
//   const icons = {
//     video: Video,
//     audio: Music,
//     quiz: Brain,
//   };

//   const colors = {
//     video: locked
//       ? "bg-gray-800/80 text-gray-400"
//       : darkMode
//         ? "bg-red-900/80 text-red-300"
//         : "bg-red-500/20 text-red-600",
//     audio: locked
//       ? "bg-gray-800/80 text-gray-400"
//       : darkMode
//         ? "bg-blue-900/80 text-blue-300"
//         : "bg-blue-500/20 text-blue-600",
//     quiz: locked
//       ? "bg-gray-800/80 text-gray-400"
//       : darkMode
//         ? "bg-green-900/80 text-green-300"
//         : "bg-green-500/20 text-green-600",
//   };

//   const Icon = icons[type];

//   return Icon ? (
//     <div className={`p-1.5 rounded-full ${colors[type]}`}>
//       <Icon className="h-3 w-3" />
//     </div>
//   ) : null;
// };

// // ====================== PAGE CARD COMPONENT (WITH PROGRESS BAR) ======================
// const PageCard = ({
//   page,
//   darkMode,
//   onEdit,
//   onView,
//   onCreateVideo,
//   onCreateAudio,
//   onPreview,
//   onCreateQuiz,
//   onPlayQuiz,
//   user,
//   navigate,
//   chapterId,
//   chapterTitle,
//   subscriptionData,
// }) => {
//   const mainImage = page.media?.find((m) => m.type === "image");
//   const hasVideo = page.media?.some((m) => m.type === "video");
//   const hasAudio = page.media?.some((m) => m.type === "audio");
//   const locked = isPageLocked(page, user, subscriptionData);
//   const lockedMessage = getLockedMessage(page, user, subscriptionData);
//   const isSubscribed = subscriptionData?.hasSubscription === true;
//   const previewPagesCount = subscriptionData?.previewPages || 1;
//   const isPreviewPage = page.pageNumber <= previewPagesCount;

//   // Handle Learn button click
//   const handleLearnClick = () => {
//     handleLockedAction({
//       locked,
//       navigate,
//       chapterId,
//       onAllowed: onView,
//       page,
//       chapterTitle,
//       actionType: "page_lock",
//       subscriptionData,
//     });
//   };

//   // Handle Quiz button click
//   const handleQuizClick = () => {
//     handleLockedAction({
//       locked,
//       navigate,
//       onAllowed: onPlayQuiz,
//       page,
//       chapterTitle,
//       chapterId,
//       actionType: "quiz_lock",
//       subscriptionData,
//     });
//   };

//   return (
//     <div
//       className={`group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border relative ${
//         darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
//       } ${locked ? "opacity-90" : ""} ${
//         isPreviewPage && !isSubscribed && !locked
//           ? "ring-2 ring-green-500/50"
//           : ""
//       }`}
//     >
//       {/* LOCK OVERLAY (for premium pages) */}
//       {locked && (
//         <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6 rounded-2xl">
//           <div className="text-center mb-4">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border-2 border-purple-500/30 mb-3">
//               <Crown className="h-8 w-8 text-purple-400" />
//             </div>
//             <h3 className="text-white font-bold text-xl mb-2">
//               Premium Content
//             </h3>
//             <p className="text-gray-300 text-sm mb-4">
//               This is page {page.pageNumber} • Preview available for first{" "}
//               {previewPagesCount} pages
//             </p>
//           </div>

//           <button
//             onClick={() =>
//               navigate("/studentDetails/subscription", {
//                 state: {
//                   chapterId,
//                   chapterTitle,
//                   returnTo: window.location.pathname,
//                 },
//               })
//             }
//             className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
//           >
//             <Sparkles className="h-4 w-4" />
//             Upgrade to Premium
//             <ChevronRight className="h-4 w-4" />
//           </button>

//           <p className="text-gray-400 text-xs mt-4 text-center">
//             🆓 First {previewPagesCount} page{previewPagesCount > 1 ? "s" : ""}{" "}
//             free • 🔒 Pages {previewPagesCount + 1}+ require Premium
//           </p>
//         </div>
//       )}

//       {/* Image Section */}
//       <div className="relative h-48 rounded-t-2xl overflow-hidden">
//         {mainImage ? (
//           <img
//             src={mainImage.url}
//             alt={page.pageTitle}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//           />
//         ) : (
//           <div
//             className={`w-full h-full flex items-center justify-center ${
//               darkMode
//                 ? "bg-gray-700"
//                 : "bg-gradient-to-br from-blue-50 to-indigo-50"
//             }`}
//           >
//             <ImageIcon
//               className={`h-16 w-16 ${darkMode ? "text-gray-600" : "text-blue-300"}`}
//             />
//           </div>
//         )}

//         {/* Overlay Badges */}
//         <div className="absolute top-4 left-4 flex flex-col gap-2">
//           <AccessBadge
//             locked={locked}
//             darkMode={darkMode}
//             subscriptionData={subscriptionData}
//           />

//           {/* Free preview badge */}
//           {isPreviewPage && !isSubscribed && !locked && (
//             <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full border border-green-500/30 flex items-center gap-1">
//               <Gift className="h-3 w-3" />
//               Free Preview
//             </span>
//           )}
//         </div>

//         {/* Media Type Indicators */}
//         <div className="absolute top-4 right-4 flex gap-2">
//           {hasVideo && (
//             <MediaIndicator type="video" locked={locked} darkMode={darkMode} />
//           )}
//           {hasAudio && (
//             <MediaIndicator type="audio" locked={locked} darkMode={darkMode} />
//           )}
//           {page.hasQuiz && (
//             <MediaIndicator type="quiz" locked={locked} darkMode={darkMode} />
//           )}
//         </div>

//         {/* Access Indicator */}
//         <div className="absolute bottom-4 left-4">
//           <span
//             className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${
//               locked
//                 ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-300 border border-amber-500/30"
//                 : isSubscribed
//                   ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-300 border border-purple-500/30"
//                   : "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-300 border border-green-500/30"
//             }`}
//           >
//             {locked ? (
//               <Lock className="h-3 w-3" />
//             ) : (
//               <Unlock className="h-3 w-3" />
//             )}
//             {lockedMessage}
//           </span>
//         </div>

//         {/* Hover Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
//           <button
//             onClick={handleLearnClick}
//             className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
//               locked
//                 ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
//                 : "bg-white/90 text-gray-800 hover:bg-white"
//             }`}
//           >
//             {locked ? "🔓 Unlock with Premium" : "Start Learning"}
//           </button>
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="p-6">
//         <div className="flex items-start justify-between gap-2 mb-3">
//           <h3
//             className={`text-lg font-bold line-clamp-2 ${
//               darkMode ? "text-white" : "text-gray-800"
//             } ${locked ? "opacity-75" : ""}`}
//           >
//             {locked && "🔒 "}
//             {page.pageTitle}
//           </h3>
//           {page.isCompleted && !locked && (
//             <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
//           )}
//         </div>

//         {page.description && (
//           <p
//             className={`text-sm mb-4 line-clamp-2 ${
//               darkMode ? "text-gray-300" : "text-gray-600"
//             } ${locked ? "opacity-60" : ""}`}
//           >
//             {page.description}
//           </p>
//         )}

//         {/* INDIVIDUAL PAGE PROGRESS BAR */}
//         {!locked && <PageProgress page={page} darkMode={darkMode} />}

//         {/* Action Buttons */}
//         <div className="flex flex-wrap gap-2 mt-4">
//           {/* LEARN BUTTON */}
//           <button
//             onClick={handleLearnClick}
//             className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all ${
//               locked
//                 ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
//                 : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
//             }`}
//           >
//             {locked ? (
//               <>
//                 <Sparkles className="h-4 w-4" />
//                 <span>Upgrade</span>
//               </>
//             ) : (
//               <>
//                 <PlayCircle className="h-4 w-4" />
//                 <span>Learn</span>
//               </>
//             )}
//           </button>

//           {/* QUIZ BUTTON */}
//           <button
//             onClick={handleQuizClick}
//             disabled={user?.user?.role !== "student" || locked}
//             className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all ${
//               user?.user?.role !== "student" || locked
//                 ? "bg-gradient-to-r from-gray-600 to-gray-700 text-gray-400 cursor-not-allowed"
//                 : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
//             }`}
//           >
//             <Brain className="h-4 w-4" />
//             <span>Quiz</span>
//           </button>
//         </div>

//         {/* Access Info Footer */}
//         <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between text-xs">
//             <span
//               className={`font-medium flex items-center gap-1 ${
//                 locked
//                   ? "text-amber-500"
//                   : isSubscribed
//                     ? "text-purple-500"
//                     : "text-green-500"
//               }`}
//             >
//               {locked ? (
//                 <>
//                   <Lock className="h-3 w-3" />
//                   Premium Required
//                 </>
//               ) : isSubscribed ? (
//                 <>
//                   <Crown className="h-3 w-3" />
//                   Premium Access
//                 </>
//               ) : (
//                 <>
//                   <Unlock className="h-3 w-3" />
//                   Free Preview
//                 </>
//               )}
//             </span>
//             {locked && !isSubscribed && (
//               <button
//                 onClick={() => navigate("/studentDetails/subscription")}
//                 className="text-blue-500 hover:text-blue-400 hover:underline flex items-center gap-1"
//               >
//                 View Plans
//                 <ChevronRight className="h-3 w-3" />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ====================== MAIN COMPONENT ======================
// const ChapterRelatedPageDisplayStudent = () => {
//   const { id: ChapterId } = useParams();
//   console.log("chapterId", ChapterId);
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   // State management
//   const [searchQuery, setSearchQuery] = useState("");
//   const [darkMode, setDarkMode] = useState(false);

//   // API call
//   const {
//     data: responseData,
//     isLoading,
//     refetch,
//     error,
//   } = useGetChapterByIdQuery(ChapterId);

//   console.log("responseData", responseData);
//   const {
//     data: progressData,
//     isLoading: isProgressLoading,
//     refetch: isProgressRefetch,
//     error: isProgressError,
//   } = useGetChapterByPageIdQuery(ChapterId);
//   console.log("progressData", progressData);
//   // Data extraction - with REAL subscription data from API
//   const chapterData = responseData?.data?.chapter || null;
//   const pages = responseData?.data?.pages || [];
//   const subjectInfo = responseData?.data?.subject || {};

//   // IMPORTANT: Extract REAL subscription data from API response
//   const subscriptionData = responseData?.data?.subscription || {
//     hasSubscription: false,
//     locked: true,
//     previewPages: 1,
//     totalPages: pages.length,
//   };

//   // Refetch on mount
//   useEffect(() => {
//     refetch();
//   }, [refetch]);
//   console.log("subscriptionData", subscriptionData);
//   console.log("user", user?.user.role);

//   // User status
//   const isPaidUser = subscriptionData?.hasSubscription === true;
//   const isTeacher = user?.primaryStudents !== "primaryStudent";
//   const isStudent = user?.user.role === "student";

//   // Filter pages based on search query
//   const filteredPages = searchQuery
//     ? pages.filter(
//         (page) =>
//           page?.pageTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           page?.description
//             ?.toLowerCase()
//             .includes(searchQuery.toLowerCase()) ||
//           page?.pageNumber?.toString().includes(searchQuery),
//       )
//     : pages;

//   // Get preview pages count from subscription data
//   const previewPagesCount = subscriptionData?.previewPages || 1;

//   // Calculate free vs premium pages based on REAL preview pages
//   const freePages = pages.filter(
//     (p) => p.pageNumber <= previewPagesCount,
//   ).length;
//   const premiumPages = pages.filter(
//     (p) => p.pageNumber > previewPagesCount,
//   ).length;

//   // Navigation handlers (keep your existing handlers)
//   const handleCreatePage = () => {
//     if (chapterData?._id) {
//       navigate(`/teacherDetails/teacherCreateCourseForm/${chapterData._id}`);
//     }
//   };

//   const handleCreateMathPage = () => {
//     if (chapterData?._id) {
//       navigate(
//         `/teacherDetails/eachChapterChunkContentCreate/create/${chapterData._id}`,
//       );
//     }
//   };

//   const handleEditChapter = () => {
//     if (chapterData?._id) {
//       navigate(`/teacherDetails/chapters/edit/${chapterData._id}`);
//     }
//   };

//   const handleViewAllPages = () => {
//     if (chapterData?._id) {
//       navigate(`/teacherDetails/ChapterRelatedpages/${chapterData._id}`);
//     }
//   };

//   const handleCreateQuiz = () => {
//     if (chapterData?._id) {
//       navigate(`/teacherDetails/eachChapterRelatedQuiz/${chapterData._id}`);
//     }
//   };

//   const handleTakeQuiz = () => {
//     if (chapterData?._id) {
//       navigate(`/studentDetails/playQuiz/${chapterData._id}`, {
//         state: {
//           chapterId: chapterData._id,
//         },
//       });
//     }
//   };

//   // Page action handlers
//   const handleEditPage = (pageId) => {
//     navigate(`/teacherDetails/chapterRelatedPageDisplay/edit/${pageId}`);
//   };

//   const handleViewPage = (pageId) => {
//     navigate(`/studentDetails/eachChapterStudy/watch/${pageId}`);
//   };

//   const handleCreateVideoForPage = (pageId) => {
//     navigate(`/teacherDetails/teacherCreateCourseForm/${pageId}`, {
//       state: { chapterId: chapterData?._id },
//     });
//   };

//   const handleCreateAudioForPage = (pageId) => {
//     navigate(`/teacherDetails/page/audio/create/${pageId}`, {
//       state: { chapterId: chapterData?._id },
//     });
//   };

//   const handlePreviewPage = (pageId) => {
//     navigate(`/teacherDetails/pages/view/${pageId}`);
//   };

//   const handleCreatePageQuiz = (pageId) => {
//     navigate(`/teacherDetails/eachChapterRelatedQuiz/${pageId}`, {
//       state: { chapterId: chapterData?._id },
//     });
//   };

//   const handlePlayPageQuiz = (pageId) => {
//     navigate(`/studentDetails/playQuiz/${pageId}`);
//   };

//   // Toggle dark mode
//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//     document.documentElement.classList.toggle("dark");
//   };

//   // Navigate to first free page
//   const goToFirstFreePage = () => {
//     const firstFreePage = pages.find((p) => p.pageNumber === 1);
//     if (firstFreePage) {
//       navigate(`/teacherDetails/eachChapterStudy/watch/${firstFreePage._id}`);
//     }
//   };

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
//         <div className="text-red-600 dark:text-red-400 mb-4 text-lg">
//           Failed to load chapter pages
//         </div>
//         <button
//           onClick={() => refetch()}
//           className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   // No chapter found
//   if (!chapterData) {
//     return (
//       <EmptyState
//         title="Chapter not found"
//         message="The requested chapter could not be found."
//         actionText="Back to Chapters"
//         onAction={() => navigate(-1)}
//         icon={
//           <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600" />
//         }
//       />
//     );
//   }

//   return (
//     <div
//       className={`min-h-screen transition-colors duration-300 ${
//         darkMode
//           ? "dark bg-gray-900 text-white"
//           : "bg-gradient-to-br from-gray-50 via-white to-blue-50/30 text-gray-900"
//       }`}
//     >
//       {/* Header Section */}
//       <div className="relative">
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />

//         <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
//             <div>
//               <div className="flex items-center gap-3 mb-3 flex-wrap">
//                 <div className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full shadow-lg">
//                   Chapter {chapterData.chapterNumber}
//                 </div>
//                 <span
//                   className={`px-3 py-1 text-sm font-medium rounded-full ${
//                     chapterData.isActive
//                       ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300"
//                       : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-800 dark:to-gray-700 dark:text-gray-300"
//                   }`}
//                 >
//                   {chapterData.isActive ? "Active" : "Draft"}
//                 </span>

//                 {/* Subscription Status Badge */}
//                 {subscriptionData?.hasSubscription ? (
//                   <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
//                     <Crown className="h-3 w-3" />
//                     Premium Member
//                   </span>
//                 ) : (
//                   <span className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
//                     <Gift className="h-3 w-3" />
//                     Free Preview ({previewPagesCount}{" "}
//                     {previewPagesCount === 1 ? "page" : "pages"})
//                   </span>
//                 )}
//               </div>

//               <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3">
//                 {chapterData.chapterTitle}
//               </h1>

//               <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
//                 {subjectInfo.subject} • {subjectInfo.standard}{" "}
//                 {subjectInfo.part ? `• Part ${subjectInfo.part}` : ""}
//               </p>
//             </div>

//             {/* Theme Toggle only - removed view controls */}
//             <button
//               onClick={toggleDarkMode}
//               className={`p-3 rounded-xl ${
//                 darkMode
//                   ? "bg-gray-800 text-yellow-400"
//                   : "bg-white text-gray-700 shadow-lg"
//               } hover:shadow-xl transition-all`}
//               title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
//             >
//               {darkMode ? (
//                 <Sun className="h-5 w-5" />
//               ) : (
//                 <Moon className="h-5 w-5" />
//               )}
//             </button>
//           </div>

//           {/* Stats Cards - Updated with REAL subscription data */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Total Pages
//                   </p>
//                   <p className="text-2xl font-bold text-gray-800 dark:text-white">
//                     {pages.length}
//                   </p>
//                 </div>
//                 <Layers className="h-8 w-8 text-blue-500" />
//               </div>
//             </div>

//             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Free Preview Pages
//                   </p>
//                   <p className="text-2xl font-bold text-gray-800 dark:text-white">
//                     {freePages}
//                   </p>
//                   <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
//                     <Gift className="h-3 w-3" />
//                     {previewPagesCount}{" "}
//                     {previewPagesCount === 1 ? "page" : "pages"} free
//                   </p>
//                 </div>
//                 <Target className="h-8 w-8 text-green-500" />
//               </div>
//             </div>

//             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Premium Pages
//                   </p>
//                   <p className="text-2xl font-bold text-gray-800 dark:text-white">
//                     {premiumPages}
//                   </p>
//                   <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
//                     <Lock className="h-3 w-3" />
//                     Pages {previewPagesCount + 1}+
//                   </p>
//                 </div>
//                 <Crown className="h-8 w-8 text-amber-500" />
//               </div>
//             </div>

//             <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Completed
//                   </p>
//                   <p className="text-2xl font-bold text-gray-800 dark:text-white">
//                     {pages.filter((p) => p.isCompleted).length}
//                   </p>
//                 </div>
//                 <CheckCircle className="h-8 w-8 text-green-500" />
//               </div>
//             </div>
//           </div>

//           {/* Subscription Status Message */}
//           {!isPaidUser && (
//             <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 mb-4 border border-blue-500/30">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-blue-500/20 rounded-full">
//                   <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm text-gray-700 dark:text-gray-300">
//                     <span className="font-bold">Free Preview Mode:</span> You
//                     can access the first {previewPagesCount}{" "}
//                     {previewPagesCount === 1 ? "page" : "pages"} for free.
//                     Upgrade to Premium to unlock all {pages.length} pages!
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => navigate("/studentDetails/subscription")}
//                   className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
//                 >
//                   <Sparkles className="h-4 w-4" />
//                   Upgrade Now
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 pb-12">
//         {/* LEARNING PROGRESS - NOW AT THE TOP */}
//         <LearningProgress
//           pages={pages}
//           subscriptionData={subscriptionData}
//           isPaidUser={isPaidUser}
//           isStudent={isStudent}
//           darkMode={darkMode}
//         />

//         {/* Upgrade Banner for Free Users - Enhanced with REAL data */}
//         {!isPaidUser && isStudent && pages.length > previewPagesCount && (
//           <div className="mb-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border-l-4 border-purple-500 rounded-2xl p-6">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
//                     <Crown className="h-5 w-5 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-gray-900 dark:text-white text-lg">
//                       Unlock Full Chapter Access
//                     </h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-300">
//                       First {previewPagesCount}{" "}
//                       {previewPagesCount === 1 ? "page is" : "pages are"} free!
//                       Upgrade to Premium for all {pages.length} pages
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-4 mt-2">
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     <span className="text-xs text-gray-600 dark:text-gray-400">
//                       {freePages} Free {freePages === 1 ? "Page" : "Pages"}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
//                     <span className="text-xs text-gray-600 dark:text-gray-400">
//                       {premiumPages} Premium{" "}
//                       {premiumPages === 1 ? "Page" : "Pages"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => navigate("/studentDetails/subscription")}
//                   className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
//                 >
//                   <Sparkles className="h-4 w-4" />
//                   Upgrade Now
//                 </button>

//                 <button
//                   onClick={goToFirstFreePage}
//                   className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-medium hover:bg-purple-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
//                 >
//                   <Gift className="h-4 w-4" />
//                   Try Free Page
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Top Action Bar */}
//         <div className="mb-8">
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               {/* Search Bar */}
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder={`Search ${pages.length} pages by title, description...`}
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-10 pr-4 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Pages Grid */}
//         {pages.length === 0 ? (
//           <EmptyState
//             title="No pages yet"
//             message="This chapter doesn't have any pages yet."
//             actionText="Create First Page"
//             onAction={handleCreatePage}
//             icon={
//               <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600" />
//             }
//           />
//         ) : filteredPages.length === 0 ? (
//           <EmptyState
//             title="No matching pages"
//             message={`No pages found matching "${searchQuery}"`}
//             actionText="Clear Search"
//             onAction={() => setSearchQuery("")}
//             icon={
//               <Search className="h-16 w-16 text-gray-400 dark:text-gray-600" />
//             }
//           />
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredPages.map((page) => (
//               <PageCard
//                 key={page._id}
//                 page={page}
//                 darkMode={darkMode}
//                 onEdit={() => handleEditPage(page._id)}
//                 onView={() => handleViewPage(page._id)}
//                 onCreateVideo={() => handleCreateVideoForPage(page._id)}
//                 onCreateAudio={() => handleCreateAudioForPage(page._id)}
//                 onPreview={() => handlePreviewPage(page._id)}
//                 onCreateQuiz={() => handleCreatePageQuiz(page._id)}
//                 onPlayQuiz={() => handlePlayPageQuiz(page._id)}
//                 user={user}
//                 navigate={navigate}
//                 chapterTitle={chapterData.chapterTitle}
//                 chapterId={ChapterId}
//                 subscriptionData={subscriptionData}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChapterRelatedPageDisplayStudent;
