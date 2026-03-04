//////teacher related page

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetStandardQuery,
  useDeleteStandardMutation,
} from "../store/api/StandardSubjectApi";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Grid,
  List,
  School,
  BookText,
  FileText,
  Award,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Sun,
  Moon,
  Search,
  Filter,
  Home,
  Globe,
  CreditCard,
  Tag,
  Percent,
  IndianRupee,
  Calendar,
  Users,
} from "lucide-react";
import { useAuth } from "../common/AuthContext";
import StandardSubjectForm from "./AdminCreateStandard";
const AdminCreatedAllStandards = () => {
  const { user } = useAuth();
  const isPrimaryStudent = user?.primaryStudents === "primaryStudent";
  const navigate = useNavigate();

  // State management
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [expandedCard, setExpandedCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStandard, setFilterStandard] = useState("all");
  const [filterMedium, setFilterMedium] = useState("all");

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch data
  const { data, isLoading } = useGetStandardQuery();
  const [deleteStandardSubject] = useDeleteStandardMutation();

  const handleDelete = async (id) => {
    try {
      await deleteStandardSubject(id).unwrap();
      toast.success("Deleted successfully!");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingId(null);
  };

  // Calculate price with discount
  const calculateDiscountedPrice = (price, discount) => {
    if (!discount || !discount.value) return price;

    if (discount.type === "percentage") {
      return price - (price * discount.value) / 100;
    } else if (discount.type === "fixed") {
      return price - discount.value;
    }
    return price;
  };

  // Calculate final price with GST
  const calculateFinalPrice = (price, gstPercentage) => {
    if (!gstPercentage) return price;
    return price + (price * gstPercentage) / 100;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const standardSubjects = data?.data || [];

  // Filter and sort standards
  let filteredStandards = [...standardSubjects];

  // Apply search filter
  if (searchQuery) {
    filteredStandards = filteredStandards.filter(
      (item) =>
        item.medium?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.standard?.toString().includes(searchQuery),
    );
  }

  // Apply standard filter
  if (filterStandard !== "all") {
    filteredStandards = filteredStandards.filter(
      (item) => item.standard?.toString() === filterStandard,
    );
  }

  // Apply medium filter
  if (filterMedium !== "all") {
    filteredStandards = filteredStandards.filter(
      (item) => item.medium?.toLowerCase() === filterMedium.toLowerCase(),
    );
  }

  // Sort standards
  const sortedStandards = filteredStandards.sort((a, b) => {
    // First by standard
    if (a.standard !== b.standard) return a.standard - b.standard;
    // Then by medium
    return a.medium?.localeCompare(b.medium);
  });

  // Get unique standards for filter dropdown
  const uniqueStandards = [
    ...new Set(standardSubjects.map((item) => item.standard)),
  ].sort();

  // Get unique mediums
  const uniqueMediums = [
    "all",
    ...new Set(standardSubjects.map((item) => item.medium?.toLowerCase())),
  ].filter(Boolean);

  // Group standards by standard number for better organization
  const groupedByStandard = sortedStandards.reduce((groups, item) => {
    const std = item.standard;
    if (!groups[std]) {
      groups[std] = [];
    }
    groups[std].push(item);
    return groups;
  }, {});

  // Medium colors mapping
  const mediumColors = {
    english: ["bg-gradient-to-br from-blue-600 to-indigo-800", "text-blue-50"],
    malayalam: [
      "bg-gradient-to-br from-amber-600 to-yellow-800",
      "text-amber-50",
    ],
    hindi: ["bg-gradient-to-br from-rose-600 to-pink-800", "text-rose-50"],
    default: ["bg-gradient-to-br from-gray-700 to-gray-900", "text-gray-50"],
  };

  // Mobile-friendly textbook card component
  const MobileTextbookCard = ({ item }) => {
    const isExpanded = expandedCard === item._id;
    const medium = item.medium || "Unknown";
    const imageUrl = item.media?.[0]?.url;

    const [bgColor] =
      mediumColors[medium.toLowerCase()] || mediumColors.default;

    // Calculate prices
    const monthlyDiscounted = calculateDiscountedPrice(
      item.monthlyPrice,
      // item.discount,
    );
    const yearlyDiscounted = calculateDiscountedPrice(
      item.yearlyPrice,
      item.discount,
    );

    const monthlyFinal = calculateFinalPrice(
      monthlyDiscounted,
      item.gstPercentage,
    );
    const yearlyFinal = calculateFinalPrice(
      yearlyDiscounted,
      item.gstPercentage,
    );
    const monthlySavings = item.monthlyPrice - monthlyDiscounted;
    const yearlySavings = item.yearlyPrice - yearlyDiscounted;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 mb-6"
      >
        {/* Card Header */}
        <div
          className={`relative h-48 ${!imageUrl ? bgColor : ""}`}
          onClick={() => setExpandedCard(isExpanded ? null : item._id)}
        >
          {imageUrl && (
            <>
              <img
                src={imageUrl}
                alt={`Standard ${item.standard} ${medium} cover`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
            </>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full mb-3">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                Standard {item.standard}
              </h2>
            </div>
            <div className="px-4 py-1.5 bg-white/30 dark:bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-white font-bold flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {medium.charAt(0).toUpperCase() + medium.slice(1)} Medium
              </span>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur-sm rounded-full">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-white" />
            ) : (
              <ChevronDown className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4">
          {/* Pricing Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex-1 min-w-[140px]">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Monthly
                    </p>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {monthlyFinal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {monthlySavings > 0 && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                      Save ₹{monthlySavings.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-[140px]">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Yearly
                    </p>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {yearlyFinal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {yearlySavings > 0 && (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded">
                      Save ₹{yearlySavings.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Discount Badge */}
          {item.discount?.value > 0 && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                <Tag className="h-3 w-3" />
                {item.discount.value}% OFF
                {item.discount.type === "percentage" && (
                  <Percent className="h-3 w-3" />
                )}
              </div>
            </div>
          )}

          {/* Always Visible Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                navigate(`/adminDetails/teacherCreatingCourse/${item._id}`)
              }
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View Chapters
            </button>
            {!isPrimaryStudent && (
              <button
                onClick={() => {
                  setEditingId(item._id);
                  setShowForm(true);
                }}
                className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Expandable Content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-4">
                {/* Price Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Original Monthly
                    </p>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.monthlyPrice}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Original Yearly
                    </p>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.yearlyPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GST Info */}
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <span className="font-medium">Note:</span> Includes{" "}
                    {item.gstPercentage}% GST
                  </p>
                </div>

                {/* Additional Actions for Admin */}
                {!isPrimaryStudent && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        setEditingId(item._id);
                        setShowForm(true);
                      }}
                      className="py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item._id)}
                      className="py-2.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  // Desktop textbook card component
  const DesktopTextbookCard = ({ item }) => {
    const medium = item.medium || "Unknown";
    const imageUrl = item.media?.[0]?.url;

    const [bgColor, textColor] =
      mediumColors[medium.toLowerCase()] || mediumColors.default;

    // Calculate prices
    const monthlyDiscounted = calculateDiscountedPrice(
      item.monthlyPrice,
      item.discount,
    );
    const yearlyDiscounted = calculateDiscountedPrice(
      item.yearlyPrice,
      item.discount,
    );
    const monthlyFinal = calculateFinalPrice(
      monthlyDiscounted,
      item.gstPercentage,
    );
    const yearlyFinal = calculateFinalPrice(
      yearlyDiscounted,
      item.gstPercentage,
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="group"
      >
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Textbook Cover */}
          <div className={`relative h-[280px] ${!imageUrl ? bgColor : ""}`}>
            {imageUrl && (
              <>
                <img
                  src={imageUrl}
                  alt={`Standard ${item.standard} ${medium} cover`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
              </>
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div className="mb-4">
                <div className="text-4xl font-bold text-white drop-shadow-lg mb-2">
                  {item.standard}
                </div>
                <div className="w-16 h-1 bg-white/50 mx-auto mb-3" />
                <div className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full">
                  <h2
                    className={`text-xl font-bold ${textColor} flex items-center gap-2`}
                  >
                    <Globe className="h-5 w-5" />
                    {medium.charAt(0).toUpperCase() + medium.slice(1)} Medium
                  </h2>
                </div>
              </div>
            </div>

            {/* Discount Badge */}
            {item.discount?.value > 0 && (
              <div className="absolute top-3 right-3">
                <div className="px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {item.discount.value}% OFF
                </div>
              </div>
            )}
          </div>

          {/* Quick Info Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-black/50 dark:bg-black/60 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
              <School className="h-3 w-3" />
              Std {item.standard}
            </span>
          </div>

          {/* Pricing Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Monthly
                </p>
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="h-4 w-4 text-gray-400" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {monthlyFinal.toFixed(2)}
                  </span>
                </div>
                {item.monthlyPrice > monthlyDiscounted && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-through mt-1">
                    ₹{item.monthlyPrice}
                  </p>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Yearly
                </p>
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="h-4 w-4 text-gray-400" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {yearlyFinal.toFixed(2)}
                  </span>
                </div>
                {item.yearlyPrice > yearlyDiscounted && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-through mt-1">
                    ₹{item.yearlyPrice}
                  </p>
                )}
              </div>
            </div>

            {/* GST Info */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Includes {item.gstPercentage}% GST
              </p>
            </div>
          </div>

          {/* Actions (Desktop - Hover) */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-center gap-2">
              <button
                onClick={() =>
                  navigate(`/adminDetails/teacherCreatingCourse/${item._id}`)
                }
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg text-sm flex items-center gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                View Chapters
              </button>
              <button
                onClick={() =>
                  navigate(`/teacherStudentDiscussion/${item._id}`, {
                    state: { item },
                  })
                }
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                Discussion
              </button>
              {!isPrimaryStudent && (
                <>
                  <button
                    onClick={() => {
                      setEditingId(item._id);
                      setShowForm(true);
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-lg text-sm flex items-center gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item._id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg text-sm flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Always Visible Info Footer */}
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {medium.charAt(0).toUpperCase() + medium.slice(1)} Medium
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Standard {item.standard}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  2024-25
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Standard Group Component
  const StandardGroup = ({ standard, items }) => {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{standard}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Standard {standard}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {items.length} medium{items.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        <div
          className={
            isMobile
              ? "space-y-4"
              : viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "space-y-6"
          }
        >
          {items.map((item) =>
            isMobile ? (
              <MobileTextbookCard key={item._id} item={item} />
            ) : (
              <DesktopTextbookCard key={item._id} item={item} />
            ),
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Standard Repository
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {!isPrimaryStudent && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Add Standard</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* Header Section */}
        {!isPrimaryStudent && (
          <div className="max-w-7xl mx-auto mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Standard Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage all standards, mediums, and pricing
                </p>
              </div>

              {/* Search and Filters */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by standard or medium..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={filterStandard}
                      onChange={(e) => setFilterStandard(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 appearance-none transition-colors"
                    >
                      <option value="all">All Standards</option>
                      {uniqueStandards.map((std) => (
                        <option key={std} value={std}>
                          Standard {std}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={filterMedium}
                      onChange={(e) => setFilterMedium(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 appearance-none transition-colors"
                    >
                      <option value="all">All Mediums</option>
                      {uniqueMediums
                        .filter((m) => m !== "all")
                        .map((medium) => (
                          <option key={medium} value={medium}>
                            {medium.charAt(0).toUpperCase() + medium.slice(1)}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="hidden md:flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-300 dark:border-gray-700">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "grid"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "list"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Banner for Students */}
        {isPrimaryStudent && (
          <div className="max-w-7xl mx-auto mb-6 px-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                📚 Choose Your Learning Path
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                Select your standard and medium to access the curriculum. Each
                standard offers different subjects tailored to your grade level.
              </p>
            </div>
          </div>
        )}

        {/* Stats Bar - Only for Admin */}
        {!isPrimaryStudent && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Standards
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {uniqueStandards.length}
                    </p>
                  </div>
                  <School className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Entries
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {standardSubjects.length}
                    </p>
                  </div>
                  <BookOpen className="h-6 w-6 text-green-500 dark:text-green-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Available Mediums
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {uniqueMediums.length - 1}
                    </p>
                  </div>
                  <Globe className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {sortedStandards.length > 0 ? (
            <>
              {/* Results Info */}
              <div className="flex justify-between items-center mb-6 px-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {sortedStandards.length} standard
                    {sortedStandards.length !== 1 ? "s" : ""}
                  </p>
                  {(searchQuery ||
                    filterStandard !== "all" ||
                    filterMedium !== "all") && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {filterStandard !== "all" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                          Standard {filterStandard}
                        </span>
                      )}
                      {filterMedium !== "all" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded-full">
                          {filterMedium.charAt(0).toUpperCase() +
                            filterMedium.slice(1)}{" "}
                          Medium
                        </span>
                      )}
                      {(searchQuery ||
                        filterStandard !== "all" ||
                        filterMedium !== "all") && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setFilterStandard("all");
                            setFilterMedium("all");
                          }}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Standards Display */}
              {Object.keys(groupedByStandard).length > 0 ? (
                Object.entries(groupedByStandard).map(([standard, items]) => (
                  <StandardGroup
                    key={standard}
                    standard={standard}
                    items={items}
                  />
                ))
              ) : (
                // Fallback display if grouping fails
                <div
                  className={
                    isMobile
                      ? "space-y-4"
                      : viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-6"
                  }
                >
                  {sortedStandards.map((item) =>
                    isMobile ? (
                      <MobileTextbookCard key={item._id} item={item} />
                    ) : (
                      <DesktopTextbookCard key={item._id} item={item} />
                    ),
                  )}
                </div>
              )}
            </>
          ) : (
            // Empty state
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
              <School className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                {searchQuery ||
                filterStandard !== "all" ||
                filterMedium !== "all"
                  ? "No matching standards found"
                  : isPrimaryStudent
                    ? "No Standards Available Yet"
                    : "No Standards Available"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchQuery ||
                filterStandard !== "all" ||
                filterMedium !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : isPrimaryStudent
                    ? "Your school hasn't added any standards yet. Please check back later."
                    : "Start by adding your first standard to the repository"}
              </p>
              {!isPrimaryStudent &&
              (searchQuery ||
                filterStandard !== "all" ||
                filterMedium !== "all") ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStandard("all");
                    setFilterMedium("all");
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              ) : !isPrimaryStudent ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add First Standard
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 md:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {editingId ? "Edit Standard" : "Add New Standard"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <StandardSubjectForm
                standardSubjectId={editingId}
                onSuccess={handleSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-lg"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete Standard?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This action cannot be undone. All associated data will be
                removed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCreatedAllStandards;
