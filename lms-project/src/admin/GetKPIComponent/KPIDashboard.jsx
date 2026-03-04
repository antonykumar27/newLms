import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetKPIByProjectIdQuery,
  useCreateKPIRecordMutation,
  useUpdateKPIRecordMutation,
  useGetKPIDashboardQuery,
  useGetKPITrendsQuery,
  useGetKPIForecastQuery,
  useSetKPITargetsMutation,
} from "../../store/api/kpiApi";
import {
  Users,
  DollarSign,
  BookOpen,
  Activity,
  TrendingUp,
  Target,
  Clock,
  Calendar,
  Award,
  Crown,
  Medal,
  Trophy,
  Star,
  Heart,
  Zap,
  Sparkles,
  Flame,
  Droplet,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Bell,
  User,
  Settings,
  Menu,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  PlusCircle,
  HelpCircle,
  Info,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key,
  KeyRound,
  Fingerprint,
  ScanFace,
  ScanLine,
  ScanSearch,
  ScanText,
  ScanEye,
  Braces,
  Binary,
  Code,
  Codepen,
  Codesandbox,
  Command,
  Terminal,
  TerminalSquare,
  Workflow,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitGraph,
  Variable,
  Sigma,
  FunctionSquare,
  Infinity,
  ListPlus as ListPlusIcon,
  ListMinus as ListMinusIcon,
  ListX as ListXIcon,
  ListChecks as ListChecksIcon,
  ListTodo as ListTodoIcon,
  ListFilter as ListFilterIcon,
  ListTree as ListTreeIcon,
  ListVideo as ListVideoIcon,
  ListMusic as ListMusicIcon,
} from "lucide-react";

import UserMetricsCard from "./UserMetricsCard";
import FinancialMetricsCard from "./FinancialMetricsCard";
import ContentMetricsCard from "./ContentMetricsCard";
import EngagementMetricsCard from "./EngagementMetricsCard";
import MetricsChart from "./MetricsChart";
import HealthScoreCard from "./HealthScoreCard";
import BenchmarkCard from "./BenchmarkCard";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../utils/formatters";
import { toast } from "react-toastify";

