import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetStandardSubjectsQuery,
  useDeleteStandardSubjectMutation,
} from "../store/api/StandardSubjectApi";
import { toast } from "react-toastify";
import StandardSubjectForm from "./TeacherStandardSubjectForm";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  BookText,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Sun,
  Moon,
  Home,
  GraduationCap,
  BookMarked,
  Users,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Globe,
  Layers,
  Zap,
  Award,
  Target,
  Compass,
} from "lucide-react";

const TeacherTextbookManagement = () => {
  const navigate = useNavigate();

  // State management
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
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

  // Fetch data
  const { data, isLoading } = useGetStandardSubjectsQuery();
  const [deleteStandardSubject] = useDeleteStandardSubjectMutation();

  const handleDelete = async (id) => {
    try {
      await deleteStandardSubject(id).unwrap();
      toast.success("Textbook deleted successfully!");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error("Failed to delete textbook");
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    toast.success(editingId ? "Textbook updated!" : "Textbook created!");
  };

  // Loading state with bento skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Header Skeleton */}
            <div className="md:col-span-12 h-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse" />

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
                className="md:col-span-4 h-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const textbooks = data?.data || [];

  // Sort textbooks by standard and subject
  const sortedTextbooks = [...textbooks].sort(
    (a, b) => a.standard - b.standard || a.subject?.localeCompare(b.subject),
  );

  // Get unique values for bento sections
  const uniqueStandards = [
    ...new Set(textbooks.map((item) => item.standard)),
  ].sort();
  const uniqueSubjects = [
    ...new Set(textbooks.map((item) => item.subject)),
  ].sort();

  // Get color based on subject with mesh gradient combinations
  const getSubjectColors = (subject) => {
    const colors = {
      English: ["from-blue-400", "via-indigo-500", "to-purple-600"],
      Mathematics: ["from-red-400", "via-orange-500", "to-amber-600"],
      Science: ["from-emerald-400", "via-teal-500", "to-cyan-600"],
      "Social Science": ["from-purple-400", "via-pink-500", "to-rose-600"],
      Malayalam: ["from-amber-400", "via-yellow-500", "to-orange-600"],
      Hindi: ["from-rose-400", "via-red-500", "to-pink-600"],
      Arabic: ["from-cyan-400", "via-blue-500", "to-indigo-600"],
      Sanskrit: ["from-violet-400", "via-purple-500", "to-fuchsia-600"],
      default: ["from-gray-400", "via-slate-500", "to-zinc-600"],
    };
    return colors[subject] || colors.default;
  };

  // Bento Grid Textbook Card
  const BentoTextbookCard = ({ item, index }) => {
    const isExpanded = expandedCard === item._id;
    const imageUrl = item.media?.[0]?.url;
    const colors = getSubjectColors(item.subject);
    const [isHovered, setIsHovered] = useState(false);

    // Determine card size based on index for bento effect
    const isLarge = index % 5 === 0; // Every 5th card is large
    const isWide = index % 3 === 0; // Every 3rd card is wide

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4, scale: 1.02 }}
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
                ? `linear-gradient(135deg, ${colors[0].replace("from-", "")}80, ${colors[1].replace("via-", "")}80, ${colors[2].replace("to-", "")}80)`
                : `linear-gradient(135deg, ${colors[0].replace("from-", "")}40, ${colors[1].replace("via-", "")}40, ${colors[2].replace("to-", "")}40)`,
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
                    animate={{ opacity: 0.3, scale: 1 }}
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
            {/* Cover Image Section with Glass Overlay */}
            <div className="relative h-48 overflow-hidden">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={item.subject}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
                </>
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${colors.join(" ")} bg-opacity-80`}
                >
                  {/* Simple pattern overlay */}
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
                    Class {item.standard}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 bg-white/20 dark:bg-gray-900/50 backdrop-blur-md rounded-full border border-white/30 dark:border-gray-700/50"
                >
                  <span className="text-xs font-semibold text-white capitalize">
                    {item.medium}
                  </span>
                </motion.div>
              </div>

              {/* Part Badge if exists */}
              {item.part && (
                <div className="absolute top-4 right-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="px-3 py-1.5 bg-amber-500/80 backdrop-blur-md rounded-full border border-amber-300/50"
                  >
                    <span className="text-xs font-semibold text-white">
                      Part {item.part}
                    </span>
                  </motion.div>
                </div>
              )}

              {/* Quick Action FAB on Hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-4 right-4 flex gap-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/teacher/textbook/${item._id}`)}
                      className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Eye className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingId(item._id);
                        setShowForm(true);
                      }}
                      className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Edit2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {item.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setExpandedCard(isExpanded ? null : item._id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </motion.button>
              </div>

              {/* Creator Info with Glass Effect */}
              <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.createdBy?.fullName || item.createdBy?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Creator
                  </p>
                </div>
              </div>

              {/* Action Grid - Bento Style */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate(
                      `/teacherDetails/subjectRelatedTeacherCreatedChapters/${item._id}`,
                    )
                  }
                  className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 hover:from-green-500/20 hover:to-emerald-500/20 rounded-2xl border border-green-200/50 dark:border-green-800/50 transition-all"
                >
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Chapters
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate(`/teacherStudentDiscussion/${item._id}`)
                  }
                  className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 hover:from-purple-500/20 hover:to-pink-500/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 transition-all"
                >
                  <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Discuss
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(item._id)}
                  className="p-3 bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20 hover:from-red-500/20 hover:to-rose-500/20 rounded-2xl border border-red-200/50 dark:border-red-800/50 transition-all"
                >
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Delete
                  </span>
                </motion.button>
              </div>

              {/* Expandable Details with Glass Morphism */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl">
                          <Layers className="h-4 w-4 text-blue-500 mb-1" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Standard
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Class {item.standard}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl">
                          <Globe className="h-4 w-4 text-green-500 mb-1" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Medium
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                            {item.medium}
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/teacher/dashboard")}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Home className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </motion.button>

              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                >
                  Textbook Studio
                </motion.h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Curate your digital classroom
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle with Animation */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </motion.button>

              {/* Create Button with Floating Effect */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Create Textbook</span>
                <Zap className="h-4 w-4 opacity-70" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: BookOpen,
              label: "Total Textbooks",
              value: textbooks.length,
              color: "from-blue-500 to-indigo-500",
              delay: 0.1,
            },
            {
              icon: GraduationCap,
              label: "Classes",
              value: uniqueStandards.length,
              color: "from-purple-500 to-pink-500",
              delay: 0.2,
            },
            {
              icon: BookMarked,
              label: "Subjects",
              value: uniqueSubjects.length,
              color: "from-green-500 to-emerald-500",
              delay: 0.3,
            },
            {
              icon: MessageCircle,
              label: "Discussions",
              value: textbooks.length,
              color: "from-amber-500 to-orange-500",
              delay: 0.4,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50"
            >
              {/* Animated Gradient Background */}
              <motion.div
                animate={{
                  background: `linear-gradient(135deg, ${stat.color.split(" ")[0].replace("from-", "")}20, ${stat.color.split(" ")[1].replace("to-", "")}20)`,
                }}
                className="absolute inset-0"
              />

              <div className="relative p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} bg-opacity-10`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Pills - Minimal */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", ...uniqueStandards.map((s) => `Class ${s}`)].map(
            (filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200/50 dark:border-gray-700/50"
                }`}
              >
                {filter === "all" ? "All Textbooks" : filter}
              </motion.button>
            ),
          )}
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-min">
          {sortedTextbooks.length > 0 ? (
            sortedTextbooks.map((item, index) => (
              <BentoTextbookCard key={item._id} item={item} index={index} />
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
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center"
                >
                  <BookOpen className="h-12 w-12 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Your Studio is Empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Start creating your first textbook and bring your digital
                  classroom to life
                </p>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Textbook
                  <Compass className="h-5 w-5 opacity-70" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl z-50"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      {/* Form Modal with Glass Effect */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {editingId ? "Edit Textbook" : "Create New Textbook"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {editingId
                        ? "Update your textbook details"
                        : "Add a new masterpiece to your collection"}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>
              <div className="p-6">
                <StandardSubjectForm
                  standardSubjectId={editingId}
                  onSuccess={handleSuccess}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal with Glass Effect */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-3xl flex items-center justify-center"
                >
                  <Trash2 className="h-10 w-10 text-red-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Textbook?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This action cannot be undone. All associated content will be
                  permanently removed.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-medium shadow-lg shadow-red-500/30"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherTextbookManagement;
