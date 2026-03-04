import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetInfrastructureByProjectIdQuery,
  useCreateInfrastructureMutation,
  useUpdateInfrastructureMutation,
  useGetOptimizationSuggestionsQuery,
  useGetMonthlyBreakdownQuery,
  useUpgradeBackendTierMutation,
  useUpgradeDatabaseTierMutation,
  useLazyCheckInfrastructureExistsQuery,
} from "../../store/api/infrastructureApi";
import {
  Cloud,
  Database,
  HardDrive,
  Activity,
  Server,
  Zap,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  LogOut,
  User,
  Bell,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  Settings2,
  Layout,
  Grid,
  List,
  Star,
  StarOff,
  Heart,
  Share2,
  MoreVertical,
  MoreHorizontal,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MessageCircle,
  MessageSquare,
  Mail,
  Send,
  Inbox,
  Archive,
  Bookmark,
  BookOpen,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin,
  Globe,
  Link,
  Paperclip,
  Image,
  FileText,
  File,
  Folder,
  FolderOpen,
  Download as DownloadIcon,
  Camera as CameraIcon,
  Video as VideoIcon,
  Mic as MicIcon,
  Music,
  Radio as RadioIcon,
  Disc,
  Disc3,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
} from "lucide-react";

import CloudHostingCard from "./CloudHostingCard";
import StorageCard from "./StorageCard";
import ThirdPartyCard from "./ThirdPartyCard";
import CostChart from "./CostChart";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../utils/formatters";
import { toast } from "react-toastify";

