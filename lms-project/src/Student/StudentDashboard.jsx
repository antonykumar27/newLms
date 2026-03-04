// src/components/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  User,
  LogOut,
  Calendar,
  Award,
  BarChart3,
  Clock,
  Home,
  Search,
  Filter,
  Bell,
  ArrowRight,
  GraduationCap,
  Play,
  List,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  MessageCircle,
  ChevronRight,
  Sun,
  Moon,
  Compass,
  Layers,
  Trophy,
  Flame,
  Brain,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetStandardSubjectsForStudentQuery } from "../store/api/StandardSubjectApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../common/AuthContext";

// Helper functions for subject UI
const getSubjectGradient = (subject) => {
  const subjectLower = subject.toLowerCase();

  if (subjectLower.includes("math"))
    return ["from-red-400", "via-orange-500", "to-amber-600"];
  if (subjectLower.includes("english"))
    return ["from-blue-400", "via-indigo-500", "to-purple-600"];
  if (subjectLower.includes("malayalam"))
    return ["from-green-400", "via-emerald-500", "to-teal-600"];
  if (subjectLower.includes("science")) {
    if (subjectLower.includes("social"))
      return ["from-yellow-400", "via-amber-500", "to-orange-600"];
    if (subjectLower.includes("computer"))
      return ["from-indigo-400", "via-purple-500", "to-pink-600"];
    return ["from-purple-400", "via-pink-500", "to-rose-600"];
  }
  if (subjectLower.includes("physics"))
    return ["from-indigo-400", "via-blue-500", "to-cyan-600"];
  if (subjectLower.includes("chemistry"))
    return ["from-pink-400", "via-rose-500", "to-red-600"];
  if (subjectLower.includes("biology"))
    return ["from-emerald-400", "via-green-500", "to-teal-600"];
  if (subjectLower.includes("social"))
    return ["from-yellow-400", "via-amber-500", "to-orange-600"];
  if (subjectLower.includes("history"))
    return ["from-amber-400", "via-yellow-500", "to-orange-600"];
  if (subjectLower.includes("geography"))
    return ["from-cyan-400", "via-blue-500", "to-indigo-600"];
  if (subjectLower.includes("hindi"))
    return ["from-orange-400", "via-amber-500", "to-yellow-600"];
  if (subjectLower.includes("arabic"))
    return ["from-teal-400", "via-cyan-500", "to-blue-600"];
  if (subjectLower.includes("sanskrit"))
    return ["from-violet-400", "via-purple-500", "to-fuchsia-600"];
  if (subjectLower.includes("computer"))
    return ["from-indigo-400", "via-purple-500", "to-pink-600"];

  return ["from-gray-400", "via-slate-500", "to-zinc-600"];
};

const getSubjectIcon = (subject) => {
  const subjectLower = subject.toLowerCase();

  if (subjectLower.includes("math")) return "➗";
  if (subjectLower.includes("english")) return "🇬🇧";
  if (subjectLower.includes("malayalam")) return "📚";
  if (subjectLower.includes("science")) {
    if (subjectLower.includes("social")) return "🗺️";
    if (subjectLower.includes("computer")) return "💻";
    return "🔬";
  }
  if (subjectLower.includes("physics")) return "⚛️";
  if (subjectLower.includes("chemistry")) return "🧪";
  if (subjectLower.includes("biology")) return "🧬";
  if (subjectLower.includes("social")) return "🗺️";
  if (subjectLower.includes("history")) return "🏛️";
  if (subjectLower.includes("geography")) return "🌍";
  if (subjectLower.includes("hindi")) return "🪔";
  if (subjectLower.includes("arabic")) return "🕌";
  if (subjectLower.includes("sanskrit")) return "📜";
  if (subjectLower.includes("computer")) return "💻";

  return "📘";
};

