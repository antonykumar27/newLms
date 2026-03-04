// pages/SubscriptionPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crown,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  Clock,
  Download,
  Brain,
  Award,
  Users,
  Star,
  Gift,
  TrendingUp,
  Globe,
  Smartphone,
  Headphones,
  Rocket,
  Coffee,
  PartyPopper,
  IndianRupee,
  ArrowRight,
  Lock,
  Unlock,
  ShieldCheck,
  Heart,
  BadgeCheck,
  Sparkles,
  AlertCircle,
  CreditCard,
  Smartphone as Phone,
  Smartphone as Mobile,
  Wifi,
  Battery,
  Check,
  Calendar,
  Repeat,
  RefreshCw,
  LifeBuoy,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../common/AuthContext";
import axios from "axios";
import { useGetStandardRateByIdQuery } from "../store/api/EachChapterApi";
const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [selectedTier, setSelectedTier] = useState("premium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get context from where user came (page lock, quiz lock, etc)
  const { from, pageNumber, pageTitle, chapterTitle, action, chapterId } =
    location.state || {};
  const {
    data: lessonData,
    isLoading: isLoadingData,
    error: isErrorData,
  } = useGetStandardRateByIdQuery(chapterId);

  // Malayalam plans data
  const plans = [
    {
      id: "free",
      name: "സൗജന്യ പ്ലാൻ",
      price: 0,
      yearlyPrice: 0,
      tier: "free",
      color: "from-gray-100 to-gray-200",
      border: "border-gray-300",
      badge: "എല്ലാവർക്കും",
      popular: false,
      emoji: "🎓",
      features: [
        { text: "📚 10+ അടിസ്ഥാന വിഷയങ്ങൾ", included: true },
        { text: "🎥 പരിമിത ലൈവ് ക്ലാസുകൾ", included: true },
        { text: "📝 50 വരെ നോട്ടുകൾ", included: true },
        { text: "⏰ 5 മിനിറ്റ് വീഡിയോ പ്രിവ്യൂ", included: true },
        { text: "🤖 AI ട്യൂട്ടർ (പരിമിതം)", included: true },
        { text: "📊 അടിസ്ഥാന അനലിറ്റിക്സ്", included: true },
        { text: "📜 സർട്ടിഫിക്കേഷൻ", included: false },
        { text: "💾 ഡൗൺലോഡ് സൗകര്യം", included: false },
        { text: "🎯 വ്യക്തിഗത മാർഗ്ഗനിർദ്ദേശം", included: false },
        { text: "📱 പ്രത്യേക മൊബൈൽ ആപ്പ്", included: false },
      ],
    },
    {
      id: "basic",
      name: "ബേസിക് പ്ലാൻ",
      price: 299,
      yearlyPrice: 2999,
      tier: "basic",
      color: "from-blue-50 to-cyan-50",
      border: "border-blue-300",
      badge: "മികച്ചത്",
      popular: true,
      emoji: "🚀",
      features: [
        { text: "📚 എല്ലാ വിഷയങ്ങളും", included: true },
        { text: "🎥 അനലിമിറ്റഡ് ലൈവ് ക്ലാസുകൾ", included: true },
        { text: "📝 500 വരെ നോട്ടുകൾ", included: true },
        { text: "⏰ പൂർണ്ണ ദൈർഘ്യമുള്ള വീഡിയോകൾ", included: true },
        { text: "🤖 AI ട്യൂട്ടർ (പ്രതിദിനം 5 ചോദ്യങ്ങൾ)", included: true },
        { text: "📊 വിപുലമായ അനലിറ്റിക്സ്", included: true },
        { text: "📜 സർട്ടിഫിക്കേഷൻ (ബേസിക്)", included: true },
        { text: "💾 പരിമിത ഡൗൺലോഡ്", included: true },
        { text: "🎯 സ്റ്റാൻഡേർഡ് മാർഗ്ഗനിർദ്ദേശം", included: true },
        { text: "📱 മൊബൈൽ ആപ്പ് ആക്സസ്", included: true },
      ],
    },
    {
      id: "premium",
      name: "പ്രീമിയം പ്ലാൻ",
      price: 499,
      yearlyPrice: 4999,
      tier: "premium",
      color: "from-purple-50 to-pink-50",
      border: "border-purple-400",
      badge: "ഏറ്റവും പ്രജനകം",
      popular: true,
      emoji: "👑",
      features: [
        { text: "📚 എല്ലാ വിഷയങ്ങളും + അഡ്വാൻസ്ഡ്", included: true },
        { text: "🎥 പ്രീമിയം ലൈവ് ക്ലാസുകൾ", included: true },
        { text: "📝 അനലിമിറ്റഡ് നോട്ടുകൾ", included: true },
        { text: "⏰ 4K ക്വാളിറ്റി വീഡിയോകൾ", included: true },
        { text: "🤖 AI ട്യൂട്ടർ (അപരിമിതം)", included: true },
        { text: "📊 റിയൽ-ടൈം അനലിറ്റിക്സ്", included: true },
        { text: "📜 വെരിഫൈഡ് സർട്ടിഫിക്കേഷൻ", included: true },
        { text: "💾 അനലിമിറ്റഡ് ഡൗൺലോഡ്", included: true },
        { text: "🎯 വ്യക്തിഗത ട്യൂട്ടർ സപ്പോർട്ട്", included: true },
        { text: "📱 പ്രത്യേക ഫീച്ചറുകളുള്ള ആപ്പ്", included: true },
        { text: "🏆 ടോപ്പർ ബോർഡ് ആക്സസ്", included: true },
        { text: "🎁 പ്രത്യേക സ്റ്റഡി മെറ്റീരിയൽ", included: true },
      ],
    },
  ];

  // Payment methods
  const paymentMethods = [
    {
      id: "razorpay",
      name: "UPI / Cards / Net Banking",
      icon: CreditCard,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "phonepe",
      name: "PhonePe UPI",
      icon: Phone,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "paytm",
      name: "PayTM Wallet",
      icon: Mobile,
      color: "from-blue-600 to-indigo-600",
    },
    {
      id: "cod",
      name: "Cash on Delivery (COD)",
      icon: IndianRupee,
      color: "from-green-500 to-emerald-500",
    },
  ];

  // Calculate savings
  const calculateSavings = (monthly, yearly) => {
    const yearlyTotal = monthly * 12;
    const savings = yearlyTotal - yearly;
    const percentage = Math.round((savings / yearlyTotal) * 100);
    return { savings, percentage };
  };

  // Get selected plan price
  const getSelectedPrice = () => {
    const plan = plans.find((p) => p.tier === selectedTier);
    if (!plan) return 0;

    return selectedPlan === "yearly" ? plan.yearlyPrice : plan.price;
  };

  // Handle payment
  const handlePayment = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const selectedPlanData = plans.find((p) => p.tier === selectedTier);
      const amount = getSelectedPrice();

      // Create order in backend
      const response = await axios.post("/api/payments/create-order", {
        planId: selectedPlanData.id,
        planName: selectedPlanData.name,
        amount,
        currency: "INR",
        duration: selectedPlan,
        userId: user._id,
      });

      const { orderId } = response.data;

      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount * 100, // In paise
        currency: "INR",
        name: "എഡുപ്രോ LMS",
        description: `Premium Subscription: ${selectedPlanData.name}`,
        order_id: orderId,
        handler: async (paymentResponse) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post("/api/payments/verify", {
              paymentId: paymentResponse.razorpay_payment_id,
              orderId: paymentResponse.razorpay_order_id,
              signature: paymentResponse.razorpay_signature,
              userId: user._id,
              plan: selectedPlanData,
            });

            if (verifyResponse.data.success) {
              // Update user tier in context
              updateUser({
                ...user,
                tier: selectedTier,
                subscription: {
                  planId: selectedPlanData.id,
                  planName: selectedPlanData.name,
                  status: "active",
                  startDate: new Date(),
                  endDate:
                    selectedPlan === "yearly"
                      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  autoRenew: true,
                },
              });

              setShowSuccess(true);

              // Redirect back to where they came from after 3 seconds
              setTimeout(() => {
                if (from === "page_lock" && pageNumber) {
                  // Find and navigate to the page they wanted
                  navigate(
                    `/teacherDetails/eachChapterStudy/watch/${pageNumber}`,
                  );
                } else {
                  navigate("/dashboard");
                }
              }, 3000);
            }
          } catch (error) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phoneNumber,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      setError(
        error.response?.data?.message || "Payment failed. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle free trial
  const handleStartFreeTrial = async () => {
    setIsProcessing(true);

    try {
      await axios.post("/api/subscription/start-trial", {
        userId: user._id,
        plan: "premium",
      });

      // Update user with trial status
      updateUser({
        ...user,
        subscription: {
          planId: "premium_trial",
          planName: "Premium Trial",
          status: "trial",
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      alert("🎉 7-day free trial activated!");

      // Redirect back
      if (from === "page_lock" && pageNumber) {
        navigate(`/teacherDetails/eachChapterStudy/watch/${pageNumber}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError("Failed to activate trial. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Success modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Subscription Activated!
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Welcome to {selectedTier === "premium" ? "Premium" : "Basic"} plan!
            You now have access to all features.
          </p>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-green-600" />
              <span className="font-bold text-green-700 dark:text-green-400">
                {selectedTier.toUpperCase()} MEMBER
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Redirecting you to your content...
            </p>
          </div>

          <motion.div
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 3 }}
            className="h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Context Banner */}
        {from && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-l-4 border-purple-500 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {from === "page_lock" ? "Page Locked" : "Premium Feature"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {pageTitle
                    ? `"${pageTitle}" requires Premium`
                    : "This feature requires Premium subscription"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4">
            <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              🎯 സ്മാർട്ട് ഇൻവെസ്റ്റ്മെന്റ്, മികച്ച ഭാവി
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
              നിങ്ങളുടെ വിജയത്തിനുള്ള
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-600 bg-clip-text text-transparent">
              സ്മാർട്ട് പ്ലാൻ!
            </span>
          </h1>

          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            1 ലക്ഷത്തിലധികം വിദ്യാർത്ഥികൾ ഇതിനകം തെരഞ്ഞെടുത്തു!
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-center p-1 bg-white dark:bg-gray-800 rounded-2xl border border-purple-200 dark:border-purple-800">
            <button
              onClick={() => setSelectedPlan("monthly")}
              className={`flex-1 py-3 px-6 rounded-xl text-center font-bold transition-all ${selectedPlan === "monthly" ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg" : "text-gray-600 dark:text-gray-400"}`}
            >
              📅 മാസിക പണം
            </button>
            <button
              onClick={() => setSelectedPlan("yearly")}
              className={`flex-1 py-3 px-6 rounded-xl text-center font-bold transition-all ${selectedPlan === "yearly" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "text-gray-600 dark:text-gray-400"}`}
            >
              🎁 വാർഷികം (2 മാസം സൗജന്യം!)
            </button>
          </div>
          {selectedPlan === "yearly" && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="mt-4 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full">
                <Gift className="h-4 w-4" />
                <span className="font-bold">
                  രൂപ {calculateSavings(499, 4999).savings} ലാഭിക്കുക!
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedTier(plan.tier)}
              className={`relative rounded-2xl border-2 ${plan.border} ${plan.color} p-6 backdrop-blur-sm cursor-pointer transition-all ${selectedTier === plan.tier ? "ring-4 ring-purple-500/30 shadow-2xl scale-105" : "shadow-lg"}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{plan.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    {selectedPlan === "yearly" ? plan.yearlyPrice : plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    / {selectedPlan === "yearly" ? "വർഷം" : "മാസം"}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${feature.included ? "text-gray-700 dark:text-gray-300" : "text-gray-500 line-through"}`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Current Plan Indicator */}
              {user?.tier === plan.tier && (
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full">
                    <Check className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                      നിങ്ങളുടെ പ്ലാൻ
                    </span>
                  </div>
                </div>
              )}

              {/* CTA Button - UPDATED HERE */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (plan.tier === "free") {
                    navigate("/dashboard");
                  } else if (plan.tier === "premium" && user?.tier === "free") {
                    handleStartFreeTrial();
                  } else {
                    // Navigate to registration page with plan details
                    navigate("/studentDetails/subscription/register", {
                      state: {
                        plan: plan,
                        from: from,
                        pageNumber: pageNumber,
                        pageTitle: pageTitle,
                        chapterTitle: chapterTitle,
                      },
                    });
                  }
                }}
                disabled={user?.tier === plan.tier}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                    : plan.tier === "free"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg"
                } ${user?.tier === plan.tier ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
              >
                {user?.tier === plan.tier ? (
                  "✓ നിങ്ങളുടെ പ്ലാൻ"
                ) : plan.tier === "free" ? (
                  "🎓 സൗജന്യം തുടങ്ങുക"
                ) : plan.tier === "premium" && user?.tier === "free" ? (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    🎁 7 ദിവസം സൗജന്യ ട്രയൽ
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Rocket className="h-4 w-4" />⚡ അപ്ഗ്രേഡ് ചെയ്യുക
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        {selectedTier !== "free" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              💳 പേയ്മെന്റ് മെത്തേഡ് തിരഞ്ഞെടുക്കുക
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === method.id
                      ? `border-purple-500 bg-gradient-to-br ${method.color}/10`
                      : "border-gray-300 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${method.color}`}
                    >
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {method.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-cyan-500/20">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  മൊത്തം തുക
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{getSelectedPrice()}
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    / {selectedPlan === "yearly" ? "വർഷം" : "മാസം"}
                  </span>
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    പ്രോസസ്സ് ചെയ്യുന്നു...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />₹{getSelectedPrice()} പണം
                    അടയ്ക്കുക
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Security & Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: ShieldCheck,
              title: "🔒 സുരക്ഷിത പേയ്മെന്റ്",
              description: "256-bit SSL എൻക്രിപ്ഷൻ",
            },
            {
              icon: RefreshCw,
              title: "💰 7 ദിവസം റിഫണ്ട്",
              description: "100% മണി തിരിച്ചു കൊടുക്കൽ",
            },
            {
              icon: LifeBuoy,
              title: "📞 24/7 സപ്പോർട്ട്",
              description: "എപ്പോഴും സഹായത്തിന്",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg">
                  <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-l-4 border-red-500 rounded-r-xl"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  {error}
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Need help? Contact support@edupromlms.com
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ❓ പതിവ് ചോദ്യങ്ങൾ
          </h3>

          <div className="space-y-4">
            {[
              {
                q: "ട്രയൽ പിരീഡിൽ പണം അടയ്ക്കേണ്ടതുണ്ടോ?",
                a: "ഇല്ല! 7 ദിവസം പൂർണ്ണമായും സൗജന്യമാണ്. ട്രയൽ കഴിഞ്ഞശേഷം മാത്രമേ പണം അടയ്ക്കേണ്ടതുള്ളൂ.",
              },
              {
                q: "എങ്ങനെ പണം അടയ്ക്കാം?",
                a: "UPI, ക്രെഡിറ്റ്/ഡെബിറ്റ് കാർഡ്, നെറ്റ് ബാങ്കിംഗ്, വാൾറ്റുകൾ എന്നിവ ഉപയോഗിക്കാം.",
              },
              {
                q: "റിഫണ്ട് ലഭിക്കുമോ?",
                a: "ഉടനെ! 7 ദിവസത്തിനുള്ളിൽ 100% റിഫണ്ട്. ഞങ്ങൾ നിങ്ങളുടെ വിജയം ഉറപ്പാക്കാൻ ശ്രമിക്കുന്നു.",
              },
              {
                q: "ഒരു പ്ലാൻ മാറ്റാൻ കഴിയുമോ?",
                a: "അതെ, എപ്പോഴും മാറ്റാം. പുതിയ പ്ലാനിന്റെ വ്യത്യാസം മാത്രം അടയ്ക്കണം.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
              >
                <div className="font-bold text-gray-900 dark:text-white mb-2">
                  {faq.q}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Support CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            സഹായം വേണോ? ഞങ്ങളുടെ സപ്പോർട്ട് ടീമിനെ ബന്ധപ്പെടുക
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Live Chat
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
