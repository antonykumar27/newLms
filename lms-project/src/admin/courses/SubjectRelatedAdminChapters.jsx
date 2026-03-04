import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetStandardSubjectsForAdminQuery,
  useDeleteStandardSubjectMutation,
} from "../../store/api/StandardSubjectApi";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Grid,
  List,
  BookText,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Sun,
  Moon,
  Search,
  Filter,
  Home,
  GraduationCap,
  BookMarked,
  Users,
  MessageCircle,
  Settings,
  FileText,
  Video,
} from "lucide-react";

const SubjectRelatedAdminChapters = () => {
  const navigate = useNavigate();
  // const {id: }
  // State management
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStandard, setFilterStandard] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

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
  const { data, isLoading } = useGetStandardSubjectsForAdminQuery();

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-16 w-16 bg-blue-200 dark:bg-blue-900/30 rounded-2xl mb-4"></div>
              <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const textbooks = data?.data || [];

  // Filter textbooks
  let filteredTextbooks = [...textbooks];

  // Apply search filter
  if (searchQuery) {
    filteredTextbooks = filteredTextbooks.filter(
      (item) =>
        item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.standard?.toString().includes(searchQuery) ||
        item.medium?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  // Apply standard filter
  if (filterStandard !== "all") {
    filteredTextbooks = filteredTextbooks.filter(
      (item) => item.standard?.toString() === filterStandard,
    );
  }

  // Apply subject filter
  if (filterSubject !== "all") {
    filteredTextbooks = filteredTextbooks.filter(
      (item) => item.subject === filterSubject,
    );
  }

  // Sort textbooks
  const sortedTextbooks = filteredTextbooks.sort(
    (a, b) => a.standard - b.standard || a.subject?.localeCompare(b.subject),
  );

  // Get unique values for filters
  const uniqueStandards = [
    ...new Set(textbooks.map((item) => item.standard)),
  ].sort();
  const uniqueSubjects = [
    ...new Set(textbooks.map((item) => item.subject)),
  ].sort();

  // Get color based on subject
  const getSubjectColor = (subject) => {
    const colors = {
      English: "from-blue-500 to-indigo-600",
      Mathematics: "from-red-500 to-orange-600",
      Science: "from-green-500 to-emerald-600",
      "Social Science": "from-purple-500 to-pink-600",
      Malayalam: "from-amber-500 to-yellow-600",
      Hindi: "from-rose-500 to-pink-600",
      Arabic: "from-teal-500 to-cyan-600",
      Sanskrit: "from-violet-500 to-purple-600",
      default: "from-gray-600 to-gray-800",
    };
    return colors[subject] || colors.default;
  };

  // Mobile textbook card with all teacher actions
  const MobileTextbookCard = ({ item }) => {
    const isExpanded = expandedCard === item._id;
    const imageUrl = item.media?.[0]?.url;
    const gradientColor = getSubjectColor(item.subject);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-4"
      >
        {/* Card Header */}
        <div
          className={`relative h-44 bg-gradient-to-r ${gradientColor}`}
          onClick={() => setExpandedCard(isExpanded ? null : item._id)}
        >
          {imageUrl && (
            <>
              <img
                src={imageUrl}
                alt={item.subject}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </>
          )}

          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
                Class {item.standard}
              </span>
              <span className="px-2 py-1 bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium text-white capitalize">
                {item.medium}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white drop-shadow-lg">
              {item.subject}
            </h2>
          </div>

          <button className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-white" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white" />
            )}
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            {item.part && (
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium">
                Part {item.part}
              </span>
            )}
          </div>

          {/* Teacher Action Buttons - All visible */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button
              onClick={() => navigate(`/teacher/textbook/${item._id}`)}
              className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors flex flex-col items-center"
              title="View Textbook"
            >
              <Eye className="h-4 w-4 mb-1" />
              <span className="text-xs">View</span>
            </button>

            <button
              onClick={() => navigate(`/teacher/textbook/${item._id}/chapters`)}
              className="p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/50 text-green-700 dark:text-green-300 rounded-lg transition-colors flex flex-col items-center"
              title="Manage Chapters"
            >
              <BookOpen className="h-4 w-4 mb-1" />
              <span className="text-xs">Chapters</span>
            </button>

            <button
              onClick={() =>
                navigate(`/teacher/textbook/${item._id}/discussion`)
              }
              className="p-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg transition-colors flex flex-col items-center"
              title="Discussion Forum"
            >
              <MessageCircle className="h-4 w-4 mb-1" />
              <span className="text-xs">Discuss</span>
            </button>

            <button
              onClick={() => {
                setEditingId(item._id);
                setShowForm(true);
              }}
              className="p-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300 rounded-lg transition-colors flex flex-col items-center"
              title="Edit Textbook"
            >
              <Edit2 className="h-4 w-4 mb-1" />
              <span className="text-xs">Edit</span>
            </button>
          </div>

          {/* Delete Button - Separate for safety */}
          <button
            onClick={() => setDeleteConfirm(item._id)}
            className="w-full py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Textbook
          </button>

          {/* Expandable Details */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Textbook Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">
                        Standard
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Class {item.standard}
                      </p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">Medium</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {item.medium}
                      </p>
                    </div>
                    {item.part && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">Part</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.part}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Created By
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.createdBy?.fullName || item.createdBy?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  // Desktop textbook card with all teacher actions
  const DesktopTextbookCard = ({ item }) => {
    const imageUrl = item.media?.[0]?.url;
    const gradientColor = getSubjectColor(item.subject);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="group"
      >
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Textbook Cover */}
          <div className={`relative h-48 bg-gradient-to-r ${gradientColor}`}>
            {imageUrl && (
              <>
                <img
                  src={imageUrl}
                  alt={item.subject}
                  className="w-full h-full object-cover opacity-75 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
                  Class {item.standard}
                </span>
                <span className="px-2 py-1 bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium text-white capitalize">
                  {item.medium}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white drop-shadow-lg">
                {item.subject}
              </h3>
            </div>

            {/* Part Badge */}
            {item.part && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-amber-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
                  Part {item.part}
                </span>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.part ? `Part ${item.part}` : "Complete Textbook"}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Teacher Action Buttons - All visible in grid */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() =>
                  navigate(`/teacherDetails/subjectRelatedChapters/${item._id}`)
                }
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Chapters
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  navigate(`/teacherStudentDiscussion/${item._id}`)
                }
                className="px-2 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                title="Discussion"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Discuss</span>
              </button>

              <button
                onClick={() => {
                  setEditingId(item._id);
                  setShowForm(true);
                }}
                className="px-2 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Edit</span>
              </button>

              <button
                onClick={() => setDeleteConfirm(item._id)}
                className="px-2 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Delete</span>
              </button>
            </div>

            {/* Creator Info */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Users className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {item.createdBy?.fullName || item.createdBy?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/teacher/dashboard")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Textbook Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                  Create, manage, and organize textbooks for all classes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">New Textbook</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Textbooks
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {textbooks.length}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500 opacity-75" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Classes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {uniqueStandards.length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-500 opacity-75" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Subjects
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {uniqueSubjects.length}
                  </p>
                </div>
                <BookMarked className="h-8 w-8 text-green-500 opacity-75" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Active Discussions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {textbooks.length}
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-amber-500 opacity-75" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by subject, class, or medium..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Standard Filter */}
              <div className="relative min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterStandard}
                  onChange={(e) => setFilterStandard(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors"
                >
                  <option value="all">All Classes</option>
                  {uniqueStandards.map((std) => (
                    <option key={std} value={std}>
                      Class {std}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div className="relative min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Textbooks Grid */}
        <div className="max-w-7xl mx-auto">
          {sortedTextbooks.length > 0 ? (
            <>
              {/* Results Info */}
              <div className="flex justify-between items-center mb-4 px-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {sortedTextbooks.length} textbook
                  {sortedTextbooks.length !== 1 ? "s" : ""}
                </p>
                {(searchQuery ||
                  filterStandard !== "all" ||
                  filterSubject !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStandard("all");
                      setFilterSubject("all");
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Textbook Cards */}
              <div
                className={
                  isMobile
                    ? "space-y-4"
                    : viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                }
              >
                {sortedTextbooks.map((item) =>
                  isMobile ? (
                    <MobileTextbookCard key={item._id} item={item} />
                  ) : (
                    <DesktopTextbookCard key={item._id} item={item} />
                  ),
                )}
              </div>
            </>
          ) : (
            // Empty State
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {searchQuery ||
                filterStandard !== "all" ||
                filterSubject !== "all"
                  ? "No matching textbooks found"
                  : "No textbooks yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchQuery ||
                filterStandard !== "all" ||
                filterSubject !== "all"
                  ? "Try adjusting your filters or search criteria"
                  : "Start by creating your first textbook for any class and subject"}
              </p>
              {searchQuery ||
              filterStandard !== "all" ||
              filterSubject !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStandard("all");
                    setFilterSubject("all");
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create First Textbook
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-lg"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete Textbook?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This action cannot be undone. All chapters, discussions, and
                content associated with this textbook will be permanently
                removed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SubjectRelatedAdminChapters;