const StudentDashboard = ({ student, onLogout }) => {
  const { user } = useAuth();
  const std = user?.user?.standard;

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [selectedStandard, setSelectedStandard] = useState(std || "");
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });
  const [expandedCard, setExpandedCard] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

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

  // Fetch subjects from API
  const {
    data: subjectsData,
    isLoading: isLoadingSubjects,
    isError: isSubjectsError,
    refetch: refetchSubjects,
  } = useGetStandardSubjectsForStudentQuery();

  // Process subjects from API
  const subjects =
    subjectsData?.data
      ?.filter((item) => Number(item.standard) === Number(selectedStandard))
      .map((item) => ({
        id: item._id,
        code: `${item.subject.slice(0, 2).toUpperCase()}${item.part}`,
        name: `${item.subject}`,
        subject: item.subject,
        part: item.part,
        gradient: getSubjectGradient(item.subject),
        icon: getSubjectIcon(item.subject),
        chapters: item.chapters || 0,
        standard: item.standard,
        medium: item.medium || "english",
        fullData: item,
      })) || [];

  // Calculate available standards from API data
  const availableStandards = [
    ...new Set(subjectsData?.data?.map((item) => item.standard) || []),
  ].sort((a, b) => a - b);

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubjectClick = (subject) => {
    navigate(`/studentDetails/subjectRelatedChapters/${subject.id}`);
    setSelectedSubject(subject);
  };

  const handleChatWithStudentsClick = (subject) => {
    navigate(`/teacherStudentDiscussion/${subject.id}`, {
      state: { subject },
    });
  };

  const handleDiscusionClick = (subject) => {
    navigate(`/studentDetails/playQuiz/${subject.id}`, {
      state: { subjectId: subject },
    });
  };

  const handleStandardChange = (standard) => {
    setSelectedStandard(standard);
    setSearchTerm("");
  };

  // Calculate student stats
  const totalSubjects = subjects.length;
  const completedSubjects = student?.completedSubjects?.length || 0;
  const progressPercentage =
    totalSubjects > 0
      ? Math.round((completedSubjects / totalSubjects) * 100)
      : 0;

  // Loading state with bento skeleton
  if (isLoadingSubjects) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Header Skeleton */}
            <div className="md:col-span-12 h-32 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse" />

            {/* Stats Skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="md:col-span-3 h-32 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse"
              />
            ))}

            {/* Main Content Skeletons */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="md:col-span-4 h-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state with glass morphism
  if (isSubjectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 text-center max-w-md border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400 to-rose-500 rounded-3xl flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Failed to Load Subjects
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to fetch your subjects. Please try again.
          </p>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={refetchSubjects}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium shadow-lg shadow-red-500/30"
          >
            Retry Loading
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Bento Grid Subject Card
  const BentoSubjectCard = ({ subject, index }) => {
    const isExpanded = expandedCard === subject.id;
    const [isHovered, setIsHovered] = useState(false);
    const isCompleted = student?.completedSubjects?.includes(subject.id);
    const progress = student?.progress?.[subject.id] || 0;

    // Get cover image
    const coverImageUrl = subject?.fullData?.media?.[0]?.url;

    // Determine card size based on index for bento effect
    const isLarge = index % 5 === 0;
    const isWide = index % 3 === 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`group relative ${
          isLarge
            ? "md:col-span-2 md:row-span-2"
            : isWide
              ? "md:col-span-2"
              : "md:col-span-1"
        }`}
      >
        {/* Glass Card Container */}
        <div className="relative h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden transition-all duration-500">
          {/* Animated Mesh Gradient Background */}
          <motion.div
            animate={{
              background: isHovered
                ? `linear-gradient(135deg, ${subject.gradient[0].replace("from-", "")}80, ${subject.gradient[1].replace("via-", "")}80, ${subject.gradient[2].replace("to-", "")}80)`
                : `linear-gradient(135deg, ${subject.gradient[0].replace("from-", "")}40, ${subject.gradient[1].replace("via-", "")}40, ${subject.gradient[2].replace("to-", "")}40)`,
            }}
            className="absolute inset-0 transition-opacity duration-700"
          />

          {/* Floating Particles Effect */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.2, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-white/20 to-transparent blur-3xl"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Content Container */}
          <div className="relative h-full flex flex-col">
            {/* Cover Image Section */}
            <div className="relative h-56 overflow-hidden">
              {coverImageUrl ? (
                <>
                  <img
                    src={coverImageUrl}
                    alt={subject.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
                </>
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${subject.gradient.join(" ")} bg-opacity-80 flex items-center justify-center`}
                >
                  <span className="text-6xl">{subject.icon}</span>
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                        backgroundSize: "20px 20px",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 bg-white/20 dark:bg-gray-900/50 backdrop-blur-md rounded-full border border-white/30 dark:border-gray-700/50"
                >
                  <span className="text-xs font-semibold text-white">
                    Class {subject.standard}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 bg-white/20 dark:bg-gray-900/50 backdrop-blur-md rounded-full border border-white/30 dark:border-gray-700/50"
                >
                  <span className="text-xs font-semibold text-white capitalize">
                    {subject.medium}
                  </span>
                </motion.div>
              </div>

              {/* Progress Ring */}
              <div className="absolute top-4 right-4">
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      className="text-white/30"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 20 * (1 - progress / 100)
                      }`}
                      className="text-white"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Completed Badge */}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-4 left-4"
                >
                  <div className="px-3 py-1.5 bg-green-500/80 backdrop-blur-md rounded-full border border-green-300/50 flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-white" />
                    <span className="text-xs font-semibold text-white">
                      Completed
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {subject.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                      {subject.code}
                    </span>
                    {subject.part && (
                      <span className="text-gray-500 dark:text-gray-400">
                        Part {subject.part}
                      </span>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setExpandedCard(isExpanded ? null : subject.id)
                  }
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                >
                  <ChevronRight
                    className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </motion.button>
              </div>

              {/* Chapter Info */}
              <div className="flex items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  <span>{subject.chapters} chapters</span>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubjectClick(subject)}
                  className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1"
                >
                  <Play className="h-4 w-4" />
                  Learn
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChatWithStudentsClick(subject)}
                  className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-green-500/30 flex items-center justify-center gap-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  Doubts
                </motion.button>
              </div>

              {/* Exam Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDiscusionClick(subject)}
                className="w-full p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1"
              >
                <Brain className="h-4 w-4" />
                Take Chapter Exam
              </motion.button>

              {/* Expandable Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg">
                          <p className="text-gray-500 dark:text-gray-400">
                            Progress
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {progress}% Complete
                          </p>
                        </div>
                        <div className="p-2 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg">
                          <p className="text-gray-500 dark:text-gray-400">
                            Lessons
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {subject.lessons || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Floating Header with Glass Effect */}
      <div className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl"
              >
                <BookOpen className="h-6 w-6 text-white" />
              </motion.div>

              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                >
                  Learning Portal
                </motion.h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Standard {selectedStandard} • {student?.name}
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

              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all relative"
              >
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
              </motion.button>

              {/* User Menu */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {student?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Roll: {student?.rollNumber}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Welcome Banner with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 mb-8"
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

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center text-white">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2"
              >
                Welcome back, {student?.name}!
                <Rocket className="h-6 w-6" />
              </motion.h1>
              <p className="text-indigo-100 mb-4">
                You're studying in Standard {selectedStandard}. Continue your
                learning journey.
              </p>
              <div className="flex flex-wrap gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30"
                >
                  {subjects.length} Subjects Available
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30"
                >
                  {completedSubjects} Completed
                </motion.div>
              </div>
            </div>

            {/* Standard Selector */}
            {availableStandards.length > 1 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="mt-4 md:mt-0 relative"
              >
                <select
                  value={selectedStandard}
                  onChange={(e) =>
                    handleStandardChange(parseInt(e.target.value))
                  }
                  className="appearance-none bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 pr-10 text-white text-sm focus:ring-2 focus:ring-white/50 focus:border-transparent"
                >
                  {availableStandards.map((standard) => (
                    <option
                      key={standard}
                      value={standard}
                      className="text-gray-900"
                    >
                      Standard {standard}
                    </option>
                  ))}
                </select>
                <GraduationCap className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Target,
              label: "Overall Progress",
              value: `${progressPercentage}%`,
              subValue: `${completedSubjects}/${totalSubjects} subjects`,
              color: "from-green-500 to-emerald-500",
              delay: 0.1,
            },
            {
              icon: Flame,
              label: "Active Streak",
              value: "7 days",
              subValue: "Personal best: 12",
              color: "from-orange-500 to-red-500",
              delay: 0.2,
            },
            {
              icon: Clock,
              label: "Time Spent",
              value: "42 hrs",
              subValue: "This week: 8 hrs",
              color: "from-blue-500 to-cyan-500",
              delay: 0.3,
            },
            {
              icon: Trophy,
              label: "Achievements",
              value: "12",
              subValue: "3 new this month",
              color: "from-yellow-500 to-amber-500",
              delay: 0.4,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
            >
              {/* Animated Gradient Background */}
              <motion.div
                animate={{
                  background: `linear-gradient(135deg, ${stat.color.split(" ")[0].replace("from-", "")}20, ${stat.color.split(" ")[1].replace("to-", "")}20)`,
                }}
                className="absolute inset-0"
              />

              <div className="relative p-4">
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
                  >
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {stat.subValue}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {["all", "in-progress", "completed"].map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50"
                }`}
              >
                {filter === "all"
                  ? "All Subjects"
                  : filter === "in-progress"
                    ? "In Progress"
                    : "Completed"}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bento Grid Layout for Subjects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-min">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject, index) => (
              <BentoSubjectCard
                key={subject.id}
                subject={subject}
                index={index}
              />
            ))
          ) : (
            // Empty State with Glass Effect
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-3 text-center py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl flex items-center justify-center"
                >
                  <Search className="h-12 w-12 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {searchTerm
                    ? "No matching subjects"
                    : "No subjects available"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {searchTerm
                    ? `No subjects found matching "${searchTerm}"`
                    : `No subjects available for Standard ${selectedStandard}`}
                </p>

                {searchTerm && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSearchTerm("")}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                  >
                    Clear Search
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions Bento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              icon: Calendar,
              label: "Schedule",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: BookOpen,
              label: "Assignments",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: Award,
              label: "Grades",
              color: "from-yellow-500 to-amber-500",
            },
            {
              icon: BarChart3,
              label: "Practice Test",
              color: "from-purple-500 to-pink-500",
            },
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-10`}
              >
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {action.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer Info with Glass Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full text-xs text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50">
            <Sparkles className="h-3 w-3" />
            <span>
              Real-time subjects loaded from server • Updated automatically
            </span>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl z-50"
        >
          <Compass className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
};

export default StudentDashboard;
// // src/components/StudentDashboard.jsx
// import React, { useState, useEffect } from "react";
// import {
//   BookOpen,
//   User,
//   LogOut,
//   Calendar,
//   Award,
//   BarChart3,
//   Clock,
//   Home,
//   Search,
//   Filter,
//   Bell,
//   ArrowRight,
//   GraduationCap,
//   Play,
//   List,
// } from "lucide-react";

// import { useGetStandardSubjectsForStudentQuery } from "../store/api/StandardSubjectApi";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../common/AuthContext"; // Import useAuth hook

// // Helper functions for subject UI
// const getSubjectColor = (subject) => {
//   const subjectLower = subject.toLowerCase();

//   if (subjectLower.includes("math")) return "bg-red-500";
//   if (subjectLower.includes("english")) return "bg-blue-500";
//   if (subjectLower.includes("malayalam")) return "bg-green-500";
//   if (subjectLower.includes("science")) {
//     if (subjectLower.includes("social")) return "bg-yellow-500";
//     if (subjectLower.includes("computer")) return "bg-indigo-500";
//     return "bg-purple-500";
//   }
//   if (subjectLower.includes("physics")) return "bg-indigo-500";
//   if (subjectLower.includes("chemistry")) return "bg-pink-500";
//   if (subjectLower.includes("biology")) return "bg-emerald-500";
//   if (subjectLower.includes("social")) return "bg-yellow-500";
//   if (subjectLower.includes("history") || subjectLower.includes("geography"))
//     return "bg-amber-500";
//   if (subjectLower.includes("hindi")) return "bg-orange-500";
//   if (subjectLower.includes("arabic")) return "bg-teal-500";
//   if (subjectLower.includes("sanskrit")) return "bg-violet-500";
//   if (subjectLower.includes("computer")) return "bg-indigo-500";

//   return "bg-gray-500";
// };

// const getSubjectIcon = (subject) => {
//   const subjectLower = subject.toLowerCase();

//   if (subjectLower.includes("math")) return "➗";
//   if (subjectLower.includes("english")) return "🇬🇧";
//   if (subjectLower.includes("malayalam")) return "📚";
//   if (subjectLower.includes("science")) {
//     if (subjectLower.includes("social")) return "🗺️";
//     if (subjectLower.includes("computer")) return "💻";
//     return "🔬";
//   }
//   if (subjectLower.includes("physics")) return "⚛️";
//   if (subjectLower.includes("chemistry")) return "🧪";
//   if (subjectLower.includes("biology")) return "🧬";
//   if (subjectLower.includes("social")) return "🗺️";
//   if (subjectLower.includes("history")) return "🏛️";
//   if (subjectLower.includes("geography")) return "🌍";
//   if (subjectLower.includes("hindi")) return "🪔";
//   if (subjectLower.includes("arabic")) return "🕌";
//   if (subjectLower.includes("sanskrit")) return "📜";
//   if (subjectLower.includes("computer")) return "💻";

//   return "📘";
// };

// const StudentDashboard = ({ student, onLogout }) => {
//   const { user } = useAuth();
//   const std = user?.user?.standard;

//   console.log("StudentDashboard std:", std);
//   console.log("StudentDashboard", user?.user);
//   const [selectedSubject, setSelectedSubject] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();
//   const [selectedStandard, setSelectedStandard] = useState(std || "");
//   console.log("selectedStandard", selectedStandard);
//   console.log("student", student);
//   // Fetch subjects from API
//   const {
//     data: subjectsData,
//     isLoading: isLoadingSubjects,
//     isError: isSubjectsError,
//     refetch: refetchSubjects,
//   } = useGetStandardSubjectsForStudentQuery();

//   console.log("Subjects API Data:", subjectsData);

//   // Process subjects from API
//   const subjects =
//     subjectsData?.data
//       ?.filter((item) => Number(item.standard) === Number(selectedStandard))
//       .map((item) => ({
//         id: item._id,
//         code: `${item.subject.slice(0, 2).toUpperCase()}${item.part}`,
//         name: `${item.subject}`,
//         subject: item.subject,
//         part: item.part,
//         color: getSubjectColor(item.subject),
//         icon: getSubjectIcon(item.subject),
//         chapters: item.chapters || 0,
//         standard: item.standard,
//         medium: item.medium || "english",
//         fullData: item,
//       })) || [];
//   console.log("Available subjects:", subjects);

//   // Calculate available standards from API data
//   const availableStandards = [
//     ...new Set(subjectsData?.data?.map((item) => item.standard) || []),
//   ].sort((a, b) => a - b);

//   console.log("Available standards:", availableStandards);

//   // Filter subjects based on search
//   const filteredSubjects = subjects.filter(
//     (subject) =>
//       subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   const handleSubjectClick = (subject) => {
//     navigate(`/studentDetails/subjectRelatedChapters/${subject.id}`);
//     setSelectedSubject(subject);
//   };

//   const handleChatWithStudentsClick = (subject) => {
//     navigate(`/teacherStudentDiscussion/${subject.id}`, {
//       state: {
//         subject, // full object
//       },
//     });
//   };
//   const handleDiscusionClick = (subject) => {
//     navigate(`/studentDetails/playQuiz/${subject.id}`, {
//       state: {
//         subjectId: subject, // full object
//       },
//     });
//   };

//   const handleStandardChange = (standard) => {
//     setSelectedStandard(standard);
//     setSearchTerm(""); // Clear search when standard changes
//   };

//   // Calculate student stats
//   const totalSubjects = subjects.length;
//   const completedSubjects = student?.completedSubjects?.length || 0;
//   const progressPercentage =
//     totalSubjects > 0
//       ? Math.round((completedSubjects / totalSubjects) * 100)
//       : 0;

//   // Loading state
//   if (isLoadingSubjects) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-6"></div>
//         <p className="text-gray-600 text-lg font-medium">
//           Loading your subjects...
//         </p>
//         <p className="text-gray-500">Fetching data from the server</p>
//       </div>
//     );
//   }

//   // Error state
//   if (isSubjectsError) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
//         <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
//           <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
//             <BookOpen className="w-6 h-6 text-red-500" />
//           </div>
//           <h2 className="text-xl font-bold text-gray-800 mb-2">
//             Failed to Load Subjects
//           </h2>
//           <p className="text-gray-600 mb-6">
//             Unable to fetch your subjects. Please try again.
//           </p>
//           <button
//             onClick={refetchSubjects}
//             className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//           >
//             Retry Loading
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
//       {/* Top Navigation */}
//       <nav className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <BookOpen className="w-8 h-8 text-indigo-600" />
//               <div className="ml-3">
//                 <h1 className="text-xl font-semibold text-gray-800">
//                   Learning Portal
//                 </h1>
//                 <p className="text-sm text-gray-500">
//                   Standard {student?.standard}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               {/* Standard Selector Dropdown */}
//               {availableStandards.length > 1 && (
//                 <div className="relative">
//                   <select
//                     value={selectedStandard}
//                     onChange={(e) =>
//                       handleStandardChange(parseInt(e.target.value))
//                     }
//                     className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   >
//                     {availableStandards.map((standard) => (
//                       <option key={standard} value={standard}>
//                         Standard {standard}
//                       </option>
//                     ))}
//                   </select>
//                   <GraduationCap className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                 </div>
//               )}

//               <button className="p-2 hover:bg-gray-100 rounded-lg relative">
//                 <Bell className="w-5 h-5 text-gray-600" />
//                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//               </button>

//               <div className="flex items-center space-x-3">
//                 <div className="text-right hidden md:block">
//                   <p className="text-sm font-medium text-gray-800">
//                     {student?.name}
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     Roll: {student?.rollNumber}
//                   </p>
//                 </div>
//                 <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
//                   <User className="w-5 h-5 text-indigo-600" />
//                 </div>
//                 <button
//                   onClick={onLogout}
//                   className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   <span className="hidden md:inline">Logout</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Welcome Section */}
//         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold mb-2">
//                 Welcome back, {student?.name}!
//               </h1>
//               <p className="text-indigo-100">
//                 You're studying in Standard {selectedStandard}. Continue your
//                 learning journey.
//               </p>
//               <div className="mt-4 flex items-center gap-2">
//                 <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
//                   {subjects.length} Subjects Available
//                 </span>
//                 <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
//                   {student?.completedSubjects?.length || 0} Completed
//                 </span>
//               </div>
//             </div>
//             <div className="mt-4 md:mt-0 flex items-center gap-4">
//               <div className="text-center">
//                 <div className="text-3xl font-bold">{completedSubjects}</div>
//                 <div className="text-sm text-indigo-200">
//                   Subjects Completed
//                 </div>
//               </div>
//               <div className="text-center">
//                 <div className="text-3xl font-bold">{totalSubjects}</div>
//                 <div className="text-sm text-indigo-200">Total Subjects</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white p-5 rounded-xl shadow border">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Overall Progress</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   {progressPercentage}%
//                 </p>
//               </div>
//               <BarChart3 className="w-10 h-10 text-green-500" />
//             </div>
//             <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-green-500 h-2 rounded-full"
//                 style={{ width: `${progressPercentage}%` }}
//               />
//             </div>
//           </div>

//           <div className="bg-white p-5 rounded-xl shadow border">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Active Streak</p>
//                 <p className="text-2xl font-bold text-gray-800">7 days</p>
//               </div>
//               <Calendar className="w-10 h-10 text-blue-500" />
//             </div>
//           </div>

//           <div className="bg-white p-5 rounded-xl shadow border">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Time Spent</p>
//                 <p className="text-2xl font-bold text-gray-800">42 hrs</p>
//               </div>
//               <Clock className="w-10 h-10 text-purple-500" />
//             </div>
//           </div>

//           <div className="bg-white p-5 rounded-xl shadow border">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Achievements</p>
//                 <p className="text-2xl font-bold text-gray-800">12</p>
//               </div>
//               <Award className="w-10 h-10 text-yellow-500" />
//             </div>
//           </div>
//         </div>

//         {/* Subjects Section */}
//         <div className="bg-white rounded-2xl shadow border overflow-hidden">
//           {/* Subjects Header */}
//           <div className="border-b p-6">
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">
//                   Your Subjects - Standard {selectedStandard}
//                 </h2>
//                 <p className="text-gray-600">
//                   {subjects.length} subjects available in your curriculum
//                 </p>
//               </div>

//               <div className="flex items-center gap-3 w-full md:w-auto">
//                 <div className="relative flex-1 md:flex-none">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search subjects..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                 </div>
//                 <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
//                   <Filter className="w-4 h-4" />
//                   Filter
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Subjects Grid */}
//           <div className="p-6">
//             {filteredSubjects.length === 0 ? (
//               <div className="text-center py-12">
//                 {searchTerm ? (
//                   <>
//                     <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-gray-500">
//                       No subjects found matching "{searchTerm}"
//                     </p>
//                     <button
//                       onClick={() => setSearchTerm("")}
//                       className="mt-2 text-indigo-600 hover:text-indigo-800"
//                     >
//                       Clear search
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-gray-500">
//                       No subjects available for Standard {selectedStandard}
//                     </p>
//                     {availableStandards.length > 1 && (
//                       <button
//                         onClick={() =>
//                           handleStandardChange(availableStandards[0])
//                         }
//                         className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                       >
//                         View Standard {availableStandards[0]} Subjects
//                       </button>
//                     )}
//                   </>
//                 )}
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
//                 {filteredSubjects.map((subject) => {
//                   const isCompleted = student?.completedSubjects?.includes(
//                     subject.id,
//                   );
//                   const progress = student?.progress?.[subject.id] || 0;

//                   // Extract cover image from API data
//                   const getCoverImage = () => {
//                     if (
//                       subject?.fullData?.media &&
//                       subject.fullData.media.length > 0
//                     ) {
//                       const media = subject.fullData.media[0];
//                       if (media.type === "image" && media.url) {
//                         return media.url;
//                       }
//                     }
//                     return null;
//                   };

//                   const coverImageUrl = getCoverImage();

//                   return (
//                     <div
//                       key={subject.id}
//                       className="group bg-white border rounded-2xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-2 flex flex-col"
//                     >
//                       {/* Textbook Cover Image */}
//                       {/* Textbook Cover Image */}
//                       <div className="relative h-72 w-full bg-gray-100 flex items-center justify-center">
//                         {coverImageUrl ? (
//                           <img
//                             src={coverImageUrl}
//                             alt={`${subject.name} Textbook Cover`}
//                             className="max-h-full max-w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
//                             onError={(e) => {
//                               e.target.src = `https://via.placeholder.com/300x420/ffffff/333333?text=${encodeURIComponent(
//                                 subject.name,
//                               )}`;
//                             }}
//                           />
//                         ) : (
//                           <div
//                             className={`w-full h-full ${subject.color} flex items-center justify-center`}
//                           >
//                             <span className="text-4xl text-white">
//                               {subject.icon}
//                             </span>
//                           </div>
//                         )}

//                         {/* Progress Ring */}
//                         <div className="absolute top-4 right-4">
//                           <div className="relative w-10 h-10">
//                             <svg className="w-full h-full transform -rotate-90">
//                               <circle
//                                 cx="20"
//                                 cy="20"
//                                 r="15"
//                                 stroke="currentColor"
//                                 strokeWidth="3"
//                                 fill="transparent"
//                                 className="text-white/30"
//                               />
//                               <circle
//                                 cx="20"
//                                 cy="20"
//                                 r="15"
//                                 stroke="currentColor"
//                                 strokeWidth="3"
//                                 fill="transparent"
//                                 strokeDasharray={`${2 * Math.PI * 15}`}
//                                 strokeDashoffset={`${
//                                   2 * Math.PI * 15 * (1 - progress / 100)
//                                 }`}
//                                 className="text-white"
//                                 strokeLinecap="round"
//                               />
//                             </svg>
//                             <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
//                               {progress}%
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Subject Details */}
//                       <div className="p-5 flex-1 flex flex-col">
//                         <div className="mb-3">
//                           <div className="flex items-center justify-between mb-2">
//                             <span className="text-sm font-medium text-gray-500">
//                               Standard {subject.standard}
//                             </span>
//                             {isCompleted && (
//                               <Award className="w-4 h-4 text-yellow-500" />
//                             )}
//                           </div>

//                           <h3 className="font-bold text-gray-800 text-lg mb-1">
//                             {subject.name}
//                           </h3>

//                           <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <span className="px-2 py-1 bg-gray-100 rounded">
//                               {subject.code}
//                             </span>
//                             <span className="capitalize">{subject.medium}</span>
//                           </div>
//                         </div>

//                         {/* 📚 CHAPTERS COUNT */}
//                         <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
//                           <BookOpen className="w-4 h-4 text-gray-400" />
//                           <span>{subject.chapters} chapters</span>
//                           <span className="text-gray-300">•</span>
//                           <span>{subject.lessons || 0} lessons</span>
//                         </div>

//                         {/* 🔥 TWO ACTION BUTTONS */}
//                         <div className="mt-auto pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-3">
//                           {/* BUTTON 1: Open Subject */}
//                           <button
//                             onClick={() => handleSubjectClick(subject)}
//                             className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors group/btn"
//                           >
//                             <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
//                             <span className="font-medium">Start Learning</span>
//                           </button>

//                           {/* BUTTON 2: View Chapters */}
//                           <button
//                             onClick={() => handleChatWithStudentsClick(subject)}
//                             className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors group/btn"
//                           >
//                             <List className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
//                             <span className="font-medium">Ask Doubts</span>
//                           </button>
//                         </div>
//                         <div className="mt-auto pt-4 border-t grid grid-cols-1 gap-3">
//                           <button
//                             onClick={() => handleDiscusionClick(subject)}
//                             className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors group/btn"
//                           >
//                             <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
//                             <span className="font-medium">
//                               Start Full Chapter Exam
//                             </span>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Quick Actions */}
//           <div className="border-t p-6 bg-gray-50">
//             <h3 className="font-semibold text-gray-700 mb-4">Quick Actions</h3>
//             <div className="flex flex-wrap gap-3">
//               <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2">
//                 <Calendar className="w-4 h-4" />
//                 View Today's Schedule
//               </button>
//               <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2">
//                 <BookOpen className="w-4 h-4" />
//                 Check Assignments
//               </button>
//               <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2">
//                 <Award className="w-4 h-4" />
//                 View Grades
//               </button>
//               <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
//                 <BarChart3 className="w-4 h-4" />
//                 Take Practice Test
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Footer Info */}
//         <div className="mt-8 text-center text-gray-500 text-sm">
//           <p>
//             📚 Real-time subjects loaded from server • Updated automatically
//           </p>
//           <p className="mt-1">
//             Contact your teacher if you notice any missing subjects
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentDashboard;
