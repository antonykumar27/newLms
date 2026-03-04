// App.jsx
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
} from "lucide-react";
import { useGetAdminRelatedStudentsQuery } from "../../store/api/LoginUserApi";

const courses = [
  "All Courses",
  "Computer Science",
  "Data Science",
  "Web Development",
  "Cybersecurity",
  "AI & ML",
];
const statuses = ["All Status", "Active", "Inactive", "Pending"];

function StudentsDetails() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const studentsPerPage = 4;

  const {
    data: studentsDetails,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useGetAdminRelatedStudentsQuery();

  // Transform API data to match component structure
  const transformStudentData = (apiData) => {
    if (!apiData?.data) return [];

    return apiData.data.map((student, index) => ({
      id: student._id || index + 1,
      name: student.name || "Unknown Student",
      email: student.email || "No email provided",
      phone: "+1 (555) 000-0000", // Default phone if not available
      enrollmentDate: new Date(student.createdAt).toLocaleDateString() || "N/A",
      course: student.standard || "General Studies", // Using medium as course
      medium: student.medium || "General Studies", // Using medium as course
      status: student.active ? "Active" : "Inactive",
      grade: ["A", "B+", "A-", "B", "C+"][index % 5] || "B", // Random grades for demo
      attendance: `${Math.floor(Math.random() * 20 + 80)}%`, // Random attendance 80-99%
      lastActivity: "Recently",
      profileImage: student.media?.[0]?.url || null,
      schoolName: student.schoolName || "Not specified",
      ...student, // Keep all original data
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

  // Update students when API data changes
  useEffect(() => {
    if (studentsDetails?.data) {
      const transformedData = transformStudentData(studentsDetails);
      setStudents(transformedData);
      setFilteredStudents(transformedData);
    }
  }, [studentsDetails]);

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

  // Filter students based on search and filters
  useEffect(() => {
    let filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse =
        selectedCourse === "All Courses" || student.course === selectedCourse;
      const matchesStatus =
        selectedStatus === "All Status" || student.status === selectedStatus;

      return matchesSearch && matchesCourse && matchesStatus;
    });
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCourse, selectedStatus, students]);

  // Calculate pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent,
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Handle student actions
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter((student) => student.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setStudents(
      students.map((student) =>
        student.id === id ? { ...student, status: newStatus } : student,
      ),
    );
  };

  // Handle view student details (redirect to student page)
  const handleViewStudent = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  // Handle edit student (redirect to edit page)
  const handleEditStudent = (studentId) => {
    navigate(`/students/${studentId}/edit`);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";

    switch (status) {
      case "Active":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}
          >
            <CheckCircle className="inline w-3 h-3 mr-1" />
            Active
          </span>
        );
      case "Inactive":
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`}
          >
            <XCircle className="inline w-3 h-3 mr-1" />
            Inactive
          </span>
        );
      case "Pending":
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}
          >
            <AlertCircle className="inline w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (studentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading students...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (studentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {studentsError.message ||
              "Failed to load student data. Please try again."}
          </p>
          <button
            onClick={() => refetchStudents()}
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
                className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}
              >
                <GraduationCap
                  className={`w-8 h-8 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Student Management</h1>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Admin Dashboard - {studentsDetails?.count || 0} Students
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
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
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Admin</span>
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
                  Total Students
                </p>
                <p className="text-3xl font-bold mt-2">{students.length}</p>
              </div>
              <User
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
                  Active Students
                </p>
                <p className="text-3xl font-bold mt-2">
                  {students.filter((s) => s.status === "Active").length}
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
                  Courses
                </p>
                <p className="text-3xl font-bold mt-2">
                  {Array.from(new Set(students.map((s) => s.course))).length}
                </p>
              </div>
              <BookOpen
                className={`w-12 h-12 ${isDarkMode ? "text-purple-400" : "text-purple-500"}`}
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
                  Schools
                </p>
                <p className="text-3xl font-bold mt-2">
                  {
                    Array.from(new Set(students.map((s) => s.schoolName)))
                      .length
                  }
                </p>
              </div>
              <GraduationCap
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
                  placeholder="Search students by name or email..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className={`pl-10 pr-4 py-2 rounded-lg border appearance-none ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className={`pl-10 pr-4 py-2 rounded-lg border appearance-none ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
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

              <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div
          className={`rounded-xl shadow overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className="py-3 px-4 text-left">Student</th>
                  <th className="py-3 px-4 text-left">Standard</th>
                  <th className="py-3 px-4 text-left">Medium</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Grade</th>
                  <th className="py-3 px-4 text-left">Attendance</th>
                  <th className="py-3 px-4 text-left">School</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr
                      key={student.id}
                      className={`border-t ${isDarkMode ? "border-gray-700 hover:bg-gray-750" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          {student.profileImage ? (
                            <img
                              src={student.profileImage}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}
                            >
                              <User
                                className={`w-5 h-5 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p
                              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span>{student.course}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span>{student.medium}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
                        >
                          {student.grade}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              className={`h-full ${parseInt(student.attendance) > 90 ? "bg-green-500" : parseInt(student.attendance) > 75 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: student.attendance }}
                            ></div>
                          </div>
                          <span>{student.attendance}</span>
                        </div>
                      </td>
                      <td
                        className={`py-4 px-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        <div
                          className="max-w-[150px] truncate"
                          title={student.schoolName}
                        >
                          {student.schoolName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewStudent(student.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStudent(student.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="More Options"
                              onClick={() => setSelectedStudent(student)}
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
                    <td colSpan="7" className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <User className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No students found. Try adjusting your search or
                          filters.
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
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg mb-2 sm:mb-0 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg ${currentPage === page ? "bg-blue-600 text-white" : isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
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
          )}
        </div>

        {/* Student Details Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Student Details</h2>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 flex flex-col items-center">
                    {selectedStudent.profileImage ? (
                      <img
                        src={selectedStudent.profileImage}
                        alt={selectedStudent.name}
                        className="w-32 h-32 rounded-full object-cover mb-4"
                      />
                    ) : (
                      <div
                        className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? "bg-blue-900" : "bg-blue-100"}`}
                      >
                        <User
                          className={`w-16 h-16 ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-center">
                      {selectedStudent.name}
                    </h3>
                    <p
                      className={`text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {selectedStudent.email}
                    </p>
                    <div className="mt-4">
                      <StatusBadge status={selectedStudent.status} />
                    </div>
                  </div>

                  <div className="md:w-2/3 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Phone
                          </p>
                          <p>{selectedStudent.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Enrollment Date
                          </p>
                          <p>{selectedStudent.enrollmentDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                        <div>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Course
                          </p>
                          <p>{selectedStudent.course}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                        <div>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            School
                          </p>
                          <p>{selectedStudent.schoolName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <p
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Grade
                        </p>
                        <p className="text-2xl font-bold">
                          {selectedStudent.grade}
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <p
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Attendance
                        </p>
                        <p className="text-2xl font-bold">
                          {selectedStudent.attendance}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => handleViewStudent(selectedStudent.id)}
                          className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Full Profile</span>
                        </button>
                        <button className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          <Mail className="w-4 h-4" />
                          <span>Send Email</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            handleStatusChange(selectedStudent.id, "Active")
                          }
                          className={`p-3 rounded-lg ${selectedStudent.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"}`}
                        >
                          Set Active
                        </button>
                        <button
                          onClick={() => handleDelete(selectedStudent.id)}
                          className="flex items-center justify-center space-x-2 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
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

export default StudentsDetails;
