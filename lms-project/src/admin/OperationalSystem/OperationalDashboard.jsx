import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetOperationalByProjectIdQuery,
  useCreateOperationalRecordMutation,
  useUpdateOperationalRecordMutation,
  useGetOperationalDashboardQuery,
  useGetOptimizationSuggestionsQuery,
  useAddEmployeeRoleMutation,
  useAddTechToolMutation,
} from "../../store/api/operationalApi";
import {
  Building2,
  Users,
  Scale,
  Laptop,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Shield,
  ShieldCheck,
  ShieldAlert,
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
  UserPlus,
  UsersRound as UsersRoundIcon,
  Scale as ScaleIcon,
  FileSpreadsheet as FileSpreadsheetIcon,
  FileStack as FileStackIcon,
  FileArchive as FileArchiveIcon,
  FileX2 as FileX2Icon,
  FileLock2,
  FileKey2,
  FileBadge2 as FileBadge2Icon,
  FileClock as FileClockIcon,
  FileHeart as FileHeartIcon,
} from "lucide-react";

import OfficeSpaceCard from "./OfficeSpaceCard";
import EmployeeSalariesCard from "./EmployeeSalariesCard";
import LegalComplianceCard from "./LegalComplianceCard";
import TechnologyToolsCard from "./TechnologyToolsCard";
import OperationalChart from "./OperationalChart";
import CostBreakdownChart from "./CostBreakdownChart";
import AddEmployeeModal from "./AddEmployeeModal";
import AddToolModal from "./AddToolModal";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../utils/formatters";
import { toast } from "react-toastify";

