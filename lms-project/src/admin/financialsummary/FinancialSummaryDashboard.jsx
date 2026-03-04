import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetFinancialSummaryByProjectIdQuery,
  useGetFinancialDashboardQuery,
  useGetProfitLossStatementQuery,
  useGetCashFlowStatementQuery,
  useGetBreakEvenAnalysisQuery,
  useGetInvestmentMetricsQuery,
  useGenerateFromReferencesMutation,
  useRecalculateMetricsMutation,
  useRunScenariosMutation,
} from "../../store/api/financialSummaryApi";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
  Target,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Award,
  Gift,
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
  User,
  XCircle,
  Banknote,
  Calculator,
  ChartNoAxesCombined,
} from "lucide-react";

import CostSummaryCard from "./CostSummaryCard";
import RevenueSummaryCard from "./RevenueSummaryCard";
import ProfitabilityCard from "./ProfitabilityCard";
import YearlyBreakdownCard from "./YearlyBreakdownCard";
import CashFlowCard from "./CashFlowCard";
import BreakEvenCard from "./BreakEvenCard";
import FinancialCharts from "./FinancialCharts";
import CashFlowChart from "./CashFlowChart";
import ProfitChart from "./ProfitChart";
import ScenarioAnalysisModal from "./ScenarioAnalysisModal";
// Add this import with the other imports
import InvestmentMetricsCard from "./InvestmentMetricsCard";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../utils/formatters";
import { toast } from "react-toastify";

