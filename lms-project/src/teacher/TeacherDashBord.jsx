// src/components/teacher/TeacherDashboard.jsx
import React, { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  BookOpen,
  Video,
  FileText,
  Award,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Filter,
  Plus,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Target,
  TrendingDown,
  UserPlus,
  CalendarDays,
  Shield,
  Bookmark,
  Target as TargetIcon,
  Zap,
  RefreshCw,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";

// Import RTK Query hooks
import {
  useGetDashboardStatsQuery,
  useGetRecentActivitiesQuery,
  useGetUpcomingSessionsQuery,
  useGetStudentRequestsQuery,
  useGetCourseAnalyticsQuery,
  useApproveStudentRequestMutation,
  useRejectStudentRequestMutation,
} from "../store/api/TeacherAnalytics";

// Mock data for development
const mockStats = {
  totalStudents: 156,
  activeStudents: 128,
  totalCourses: 12,
  publishedCourses: 10,
  pendingCourses: 2,
  totalEarnings: 8560.75,
  thisMonthEarnings: 1250.5,
  pendingWithdrawals: 450.0,
  completionRate: 82,
  avgRating: 4.7,
  totalHours: 245,
  upcomingSessions: 5,
};

const mockActivities = [
  {
    type: "student_enrolled",
    message: "Sarah Johnson enrolled in React Masterclass",
    time: "Just now",
  },
  {
    type: "new_rating",
    message: "New 5★ rating for JavaScript Fundamentals",
    time: "2 hours ago",
  },
  {
    type: "new_message",
    message: "New message from Michael Chen",
    time: "3 hours ago",
  },
  {
    type: "assignment_submitted",
    message: "Assignment submitted by Emily Davis",
    time: "1 day ago",
  },
  {
    type: "course_published",
    message: "Advanced Node.js course published successfully",
    time: "2 days ago",
  },
];

const mockUpcomingSessions = [
  {
    id: 1,
    title: "React Hooks Deep Dive",
    date: "Today",
    time: "2:00 PM",
    students: 15,
    timeRemaining: "1 hour",
  },
  {
    id: 2,
    title: "JavaScript Async Patterns",
    date: "Tomorrow",
    time: "10:00 AM",
    students: 22,
    timeRemaining: "1 day",
  },
  {
    id: 3,
    title: "Full Stack Development Workshop",
    date: "Friday",
    time: "3:30 PM",
    students: 18,
    timeRemaining: "3 days",
  },
];

const mockCourseAnalytics = [
  {
    id: 1,
    title: "React Fundamentals",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=128&h=128&fit=crop",
    enrollments: 156,
    rating: 4.8,
    completionRate: 85,
    revenue: 4250.75,
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    thumbnail:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=128&h=128&fit=crop",
    enrollments: 124,
    rating: 4.6,
    completionRate: 78,
    revenue: 3120.5,
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    thumbnail:
      "https://images.unsplash.com/photo-1599508704512-2f292ef7c6c1?w=128&h=128&fit=crop",
    enrollments: 89,
    rating: 4.9,
    completionRate: 91,
    revenue: 2850.25,
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=128&h=128&fit=crop",
    enrollments: 67,
    rating: 4.7,
    completionRate: 72,
    revenue: 1675.8,
  },
];

const mockStudentRequests = [
  {
    id: 1,
    student: {
      name: "Alex Turner",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    course: "React Fundamentals",
    message: "Requesting enrollment in the React course with priority access",
  },
  {
    id: 2,
    student: {
      name: "Maria Garcia",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    },
    course: "Advanced JavaScript",
    message: "Interested in the advanced concepts section",
  },
];

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("month");
  const [useMockData, setUseMockData] = useState(false);

  // RTK Query hooks
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery(timeRange, {
    skip: useMockData,
  });

  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    isError: activitiesError,
    refetch: refetchActivities,
  } = useGetRecentActivitiesQuery(undefined, {
    skip: useMockData,
  });

  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useGetUpcomingSessionsQuery(undefined, {
    skip: useMockData,
  });

  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsError,
    refetch: refetchRequests,
  } = useGetStudentRequestsQuery(undefined, {
    skip: useMockData,
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useGetCourseAnalyticsQuery(undefined, {
    skip: useMockData,
  });
  const wsRef = useRef(null);
  // Mutations
  const [approveStudentRequest] = useApproveStudentRequestMutation();
  const [rejectStudentRequest] = useRejectStudentRequestMutation();

  // Check if we should use mock data
  useEffect(() => {
    // Check if we're in development mode or API is not available
    const checkApiAvailability = async () => {
      try {
        const testResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/teacher/dashboard/stats`,
        );
        if (!testResponse.ok) {
          setUseMockData(true);
        }
      } catch (error) {
        console.log("API not available, using mock data");
        setUseMockData(true);
      }
    };

    if (process.env.NODE_ENV === "development") {
      checkApiAvailability();
    }
  }, []);

  // Calculate loading state
  const loading =
    (statsLoading ||
      activitiesLoading ||
      sessionsLoading ||
      requestsLoading ||
      analyticsLoading) &&
    !useMockData;

  // Use data from API or mock data
  const stats = useMockData ? mockStats : statsData || mockStats;
  const recentActivities = useMockData ? mockActivities : activitiesData || [];
  const upcomingSessions = useMockData
    ? mockUpcomingSessions
    : sessionsData || [];
  const studentRequests = useMockData
    ? mockStudentRequests
    : requestsData || [];
  const courseAnalytics = useMockData
    ? mockCourseAnalytics
    : analyticsData || [];

  // Setup WebSocket for real-time updates

  // Refresh all data
  const handleRefreshAll = () => {
    if (useMockData) {
      // Just force a re-render for mock data
      setTimeRange(timeRange);
      return;
    }

    refetchStats();
    refetchActivities();
    refetchSessions();
    refetchRequests();
    refetchAnalytics();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStartSession = (sessionId) => {
    navigate(`/teacher/live-session/${sessionId}`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  const handleApproveStudent = async (requestId) => {
    try {
      await approveStudentRequest(requestId).unwrap();
      // RTK will automatically refetch the data
    } catch (error) {
      console.error("Error approving student:", error);
      alert("Failed to approve student request. Please try again.");
    }
  };

  const handleRejectStudent = async (requestId) => {
    try {
      await rejectStudentRequest(requestId).unwrap();
    } catch (error) {
      console.error("Error rejecting student:", error);
      alert("Failed to reject student request. Please try again.");
    }
  };

  const handleCreateCourse = () => {
    navigate("/teacher/create-course");
  };

  const handleCreateSchoolCourse = () => {
    navigate("/teacher/create-School-course");
  };

  const handleViewAllCourses = () => {
    navigate("/teacher/courses");
  };

  const handleViewAllStudents = () => {
    navigate("/teacher/students");
  };

  const handleScheduleSession = () => {
    navigate("/teacher/schedule");
  };

  const toggleMockData = () => {
    setUseMockData(!useMockData);
    if (!useMockData) {
      // When switching to mock data, set a small delay to show loading
      setTimeout(() => {
        // Data will be updated from mock data
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          <button
            onClick={() => setUseMockData(true)}
            className="mt-4 text-sm text-orange-600 hover:text-orange-800"
          >
            Use Demo Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development Mode Banner */}
      {useMockData && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4">
          <div className="container mx-auto flex items-center justify-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Using Demo Data</span>
            <button
              onClick={toggleMockData}
              className="ml-4 text-sm underline hover:text-yellow-200"
            >
              Switch to Real Data
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
                <button
                  onClick={handleRefreshAll}
                  className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-orange-100 mt-2">
                Welcome back! Here's your teaching overview
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  <span>Teaching since: Jan 2024</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 fill-current" />
                  <span>Overall Rating: {stats.avgRating.toFixed(1)}/5</span>
                </div>
                {useMockData && (
                  <div className="flex items-center text-yellow-200">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Demo Mode</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 md:mt-0 flex items-center space-x-4">
              <button
                onClick={handleScheduleSession}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Session
              </button>
              <button
                onClick={handleCreateSchoolCourse}
                className="flex items-center px-4 py-2 bg-white text-violet-600 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                School Course
              </button>
              <button
                onClick={handleCreateCourse}
                className="flex items-center px-4 py-2 bg-white text-orange-600 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Overview</h2>
            <p className="text-gray-600">Your teaching performance analytics</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              {["day", "week", "month", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm capitalize ${
                    timeRange === range
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button
              onClick={toggleMockData}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {useMockData ? "Use Real Data" : "Use Demo Data"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                <div className="flex items-center mt-2">
                  <UserPlus className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +{stats.activeStudents} active
                  </span>
                  <span className="text-sm text-gray-500 ml-2">this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    {stats.publishedCourses} published
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {stats.pendingCourses} pending
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Earnings</p>
                <p className="text-3xl font-bold mt-2">
                  {formatCurrency(stats.thisMonthEarnings)}
                </p>
                <div className="flex items-center mt-2">
                  <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12%</span>
                  <span className="text-sm text-gray-500 ml-2">
                    from last month
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Completion</p>
                <p className="text-3xl font-bold mt-2">
                  {stats.completionRate}%
                </p>
                <div className="flex items-center mt-2">
                  {stats.completionRate >= 70 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      stats.completionRate >= 70
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stats.completionRate >= 70 ? "+5%" : "-3%"}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    student engagement
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <TargetIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Course Performance</h3>
                <button
                  onClick={handleViewAllCourses}
                  className="text-orange-600 hover:text-orange-800 text-sm flex items-center"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="space-y-4">
                {courseAnalytics.slice(0, 4).map((course) => (
                  <div
                    key={course.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-16 h-16 rounded-lg object-cover mr-4"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/64";
                          }}
                        />
                        <div>
                          <h4 className="font-bold">{course.title}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Users className="w-3 h-3 mr-1" />
                            <span>{course.enrollments} students</span>
                            <span className="mx-2">•</span>
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            <span>{course.rating.toFixed(1)}/5</span>
                            <span className="mx-2">•</span>
                            <span className="text-green-600">
                              {course.completionRate}% completion
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(course.revenue)}
                          </p>
                          <p className="text-sm text-gray-500">revenue</p>
                        </div>
                        <button
                          onClick={() => handleViewCourse(course.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="View Course Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Student Progress</span>
                        <span>{course.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Upcoming Sessions</h3>
                <button
                  onClick={() => navigate("/teacher/schedule")}
                  className="flex items-center text-orange-600 hover:text-orange-800"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  View Calendar
                </button>
              </div>

              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{session.title}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{session.date}</span>
                            <span className="mx-2">•</span>
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{session.time}</span>
                            <span className="mx-2">•</span>
                            <Users className="w-3 h-3 mr-1" />
                            <span>{session.students} students</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStartSession(session.id)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                          >
                            Start Session
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {session.timeRemaining && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg flex items-center">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-700">
                            Starting in {session.timeRemaining}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No upcoming sessions scheduled</p>
                    <button
                      onClick={handleScheduleSession}
                      className="mt-3 text-orange-600 hover:text-orange-800"
                    >
                      Schedule your first session
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-bold mb-6">Quick Actions</h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCreateCourse}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex flex-col items-center justify-center"
                >
                  <Plus className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="font-medium text-sm text-center">
                    Create Course
                  </span>
                </button>
                <button
                  onClick={handleCreateSchoolCourse}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition flex flex-col items-center justify-center"
                >
                  <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="font-medium text-sm text-center">
                    School Course
                  </span>
                </button>
                <button
                  onClick={() => navigate("/teacher/materials")}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition flex flex-col items-center justify-center"
                >
                  <FileText className="w-8 h-8 text-green-600 mb-2" />
                  <span className="font-medium text-sm text-center">
                    Add Materials
                  </span>
                </button>

                <button
                  onClick={() => navigate("/teacher/assignments")}
                  className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition flex flex-col items-center justify-center"
                >
                  <BookOpen className="w-8 h-8 text-yellow-600 mb-2" />
                  <span className="font-medium text-sm text-center">
                    Create Assignment
                  </span>
                </button>

                <button
                  onClick={() => navigate("/teacher/analytics")}
                  className="p-4 bg-red-50 hover:bg-red-100 rounded-lg transition flex flex-col items-center justify-center"
                >
                  <BarChart3 className="w-8 h-8 text-red-600 mb-2" />
                  <span className="font-medium text-sm text-center">
                    View Analytics
                  </span>
                </button>

                <button
                  onClick={() => navigate("/teacher/students")}
                  className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex flex-col items-center justify-center"
                >
                  <Users className="w-8 h-8 text-indigo-600 mb-2" />
                  <span className="font-medium text-sm text-center">
                    Manage Students
                  </span>
                </button>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Recent Activities</h3>
                <button
                  onClick={handleRefreshAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  title="Refresh Activities"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        activity.type === "student_enrolled"
                          ? "bg-green-100"
                          : activity.type === "new_rating"
                            ? "bg-yellow-100"
                            : activity.type === "new_message"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                      }`}
                    >
                      {activity.type === "student_enrolled" ? (
                        <UserPlus className="w-4 h-4 text-green-600" />
                      ) : activity.type === "new_rating" ? (
                        <Star className="w-4 h-4 text-yellow-600 fill-current" />
                      ) : activity.type === "new_message" ? (
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}

                {recentActivities.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No recent activities</p>
                  </div>
                )}
              </div>
            </div>

            {/* Student Requests */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Student Requests</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {studentRequests.length} pending
                </span>
              </div>

              <div className="space-y-4">
                {studentRequests.length > 0 ? (
                  studentRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <img
                            src={request.student?.avatar}
                            alt={request.student?.name}
                            className="w-10 h-10 rounded-full mr-3"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/40";
                            }}
                          />
                          <div>
                            <p className="font-medium">
                              {request.student?.name || "Unknown Student"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {request.course}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {request.message}
                      </p>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveStudent(request.id)}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectStudent(request.id)}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p>All requests processed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-bold mb-6">Quick Stats</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm">Total Hours Taught</span>
                  </div>
                  <span className="font-bold">
                    {formatTime(stats.totalHours)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm">Average Rating</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold mr-1">
                      {stats.avgRating.toFixed(1)}
                    </span>
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm">Unread Messages</span>
                  </div>
                  <span className="font-bold">12</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="text-sm">Pending Grading</span>
                  </div>
                  <span className="font-bold">8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Detailed Analytics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Revenue Analytics</h3>
              <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>

            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Revenue chart would appear here</p>
                <p className="text-xs text-gray-400 mt-2">
                  Connect to analytics service to view charts
                </p>
              </div>
            </div>
          </div>

          {/* Student Engagement */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Student Engagement</h3>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+8% this month</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Course Completion</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Assignment Submission</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Live Session Attendance</span>
                  <span>72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "72%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Doubt Resolution</span>
                  <span>94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: "94%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-500">
            <div>
              <p>© 2024 Teacher Dashboard. All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <button
                onClick={() => navigate("/teacher/help")}
                className="hover:text-orange-600 flex items-center"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help & Support
              </button>
              <button
                onClick={() => navigate("/teacher/settings")}
                className="hover:text-orange-600 flex items-center"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </button>
              <div className="text-xs">
                {useMockData ? "Demo Mode • " : "Live Mode • "}
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
