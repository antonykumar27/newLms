import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetContentPlanByProjectIdQuery,
  useCreateContentPlanMutation,
  useUpdateContentPlanMutation,
  useGetCostBreakdownQuery,
  useGetBudgetProjectionQuery,
  useAddCameraMutation,
  useAddFullTimeTeacherMutation,
  useAddPartTimeTeacherMutation,
  useUpdateVideoProductionMutation,
} from "../../store/api/contentCreationApi";
import {
  Camera,
  Video,
  Users,
  PenTool,
  DollarSign,
  Calendar,
  TrendingUp,
  PieChart,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
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
  Clock,
  BarChart3,
  LineChart,
  Activity,
  Cpu,
  HardDrive,
  Mic,
  Music,
  Monitor,
  Camera as CameraIcon,
  Video as VideoIcon,
  Film,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Headphones,
  Speaker,
  Radio,
  Disc,
  Disc3,
  Award,
  Crown,
  Medal,
  Trophy,
  Star,
  StarOff,
  Heart,
  Share2,
  MoreVertical,
  MoreHorizontal,
  Copy,
  Check,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus as PlusIcon,
  Edit3,
  Trash,
  PlusCircle,
  MinusCircle,
  X as XIcon,
  CheckSquare,
  Square,
  Radio as RadioIcon,
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
  Upload as UploadIcon,
  CreditCard,
  Wallet,
  ShoppingCart,
  ShoppingBag,
  Gift,
  Target,
  Compass,
  Navigation,
  Map,
  Layers,
  Box,
  Package,
} from "lucide-react";

import StudioEquipmentCard from "./StudioEquipmentCard";
import InstructorCard from "./InstructorCard";
import ProductionCard from "./ProductionCard";
import CostBreakdownChart from "./CostBreakdownChart";
import BudgetProjectionChart from "./BudgetProjectionChart";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import { toast } from "react-toastify";