const FinancialSummaryDashboard = ({ projectId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showScenarios, setShowScenarios] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    costs: true,
    revenue: true,
    profitability: true,
    yearly: true,
    cashflow: true,
  });

  // RTK Query hooks
  const { data, isLoading, error, refetch } =
    useGetFinancialSummaryByProjectIdQuery(projectId, {
      skip: !projectId,
    });
  const { data: dashboardData } = useGetFinancialDashboardQuery(projectId, {
    skip: !projectId,
  });
  const { data: pnlData } = useGetProfitLossStatementQuery(
    data?.data?.financialSummary?._id,
    {
      skip: !data?.data?.financialSummary?._id,
    },
  );
  const { data: cashFlowData } = useGetCashFlowStatementQuery(
    { id: data?.data?.financialSummary?._id, months: 24 },
    {
      skip: !data?.data?.financialSummary?._id,
    },
  );
  const { data: breakEvenData } = useGetBreakEvenAnalysisQuery(
    data?.data?.financialSummary?._id,
    {
      skip: !data?.data?.financialSummary?._id,
    },
  );
  const { data: investmentData } = useGetInvestmentMetricsQuery(
    data?.data?.financialSummary?._id,
    {
      skip: !data?.data?.financialSummary?._id,
    },
  );
  const [generateFromReferences, { isLoading: isGenerating }] =
    useGenerateFromReferencesMutation();
  const [recalculateMetrics, { isLoading: isRecalculating }] =
    useRecalculateMetricsMutation();
  const [runScenarios] = useRunScenariosMutation();

  // State for form data
  const [formData, setFormData] = useState({
    projectId: projectId,
    totalCosts: {
      developmentCosts: 5587600,
      infrastructureCosts: 632170,
      contentCreationCosts: 1250000,
      marketingCosts: 4500000,
      operationalCosts: 27018000,
      contingencyFund: 3950000,
      grandTotalCosts: 42927770,
    },
    totalRevenue: {
      b2cRevenue: 156476190,
      b2bRevenue: 15066400,
      otherRevenue: 7825000,
      sponsorships: 17000000,
      investments: 40000000,
      grandTotalRevenue: 236267590,
    },
    profitability: {
      grossProfit: 193339820,
      grossMargin: 81.8,
      netProfit: 193339820,
      netMargin: 81.8,
      roi: 450.3,
      paybackPeriod: 8,
      breakEvenPoint: {
        usersRequired: 8500,
        monthsRequired: 6,
        revenueRequired: 42927770,
      },
    },
    yearlyBreakdown: [
      {
        year: 1,
        revenue: 45000000,
        costs: 15000000,
        profit: 30000000,
        margin: 66.7,
        cumulativeProfit: 30000000,
      },
      {
        year: 2,
        revenue: 75000000,
        costs: 18000000,
        profit: 57000000,
        margin: 76.0,
        cumulativeProfit: 87000000,
      },
      {
        year: 3,
        revenue: 116267590,
        costs: 21000000,
        profit: 95267590,
        margin: 81.9,
        cumulativeProfit: 182267590,
      },
    ],
    cashFlow: {
      initialInvestment: 42927770,
      monthlyBurnRate: 3500000,
      runway: 12,
      cashFlowMonths: Array.from({ length: 36 }, (_, i) => ({
        month: i + 1,
        inflow: 3000000 + i * 500000,
        outflow: 3500000,
        netCashFlow: -500000 + i * 500000,
        cumulativeCash: -42927770 + i * 1000000,
      })),
    },
  });

  useEffect(() => {
    if (data?.data?.financialSummary) {
      setFormData(data.data.financialSummary);
    }
  }, [data]);

  const handleGenerateFromReferences = async () => {
    try {
      await generateFromReferences(projectId).unwrap();
      toast.success("Financial summary generated from references!");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to generate");
    }
  };

  const handleRecalculate = async () => {
    try {
      await recalculateMetrics(data.data.financialSummary._id).unwrap();
      toast.success("Metrics recalculated successfully!");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to recalculate");
    }
  };

  const handleRunScenarios = async (scenarios) => {
    try {
      const result = await runScenarios({
        id: data.data.financialSummary._id,
        scenarios,
      }).unwrap();
      toast.success("Scenarios analyzed!");
      return result;
    } catch (error) {
      toast.error(error.data?.message || "Failed to analyze scenarios");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: ChartNoAxesCombined },
    { id: "profitability", name: "Profitability", icon: TrendingUp },
    { id: "cashflow", name: "Cash Flow", icon: Banknote },
    { id: "breakeven", name: "Break Even", icon: Target },
    { id: "investment", name: "Investment", icon: Briefcase },
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
            {error.data?.message || "Failed to load financial summary"}
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
                <Calculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Financial Summary
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
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRecalculating ? "animate-spin" : ""}`}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleGenerateFromReferences}
                disabled={isGenerating}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Zap
                  className={`w-5 h-5 ${isGenerating ? "animate-pulse" : ""}`}
                />
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

          {/* Tabs */}
          <div className="flex space-x-1 mt-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white"
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
              Total Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalRevenue.grandTotalRevenue)}
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
                <TrendingDown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Costs
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.totalCosts.grandTotalCosts)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Including contingency
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
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                Net
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Net Profit
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(formData.profitability.netProfit)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Margin: {formData.profitability.netMargin}%
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
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                ROI
              </span>
            </div>
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Return on Investment
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formData.profitability.roi}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Payback: {formData.profitability.paybackPeriod} months
            </p>
          </motion.div>
        </div>

        {/* Charts Section */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <FinancialCharts data={formData} />
            <CashFlowChart data={cashFlowData} />
          </div>
        )}

        {activeTab === "profitability" && (
          <div className="mb-8">
            <ProfitChart data={pnlData} />
          </div>
        )}

        {activeTab === "cashflow" && (
          <div className="mb-8">
            <CashFlowChart data={cashFlowData} fullWidth />
          </div>
        )}

        {activeTab === "breakeven" && (
          <div className="mb-8">
            <BreakEvenCard data={breakEvenData} />
          </div>
        )}

        {activeTab === "investment" && (
          <div className="mb-8">
            <InvestmentMetricsCard data={investmentData} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScenarios(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Zap className="w-5 h-5" />
            <span>Scenario Analysis</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </motion.button>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-6">
          {/* Costs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("costs")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Cost Summary
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total:{" "}
                      {formatCurrency(formData.totalCosts.grandTotalCosts)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Contingency:{" "}
                    {formatCurrency(formData.totalCosts.contingencyFund)}
                  </span>
                  {expandedSections.costs ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.costs && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <CostSummaryCard data={formData.totalCosts} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Revenue Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("revenue")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Revenue Summary
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total:{" "}
                      {formatCurrency(formData.totalRevenue.grandTotalRevenue)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    B2C: {formatCurrency(formData.totalRevenue.b2cRevenue)}
                  </span>
                  {expandedSections.revenue ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.revenue && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <RevenueSummaryCard data={formData.totalRevenue} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Profitability Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("profitability")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Profitability
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Net Profit:{" "}
                      {formatCurrency(formData.profitability.netProfit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Margin: {formData.profitability.netMargin}%
                  </span>
                  {expandedSections.profitability ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.profitability && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <ProfitabilityCard data={formData.profitability} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Yearly Breakdown Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("yearly")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Yearly Breakdown
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      3-Year Performance
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    CAGR:{" "}
                    {(
                      (formData.yearlyBreakdown[2].revenue /
                        formData.yearlyBreakdown[0].revenue) **
                        (1 / 2) *
                        100 -
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  {expandedSections.yearly ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.yearly && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <YearlyBreakdownCard data={formData.yearlyBreakdown} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Cash Flow Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div
              onClick={() => toggleSection("cashflow")}
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Banknote className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Cash Flow
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Runway: {formData.cashFlow.runway} months
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Burn Rate:{" "}
                    {formatCurrency(formData.cashFlow.monthlyBurnRate)}/mo
                  </span>
                  {expandedSections.cashflow ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedSections.cashflow && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <CashFlowCard data={formData.cashFlow} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Scenario Analysis Modal */}
      <ScenarioAnalysisModal
        isOpen={showScenarios}
        onClose={() => setShowScenarios(false)}
        onAnalyze={handleRunScenarios}
        currentData={formData}
      />
    </div>
  );
};

export default FinancialSummaryDashboard;
