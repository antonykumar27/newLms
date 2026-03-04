import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetDevelopmentCostByProjectIdQuery,
  useCreateDevelopmentCostMutation,
  useUpdateDevelopmentCostMutation,
  useGetDevelopmentStatsQuery,
  useGetCostBreakdownQuery,
  useCalculateEstimateMutation,
  useEstimateTimelineMutation,
} from "../../store/api/developmentApi";
import {
  Code,
  Smartphone,
  Palette,
  TestTube,
  Rocket,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Cpu,
  HardDrive,
  Zap,
  Sparkles,
  Flame,
  Sun,
  Moon,
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
  Laptop,
  Tablet,
  Globe,
  Database,
  Server,
  Cloud,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Fingerprint,
  ScanFace,
  ScanLine,
  ScanSearch,
  ScanText,
  ScanEye,
  Braces,
  Binary,
  Code2,
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
  Pi,
  SigmaSquare,
  WholeWord,
  Regex,
  CaseSensitive,
  Space,
  Pilcrow,
  Quote,
  List,
  ListOrdered,
  ListChecks,
  ListTodo,
  ListTree,
  ListFilter,
  ListPlus,
  ListMinus,
  ListX,
  ListEnd,
  ListStart,
  ListCollapse,
  ListRestart,
  ListVideo,
  ListMusic,
  Calculator,
} from "lucide-react";

import WebAppCard from "./WebAppCard";
import MobileAppCard from "./MobileAppCard";
import DesignCard from "./DesignCard";
import QATestingCard from "./QATestingCard";
import DeploymentCard from "./DeploymentCard";
import CostChart from "./CostChart";
import HourlyRateCard from "./HourlyRateCard";
import TimelineEstimator from "./TimelineEstimator";
import ResourceCalculator from "./ResourceCalculator";
import AddResourceModal from "./AddResourceModal";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../utils/formatters";
import { toast } from "react-toastify";