const ContentCreationDashboard = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    studio: true,
    instructors: true,
    production: true,
  });

  // RTK Query hooks
  const { data, isLoading, error, refetch } = useGetContentPlanByProjectIdQuery(
    projectId,
    {
      skip: !projectId,
    },
  );
  const [createContentPlan, { isLoading: isCreating }] =
    useCreateContentPlanMutation();
  const [updateContentPlan, { isLoading: isUpdating }] =
    useUpdateContentPlanMutation();
  const { data: breakdownData } = useGetCostBreakdownQuery(
    data?.data?.contentPlan?._id,
    {
      skip: !data?.data?.contentPlan?._id,
    },
  );
  const { data: projectionData } = useGetBudgetProjectionQuery(
    data?.data?.contentPlan?._id,
    {
      skip: !data?.data?.contentPlan?._id,
    },
  );
  const [addCamera] = useAddCameraMutation();
  const [addFullTimeTeacher] = useAddFullTimeTeacherMutation();
  const [addPartTimeTeacher] = useAddPartTimeTeacherMutation();
  const [updateVideoProduction] = useUpdateVideoProductionMutation();

  // State for form data
  const [formData, setFormData] = useState({
    projectId: projectId,
    studioEquipment: {
      recordingRoom: {
        type: "owned",
        monthlyRent: 0,
        soundproofing: 0,
        lightingSetup: 0,
        greenScreen: 0,
        furniture: 0,
        totalSetup: 0,
      },
      cameras: [],
      audioEquipment: [],
      lighting: [],
      computers: [],
      softwareLicenses: [],
      totalStudioEquipment: 0,
    },
    instructorCosts: {
      fullTimeTeachers: [],
      partTimeTeachers: [],
      guestLecturers: [],
      contentWriters: [],
      videoEditors: [],
      totalInstructorMonthly: 0,
      totalInstructorYearly: 0,
      totalInstructorThreeYear: 0,
    },
    contentProduction: {
      videoProduction: {
        costPerMinute: 1000,
        minutesPerMonth: 100,
        monthlyCost: 100000,
        threeYearCost: 3600000,
      },
      graphicDesign: {
        costPerAsset: 500,
        assetsPerMonth: 20,
        monthlyCost: 10000,
      },
      animation: {
        costPerSecond: 200,
        secondsPerMonth: 50,
        monthlyCost: 10000,
      },
      totalProductionMonthly: 120000,
      totalProductionThreeYear: 4320000,
    },
    totalContentThreeYear: 0,
  });

  useEffect(() => {
    if (data?.data?.contentPlan) {
      setFormData(data.data.contentPlan);
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
      if (data?.data?.contentPlan) {
        // Update existing
        await updateContentPlan({
          id: data.data.contentPlan._id,
          ...formData,
        }).unwrap();
        toast.success("Content plan updated successfully!");
      } else {
        // Create new
        await createContentPlan(formData).unwrap();
        toast.success("Content plan created successfully!");
      }
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong");
    }
  };

  const handleAddCamera = async (cameraData) => {
    try {
      await addCamera({
        id: data.data.contentPlan._id,
        ...cameraData,
      }).unwrap();
      toast.success("Camera added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add camera");
    }
  };

  const handleAddTeacher = async (teacherData) => {
    try {
      if (teacherData.type === "fulltime") {
        await addFullTimeTeacher({
          id: data.data.contentPlan._id,
          ...teacherData,
        }).unwrap();
      } else {
        await addPartTimeTeacher({
          id: data.data.contentPlan._id,
          ...teacherData,
        }).unwrap();
      }
      toast.success("Teacher added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add teacher");
    }
  };

  const handleUpdateVideoProduction = async (productionData) => {
    try {
      await updateVideoProduction({
        id: data.data.contentPlan._id,
        ...productionData,
      }).unwrap();
      toast.success("Video production updated!");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Update failed");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: Activity },
    { id: "studio", name: "Studio Equipment", icon: Camera },
    { id: "instructors", name: "Instructors", icon: Users },
    { id: "production", name: "Production", icon: Video },
    { id: "budget", name: "Budget", icon: DollarSign },
  ];

  if (isLoading) {
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
            {error.data?.message || "Failed to load content plan"}
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
                className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl"
              >
                <Film className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Content Creation Management
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
                className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
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
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                Total 3Y
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Investment
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalContentThreeYear || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Over 3 years
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                Equipment
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Studio Equipment
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                formData.studioEquipment.totalStudioEquipment || 0,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {formData.studioEquipment.cameras?.length || 0} Cameras
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
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                Monthly
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Instructor Costs
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                formData.instructorCosts.totalInstructorMonthly || 0,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {formData.instructorCosts.fullTimeTeachers?.length || 0} Full-time
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
                <Video className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                Monthly
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Production Costs
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                formData.contentProduction.totalProductionMonthly || 0,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {formData.contentProduction.videoProduction.minutesPerMonth || 0}{" "}
              mins/month
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CostBreakdownChart data={breakdownData} />
            <BudgetProjectionChart data={projectionData} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all ${
              isEditing
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
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
                <span>Edit Plan</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("camera");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Camera</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("teacher");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Users className="w-5 h-5" />
            <span>Add Teacher</span>
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
          {/* Studio Equipment Section */}
          {(activeTab === "studio" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("studio")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Studio Equipment
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total:{" "}
                        {formatCurrency(
                          formData.studioEquipment.totalStudioEquipment || 0,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {formData.studioEquipment.cameras?.length || 0} Cameras
                    </span>
                    {expandedSections.studio ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.studio && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <StudioEquipmentCard
                        data={formData.studioEquipment}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                        planId={data?.data?.contentPlan?._id}
                        onRefresh={refetch}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Instructors Section */}
          {(activeTab === "instructors" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("instructors")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Instructors & Staff
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monthly:{" "}
                        {formatCurrency(
                          formData.instructorCosts.totalInstructorMonthly || 0,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {formData.instructorCosts.fullTimeTeachers?.length || 0}{" "}
                      Full-time
                    </span>
                    {expandedSections.instructors ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.instructors && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <InstructorCard
                        data={formData.instructorCosts}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                        planId={data?.data?.contentPlan?._id}
                        onRefresh={refetch}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Production Section */}
          {(activeTab === "production" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("production")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Content Production
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monthly:{" "}
                        {formatCurrency(
                          formData.contentProduction.totalProductionMonthly ||
                            0,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {formData.contentProduction.videoProduction
                        .minutesPerMonth || 0}{" "}
                      mins/month
                    </span>
                    {expandedSections.production ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.production && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <ProductionCard
                        data={formData.contentProduction}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                        onUpdateVideo={handleUpdateVideoProduction}
                        planId={data?.data?.contentPlan?._id}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Budget Section */}
          {activeTab === "budget" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Budget Projection
              </h2>
              <BudgetProjectionChart data={projectionData} fullWidth />
            </motion.div>
          )}
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

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {addType === "camera" ? "Add Camera" : "Add Teacher"}
              </h3>

              {addType === "camera" ? (
                <CameraForm
                  onSubmit={handleAddCamera}
                  onCancel={() => setShowAddModal(false)}
                />
              ) : (
                <TeacherForm
                  onSubmit={handleAddTeacher}
                  onCancel={() => setShowAddModal(false)}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Camera Form Component
const CameraForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    quantity: 1,
    unitPrice: 0,
    type: "mirrorless",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Brand
        </label>
        <input
          type="text"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Model
        </label>
        <input
          type="text"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseInt(e.target.value) || 1,
              })
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unit Price (₹)
          </label>
          <input
            type="number"
            min="0"
            value={formData.unitPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                unitPrice: parseInt(e.target.value) || 0,
              })
            }
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="dslr">DSLR</option>
          <option value="mirrorless">Mirrorless</option>
          <option value="webcam">Webcam</option>
        </select>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          Add Camera
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Teacher Form Component
const TeacherForm = ({ onSubmit, onCancel }) => {
  const [teacherType, setTeacherType] = useState("fulltime");
  const [formData, setFormData] = useState({
    type: "fulltime",
    name: "",
    subject: "",
    monthlySalary: 0,
    benefits: 0,
    hourlyRate: 0,
    monthlyHours: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, type: teacherType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Teacher Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={teacherType === "fulltime"}
              onChange={() => setTeacherType("fulltime")}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Full-time</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={teacherType === "parttime"}
              onChange={() => setTeacherType("parttime")}
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Part-time</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subject
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      {teacherType === "fulltime" ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Salary (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formData.monthlySalary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthlySalary: parseInt(e.target.value) || 0,
                })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Benefits (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formData.benefits}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  benefits: parseInt(e.target.value) || 0,
                })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hourly Rate (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formData.hourlyRate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hourlyRate: parseInt(e.target.value) || 0,
                })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Hours
            </label>
            <input
              type="number"
              min="0"
              value={formData.monthlyHours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthlyHours: parseInt(e.target.value) || 0,
                })
              }
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          Add Teacher
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ContentCreationDashboard;
