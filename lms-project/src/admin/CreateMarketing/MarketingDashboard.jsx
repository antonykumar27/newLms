import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetMarketingPlanByProjectIdQuery,
  useCreateMarketingPlanMutation,
  useUpdateMarketingPlanMutation,
  useGetROIAnalysisQuery,
  useGetChannelPerformanceQuery,
  useGetLeadMetricsQuery,
  useAddSocialPlatformMutation,
} from "../../store/api/marketingApi";
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Clock,
  Globe,
  Mail,
  Share2,
  PenTool,
  Megaphone,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  RefreshCw,
  Download,
  Calendar as CalendarIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  X as XIcon,
  Newspaper,
  User,
} from "lucide-react";

import DigitalMarketingCard from "./DigitalMarketingCard";
import TraditionalMarketingCard from "./TraditionalMarketingCard";
import BusinessDevelopmentCard from "./BusinessDevelopmentCard";
import ROIAnalysisChart from "./ROIAnalysisChart";
import ChannelPerformanceChart from "./ChannelPerformanceChart";
import AddPlatformModal from "./AddPlatformModal";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../utils/formatters";
import { toast } from "react-toastify";

const MarketingDashboard = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    digital: true,
    traditional: true,
    bd: true,
  });

  // RTK Query hooks
  const { data, isLoading, error, refetch } =
    useGetMarketingPlanByProjectIdQuery(projectId, {
      skip: !projectId,
    });
  const [createMarketingPlan, { isLoading: isCreating }] =
    useCreateMarketingPlanMutation();
  const [updateMarketingPlan, { isLoading: isUpdating }] =
    useUpdateMarketingPlanMutation();
  const { data: roiData } = useGetROIAnalysisQuery(data?.data?.marketing?._id, {
    skip: !data?.data?.marketing?._id,
  });
  const { data: channelData } = useGetChannelPerformanceQuery(
    data?.data?.marketing?._id,
    {
      skip: !data?.data?.marketing?._id,
    },
  );
  const { data: leadData } = useGetLeadMetricsQuery(
    data?.data?.marketing?._id,
    {
      skip: !data?.data?.marketing?._id,
    },
  );
  const [addSocialPlatform] = useAddSocialPlatformMutation();

  // State for form data
  const [formData, setFormData] = useState({
    projectId: projectId,
    digitalMarketing: {
      seo: {
        keywordResearch: { monthly: 10000 },
        onPageOptimization: { monthly: 8000 },
        linkBuilding: { monthly: 15000 },
        contentMarketing: { monthly: 12000 },
        totalMonthly: 45000,
        totalThreeYear: 1620000,
      },
      socialMedia: {
        platforms: [
          { name: "instagram", monthlyBudget: 15000 },
          { name: "facebook", monthlyBudget: 15000 },
          { name: "youtube", monthlyBudget: 20000 },
        ],
        contentCreation: { monthly: 25000 },
        communityManagement: { monthly: 10000 },
        influencerMarketing: { yearly: 200000 },
        totalMonthly: 70000,
        totalThreeYear: 2720000,
      },
      paidAds: {
        googleAds: { monthly: 30000 },
        facebookAds: { monthly: 25000 },
        instagramAds: { monthly: 20000 },
        youtubeAds: { monthly: 35000 },
        totalMonthly: 110000,
        totalThreeYear: 3960000,
      },
      emailMarketing: {
        platform: { monthly: 5000 },
        newsletterCreation: { monthly: 10000 },
        automation: { setup: 25000, monthly: 5000 },
        totalMonthly: 20000,
      },
    },
    traditionalMarketing: {
      printAds: {
        newspapers: [
          { name: "The Hindu", costPerAd: 25000, adsPerYear: 12 },
          { name: "Mathrubhumi", costPerAd: 20000, adsPerYear: 12 },
        ],
        magazines: [
          { name: "Education Times", costPerAd: 30000, adsPerYear: 6 },
        ],
        brochures: { design: 50000, printing: 100000 },
        totalYearly: 850000,
      },
      eventsAndSponsorships: {
        educationFairs: [
          { name: "India Didactics", cost: 200000, perYear: 1 },
          { name: "Higher Education Summit", cost: 150000, perYear: 1 },
        ],
        collegeVisits: { costPerVisit: 5000, visitsPerYear: 50 },
        sponsorships: [
          { event: "Tech Fest IIT", amount: 100000 },
          { event: "Startup Conclave", amount: 75000 },
        ],
        totalYearly: 625000,
      },
    },
    businessDevelopment: {
      salesTeam: [
        {
          role: "salesManager",
          count: 1,
          monthlySalary: 50000,
          commission: 10000,
          totalCompensation: 60000,
        },
        {
          role: "bdExecutive",
          count: 3,
          monthlySalary: 30000,
          commission: 5000,
          totalCompensation: 35000,
        },
      ],
      partnerships: {
        collegePartnerships: [
          { college: "IIT Madras", revenueShare: 30 },
          { college: "NIT Calicut", revenueShare: 25 },
        ],
        corporateTraining: [
          { company: "Infosys", contractValue: 1500000 },
          { company: "TCS", contractValue: 2000000 },
        ],
      },
      totalBDMonthly: 165000,
      totalBDYearly: 1980000,
    },
    totalMarketingMonthly: 410000,
    totalMarketingYearly: 4920000,
    totalMarketingThreeYear: 14760000,
  });

  useEffect(() => {
    if (data?.data?.marketing) {
      setFormData(data.data.marketing);
    }
  }, [data]);

  const handleInputChange = (section, subsection, field, value, subfield) => {
    setFormData((prev) => {
      const newData = { ...prev };

      if (subfield) {
        newData[section][subsection][field][subfield] = value;
      } else if (field) {
        if (subsection) {
          newData[section][subsection][field] = value;
        } else {
          newData[section][field] = value;
        }
      } else {
        newData[section][subsection] = value;
      }

      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      if (data?.data?.marketing) {
        // Update existing
        await updateMarketingPlan({
          id: data.data.marketing._id,
          ...formData,
        }).unwrap();
        toast.success("Marketing plan updated successfully!");
      } else {
        // Create new
        await createMarketingPlan(formData).unwrap();
        toast.success("Marketing plan created successfully!");
      }
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong");
    }
  };

  const handleAddPlatform = async (platformData) => {
    try {
      await addSocialPlatform({
        id: data.data.marketing._id,
        ...platformData,
      }).unwrap();
      toast.success("Platform added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add platform");
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
    { id: "digital", name: "Digital Marketing", icon: Globe },
    { id: "traditional", name: "Traditional", icon: Newspaper },
    { id: "bd", name: "Business Development", icon: Users },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
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
            {error.data?.message || "Failed to load marketing plan"}
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
                className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl"
              >
                <Megaphone className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Marketing Management
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
                className="p-2 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition-colors"
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
                    ? "bg-pink-600 text-white"
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
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                Monthly
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Monthly Budget
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalMarketingMonthly || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              ↓ 5% from last month
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
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                Yearly
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Yearly Budget
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalMarketingYearly || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              +12% growth
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
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                ROI
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Estimated ROI
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {roiData?.data?.roi || "285%"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Above target
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                Leads
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Monthly Leads
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {leadData?.data?.monthly?.leads || "500"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Cost per lead: ₹{leadData?.data?.costs?.costPerLead || "820"}
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ROIAnalysisChart data={roiData} />
            <ChannelPerformanceChart data={channelData} />
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
                : "bg-pink-600 hover:bg-pink-700 text-white"
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
              setAddType("platform");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Platform</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("campaign");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Calendar className="w-5 h-5" />
            <span>New Campaign</span>
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
          {/* Digital Marketing Section */}
          {(activeTab === "digital" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("digital")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Digital Marketing
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monthly:{" "}
                        {formatCurrency(
                          formData.digitalMarketing?.seo?.totalMonthly +
                            formData.digitalMarketing?.socialMedia
                              ?.totalMonthly +
                            formData.digitalMarketing?.paidAds?.totalMonthly +
                            formData.digitalMarketing?.emailMarketing
                              ?.totalMonthly || 0,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {formData.digitalMarketing?.socialMedia?.platforms
                        ?.length || 0}{" "}
                      Platforms
                    </span>
                    {expandedSections.digital ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.digital && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <DigitalMarketingCard
                        data={formData.digitalMarketing}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                        planId={data?.data?.marketing?._id}
                        onRefresh={refetch}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Traditional Marketing Section */}
          {(activeTab === "traditional" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("traditional")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <Newspaper className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Traditional Marketing
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Yearly:{" "}
                        {formatCurrency(
                          (formData.traditionalMarketing?.printAds
                            ?.totalYearly || 0) +
                            (formData.traditionalMarketing
                              ?.eventsAndSponsorships?.totalYearly || 0),
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {formData.traditionalMarketing?.printAds?.newspapers
                        ?.length || 0}{" "}
                      Newspapers
                    </span>
                    {expandedSections.traditional ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.traditional && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <TraditionalMarketingCard
                        data={formData.traditionalMarketing}
                        isEditing={isEditing}
                        onInputChange={handleInputChange}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Business Development Section */}
          {(activeTab === "bd" || activeTab === "overview") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                onClick={() => toggleSection("bd")}
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Business Development
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monthly:{" "}
                        {formatCurrency(
                          formData.businessDevelopment?.totalBDMonthly || 0,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {formData.businessDevelopment?.salesTeam?.length || 0}{" "}
                      Team Members
                    </span>
                    {expandedSections.bd ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedSections.bd && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      <BusinessDevelopmentCard
                        data={formData.businessDevelopment}
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

      {/* Add Platform Modal */}
      <AddPlatformModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPlatform}
        type={addType}
      />
    </div>
  );
};

export default MarketingDashboard;
