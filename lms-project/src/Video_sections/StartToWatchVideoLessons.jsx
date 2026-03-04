// src/pages/CourseDetail.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/pages/AuthContext";
import {
  useGetCourseByIdQuery,
  useEnrollCourseMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useAddReviewMutation,
  useGetUserProgressQuery,
  useUpdateProgressMutation,
  useShareCourseMutation,
  useEnrollCoursesMutation,
} from "../store/api/CourseApi";
import {
  Star,
  Clock,
  Users,
  PlayCircle,
  Download,
  Share2,
  Bookmark,
  CheckCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Lock,
  Heart,
  HeartOff,
  MessageCircle,
  Award,
  BarChart3,
  TrendingUp,
  Crown,
  Sparkles,
  Zap,
  Target,
  Eye,
  Play,
  Video,
} from "lucide-react";
import { toast } from "react-toastify";
import CoursePreviewPlayer from "./CoursePreviewPlayer";
// Rating Stars Component
const RatingStars = ({
  rating,
  size = "w-5 h-5",
  interactive = false,
  onRatingChange,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (star) => {
    if (interactive && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${
            interactive
              ? "cursor-pointer hover:scale-110 transition-transform"
              : ""
          }`}
        >
          <Star
            className={`${size} ${
              star <= (hoverRating || rating)
                ? "fill-current text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Student Stats Component
const StudentStats = ({ course }) => {
  const enrolledStudents = course.enrolledStudents?.length || 0;
  const purchasedStudents = course.purchasedBy?.length || 0;
  const wishlistedCount = course.wishlistCount || 0;
  const shareCount = course.shareCount || 0;
  const totalLikes = course.courseLikeCount || 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-blue-50 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <Users className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-blue-700">
            {enrolledStudents}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">Enrolled Students</p>
      </div>
      <div className="bg-red-50 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <Heart className="w-8 h-8 text-red-600" />
          <span className="text-2xl font-bold text-red-700">{totalLikes}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">Total Likes</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <Heart className="w-8 h-8 text-purple-600" />
          <span className="text-2xl font-bold text-purple-700">
            {wishlistedCount}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">Wishlisted</p>
      </div>

      <div className="bg-green-50 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <Crown className="w-8 h-8 text-green-600" />
          <span className="text-2xl font-bold text-green-700">
            {purchasedStudents}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">Purchased</p>
      </div>

      <div className="bg-orange-50 p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <Share2 className="w-8 h-8 text-orange-600" />
          <span className="text-2xl font-bold text-orange-700">
            {shareCount}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">Shared</p>
      </div>
    </div>
  );
};

// Main Component
const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState(0);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState({
    isOpen: false,
    video: null,
    isPreview: true,
  });
  console.log("previewPlayer", previewPlayer);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });
  const [shareOptions, setShareOptions] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  // Add this state inside the CourseDetail component

  // RTK Query hooks
  const {
    data: courseData,
    isLoading,
    isError,
    error,
    refetch: refetchCourse,
  } = useGetCourseByIdQuery(id);
  console.log("courseData", courseData);
  // Get user progress if enrolled
  const { data: progressData } = useGetUserProgressQuery(id, {
    skip: !user,
  });

  // Mutations
  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCoursesMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addReview] = useAddReviewMutation();
  const [updateProgress] = useUpdateProgressMutation();
  const [shareCourse] = useShareCourseMutation();

  const course = courseData?.course || {};
  console.log("course", course);
  // Check user status
  const isEnrolled = user && course.enrolledStudents?.includes(user._id);
  const isPurchased = user && course.purchasedBy?.includes(user._id);
  const isWishlisted = course.wishlistedByMe;
  console.log("isWishlisted", isWishlisted);
  const hasReviewed =
    user && course.ratings?.some((r) => r.user?._id === user._id);

  // Calculate progress
  const progress = progressData?.progress || 0;
  const completedLessons = progressData?.completedLessons || [];

  // Calculate stats
  const totalLessons =
    course.totalLectures ||
    course.sections?.reduce(
      (total, section) => total + (section.lectures?.length || 0),
      0,
    ) ||
    0;
  const totalDurationMinutes =
    course.totalDuration ||
    course.sections?.reduce(
      (total, section) =>
        total +
        (section.lectures?.reduce(
          (sectionTotal, lecture) => sectionTotal + (lecture.duration || 0),
          0,
        ) || 0),
      0,
    ) ||
    0;
  console.log("totalDurationMinutes", totalDurationMinutes);
  const totalDurationHours = Math.round(totalDurationMinutes / 60);

  // Calculate average rating
  const averageRating = course.ratings?.length
    ? course.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
      course.ratings.length
    : 0;

  // Enrollment handler
  const handleEnroll = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    if (course.price === 0) {
      try {
        await enrollCourse(id).unwrap();
        toast.success("Successfully enrolled in course! 🎉");
        refetchCourse();
        navigate(`/learn/${id}`);
      } catch (error) {
        toast.error(error?.data?.message || "Enrollment failed");
      }
    } else {
      setShowEnrollModal(true);
    }
  };

  // Confirm paid enrollment
  const confirmEnroll = async (course) => {
    const basePrice = course.price;
    const gstPercentage = 18;
    const totalPrice = basePrice + (basePrice * gstPercentage) / 100;
    const courseId = course._id;

    // ✅ Correct object assignment
    const data = {
      totalPrice: totalPrice,
      courseId: courseId,
    };

    try {
      // Send request to backend to create order / enroll
      const order = await enrollCourse(courseId).unwrap();

      if (order?.message) {
        toast.success("Purchase created successfully!");

        // Navigate to payment page if needed
        navigate("/registerPayment", {
          state: {
            price: totalPrice,
            courseId: courseId,
          },
        });
      }
    } catch (error) {
      toast.error("Purchase failed");
    }
  };

  // Wishlist handlers
  const handleWishlist = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(id).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(id).unwrap();
        toast.success("Added to wishlist! ❤️");
      }
      refetchCourse();
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  // Share handler
  // Share handler (STUDENT)
  const handleShare = async (platform = "copy") => {
    const shareUrl = `${window.location.origin}/courses/${id}`;
    const message = `Check out this course: ${course.title}`;

    // 🔹 1. Open share FIRST (UX priority)
    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(message + " " + shareUrl)}`,
          "_blank",
        );
        break;

      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            shareUrl,
          )}&text=${encodeURIComponent(message)}`,
          "_blank",
        );
        break;

      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl,
          )}`,
          "_blank",
        );
        break;

      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            message,
          )}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        break;

      default:
        if (navigator.share) {
          await navigator.share({
            title: course.title,
            text: message,
            url: shareUrl,
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard! 📋");
        }
    }

    // 🔹 2. Track share (NON-BLOCKING)
    shareCourse({
      courseId: id,
      platform,
    }).catch(() => {
      console.warn("Share tracking failed (ignored)");
    });

    setShareOptions(false);
  };

  // Review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }

    if (!isEnrolled) {
      toast.error("You must enroll in the course to review it");
      return;
    }

    try {
      await addReview({
        courseId: id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      }).unwrap();

      toast.success("Review submitted successfully! ⭐");
      setReviewData({ rating: 5, comment: "" });
      refetchCourse();
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  // Mark lesson as completed
  const handleCompleteLesson = async (lessonId) => {
    if (!isEnrolled) return;

    try {
      await updateProgress({
        courseId: id,
        lessonId,
        completed: true,
      }).unwrap();

      // Refresh progress
      refetchCourse();
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  // Start learning
  const handleStartLearning = () => {
    if (!isEnrolled) {
      toast.error("Please enroll in the course first");
      return;
    }

    const firstLesson = course.lessons?.[0];
    if (firstLesson) {
      navigate(`/learn/${id}?lesson=${firstLesson._id}`);
    } else {
      navigate(`/learn/${id}`);
    }
  };

  // Continue learning (from last incomplete lesson)
  const handleContinueLearning = () => {
    if (!isEnrolled) return;

    const incompleteLesson = course.lessons?.find(
      (lesson) => !completedLessons.includes(lesson._id),
    );

    if (incompleteLesson) {
      navigate(`/learn/${id}?lesson=${incompleteLesson._id}`);
    } else {
      navigate(`/learn/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-6"
          />
          <p className="text-2xl font-bold text-primary-600 animate-pulse">
            Loading Course Details...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-red-100"
        >
          <div className="text-8xl mb-6 text-red-500">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Course Not Found
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {error?.data?.message ||
              "This course may have been removed or is unavailable."}
          </p>
          <Link to="/courses">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all shadow-lg"
            >
              Browse All Courses
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enrollment Modal */}
      <AnimatePresence>
        {showEnrollModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="bg-white rounded-2xl p-10 max-w-md w-full shadow-3xl"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Complete Your Enrollment
              </h3>
              <p className="text-gray-700 mb-6 text-lg">
                You're enrolling in{" "}
                <span className="font-bold text-primary-600">
                  {course.title}
                </span>
              </p>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">Course Price:</span>
                  <span className="text-3xl font-bold text-primary-600">
                    ₹{course.price}
                  </span>
                </div>
                {course.estimatedPrice > course.price && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Original Price:</span>
                    <span className="text-xl line-through text-gray-500">
                      ₹{course.estimatedPrice}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmEnroll(course)}
                  disabled={isEnrolling}
                  className="flex-1 bg-linear-to-r from-primary-600 to-purple-600 text-white py-4 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 font-bold text-lg shadow-lg"
                >
                  {isEnrolling ? (
                    <span className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      />
                      Processing...
                    </span>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Options Modal */}
      <AnimatePresence>
        {shareOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <h4 className="text-xl font-bold mb-6 text-center">
                Share Course
              </h4>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <div className="text-3xl mb-2">💚</div>
                  <span className="text-sm">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare("telegram")}
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="text-3xl mb-2">📱</div>
                  <span className="text-sm">Telegram</span>
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex flex-col items-center p-4 bg-blue-100 rounded-xl hover:bg-blue-200 transition-colors"
                >
                  <div className="text-3xl mb-2">👥</div>
                  <span className="text-sm">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex flex-col items-center p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors"
                >
                  <div className="text-3xl mb-2">🐦</div>
                  <span className="text-sm">Twitter</span>
                </button>
              </div>
              <button
                onClick={() => handleShare("copy")}
                className="w-full py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShareOptions(false)}
                className="w-full mt-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {previewPlayer.isOpen && (
          <CoursePreviewPlayer
            course={course}
            video={previewPlayer.video}
            isEnrolled={isEnrolled}
            isPreview={previewPlayer.isPreview}
            onClose={() => setPreviewPlayer({ isOpen: false, video: null })}
          />
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-r from-primary-600 via-purple-600 to-blue-700 text-white py-12  md:py-20 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/90 hover:text-white transition-all mb-8 group"
          >
            <ArrowLeft className="mr-3 group-hover:-translate-x-1 transition-transform" />
            <span className="text-lg font-medium">Back to Courses</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold">
                  {course.category}
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold capitalize">
                  {course.level}
                </span>
                {isEnrolled && (
                  <span className="bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Enrolled
                  </span>
                )}
                {isPurchased && (
                  <span className="bg-yellow-500/90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center">
                    <Crown className="w-4 h-4 mr-2" />
                    Purchased
                  </span>
                )}
              </div>

              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                {course.title}
              </h1>

              <p className="text-xl text-white/95 mb-10 font-light max-w-3xl">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-8 mb-10">
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-yellow-400 mr-3 fill-yellow-400" />
                  <div>
                    <span className="text-2xl font-bold">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-white/80 ml-2">
                      ({course.ratings?.length || 0} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  <span className="text-lg">
                    {course.enrolledStudents?.length || 0} enrolled
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-6 h-6 mr-3" />
                  <span className="text-lg">{totalDurationHours} hours</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-6 h-6 mr-3" />
                  <span className="text-lg capitalize">
                    {course.level} level
                  </span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-4 border-t border-white/30 pt-6">
                <img
                  src={course.instructor?.parishImage || "/default-avatar.png"}
                  alt={course.instructor?.name}
                  className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
                />
                <div>
                  <p className="text-sm font-light text-white/80">Instructor</p>
                  <p className="font-bold text-xl hover:underline cursor-pointer">
                    {course.instructor?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Enrollment Card - Desktop */}
            <div className="hidden lg:block">
              <CourseSidebarCard
                course={course}
                isEnrolled={isEnrolled}
                isPurchased={isPurchased}
                isWishlisted={isWishlisted}
                progress={progress}
                handleEnroll={handleEnroll}
                handleWishlist={handleWishlist}
                handleShare={() => setShareOptions(true)}
                handleStartLearning={handleStartLearning}
                handleContinueLearning={handleContinueLearning}
                isEnrolling={isEnrolling}
                totalDurationMinutes={totalDurationMinutes}
                setPreviewPlayer={setPreviewPlayer} // ADD THIS LINE
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Mobile Enrollment Card */}
        <div className="block lg:hidden mb-12">
          <CourseSidebarCard
            course={course}
            isEnrolled={isEnrolled}
            isPurchased={isPurchased}
            isWishlisted={isWishlisted}
            progress={progress}
            handleEnroll={handleEnroll}
            handleWishlist={handleWishlist}
            handleShare={() => setShareOptions(true)}
            handleStartLearning={handleStartLearning}
            handleContinueLearning={handleContinueLearning}
            isEnrolling={isEnrolling}
            totalDurationMinutes={totalDurationMinutes}
            setPreviewPlayer={setPreviewPlayer} // ADD THIS LINE
          />
        </div>

        {/* Student Stats */}
        <StudentStats course={course} />

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-10 sticky top-4 z-10 overflow-hidden">
          <div className="flex overflow-x-auto">
            {["overview", "curriculum", "reviews", "instructor", "faq"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-max px-8 py-5 font-bold text-lg capitalize transition-all duration-300 relative group
                    ${
                      activeTab === tab
                        ? "text-primary-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {tab}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: activeTab === tab ? 1 : 0 }}
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-purple-600"
                  />
                </button>
              ),
            )}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="pt-4"
          >
            {activeTab === "overview" && (
              <div className="space-y-10">
                {/* What You'll Learn */}
                {course.benefits?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-10 shadow-xl border border-blue-100"
                  >
                    <h3 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
                      <Sparkles className="w-8 h-8 text-yellow-500 mr-4" />
                      What You'll Learn
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {course.benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                          <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                          <span className="text-gray-800 text-lg">
                            {benefit.title}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Course Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Requirements */}
                  {course.prerequisites?.length > 0 && (
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                      <h4 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                        <Zap className="w-7 h-7 text-orange-500 mr-3" />
                        Requirements
                      </h4>
                      <ul className="space-y-3">
                        {course.prerequisites.map((prereq, index) => (
                          <li
                            key={index}
                            className="flex items-center text-gray-700"
                          >
                            <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                            {prereq.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Course Stats */}
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                    <h4 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                      <BarChart3 className="w-7 h-7 text-primary-600 mr-3" />
                      Course Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary-600 mb-2">
                          {course.videoSections?.length || 0}
                        </div>
                        <div className="text-gray-600">Sections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary-600 mb-2">
                          {totalLessons}
                        </div>
                        <div className="text-gray-600">Lessons</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary-600 mb-2">
                          {totalDurationHours}
                        </div>
                        <div className="text-gray-600">Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary-600 mb-2">
                          {course.enrolledStudents?.length || 0}
                        </div>
                        <div className="text-gray-600">Enrolled</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">
                        Course Curriculum
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {course.totalLectures || 0} lectures •{" "}
                        {totalDurationHours} total hours
                      </p>
                    </div>
                    {isEnrolled && (
                      <div className="bg-primary-50 px-6 py-3 rounded-xl">
                        <span className="text-primary-700 font-bold">
                          Progress: {progress.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {course.sections?.map((section, sectionIndex) => {
                    const sectionDuration =
                      section.lectures?.reduce(
                        (acc, lecture) => acc + (lecture.duration || 0),
                        0,
                      ) || 0;
                    const sectionCompleted =
                      section.lectures?.filter((lecture) =>
                        completedLessons.includes(lecture._id),
                      ).length || 0;
                    const sectionProgress =
                      section.lectures?.length > 0
                        ? (sectionCompleted / section.lectures.length) * 100
                        : 0;

                    return (
                      <div key={section._id || sectionIndex}>
                        <button
                          onClick={() =>
                            setExpandedSection(
                              expandedSection === sectionIndex
                                ? -1
                                : sectionIndex,
                            )
                          }
                          className="flex items-center justify-between w-full text-left p-8 hover:bg-gray-50 transition-all"
                        >
                          <div className="flex-1 pr-6">
                            <div className="flex items-center gap-4 mb-2">
                              <h4 className="font-extrabold text-xl text-gray-900">
                                {/* intruduction */}
                                {section.title}
                              </h4>
                              {isEnrolled && (
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                                  {sectionProgress.toFixed(0)}% Complete
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <span>
                                {section.lectures?.length || 0} lectures
                              </span>
                              <span className="mx-3">•</span>
                              <span>
                                {Math.round(sectionDuration / 60)} minutes
                              </span>
                              {section.description && (
                                <>
                                  <span className="mx-3">•</span>
                                  <span className="text-gray-500">
                                    {section.description}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="p-3 border border-gray-300 rounded-full text-primary-600 hover:bg-primary-50 transition-colors">
                            {expandedSection === sectionIndex ? (
                              <ChevronUp className="w-6 h-6" />
                            ) : (
                              <ChevronDown className="w-6 h-6" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedSection === sectionIndex && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="pb-6 pt-2 px-8"
                            >
                              <div className="space-y-3 border-l-2 border-primary-100 pl-6">
                                {section.lectures?.map(
                                  (lecture, lectureIndex) => {
                                    const isCompleted =
                                      completedLessons.includes(lecture._id);
                                    const isVideo = lecture.type === "video";

                                    return (
                                      <motion.div
                                        key={lecture._id || lectureIndex}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          delay: lectureIndex * 0.05,
                                        }}
                                        onClick={() => {
                                          if (!isVideo) return; // Only handle video lectures

                                          if (isEnrolled) {
                                            setSelectedLesson(lecture);
                                            navigate(
                                              `/learn/${course._id}?lesson=${lecture._id}`,
                                            );
                                          } else if (lecture.isPreview) {
                                            // Show preview for non-enrolled users
                                            setPreviewPlayer({
                                              isOpen: true,
                                              video: {
                                                ...lecture,
                                                videoUrl: lecture.contentUrl,
                                                title: lecture.title,
                                                duration: lecture.duration,
                                              },
                                              isPreview: true,
                                            });
                                          } else {
                                            toast.info(
                                              "Enroll in the course to access this lecture",
                                            );
                                          }
                                        }}
                                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                                          isVideo
                                            ? "cursor-pointer"
                                            : "cursor-default"
                                        } ${
                                          isEnrolled && isVideo
                                            ? "hover:bg-primary-50 hover:shadow-md"
                                            : !isEnrolled &&
                                                lecture.isPreview &&
                                                isVideo
                                              ? "hover:bg-yellow-50 cursor-pointer opacity-100"
                                              : isVideo
                                                ? "opacity-70"
                                                : ""
                                        } ${
                                          isCompleted
                                            ? "bg-green-50 border border-green-200"
                                            : "bg-white"
                                        }`}
                                      >
                                        <div className="flex items-center flex-1">
                                          {isVideo ? (
                                            isEnrolled ? (
                                              <PlayCircle className="w-6 h-6 text-primary-600 mr-4 flex-shrink-0" />
                                            ) : lecture.isPreview ? (
                                              <PlayCircle className="w-6 h-6 text-yellow-500 mr-4 flex-shrink-0" />
                                            ) : (
                                              <Lock className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                                            )
                                          ) : (
                                            <File className="w-5 h-5 text-gray-600 mr-4 flex-shrink-0" />
                                          )}
                                          <div className="flex-1">
                                            <span
                                              className={`font-medium ${
                                                isEnrolled
                                                  ? "text-gray-800"
                                                  : "text-gray-600"
                                              }`}
                                            >
                                              {lecture.title}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                              {lecture.isPreview && isVideo && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                  Preview
                                                </span>
                                              )}
                                              {isCompleted && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                                                  Completed
                                                </span>
                                              )}
                                              {lecture.type && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                                                  {lecture.type}
                                                </span>
                                              )}
                                              <span className="text-sm text-gray-500">
                                                {lecture.duration || 0} min
                                              </span>
                                            </div>
                                            {lecture.status === "draft" && (
                                              <span className="text-xs text-orange-600 mt-1 inline-block">
                                                Draft
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4 ml-4">
                                          {isVideo &&
                                            isEnrolled &&
                                            !isCompleted && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleCompleteLesson(
                                                    lecture._id,
                                                  );
                                                }}
                                                className="px-4 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                                              >
                                                Mark Complete
                                              </button>
                                            )}
                                          {isVideo &&
                                            !isEnrolled &&
                                            lecture.isPreview && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setPreviewPlayer({
                                                    isOpen: true,
                                                    video: {
                                                      ...lecture,
                                                      videoUrl:
                                                        lecture.contentUrl,
                                                      title: lecture.title,
                                                      duration:
                                                        lecture.duration,
                                                    },
                                                    isPreview: true,
                                                  });
                                                }}
                                                className="px-4 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600"
                                              >
                                                Preview
                                              </button>
                                            )}
                                          {isVideo && isEnrolled && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(
                                                  `/learn/${course._id}?lesson=${lecture._id}`,
                                                );
                                              }}
                                              className="px-4 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                                            >
                                              Watch
                                            </button>
                                          )}
                                        </div>
                                      </motion.div>
                                    );
                                  },
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-10">
                {/* Add Review Form */}
                {isEnrolled && !hasReviewed && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-10 shadow-xl border border-gray-200"
                  >
                    <h3 className="text-3xl font-bold mb-6 text-gray-900 flex items-center">
                      <MessageCircle className="w-8 h-8 text-primary-600 mr-4" />
                      Share Your Experience
                    </h3>
                    <form onSubmit={handleSubmitReview}>
                      <div className="mb-6">
                        <label className="block text-gray-700 mb-3 font-medium">
                          Your Rating
                        </label>
                        <RatingStars
                          rating={reviewData.rating}
                          interactive={true}
                          onRatingChange={(rating) =>
                            setReviewData((prev) => ({ ...prev, rating }))
                          }
                          size="w-8 h-8"
                        />
                      </div>
                      <div className="mb-8">
                        <textarea
                          value={reviewData.comment}
                          onChange={(e) =>
                            setReviewData((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          placeholder="Share your thoughts about this course..."
                          className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-10 py-3 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Reviews Summary */}
                <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-8 border-b border-gray-200">
                    <div>
                      <h3 className="text-3xl font-bold mb-4">
                        Student Reviews ({course.ratings?.length || 0})
                      </h3>
                      <div className="flex items-center">
                        <span className="text-5xl font-black mr-4 text-gray-900">
                          {averageRating.toFixed(1)}
                        </span>
                        <div>
                          <RatingStars rating={averageRating} size="w-6 h-6" />
                          <p className="text-gray-600 mt-2">Overall Rating</p>
                        </div>
                      </div>
                    </div>
                    {hasReviewed && (
                      <div className="mt-6 md:mt-0">
                        <div className="bg-green-50 border border-green-200 px-6 py-3 rounded-xl">
                          <span className="text-green-700 font-bold flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            You've already reviewed this course
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-8">
                    {course.ratings?.map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 pb-8 last:border-b-0"
                      >
                        <div className="flex items-start mb-4">
                          <img
                            src={review.user?.avatar || "/default-avatar.png"}
                            alt={review.user?.name}
                            className="w-14 h-14 rounded-full object-cover mr-5 border-2 border-primary-100"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-gray-900 text-lg">
                                  {review.user?.name || "Anonymous User"}
                                </p>
                                {review.user?._id === user?._id && (
                                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                                    Your Review
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <RatingStars
                                  rating={review.rating}
                                  size="w-5 h-5"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed mt-4">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {!course.ratings?.length && (
                      <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <div className="text-6xl mb-6">💬</div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-4">
                          No Reviews Yet
                        </h4>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Be the first to share your experience with this
                          course!
                        </p>
                        {!isEnrolled && (
                          <button
                            onClick={handleEnroll}
                            className="mt-6 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700"
                          >
                            Enroll to Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "instructor" && course.instructor && (
              <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-200">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
                  <div className="text-center lg:text-left">
                    <img
                      src={
                        course.instructor.parishImage || "/default-avatar.png"
                      }
                      alt={course.instructor.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary-100 shadow-xl mb-6"
                    />
                    <div className="flex justify-center lg:justify-start gap-4 mb-6">
                      <button className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                        Follow
                      </button>
                      <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                        Message
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-4xl font-bold text-primary-600 mb-2">
                      {course.instructor.name}
                    </h3>
                    <p className="text-gray-600 text-xl font-medium mb-8">
                      {course.instructor.title || "Expert Instructor"}
                    </p>

                    <p className="text-gray-700 mb-10 leading-relaxed text-lg">
                      {course.instructor.bio ||
                        "Passionate educator with years of experience in the field..."}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600 mb-2">
                          {course.instructor.coursesCount || 0}
                        </div>
                        <div className="text-gray-600">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600 mb-2">
                          {course.instructor.studentsCount || 0}
                        </div>
                        <div className="text-gray-600">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600 mb-2">
                          {course.instructor.reviewsCount || 0}
                        </div>
                        <div className="text-gray-600">Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600 mb-2">
                          {course.instructor.rating?.toFixed(1) || "4.8"}
                        </div>
                        <RatingStars
                          rating={course.instructor.rating || 4.8}
                          size="w-4 h-4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};

// Enhanced Sidebar Card Component
const CourseSidebarCard = ({
  course,
  isEnrolled,
  isPurchased,
  isWishlisted,
  progress,
  handleEnroll,
  handleWishlist,
  handleShare,
  handleStartLearning,
  handleContinueLearning,
  isEnrolling,
  totalDurationMinutes,
  setPreviewPlayer,
}) => {
  const navigate = useNavigate(); // Add this hook
  const durationDisplay =
    totalDurationMinutes > 60
      ? `${(totalDurationMinutes / 60).toFixed(1)} hours`
      : `${totalDurationMinutes} minutes`;

  const handlePreviewClick = () => {
    console.log("Preview clicked");
    console.log("Course sections:", course.sections);
    console.log("Promo video:", course.promoVideo);

    let previewVideo = null;

    // Find first lecture with isPreview true and contentUrl
    if (course.sections?.length > 0) {
      for (const section of course.sections) {
        console.log("Section:", section.title);
        if (section.lectures?.length > 0) {
          console.log("Lectures in section:", section.lectures);
          const previewLecture = section.lectures.find(
            (lecture) =>
              lecture.isPreview &&
              lecture.contentUrl &&
              lecture.type === "video",
          );
          console.log("Found preview lecture:", previewLecture);
          if (previewLecture) {
            previewVideo = {
              ...previewLecture,
              videoUrl: previewLecture.contentUrl,
              title: previewLecture.title,
              duration: previewLecture.duration,
            };
            break;
          }
        }
      }
    }

    // If no preview lecture found, use promo video
    if (!previewVideo && course.promoVideo) {
      console.log("Using promo video:", course.promoVideo);
      previewVideo = {
        videoUrl: course.promoVideo,
        title: "Course Promo",
        duration: 2,
      };
    }

    console.log("Final preview video:", previewVideo);

    if (!previewVideo) {
      toast.info("No preview available for this course");
      return;
    }

    setPreviewPlayer({
      isOpen: true,
      video: previewVideo,
      isPreview: true,
    });
    console.log("Preview player state set:", previewVideo);
  };
  console.log("course", course);
  // Handle preview button click
  const handlePreviewButtonClick = () => {
    if (isEnrolled) {
      // If enrolled, navigate to learning page with first lesson
      // const firstLesson =
      //   course.lessons?.[0] || course.videoSections?.[0]?.videos?.[0];
      const firstLesson =
        course.videoSections?.flatMap((s) => s.videos || [])?.[0] ||
        course.lessons?.[0];

      if (firstLesson) {
        navigate(`/learn/${course._id}?lesson=${firstLesson._id}`);
      } else {
        navigate(`/learn/${course._id}`);
      }
    } else {
      // If not enrolled, show preview
      handlePreviewClick();
    }
  };

  // Handle start/continue learning
  const handleLearningClick = () => {
    if (progress >= 100) {
      handleStartLearning();
    } else {
      handleContinueLearning();
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl p-8 text-gray-900 shadow-2xl border border-gray-100/80 sticky top-24 backdrop-blur-sm bg-white/95"
    >
      {/* Course Preview with Play Button */}
      <div className="relative mb-8 group">
        <img
          src={course.thumbnail || "/default-course.jpg"}
          alt={course.title}
          className="w-full h-60 object-cover rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
        />

        {/* Preview Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handlePreviewButtonClick} // Fixed: Use the new function
            className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-2xl transform hover:scale-105 transition-transform"
          >
            <PlayCircle className="w-6 h-6" />
            {isEnrolled ? "Continue Learning" : "Preview this course"}
          </button>
        </div>

        {/* Preview Badge */}
        {!isEnrolled && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Free Preview Available
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="mb-8">
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-4xl font-black text-primary-600">
              {course.price === 0 ? "Free" : `₹${course.price}`}
            </span>
            {course.estimatedPrice > course.price && (
              <span className="block text-lg text-gray-500 line-through mt-1">
                ₹{course.estimatedPrice}
              </span>
            )}
          </div>
          {isPurchased && (
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
              Purchased
            </span>
          )}
        </div>
        {course.price > 0 && (
          <p className="text-sm text-green-600 font-medium flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            30-day money-back guarantee
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {isEnrolled ? (
          <>
            {/* Progress Section */}
            <div className="bg-gradient-to-r from-blue-50 to-primary-50 p-5 rounded-xl border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800">Your Progress</span>
                <span className="text-2xl font-black text-primary-600">
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5 }}
                  className="bg-gradient-to-r from-primary-600 to-blue-600 h-3 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {Math.round((progress / 100) * course.lessons?.length || 0)} of{" "}
                {course.lessons?.length || 0} lessons completed
              </p>
            </div>

            {/* Continue Learning Button */}
            <motion.button
              whileHover={{
                y: -2,
                boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLearningClick}
              className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all shadow-lg"
            >
              {progress >= 100 ? "Review Course" : "Continue Learning"}
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{
                y: -2,
                boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 shadow-lg"
            >
              {isEnrolling ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                  />
                  Processing...
                </span>
              ) : course.price === 0 ? (
                "Enroll for Free"
              ) : (
                "Enroll Now"
              )}
            </motion.button>

            {/* Preview Button for non-enrolled users */}
            <button
              onClick={handlePreviewClick}
              className="w-full border-2 border-primary-600 text-primary-600 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Free Preview
            </button>
          </>
        )}

        {/* Secondary Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWishlist}
            className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm transition-all ${
              isWishlisted
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isWishlisted ? (
              <>
                <HeartOff className="w-5 h-5" />
                Remove
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Wishlist
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
          >
            <Share2 className="w-5 h-5" />
            Share
          </motion.button>
        </div>

        {/* Course Features */}
        <div className="pt-6 border-t border-gray-100">
          <h4 className="font-bold text-gray-900 mb-4">
            This course includes:
          </h4>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <PlayCircle className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" />
              <span>{durationDisplay} of on-demand video</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Download className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" />
              <span>Downloadable resources</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Award className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" />
              <span>Certificate of completion</span>
            </div>
            {!isEnrolled && (
              <div className="flex items-center text-yellow-600 font-bold">
                <Eye className="w-5 h-5 mr-3" />
                <span>Free preview videos</span>
              </div>
            )}
            {course.price === 0 && (
              <div className="flex items-center text-green-600 font-bold">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Free forever access</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetail;