const DevelopmentCostDashboard = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    web: true,
    mobile: true,
    design: true,
    qa: true,
    deployment: true,
  });

  // RTK Query hooks
  const { data, isLoading, error, refetch } =
    useGetDevelopmentCostByProjectIdQuery(projectId, {
      skip: !projectId,
    });
  const [createDevelopmentCost, { isLoading: isCreating }] =
    useCreateDevelopmentCostMutation();
  const [updateDevelopmentCost, { isLoading: isUpdating }] =
    useUpdateDevelopmentCostMutation();
  const { data: statsData } = useGetDevelopmentStatsQuery();
  const { data: breakdownData } = useGetCostBreakdownQuery(
    data?.data?.developmentCost?._id,
    {
      skip: !data?.data?.developmentCost?._id,
    },
  );
  const [calculateEstimate] = useCalculateEstimateMutation();
  const [estimateTimeline] = useEstimateTimelineMutation();

  // State for form data
  const [formData, setFormData] = useState({
    projectId: projectId,
    webApp: {
      frontend: {
        reactJs: { hours: 200, ratePerHour: 2000, total: 400000 },
        reduxStateManagement: { hours: 50, total: 100000 },
        tailwindCss: { hours: 30, total: 60000 },
        responsiveDesign: { hours: 40, total: 80000 },
        subTotal: 640000,
      },
      backend: {
        nodeJs: { hours: 180, ratePerHour: 2500, total: 450000 },
        expressFramework: { hours: 60, total: 150000 },
        apiDevelopment: { hours: 120, total: 300000 },
        databaseDesign: { hours: 40, total: 100000 },
        authentication: { hours: 50, total: 125000 },
        subTotal: 1125000,
      },
      database: {
        mongodbAtlas: { setup: 25000, optimization: 15000, total: 40000 },
        redisCache: { setup: 15000, total: 15000 },
        dataMigration: { hours: 40, total: 80000 },
        subTotal: 135000,
      },
      thirdParty: {
        paymentGateway: { setup: 20000, integration: 30000 },
        emailService: { setup: 10000 },
        smsService: { setup: 8000 },
        videoConferencing: { setup: 15000 },
        subTotal: 83000,
      },
      totalWeb: 1983000,
    },
    mobileApp: {
      crossPlatform: {
        reactNative: { hours: 250, ratePerHour: 2500, total: 625000 },
        codeSharing: { savings: 150000 },
        subTotal: 475000,
      },
      ioSpecific: {
        swiftHelpers: { hours: 60, total: 150000 },
        appStoreConnect: { setup: 10000 },
        pushNotifications: { hours: 30, total: 75000 },
        subTotal: 235000,
      },
      androidSpecific: {
        kotlinHelpers: { hours: 60, total: 150000 },
        googlePlayServices: { hours: 40, total: 100000 },
        firebaseIntegration: { hours: 50, total: 125000 },
        subTotal: 375000,
      },
      mobileFeatures: {
        offlineAccess: { hours: 80, total: 200000 },
        pushNotifications: { hours: 40, total: 100000 },
        biometricAuth: { hours: 60, total: 150000 },
        mobilePayments: { upi: 50000, wallet: 50000 },
        subTotal: 550000,
      },
      totalMobile: 1635000,
    },
    design: {
      webDesign: {
        wireframing: { hours: 40, total: 80000 },
        prototyping: { hours: 60, total: 120000 },
        uiKits: { purchase: 25000, customization: 50000 },
        responsiveMockups: { hours: 50, total: 100000 },
        subTotal: 375000,
      },
      mobileDesign: {
        iosHIG: { hours: 30, total: 60000 },
        materialDesign: { hours: 30, total: 60000 },
        appIcons: { design: 30000, variants: 20000 },
        splashScreens: { design: 15000, total: 15000 },
        subTotal: 185000,
      },
      branding: {
        logo: { design: 40000, revisions: 15000 },
        colorPalette: { development: 20000 },
        typography: { licensing: 15000 },
        brandGuidelines: { creation: 30000 },
        subTotal: 120000,
      },
      totalDesign: 680000,
    },
    qaTesting: {
      manualTesting: {
        functional: { hours: 120, total: 240000 },
        regression: { hours: 80, total: 160000 },
        uxTesting: { hours: 60, total: 120000 },
        subTotal: 520000,
      },
      automatedTesting: {
        jestSetup: { hours: 40, total: 80000 },
        cypress: { hours: 60, total: 120000 },
        loadTesting: { hours: 50, total: 100000 },
        subTotal: 300000,
      },
      deviceTesting: {
        iosDevices: { count: 3, rental: 45000 },
        androidDevices: { count: 5, rental: 50000 },
        browserStack: { subscription: 30000 },
        subTotal: 125000,
      },
      securityAudit: {
        penetrationTesting: { cost: 100000 },
        vulnerabilityScan: { cost: 50000 },
        sslSetup: { cost: 20000 },
        subTotal: 170000,
      },
      totalQA: 1115000,
    },
    deployment: {
      appStoreAccounts: {
        appleDeveloper: { yearly: 9900, threeYear: 29700 },
        googlePlay: { oneTime: 2500 },
        subTotal: 32200,
      },
      domainAndSSL: {
        domainName: { purchase: 1200, renewal: 1200 },
        sslCertificate: { letzEncrypt: 0, premium: 5000 },
        subTotal: 7400,
      },
      serverSetup: {
        configuration: { hours: 40, total: 80000 },
        loadBalancer: { setup: 25000 },
        autoScaling: { setup: 30000 },
        subTotal: 135000,
      },
      totalDeployment: 174600,
    },
    totalDevelopmentInvestment: 5587600,
    currency: "INR",
  });

  useEffect(() => {
    if (data?.data?.developmentCost) {
      setFormData(data.data.developmentCost);
    }
  }, [data]);

  const handleInputChange = (section, subsection, field, value, subfield) => {
    setFormData((prev) => {
      const newData = { ...prev };

      if (subfield) {
        if (!newData[section][subsection][field]) {
          newData[section][subsection][field] = {};
        }
        newData[section][subsection][field][subfield] = value;

        // Recalculate total if hours or rate changed
        if (subfield === "hours" || subfield === "ratePerHour") {
          const hours =
            subfield === "hours"
              ? value
              : newData[section][subsection][field].hours;
          const rate =
            subfield === "ratePerHour"
              ? value
              : newData[section][subsection][field].ratePerHour;
          newData[section][subsection][field].total = hours * rate;
        }
      } else if (field) {
        newData[section][subsection][field] = value;
      } else if (subsection) {
        newData[section][subsection] = value;
      }

      // Recalculate subtotals
      if (section === "webApp") {
        newData.webApp.frontend.subTotal =
          (newData.webApp.frontend.reactJs.total || 0) +
          (newData.webApp.frontend.reduxStateManagement.total || 0) +
          (newData.webApp.frontend.tailwindCss.total || 0) +
          (newData.webApp.frontend.responsiveDesign.total || 0);

        newData.webApp.backend.subTotal =
          (newData.webApp.backend.nodeJs.total || 0) +
          (newData.webApp.backend.expressFramework.total || 0) +
          (newData.webApp.backend.apiDevelopment.total || 0) +
          (newData.webApp.backend.databaseDesign.total || 0) +
          (newData.webApp.backend.authentication.total || 0);

        newData.webApp.database.subTotal =
          (newData.webApp.database.mongodbAtlas.total || 0) +
          (newData.webApp.database.redisCache.total || 0) +
          (newData.webApp.database.dataMigration.total || 0);

        newData.webApp.thirdParty.subTotal =
          (newData.webApp.thirdParty.paymentGateway.setup || 0) +
          (newData.webApp.thirdParty.paymentGateway.integration || 0) +
          (newData.webApp.thirdParty.emailService.setup || 0) +
          (newData.webApp.thirdParty.smsService.setup || 0) +
          (newData.webApp.thirdParty.videoConferencing.setup || 0);

        newData.webApp.totalWeb =
          newData.webApp.frontend.subTotal +
          newData.webApp.backend.subTotal +
          newData.webApp.database.subTotal +
          newData.webApp.thirdParty.subTotal;
      }

      // Recalculate grand total
      newData.totalDevelopmentInvestment =
        (newData.webApp.totalWeb || 0) +
        (newData.mobileApp.totalMobile || 0) +
        (newData.design.totalDesign || 0) +
        (newData.qaTesting.totalQA || 0) +
        (newData.deployment.totalDeployment || 0);

      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      if (data?.data?.developmentCost) {
        // Update existing
        await updateDevelopmentCost({
          id: data.data.developmentCost._id,
          ...formData,
        }).unwrap();
        toast.success("Development cost updated successfully!");
      } else {
        // Create new
        await createDevelopmentCost(formData).unwrap();
        toast.success("Development cost created successfully!");
      }
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong");
    }
  };

  const handleCalculateEstimate = async (hours) => {
    try {
      const result = await calculateEstimate(hours).unwrap();
      toast.success(`Estimated cost: ${formatCurrency(result.data.total)}`);
    } catch (error) {
      toast.error("Failed to calculate estimate");
    }
  };

  const handleEstimateTimeline = async (params) => {
    try {
      const result = await estimateTimeline(params).unwrap();
      toast.success(
        `Estimated timeline: ${result.data.estimatedMonths} months`,
      );
    } catch (error) {
      toast.error("Failed to estimate timeline");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "web", name: "Web App", icon: Globe },
    { id: "mobile", name: "Mobile App", icon: Smartphone },
    { id: "design", name: "Design", icon: Palette },
    { id: "qa", name: "QA & Testing", icon: TestTube },
    { id: "deployment", name: "Deployment", icon: Rocket },
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
            {error.data?.message || "Failed to load development cost data"}
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
                <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Development Cost Management
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
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
                    ? "bg-blue-600 text-white"
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
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Investment
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalDevelopmentInvestment)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              One-time development cost
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
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                Web
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Web App Cost
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.webApp.totalWeb)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {(
                (formData.webApp.totalWeb /
                  formData.totalDevelopmentInvestment) *
                100
              ).toFixed(1)}
              % of total
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
                <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                Mobile
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Mobile App Cost
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.mobileApp.totalMobile)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {(
                (formData.mobileApp.totalMobile /
                  formData.totalDevelopmentInvestment) *
                100
              ).toFixed(1)}
              % of total
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
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                Hours
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Hours
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(
                formData.webApp.frontend.reactJs.hours +
                  formData.webApp.backend.nodeJs.hours +
                  formData.mobileApp.crossPlatform.reactNative.hours +
                  formData.design.webDesign.wireframing.hours +
                  formData.qaTesting.manualTesting.functional.hours,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Development effort
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CostChart data={breakdownData} type="breakdown" />
            <CostChart data={breakdownData} type="comparison" />
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
                : "bg-blue-600 hover:bg-blue-700 text-white"
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
                <span>Edit Costs</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCalculator(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Calculator className="w-5 h-5" />
            <span>Resource Calculator</span>
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
          {/* Web App Section */}
          {(activeTab === "web" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("web")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Web Application
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Frontend + Backend + Database + Integrations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      Total: {formatCurrency(formData.webApp.totalWeb)}
                    </span>
                    {expandedSections.web ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.web && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <WebAppCard
                        data={formData.webApp}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Mobile App Section */}
          {(activeTab === "mobile" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("mobile")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Mobile Application
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cross-platform + Native Features
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      Total: {formatCurrency(formData.mobileApp.totalMobile)}
                    </span>
                    {expandedSections.mobile ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.mobile && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <MobileAppCard
                        data={formData.mobileApp}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Design Section */}
          {(activeTab === "design" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("design")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Design & Branding
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        UI/UX + Brand Identity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      Total: {formatCurrency(formData.design.totalDesign)}
                    </span>
                    {expandedSections.design ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.design && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <DesignCard
                        data={formData.design}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* QA & Testing Section */}
          {(activeTab === "qa" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("qa")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <TestTube className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        QA & Testing
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manual + Automated + Security
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      Total: {formatCurrency(formData.qaTesting.totalQA)}
                    </span>
                    {expandedSections.qa ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.qa && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <QATestingCard
                        data={formData.qaTesting}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Deployment Section */}
          {(activeTab === "deployment" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("deployment")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                      <Rocket className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Deployment & Launch
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        App Stores + Domain + Server Setup
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      Total:{" "}
                      {formatCurrency(formData.deployment.totalDeployment)}
                    </span>
                    {expandedSections.deployment ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.deployment && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <DeploymentCard
                        data={formData.deployment}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Hourly Rates Section */}
        {activeTab === "overview" && (
          <div className="mt-6">
            <HourlyRateCard
              data={formData}
              isEditing={isEditing}
              onUpdate={handleInputChange}
            />
          </div>
        )}

        {/* Timeline Estimator */}
        {activeTab === "overview" && (
          <div className="mt-6">
            <TimelineEstimator onEstimate={handleEstimateTimeline} />
          </div>
        )}

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

      {/* Resource Calculator Modal */}
      <ResourceCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        onCalculate={handleCalculateEstimate}
      />
    </div>
  );
};

export default DevelopmentCostDashboard;
