import React, { useState, useEffect } from "react";
import { useGetChapterByIdQuery } from "../../store/api/MathsLessonApi";
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
  List,
  Moon,
  Sun,
  ChevronRight,
  Trophy,
  Target,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import LoadingSpinner from "../../Student/LoadingSpinner";
import EmptyState from "../../admin/EmptyState";
import { useAuth } from "../../common/AuthContext";

// ====================== REUSABLE HELPERS ======================
// Access control helper functions
const isPageLocked = (page, user) => {
  // If user is paid (any tier except free), they can access everything
  if (user?.tier !== "free") {
    return false;
  }
  // Free users: Page 1 is free, others are locked
  return page.pageNumber > 1;
};
console.log("isPageLockedisPageLocked");
console.log("isPageLocked", isPageLocked);
const getLockedMessage = (page, user) => {
  if (user?.tier === "free") {
    if (page.pageNumber === 1) {
      return "Free Access";
    }
    return `Page ${page.pageNumber > 1 ? "2+" : page.pageNumber} requires Premium`;
  }
  return "Full Access";
};

// Reusable locked action handler
const handleLockedAction = ({
  locked,
  navigate,
  onAllowed,
  page,
  chapterTitle,
  actionType = "page_lock",
}) => {
  if (locked) {
    navigate("/subscription", {
      state: {
        from: actionType,
        pageNumber: page.pageNumber,
        pageTitle: page.pageTitle,
        chapterTitle: chapterTitle || "Untitled Chapter",
        action: actionType,
      },
    });
  } else {
    onAllowed();
  }
};

// ====================== BADGE COMPONENTS ======================
const AccessBadge = ({ locked, darkMode }) => (
  <span
    className={`px-3 py-1 text-sm font-bold rounded-full shadow-lg ${
      locked
        ? "bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white"
        : darkMode
          ? "bg-gray-900/80 text-white"
          : "bg-white/90 text-gray-800"
    }`}
  >
    {locked ? "🔒 Premium" : "🆓 Free"}
  </span>
);

const PageNumberBadge = ({ pageNumber, darkMode }) => (
  <span
    className={`px-2 py-0.5 text-xs font-bold rounded ${
      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
    }`}
  >
    Page {pageNumber}
  </span>
);

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

