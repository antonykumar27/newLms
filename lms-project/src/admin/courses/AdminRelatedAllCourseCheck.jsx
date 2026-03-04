// src/components/admin/CourseManagement.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  BarChart3,
  BookOpen,
  Calendar,
  FileText,
  RefreshCw,
  ChevronUp, // For sort order icon
  ChevronDown, // For sort order icon
  ChevronLeft,
  ChevronRight,
  Send, // New icon for 'Reject' button in modal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useGetAllCoursesQuery,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useDeleteAdminCourseMutation,
  useGetAdminCourseStatsQuery,
} from "../../store/api/AdminCourseRelatedDecision";
import { toast } from "react-toastify";

// Utility component for better icon-based status display
const StatusBadge = ({ status }) => {
  const baseClasses =
    "flex items-center text-xs font-medium px-3 py-1.5 rounded-full capitalize transition duration-150 ease-in-out";
  let colorClasses = "";
  let Icon = AlertCircle;

  switch (status) {
    case "published":
      colorClasses =
        "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100";
      Icon = CheckCircle;
      break;
    case "approved":
      colorClasses =
        "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100";
      Icon = CheckCircle;
      break;
    case "pending":
      colorClasses =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100";
      Icon = Clock;
      break;
    case "draft":
      colorClasses =
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      Icon = FileText;
      break;
    case "rejected":
      colorClasses =
        "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100";
      Icon = XCircle;
      break;
    case "archived":
      colorClasses =
        "bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100";
      Icon = Trash2;
      break;
    default:
      colorClasses =
        "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300";
      Icon = AlertCircle;
      break;
  }

  return (
    <span className={`${baseClasses} ${colorClasses}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {status}
    </span>
  );
};

// Memoized Course Cell
const CourseCell = React.memo(({ course }) => {
  const [imageSrc, setImageSrc] = useState(
    course.thumbnail || "/course-placeholder.jpg",
  );

  useEffect(() => {
    setImageSrc(course.thumbnail || "/course-placeholder.jpg");
  }, [course.thumbnail]);

  return (
    <div className="flex items-center py-2">
      <img
        src={imageSrc}
        alt={course.title}
        className="w-14 h-14 rounded-xl object-cover mr-3 shadow-md dark:shadow-lg"
        onError={() => {
          if (imageSrc !== "/course-placeholder.jpg") {
            setImageSrc("/course-placeholder.jpg");
          }
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {course.title}
        </p>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {new Date(course.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
});

CourseCell.displayName = "CourseCell";

// Memoized Instructor Cell
const InstructorCell = React.memo(({ course }) => {
  const [imageSrc, setImageSrc] = useState(
    course.instructor?.avatar ||
      course.teacher?.avatar ||
      "/user-placeholder.jpg",
  );

  useEffect(() => {
    setImageSrc(
      course.instructor?.avatar ||
        course.teacher?.avatar ||
        "/user-placeholder.jpg",
    );
  }, [course.instructor?.avatar, course.teacher?.avatar]);

  return (
    <div className="flex items-center">
      <img
        src={imageSrc}
        alt={course.instructor?.name || course.teacher?.name}
        className="w-8 h-8 rounded-full mr-3 border-2 border-blue-400 dark:border-blue-600 object-cover"
        onError={() => {
          if (imageSrc !== "/user-placeholder.jpg") {
            setImageSrc("/user-placeholder.jpg");
          }
        }}
      />
      <span className="text-gray-700 dark:text-gray-300 font-medium">
        {course.instructor?.name || course.teacher?.name || "Unknown"}
      </span>
    </div>
  );
});

InstructorCell.displayName = "InstructorCell";

// New component for modern stat cards
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
    yellow:
      "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700 transition duration-300 hover:shadow-blue-500/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-extrabold mt-2 text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const AdminRelatedAllCourseCheck = () => {
  const navigate = useNavigate();

  // RTK Query Hooks
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useGetAllCoursesQuery();

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetAdminCourseStatsQuery();

  const [approveCourse] = useApproveCourseMutation();
  const [rejectCourse] = useRejectCourseMutation();
  const [deleteCourse] = useDeleteAdminCourseMutation();

  // State for course approval/reject modal
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [optimisticUpdates, setOptimisticUpdates] = useState({});

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get courses from RTK Query
  const courses = useMemo(() => {
    return coursesData?.courses || [];
  }, [coursesData]);

  const stats = useMemo(() => {
    const defaultStats = {
      total: 0,
      published: 0,
      pending: 0,
      draft: 0,
    };
    if (statsData) {
      return {
        ...defaultStats,
        ...statsData,
        // Calculate pending/draft counts based on actual courses data for consistency
        pending: courses.filter((c) => c.status === "pending").length,
        draft: courses.filter((c) => c.status === "draft").length,
        total: courses.length,
      };
    }
    return defaultStats;
  }, [statsData, courses]);

  // Memoized filtered courses (Including Optimistic Updates)
  const memoizedFilteredCourses = useMemo(() => {
    let filtered = [...courses];

    // 1. Apply optimistic updates first
    filtered = filtered.map((course) => {
      if (optimisticUpdates[course._id]) {
        return { ...course, ...optimisticUpdates[course._id] };
      }
      return course;
    });

    // Remove optimistically deleted courses
    filtered = filtered.filter((course) => !course._deleted);

    // 2. Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(lowerCaseSearch) ||
          course.instructor?.name?.toLowerCase().includes(lowerCaseSearch) ||
          course.teacher?.name?.toLowerCase().includes(lowerCaseSearch) ||
          course.category?.toLowerCase().includes(lowerCaseSearch),
      );
    }

    // 3. Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((course) => course.status === statusFilter);
    }

    // 4. Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (course) => course.category === categoryFilter,
      );
    }

    // 5. Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "title":
          aValue = a.title?.toLowerCase() || "";
          bValue = b.title?.toLowerCase() || "";
          break;
        case "enrollments":
          aValue = a.totalEnrollments || a.enrollments || 0;
          bValue = b.totalEnrollments || b.enrollments || 0;
          break;
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "rating":
          aValue = a.averageRating || a.rating || 0;
          bValue = b.averageRating || b.rating || 0;
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt || a.createdDate || 0).getTime();
          bValue = new Date(b.createdAt || b.createdDate || 0).getTime();
          break;
      }

      // Handle string comparison for non-numeric types
      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle numeric comparison
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [
    courses,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortBy,
    sortOrder,
    optimisticUpdates,
  ]);

  // Handle errors on initial load
  useEffect(() => {
    if (coursesError) {
      toast.error("Failed to load courses data.");
      console.error("Courses loading error:", coursesError);
    }
  }, [coursesError]);

  // Handle CRUD actions (Approve, Reject, Delete)
  const handleAction = async (action, courseId, data = {}) => {
    setActionLoading(true);
    let apiCall;
    let successMessage = "";
    let optimisticChange = {};

    try {
      if (action === "approve") {
        apiCall = approveCourse(courseId).unwrap();
        successMessage = "Course approved successfully!";
        optimisticChange = { status: "approved" };
      } else if (action === "reject") {
        if (!data.reason.trim()) {
          toast.error("Please enter a rejection reason");
          return;
        }
        apiCall = rejectCourse({ courseId, reason: data.reason }).unwrap();
        successMessage = "Course rejected successfully!";
        optimisticChange = { status: "rejected" };
      } else if (action === "delete") {
        if (
          !window.confirm(
            "Are you sure you want to delete this course? This action cannot be undone.",
          )
        )
          return;
        apiCall = deleteCourse(courseId).unwrap();
        successMessage = "Course deleted successfully!";
        optimisticChange = { _deleted: true };
      }

      // Optimistic update
      setOptimisticUpdates((prev) => ({
        ...prev,
        [courseId]: optimisticChange,
      }));

      await apiCall;
      toast.success(successMessage);

      // Clean up optimistic update after success (optional, refetch handles actual data)
      setOptimisticUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[courseId];
        return newUpdates;
      });

      // Refetch data after successful action
      // Using a short delay to ensure optimistic state is visible briefly before refetch
      setTimeout(() => {
        refetchCourses();
        refetchStats();
      }, 100);
    } catch (error) {
      console.error(`Error ${action}ing course:`, error);
      toast.error(error?.data?.message || `Failed to ${action} course`);

      // Revert optimistic update
      setOptimisticUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[courseId];
        return newUpdates;
      });
    } finally {
      setActionLoading(false);
      if (action === "reject") {
        setShowRejectModal(false);
        setSelectedCourse(null);
        setRejectionReason("");
      }
    }
  };

  const handleApproveCourse = (courseId) => handleAction("approve", courseId);
  const handleRejectCourseSubmit = () =>
    handleAction("reject", selectedCourse._id, { reason: rejectionReason });
  const handleDeleteCourse = (courseId) => handleAction("delete", courseId);

  const openRejectModal = (course) => {
    setSelectedCourse(course);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleViewCourse = (courseId) => navigate(`/admin/courses/${courseId}`);
  const handleEditCourse = (courseId) =>
    navigate(`/admin/course/${courseId}/edit`);

  const exportToCSV = () => {
    // CSV logic (omitted for brevity, assume the original logic is sufficient)
    const headers = [
      "ID",
      "Title",
      "Instructor",
      "Category",
      "Status",
      "Price",
      "Discount Price",
      "Enrollments",
      "Rating",
      "Created Date",
      "Level",
      "Language",
      "Currency",
      "Enrollment Type",
      "Subcategory",
    ];
    const csvData = memoizedFilteredCourses.map((course) => [
      course._id,
      `"${course.title.replace(/"/g, '""')}"`, // Handle quotes in title
      course.instructor?.name || course.teacher?.name || "N/A",
      course.category,
      course.status,
      course.price,
      course.discountPrice || 0,
      course.totalEnrollments || course.enrollments || 0,
      course.averageRating || course.rating || 0,
      new Date(course.createdAt).toLocaleDateString(),
      course.level,
      course.language,
      course.currency,
      course.enrollmentType,
      course.subcategory || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `courses_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.info("Course data exported to CSV!");
  };

  const categories = [
    "Mathematics",
    "Science",
    "Programming",
    "Business",
    "Arts",
    "Languages",
    "Test Preparation",
    "Other",
  ];

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = memoizedFilteredCourses.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(memoizedFilteredCourses.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (coursesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96 dark:bg-gray-900 rounded-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
        📚 Course Management Dashboard
      </h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={stats.total}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Published"
          value={stats.published}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          title="Draft Courses"
          value={stats.draft}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Reject Course Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400 border-b pb-2 border-gray-200 dark:border-gray-700 flex items-center">
              <XCircle className="w-5 h-5 mr-2" /> Reject Course
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Course:{" "}
              <span className="font-semibold">{selectedCourse?.title}</span>
            </p>
            <label
              htmlFor="rejection-reason"
              className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
            >
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain clearly why this course is being rejected..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg mb-4 h-32 resize-none focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedCourse(null);
                  setRejectionReason("");
                }}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectCourseSubmit}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center transition duration-150"
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {actionLoading ? "Processing..." : "Reject & Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Filters and Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Courses
          </h2>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 text-sm"
              title="Export Course Data to CSV"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => {
                refetchCourses();
                refetchStats();
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 text-sm disabled:opacity-50"
              disabled={actionLoading}
              title="Refresh Data"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  actionLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Course/Instructor
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="search"
                placeholder="Title, instructor, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset pagination
              }}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Filter
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1); // Reset pagination
              }}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1); // Reset pagination
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150 appearance-none"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="enrollments">Enrollments</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-150"
                title={`Sort Order: ${
                  sortOrder === "asc" ? "Ascending" : "Descending"
                }`}
              >
                {sortOrder === "asc" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4 min-w-[200px]">
                  Course
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4 min-w-[150px]">
                  Instructor
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4 min-w-[120px] hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4 min-w-[120px]">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4 min-w-[100px] hidden md:table-cell">
                  Price
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4 min-w-[100px] hidden lg:table-cell">
                  Rating
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4 min-w-[180px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentCourses.length > 0 ? (
                currentCourses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                  >
                    <td className="py-2 px-4 whitespace-nowrap">
                      <CourseCell course={course} />
                    </td>

                    <td className="py-2 px-4 whitespace-nowrap">
                      <InstructorCell course={course} />
                    </td>

                    <td className="py-2 px-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="space-y-0.5">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm font-medium">
                          {course.category}
                        </span>
                        {course.level && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {course.level}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-4 whitespace-nowrap">
                      <StatusBadge status={course.status} />
                    </td>

                    <td className="py-2 px-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {course.price === 0 ? (
                          <span className="text-green-600 dark:text-green-400">
                            FREE
                          </span>
                        ) : (
                          `${course.currency || "$"}${
                            course.discountPrice > 0 &&
                            course.discountPrice < course.price
                              ? course.discountPrice
                              : course.price
                          }`
                        )}
                      </div>
                      {course.discountPrice > 0 &&
                        course.discountPrice < course.price && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                            {course.currency || "$"}
                            {course.price}
                          </span>
                        )}
                    </td>

                    <td className="py-2 px-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex items-center">
                        <Star
                          className="w-4 h-4 text-yellow-500 mr-1.5"
                          fill="currentColor"
                        />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {(course.averageRating || course.rating || 0).toFixed(
                            1,
                          )}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({course.totalRatings || 0})
                        </span>
                      </div>
                    </td>

                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {/* View button */}
                        <button
                          onClick={() => handleViewCourse(course._id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 rounded-lg transition duration-150"
                          title="View Course"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve/Reject only for pending */}
                        {course.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveCourse(course._id)}
                              className="p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900 rounded-lg transition duration-150 disabled:opacity-50"
                              title="Approve Course"
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRejectModal(course)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 rounded-lg transition duration-150 disabled:opacity-50"
                              title="Reject Course"
                              disabled={actionLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Edit and Delete */}
                        <button
                          onClick={() => handleEditCourse(course._id)}
                          className="p-2 text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900 rounded-lg transition duration-150"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 rounded-lg transition duration-150 disabled:opacity-50"
                          title="Delete Course"
                          disabled={actionLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-12 text-center text-lg text-gray-500 dark:text-gray-400"
                  >
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    {searchTerm ||
                    statusFilter !== "all" ||
                    categoryFilter !== "all"
                      ? "No courses match your current filters."
                      : "No courses found in the system."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Showing{" "}
            <span className="font-semibold">{indexOfFirstItem + 1}</span>-
            <span className="font-semibold">
              {Math.min(indexOfLastItem, memoizedFilteredCourses.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
              {memoizedFilteredCourses.length}
            </span>{" "}
            results (Total Courses:{" "}
            <span className="font-semibold">{coursesData?.total || 0}</span>)
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition duration-150"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination numbers logic optimized for display */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) pageNumber = i + 1;
              else if (currentPage <= 3) pageNumber = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNumber = totalPages - 4 + i;
              else pageNumber = currentPage - 2 + i;

              if (pageNumber < 1 || pageNumber > totalPages) return null;

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-4 py-1.5 rounded-lg font-medium transition duration-150 ${
                    currentPage === pageNumber
                      ? "bg-blue-600 text-white shadow-md"
                      : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="text-gray-500 dark:text-gray-400">...</span>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition duration-150"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatedAllCourseCheck;
