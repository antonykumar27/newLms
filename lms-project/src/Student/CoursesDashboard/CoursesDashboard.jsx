// components/CoursesDashboard.jsx
import React, { useState } from "react";
import { useDashboard } from "../studentEngagement/DashboardContext";
import {
  FaBook,
  FaPlay,
  FaClock,
  FaStar,
  FaUsers,
  FaFilter,
  FaSearch,
  FaSort,
  FaDownload,
  FaCheckCircle,
  FaCircle,
  FaLock,
  FaUnlock,
  FaChartLine,
  FaAward,
  FaFire,
  FaGraduationCap,
  FaChevronRight,
  FaBookmark,
  FaShare,
  FaEye,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const CoursesDashboard = () => {
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [filter, setFilter] = useState("all"); // all, in-progress, completed, saved
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, progress, name
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { user } = useDashboard();

  // ========== ADVANCED COURSES DATA ==========
  const courses = [
    {
      id: 1,
      title: "Advanced React & Next.js 2026",
      description:
        "Master React 19, Next.js 15, Server Components, and modern React patterns",
      instructor: "John Doe",
      instructorAvatar: "https://i.pravatar.cc/150?img=1",
      progress: 65,
      totalLessons: 36,
      completedLessons: 24,
      totalHours: 28,
      completedHours: 18,
      level: "Advanced",
      category: "Frontend",
      tags: ["React", "Next.js", "TypeScript"],
      rating: 4.8,
      students: 15420,
      lastAccessed: "2 hours ago",
      thumbnail:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      status: "in-progress",
      color: "emerald",
      nextLesson: "Building Custom Hooks",
      certificate: true,
      assignments: 8,
      quizzes: 12,
      achievements: [
        { name: "Fast Learner", earned: true },
        { name: "Quiz Master", earned: false },
      ],
    },
    {
      id: 2,
      title: "Node.js Masterclass 2026",
      description:
        "Microservices, GraphQL, WebSockets, and production deployment",
      instructor: "Sarah Johnson",
      instructorAvatar: "https://i.pravatar.cc/150?img=2",
      progress: 40,
      totalLessons: 48,
      completedLessons: 19,
      totalHours: 42,
      completedHours: 17,
      level: "Advanced",
      category: "Backend",
      tags: ["Node.js", "GraphQL", "MongoDB"],
      rating: 4.9,
      students: 12350,
      lastAccessed: "1 day ago",
      thumbnail:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
      status: "in-progress",
      color: "green",
      nextLesson: "JWT Authentication",
      certificate: true,
      assignments: 12,
      quizzes: 15,
      achievements: [{ name: "API Expert", earned: true }],
    },
    {
      id: 3,
      title: "System Design & Architecture",
      description:
        "Design scalable systems, microservices, and high-availability architecture",
      instructor: "Mike Wilson",
      instructorAvatar: "https://i.pravatar.cc/150?img=3",
      progress: 20,
      totalLessons: 32,
      completedLessons: 6,
      totalHours: 35,
      completedHours: 7,
      level: "Expert",
      category: "Architecture",
      tags: ["System Design", "Microservices", "AWS"],
      rating: 4.7,
      students: 8950,
      lastAccessed: "3 days ago",
      thumbnail:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
      status: "in-progress",
      color: "blue",
      nextLesson: "Database Sharding",
      certificate: true,
      assignments: 6,
      quizzes: 8,
    },
    {
      id: 4,
      title: "Python for Data Science",
      description: "Pandas, NumPy, Matplotlib, and machine learning basics",
      instructor: "Emily Chen",
      instructorAvatar: "https://i.pravatar.cc/150?img=4",
      progress: 85,
      totalLessons: 42,
      completedLessons: 36,
      totalHours: 38,
      completedHours: 32,
      level: "Intermediate",
      category: "Data Science",
      tags: ["Python", "Pandas", "ML"],
      rating: 4.9,
      students: 21340,
      lastAccessed: "5 hours ago",
      thumbnail:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
      status: "in-progress",
      color: "purple",
      nextLesson: "Neural Networks",
      certificate: true,
      assignments: 10,
      quizzes: 14,
    },
    {
      id: 5,
      title: "TypeScript: Complete Guide",
      description: "Advanced types, decorators, and enterprise patterns",
      instructor: "Alex Kumar",
      instructorAvatar: "https://i.pravatar.cc/150?img=5",
      progress: 100,
      totalLessons: 28,
      completedLessons: 28,
      totalHours: 22,
      completedHours: 22,
      level: "Intermediate",
      category: "Frontend",
      tags: ["TypeScript", "JavaScript"],
      rating: 4.8,
      students: 18760,
      completedDate: "2026-02-15",
      thumbnail:
        "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400",
      status: "completed",
      color: "yellow",
      certificate: true,
      certificateUrl: "#",
      assignments: 6,
      quizzes: 10,
    },
    {
      id: 6,
      title: "Docker & Kubernetes",
      description: "Containerization, orchestration, and DevOps practices",
      instructor: "David Brown",
      instructorAvatar: "https://i.pravatar.cc/150?img=6",
      progress: 0,
      totalLessons: 34,
      completedLessons: 0,
      totalHours: 30,
      completedHours: 0,
      level: "Intermediate",
      category: "DevOps",
      tags: ["Docker", "Kubernetes", "AWS"],
      rating: 4.7,
      students: 9870,
      thumbnail:
        "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400",
      status: "not-started",
      color: "cyan",
      isSaved: true,
      assignments: 8,
      quizzes: 12,
    },
  ];

  // Categories with counts
  const categories = [
    { name: "all", label: "All Courses", count: courses.length },
    {
      name: "frontend",
      label: "Frontend",
      count: courses.filter((c) => c.category === "Frontend").length,
    },
    {
      name: "backend",
      label: "Backend",
      count: courses.filter((c) => c.category === "Backend").length,
    },
    {
      name: "architecture",
      label: "Architecture",
      count: courses.filter((c) => c.category === "Architecture").length,
    },
    {
      name: "data-science",
      label: "Data Science",
      count: courses.filter((c) => c.category === "Data Science").length,
    },
    {
      name: "devops",
      label: "DevOps",
      count: courses.filter((c) => c.category === "DevOps").length,
    },
  ];

  // Filter courses based on selected filters
  const filteredCourses = courses.filter((course) => {
    if (filter === "in-progress" && course.status !== "in-progress")
      return false;
    if (filter === "completed" && course.status !== "completed") return false;
    if (filter === "saved" && !course.isSaved) return false;
    if (
      selectedCategory !== "all" &&
      course.category.toLowerCase() !== selectedCategory
    )
      return false;
    if (
      searchQuery &&
      !course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === "recent")
      return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    if (sortBy === "progress") return b.progress - a.progress;
    if (sortBy === "name") return a.title.localeCompare(b.title);
    return 0;
  });

  // Stats
  const stats = {
    totalCourses: courses.length,
    inProgress: courses.filter((c) => c.status === "in-progress").length,
    completed: courses.filter((c) => c.status === "completed").length,
    saved: courses.filter((c) => c.isSaved).length,
    totalHours: courses.reduce((acc, c) => acc + c.completedHours, 0),
    certificates: courses.filter(
      (c) => c.certificate && c.status === "completed",
    ).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <FaBook className="text-emerald-400" />
              My Courses
            </h1>
            <p className="text-zinc-400 mt-2">
              {stats.totalCourses} enrolled • {stats.completed} completed •{" "}
              {stats.totalHours} hours learned
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-zinc-800/50 rounded-lg px-4 py-2">
              <p className="text-xs text-zinc-500">Certificates</p>
              <p className="text-xl font-bold text-white">
                {stats.certificates}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg px-4 py-2">
              <p className="text-xs text-zinc-500">In Progress</p>
              <p className="text-xl font-bold text-yellow-400">
                {stats.inProgress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="max-w-7xl mx-auto mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-emerald-500 text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white"
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter("in-progress")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "in-progress"
                ? "bg-yellow-500 text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white"
            }`}
          >
            In Progress ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "completed"
                ? "bg-green-500 text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white"
            }`}
          >
            Completed ({stats.completed})
          </button>
          <button
            onClick={() => setFilter("saved")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "saved"
                ? "bg-purple-500 text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:text-white"
            }`}
          >
            Saved ({stats.saved})
          </button>

          <div className="flex-1" />

          {/* Sort & View Options */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-800/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="recent">Recently Accessed</option>
              <option value="progress">Progress</option>
              <option value="name">Course Name</option>
            </select>

            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-800/50 text-zinc-400"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-800/50 text-zinc-400"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.name
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-zinc-800/50 text-zinc-400 hover:text-white"
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid/List */}
      <div className="max-w-7xl mx-auto">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCourses.map((course) => (
              <CourseListItem key={course.id} course={course} />
            ))}
          </div>
        )}

        {sortedCourses.length === 0 && (
          <div className="text-center py-12">
            <FaBook className="text-6xl text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No courses found
            </h3>
            <p className="text-zinc-500">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      {filter === "all" && (
        <div className="max-w-7xl mx-auto mt-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <RecommendationCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Grid View Course Card
const CourseCard = ({ course }) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = {
    "in-progress": { color: "yellow", text: "Continue Learning" },
    completed: { color: "green", text: "Review Course" },
    "not-started": { color: "emerald", text: "Start Course" },
  };

  const config = statusConfig[course.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 overflow-hidden hover:border-emerald-500/30 transition-all group"
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {course.status === "completed" ? (
            <span className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <FaCheckCircle /> Completed
            </span>
          ) : course.status === "in-progress" ? (
            <span className="bg-yellow-500/90 text-white text-xs px-2 py-1 rounded-full">
              {course.progress}%
            </span>
          ) : (
            <span className="bg-zinc-800/90 text-zinc-400 text-xs px-2 py-1 rounded-full">
              Not Started
            </span>
          )}
        </div>

        {/* Bookmark */}
        {course.isSaved && (
          <div className="absolute top-3 left-3">
            <FaBookmark className="text-purple-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Instructor */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-white mb-1 line-clamp-2">
              {course.title}
            </h3>
            <div className="flex items-center gap-2">
              <img
                src={course.instructorAvatar}
                alt={course.instructor}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-xs text-zinc-500">{course.instructor}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <FaStar /> {course.rating}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Progress Bar */}
        {course.status !== "not-started" && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Progress</span>
              <span className="text-white font-medium">{course.progress}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1 }}
                className={`h-full bg-${course.color}-500 rounded-full`}
              />
            </div>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
          <span className="flex items-center gap-1">
            <FaClock /> {course.totalHours}h total
          </span>
          <span className="flex items-center gap-1">
            <FaUsers /> {course.students.toLocaleString()}
          </span>
        </div>

        {/* Next Lesson / Action */}
        {course.status === "in-progress" && (
          <div className="mb-4 p-2 bg-zinc-800/50 rounded-lg">
            <p className="text-xs text-zinc-400">Next:</p>
            <p className="text-sm text-white truncate">{course.nextLesson}</p>
          </div>
        )}

        {/* Continue Button */}
        <button
          className={`w-full bg-${config.color}-500 hover:bg-${config.color}-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2`}
        >
          <FaPlay className="text-sm" />
          {config.text}
        </button>
      </div>
    </motion.div>
  );
};

// List View Course Item
const CourseListItem = ({ course }) => {
  const statusConfig = {
    "in-progress": { color: "yellow", text: "Continue" },
    completed: { color: "green", text: "Review" },
    "not-started": { color: "emerald", text: "Start" },
  };

  const config = statusConfig[course.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-4 hover:border-emerald-500/30 transition-all"
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thumbnail */}
        <div className="md:w-48 h-32 rounded-lg overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-white">{course.title}</h3>
              <p className="text-sm text-zinc-400 mt-1">{course.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 flex items-center gap-1">
                <FaStar /> {course.rating}
              </span>
              {course.isSaved && <FaBookmark className="text-purple-400" />}
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-3">
            <span className="flex items-center gap-1">
              <FaClock /> {course.completedHours}/{course.totalHours}h
            </span>
            <span className="flex items-center gap-1">
              <FaCheckCircle /> {course.completedLessons}/{course.totalLessons}{" "}
              lessons
            </span>
            <span className="flex items-center gap-1">
              <FaUsers /> {course.students.toLocaleString()} students
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                course.level === "Beginner"
                  ? "bg-green-500/20 text-green-400"
                  : course.level === "Intermediate"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
              }`}
            >
              {course.level}
            </span>
          </div>

          {/* Progress */}
          {course.status !== "not-started" && (
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Progress</span>
                <span className="text-white font-medium">
                  {course.progress}%
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full w-64">
                <div
                  className={`h-full bg-${course.color}-500 rounded-full`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              className={`px-4 py-2 bg-${config.color}-500 text-white rounded-lg text-sm font-medium hover:bg-${config.color}-600 transition-colors flex items-center gap-2`}
            >
              <FaPlay className="text-xs" /> {config.text}
            </button>
            <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <FaEye />
            </button>
            <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <FaShare />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Recommendation Card
const RecommendationCard = ({ course }) => (
  <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800 hover:border-emerald-500/30 transition-all cursor-pointer">
    <div className="flex gap-3">
      <div className="w-16 h-16 rounded-lg overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-medium text-sm mb-1">{course.title}</h4>
        <p className="text-xs text-zinc-500 mb-2">By {course.instructor}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-yellow-400 flex items-center gap-1">
            <FaStar /> {course.rating}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">{course.level}</span>
        </div>
      </div>
    </div>
  </div>
);

export default CoursesDashboard;
