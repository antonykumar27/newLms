import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenIcon,
  ClockIcon,
  PencilIcon,
  ArrowRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  StarIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { Brain } from "lucide-react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../common/AuthContext";

const ChapterCard = ({ chapter, index }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const coverImage = chapter.media?.find((m) => m.type === "image")?.url;
  const readingTime = chapter.totalPages
    ? Math.ceil(chapter.totalPages * 1.5)
    : "N/A";

  const handleManagePages = () => {
    const role = user?.user?.role || user?.role;
    const basePath = role === "student" ? "studentDetails" : "teacherDetails";
    navigate(`/${basePath}/chapterRelatedPageDisplay/${chapter._id}`);
  };

  // Beautiful gradient combinations for each chapter
  const gradients = [
    {
      light: "from-indigo-100 via-purple-100 to-pink-100",
      dark: "dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40",
    },
    {
      light: "from-emerald-100 via-teal-100 to-cyan-100",
      dark: "dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40",
    },
    {
      light: "from-amber-100 via-orange-100 to-rose-100",
      dark: "dark:from-amber-950/40 dark:via-orange-950/40 dark:to-rose-950/40",
    },
    {
      light: "from-blue-100 via-indigo-100 to-violet-100",
      dark: "dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40",
    },
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{
        y: -8,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className="group relative h-full"
    >
      {/* Ambient background glow - theme aware */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 blur-xl transition-all duration-500" />

      {/* Main card */}
      <div className="relative h-full bg-white dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700/80 shadow-2xl dark:shadow-none overflow-hidden transition-all duration-300 group-hover:border-indigo-200 dark:group-hover:border-indigo-800/50">
        {/* Header Image Section */}
        <div className="relative h-64 m-3 overflow-hidden rounded-[2rem]">
          {/* Gradient background when no image */}
          {!coverImage && (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradient.light} ${gradient.dark} transition-opacity duration-500`}
            />
          )}

          {/* Cover Image */}
          {coverImage ? (
            <>
              <motion.img
                src={coverImage}
                alt={chapter.chapterTitle}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6 }}
              />
              {/* Elegant overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent dark:from-slate-900/90 dark:via-slate-900/40 dark:to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <SparklesIcon className="h-16 w-16 text-indigo-400/30 dark:text-indigo-500/20" />
                <AcademicCapIcon className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-500/50 dark:text-indigo-400/40" />
              </div>
            </div>
          )}

          {/* Floating Badges - Enhanced glassmorphism */}
          <div className="absolute top-4 inset-x-4 flex justify-between items-start">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-2xl"
            >
              Chapter {chapter.chapterNumber}
            </motion.span>

            {/* Live/Draft indicator with animation */}
            <motion.div
              animate={{
                scale: chapter.isActive ? [1, 1.1, 1] : 1,
              }}
              transition={{
                repeat: chapter.isActive ? Infinity : 0,
                duration: 2,
              }}
              className={`px-4 py-2 rounded-2xl backdrop-blur-xl flex items-center gap-2 border ${
                chapter.isActive
                  ? "bg-emerald-500/90 dark:bg-emerald-600/90 border-emerald-200/50 dark:border-emerald-500/30"
                  : "bg-amber-500/90 dark:bg-amber-600/90 border-amber-200/50 dark:border-amber-500/30"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${chapter.isActive ? "bg-white animate-pulse" : "bg-white/90"}`}
              />
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                {chapter.isActive ? "Live" : "Draft"}
              </span>
            </motion.div>
          </div>

          {/* Difficulty/Level indicator */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1">
            {[1, 2, 3].map((star) => (
              <StarIconSolid
                key={star}
                className={`h-4 w-4 ${
                  star <= (chapter.difficulty || 2)
                    ? "text-amber-400 dark:text-amber-500"
                    : "text-slate-300 dark:text-slate-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 pt-5">
          {/* Title with theme-aware gradient */}
          <h3 className="text-2xl font-black mb-3 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-indigo-400 dark:group-hover:to-purple-400 transition-all duration-500 line-clamp-2">
              {chapter.chapterTitle}
            </span>
          </h3>

          {/* Description with improved readability */}
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6 font-medium">
            {chapter.description || (
              <span className="italic text-slate-400 dark:text-slate-500">
                ✦ Embark on a journey through this comprehensive chapter
              </span>
            )}
          </p>

          {/* Stats Grid - Elegant card style */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <ClockIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Duration
                </span>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {readingTime}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                mins
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <BookOpenIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Pages
                </span>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {chapter.totalPages || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                total
              </span>
            </div>
          </div>

          {/* Instructor info - subtle */}
          <div className="flex items-center gap-2 mb-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <span>Curated by</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {chapter.createdBy?.name || "Instructor"}
            </span>
          </div>

          {/* Action Buttons - Premium design */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleManagePages}
              className="flex-1 group/btn relative overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 opacity-100 group-hover/btn:opacity-90 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2 py-4 text-white font-bold text-sm">
                Start Learning
                <ChevronDoubleRightIcon className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            {user?.user?.role !== "student" && (
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  navigate(
                    `/teacherDetails/teacherCreatingCourseEdit/${chapter._id}`,
                  )
                }
                className="p-4 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all duration-300 border border-slate-200 dark:border-slate-700"
              >
                <PencilIcon className="h-5 w-5" />
              </motion.button>
            )}

            {user?.user?.role === "student" && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    navigate(`/studentDetails/playQuiz/${chapter._id}`, {
                      state: {
                        chapterId: chapter._id,
                      },
                    })
                  }
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Brain className="h-4 w-4" />
                  <span>Attend Exam</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const ChapterList = ({ chapters, subjectId, isLoading = false }) => {
  const navigate = useNavigate();

  // Beautiful loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 lg:p-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[2.5rem] blur-xl animate-pulse" />
            <div className="relative h-[520px] bg-white dark:bg-slate-900/90 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/80 dark:via-slate-800/80 to-transparent animate-shimmer" />
              <div className="h-64 m-3 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
              <div className="p-6 space-y-4">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Beautiful empty state with theme-aware design
  if (!chapters?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-center justify-center py-32 px-6"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />

        {/* Animated circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute w-72 h-72 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute w-96 h-96 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-3xl animate-pulse animation-delay-1000" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative text-center">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ repeat: Infinity, duration: 6 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur-2xl opacity-50" />
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] shadow-2xl">
                <AcademicCapIcon className="h-16 w-16 text-white" />
              </div>
            </div>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              No Chapters Yet
            </span>
          </h2>

          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mb-10 font-medium">
            Your curriculum is waiting to come alive. Create your first chapter
            and begin the journey.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              navigate(`/quizOverview/chapters/create/${subjectId}`)
            }
            className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-600/30 dark:shadow-indigo-500/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center gap-3">
              <SparklesIcon className="h-6 w-6" />
              CREATE FIRST CHAPTER
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Chapter Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {chapters.map((chapter, index) => (
              <ChapterCard key={chapter._id} chapter={chapter} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

// Add to global CSS
const styles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  .animation-delay-1000 {
    animation-delay: 1s;
  }
`;

export default ChapterList;
