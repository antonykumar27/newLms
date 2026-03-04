import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetSponsorsByProjectIdQuery,
  useCreateSponsorsRecordMutation,
  useUpdateSponsorsRecordMutation,
  useGetSponsorsDashboardQuery,
  useAddInvestorMutation,
  useAddSponsorMutation,
  useAddGrantMutation,
} from "../../store/api/sponsorsApi";
import {
  Users,
  Building2,
  Award,
  Gift,
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
  Briefcase,
  UserCircle,
  UserCog,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  UsersRound,
  UserRound,
  UserRoundCog,
  UserRoundPlus,
  UserRoundMinus,
  UserRoundCheck,
  UserRoundX,
  Building,
  Landmark,
  Banknote,
  CreditCard,
  Wallet,
  Receipt,
  ReceiptText,
  Medal,
  Trophy,
  Crown,
  Star,
  StarOff,
  Heart,
  Share2,
  MoreVertical,
  MoreHorizontal,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
} from "lucide-react";

import InvestorsCard from "./InvestorsCard";
import SponsorsCard from "./SponsorsCard";
import GrantsCard from "./GrantsCard";
import SponsorChart from "./SponsorChart";
import InvestorChart from "./InvestorChart";
import AddInvestorModal from "./AddInvestorModal";
import AddSponsorModal from "./AddSponsorModal";
import AddGrantModal from "./AddGrantModal";
import SponsorDetailsModal from "./SponsorDetailsModal";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../utils/formatters";
import { toast } from "react-toastify";