const OperationalDashboard = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    office: true,
    employees: true,
    legal: true,
    tech: true,
  });

  // RTK Query hooks
  const { data, isLoading, error, refetch } = useGetOperationalByProjectIdQuery(
    projectId,
    {
      skip: !projectId,
    },
  );
  const [createOperationalRecord, { isLoading: isCreating }] =
    useCreateOperationalRecordMutation();
  const [updateOperationalRecord, { isLoading: isUpdating }] =
    useUpdateOperationalRecordMutation();
  const { data: dashboardData } = useGetOperationalDashboardQuery(projectId, {
    skip: !projectId,
  });
  const { data: optimizationData } = useGetOptimizationSuggestionsQuery(
    data?.data?.operational?._id,
    {
      skip: !data?.data?.operational?._id,
    },
  );
  const [addEmployeeRole] = useAddEmployeeRoleMutation();
  const [addTechTool] = useAddTechToolMutation();

  // State for form data
  const [formData, setFormData] = useState({
    projectId: projectId,
    officeSpace: {
      type: "rented",
      monthlyRent: 35000,
      securityDeposit: 105000,
      maintenance: { monthly: 5000 },
      utilities: {
        electricity: 8000,
        water: 2000,
        internet: 3000,
      },
      totalMonthly: 53000,
      totalThreeYear: 1908000,
    },
    employeeSalaries: [
      {
        department: "management",
        role: "CEO",
        count: 1,
        monthlySalary: 150000,
        benefits: 30000,
        totalCompensation: 180000,
      },
      {
        department: "management",
        role: "CTO",
        count: 1,
        monthlySalary: 120000,
        benefits: 25000,
        totalCompensation: 145000,
      },
      {
        department: "techSupport",
        role: "Senior Developer",
        count: 2,
        monthlySalary: 80000,
        benefits: 15000,
        totalCompensation: 95000,
      },
      {
        department: "techSupport",
        role: "Developer",
        count: 5,
        monthlySalary: 50000,
        benefits: 10000,
        totalCompensation: 60000,
      },
      {
        department: "admin",
        role: "Office Manager",
        count: 1,
        monthlySalary: 35000,
        benefits: 5000,
        totalCompensation: 40000,
      },
      {
        department: "finance",
        role: "Accountant",
        count: 2,
        monthlySalary: 40000,
        benefits: 8000,
        totalCompensation: 48000,
      },
    ],
    totalSalaryMonthly: 668000,
    totalSalaryYearly: 8016000,
    totalSalaryThreeYear: 24048000,
    legalCompliance: {
      companyRegistration: { oneTime: 15000 },
      gstRegistration: { oneTime: 5000 },
      trademarks: [
        { name: "LMS Brand", cost: 20000 },
        { name: "Logo", cost: 15000 },
      ],
      legalRetainers: { monthly: 10000 },
      insurance: {
        professionalIndemnity: { yearly: 25000 },
        cyberLiability: { yearly: 35000 },
      },
      totalYearly: 180000,
      totalThreeYear: 560000,
    },
    technologyTools: {
      productivityTools: [
        { name: "slack", monthlyCost: 5000 },
        { name: "asana", monthlyCost: 4000 },
        { name: "jira", monthlyCost: 8000 },
      ],
      communicationTools: [
        { name: "zoom", monthlyCost: 3000 },
        { name: "googleWorkspace", monthlyCost: 6000 },
      ],
      accountingTools: [
        { name: "zoho", monthlyCost: 2000 },
        { name: "tally", monthlyCost: 1500 },
      ],
      totalMonthly: 29500,
      totalThreeYear: 1062000,
    },
    totalOperationalMonthly: 750500,
    totalOperationalYearly: 9006000,
    totalOperationalThreeYear: 27018000,
  });

  useEffect(() => {
    if (data?.data?.operational) {
      setFormData(data.data.operational);
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
      } else if (field) {
        newData[section][subsection][field] = value;
      } else if (subsection) {
        newData[section][subsection] = value;
      } else {
        newData[section] = value;
      }

      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      if (data?.data?.operational) {
        // Update existing
        await updateOperationalRecord({
          id: data.data.operational._id,
          ...formData,
        }).unwrap();
        toast.success("Operational record updated successfully!");
      } else {
        // Create new
        await createOperationalRecord(formData).unwrap();
        toast.success("Operational record created successfully!");
      }
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong");
    }
  };

  const handleAddEmployee = async (employeeData) => {
    try {
      await addEmployeeRole({
        id: data.data.operational._id,
        ...employeeData,
      }).unwrap();
      toast.success("Employee added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add employee");
    }
  };

  const handleAddTool = async (toolData) => {
    try {
      await addTechTool({
        id: data.data.operational._id,
        ...toolData,
      }).unwrap();
      toast.success("Tool added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add tool");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-amber-500" />
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
            {error.data?.message || "Failed to load operational data"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all transform hover:scale-105"
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
                className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl"
              >
                <Building2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Operational Management
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
                className="p-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors"
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
                Monthly
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Monthly
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalOperationalMonthly)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              ↓ 2% from last month
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
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                Yearly
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Yearly
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalOperationalYearly)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              ↑ 8% YoY
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
                Employees
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Employees
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formData.employeeSalaries.reduce(
                (sum, dept) => sum + dept.count,
                0,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Across {formData.employeeSalaries.length} departments
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
                <Laptop className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                Tools
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Tech Tools
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formData.technologyTools.productivityTools.length +
                formData.technologyTools.communicationTools.length +
                formData.technologyTools.accountingTools.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Monthly: {formatCurrency(formData.technologyTools.totalMonthly)}
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OperationalChart data={formData} />
          <CostBreakdownChart data={dashboardData} />
        </div>

        {/* Optimization Suggestions */}
        {optimizationData?.data?.suggestions &&
          optimizationData.data.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6" />
                <h3 className="text-xl font-bold">Optimization Suggestions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {optimizationData.data.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{suggestion.category}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.difficulty === "easy"
                            ? "bg-green-500/30"
                            : suggestion.difficulty === "medium"
                              ? "bg-yellow-500/30"
                              : "bg-red-500/30"
                        }`}
                      >
                        {suggestion.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 mb-2">
                      {suggestion.suggestion}
                    </p>
                    <p className="text-sm font-semibold">
                      Save: {formatCurrency(suggestion.potentialSavings)}/year
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
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
                : "bg-amber-600 hover:bg-amber-700 text-white"
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
                <span>Edit Operations</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("employee");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Employee</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("tool");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Laptop className="w-5 h-5" />
            <span>Add Tool</span>
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
          {/* Office Space Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("office")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Office Space
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.officeSpace.type === "rented"
                        ? "Rented"
                        : formData.officeSpace.type === "owned"
                          ? "Owned"
                          : "Co-working"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Monthly: {formatCurrency(formData.officeSpace.totalMonthly)}
                  </span>
                  {expandedSections.office ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.office && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <OfficeSpaceCard
                      data={formData.officeSpace}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Employee Salaries Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("employees")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Employee Salaries
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.employeeSalaries.length} departments
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Monthly: {formatCurrency(formData.totalSalaryMonthly)}
                  </span>
                  {expandedSections.employees ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.employees && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <EmployeeSalariesCard
                      data={formData.employeeSalaries}
                      totalMonthly={formData.totalSalaryMonthly}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Legal & Compliance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("legal")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Legal & Compliance
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Registrations & Insurance
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Yearly:{" "}
                    {formatCurrency(formData.legalCompliance.totalYearly)}
                  </span>
                  {expandedSections.legal ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.legal && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <LegalComplianceCard
                      data={formData.legalCompliance}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Technology Tools Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("tech")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Laptop className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Technology Tools
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Software & Subscriptions
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Monthly:{" "}
                    {formatCurrency(formData.technologyTools.totalMonthly)}
                  </span>
                  {expandedSections.tech ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.tech && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <TechnologyToolsCard
                      data={formData.technologyTools}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                      planId={data?.data?.operational?._id}
                      onRefresh={refetch}
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
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </main>

      {/* Add Employee/Tool Modal */}
      <AddEmployeeModal
        isOpen={showAddModal && addType === "employee"}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddEmployee}
      />

      <AddToolModal
        isOpen={showAddModal && addType === "tool"}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTool}
      />
    </div>
  );
};

export default OperationalDashboard;
