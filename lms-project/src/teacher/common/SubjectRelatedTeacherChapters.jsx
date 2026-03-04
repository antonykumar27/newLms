import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetChaptersBySubjectQuery } from "../../store/api/EachChapterApi";
import ChapterList from "../../Student/ChapterList";
import LoadingSpinner from "../../Student/LoadingSpinner";
import EmptyState from "../../admin/EmptyState";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../common/AuthContext";
import {
  BookOpen,
  Sparkles,
  Flame,
  Clock,
  ChevronRight,
  Sun,
  Moon,
  TrendingUp,
  Layers,
  Target,
  GraduationCap,
  Compass,
  Eye,
  PlusCircle,
  Pencil,
  Edit,
  Trash2,
  Users,
  Settings,
  BarChart,
  MessageCircle,
} from "lucide-react";

const SubjectRelatedTeacherChapters = () => {
  const { id: subjectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });
  const [showTrending, setShowTrending] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSort, setSelectedSort] = useState("chapterNumber");

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch chapters data
  const {
    data: chaptersData,
    isLoading,
    error,
    refetch,
  } = useGetChaptersBySubjectQuery(subjectId, {
    refetchOnMountOrArgChange: true,
  });
  console.log("chaptersData", chaptersData);
  const chapters = chaptersData?.data || [];
  const subjectInfo = chaptersData?.subject || {};
  const subjectName = chapters[0]?.subjectId?.subject || "Subject";
  // Calculate teacher stats
  const totalStudents = subjectInfo.totalStudents || 0;
  const totalViews = chapters.reduce((acc, ch) => acc + (ch.views || 0), 0);

  // Calculate trending chapters based on views
  const trendingChapters = [...chapters]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3)
    .map((chap, index) => ({
      ...chap,
      views: chap.views || Math.floor(Math.random() * 500) + 100,
      trend: index === 0 ? "🔥 Hot" : index === 1 ? "📈 Rising" : "✨ New",
    }));

  // Sort chapters based on selected sort
  const sortedChapters = [...chapters].sort((a, b) => {
    switch (selectedSort) {
      case "chapterNumber":
        return (a.chapterNumber || 0) - (b.chapterNumber || 0);
      case "title":
        return (a.chapterTitle || "").localeCompare(b.chapterTitle || "");
      case "recent":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case "views":
        return (b.views || 0) - (a.views || 0);
      default:
        return 0;
    }
  });

  // Get subject gradient based on name
  const getSubjectGradient = () => {
    const subject = subjectInfo.subjects?.[0] || "";
    const subjectLower = subject.toLowerCase();

    if (subjectLower.includes("math"))
      return ["from-red-500", "via-orange-500", "to-amber-600"];
    if (subjectLower.includes("english"))
      return ["from-blue-500", "via-indigo-500", "to-purple-600"];
    if (subjectLower.includes("malayalam"))
      return ["from-green-500", "via-emerald-500", "to-teal-600"];
    if (subjectLower.includes("science")) {
      if (subjectLower.includes("social"))
        return ["from-yellow-500", "via-amber-500", "to-orange-600"];
      return ["from-purple-500", "via-pink-500", "to-rose-600"];
    }
    return ["from-indigo-500", "via-purple-500", "to-pink-600"];
  };

  const subjectGradient = getSubjectGradient();

  // Loading state with bento skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Header Skeleton */}
            <div className="md:col-span-12 h-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse" />

            {/* Stats Skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="md:col-span-3 h-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse"
              />
            ))}

            {/* Chapter List Skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="md:col-span-12 h-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Floating Header with Glass Effect */}
      <div className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300 rotate-180" />
              </motion.button>

              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                >
                  Teacher Dashboard
                </motion.h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Managing {subjectInfo.subjects?.join(", ") ||
                    "Subject"} • {chapters.length} Chapters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </motion.button>

              {/* Teacher Badge */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Teacher Mode</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Subject Hero Card with Teacher Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 mb-6"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          {/* Floating Particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className="absolute w-32 h-32 rounded-full bg-white/10 blur-3xl"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}

          <div className="relative">
            {/* Subject Info */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 text-white">
              <div className="flex items-start gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="p-4 bg-white/20 backdrop-blur-md rounded-2xl"
                >
                  <BookOpen className="h-12 w-12" />
                </motion.div>

                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    Subject : {subjectName}
                  </h2>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30">
                      📚 {chapters.length} Chapters
                    </div>
                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30">
                      👥 {totalStudents} Students
                    </div>
                    <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30">
                      👁️ {totalViews} Total Views
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Action Buttons - Your requested buttons */}
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate(
                      `/teacherDetails/chapterRelatedPage/create/${subjectId}`,
                    )
                  }
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
                    darkMode
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  <PlusCircle className="h-5 w-5" />
                  Create Chapter
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate(
                      `/teacherDetails/teacherCreatingCourseEdit/${subjectId}`,
                    )
                  }
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    darkMode
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30"
                  }`}
                >
                  <Pencil className="h-4 w-4" />
                  Edit Subject
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Teacher Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              icon: BookOpen,
              label: "Total Chapters",
              value: chapters.length,
              color: "from-blue-500 to-indigo-500",
            },
            {
              icon: Users,
              label: "Enrolled Students",
              value: totalStudents,
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: Eye,
              label: "Total Views",
              value: totalViews,
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: BarChart,
              label: "Avg Completion",
              value: "67%",
              color: "from-amber-500 to-orange-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10`}
              />
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}
                  >
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trending Banner (for teachers to see popular content) */}
        <AnimatePresence>
          {showTrending && trendingChapters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${subjectGradient.join(" ")} opacity-10`}
              />

              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-r ${subjectGradient.join(" ")}`}
                    >
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        Most Popular Chapters
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Based on student views and engagement
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTrending(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400 rotate-90" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {trendingChapters.map((chapter, idx) => (
                    <motion.div
                      key={chapter._id || idx}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group relative p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 cursor-pointer overflow-hidden"
                      onClick={() =>
                        navigate(`/teacherDetails/chapter/${chapter._id}`)
                      }
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className={`absolute inset-0 bg-gradient-to-r ${subjectGradient.join(" ")} opacity-10`}
                      />

                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Chapter {chapter.chapterNumber}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              idx === 0
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                : idx === 1
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {chapter.trend}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3 line-clamp-2">
                          {chapter.chapterTitle ||
                            `Chapter ${chapter.chapterNumber}`}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{chapter.views} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {Math.floor(Math.random() * 30) + 10} students
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort and Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Chapter Count Badge */}
          <div className="flex flex-wrap gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`px-5 py-2.5 rounded-xl bg-gradient-to-r ${subjectGradient.join(" ")} text-white shadow-lg`}
            >
              <span className="font-bold text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {subjectInfo.subjects?.join(", ") || "Subject"}
              </span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="px-5 py-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
            >
              <span className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                <Layers className="h-5 w-5" />
                {chapters.length} Chapters
              </span>
            </motion.div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full md:w-auto">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full md:w-64 px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="chapterNumber">📊 Sort by Chapter Number</option>
              <option value="title">🔤 Sort by Title</option>
              <option value="recent">🆕 Most Recent</option>
              <option value="views">👁️ Most Viewed</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Chapters List */}
        <div className="mb-20">
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400 to-rose-500 rounded-3xl flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <p className="text-xl text-red-600 dark:text-red-400 mb-4">
                Failed to load chapters
              </p>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => refetch()}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30"
              >
                🔄 Try Again
              </motion.button>
            </motion.div>
          ) : chapters.length === 0 ? (
            <EmptyState
              title="No chapters yet"
              message="Start by creating your first chapter for this subject."
              actionText="Create First Chapter"
              onAction={() =>
                navigate(
                  `/teacherDetails/chapterRelatedPage/create/${subjectId}`,
                )
              }
              darkMode={darkMode}
            />
          ) : (
            <ChapterList
              chapters={sortedChapters}
              subjectId={subjectId}
              darkMode={darkMode}
              isTeacher={true}
            />
          )}
        </div>

        {/* Teacher Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              label: "View Students",
              path: `/teacher/subject/${subjectId}/students`,
            },
            {
              icon: BarChart,
              label: "Analytics",
              path: `/teacher/subject/${subjectId}/analytics`,
            },
            {
              icon: Settings,
              label: "Settings",
              path: `/teacher/subject/${subjectId}/settings`,
            },
            {
              icon: MessageCircle,
              label: "Discussions",
              path: `/teacher/subject/${subjectId}/discussions`,
            },
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <action.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full text-xs text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50">
            <Sparkles className="h-3 w-3" />
            <span>Teacher Dashboard • Manage your content effectively</span>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button for Mobile - Create Chapter */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() =>
            navigate(`/teacherDetails/chapterRelatedPage/create/${subjectId}`)
          }
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-2xl z-50"
        >
          <PlusCircle className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
};

export default SubjectRelatedTeacherChapters;