// ====================== PAGE CARD COMPONENT ======================
const PageCard = ({
  page,
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
  chapterTitle,
  handleCreateQuiz,
}) => {
  const mainImage = page.media?.find((m) => m.type === "image");
  const hasVideo = page.media?.some((m) => m.type === "video");
  const hasAudio = page.media?.some((m) => m.type === "audio");
  const locked = isPageLocked(page, user);
  const lockedMessage = getLockedMessage(page, user);
  const isPaidUser = user?.tier !== "free";

  // Handle Learn button click
  const handleLearnClick = () => {
    handleLockedAction({
      locked,
      navigate,
      onAllowed: onView,
      page,
      chapterTitle,
      actionType: "page_lock",
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
      actionType: "quiz_lock",
    });
  };

  return (
    <div
      className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border relative ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } ${locked ? "opacity-90" : ""}`}
    >
      {/* LOCK OVERLAY (for premium pages) */}
      {locked && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border-2 border-purple-500/30 mb-3">
              <AlertCircle className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">
              Premium Content
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              This page requires Premium subscription
            </p>
          </div>

          <button
            onClick={() => navigate("/subscription")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Premium
            <ChevronRight className="h-4 w-4" />
          </button>

          <p className="text-gray-400 text-xs mt-4 text-center">
            🆓 Page 1 is free | 🔒 Pages 2+ require Premium
          </p>
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
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
          <AccessBadge locked={locked} darkMode={darkMode} />

          {/* Free badge for page 1 */}
          {page.pageNumber === 1 && user?.tier === "free" && (
            <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full border border-green-500/30">
              🆓 Free Access
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
            className={`px-2 py-1 text-xs font-medium rounded ${
              locked
                ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-300 border border-amber-500/30"
                : "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-300 border border-green-500/30"
            }`}
          >
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
          {page.isCompleted && !locked && (
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* LEARN BUTTON */}
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
                <Eye className="h-4 w-4" />
                <span>Learn</span>
              </>
            )}
          </button>

          {/* QUIZ BUTTON */}
          <button
            onClick={handleCreateQuiz}
            className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all ${"bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"}`}
          >
            <Brain className="h-4 w-4" />
            <span>Quiz</span>
          </button>

          {/* Teacher-only buttons (always visible for teachers) */}
          {user?.primaryStudents !== "primaryStudent" && (
            <>
              <button
                onClick={onEdit}
                className="flex-1 min-w-[120px] px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 font-medium text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>

              <button
                onClick={onCreateVideo}
                className="flex-1 min-w-[120px] px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all"
              >
                <Video className="h-4 w-4" />
                <span>Video</span>
              </button>
            </>
          )}

          {/* Student-only buttons (only for accessible pages) */}
          {user?.primaryStudents === "primaryStudent" && !locked && (
            <>
              <button
                onClick={onPreview}
                className="flex-1 min-w-[120px] px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 font-medium text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => {
                  /* Add to favorites */
                }}
                className="flex-1 min-w-[120px] px-3 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 font-medium text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition-all"
              >
                <Bookmark className="h-4 w-4" />
                <span>Save</span>
              </button>
            </>
          )}
        </div>

        {/* Access Info Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-medium ${locked ? "text-amber-500" : "text-green-500"}`}
            >
              {locked ? "🔒 Premium Required" : "✅ Access Granted"}
            </span>
            {locked && user?.tier === "free" && (
              <button
                onClick={() => navigate("/subscription")}
                className="text-blue-500 hover:text-blue-400 hover:underline"
              >
                View Plans →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================== PAGE LIST ITEM COMPONENT ======================
const PageListItem = ({
  page,
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
  chapterTitle,
}) => {
  const mainImage = page.media?.find((m) => m.type === "image");
  const locked = isPageLocked(page, user);
  const lockedMessage = getLockedMessage(page, user);
  const isPaidUser = user?.tier !== "free";

  const handleLearnClick = () => {
    handleLockedAction({
      locked,
      navigate,
      onAllowed: onView,
      page,
      chapterTitle,
      actionType: "page_lock",
    });
  };

  return (
    <div
      className={`rounded-2xl p-4 relative ${
        darkMode ? "bg-gray-800 hover:bg-gray-750" : "bg-white hover:bg-gray-50"
      } shadow hover:shadow-lg transition-all ${locked ? "border-l-4 border-amber-500" : ""}`}
    >
      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-transparent backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
          <div className="text-center p-4">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-white font-bold">Premium Content</p>
            <button
              onClick={() => navigate("/subscription")}
              className="mt-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={page.pageTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <FileText
                className={`h-8 w-8 ${darkMode ? "text-gray-600" : "text-gray-400"}`}
              />
            </div>
          )}

          {/* Lock badge on thumbnail */}
          {locked && (
            <div className="absolute top-1 right-1">
              <div className="p-1 bg-gradient-to-r from-amber-500/80 to-orange-500/80 rounded-full">
                <AlertCircle className="h-3 w-3 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <PageNumberBadge pageNumber={page.pageNumber} darkMode={darkMode} />
            <h3
              className={`font-bold truncate ${
                darkMode ? "text-white" : "text-gray-800"
              } ${locked ? "opacity-75" : ""}`}
            >
              {locked && "🔒 "}
              {page.pageTitle}
            </h3>
          </div>

          {page.description && (
            <p
              className={`text-sm truncate ${
                darkMode ? "text-gray-400" : "text-gray-600"
              } mb-3 ${locked ? "opacity-60" : ""}`}
            >
              {page.description}
            </p>
          )}

          {/* Access Info */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-medium ${locked ? "text-amber-500" : "text-green-500"}`}
            >
              {lockedMessage}
            </span>
            {locked && user?.tier === "free" && (
              <button
                onClick={() => navigate("/subscription")}
                className="text-xs text-blue-500 hover:underline"
              >
                Unlock →
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleLearnClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                locked
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              {locked ? (
                <Sparkles className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
              <span>{locked ? "Upgrade" : "Learn"}</span>
            </button>

            {/* Add other buttons similarly */}
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================== MAIN COMPONENT ======================
const ChapterRelatedPageDisplay = () => {
  const { id: ChapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedTags, setSelectedTags] = useState([]);

  // API call
  const {
    data: responseData,
    isLoading,
    refetch,
    error,
  } = useGetChapterByIdQuery(ChapterId);

  // Data extraction
  const chapterData = responseData?.data?.chapter || null;
  const pages = responseData?.data?.pages || [];
  const subjectInfo = responseData?.data?.subject || {};

  // Refetch on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // User status
  const isPaidUser = user?.tier !== "free";
  const isTeacher = user?.primaryStudents !== "primaryStudent";
  const isStudent = user?.primaryStudents === "primaryStudent";

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

  const handleCreateQuiz = (pageId) => {
    if (chapterData?._id) {
      navigate(`/teacherDetails/eachChapterRelatedQuiz/${chapterData._id}`, {
        state: { pageId: pageId },
      });
    }
  };

  const handleTakeQuiz = () => {
    if (chapterData?._id) {
      navigate(`/teacherDetails/eachChapterRelatedQuiz/${chapterData._id}`);
    }
  };

  // Page action handlers
  const handleEditPage = (pageId) => {
    navigate(`/teacherDetails/chapterRelatedPageDisplay/edit/${pageId}`);
  };

  const handleViewPage = (pageId) => {
    navigate(`/teacherDetails/eachChapterStudy/watch/${pageId}`);
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
    navigate(`/teacherDetails/playQuiz/${pageId}`);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Calculate free vs premium pages
  const freePages = pages.filter((p) => p.pageNumber === 1).length;
  const premiumPages = pages.filter((p) => p.pageNumber > 1).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-red-600 dark:text-red-400 mb-4 text-lg">
          Failed to load chapter pages
        </div>
        <button
          onClick={() => window.location.reload()}
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />

        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
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
              </div>

              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3">
                {chapterData.chapterTitle}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
                {subjectInfo.subject} • {subjectInfo.standard}{" "}
                {subjectInfo.part ? `• Part ${subjectInfo.part}` : ""}
              </p>
            </div>

            {/* Theme Toggle and View Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-xl ${
                  darkMode
                    ? "bg-gray-800 text-yellow-400"
                    : "bg-white text-gray-700 shadow-lg"
                } hover:shadow-xl transition-all`}
                title={
                  darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  title="List View"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
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
                    Free Pages
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {freePages}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    🆓 Page 1 is free
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
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    🔒 Pages 2+ are premium
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Quizzes
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {pages.filter((p) => p.hasQuiz).length}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Upgrade Banner for Free Users */}
        {!isPaidUser && isStudent && pages.length > 1 && (
          <div className="mb-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border-l-4 border-purple-500 rounded-2xl p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Unlock Full Chapter Access
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Page 1 is free! Upgrade to Premium for all {pages.length}{" "}
                      pages
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/subscription")}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                >
                  🚀 Upgrade Now
                </button>

                <button
                  onClick={() => {
                    // Navigate to free page (page 1)
                    const freePage = pages.find((p) => p.pageNumber === 1);
                    if (freePage) {
                      navigate(
                        `/teacherDetails/eachChapterStudy/watch/${freePage._id}`,
                      );
                    }
                  }}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-purple-500 text-purple-600 dark:text-purple-400 rounded-xl font-medium hover:bg-purple-50 dark:hover:bg-gray-700 transition-all"
                >
                  👉 Start with Free Page
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
                    placeholder="Search pages by title, description, or number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Teacher Actions - Only show for teachers */}
              {isTeacher && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCreatePage}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Video className="h-4 w-4" />
                    <span>Add Video</span>
                  </button>

                  <button
                    onClick={handleCreateMathPage}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Add Content</span>
                  </button>

                  <button
                    onClick={handleEditChapter}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Chapter</span>
                  </button>
                </div>
              )}

              {/* Student Actions - Only show for students */}
            </div>

            {/* Additional Filters */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Filter by:
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "With Images",
                  "With Videos",
                  "With Quiz",
                  "Recent",
                  "Trending",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pages Grid/List */}
        {pages.length === 0 ? (
          <EmptyState
            title="No pages yet"
            message="This chapter doesn't have any pages yet. Start by creating the first page."
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
        ) : viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <PageCard
                key={page._id}
                page={page}
                darkMode={darkMode}
                onEdit={() => handleEditPage(page._id)}
                onView={() => handleViewPage(page._id)}
                onCreateVideo={() => handleCreateVideoForPage(page._id)}
                onCreateAudio={() => handleCreateAudioForPage(page._id)}
                onPreview={() => handlePreviewPage(page._id)}
                onCreateQuiz={() => handleCreatePageQuiz(page._id)}
                onPlayQuiz={() => handlePlayPageQuiz(page._id)}
                user={user}
                handleCreateQuiz={() => handleCreateQuiz(page._id)}
                navigate={navigate}
                chapterTitle={chapterData.chapterTitle}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPages.map((page) => (
              <PageListItem
                key={page._id}
                page={page}
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
              />
            ))}
          </div>
        )}

        {/* Progress Section for Students */}
        {isStudent && pages.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Progress</h2>
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>25%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-1/4"></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">3/{pages.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Pages Completed
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterRelatedPageDisplay;