const KPIDashboard = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [timeframe, setTimeframe] = useState("monthly");
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    user: true,
    financial: true,
    content: true,
    engagement: true,
  });

  // RTK Query hooks
  const { data, isLoading, error, refetch } = useGetKPIByProjectIdQuery(
    projectId,
    {
      skip: !projectId,
    },
  );
  const [createKPIRecord, { isLoading: isCreating }] =
    useCreateKPIRecordMutation();
  const [updateKPIRecord, { isLoading: isUpdating }] =
    useUpdateKPIRecordMutation();
  const [setTargets, { isLoading: isSettingTargets }] =
    useSetKPITargetsMutation();
  const { data: dashboardData } = useGetKPIDashboardQuery(projectId, {
    skip: !projectId,
  });
  const { data: trendsData } = useGetKPITrendsQuery(
    { projectId, days: 30 },
    {
      skip: !projectId,
    },
  );
  const { data: forecastData } = useGetKPIForecastQuery(
    { projectId, months: 12 },
    {
      skip: !projectId,
    },
  );

  // State for form data
  const [formData, setFormData] = useState({
    projectId: projectId,
    userMetrics: {
      totalRegisteredUsers: 1500,
      activeUsersMonthly: 800,
      activeUsersDaily: 350,
      newUsersThisMonth: 150,
      averageSessionDuration: 25,
      courseCompletionRate: 65,
    },
    financialMetrics: {
      mrr: 750000,
      arr: 9000000,
      arpu: 500,
      ltv: 6000,
      cac: 2000,
      ltvCacRatio: 3.0,
      churnRate: 4.5,
    },
    contentMetrics: {
      totalCourses: 45,
      totalVideoHours: 120,
      newContentPerMonth: 10,
      popularCourses: [
        {
          courseName: "React Masterclass",
          enrollments: 450,
          revenue: 225000,
        },
        {
          courseName: "Node.js Advanced",
          enrollments: 380,
          revenue: 190000,
        },
        {
          courseName: "Python for Beginners",
          enrollments: 520,
          revenue: 260000,
        },
      ],
      categoryWise: [
        { category: "Programming", courses: 20, enrollments: 1200 },
        { category: "Design", courses: 12, enrollments: 800 },
        { category: "Marketing", courses: 8, enrollments: 450 },
        { category: "Business", courses: 5, enrollments: 300 },
      ],
    },
    engagementMetrics: {
      averageWatchTime: 22,
      completionRate: 68,
      quizPassRate: 75,
      certificateEarned: 320,
      discussionPosts: 450,
    },
  });

  // State for targets
  const [targets, setTargetsd] = useState({
    totalUsers: 3000,
    mrr: 1500000,
    completionRate: 80,
    activeUsers: 1200,
  });

  useEffect(() => {
    if (data?.data?.kpi) {
      setFormData(data.data.kpi);
    }
  }, [data]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      if (data?.data?.kpi) {
        // Update existing
        await updateKPIRecord({
          id: data.data.kpi._id,
          ...formData,
        }).unwrap();
        toast.success("KPI record updated successfully!");
      } else {
        // Create new
        await createKPIRecord(formData).unwrap();
        toast.success("KPI record created successfully!");
      }
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong");
    }
  };

  const handleSetTargets = async () => {
    try {
      await setTargets({
        id: data.data.kpi._id,
        targets,
      }).unwrap();
      toast.success("Targets set successfully!");
      setShowTargetModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to set targets");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const healthScore = dashboardData?.data?.overview?.healthScore || 75;
  const healthStatus = dashboardData?.data?.overview?.status || "Healthy";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md text-center"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.data?.message || "Failed to load KPI data"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl"
              >
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  KPI Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Project ID: {projectId}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => refetch()}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              {["daily", "weekly", "monthly", "yearly"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    timeframe === tf
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Score Card */}
        <div className="mb-8">
          <HealthScoreCard score={healthScore} status={healthStatus} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                +12%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Users
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(formData.userMetrics.totalRegisteredUsers)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              ↑ 150 new this month
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                MRR
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Monthly Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.financialMetrics.mrr)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              ARR: {formatCurrency(formData.financialMetrics.arr)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                Courses
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Courses
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formData.contentMetrics.totalCourses}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {formData.contentMetrics.totalVideoHours} hours of content
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                Engagement
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Completion Rate
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formData.engagementMetrics.completionRate}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Avg watch time: {formData.engagementMetrics.averageWatchTime} min
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <MetricsChart
            data={trendsData}
            type="users"
            title="User Growth Trends"
          />
          <MetricsChart
            data={trendsData}
            type="revenue"
            title="Revenue Trends"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all ${
              isEditing
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Edit className="w-5 h-5" />
                <span>Edit KPI</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTargetModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Target className="w-5 h-5" />
            <span>Set Targets</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            <span>View Forecast</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </motion.button>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-6">
          {/* User Metrics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("user")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      User Metrics
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Active:{" "}
                      {formatNumber(formData.userMetrics.activeUsersMonthly)}{" "}
                      monthly
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    DAU/MAU:{" "}
                    {(
                      (formData.userMetrics.activeUsersDaily /
                        formData.userMetrics.activeUsersMonthly) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  {expandedSections.user ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.user && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <UserMetricsCard
                      data={formData.userMetrics}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Financial Metrics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("financial")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Financial Metrics
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      LTV/CAC:{" "}
                      {formData.financialMetrics.ltvCacRatio.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Churn: {formData.financialMetrics.churnRate}%
                  </span>
                  {expandedSections.financial ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.financial && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <FinancialMetricsCard
                      data={formData.financialMetrics}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Content Metrics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("content")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Content Metrics
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.contentMetrics.totalCourses} courses •{" "}
                      {formData.contentMetrics.totalVideoHours} hours
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    New: {formData.contentMetrics.newContentPerMonth}/mo
                  </span>
                  {expandedSections.content ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.content && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <ContentMetricsCard
                      data={formData.contentMetrics}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Engagement Metrics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("engagement")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Engagement Metrics
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.engagementMetrics.discussionPosts} discussions
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    {formData.engagementMetrics.certificateEarned} certificates
                  </span>
                  {expandedSections.engagement ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.engagement && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <EngagementMetricsCard
                      data={formData.engagementMetrics}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Benchmark Section */}
        <div className="mt-8">
          <BenchmarkCard data={dashboardData?.data?.benchmarks} />
        </div>

        {/* Save Button (Mobile) */}
        {isEditing && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-6 left-0 right-0 mx-auto w-max lg:hidden"
          >
            <button
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
              className="px-8 py-4 bg-green-600 text-white rounded-full font-medium flex items-center space-x-2 shadow-2xl hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </main>

      {/* Set Targets Modal */}
      <AnimatePresence>
        {showTargetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTargetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Set KPI Targets
                </h3>
                <button
                  onClick={() => setShowTargetModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Users Target
                  </label>
                  <input
                    type="number"
                    value={targets.totalUsers}
                    onChange={(e) =>
                      setTargets({
                        ...targets,
                        totalUsers: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    MRR Target (₹)
                  </label>
                  <input
                    type="number"
                    value={targets.mrr}
                    onChange={(e) =>
                      setTargets({
                        ...targets,
                        mrr: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Completion Rate Target (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targets.completionRate}
                    onChange={(e) =>
                      setTargets({
                        ...targets,
                        completionRate: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Active Users Target
                  </label>
                  <input
                    type="number"
                    value={targets.activeUsers}
                    onChange={(e) =>
                      setTargets({
                        ...targets,
                        activeUsers: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  onClick={handleSetTargets}
                  disabled={isSettingTargets}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSettingTargets ? "Setting..." : "Set Targets"}
                </button>
                <button
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KPIDashboard;