const SponsorsDashboard = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    investors: true,
    sponsors: true,
    grants: true,
  });

  // RTK Query hooks
  const { data, isLoading, error, refetch } = useGetSponsorsByProjectIdQuery(
    projectId,
    {
      skip: !projectId,
    },
  );
  const [createSponsorsRecord, { isLoading: isCreating }] =
    useCreateSponsorsRecordMutation();
  const [updateSponsorsRecord, { isLoading: isUpdating }] =
    useUpdateSponsorsRecordMutation();
  const { data: dashboardData } = useGetSponsorsDashboardQuery(projectId, {
    skip: !projectId,
  });
  const [addInvestor] = useAddInvestorMutation();
  const [addSponsor] = useAddSponsorMutation();
  const [addGrant] = useAddGrantMutation();

  // State for form data
  const [formData, setFormData] = useState({
    projectId: projectId,
    investors: [
      {
        name: "Kerala Angel Network",
        type: "angel",
        investmentAmount: 5000000,
        equityStake: 5,
        investmentDate: "2024-01-15",
        boardSeat: false,
        notes: "First round investment",
      },
      {
        name: "EdTech Venture Fund",
        type: "vc",
        investmentAmount: 20000000,
        equityStake: 15,
        investmentDate: "2024-03-20",
        boardSeat: true,
        notes: "Series A funding",
      },
      {
        name: "Google for Education",
        type: "strategic",
        investmentAmount: 15000000,
        equityStake: 10,
        investmentDate: "2024-06-10",
        boardSeat: false,
        notes: "Strategic partnership",
      },
    ],
    sponsors: [
      {
        sponsorId: "SP001",
        name: "Google for Education",
        logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=50&h=50&fit=crop",
        website: "https://edu.google.com",
        tier: "platinum",
        contributionAmount: 10000000,
        contributionType: "cash",
        benefitsProvided: [
          "Logo on website",
          "Featured in marketing materials",
          "Guest lecture slots",
          "Product credits",
        ],
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        renewalOption: true,
        contactPerson: {
          name: "John Doe",
          email: "john@google.com",
          phone: "+91 9876543210",
        },
        sponsorshipYear1: 3500000,
        sponsorshipYear2: 3500000,
        sponsorshipYear3: 3000000,
      },
      {
        sponsorId: "SP002",
        name: "Microsoft Edu",
        logo: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=50&h=50&fit=crop",
        website: "https://education.microsoft.com",
        tier: "gold",
        contributionAmount: 5000000,
        contributionType: "services",
        benefitsProvided: [
          "Logo on website",
          "Free software licenses",
          "Workshop sessions",
        ],
        startDate: "2024-06-01",
        endDate: "2025-05-31",
        renewalOption: true,
        contactPerson: {
          name: "Jane Smith",
          email: "jane@microsoft.com",
          phone: "+91 9876543211",
        },
        sponsorshipYear1: 3000000,
        sponsorshipYear2: 2000000,
        sponsorshipYear3: 0,
      },
      {
        sponsorId: "SP003",
        name: "AWS Educate",
        logo: "https://images.unsplash.com/photo-1639322537228-f710d846a9c3?w=50&h=50&fit=crop",
        website: "https://aws.amazon.com/education",
        tier: "silver",
        contributionAmount: 2000000,
        contributionType: "services",
        benefitsProvided: [
          "AWS Credits",
          "Logo placement",
          "Workshop sessions",
        ],
        startDate: "2024-07-01",
        endDate: "2025-06-30",
        renewalOption: true,
        contactPerson: {
          name: "AWS Edu Team",
          email: "edu@aws.com",
          phone: "+1 234 567 890",
        },
        sponsorshipYear1: 1200000,
        sponsorshipYear2: 800000,
        sponsorshipYear3: 0,
      },
    ],
    grants: [
      {
        name: "Digital India Initiative",
        provider: "government",
        schemeName: "ICT for Education",
        amount: 2500000,
        receivedDate: "2024-02-10",
      },
      {
        name: "Education Innovation Grant",
        provider: "foundation",
        schemeName: "Tech for Good",
        amount: 1000000,
        receivedDate: "2024-05-20",
      },
      {
        name: "Startup India Seed Fund",
        provider: "government",
        schemeName: "Seed Fund Scheme",
        amount: 5000000,
        receivedDate: "2024-08-15",
      },
    ],
    totalSponsorshipsYear1: 7700000,
    totalSponsorshipsYear2: 6300000,
    totalSponsorshipsYear3: 3000000,
    totalSponsorshipsThreeYear: 17000000,
    totalInvestmentReceived: 40000000,
  });

  useEffect(() => {
    if (data?.data?.sponsors) {
      setFormData(data.data.sponsors);
    }
  }, [data]);

  const handleInputChange = (section, field, value, index, subfield) => {
    setFormData((prev) => {
      const newData = { ...prev };

      if (index !== undefined && subfield) {
        newData[section][index][field][subfield] = value;
      } else if (index !== undefined) {
        newData[section][index][field] = value;
      } else if (field) {
        newData[section][field] = value;
      } else {
        newData[section] = value;
      }

      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      if (data?.data?.sponsors) {
        // Update existing
        await updateSponsorsRecord({
          id: data.data.sponsors._id,
          ...formData,
        }).unwrap();
        toast.success("Sponsors record updated successfully!");
      } else {
        // Create new
        await createSponsorsRecord(formData).unwrap();
        toast.success("Sponsors record created successfully!");
      }
      refetch();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong");
    }
  };

  const handleAddInvestor = async (investorData) => {
    try {
      await addInvestor({
        id: data.data.sponsors._id,
        ...investorData,
      }).unwrap();
      toast.success("Investor added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add investor");
    }
  };

  const handleAddSponsor = async (sponsorData) => {
    try {
      await addSponsor({
        id: data.data.sponsors._id,
        ...sponsorData,
      }).unwrap();
      toast.success("Sponsor added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add sponsor");
    }
  };

  const handleAddGrant = async (grantData) => {
    try {
      await addGrant({
        id: data.data.sponsors._id,
        ...grantData,
      }).unwrap();
      toast.success("Grant added successfully!");
      refetch();
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add grant");
    }
  };

  const handleViewSponsor = (sponsor) => {
    setSelectedSponsor(sponsor);
    setShowDetailsModal(true);
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
            {error.data?.message || "Failed to load sponsors data"}
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
                <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Sponsors & Investors Management
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
              Total Sponsorships
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalSponsorshipsThreeYear)}
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
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                Investment
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Investment
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalInvestmentReceived)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              From {formData.investors.length} investors
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
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                Sponsors
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Active Sponsors
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {
                formData.sponsors.filter(
                  (s) => new Date(s.endDate) > new Date(),
                ).length
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Total: {formData.sponsors.length} sponsors
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
                <Gift className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                Grants
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Grants
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(
                formData.grants.reduce((sum, g) => sum + g.amount, 0),
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {formData.grants.length} grants received
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SponsorChart data={formData} />
          <InvestorChart data={formData} />
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
                <span>Edit Records</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("investor");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Investor</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("sponsor");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Award className="w-5 h-5" />
            <span>Add Sponsor</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddType("grant");
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Gift className="w-5 h-5" />
            <span>Add Grant</span>
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
          {/* Investors Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("investors")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Investors
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.investors.length} investors
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Total: {formatCurrency(formData.totalInvestmentReceived)}
                  </span>
                  {expandedSections.investors ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.investors && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <InvestorsCard
                      data={formData.investors}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                      planId={data?.data?.sponsors?._id}
                      onRefresh={refetch}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sponsors Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("sponsors")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Sponsors
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.sponsors.length} sponsors
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    3Y Total:{" "}
                    {formatCurrency(formData.totalSponsorshipsThreeYear)}
                  </span>
                  {expandedSections.sponsors ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.sponsors && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <SponsorsCard
                      data={formData.sponsors}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                      onViewSponsor={handleViewSponsor}
                      planId={data?.data?.sponsors?._id}
                      onRefresh={refetch}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Grants Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("grants")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Gift className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Grants
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.grants.length} grants
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Total:{" "}
                    {formatCurrency(
                      formData.grants.reduce((sum, g) => sum + g.amount, 0),
                    )}
                  </span>
                  {expandedSections.grants ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.grants && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <GrantsCard
                      data={formData.grants}
                      isEditing={isEditing}
                      onInputChange={handleInputChange}
                      planId={data?.data?.sponsors?._id}
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

      {/* Add Modals */}
      <AddInvestorModal
        isOpen={showAddModal && addType === "investor"}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddInvestor}
      />

      <AddSponsorModal
        isOpen={showAddModal && addType === "sponsor"}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSponsor}
      />

      <AddGrantModal
        isOpen={showAddModal && addType === "grant"}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddGrant}
      />

      {/* Sponsor Details Modal */}
      <SponsorDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        sponsor={selectedSponsor}
      />
    </div>
  );
};

export default SponsorsDashboard;
