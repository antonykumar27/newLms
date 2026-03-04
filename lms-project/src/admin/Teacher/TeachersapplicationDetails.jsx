import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreVertical,
  Download,
  FileText,
  Users,
  RefreshCw,
  ChevronDown,
  UserCheck,
  UserX,
  Calendar,
  Award,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  DollarSign,
  GraduationCap,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  SortAsc,
  SortDesc,
  BarChart3,
  Grid3x3,
  List,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  useBulkActionMutation,
  useRejectApplicationMutation,
  useApproveApplicationMutation,
  useGetApplicationByIdQuery,
  useGetApplicationsQuery,
  useRefreshTokenMutation,
} from "../../store/api/AdminCourseRelatedDecision";
import ApplicationAcceptOrRemove from "./TeacherApplicationAcceptOrRemove";

const TeachersapplicationDetails = () => {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  // View mode (grid/list)
  const [viewMode, setViewMode] = useState("list");

  // State variables
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    page: 1,
    limit: 10,
    sortBy: "applicationDate",
    sortOrder: "desc",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionStatus, setActionStatus] = useState({
    type: "",
    message: "",
    show: false,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // RTK Query hooks
  const {
    data: applicationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetApplicationsQuery(filters);

  useEffect(() => {
    refetch();
  }, [applicationsData, refetch]);

  const { data: appDetails, isLoading: detailsLoading } =
    useGetApplicationByIdQuery(selectedId, {
      skip: !selectedId,
    });

  // Mutations
  const [approveApp, { isLoading: approving }] =
    useApproveApplicationMutation();
  const [rejectApp, { isLoading: rejecting }] = useRejectApplicationMutation();
  const [bulkActionApi, { isLoading: bulkProcessing }] =
    useBulkActionMutation();

  // Show status message
  const showStatusMessage = (type, message) => {
    setActionStatus({ type, message, show: true });
    setTimeout(() => {
      setActionStatus({ type: "", message: "", show: false });
    }, 3000);
  };

  // Extract data
  const applications = applicationsData?.data?.applications || [];

  const pagination = applicationsData?.data?.pagination || {};
  const stats = applicationsData?.data?.stats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  // Fetch application details
  const fetchApplicationDetails = (id) => {
    setSelectedId(id);
    setShowDetails(true);
  };

  // Approve application
  const handleApprove = async (id, notes = "") => {
    if (!window.confirm("Are you sure you want to approve this application?"))
      return;

    setIsProcessing(true);
    try {
      await approveApp({ id, adminNotes: notes }).unwrap();
      showStatusMessage("success", "✅ Application approved successfully!");
      setShowDetails(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      showStatusMessage(
        "error",
        err?.data?.message || "Failed to approve application",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject application
  const handleReject = async (id, reason = "", feedback = "") => {
    if (!window.confirm("Are you sure you want to reject this application?"))
      return;

    setIsProcessing(true);
    try {
      await rejectApp({ id, reason, feedback }).unwrap();
      showStatusMessage("success", "❌ Application rejected successfully!");
      setShowDetails(false);
      setSelectedId(null);
      refetch();
    } catch (err) {
      showStatusMessage(
        "error",
        err?.data?.message || "Failed to reject application",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk action
  const handleBulkAction = async () => {
    if (!bulkAction || selectedApplications.length === 0) {
      showStatusMessage(
        "error",
        "Please select an action and at least one application",
      );
      return;
    }

    if (bulkAction === "reject" && !bulkReason.trim()) {
      showStatusMessage("error", "Please provide a reason for rejection");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to ${bulkAction} ${selectedApplications.length} application(s)?`,
      )
    ) {
      return;
    }

    try {
      const res = await bulkActionApi({
        action: bulkAction,
        applicationIds: selectedApplications,
        reason: bulkAction === "reject" ? bulkReason : undefined,
      }).unwrap();

      showStatusMessage(
        "success",
        `${res.data.modifiedCount} application(s) ${bulkAction}ed successfully!`,
      );
      setSelectedApplications([]);
      setBulkAction("");
      setBulkReason("");
      setShowBulkAction(false);
      refetch();
    } catch (err) {
      showStatusMessage(
        "error",
        err?.data?.message || "Failed to perform bulk action",
      );
    }
  };

  // Select/deselect all
  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map((app) => app._id));
    }
  };

  // Handle application selection
  const handleSelectApplication = (id) => {
    if (selectedApplications.includes(id)) {
      setSelectedApplications(
        selectedApplications.filter((appId) => appId !== id),
      );
    } else {
      setSelectedApplications([...selectedApplications, id]);
    }
  };

  // Update filters
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
        icon: <Clock className="w-3 h-3" />,
      },
      approved: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      rejected: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        icon: <XCircle className="w-3 h-3" />,
      },
    };

    const { color, icon } = config[status] || {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      icon: null,
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${color}`}
      >
        {icon}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  // Export to CSV
  const handleExport = () => {
    const csvData = applications.map((app) => ({
      Name: app.name,
      Email: app.email,
      Status: app.applicationStatus,
      "Hourly Rate": `$${app.hourlyRate || 0}`,
      "Applied Date": new Date(app.applicationDate).toLocaleDateString(),
      Expertise: app.expertise?.join(", ") || "",
    }));

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teacher-applications-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Status Message Component
  const StatusMessage = () => {
    if (!actionStatus.show) return null;

    const bgColor =
      actionStatus.type === "success"
        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
        : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
    const textColor =
      actionStatus.type === "success"
        ? "text-green-800 dark:text-green-300"
        : "text-red-800 dark:text-red-300";

    return (
      <div
        className={`fixed top-4 right-4 ${bgColor} border rounded-lg p-4 shadow-lg z-50 animate-slide-in`}
      >
        <div className="flex items-center">
          {actionStatus.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          )}
          <span className={`font-medium ${textColor}`}>
            {actionStatus.message}sssssssssssssssssssssssss
          </span>
        </div>
      </div>
    );
  };

  // Add CSS animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Loading skeleton
  if (isLoading && !applications.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"
              ></div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <StatusMessage />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between md:justify-start">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Teacher Applications
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Review and manage teacher applications
                </p>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Theme toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* View mode toggle */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 ${
                    isLoading ? "animate-spin" : ""
                  } text-gray-600 dark:text-gray-400`}
                />
              </button>

              <button
                onClick={handleExport}
                disabled={applications.length === 0}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                title="Export CSV"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {selectedApplications.length > 0 && (
                <button
                  onClick={() => setShowBulkAction(true)}
                  className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
                >
                  Bulk ({selectedApplications.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold dark:text-white">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="applicationDate">Newest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="hourlyRate">Hourly Rate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items per page
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) =>
                    handleFilterChange("limit", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 md:py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </p>
                <p className="text-xl font-bold mt-1 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-xl font-bold mt-1 dark:text-white">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Approved
                </p>
                <p className="text-xl font-bold mt-1 dark:text-white">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Rejected
                </p>
                <p className="text-xl font-bold mt-1 dark:text-white">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search by name, email, or bio..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="applicationDate">Newest</option>
                <option value="name">Name A-Z</option>
                <option value="hourlyRate">Hourly Rate</option>
              </select>

              <select
                value={filters.limit}
                onChange={(e) =>
                  handleFilterChange("limit", parseInt(e.target.value))
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>

          {/* Selected applications */}
          {selectedApplications.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedApplications.length === applications.length &&
                      applications.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 font-medium text-sm dark:text-white">
                    {selectedApplications.length} selected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedApplications([])}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowBulkAction(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    Bulk Action
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Applications View */}
        {viewMode === "list" ? (
          /* Table View */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedApplications.length === applications.length &&
                          applications.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Applicant
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Expertise
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rate
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Applied
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length > 0 ? (
                    applications.map((application) => (
                      <tr
                        key={application._id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(
                              application._id,
                            )}
                            onChange={() =>
                              handleSelectApplication(application._id)
                            }
                            className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              {application.user.parishImage ? (
                                <img
                                  src={application.user.parishImage}
                                  alt={application.user.name}
                                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                                  {application?.user?.name?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-medium text-sm truncate dark:text-white">
                                {application.user.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {application.user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {getStatusBadge(application.applicationStatus)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {application?.profile?.expertise
                              ?.slice(0, 2)
                              .map((skill, index) => (
                                <span
                                  key={skill._id || index}
                                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs truncate"
                                >
                                  {skill.name} {/* ✅ THIS IS THE FIX */}
                                </span>
                              ))}

                            {application?.profile?.expertise?.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                +{application.profile.expertise.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mr-1" />
                            <span className="font-medium text-sm dark:text-white">
                              {application?.payment.hourlyRate || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs md:text-sm dark:text-gray-300">
                            {new Date(
                              application.application.submittedAt,
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                fetchApplicationDetails(application._id)
                              }
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {application.applicationStatus === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(application._id)}
                                  disabled={approving}
                                  className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleReject(
                                      application._id,
                                      "Does not meet requirements",
                                      "Please improve your qualifications",
                                    )
                                  }
                                  disabled={rejecting}
                                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          No applications found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {filters.search || filters.status !== "all"
                            ? "Try adjusting your filters"
                            : "No teacher applications yet"}
                        </p>
                        {(filters.search || filters.status !== "all") && (
                          <button
                            onClick={() =>
                              setFilters({
                                status: "all",
                                search: "",
                                page: 1,
                                limit: 10,
                                sortBy: "applicationDate",
                                sortOrder: "desc",
                              })
                            }
                            className="mt-3 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          >
                            Clear Filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {applications.length > 0 ? (
              applications.map((application) => (
                <div
                  key={application._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                        {application.user.parishImage ? (
                          <img
                            src={application.user.parishImage}
                            alt={application.user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
                            {application.user.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {application.user.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {application.user.email}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(application.applicationStatus)}
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {application.expertise
                        ?.slice(0, 3)
                        .map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-4 h-4 mr-1" />$
                        {application.payment.hourlyRate || 0}/hr
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {new Date(
                          application.application.submittedAt,
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => fetchApplicationDetails(application._id)}
                      className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      View Details
                    </button>
                    <div className="flex items-center gap-2">
                      {application.applicationStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(application._id)}
                            className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleReject(
                                application._id,
                                "Does not meet requirements",
                              )
                            }
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  No applications found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {filters.search || filters.status !== "all"
                    ? "Try adjusting your filters"
                    : "No teacher applications yet"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {applications.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Showing {(filters.page - 1) * filters.limit + 1} to{" "}
              {Math.min(filters.page * filters.limit, pagination.total)} of{" "}
              {pagination.total} applications
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleFilterChange("page", filters.page - 1)}
                disabled={filters.page <= 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (filters.page <= 3) {
                    pageNum = i + 1;
                  } else if (filters.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = filters.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleFilterChange("page", pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        filters.page === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}

              {pagination.totalPages > 5 &&
                filters.page < pagination.totalPages - 2 && (
                  <span className="px-2 text-gray-500 dark:text-gray-400">
                    ...
                  </span>
                )}

              <button
                onClick={() => handleFilterChange("page", filters.page + 1)}
                disabled={filters.page >= pagination.totalPages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetails && (
        <ApplicationAcceptOrRemove
          detailsLoading={detailsLoading}
          appDetails={appDetails}
          getStatusBadge={getStatusBadge}
          onClose={() => {
            setShowDetails(false);
            setSelectedId(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={isProcessing}
          darkMode={darkMode}
        />
      )}

      {/* Bulk Action Modal */}
      {showBulkAction && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Bulk Action
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Apply action to {selectedApplications.length} selected
                applications
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Action
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose action</option>
                  <option value="approve">Approve Selected</option>
                  <option value="reject">Reject Selected</option>
                </select>
              </div>

              {bulkAction === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This reason will be shared with all rejected applicants
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkAction(false);
                  setBulkAction("");
                  setBulkReason("");
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={
                  !bulkAction ||
                  (bulkAction === "reject" && !bulkReason.trim()) ||
                  bulkProcessing
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center"
              >
                {bulkProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Action"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersapplicationDetails;
