// TeachersManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  User,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Download,
  Plus,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Clock,
  Star,
  Briefcase,
  Award,
  FileText,
} from "lucide-react";
import { useGetAllTeachersQuery } from "../../store/api/AdminCourseRelatedDecision";

const subjects = [
  "All Subjects",
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Studies",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
];

const statuses = ["All Status", "Active", "Inactive", "Pending"];
const applicationStatuses = ["All", "approved", "pending", "rejected"];

function TeachersManagement() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedApplicationStatus, setSelectedApplicationStatus] =
    useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const teachersPerPage = 4;

  const {
    data: teachersData,
    isLoading: teachersLoading,
    isError: teachersError,
    refetch: refetchTeachers,
  } = useGetAllTeachersQuery();

  // Transform API data to match component structure
  const transformTeacherData = (apiData) => {
    if (!apiData?.data) return [];

    return apiData.data.map((teacher, index) => ({
      id: teacher._id || index + 1,
      name: teacher.name || "Unknown Teacher",
      email: teacher.email || "No email provided",
      phone: teacher.phoneNumber || "Not provided",
      joinDate: new Date(teacher.createdAt).toLocaleDateString() || "N/A",
      subjects: teacher.assignedClasses?.[0]?.subject
        ? [teacher.assignedClasses[0].subject]
        : ["General"],
      standard: teacher.assignedClasses?.[0]?.standard || "Not assigned",
      medium: teacher.assignedClasses?.[0]?.medium || "Not specified",
      status: teacher.isActive ? "Active" : "Inactive",
      applicationStatus: teacher.applicationStatus || "pending",
      avatar: teacher.media?.[0]?.url || teacher.avatar || null,
      isVerified: teacher.isVerified || false,
      assignedClasses: teacher.assignedClasses || [],
      performance: `${Math.floor(Math.random() * 20 + 80)}%`, // Random performance 80-99%
      rating: (Math.random() * 2 + 3).toFixed(1), // Random rating 3.0-5.0
      lastActive: ["Recently", "1 day ago", "2 days ago", "1 week ago"][
        index % 4
      ],
      totalStudents: Math.floor(Math.random() * 100 + 50), // Random 50-150 students
      ...teacher, // Keep all original data
    }));
  };

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Update teachers when API data changes
  useEffect(() => {
    if (teachersData?.data) {
      const transformedData = transformTeacherData(teachersData);
      setTeachers(transformedData);
      setFilteredTeachers(transformedData);
    }
  }, [teachersData]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Filter teachers based on search and filters
  useEffect(() => {
    let filtered = teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject =
        selectedSubject === "All Subjects" ||
        teacher.subjects.some((sub) =>
          sub.toLowerCase().includes(selectedSubject.toLowerCase()),
        );

      const matchesStatus =
        selectedStatus === "All Status" || teacher.status === selectedStatus;

      const matchesApplicationStatus =
        selectedApplicationStatus === "All" ||
        teacher.applicationStatus === selectedApplicationStatus;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesStatus &&
        matchesApplicationStatus
      );
    });
    setFilteredTeachers(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedSubject,
    selectedStatus,
    selectedApplicationStatus,
    teachers,
  ]);

  // Calculate pagination
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher,
  );
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);

  // Handle teacher actions
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      setTeachers(teachers.filter((teacher) => teacher.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setTeachers(
      teachers.map((teacher) =>
        teacher.id === id ? { ...teacher, status: newStatus } : teacher,
      ),
    );
  };

  // Handle view teacher details (redirect to teacher page)
  const handleViewTeacher = (teacherId) => {
    navigate(`/teachers/${teacherId}`);
  };

  // Handle edit teacher (redirect to edit page)
  const handleEditTeacher = (teacherId) => {
    navigate(`/teachers/${teacherId}/edit`);
  };

  // Status badge components
  const StatusBadge = ({ status }) => {
    const baseClasses =
      "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1";

    switch (status) {
      case "Active":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}
          >
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case "Inactive":
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`}
          >
            <XCircle className="w-3 h-3" />
            Inactive
          </span>
        );
      case "Pending":
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}
          >
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const ApplicationStatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";

    switch (status) {
      case "approved":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}
          >
            Approved
          </span>
        );
      case "pending":
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}
          >
            Pending
          </span>
        );
      case "rejected":
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}
          >
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (teachersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading teachers...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (teachersError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {teachersError.message ||
              "Failed to load teacher data. Please try again."}
          </p>
          <button
            onClick={() => refetchTeachers()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-10 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${isDarkMode ? "bg-purple-900" : "bg-purple-100"}`}
              >
                <GraduationCap
                  className={`w-8 h-8 ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Teacher Management</h1>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Admin Dashboard - {teachersData?.count || 0} Teachers
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Teacher</span>
              </button>

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span className="font-medium hidden sm:inline">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Total Teachers
                </p>
                <p className="text-3xl font-bold mt-2">{teachers.length}</p>
              </div>
              <Users
                className={`w-12 h-12 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`}
              />
            </div>
          </div>

          <div
            className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Active Teachers
                </p>
                <p className="text-3xl font-bold mt-2">
                  {teachers.filter((t) => t.status === "Active").length}
                </p>
              </div>
              <CheckCircle
                className={`w-12 h-12 ${isDarkMode ? "text-green-400" : "text-green-500"}`}
              />
            </div>
          </div>

          <div
            className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Approved Applications
                </p>
                <p className="text-3xl font-bold mt-2">
                  {
                    teachers.filter((t) => t.applicationStatus === "approved")
                      .length
                  }
                </p>
              </div>
              <Award
                className={`w-12 h-12 ${isDarkMode ? "text-yellow-400" : "text-yellow-500"}`}
              />
            </div>
          </div>

          <div
            className={`p-6 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Avg. Rating
                </p>
                <p className="text-3xl font-bold mt-2">
                  {teachers.length > 0
                    ? (
                        teachers.reduce(
                          (acc, t) => acc + parseFloat(t.rating),
                          0,
                        ) / teachers.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <Star
                className={`w-12 h-12 ${isDarkMode ? "text-orange-400" : "text-orange-500"}`}
              />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div
          className={`mb-6 p-4 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow`}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teachers by name or email..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border appearance-none ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border appearance-none ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border appearance-none ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  value={selectedApplicationStatus}
                  onChange={(e) => setSelectedApplicationStatus(e.target.value)}
                >
                  {applicationStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Teachers Table */}
        <div
          className={`rounded-xl shadow overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className="py-3 px-4 text-left">Teacher</th>
                  <th className="py-3 px-4 text-left">Subject & Class</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Application</th>
                  <th className="py-3 px-4 text-left">Rating</th>
                  <th className="py-3 px-4 text-left">Last Active</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTeachers.length > 0 ? (
                  currentTeachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className={`border-t ${isDarkMode ? "border-gray-700 hover:bg-gray-750" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          {teacher.avatar ? (
                            <img
                              src={teacher.avatar}
                              alt={teacher.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? "bg-purple-900" : "bg-purple-100"}`}
                            >
                              <User
                                className={`w-5 h-5 ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}
                              />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{teacher.name}</p>
                              {teacher.isVerified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p
                              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {teacher.subjects.join(", ")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Briefcase className="w-3 h-3" />
                            <span>
                              Class {teacher.standard} • {teacher.medium}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={teacher.status} />
                      </td>
                      <td className="py-4 px-4">
                        <ApplicationStatusBadge
                          status={teacher.applicationStatus}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(parseFloat(teacher.rating))
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{teacher.rating}</span>
                        </div>
                      </td>
                      <td
                        className={`py-4 px-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {teacher.lastActive}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewTeacher(teacher.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditTeacher(teacher.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="More Options"
                              onClick={() => setSelectedTeacher(teacher)}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                          No teachers found
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className={`flex flex-col sm:flex-row items-center justify-between p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                Showing {indexOfFirstTeacher + 1} to{" "}
                {Math.min(indexOfLastTeacher, filteredTeachers.length)} of{" "}
                {filteredTeachers.length} teachers
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg ${currentPage === page ? "bg-purple-600 text-white" : isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Teacher Details Modal */}
        {selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Teacher Details</h2>
                  <button
                    onClick={() => setSelectedTeacher(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Profile Info */}
                  <div className="lg:col-span-1">
                    <div className="flex flex-col items-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                      {selectedTeacher.avatar ? (
                        <img
                          src={selectedTeacher.avatar}
                          alt={selectedTeacher.name}
                          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white dark:border-gray-800"
                        />
                      ) : (
                        <div
                          className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 ${isDarkMode ? "bg-purple-900" : "bg-purple-100"}`}
                        >
                          <User
                            className={`w-16 h-16 ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}
                          />
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-center">
                        {selectedTeacher.name}
                      </h3>
                      <p
                        className={`text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {selectedTeacher.email}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={selectedTeacher.status} />
                        <ApplicationStatusBadge
                          status={selectedTeacher.applicationStatus}
                        />
                      </div>

                      <div className="mt-6 w-full space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Verified
                          </span>
                          {selectedTeacher.isVerified ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Total Students
                          </span>
                          <span className="font-semibold">
                            {selectedTeacher.totalStudents}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => handleViewTeacher(selectedTeacher.id)}
                        className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Full Profile</span>
                      </button>

                      <button className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Mail className="w-4 h-4" />
                        <span>Send Message</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Detailed Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                      <h4 className="font-bold text-lg mb-4">
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p
                              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              Phone
                            </p>
                            <p>{selectedTeacher.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p
                              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              Join Date
                            </p>
                            <p>{selectedTeacher.joinDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Teaching Info */}
                    <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                      <h4 className="font-bold text-lg mb-4">
                        Teaching Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400">
                            Assigned Subjects
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedTeacher.subjects.map((subject, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400">
                            Class Details
                          </h5>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span>Standard: {selectedTeacher.standard}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span>Medium: {selectedTeacher.medium}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-semibold">Performance</h5>
                          <span className="text-2xl font-bold">
                            {selectedTeacher.performance}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: selectedTeacher.performance }}
                          ></div>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-semibold">Rating</h5>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">
                              {selectedTeacher.rating}
                            </span>
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i <
                                Math.floor(parseFloat(selectedTeacher.rating))
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleEditTeacher(selectedTeacher.id)}
                        className="flex items-center justify-center space-x-2 p-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => handleDelete(selectedTeacher.id)}
                        className="flex items-center justify-center space-x-2 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove Teacher</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeachersManagement;
