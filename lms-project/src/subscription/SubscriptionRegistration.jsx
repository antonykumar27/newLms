import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Zap,
  Sparkles,
  BookOpen,
  Trophy,
  Clock,
  Globe,
  Award,
  Users,
  Star,
  ArrowRight,
  Loader2,
  PlayCircle,
  IndianRupee,
  User,
  Mail,
  Phone,
  Tag,
  BadgeCheck,
  Sun,
  Moon,
} from "lucide-react";

// Your Required Imports

import {
  useCreateCourseOrderMutation,
  useGetRazorpayKeyQuery,
  useVerifyCoursePaymentMutation,
} from "../store/api/razorpayApi";
import { useGetEnrollCoursesQuery } from "../store/api/CourseApi";
import { useAuth } from "../common/AuthContext"; // adjust if needed

const SubscriptionRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const location = useLocation();
  const enrollmentPayload = location.state.enrollmentPayload;
  const orderId = location.state.orderId;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    couponCode: "",
    agreeTerms: false,
  });
  // Extract course data
  const [pricingState, setPricingState] = useState({
    plan: "",
    basePrice: 0,
    taxableAmount: 0,
    gstAmount: 0,
    totalPrice: 0,
    standardId: null,
    plan: "",
  });

  useEffect(() => {
    if (!enrollmentPayload) return;

    const { plan, finalPrices, standardId } = enrollmentPayload;
    const isYearly = plan === "yearly";

    setPricingState({
      plan: plan,
      basePrice: isYearly
        ? finalPrices.yearlyOriginal
        : finalPrices.monthlyOriginal,

      taxableAmount: isYearly
        ? finalPrices.yearlyAfterGST.original
        : finalPrices.monthlyAfterGST.original,

      gstAmount: isYearly
        ? finalPrices.yearlyAfterGST.gstAmount
        : finalPrices.monthlyAfterGST.gstAmount,

      totalPrice: isYearly ? finalPrices.yearly : finalPrices.monthly,
      standardId: standardId,
    });
  }, [enrollmentPayload]);

  const { data: razorpayKeyData } = useGetRazorpayKeyQuery();
  const [verifyPayment] = useVerifyCoursePaymentMutation();
  const [createOrder, { isLoading: isOrderLoading }] =
    useCreateCourseOrderMutation();
  const isLoadingOrder = false;
  // 2026: Check system preference and localStorage for theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      setIsDarkMode(systemPrefersDark);
    }
  }, []);

  // 2026: Apply theme class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user?.user?.name || "",
        email: user?.user?.email || "",
        phone: user?.user?.phoneNumber || "",
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePayment = async (e) => {
    e.preventDefault();

    // ✅ IMPROVEMENT A: Better loading state control
    setIsProcessing(true);
    setError("");

    // ✅ IMPROVEMENT C: Check Razorpay SDK
    if (!window.Razorpay) {
      toast.error("Payment system not available. Please try again later.");
      setIsProcessing(false);
      return;
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill all required fields");
      setIsProcessing(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      setIsProcessing(false);
      return;
    }

    try {
      // ✅ IMPROVEMENT B: Send minimal amount data, let backend calculate
      const orderResponse = await createOrder({
        standardId: pricingState.standardId,
        plan: pricingState.plan,
        taxableAmount: pricingState.taxableAmount,
        gstAmount: pricingState.gstAmount,
        totalPrice: pricingState.totalPrice,
        orderId: orderId.id,
      }).unwrap();

      console.log("orderResponse", orderResponse);

      // Validate response
      if (!orderResponse?.order?.id) {
        console.log("orderResponse?.order?.id", orderResponse?.order?.id);
        throw new Error("Invalid order response from server");
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKeyData?.key,

        // ✅ IMPROVEMENT B: Use backend-calculated amount
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,

        name: "Pro Link Lms",
        description: `Payment for ${"course.title" || "orderDetails.courseTitle"}`,
        order_id: orderResponse.order.id,
        image: "course.thumbnail" || "/assets/images/logo.svg",

        handler: async (response) => {
          // Validate Razorpay response
          if (
            !response.razorpay_order_id ||
            !response.razorpay_payment_id ||
            !response.razorpay_signature
          ) {
            console.error("❌ Incomplete Razorpay response:", response);
            toast.error("Payment response incomplete");
            setIsProcessing(false);
            return;
          }

          try {
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId.id,
              standardId: pricingState.standardId,
            }).unwrap();

            if (verifyResponse.success) {
              // ✅ IMPROVEMENT A: Set loading false BEFORE redirect
              setIsProcessing(false);

              toast.success("🎉 Payment successful! Course enrolled.");

              // Show success for 1.5 seconds then redirect
              setTimeout(() => {}, 1500);
            } else {
              setIsProcessing(false);
              toast.error(
                `❌ ${verifyResponse.message || "Payment verification failed"}`,
              );
            }
          } catch (error) {
            console.error("❌ Verification error:", error);
            setIsProcessing(false);
            toast.error(error.data?.message || "Payment verification failed");
          }
        },

        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },

        theme: {
          color: "#7C3AED",
        },

        modal: {
          escape: true,
          ondismiss: () => {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          },
        },

        // ✅ Extra safety: Add timeout
        timeout: 300,
        retry: {
          enabled: true,
          max_count: 2,
        },

        notes: {
          standardId: pricingState.standardId,
          userId: user?._id,
          timestamp: new Date().toISOString(),
        },
      };

      // Open Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("❌ Payment initialization error:", err);
      setIsProcessing(false);

      const errorMessage =
        err.data?.error || err.message || "Payment failed. Please try again.";

      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    }
    // ✅ IMPROVEMENT A: REMOVED finally block - manual control
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center dark:bg-[#050505] bg-gray-50 transition-colors duration-300">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 dark:border-indigo-500/20 border-indigo-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 dark:text-slate-400 text-slate-600 font-medium animate-pulse">
          Preparing secure checkout...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-slate-200 text-slate-800 py-12 px-4 relative overflow-hidden transition-colors duration-300">
      {/* 2026 Theme Toggle Button - Floating Action */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full dark:bg-white/10 bg-gray-200/80 backdrop-blur-xl border dark:border-white/10 border-gray-300/50 shadow-lg hover:scale-110 transition-all duration-300"
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600" />
        )}
      </button>

      {/* 2026 Background Glows - Dynamic based on theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] dark:bg-indigo-600/10 bg-indigo-200/40 blur-[120px] -z-10 rounded-full transition-colors duration-300" />

      {/* Light mode additional glow */}
      {!isDarkMode && (
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/30 blur-[120px] -z-10 rounded-full" />
      )}

      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black dark:text-white text-gray-900 mb-4 tracking-tight"
          >
            Finalize Your{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Journey
            </span>
          </motion.h1>
          <p className="dark:text-slate-400 text-slate-600 text-lg">
            Secure your spot in our industry-leading program
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Course Details Bento */}
          <div className="lg:col-span-7 space-y-6">
            <div className="dark:bg-[#111114] bg-white border dark:border-white/5 border-gray-200/70 rounded-3xl p-8 dark:hover:border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-lg dark:shadow-none">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-40 h-40 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl shrink-0">
                  <BookOpen size={48} className="text-white" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold dark:text-white text-gray-900">
                    {"course.title"}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <span className="dark:bg-white/5 bg-indigo-50 px-3 py-1 rounded-full text-xs font-semibold dark:text-indigo-300 text-indigo-700 border dark:border-white/10 border-indigo-200">
                      Best Seller
                    </span>
                    <span className="flex items-center gap-1.5 text-sm dark:text-slate-400 text-slate-600">
                      <Users size={16} /> {"course.enrolledCount" || "500+"}{" "}
                      Enrolled
                    </span>
                  </div>
                  <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed line-clamp-2">
                    {"course.description" ||
                      "Master industry-standard skills with our comprehensive, hands-on curriculum."}
                  </p>
                </div>
              </div>

              {/* Bento Icons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t dark:border-white/5 border-gray-200">
                {[
                  {
                    icon: Clock,
                    label: "8 Weeks",
                    color: "dark:text-blue-400 text-blue-600",
                  },
                  {
                    icon: PlayCircle,
                    label: "40+ Lessons",
                    color: "dark:text-indigo-400 text-indigo-600",
                  },
                  {
                    icon: Trophy,
                    label: "Certificate",
                    color: "dark:text-amber-400 text-amber-600",
                  },
                  {
                    icon: Globe,
                    label: "English",
                    color: "dark:text-emerald-400 text-emerald-600",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="text-center md:text-left">
                    <item.icon
                      className={`w-5 h-5 ${item.color} mb-2 mx-auto md:mx-0`}
                    />
                    <p className="text-xs dark:text-slate-500 text-slate-600 uppercase font-bold tracking-tighter">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefit List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Zap,
                  text: "Instant Lifetime Access",
                  color:
                    "dark:bg-amber-500/10 bg-amber-100 dark:text-amber-500 text-amber-700",
                },
                {
                  icon: ShieldCheck,
                  text: "30-Day Money Back",
                  color:
                    "dark:bg-emerald-500/10 bg-emerald-100 dark:text-emerald-500 text-emerald-700",
                },
                {
                  icon: Award,
                  text: "Industry Certification",
                  color:
                    "dark:bg-purple-500/10 bg-purple-100 dark:text-purple-500 text-purple-700",
                },
                {
                  icon: Star,
                  text: "1-on-1 Mentorship",
                  color:
                    "dark:bg-blue-500/10 bg-blue-100 dark:text-blue-500 text-blue-700",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl dark:bg-white/5 bg-white border dark:border-white/5 border-gray-200 shadow-sm"
                >
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-medium dark:text-slate-300 text-gray-700">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Modern Checkout Form */}
          <div className="lg:col-span-5">
            <div className="dark:bg-[#111114] bg-white border dark:border-white/10 border-gray-200 rounded-[2.5rem] p-8 md:p-10 sticky top-8 shadow-2xl dark:shadow-indigo-500/5 shadow-indigo-200/50 transition-colors">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold dark:text-white text-gray-900">
                  Payment Summary
                </h3>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest dark:text-slate-500 text-slate-600 font-bold">
                    Secure Server
                  </span>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200 rounded-2xl py-4 pl-12 pr-4 dark:text-white text-gray-900 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all placeholder:dark:text-slate-600 placeholder:text-slate-400"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200 rounded-2xl py-4 pl-12 pr-4 dark:text-white text-gray-900 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all placeholder:dark:text-slate-600 placeholder:text-slate-400"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400 w-4 h-4" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      required
                      className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200 rounded-2xl py-4 pl-12 pr-4 dark:text-white text-gray-900 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all placeholder:dark:text-slate-600 placeholder:text-slate-400"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Price Box */}
                <div className="dark:bg-indigo-500/5 bg-indigo-50/50 border dark:border-indigo-500/20 border-indigo-200 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between dark:text-slate-400 text-slate-600 text-sm">
                    <span>Course Subtotal</span>
                    <span>₹{pricingState?.taxableAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between dark:text-slate-400 text-slate-600 text-sm">
                    <span>GST (18%)</span>
                    <span>₹{pricingState?.gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t dark:border-white/10 border-gray-200 flex justify-between items-center">
                    <span className="dark:text-white text-gray-900 font-bold">
                      Total Payable
                    </span>
                    <span className="text-2xl font-black dark:text-indigo-400 text-indigo-600">
                      ₹{pricingState.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 accent-indigo-500 w-4 h-4 rounded"
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      handleInputChange("agreeTerms", e.target.checked)
                    }
                  />
                  <span className="text-xs dark:text-slate-500 text-slate-600 group-hover:dark:text-slate-300 group-hover:text-slate-800 transition-colors leading-tight">
                    I agree to the{" "}
                    <span className="dark:text-indigo-400 text-indigo-600">
                      Terms & Conditions
                    </span>
                    . I understand this is a digital purchase.
                  </span>
                </label>

                {error && (
                  <p className="text-red-500 text-xs text-center font-medium dark:bg-red-400/10 bg-red-50 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || isOrderLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                >
                  {isProcessing || isOrderLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>
                        Pay ₹ {""}
                        {pricingState.totalPrice.toLocaleString()} Now
                      </span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <div className="flex justify-center gap-4 pt-4 border-t dark:border-white/5 border-gray-200 dark:opacity-30 opacity-40 grayscale dark:grayscale-0">
                  <CreditCard
                    size={18}
                    className="dark:text-slate-400 text-slate-600"
                  />
                  <Lock
                    size={18}
                    className="dark:text-slate-400 text-slate-600"
                  />
                  <ShieldCheck
                    size={18}
                    className="dark:text-slate-400 text-slate-600"
                  />
                  <BadgeCheck
                    size={18}
                    className="dark:text-slate-400 text-slate-600"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRegistration;
