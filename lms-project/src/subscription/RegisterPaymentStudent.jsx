import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BookOpen,
  Trophy,
  Clock,
  Users,
  Star,
  CheckCircle,
  Loader2,
  IndianRupee,
  User,
  Mail,
  Phone,
  Tag,
  CreditCard,
} from "lucide-react";

import { useAuth } from "../common/AuthContext";
import {
  useCreateCourseOrderMutation,
  useGetRazorpayKeyQuery,
  useVerifyCoursePaymentMutation,
} from "../store/api/razorpayApi";
import { useGetEnrollCoursesQuery } from "../store/api/CourseApi";

const RegisterPaymentStudent = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    couponCode: "",
    agreeTerms: false,
  });

  const { data: CourseOrder, isLoading: isLoadingOrder } =
    useGetEnrollCoursesQuery();

  const course = CourseOrder?.data?.course || {};
  const orderDetails = CourseOrder?.data || {};

  const basePrice = orderDetails?.amount || course?.price || 0;
  const gstPercentage = 18;
  const gstAmount = (basePrice * gstPercentage) / 100;
  const totalPrice = basePrice + gstAmount;

  const { data: razorpayKeyData } = useGetRazorpayKeyQuery();
  const [verifyPayment] = useVerifyCoursePaymentMutation();
  const [createOrder, { isLoading: isOrderLoading }] =
    useCreateCourseOrderMutation();

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // useEffect(() => {
  //   if (!isLoadingOrder && !CourseOrder?.data) {
  //     toast.error("Course information missing. Redirecting to courses.");
  //     navigate("/courses");
  //   }
  // }, [CourseOrder, isLoadingOrder, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    if (!window.Razorpay) {
      toast.error("Payment system not available. Please try again later.");
      setIsProcessing(false);
      return;
    }

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
      const orderResponse = await createOrder({
        courseId: orderDetails.courseId,
        amount: totalPrice * 100,
        currency: "INR",
        courseData: {
          title: course.title || orderDetails.courseTitle,
          description: course.description || "",
        },
        userData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        couponCode: formData.couponCode || "",
      }).unwrap();

      if (!orderResponse.order?.id) {
        throw new Error("Invalid order response from server");
      }

      const options = {
        key: razorpayKeyData?.key,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: "LearnHub Academy",
        description: `Payment for ${course.title || orderDetails.courseTitle}`,
        order_id: orderResponse.order.id,
        image: course.thumbnail || "/assets/images/logo.svg",

        handler: async (response) => {
          if (
            !response.razorpay_order_id ||
            !response.razorpay_payment_id ||
            !response.razorpay_signature
          ) {
            toast.error("Payment response incomplete");
            setIsProcessing(false);
            return;
          }

          try {
            const verifyResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderResponse.data?.orderId,
              courseId: orderDetails.courseId,
            }).unwrap();

            if (verifyResponse.success) {
              setIsProcessing(false);
              toast.success("Payment successful! Course enrolled.");

              setTimeout(() => {
                navigate(`/learn/${orderDetails.courseId}`, {
                  state: {
                    enrolledAt: new Date().toISOString(),
                    enrollmentId: verifyResponse.data?.enrollmentId,
                    purchaseAmount: (orderResponse.order?.amount || 0) / 100,
                    certificateEligible: true,
                  },
                });
              }, 1500);
            } else {
              setIsProcessing(false);
              toast.error(
                `${verifyResponse.message || "Payment verification failed"}`,
              );
            }
          } catch (error) {
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

        timeout: 300,
        retry: {
          enabled: true,
          max_count: 2,
        },

        notes: {
          courseId: orderDetails.courseId,
          userId: user?._id,
          timestamp: new Date().toISOString(),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      const errorMessage =
        err.data?.error || err.message || "Payment failed. Please try again.";
      setError(errorMessage);
      toast.error(`${errorMessage}`);
    }
  };

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Enrollment
          </h1>
          <p className="text-gray-600 mt-2">
            Secure your spot in this amazing course
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg bg-purple-600 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {orderDetails.courseTitle || course.title || "Course"}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4" />
                    {course.enrolledCount || "0"} students enrolled
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="font-bold text-gray-900">
                    {course.duration || "8 weeks"}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm text-gray-600">Certificate</span>
                  <span className="font-bold text-gray-900">Yes</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                  <Star className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm text-gray-600">Support</span>
                  <span className="font-bold text-gray-900">Premium</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-orange-600 mb-2" />
                  <span className="text-sm text-gray-600">Access</span>
                  <span className="font-bold text-gray-900">Lifetime</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                What You'll Get
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Certificate of Completion",
                  "Lifetime Access",
                  "Community Access",
                  "Downloadable Resources",
                  "Premium Support",
                  "30-Day Money Back",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-gray-300 sticky top-8">
              <div className="bg-purple-600 text-white p-4 rounded-t-lg">
                <h3 className="text-xl font-bold flex items-center justify-between">
                  <span>Payment Summary</span>
                </h3>
              </div>
              <div className="p-6">
                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Personal Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Details
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            placeholder="+91 9876543210"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Coupon Code (Optional)
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={formData.couponCode}
                        onChange={(e) =>
                          handleInputChange("couponCode", e.target.value)
                        }
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-300" />

                  {/* Price Breakdown */}
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900">
                      Price Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Course Price</span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {basePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>GST ({gstPercentage}%)</span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {gstAmount.toFixed(2)}
                        </span>
                      </div>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total Amount</span>
                        <span className="text-purple-700 flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.agreeTerms}
                      onChange={(e) =>
                        handleInputChange("agreeTerms", e.target.checked)
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="text-purple-600 hover:underline"
                      >
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-purple-600 hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  {/* Payment Button */}
                  <button
                    type="submit"
                    disabled={isProcessing || isOrderLoading}
                    className="w-full p-4 text-lg font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-3"
                  >
                    {isProcessing || isOrderLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <CreditCard className="w-5 h-5" />
                        <span>Pay ₹{totalPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </button>

                  {/* Guarantee */}
                  <p className="text-center text-sm text-gray-500">
                    30-Day Money-Back Guarantee
                  </p>

                  {error && (
                    <p className="text-red-500 text-center font-medium p-3 bg-red-50 rounded-lg">
                      {error}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPaymentStudent;
// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "react-toastify";
// import {
//   CreditCard,
//   Lock,
//   ShieldCheck,
//   Zap,
//   Sparkles,
//   BookOpen,
//   Trophy,
//   Clock,
//   Globe,
//   Award,
//   Users,
//   Star,
//   CheckCircle,
//   ArrowRight,
//   Loader2,
//   PlayCircle,
//   IndianRupee,
//   User,
//   Mail,
//   Phone,
//   Tag,
//   BadgeCheck,
// } from "lucide-react";

// // UI Components
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";

// import { useAuth } from "../pages/AuthContext";
// // API Hooks
// import {
//   useCreateCourseOrderMutation,
//   useGetRazorpayKeyQuery,
//   useVerifyCoursePaymentMutation,
// } from "../store/api/razorpayApi";
// import { useGetEnrollCoursesQuery } from "../store/api/CourseApi";

// const RegisterPaymentStudent = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [error, setError] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const { user } = useAuth();

//   // Form state - using useState instead of react-hook-form
//   const [formData, setFormData] = useState({
//     name: user?.name || "",
//     email: user?.email || "",
//     phone: user?.phone || "",
//     couponCode: "",
//     agreeTerms: false,
//   });

//   // Get course data from API
//   const { data: CourseOrder, isLoading: isLoadingOrder } =
//     useGetEnrollCoursesQuery();
//   console.log("CourseOrder", CourseOrder?.data);

//   // Extract course data
//   const course = CourseOrder?.data?.course || {};
//   const orderDetails = CourseOrder?.data || {};

//   const basePrice = orderDetails?.amount || course?.price || 0;
//   const gstPercentage = 18;
//   const gstAmount = (basePrice * gstPercentage) / 100;
//   const totalPrice = basePrice + gstAmount;

//   // Payment APIs
//   const { data: razorpayKeyData } = useGetRazorpayKeyQuery();
//   console.log("razorpayKeyData", razorpayKeyData);
//   const [verifyPayment] = useVerifyCoursePaymentMutation();
//   const [createOrder, { isLoading: isOrderLoading }] =
//     useCreateCourseOrderMutation();

//   // Auto-fill user data on load
//   useEffect(() => {
//     if (user) {
//       setFormData((prev) => ({
//         ...prev,
//         name: user.name || "",
//         email: user.email || "",
//         phone: user.phone || "",
//       }));
//     }
//   }, [user]);

//   // Redirect if no course data
//   useEffect(() => {
//     if (!isLoadingOrder && !CourseOrder?.data) {
//       toast.error("Course information missing. Redirecting to courses.");
//       navigate("/courses");
//     }
//   }, [CourseOrder, isLoadingOrder, navigate]);

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handlePayment = async (e) => {
//     e.preventDefault();

//     // ✅ IMPROVEMENT A: Better loading state control
//     setIsProcessing(true);
//     setError("");

//     // ✅ IMPROVEMENT C: Check Razorpay SDK
//     if (!window.Razorpay) {
//       toast.error("Payment system not available. Please try again later.");
//       setIsProcessing(false);
//       return;
//     }

//     // Validate form
//     if (!formData.name || !formData.email || !formData.phone) {
//       setError("Please fill all required fields");
//       setIsProcessing(false);
//       return;
//     }

//     if (!formData.agreeTerms) {
//       setError("You must agree to the terms and conditions");
//       setIsProcessing(false);
//       return;
//     }

//     try {
//       // ✅ IMPROVEMENT B: Send minimal amount data, let backend calculate
//       const orderResponse = await createOrder({
//         courseId: orderDetails.courseId,
//         amount: totalPrice * 100,
//         currency: "INR",
//         courseData: {
//           title: course.title || orderDetails.courseTitle,
//           description: course.description || "",
//         },
//         userData: {
//           name: formData.name,
//           email: formData.email,
//           phone: formData.phone,
//         },
//         couponCode: formData.couponCode || "",
//       }).unwrap();

//       console.log("✅ Backend Order Created:", {
//         razorpayOrderId: orderResponse.order?.id,
//         databaseOrderId: orderResponse.data?.orderId,
//         amount: orderResponse.order?.amount,
//       });

//       // Validate response
//       if (!orderResponse.order?.id) {
//         throw new Error("Invalid order response from server");
//       }

//       // Initialize Razorpay
//       const options = {
//         key: razorpayKeyData?.key,

//         // ✅ IMPROVEMENT B: Use backend-calculated amount
//         amount: orderResponse.order.amount,
//         currency: orderResponse.order.currency,

//         name: "LearnHub Academy",
//         description: `Payment for ${course.title || orderDetails.courseTitle}`,
//         order_id: orderResponse.order.id,
//         image: course.thumbnail || "/assets/images/logo.svg",

//         handler: async (response) => {
//           console.log("💰 Payment Success:", {
//             order_id: response.razorpay_order_id,
//             payment_id: response.razorpay_payment_id,
//             signature_present: !!response.razorpay_signature,
//           });

//           // Validate Razorpay response
//           if (
//             !response.razorpay_order_id ||
//             !response.razorpay_payment_id ||
//             !response.razorpay_signature
//           ) {
//             console.error("❌ Incomplete Razorpay response:", response);
//             toast.error("Payment response incomplete");
//             setIsProcessing(false);
//             return;
//           }

//           try {
//             const verifyResponse = await verifyPayment({
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//               orderId: orderResponse.data?.orderId,
//               courseId: orderDetails.courseId,
//             }).unwrap();

//             console.log("✅ Payment Verified:", verifyResponse);

//             if (verifyResponse.success) {
//               // ✅ IMPROVEMENT A: Set loading false BEFORE redirect
//               setIsProcessing(false);

//               toast.success("🎉 Payment successful! Course enrolled.");

//               // Show success for 1.5 seconds then redirect
//               setTimeout(() => {
//                 navigate(`/learn/${orderDetails.courseId}`, {
//                   state: {
//                     enrolledAt: new Date().toISOString(),
//                     enrollmentId: verifyResponse.data?.enrollmentId,
//                     purchaseAmount: (orderResponse.order?.amount || 0) / 100,
//                     certificateEligible: true,
//                   },
//                 });
//               }, 1500);
//             } else {
//               setIsProcessing(false);
//               toast.error(
//                 `❌ ${verifyResponse.message || "Payment verification failed"}`,
//               );
//             }
//           } catch (error) {
//             console.error("❌ Verification error:", error);
//             setIsProcessing(false);
//             toast.error(error.data?.message || "Payment verification failed");
//           }
//         },

//         prefill: {
//           name: formData.name,
//           email: formData.email,
//           contact: formData.phone,
//         },

//         theme: {
//           color: "#7C3AED",
//         },

//         modal: {
//           escape: true,
//           ondismiss: () => {
//             console.log("👤 User cancelled payment");
//             setIsProcessing(false);
//             toast.info("Payment cancelled");
//           },
//         },

//         // ✅ Extra safety: Add timeout
//         timeout: 300,
//         retry: {
//           enabled: true,
//           max_count: 2,
//         },

//         notes: {
//           courseId: orderDetails.courseId,
//           userId: user?._id,
//           timestamp: new Date().toISOString(),
//         },
//       };

//       // Open Razorpay
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error("❌ Payment initialization error:", err);
//       setIsProcessing(false);

//       const errorMessage =
//         err.data?.error || err.message || "Payment failed. Please try again.";

//       setError(errorMessage);
//       toast.error(`❌ ${errorMessage}`);
//     }
//     // ✅ IMPROVEMENT A: REMOVED finally block - manual control
//   };

//   if (isLoadingOrder) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
//           <p className="text-gray-600 dark:text-gray-300">
//             Loading course details...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-12"
//         >
//           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//             Complete Your Enrollment
//           </h1>
//           <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg">
//             Secure your spot in this amazing course
//           </p>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Course Summary */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Course Card */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.1 }}
//             >
//               <Card className="border-2 border-purple-100 dark:border-purple-900 shadow-xl hover:shadow-2xl transition-all duration-300 dark:bg-gray-800">
//                 <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30">
//                   <div className="flex items-center gap-4">
//                     <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
//                       <BookOpen className="w-8 h-8 text-white" />
//                     </div>
//                     <div>
//                       <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
//                         {orderDetails.courseTitle || course.title || "Course"}
//                       </CardTitle>
//                       <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
//                         <Users className="w-4 h-4" />
//                         {course.enrolledCount || "0"} students enrolled
//                       </p>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="pt-6">
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                     <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
//                       <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
//                       <span className="text-sm text-gray-600 dark:text-gray-300">
//                         Duration
//                       </span>
//                       <span className="font-bold text-gray-900 dark:text-white">
//                         {course.duration || "8 weeks"}
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
//                       <PlayCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
//                       <span className="text-sm text-gray-600 dark:text-gray-300">
//                         Lectures
//                       </span>
//                       <span className="font-bold text-gray-900 dark:text-white">
//                         {course.lectureCount || "40+"}
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
//                       <Trophy className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
//                       <span className="text-sm text-gray-600 dark:text-gray-300">
//                         Certificate
//                       </span>
//                       <span className="font-bold text-gray-900 dark:text-white">
//                         Yes
//                       </span>
//                     </div>
//                     <div className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
//                       <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
//                       <span className="text-sm text-gray-600 dark:text-gray-300">
//                         Language
//                       </span>
//                       <span className="font-bold text-gray-900 dark:text-white">
//                         English
//                       </span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>

//             {/* Benefits */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2 }}
//             >
//               <Card className="border-2 border-green-100 dark:border-green-900 dark:bg-gray-800">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
//                     <Sparkles className="w-6 h-6 text-green-600" />
//                     What You'll Get
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {[
//                       {
//                         icon: Award,
//                         text: "Certificate of Completion",
//                         color: "text-purple-600 dark:text-purple-400",
//                       },
//                       {
//                         icon: Zap,
//                         text: "Lifetime Access",
//                         color: "text-blue-600 dark:text-blue-400",
//                       },
//                       {
//                         icon: Users,
//                         text: "Community Access",
//                         color: "text-green-600 dark:text-green-400",
//                       },
//                       {
//                         icon: BookOpen,
//                         text: "Downloadable Resources",
//                         color: "text-orange-600 dark:text-orange-400",
//                       },
//                       {
//                         icon: Star,
//                         text: "Premium Support",
//                         color: "text-pink-600 dark:text-pink-400",
//                       },
//                       {
//                         icon: ShieldCheck,
//                         text: "30-Day Money Back",
//                         color: "text-red-600 dark:text-red-400",
//                       },
//                     ].map((item, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                       >
//                         <item.icon className={`w-5 h-5 ${item.color}`} />
//                         <span className="text-gray-700 dark:text-gray-300">
//                           {item.text}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </div>

//           {/* Right Column - Payment Form */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="lg:col-span-1"
//           >
//             <Card className="sticky top-8 border-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
//               <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
//                 <CardTitle className="flex items-center justify-between text-xl">
//                   <span>Payment Summary</span>
//                   <Lock className="w-5 h-5" />
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-6">
//                 <form onSubmit={handlePayment} className="space-y-6">
//                   {/* Personal Details */}
//                   <div className="space-y-4">
//                     <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                       <User className="w-5 h-5" />
//                       Personal Details
//                     </h3>

//                     <div className="space-y-3">
//                       <div>
//                         <Label
//                           htmlFor="name"
//                           className="text-gray-700 dark:text-gray-300 mb-1 block"
//                         >
//                           Full Name *
//                         </Label>
//                         <div className="relative">
//                           <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
//                           <Input
//                             id="name"
//                             type="text"
//                             placeholder="Enter your full name"
//                             value={formData.name}
//                             onChange={(e) =>
//                               handleInputChange("name", e.target.value)
//                             }
//                             className="pl-10 border-2 focus:border-purple-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                             required
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label
//                           htmlFor="email"
//                           className="text-gray-700 dark:text-gray-300 mb-1 block"
//                         >
//                           Email Address *
//                         </Label>
//                         <div className="relative">
//                           <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
//                           <Input
//                             id="email"
//                             type="email"
//                             placeholder="you@example.com"
//                             value={formData.email}
//                             onChange={(e) =>
//                               handleInputChange("email", e.target.value)
//                             }
//                             className="pl-10 border-2 focus:border-purple-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                             required
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label
//                           htmlFor="phone"
//                           className="text-gray-700 dark:text-gray-300 mb-1 block"
//                         >
//                           Phone Number *
//                         </Label>
//                         <div className="relative">
//                           <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
//                           <Input
//                             id="phone"
//                             type="tel"
//                             placeholder="+91 9876543210"
//                             value={formData.phone}
//                             onChange={(e) =>
//                               handleInputChange("phone", e.target.value)
//                             }
//                             className="pl-10 border-2 focus:border-purple-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                             required
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Coupon Code */}
//                   <div>
//                     <Label
//                       htmlFor="coupon"
//                       className="text-gray-700 dark:text-gray-300 mb-1 block"
//                     >
//                       Coupon Code (Optional)
//                     </Label>
//                     <div className="relative">
//                       <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
//                       <Input
//                         id="coupon"
//                         type="text"
//                         placeholder="Enter coupon code"
//                         value={formData.couponCode}
//                         onChange={(e) =>
//                           handleInputChange("couponCode", e.target.value)
//                         }
//                         className="pl-10 border-2 focus:border-purple-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                       />
//                     </div>
//                   </div>

//                   <Separator className="dark:bg-gray-700" />

//                   {/* Price Breakdown */}
//                   <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
//                     <h3 className="font-semibold text-gray-900 dark:text-white">
//                       Price Details
//                     </h3>
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-gray-600 dark:text-gray-300">
//                         <span>Course Price</span>
//                         <span className="flex items-center gap-1">
//                           <IndianRupee className="w-3 h-3" />
//                           {basePrice.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="flex justify-between text-gray-600 dark:text-gray-300">
//                         <span>GST ({gstPercentage}%)</span>
//                         <span className="flex items-center gap-1">
//                           <IndianRupee className="w-3 h-3" />
//                           {gstAmount.toFixed(2)}
//                         </span>
//                       </div>
//                       <Separator className="dark:bg-gray-700" />
//                       <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
//                         <span>Total Amount</span>
//                         <span className="text-purple-700 dark:text-purple-400 flex items-center gap-1">
//                           <IndianRupee className="w-4 h-4" />
//                           {totalPrice.toFixed(2)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Terms and Conditions */}
//                   <div className="flex items-center space-x-2">
//                     <Checkbox
//                       id="terms"
//                       checked={formData.agreeTerms}
//                       onCheckedChange={(checked) =>
//                         handleInputChange("agreeTerms", checked)
//                       }
//                       className="border-2 dark:border-gray-600"
//                     />
//                     <Label
//                       htmlFor="terms"
//                       className="text-sm text-gray-600 dark:text-gray-300 leading-none"
//                     >
//                       I agree to the{" "}
//                       <a
//                         href="/terms"
//                         className="text-purple-600 dark:text-purple-400 hover:underline"
//                       >
//                         Terms & Conditions
//                       </a>{" "}
//                       and{" "}
//                       <a
//                         href="/privacy"
//                         className="text-purple-600 dark:text-purple-400 hover:underline"
//                       >
//                         Privacy Policy
//                       </a>
//                     </Label>
//                   </div>

//                   {/* Security Badges */}
//                   <div className="flex flex-wrap gap-2 justify-center">
//                     <Badge
//                       variant="outline"
//                       className="flex items-center gap-1 dark:border-gray-600"
//                     >
//                       <ShieldCheck className="w-3 h-3" />
//                       <span>100% Secure</span>
//                     </Badge>
//                     <Badge
//                       variant="outline"
//                       className="flex items-center gap-1 dark:border-gray-600"
//                     >
//                       <CreditCard className="w-3 h-3" />
//                       <span>SSL Encrypted</span>
//                     </Badge>
//                     <Badge
//                       variant="outline"
//                       className="flex items-center gap-1 dark:border-gray-600"
//                     >
//                       <Zap className="w-3 h-3" />
//                       <span>Instant Access</span>
//                     </Badge>
//                   </div>

//                   {/* Payment Button */}
//                   <Button
//                     type="submit"
//                     disabled={isProcessing || isOrderLoading}
//                     className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
//                   >
//                     {isProcessing || isOrderLoading ? (
//                       <div className="flex items-center gap-2">
//                         <Loader2 className="w-5 h-5 animate-spin" />
//                         <span>Processing...</span>
//                       </div>
//                     ) : (
//                       <div className="flex items-center justify-center gap-3">
//                         <CreditCard className="w-5 h-5" />
//                         <span>Pay ₹{totalPrice.toFixed(2)}</span>
//                         <ArrowRight className="w-5 h-5" />
//                       </div>
//                     )}
//                   </Button>

//                   {/* Guarantee */}
//                   <p className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
//                     <BadgeCheck className="w-4 h-4 text-green-500" />
//                     30-Day Money-Back Guarantee
//                   </p>

//                   {error && (
//                     <motion.p
//                       initial={{ opacity: 0, scale: 0.9 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       className="text-red-500 text-center font-medium p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
//                     >
//                       {error}
//                     </motion.p>
//                   )}
//                 </form>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//       </div>

//       {/* Animated Background Elements */}
//       <AnimatePresence>
//         {!isProcessing && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 0.1 }}
//               className="fixed top-1/4 left-1/4 w-64 h-64 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl -z-10"
//             />
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 0.1 }}
//               className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl -z-10"
//             />
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default RegisterPaymentStudent;
