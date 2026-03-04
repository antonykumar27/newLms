import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetRevenueByProjectIdQuery,
  useCreateRevenueRecordMutation,
  useUpdateRevenueRecordMutation,
  useGetRevenueDashboardQuery,
  useGetRevenueForecastQuery,
  useAddSubscriptionPlanMutation,
  useAddCorporateTrainingMutation,
  useAddCollegePartnershipMutation,
} from "../../store/api/revenueApi";
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Crown,
  Medal,
  Trophy,
  Star,
  Heart,
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
  TrendingUp as TrendingUpIcon,
} from "lucide-react";

import B2CRevenueCard from "./B2CRevenueCard";
import B2BRevenueCard from "./B2BRevenueCard";
import OtherRevenueCard from "./OtherRevenueCard";
import RevenueChart from "./RevenueChart";
import RevenueForecastChart from "./RevenueForecastChart";
import SubscriptionPlansCard from "./SubscriptionPlansCard";
import AddRevenueModal from "./AddRevenueModal";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../utils/formatters";
import { toast } from "react-toastify";

const RevenueDashboard = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedYear, setSelectedYear] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    b2c: true,
    b2b: true,
    other: true,
  });

  // RTK Query hooks
  const { data, isLoading, error, refetch } = useGetRevenueByProjectIdQuery(
    projectId,
    {
      skip: !projectId,
    },
  );
  const [createRevenueRecord, { isLoading: isCreating }] =
    useCreateRevenueRecordMutation();
  const [updateRevenueRecord, { isLoading: isUpdating }] =
    useUpdateRevenueRecordMutation();
  const { data: dashboardData } = useGetRevenueDashboardQuery(projectId, {
    skip: !projectId,
  });
  const { data: forecastData } = useGetRevenueForecastQuery(
    { id: data?.data?.revenue?._id, months: 24 },
    {
      skip: !data?.data?.revenue?._id,
    },
  );
  const [addSubscriptionPlan] = useAddSubscriptionPlanMutation();
  const [addCorporateTraining] = useAddCorporateTrainingMutation();
  const [addCollegePartnership] = useAddCollegePartnershipMutation();

  // State for form data
  const [formData, setFormData] = useState({
    projectId: projectId,
    b2cRevenue: {
      subscriptionPlans: [
        {
          tier: "basic",
          name: "Basic Learner",
          monthlyPrice: 499,
          yearlyPrice: 4990,
          features: ["5 Courses", "Basic Support", "Community Access"],
          projectedSubscribers: {
            year1: 1000,
            year2: 2500,
            year3: 5000,
          },
          projectedRevenue: {
            year1: 6000000,
            year2: 15000000,
            year3: 30000000,
          },
        },
        {
          tier: "premium",
          name: "Premium Learner",
          monthlyPrice: 999,
          yearlyPrice: 9990,
          features: [
            "All Courses",
            "Priority Support",
            "Certificates",
            "Project Reviews",
          ],
          projectedSubscribers: {
            year1: 500,
            year2: 1200,
            year3: 2500,
          },
          projectedRevenue: {
            year1: 6000000,
            year2: 14400000,
            year3: 30000000,
          },
        },
        {
          tier: "pro",
          name: "Pro Learner",
          monthlyPrice: 1999,
          yearlyPrice: 19990,
          features: [
            "All Courses",
            "1-on-1 Mentoring",
            "Job Assistance",
            "Resume Review",
            "Interview Prep",
          ],
          projectedSubscribers: {
            year1: 200,
            year2: 500,
            year3: 1000,
          },
          projectedRevenue: {
            year1: 4800000,
            year2: 12000000,
            year3: 24000000,
          },
        },
      ],
      oneTimePurchases: {
        individualCourses: [
          {
            courseName: "React Masterclass",
            price: 4999,
            salesYear1: 200,
            salesYear2: 400,
            salesYear3: 800,
            revenueYear1: 999800,
            revenueYear2: 1999600,
            revenueYear3: 3999200,
          },
          {
            courseName: "Node.js Advanced",
            price: 3999,
            salesYear1: 150,
            salesYear2: 300,
            salesYear3: 600,
            revenueYear1: 599850,
            revenueYear2: 1199700,
            revenueYear3: 2399400,
          },
          {
            courseName: "Python for Data Science",
            price: 4499,
            salesYear1: 180,
            salesYear2: 360,
            salesYear3: 720,
            revenueYear1: 809820,
            revenueYear2: 1619640,
            revenueYear3: 3239280,
          },
        ],
        certifications: {
          pricePerCert: 1999,
          certificatesYear1: 300,
          certificatesYear2: 600,
          certificatesYear3: 1200,
          revenueYear1: 599700,
          revenueYear2: 1199400,
          revenueYear3: 2398800,
        },
      },
      totalB2CYear1: 18799170,
      totalB2CYear2: 45488340,
      totalB2CYear3: 92188680,
      totalB2CThreeYear: 156476190,
    },
    b2bRevenue: {
      corporateTraining: [
        {
          companyName: "Infosys",
          contractValue: 1500000,
          contractDuration: 12,
          revenueYear1: 1500000,
          revenueYear2: 0,
          revenueYear3: 0,
        },
        {
          companyName: "TCS",
          contractValue: 2000000,
          contractDuration: 24,
          revenueYear1: 1000000,
          revenueYear2: 1000000,
          revenueYear3: 0,
        },
        {
          companyName: "Wipro",
          contractValue: 1800000,
          contractDuration: 18,
          revenueYear1: 1200000,
          revenueYear2: 600000,
          revenueYear3: 0,
        },
      ],
      collegePartnerships: [
        {
          collegeName: "IIT Madras",
          studentsCount: 500,
          revenueShare: 30,
          annualFees: 5000,
          revenueYear1: 750000,
          revenueYear2: 825000,
          revenueYear3: 907500,
        },
        {
          collegeName: "NIT Calicut",
          studentsCount: 400,
          revenueShare: 25,
          annualFees: 4500,
          revenueYear1: 450000,
          revenueYear2: 495000,
          revenueYear3: 544500,
        },
        {
          collegeName: "CET Trivandrum",
          studentsCount: 300,
          revenueShare: 20,
          annualFees: 4000,
          revenueYear1: 240000,
          revenueYear2: 264000,
          revenueYear3: 290400,
        },
      ],
      governmentContracts: [
        {
          department: "Kerala Govt - ICT",
          tenderValue: 5000000,
          revenueYear1: 2000000,
          revenueYear2: 2000000,
          revenueYear3: 1000000,
        },
      ],
      totalB2BYear1: 7140000,
      totalB2BYear2: 5184000,
      totalB2BYear3: 2742400,
      totalB2BThreeYear: 15066400,
    },
    otherRevenue: {
      placementFees: {
        perPlacement: 25000,
        placementsYear1: 50,
        placementsYear2: 75,
        placementsYear3: 100,
        revenueYear1: 1250000,
        revenueYear2: 1875000,
        revenueYear3: 2500000,
      },
      advertising: {
        platformAds: { monthly: 50000 },
        sponsoredContent: [
          {
            sponsor: "Google for Education",
            amount: 500000,
            duration: 12,
          },
          {
            sponsor: "Microsoft Edu",
            amount: 300000,
            duration: 6,
          },
        ],
      },
      totalOtherYear1: 2450000,
      totalOtherYear2: 2475000,
      totalOtherYear3: 2900000,
    },
    totalRevenueYear1: 28389170,
    totalRevenueYear2: 53147340,
    totalRevenueYear3: 97831080,
    totalRevenueThreeYear: 179367590,
  });

  useEffect(() => {
    if (data?.data?.revenue) {
      setFormData(data.data.revenue);
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
      } else {
        newData[section][subsection] = value;
      }

      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      if (data?.data?.revenue) {
        // Update existing
        await updateRevenueRecord({
          id: data.data.revenue._id,
          ...formData,
        }).unwrap();
        toast.success("Revenue record updated successfully!");
      } else {
        // Create new
        await createRevenueRecord(formData).unwrap();
        toast.success("Revenue record created successfully!");
      }
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong");
    }
  };

  const handleAddSubscriptionPlan = async (planData) => {
    try {
      await addSubscriptionPlan({
        id: data.data.revenue._id,
        ...planData,
      }).unwrap();
      toast.success("Subscription plan added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add plan");
    }
  };

  const handleAddCorporateTraining = async (trainingData) => {
    try {
      await addCorporateTraining({
        id: data.data.revenue._id,
        ...trainingData,
      }).unwrap();
      toast.success("Corporate training added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add training");
    }
  };

  const handleAddCollegePartnership = async (partnershipData) => {
    try {
      await addCollegePartnership({
        id: data.data.revenue._id,
        ...partnershipData,
      }).unwrap();
      toast.success("College partnership added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add partnership");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const years = [
    { value: "all", label: "All Years" },
    { value: "year1", label: "Year 1" },
    { value: "year2", label: "Year 2" },
    { value: "year3", label: "Year 3" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-emerald-500" />
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
            {error.data?.message || "Failed to load revenue data"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all transform hover:scale-105"
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
                className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"
              >
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Revenue Management
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
                className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              {years.map((year) => (
                <button
                  key={year.value}
                  onClick={() => setSelectedYear(year.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedYear === year.value
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {year.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                3-Year Total:
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(formData.totalRevenueThreeYear)}
              </span>
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
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                B2C
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              B2C Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.b2cRevenue.totalB2CThreeYear)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {(
                (formData.b2cRevenue.totalB2CThreeYear /
                  formData.totalRevenueThreeYear) *
                100
              ).toFixed(1)}
              % of total
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
                <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                B2B
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              B2B Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.b2bRevenue.totalB2BThreeYear)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {(
                (formData.b2bRevenue.totalB2BThreeYear /
                  formData.totalRevenueThreeYear) *
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
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                Other
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Other Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                formData.otherRevenue.totalOtherYear1 +
                  formData.otherRevenue.totalOtherYear2 +
                  formData.otherRevenue.totalOtherYear3,
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {(
                ((formData.otherRevenue.totalOtherYear1 +
                  formData.otherRevenue.totalOtherYear2 +
                  formData.otherRevenue.totalOtherYear3) /
                  formData.totalRevenueThreeYear) *
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
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                CAGR
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Growth Rate
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(
                ((formData.totalRevenueYear3 / formData.totalRevenueYear1) **
                  (1 / 2) -
                  1) *
                100
              ).toFixed(1)}
              %
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Year 1 to Year 3
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart data={formData} selectedYear={selectedYear} />
          <RevenueForecastChart data={forecastData} />
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
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
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
                <span>Edit Revenue</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("subscription");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Subscription</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("corporate");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Briefcase className="w-5 h-5" />
            <span>Add Corporate</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("college");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <GraduationCap className="w-5 h-5" />
            <span>Add College</span>
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
          {/* B2C Revenue Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("b2c")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      B2C Revenue
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Direct to Students
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    {formData.b2cRevenue.subscriptionPlans.length} Plans •{" "}
                    {
                      formData.b2cRevenue.oneTimePurchases.individualCourses
                        .length
                    }{" "}
                    Courses
                  </span>
                  {expandedSections.b2c ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.b2c && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <B2CRevenueCard
                      data={formData.b2cRevenue}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                      selectedYear={selectedYear}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* B2B Revenue Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("b2b")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      B2B Revenue
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Corporate & Institutional
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    {formData.b2bRevenue.corporateTraining.length} Corporate •{" "}
                    {formData.b2bRevenue.collegePartnerships.length} Colleges
                  </span>
                  {expandedSections.b2b ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.b2b && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <B2BRevenueCard
                      data={formData.b2bRevenue}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                      selectedYear={selectedYear}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Other Revenue Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("other")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Other Revenue
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Placements, Advertising & More
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    {formData.otherRevenue.advertising.sponsoredContent.length}{" "}
                    Sponsors
                  </span>
                  {expandedSections.other ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.other && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <OtherRevenueCard
                      data={formData.otherRevenue}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                      selectedYear={selectedYear}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Subscription Plans Section (when expanded) */}
        {expandedSections.b2c && (
          <div className="mt-6">
            <SubscriptionPlansCard
              plans={formData.b2cRevenue.subscriptionPlans}
              isEditing={isEditing}
              onUpdate={handleInputChange}
            />
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

      {/* Add Revenue Modal */}
      <AddRevenueModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={
          addType === "subscription"
            ? handleAddSubscriptionPlan
            : addType === "corporate"
              ? handleAddCorporateTraining
              : handleAddCollegePartnership
        }
        type={addType}
      />
    </div>
  );
};

export default RevenueDashboard;