const InfrastructureDashboard = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showOptimizations, setShowOptimizations] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeType, setUpgradeType] = useState(null);
  const [selectedTier, setSelectedTier] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    cloud: true,
    storage: true,
    thirdParty: true,
  });

  // RTK Query hooks
  const [checkInfrastructure, { data: existsData, isLoading: isChecking }] =
    useLazyCheckInfrastructureExistsQuery();
  const { data, isLoading, error, refetch } =
    useGetInfrastructureByProjectIdQuery(projectId, {
      skip: !projectId,
    });
  const [createInfrastructure, { isLoading: isCreating }] =
    useCreateInfrastructureMutation();
  const [updateInfrastructure, { isLoading: isUpdating }] =
    useUpdateInfrastructureMutation();
  const { data: optimizationData } = useGetOptimizationSuggestionsQuery(
    data?.data?.sponsors?._id,
    {
      skip: !data?.data?.sponsors?._id,
    },
  );
  const { data: monthlyData } = useGetMonthlyBreakdownQuery(
    data?.data?.sponsors?._id,
    {
      skip: !data?.data?.sponsors?._id,
    },
  );
  const [upgradeBackend] = useUpgradeBackendTierMutation();
  const [upgradeDatabase] = useUpgradeDatabaseTierMutation();

  // State for form
  const [formData, setFormData] = useState({
    projectId: projectId,
    cloudHosting: {
      backendServers: {
        tier: "small",
        monthly: 3700,
        specs: {
          cpu: 2,
          ram: 4,
          storage: 80,
          bandwidth: 1000,
        },
      },
      databaseServers: {
        tier: "free",
        monthly: 0,
        specs: {
          storage: 0.5,
          connections: 100,
        },
      },
      redisServers: {
        tier: "free",
        monthly: 0,
      },
    },
    storageAndCDN: {
      videoStorage: {
        provider: "awsS3",
        monthlyStorage: 100,
        monthlyCost: 4100,
      },
      cdn: {
        provider: "cloudflare",
        monthlyBandwidth: 500,
        monthlyCost: 0,
      },
      backups: {
        automatedBackups: {
          monthly: 1230,
          retention: 30,
        },
        disasterRecovery: {
          setup: 25000,
          monthly: 5000,
        },
      },
    },
    thirdPartyServices: {
      emailService: {
        provider: "sendgrid",
        monthlyLimit: 50000,
        monthlyCost: 1500,
      },
      smsService: {
        provider: "msg91",
        monthlyLimit: 10000,
        monthlyCost: 2000,
      },
      paymentGateway: {
        provider: "razorpay",
        setupFee: 10000,
        monthlyFee: 2000,
        transactionFee: 2,
      },
      videoConferencing: {
        provider: "zoom",
        monthlyMinutes: 5000,
        monthlyCost: 5000,
      },
      monitoring: {
        sentry: {
          monthly: 1640,
          events: 50000,
        },
        datadog: {
          monthly: 0,
        },
      },
    },
  });

  useEffect(() => {
    if (projectId) {
      checkInfrastructure(projectId);
    }
  }, [projectId, checkInfrastructure]);

  useEffect(() => {
    if (data?.data?.sponsors) {
      setFormData(data.data.sponsors);
    }
  }, [data]);

  const handleInputChange = (section, subsection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section]?.[subsection],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      if (data?.data?.sponsors) {
        // Update existing
        await updateInfrastructure({
          id: data.data.sponsors._id,
          ...formData,
        }).unwrap();
        toast.success("Infrastructure updated successfully!");
      } else {
        // Create new
        await createInfrastructure(formData).unwrap();
        toast.success("Infrastructure created successfully!");
      }
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong");
    }
  };

  const handleUpgrade = async () => {
    try {
      if (upgradeType === "backend") {
        await upgradeBackend({
          id: data.data.sponsors._id,
          newTier: selectedTier,
        }).unwrap();
        toast.success(`Backend tier upgraded to ${selectedTier}`);
      } else if (upgradeType === "database") {
        await upgradeDatabase({
          id: data.data.sponsors._id,
          newTier: selectedTier,
        }).unwrap();
        toast.success(`Database tier upgraded to ${selectedTier}`);
      }
      setShowUpgradeModal(false);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Upgrade failed");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-blue-500" />
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
            {error.data?.message || "Failed to load infrastructure data"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105"
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
                className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl"
              >
                <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Infrastructure Cost Management
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
                <Bell className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                +12.5%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Monthly Cost
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                data?.data?.sponsors?.totalInfrastructureMonthly || 0,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              ↓ 3% from last month
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full">
                -2.1%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Yearly Cost
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                data?.data?.sponsors?.totalInfrastructureYearly || 0,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Projected for 2026
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Cloud className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                +5.8%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Cloud Cost
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                data?.data?.sponsors?.cloudHosting?.totalCloudMonthly || 0,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              45% of total cost
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
                <HardDrive className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                +8.3%
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Storage Cost
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                data?.data?.sponsors?.storageAndCDN?.totalStorageMonthly || 0,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              1.2 TB used
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CostChart data={monthlyData} type="monthly" />
          <CostChart data={optimizationData} type="optimization" />
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
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Edit className="w-5 h-5" />
                <span>Edit Infrastructure</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOptimizations(!showOptimizations)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Zap className="w-5 h-5" />
            <span>Optimization Suggestions</span>
            {optimizationData?.data?.suggestions?.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                {optimizationData.data.suggestions.length}
              </span>
            )}
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

        {/* Optimization Suggestions Panel */}
        <AnimatePresence>
          {showOptimizations && optimizationData?.data?.suggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Zap className="w-6 h-6 mr-2" />
                  Cost Optimization Suggestions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optimizationData.data.suggestions.map(
                    (suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">
                            {suggestion.category}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              suggestion.difficulty === "easy"
                                ? "bg-green-500/30 text-green-200"
                                : suggestion.difficulty === "medium"
                                  ? "bg-yellow-500/30 text-yellow-200"
                                  : "bg-red-500/30 text-red-200"
                            }`}
                          >
                            {suggestion.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-white/80 mb-3">
                          {suggestion.suggestion}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span>Potential savings:</span>
                          <span className="font-bold">
                            {formatCurrency(suggestion.savings)}/year
                          </span>
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Infrastructure Sections */}
        <div className="space-y-6">
          {/* Cloud Hosting Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("cloud")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Cloud Hosting
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monthly:{" "}
                      {formatCurrency(
                        formData.cloudHosting.backendServers.monthly +
                          formData.cloudHosting.databaseServers.monthly +
                          formData.cloudHosting.redisServers.monthly,
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    3-year:{" "}
                    {formatCurrency(
                      (formData.cloudHosting.backendServers.monthly +
                        formData.cloudHosting.databaseServers.monthly +
                        formData.cloudHosting.redisServers.monthly) *
                        36,
                    )}
                  </span>
                  {expandedSections.cloud ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.cloud && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <CloudHostingCard
                      data={formData.cloudHosting}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                      onUpgrade={(type) => {
                        setUpgradeType(type);
                        setShowUpgradeModal(true);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Storage & CDN Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("storage")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <HardDrive className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Storage & CDN
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monthly:{" "}
                      {formatCurrency(
                        formData.storageAndCDN.videoStorage.monthlyCost +
                          formData.storageAndCDN.cdn.monthlyCost +
                          formData.storageAndCDN.backups.automatedBackups
                            .monthly,
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    3-year:{" "}
                    {formatCurrency(
                      (formData.storageAndCDN.videoStorage.monthlyCost +
                        formData.storageAndCDN.cdn.monthlyCost +
                        formData.storageAndCDN.backups.automatedBackups
                          .monthly) *
                        36,
                    )}
                  </span>
                  {expandedSections.storage ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.storage && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <StorageCard
                      data={formData.storageAndCDN}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Third-Party Services Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("thirdParty")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Third-Party Services
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monthly:{" "}
                      {formatCurrency(
                        formData.thirdPartyServices.emailService.monthlyCost +
                          formData.thirdPartyServices.smsService.monthlyCost +
                          formData.thirdPartyServices.paymentGateway
                            .monthlyFee +
                          formData.thirdPartyServices.videoConferencing
                            .monthlyCost +
                          formData.thirdPartyServices.monitoring.sentry.monthly,
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    3-year:{" "}
                    {formatCurrency(
                      (formData.thirdPartyServices.emailService.monthlyCost +
                        formData.thirdPartyServices.smsService.monthlyCost +
                        formData.thirdPartyServices.paymentGateway.monthlyFee +
                        formData.thirdPartyServices.videoConferencing
                          .monthlyCost +
                        formData.thirdPartyServices.monitoring.sentry.monthly) *
                        36,
                    )}
                  </span>
                  {expandedSections.thirdParty ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.thirdParty && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <ThirdPartyCard
                      data={formData.thirdPartyServices}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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
                  <Check className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </main>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Upgrade {upgradeType === "backend" ? "Backend" : "Database"}{" "}
                Tier
              </h3>

              <div className="space-y-4 mb-6">
                {upgradeType === "backend"
                  ? ["small", "medium", "large"].map((tier) => (
                      <label
                        key={tier}
                        className={`block p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedTier === tier
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="tier"
                          value={tier}
                          checked={selectedTier === tier}
                          onChange={(e) => setSelectedTier(e.target.value)}
                          className="hidden"
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {tier}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {tier === "small" && "₹3,700/mo"}
                            {tier === "medium" && "₹7,500/mo"}
                            {tier === "large" && "₹15,000/mo"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                          {tier === "small" && "2 vCPU, 4GB RAM, 80GB SSD"}
                          {tier === "medium" && "4 vCPU, 8GB RAM, 160GB SSD"}
                          {tier === "large" && "8 vCPU, 16GB RAM, 320GB SSD"}
                        </div>
                      </label>
                    ))
                  : ["free", "m10", "m20", "m30"].map((tier) => (
                      <label
                        key={tier}
                        className={`block p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedTier === tier
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="tier"
                          value={tier}
                          checked={selectedTier === tier}
                          onChange={(e) => setSelectedTier(e.target.value)}
                          className="hidden"
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white uppercase">
                            {tier}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {tier === "free" && "Free"}
                            {tier === "m10" && "₹4,100/mo"}
                            {tier === "m20" && "₹8,200/mo"}
                            {tier === "m30" && "₹16,400/mo"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                          {tier === "free" && "512MB storage, 100 connections"}
                          {tier === "m10" && "1GB storage, 500 connections"}
                          {tier === "m20" && "2GB storage, 1000 connections"}
                          {tier === "m30" && "4GB storage, 2000 connections"}
                        </div>
                      </label>
                    ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleUpgrade}
                  disabled={!selectedTier}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upgrade
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
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

export default InfrastructureDashboard;
