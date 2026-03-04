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
  Brain,
  Award,
  Users,
  Star,
  Gift,
  IndianRupee,
  ArrowRight,
  Lock,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  AlertCircle,
  CreditCard,
  Check,
  Calendar,
  RefreshCw,
  LifeBuoy,
  Percent,
  Tag,
} from "lucide-react";
import { useAuth } from "../common/AuthContext";
import { useGetStandardRateByIdQuery } from "../store/api/EachChapterApi";
import { useEnrollCoursesMutation } from "../store/api/CourseApi";
import { toast } from "react-toastify";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [finalPrices, setFinalPrices] = useState({
    monthly: 0,
    yearly: 0,
    monthlyAfterGST: 0,
    yearlyAfterGST: 0,
    discountAmount: 0,
    discountPercentage: 0,
    discountType: null,
  });
  console.log("finalPrice", finalPrices);
  // Get context from where user came
  const { from, pageNumber, pageTitle, chapterTitle, chapterId, standard } =
    location.state || {};

  // Get pricing data from server
  const {
    data: pricingData,
    isLoading: isLoadingData,
    error: isErrorData,
  } = useGetStandardRateByIdQuery(standard || user?.standard || chapterId);

  const [createEnrollment, { isLoading }] = useEnrollCoursesMutation();

  const id = pricingData?.data?._id;

  // Calculate final prices with GST and discount
  useEffect(() => {
    if (pricingData?.data) {
      const { pricing, discount, gstPercentage } = pricingData.data;
      const { monthly, yearly } = pricing;
      console.log("pricing", pricing); //{monthly: 500, yearly: 6000}
      console.log("discount", discount); //{type: 'percentage', value: 20, appliesTo: 'yearly'}
      console.log("gstPercentage", gstPercentage); //18
      console.log("monthly", monthly); //500
      console.log("yearly", yearly); //6000
      // Calculate discount for yearly plan
      let discountAmount = 0;
      let discountPercentage = 0;
      let discountType = null;

      if (discount && discount.appliesTo === "yearly") {
        discountType = discount.type;

        if (discount.type === "flat") {
          discountAmount = discount.value;
          discountPercentage = Math.round((discountAmount / yearly) * 100);
        } else if (discount.type === "percentage") {
          discountPercentage = discount.value;
          discountAmount = (yearly * discount.value) / 100;
        }
      }

      const yearlyAfterDiscount = yearly - discountAmount;

      // Calculate GST for both plans
      const calculateWithGST = (price) => {
        const gstAmount = (price * gstPercentage) / 100;
        return {
          original: price,
          gstAmount,
          final: Math.round(price + gstAmount),
        };
      };

      const monthlyPrice = calculateWithGST(monthly);
      const yearlyPrice = calculateWithGST(yearlyAfterDiscount);

      setFinalPrices({
        monthly: monthlyPrice.final,
        yearly: yearlyPrice.final,
        monthlyAfterGST: monthlyPrice,
        yearlyAfterGST: yearlyPrice,
        discountAmount,
        discountPercentage,
        discountType,
        yearlyOriginal: yearly,
        gstPercentage,
        monthlyOriginal: monthly,
      });
    }
  }, [pricingData]);

  // Calculate savings percentage
  const calculateSavings = () => {
    const monthlyTotal = finalPrices.monthlyAfterGST?.original * 12 || 0;
    const savings = monthlyTotal - (finalPrices.yearlyAfterGST?.original || 0);
    const percentage =
      monthlyTotal > 0 ? Math.round((savings / monthlyTotal) * 100) : 0;
    return { savings, percentage };
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      // Prepare complete payload with all pricing and discount data
      const enrollmentPayload = {
        standardId: id,
        plan: selectedPlan,
        finalPrices,
      };

      const response = await createEnrollment({
        id: id,
        enrollmentPayload: enrollmentPayload,
      }).unwrap();

      console.log("response?.success", response);

      if (response?.success) {
        toast.success("Enrollment successful!");

        // Navigate to registration with complete data
        navigate("/studentDetails/subscription/register", {
          state: {
            enrollmentPayload,
            orderId: response.data?.order,
          },
        });
      } else {
        toast.error("Enrollment failed");
      }
    } catch (error) {
      console.error("RTK Error:", error);
      toast.error(error?.data?.message || "Enrollment failed");
    }
  };

  // Success modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Subscription Activated!
          </h2>

          <p className="text-gray-600 mb-6">
            Your {selectedPlan} subscription is now active. You have full access
            to all content.
          </p>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="font-bold text-green-700">
                {selectedPlan === "yearly"
                  ? "ACADEMIC YEAR ACCESS"
                  : "30 DAYS ACCESS"}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Valid till:{" "}
              {selectedPlan === "yearly"
                ? `March 31, ${new Date().getFullYear() + 1}`
                : new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                  ).toLocaleDateString()}
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

  // Show loading state
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    );
  }

  // Format discount display
  const getDiscountDisplay = () => {
    if (!pricingData?.data?.discount || selectedPlan !== "yearly") return null;

    const discount = pricingData.data.discount;
    if (discount.type === "percentage") {
      return `${discount.value}% OFF`;
    } else if (discount.type === "flat") {
      return `₹${discount.value} OFF`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
                <h3 className="font-bold text-gray-900">
                  Premium Content Locked
                </h3>
                <p className="text-sm text-gray-600">
                  Subscribe to access this content
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
            <Crown className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-bold text-purple-600">
              Class {pricingData?.data?.standard} Pricing
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-lg text-gray-600">
            Unlock full access to all study materials and features
          </p>
        </motion.div>

        {/* Plan Toggle */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex p-1 bg-white rounded-2xl border border-purple-200">
            <button
              onClick={() => setSelectedPlan("monthly")}
              className={`flex-1 py-3 px-6 rounded-xl text-center font-bold transition-all ${
                selectedPlan === "monthly"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "text-gray-600"
              }`}
            >
              📅 Monthly
            </button>
            <button
              onClick={() => setSelectedPlan("yearly")}
              className={`flex-1 py-3 px-6 rounded-xl text-center font-bold transition-all relative ${
                selectedPlan === "yearly"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "text-gray-600"
              }`}
            >
              🎁 Yearly
              {pricingData?.data?.discount && (
                <span className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {getDiscountDisplay()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -5 }}
            className={`relative rounded-2xl border-2 p-6 backdrop-blur-sm cursor-pointer transition-all ${
              selectedPlan === "monthly"
                ? "border-blue-500 ring-4 ring-blue-500/30 shadow-2xl"
                : "border-gray-300 shadow-lg"
            }`}
            onClick={() => setSelectedPlan("monthly")}
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Monthly Plan
              </h3>

              <div className="mb-2">
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="h-5 w-5 text-gray-700" />
                  <span className="text-4xl font-black text-gray-900">
                    {finalPrices.monthly}
                  </span>
                  <span className="text-gray-600">/ month</span>
                </div>
                {finalPrices.monthlyAfterGST && (
                  <p className="text-xs text-gray-500 mt-1">
                    (Incl. {pricingData?.data?.gstPercentage}% GST: ₹
                    {Math.round(finalPrices.monthlyAfterGST.gstAmount)})
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                "Access to all subjects",
                "Unlimited video lessons",
                "Live classes access",
                "Practice questions",
                "Progress tracking",
                "Mobile app access",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`w-full py-3 rounded-xl font-bold ${
                selectedPlan === "monthly"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {selectedPlan === "monthly" ? "Selected" : "Select Monthly"}
            </button>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -5 }}
            className={`relative rounded-2xl border-2 p-6 backdrop-blur-sm cursor-pointer transition-all ${
              selectedPlan === "yearly"
                ? "border-purple-500 ring-4 ring-purple-500/30 shadow-2xl"
                : "border-gray-300 shadow-lg"
            }`}
            onClick={() => setSelectedPlan("yearly")}
          >
            {/* Popular Badge */}
            {pricingData?.data?.discount && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {getDiscountDisplay()}
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎁</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Yearly Plan
              </h3>

              {/* Price with Discount */}
              <div className="mb-2">
                {finalPrices.yearlyOriginal && (
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-lg line-through text-gray-500">
                      ₹{finalPrices.yearlyOriginal}
                    </span>
                    {finalPrices.discountAmount > 0 && (
                      <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full">
                        {finalPrices.discountType === "percentage"
                          ? `Save ${finalPrices.discountPercentage}%`
                          : `Save ₹${finalPrices.discountAmount}`}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="h-5 w-5 text-gray-700" />
                  <span className="text-4xl font-black text-gray-900">
                    {finalPrices.yearly}
                  </span>
                  <span className="text-gray-600">/ year</span>
                </div>

                {/* Savings Info */}
                {finalPrices.monthly > 0 && (
                  <div className="mt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full">
                      <Gift className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-bold text-green-700">
                        Save ₹{calculateSavings().savings} (
                        {calculateSavings().percentage}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* Academic Year Info */}
                {selectedPlan === "yearly" && (
                  <div className="mt-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        Academic Year Access
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Valid till March 31, {new Date().getFullYear() + 1}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                "Everything in Monthly",
                "Academic Year Access (June - March)",
                "Priority Support",
                "Certificate of Completion",
                "Advanced Analytics",
                "Download All Materials",
                "Exam Preparation Kit",
                "Parent Dashboard Access",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`w-full py-3 rounded-xl font-bold ${
                selectedPlan === "yearly"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {selectedPlan === "yearly" ? "Selected" : "Select Yearly"}
            </button>
          </motion.div>
        </div>

        {/* Price Breakdown */}
        {pricingData?.data && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📋 Price Details
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Monthly Plan</div>
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-2xl font-bold">
                      {finalPrices.monthly}
                    </span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Base: ₹{finalPrices.monthlyAfterGST?.original} + GST
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Yearly Plan</div>
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-2xl font-bold">
                      {finalPrices.yearly}
                    </span>
                    <span className="text-gray-600 text-sm">/year</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Save ₹{calculateSavings().savings} (
                    {calculateSavings().percentage}%)
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">
                  {selectedPlan === "yearly"
                    ? "Yearly Plan Breakdown"
                    : "Monthly Plan Breakdown"}
                </h4>
                <div className="space-y-2">
                  {selectedPlan === "yearly" &&
                    finalPrices.discountAmount > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Original Price:</span>
                          <span className="font-medium">
                            ₹{finalPrices.yearlyOriginal}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Discount (
                            {finalPrices.discountType === "percentage"
                              ? `${finalPrices.discountPercentage}%`
                              : `Flat ₹${finalPrices.discountAmount}`}
                            ):
                          </span>
                          <span className="font-medium text-green-600">
                            -₹{finalPrices.discountAmount}
                          </span>
                        </div>
                      </>
                    )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price after Discount:</span>
                    <span className="font-medium">
                      ₹
                      {selectedPlan === "yearly"
                        ? finalPrices.yearlyAfterGST?.original
                        : finalPrices.monthlyAfterGST?.original}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      GST ({pricingData.data.gstPercentage}%):
                    </span>
                    <span className="font-medium">
                      +₹
                      {Math.round(
                        selectedPlan === "yearly"
                          ? finalPrices.yearlyAfterGST?.gstAmount
                          : finalPrices.monthlyAfterGST?.gstAmount,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                    <span className="font-bold text-gray-900">
                      Total Amount:
                    </span>
                    <span className="font-bold text-lg text-purple-600">
                      ₹
                      {selectedPlan === "yearly"
                        ? finalPrices.yearly
                        : finalPrices.monthly}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹
                {selectedPlan === "monthly"
                  ? finalPrices.monthly
                  : finalPrices.yearly}
                <span className="text-base font-normal text-gray-600 ml-2">
                  / {selectedPlan === "yearly" ? "year" : "month"}
                </span>
              </p>
              {selectedPlan === "yearly" && (
                <p className="text-sm text-green-600 mt-1">
                  Academic Year Access • Valid till March 31,{" "}
                  {new Date().getFullYear() + 1}
                </p>
              )}
            </div>

            <button
              onClick={handlePayment}
              disabled={isLoading || !finalPrices.monthly}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Payment proceed ₹{" "}
                  {selectedPlan === "monthly"
                    ? finalPrices.monthly
                    : finalPrices.yearly}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-l-4 border-red-500 rounded-r-xl"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: ShieldCheck,
              title: "Secure Payment",
              desc: "256-bit SSL encryption",
            },
            {
              icon: Calendar,
              title: selectedPlan === "yearly" ? "Academic Year" : "30 Days",
              desc:
                selectedPlan === "yearly"
                  ? "June - March validity"
                  : "Monthly access",
            },
            {
              icon: LifeBuoy,
              title: "24/7 Support",
              desc: "Always available",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white/80 rounded-xl p-4 shadow-lg border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg">
                  <item.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
