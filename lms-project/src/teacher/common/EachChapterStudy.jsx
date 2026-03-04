// EachChapterStudy.js
import React, { useMemo, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Image as ImageIcon,
  Brain,
  Zap,
  AlertCircle,
  Award,
  ZoomIn,
  Moon,
  Sun,
  Share2,
  Bookmark,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "katex/dist/katex.min.css";
import { useAuth } from "../../common/AuthContext";

// RTK APIs
import {
  useGetLessonByIdQuery,
  useUpdateProgressMutation,
  useUpdateEngagementMutation,
} from "../../store/api/MathsLessonApi";
import { useTrackTimeSpentProgressMutation } from "../../store/api/ProgressApi";

import EnhancedVideoPlayer from "./videoPlayer/EnhancedVideoPlayer";

// --- Utilities ---
const decodeHTMLEntities = (text) => {
  if (!text) return "";
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
    "&rsquo;": "'",
  };
  return text.replace(
    /&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;|&rsquo;/g,
    (m) => entities[m] || m,
  );
};

// Confidence Score Calculator
const calculateConfidenceScore = (engagement) => {
  const {
    scrollDepth,
    timeSpent,
    expectedTime = 300,
    interactions,
  } = engagement;

  // 1. Scroll completion weight (40%)
  const scrollScore = (scrollDepth / 100) * 0.4;

  // 2. Time engagement weight (30%)
  const timeRatio = Math.min(timeSpent / expectedTime, 1.5);
  const timeScore = Math.min(timeRatio, 1) * 0.3;

  // 3. Interaction density weight (30%)
  const totalInteractions =
    (interactions?.clicks || 0) +
    (interactions?.highlights || 0) * 3 +
    (interactions?.notes || 0) * 5;
  const interactionScore = Math.min(totalInteractions / 20, 1) * 0.3;

  return Math.min(scrollScore + timeScore + interactionScore, 1.0);
};

const getConfidenceLevel = (score) => {
  if (score >= 0.8)
    return {
      label: "Expert",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
    };
  if (score >= 0.5)
    return {
      label: "Steady",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    };
  return {
    label: "Surface",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/30",
  };
};

// --- Main Lesson Component ---
const EachChapterStudy = () => {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  // Get data
  const { user } = useAuth();

  // RTK Queries
  const {
    data: lessonData,
    isLoading,
    error,
    refetch,
  } = useGetLessonByIdQuery(lessonId);

  const medias = lessonData?.media || [];
  const videoId = medias?.[0]?._id;
  const chapterId = lessonData?.lesson?.chapterId;
  const subjectId = lessonData?.subjectId;
  const currentSubject = lessonData;

  // Scroll Progress Logic
  const { scrollYProgress } = useScroll({ container: contentRef });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Time tracking
  const startTimeRef = useRef(null);
  const hasTrackedRef = useRef(false);
  const [trackTimeSpent] = useTrackTimeSpentProgressMutation();

  useEffect(() => {
    if (!lessonId) return;
    startTimeRef.current = Date.now();
    hasTrackedRef.current = false;

    return () => {
      if (!startTimeRef.current || hasTrackedRef.current) return;
      const endTime = Date.now();
      const timeSpentInSeconds = Math.floor(
        (endTime - startTimeRef.current) / 1000,
      );
      hasTrackedRef.current = true;

      if (timeSpentInSeconds > 0) {
        trackTimeSpent({
          subjectId,
          chapterId,
          pageId: lessonId,
          timeSpent: timeSpentInSeconds,
          startTime: startTimeRef.current,
          endTime: endTime,
        });
      }
    };
  }, [lessonId, lessonData]);

  const [updateProgress] = useUpdateProgressMutation();
  const [updateEngagement] = useUpdateEngagementMutation();

  // State
  const [isMarkedCompleted, setIsMarkedCompleted] = useState(false);
  const [completionType, setCompletionType] = useState(null);
  const [showEngagementStats, setShowEngagementStats] = useState(false);

  // Theme Toggle
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // ✅ FIX: Markdown Components INSIDE component (so lessonData is available)
  const MarkdownComponents = useMemo(
    () => ({
      // ✅ IMAGES RENDER INSIDE CONTENT
      img: ({ src, alt, ...props }) => {
        const [isZoomed, setIsZoomed] = useState(false);
        const [imageError, setImageError] = useState(false);

        // Get media array from lessonData
        const mediaArray = lessonData?.media || [];
        const normalizedMediaArray = Array.isArray(mediaArray)
          ? mediaArray
          : [mediaArray];

        const matchingMedia = normalizedMediaArray.find((item) => {
          const srcFileName = src.split("/").pop() || src;
          return item.url?.includes(srcFileName) || item.url?.includes(src);
        });
        // Construct proper image URL
        let imageUrl = src;

        if (matchingMedia) {
          // Use the actual URL from media array
          imageUrl = matchingMedia.url;
        } else if (!src?.startsWith("http")) {
          // Try to construct URL from API
          imageUrl = `${import.meta.env.VITE_BACKEND_URL || ""}/uploads/${src}`;
        }

        if (imageError) {
          return (
            <div className="my-8 p-8 bg-slate-100 dark:bg-slate-800 rounded-3xl text-center border border-slate-200 dark:border-slate-700">
              <ImageIcon
                className="mx-auto text-slate-400 dark:text-slate-500 mb-2"
                size={32}
              />
              <p className="text-slate-500 dark:text-slate-400">
                Image could not be loaded
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Filename: {src}
              </p>

              {/* Show available images as fallback */}
              {mediaArray.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Available images:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {mediaArray.map((media, idx) => (
                      <button
                        key={idx}
                        onClick={() => window.open(media.url, "_blank")}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800/30"
                      >
                        Image {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <motion.figure
            whileHover={{ scale: 1.01 }}
            className="my-10 overflow-hidden rounded-3xl border-4 border-white dark:border-slate-800 shadow-2xl"
          >
            <div
              className="relative group cursor-pointer"
              onClick={() => setIsZoomed(true)}
            >
              <img
                src={imageUrl}
                alt={alt || "Lesson image"}
                className="w-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
                {...props}
              />
              <div className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <ZoomIn size={20} />
              </div>
            </div>
            {alt && alt !== "Image Description" && (
              <figcaption className="p-4 bg-white dark:bg-slate-800 text-center text-sm font-bold text-slate-500 dark:text-slate-400 border-t dark:border-slate-700">
                {alt}
              </figcaption>
            )}

            {/* Image Zoom Modal */}
            <AnimatePresence>
              {isZoomed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                  onClick={() => setIsZoomed(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="relative max-w-5xl max-h-[90vh]"
                  >
                    <img
                      src={imageUrl}
                      alt={alt}
                      className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    />
                    <button
                      onClick={() => setIsZoomed(false)}
                      className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.figure>
        );
      },

      // Headings - Modern Typography
      h1: ({ children }) => (
        <h1 className="text-4xl md:text-6xl font-black mb-8 dark:text-white leading-tight">
          {children}
          <span className="text-blue-600">.</span>
        </h1>
      ),

      h2: ({ children }) => (
        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6 dark:text-slate-100 flex items-center gap-3">
          <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block" />
          {children}
        </h2>
      ),

      h3: ({ children }) => (
        <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3 dark:text-slate-200">
          {children}
        </h3>
      ),

      // Paragraph - Don't wrap images in p tags
      p: ({ children }) => {
        // Check if paragraph contains only an image
        const hasOnlyImage = React.Children.toArray(children).every(
          (child) =>
            child?.type === "img" ||
            child?.props?.src ||
            child?.type === "figure",
        );

        if (hasOnlyImage) {
          return <>{children}</>;
        }

        return (
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">
            {children}
          </p>
        );
      },

      // Lists
      ul: ({ children }) => (
        <ul className="space-y-3 mb-6 ml-4 list-none">{children}</ul>
      ),

      ol: ({ children }) => (
        <ol className="space-y-3 mb-6 ml-4 list-decimal marker:text-blue-500 dark:marker:text-blue-400">
          {children}
        </ol>
      ),

      li: ({ children }) => (
        <li className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-lg">
          <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          <span className="flex-1">{children}</span>
        </li>
      ),

      // Blockquotes with animation
      blockquote: ({ children }) => (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="border-l-4 border-blue-500 bg-blue-50/80 dark:bg-blue-950/30 backdrop-blur-sm p-6 rounded-r-2xl my-8 italic text-slate-700 dark:text-slate-300 shadow-sm"
        >
          {children}
        </motion.div>
      ),

      // Code blocks with syntax highlighting and theme support
      code: ({ inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");

        if (!inline && match) {
          return (
            <div className="my-8 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                {match[1]}
              </div>
              <SyntaxHighlighter
                style={isDarkMode ? vscDarkPlus : oneLight}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  padding: "2rem",
                  fontSize: "1rem",
                  margin: 0,
                  background: isDarkMode ? "#1e1e1e" : "#fafafa",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          );
        }

        return (
          <code className="bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md font-bold">
            {children}
          </code>
        );
      },

      // Tables
      table: ({ children }) => (
        <div className="overflow-x-auto my-8">
          <table className="min-w-full border-collapse border border-slate-200 dark:border-slate-700">
            {children}
          </table>
        </div>
      ),

      th: ({ children }) => (
        <th className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-left font-semibold dark:text-white">
          {children}
        </th>
      ),

      td: ({ children }) => (
        <td className="border border-slate-200 dark:border-slate-700 px-4 py-2 dark:text-slate-300">
          {children}
        </td>
      ),

      // Horizontal rule
      hr: () => (
        <hr className="my-8 border-t-2 border-slate-200 dark:border-slate-700" />
      ),

      // Links
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          {children}
        </a>
      ),
    }),
    [lessonData, isDarkMode], // ✅ Recreate when lessonData or theme changes
  );

  // Engagement Tracker Hook
  const engagement = useEngagementTracker(contentRef, lessonId);

  // Calculate confidence score
  const confidenceScore = useMemo(() => {
    return calculateConfidenceScore({
      scrollDepth: engagement.scrollDepth,
      timeSpent: engagement.activeTime,
      expectedTime: 300,
      interactions: engagement.interactions,
    });
  }, [engagement]);

  const confidenceLevel = getConfidenceLevel(confidenceScore);

  // Check existing progress
  useEffect(() => {
    if (user && lessonId) {
      const progressKey = `progress_${user._id}_${lessonId}`;
      const savedProgress = JSON.parse(localStorage.getItem(progressKey));
      if (savedProgress) {
        setIsMarkedCompleted(savedProgress.completed);
        setCompletionType(savedProgress.completionType);
      }
    }
  }, [user, lessonId]);

  // Auto-completion logic
  useEffect(() => {
    if (isMarkedCompleted || !user) return;

    const shouldAutoComplete =
      engagement.scrollDepth >= 85 &&
      engagement.activeTime >= 120 &&
      confidenceScore >= 0.6;

    if (shouldAutoComplete) {
      handleAutoComplete();
    }
  }, [engagement, confidenceScore, user, isMarkedCompleted]);

  // Auto Completion Handler
  const handleAutoComplete = async () => {
    if (!user || isMarkedCompleted) return;

    const progressData = {
      userId: user._id,
      subjectId,
      chapterId,
      pageId: lessonId,
      completed: true,
      completionType: "auto",
      engagement: {
        scrollDepth: engagement.scrollDepth,
        timeSpent: engagement.activeTime,
        interactions: engagement.interactions,
        activeTime: engagement.activeTime,
      },
      quality: {
        confidenceScore,
        attentionScore: calculateAttentionScore(engagement.scrollPattern),
        comprehensionFlag: "medium",
        autoCompleted: true,
      },
      completedAt: new Date().toISOString(),
    };

    try {
      await updateProgress(progressData).unwrap();

      const progressKey = `progress_${user._id}_${lessonId}`;
      localStorage.setItem(
        progressKey,
        JSON.stringify({
          completed: true,
          completionType: "auto",
          completedAt: new Date().toISOString(),
        }),
      );

      setIsMarkedCompleted(true);
      setCompletionType("auto");

      toast.success(
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500" size={20} />
          <span>
            Engagement Milestone Reached! ✨ (
            {(confidenceScore * 100).toFixed(0)}%)
          </span>
        </div>,
        { duration: 3000 },
      );
    } catch (err) {
      console.log("Auto-complete failed:", err);
    }
  };

  // Manual Complete Handler
  const handleManualComplete = async () => {
    if (!user || isMarkedCompleted) return;

    const progressData = {
      userId: user._id,
      subjectId,
      chapterId,
      pageId: lessonId,
      completed: true,
      completionType: "manual",
      engagement: {
        scrollDepth: engagement.scrollDepth,
        timeSpent: engagement.activeTime,
        interactions: engagement.interactions,
        activeTime: engagement.activeTime,
      },
      completedAt: new Date().toISOString(),
    };

    try {
      await updateProgress(progressData).unwrap();

      const progressKey = `progress_${user._id}_${lessonId}`;
      localStorage.setItem(
        progressKey,
        JSON.stringify({
          completed: true,
          completionType: "manual",
          completedAt: new Date().toISOString(),
        }),
      );

      setIsMarkedCompleted(true);
      setCompletionType("manual");

      toast.success("Lesson Completed! 🎉", { duration: 3000 });
    } catch (err) {
      console.log("Manual complete failed:", err);
      toast.error("Failed to mark as complete");
    }
  };

  // Calculate attention score based on scroll pattern
  const calculateAttentionScore = (scrollPattern) => {
    if (scrollPattern.length < 3) return 0.5;
    return 0.7; // Simplified for demo
  };

  // ✅ PROCESS CONTENT - IMAGES ARE PRESERVED, NOT REMOVED
  const processedContent = useMemo(() => {
    if (!lessonData?.lesson?.content) return "";
    let content = decodeHTMLEntities(lessonData.lesson.content);

    // Fix math equations
    content = content.replace(/\\\\/g, "\\");

    return content.trim();
  }, [lessonData]);

  // Loading and Error states
  if (isLoading) return <LoadingPulse />;
  if (error) return <ErrorUI onRetry={refetch} />;

  const lesson = lessonData?.lesson;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Main Container */}
      <div
        ref={contentRef}
        onScroll={(e) => {
          const depth = Math.round(
            ((e.target.scrollTop + e.target.clientHeight) /
              e.target.scrollHeight) *
              100,
          );
          setEngagement((prev) => ({
            ...prev,
            scrollDepth: Math.max(prev.scrollDepth, depth),
          }));
        }}
        className="flex-1 overflow-y-auto pt-28 pb-20 px-4 scroll-smooth"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header Bento Box - Modern Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative p-8 bg-indigo-600 rounded-[2rem] text-white flex flex-col justify-between min-h-[220px] shadow-xl">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Top Right Icon */}
              <div className="absolute top-6 right-6 opacity-20">
                <BarChart3 size={28} />
              </div>

              {/* Main Content */}
              <div className="mt-10">
                <p className="text-indigo-200 text-sm font-semibold tracking-wide">
                  Focus Score
                </p>

                <p className="text-4xl font-extrabold mt-2">
                  {(confidenceScore * 100).toFixed(0)}%
                </p>

                <p className="text-indigo-100 text-sm mt-1">
                  {confidenceLevel.label} Level
                </p>
              </div>
            </div>
            <div className="md:col-span-2 p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-500 font-black text-sm mb-4 uppercase tracking-tighter">
                <Brain size={16} />
                <span>Personalized Learning Path</span>
              </div>
              <h1 className="text-3xl font-black dark:text-white">
                {lesson?.title || "Loading..."}
              </h1>
              {lesson?.description && (
                <p className="mt-3 text-slate-600 dark:text-slate-400">
                  {lesson.description}
                </p>
              )}
            </div>
          </div>

          {/* Video Section */}
          {currentSubject?.media?.url && (
            <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-3xl border-8 border-white dark:border-slate-900">
              <EnhancedVideoPlayer
                media={medias}
                pageId={lessonId}
                course={currentSubject}
                video={"previewPlayer.video"}
                isEnrolled={"isEnrolled"}
                isPreview={"previewPlayer.isPreview"}
              />
            </div>
          )}

          {/* Main Content Card */}
          <article className="prose dark:prose-invert max-w-none mb-12">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={MarkdownComponents}
            >
              {processedContent}
            </ReactMarkdown>
          </article>

          {/* Engagement Stats Panel (Optional) */}
          <AnimatePresence>
            {showEngagementStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800"
              >
                <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                  <BarChart3 size={20} className="text-indigo-500" />
                  Engagement Analytics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Scroll Depth</p>
                    <p className="text-2xl font-bold dark:text-white">
                      {engagement.scrollDepth}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Time Active</p>
                    <p className="text-2xl font-bold dark:text-white">
                      {Math.floor(engagement.activeTime / 60)}m{" "}
                      {engagement.activeTime % 60}s
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Interactions</p>
                    <p className="text-2xl font-bold dark:text-white">
                      {engagement.interactions.clicks}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion UI */}
          <AnimatePresence mode="wait">
            {isMarkedCompleted ? (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-8 p-10 bg-emerald-500 rounded-[3rem] text-white text-center shadow-2xl shadow-emerald-500/20"
              >
                <Trophy size={60} className="mx-auto mb-6" />
                <h2 className="text-3xl font-black mb-2">
                  Knowledge Locked In!
                </h2>
                <p className="font-bold mb-8 opacity-90">
                  {completionType === "auto"
                    ? "Great engagement! The system auto-completed this lesson."
                    : "You've mastered this lesson!"}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => navigate(`/chapter/${chapterId}/quiz`)}
                    className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black text-lg hover:shadow-xl transition-all"
                  >
                    Start Mastery Quiz
                  </button>
                  <button
                    onClick={() => navigate(`/chapter/${chapterId}/dashboard`)}
                    className="px-8 py-4 bg-emerald-600 border-2 border-emerald-400 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all"
                  >
                    Chapter Dashboard
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="incomplete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-12 flex justify-center"
              >
                <button
                  onClick={handleManualComplete}
                  className="group relative px-12 py-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-full font-black text-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10">Mark as Read</span>
                  <motion.div
                    className="absolute inset-0 bg-indigo-500"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Learning Tip - Only show if not completed and low engagement */}
          {!isMarkedCompleted && confidenceScore < 0.5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-3xl"
            >
              <div className="flex items-center gap-3">
                <AlertCircle
                  className="text-amber-600 dark:text-amber-400"
                  size={24}
                />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                    Learning Tip
                  </h4>
                  <p className="text-amber-700 dark:text-amber-400 text-sm">
                    Spend more time reading and interacting with content for
                    better understanding.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tab Bar Mobile (2026 Trend) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t dark:border-slate-800 flex justify-around items-center">
        <button className="p-3 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
          <Brain size={20} />
        </button>
        <button className="p-3 text-slate-400">
          <MessageSquare size={20} />
        </button>
        <button className="p-3 text-slate-400">
          <Bookmark size={20} />
        </button>
        <button
          onClick={() => setShowEngagementStats(!showEngagementStats)}
          className="p-3 text-slate-400"
        >
          <BarChart3 size={20} />
        </button>
      </div>
    </div>
  );
};

// --- Engagement Tracker Hook (defined outside) ---
const useEngagementTracker = (contentRef, lessonId) => {
  const [engagement, setEngagement] = useState({
    scrollDepth: 0,
    timeSpent: 0,
    interactions: { clicks: 0, highlights: 0, notes: 0, replays: 0 },
    activeTime: 0,
    scrollPattern: [],
  });

  const startTimeRef = useRef(Date.now());
  const lastActiveRef = useRef(Date.now());
  const scrollEventsRef = useRef([]);
  const isActiveRef = useRef(true);

  // Track active time (tab focus)
  useEffect(() => {
    const handleFocus = () => {
      isActiveRef.current = true;
      lastActiveRef.current = Date.now();
    };
    const handleBlur = () => {
      isActiveRef.current = false;
      const sessionTime = Date.now() - lastActiveRef.current;
      setEngagement((prev) => ({
        ...prev,
        activeTime: prev.activeTime + Math.floor(sessionTime / 1000),
      }));
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Update active time every 5 seconds
    const interval = setInterval(() => {
      if (isActiveRef.current) {
        const now = Date.now();
        const activeSeconds = Math.floor((now - lastActiveRef.current) / 1000);
        lastActiveRef.current = now;
        setEngagement((prev) => ({
          ...prev,
          activeTime: prev.activeTime + activeSeconds,
          timeSpent: Math.floor((now - startTimeRef.current) / 1000),
        }));
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Track scroll depth and pattern
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const handleScroll = () => {
      const scrollTop = contentElement.scrollTop;
      const clientHeight = contentElement.clientHeight;
      const scrollHeight = contentElement.scrollHeight;

      const depth = Math.round(
        ((scrollTop + clientHeight) / scrollHeight) * 100,
      );

      scrollEventsRef.current.push({
        position: scrollTop,
        timestamp: Date.now(),
      });

      // Keep last 50 scroll events
      if (scrollEventsRef.current.length > 50) {
        scrollEventsRef.current.shift();
      }

      setEngagement((prev) => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, depth),
        scrollPattern: scrollEventsRef.current.map((e) => ({
          position: Math.round((e.position / scrollHeight) * 100),
        })),
      }));
    };

    contentElement.addEventListener("scroll", handleScroll);
    return () => contentElement.removeEventListener("scroll", handleScroll);
  }, [contentRef]);

  // Track clicks
  useEffect(() => {
    const handleClick = () => {
      setEngagement((prev) => ({
        ...prev,
        interactions: {
          ...prev.interactions,
          clicks: prev.interactions.clicks + 1,
        },
      }));
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return engagement;
};

// --- Loading Pulse Component ---
const LoadingPulse = () => (
  <div className="h-screen bg-white dark:bg-slate-950 p-8 flex flex-col gap-6">
    <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse w-full" />
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-[3rem] animate-pulse" />
      <div className="h-8 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse w-3/4" />
      <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse w-full" />
      <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse w-5/6" />
    </div>
  </div>
);

// --- Error UI ---
const ErrorUI = ({ onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
    <div className="max-w-md text-center">
      <div className="text-8xl mb-6">🚀</div>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
        Connection Lost
      </h3>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        We couldn't load the lesson. It might be orbiting in digital space.
      </p>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-shadow"
      >
        Reconnect Now
      </button>
    </div>
  </div>
);

export default EachChapterStudy;

// // EachChapterStudy.js teacher open
// import React, { useMemo, useState, useEffect, useRef } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   RefreshCw,
//   ChevronUp,
//   ChevronRight,
//   Trophy,
//   Image as ImageIcon,
//   Brain,
//   Zap,
//   AlertCircle,
//   Award,
//   ZoomIn,
// } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import "katex/dist/katex.min.css";
// import { useAuth } from "../../common/AuthContext";

// // RTK APIs
// import {
//   useGetLessonByIdQuery,
//   useUpdateProgressMutation,
//   useUpdateEngagementMutation,
// } from "../../store/api/MathsLessonApi";
// import { useTrackTimeSpentProgressMutation } from "../../store/api/ProgressApi";

// import VideoAndAudio from "./VideoAndAudio";
// import EnhancedVideoPlayer from "./videoPlayer/EnhancedVideoPlayer";

// // --- Utilities ---
// const decodeHTMLEntities = (text) => {
//   if (!text) return "";
//   const entities = {
//     "&amp;": "&",
//     "&lt;": "<",
//     "&gt;": ">",
//     "&quot;": '"',
//     "&#39;": "'",
//     "&nbsp;": " ",
//     "&rsquo;": "'",
//   };
//   return text.replace(
//     /&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;|&rsquo;/g,
//     (m) => entities[m] || m,
//   );
// };

// // Confidence Score Calculator
// const calculateConfidenceScore = (engagement) => {
//   const {
//     scrollDepth,
//     timeSpent,
//     expectedTime = 300,
//     interactions,
//   } = engagement;

//   // 1. Scroll completion weight (40%)
//   const scrollScore = (scrollDepth / 100) * 0.4;

//   // 2. Time engagement weight (30%)
//   const timeRatio = Math.min(timeSpent / expectedTime, 1.5);
//   const timeScore = Math.min(timeRatio, 1) * 0.3;

//   // 3. Interaction density weight (30%)
//   const totalInteractions =
//     (interactions?.clicks || 0) +
//     (interactions?.highlights || 0) * 3 +
//     (interactions?.notes || 0) * 5;
//   const interactionScore = Math.min(totalInteractions / 20, 1) * 0.3;

//   return Math.min(scrollScore + timeScore + interactionScore, 1.0);
// };

// const getConfidenceLevel = (score) => {
//   if (score >= 0.8)
//     return {
//       label: "Excellent",
//       color: "text-emerald-600",
//       bg: "bg-emerald-50",
//     };
//   if (score >= 0.6)
//     return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
//   if (score >= 0.3)
//     return { label: "Surface", color: "text-amber-600", bg: "bg-amber-50" };
//   return { label: "Low", color: "text-rose-600", bg: "bg-rose-50" };
// };

// // --- Main Lesson Component ---
// const EachChapterStudy = () => {
//   const { id: lessonId } = useParams();
//   const navigate = useNavigate();
//   const contentRef = useRef(null);
//   const [showScrollTop, setShowScrollTop] = useState(false);

//   // Get data
//   const { user } = useAuth();

//   // RTK Queries
//   const {
//     data: lessonData,
//     isLoading,
//     error,
//     refetch,
//   } = useGetLessonByIdQuery(lessonId);

//   const medias = lessonData?.media || [];
//   const videoId = medias?.[0]?._id;
//   const chapterId = lessonData?.lesson?.chapterId;
//   const subjectId = lessonData?.subjectId;
//   const currentSubject = lessonData;

//   // Time tracking
//   const startTimeRef = useRef(null);
//   const hasTrackedRef = useRef(false);
//   const [trackTimeSpent] = useTrackTimeSpentProgressMutation();

//   useEffect(() => {
//     if (!lessonId) return;
//     startTimeRef.current = Date.now();
//     hasTrackedRef.current = false;

//     return () => {
//       if (!startTimeRef.current || hasTrackedRef.current) return;
//       const endTime = Date.now();
//       const timeSpentInSeconds = Math.floor(
//         (endTime - startTimeRef.current) / 1000,
//       );
//       hasTrackedRef.current = true;

//       if (timeSpentInSeconds > 0) {
//         trackTimeSpent({
//           subjectId,
//           chapterId,
//           pageId: lessonId,
//           timeSpent: timeSpentInSeconds,
//           startTime: startTimeRef.current,
//           endTime: endTime,
//         });
//       }
//     };
//   }, [lessonId, lessonData]);

//   const [updateProgress] = useUpdateProgressMutation();
//   const [updateEngagement] = useUpdateEngagementMutation();

//   // State
//   const [isMarkedCompleted, setIsMarkedCompleted] = useState(false);
//   const [completionType, setCompletionType] = useState(null);
//   const [showEngagementStats, setShowEngagementStats] = useState(false);

//   // ✅ FIX: Markdown Components INSIDE component (so lessonData is available)
//   const MarkdownComponents = useMemo(
//     () => ({
//       // ✅ IMAGES RENDER INSIDE CONTENT
//       img: ({ src, alt, ...props }) => {
//         const [isZoomed, setIsZoomed] = useState(false);
//         const [imageError, setImageError] = useState(false);

//         // Get media array from lessonData
//         const mediaArray = lessonData?.media || [];
//         console.log("media", mediaArray);
//         const normalizedMediaArray = Array.isArray(mediaArray)
//           ? mediaArray
//           : [mediaArray];

//         const matchingMedia = normalizedMediaArray.find((item) => {
//           const srcFileName = src.split("/").pop() || src;
//           return item.url?.includes(srcFileName) || item.url?.includes(src);
//         });
//         // Construct proper image URL
//         let imageUrl = src;

//         if (matchingMedia) {
//           // Use the actual URL from media array
//           imageUrl = matchingMedia.url;
//         } else if (!src?.startsWith("http")) {
//           // Try to construct URL from API
//           imageUrl = `${import.meta.env.VITE_BACKEND_URL || ""}/uploads/${src}`;
//         }

//         if (imageError) {
//           return (
//             <div className="my-8 p-8 bg-slate-100 rounded-xl text-center border border-slate-200">
//               <ImageIcon className="mx-auto text-slate-400 mb-2" size={32} />
//               <p className="text-slate-500">Image could not be loaded</p>
//               <p className="text-xs text-slate-400 mt-1">Filename: {src}</p>

//               {/* Show available images as fallback */}
//               {mediaArray.length > 0 && (
//                 <div className="mt-4">
//                   <p className="text-sm text-slate-600 mb-2">
//                     Available images:
//                   </p>
//                   <div className="flex flex-wrap gap-2 justify-center">
//                     {mediaArray.map((media, idx) => (
//                       <button
//                         key={idx}
//                         onClick={() => window.open(media.url, "_blank")}
//                         className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200"
//                       >
//                         Image {idx + 1}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         }

//         return (
//           <figure className="my-8 flex flex-col items-center">
//             <div
//               className="relative group cursor-pointer"
//               onClick={() => setIsZoomed(true)}
//             >
//               <img
//                 src={imageUrl}
//                 alt={alt || "Lesson image"}
//                 className="rounded-xl shadow-lg max-w-full h-auto border border-slate-200 transition-all group-hover:shadow-xl group-hover:scale-[1.02]"
//                 loading="lazy"
//                 onError={() => setImageError(true)}
//                 {...props}
//               />
//               <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
//                 <ZoomIn size={18} />
//               </div>
//             </div>
//             {alt && alt !== "Image Description" && (
//               <figcaption className="text-sm text-slate-600 mt-3 italic border-l-4 border-blue-400 pl-3">
//                 {alt}
//               </figcaption>
//             )}

//             {/* Image Zoom Modal */}
//             <AnimatePresence>
//               {isZoomed && (
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
//                   onClick={() => setIsZoomed(false)}
//                 >
//                   <motion.div
//                     initial={{ scale: 0.9 }}
//                     animate={{ scale: 1 }}
//                     exit={{ scale: 0.9 }}
//                     className="relative max-w-5xl max-h-[90vh]"
//                   >
//                     <img
//                       src={imageUrl}
//                       alt={alt}
//                       className="max-w-full max-h-[90vh] object-contain rounded-lg"
//                     />
//                     <button
//                       onClick={() => setIsZoomed(false)}
//                       className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm"
//                     >
//                       <svg
//                         className="w-6 h-6"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     </button>
//                   </motion.div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </figure>
//         );
//       },

//       // Headings
//       h1: ({ children }) => (
//         <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-12 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
//           {children}
//         </h1>
//       ),

//       h2: ({ children }) => (
//         <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-10 mb-4 flex items-center gap-2">
//           <div className="w-1 h-8 bg-blue-500 rounded-full" />
//           <span>{children}</span>
//         </h2>
//       ),

//       h3: ({ children }) => (
//         <h3 className="text-xl md:text-2xl font-semibold text-slate-700 mt-8 mb-3">
//           {children}
//         </h3>
//       ),

//       // Paragraph - Don't wrap images in p tags
//       p: ({ children }) => {
//         // Check if paragraph contains only an image
//         const hasOnlyImage = React.Children.toArray(children).every(
//           (child) =>
//             child?.type === "img" ||
//             child?.props?.src ||
//             child?.type === "figure",
//         );

//         if (hasOnlyImage) {
//           return <>{children}</>;
//         }

//         return (
//           <p className="text-slate-700 text-lg leading-relaxed mb-6 selection:bg-blue-100">
//             {children}
//           </p>
//         );
//       },

//       // Lists
//       ul: ({ children }) => (
//         <ul className="space-y-3 mb-6 ml-4 list-none">{children}</ul>
//       ),

//       ol: ({ children }) => (
//         <ol className="space-y-3 mb-6 ml-4 list-decimal marker:text-blue-500">
//           {children}
//         </ol>
//       ),

//       li: ({ children }) => (
//         <li className="flex items-start gap-3 text-slate-700 text-lg">
//           <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
//           <span className="flex-1">{children}</span>
//         </li>
//       ),

//       // Blockquotes with animation
//       blockquote: ({ children }) => (
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.3 }}
//           className="border-l-4 border-blue-500 bg-blue-50/80 backdrop-blur-sm p-6 rounded-r-2xl my-8 italic text-slate-700 shadow-sm"
//         >
//           {children}
//         </motion.div>
//       ),

//       // Code blocks with syntax highlighting
//       code: ({ inline, className, children, ...props }) => {
//         const match = /language-(\w+)/.exec(className || "");

//         if (!inline && match) {
//           return (
//             <div className="rounded-2xl shadow-2xl my-8 overflow-hidden border border-slate-800">
//               <div className="bg-slate-900 px-4 py-2 text-xs text-slate-400 border-b border-slate-700">
//                 {match[1]}
//               </div>
//               <SyntaxHighlighter
//                 style={vscDarkPlus}
//                 language={match[1]}
//                 PreTag="div"
//                 className="text-sm"
//                 {...props}
//               >
//                 {String(children).replace(/\n$/, "")}
//               </SyntaxHighlighter>
//             </div>
//           );
//         }

//         return (
//           <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-mono text-sm">
//             {children}
//           </code>
//         );
//       },

//       // Tables
//       table: ({ children }) => (
//         <div className="overflow-x-auto my-8">
//           <table className="min-w-full border-collapse border border-slate-200">
//             {children}
//           </table>
//         </div>
//       ),

//       th: ({ children }) => (
//         <th className="border border-slate-200 bg-slate-50 px-4 py-2 text-left font-semibold">
//           {children}
//         </th>
//       ),

//       td: ({ children }) => (
//         <td className="border border-slate-200 px-4 py-2">{children}</td>
//       ),

//       // Horizontal rule
//       hr: () => <hr className="my-8 border-t-2 border-slate-200" />,

//       // Links
//       a: ({ href, children }) => (
//         <a
//           href={href}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
//         >
//           {children}
//         </a>
//       ),
//     }),
//     [lessonData],
//   ); // ✅ Recreate when lessonData changes

//   // Engagement Tracker Hook
//   const engagement = useEngagementTracker(contentRef, lessonId);

//   // Calculate confidence score
//   const confidenceScore = useMemo(() => {
//     return calculateConfidenceScore({
//       scrollDepth: engagement.scrollDepth,
//       timeSpent: engagement.activeTime,
//       expectedTime: 300,
//       interactions: engagement.interactions,
//     });
//   }, [engagement]);

//   const confidenceLevel = getConfidenceLevel(confidenceScore);

//   // Check existing progress
//   useEffect(() => {
//     if (user && lessonId) {
//       const progressKey = `progress_${user._id}_${lessonId}`;
//       const savedProgress = JSON.parse(localStorage.getItem(progressKey));
//       if (savedProgress) {
//         setIsMarkedCompleted(savedProgress.completed);
//         setCompletionType(savedProgress.completionType);
//       }
//     }
//   }, [user, lessonId]);

//   // Auto-completion logic
//   useEffect(() => {
//     if (isMarkedCompleted || !user) return;

//     const shouldAutoComplete =
//       engagement.scrollDepth >= 85 &&
//       engagement.activeTime >= 120 &&
//       confidenceScore >= 0.6;

//     if (shouldAutoComplete) {
//       handleAutoComplete();
//     }
//   }, [engagement, confidenceScore, user, isMarkedCompleted]);

//   // Track scroll for top button
//   useEffect(() => {
//     const handleScroll = () => {
//       setShowScrollTop(contentRef.current?.scrollTop > 400);
//     };

//     const contentEl = contentRef.current;
//     if (contentEl) {
//       contentEl.addEventListener("scroll", handleScroll);
//       return () => contentEl.removeEventListener("scroll", handleScroll);
//     }
//   }, []);

//   // Auto Completion Handler
//   const handleAutoComplete = async () => {
//     if (!user || isMarkedCompleted) return;

//     const progressData = {
//       userId: user._id,
//       subjectId,
//       chapterId,
//       pageId: lessonId,
//       completed: true,
//       completionType: "auto",
//       engagement: {
//         scrollDepth: engagement.scrollDepth,
//         timeSpent: engagement.activeTime,
//         interactions: engagement.interactions,
//         activeTime: engagement.activeTime,
//       },
//       quality: {
//         confidenceScore,
//         attentionScore: calculateAttentionScore(engagement.scrollPattern),
//         comprehensionFlag: "medium",
//         autoCompleted: true,
//       },
//       completedAt: new Date().toISOString(),
//     };

//     try {
//       await updateProgress(progressData).unwrap();

//       const progressKey = `progress_${user._id}_${lessonId}`;
//       localStorage.setItem(
//         progressKey,
//         JSON.stringify({
//           completed: true,
//           completionType: "auto",
//           completedAt: new Date().toISOString(),
//         }),
//       );

//       setIsMarkedCompleted(true);
//       setCompletionType("auto");

//       toast.info(
//         <div className="flex items-center gap-2">
//           <Zap className="text-blue-500" size={20} />
//           <span>
//             Auto-completed! Engagement score:{" "}
//             {(confidenceScore * 100).toFixed(0)}%
//           </span>
//         </div>,
//         { duration: 3000 },
//       );
//     } catch (err) {
//       console.log("Auto-complete failed:", err);
//     }
//   };

//   // Calculate attention score based on scroll pattern
//   const calculateAttentionScore = (scrollPattern) => {
//     if (scrollPattern.length < 3) return 0.5;
//     return 0.7; // Simplified for demo
//   };

//   const scrollToTop = () => {
//     if (contentRef.current) {
//       contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   // ✅ PROCESS CONTENT - IMAGES ARE PRESERVED, NOT REMOVED
//   const processedContent = useMemo(() => {
//     if (!lessonData?.lesson?.content) return "";
//     let content = decodeHTMLEntities(lessonData.lesson.content);

//     // Fix math equations
//     content = content.replace(/\\\\/g, "\\");

//     // Log for debugging

//     return content.trim();
//   }, [lessonData]);

//   // Loading and Error states
//   if (isLoading) return <LoadingSkeleton />;
//   if (error) return <ErrorUI onRetry={refetch} />;

//   const lesson = lessonData?.lesson;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900 flex flex-col">
//       {/* Fixed Header */}
//       <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 flex-shrink-0 shadow-sm">
//         <button
//           onClick={() => navigate(-1)}
//           className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//         >
//           <ChevronRight className="rotate-180" size={20} />
//         </button>
//       </nav>

//       {/* Scrollable Content Area */}
//       <div ref={contentRef} className="flex-1 overflow-y-auto relative">
//         <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//           >
//             {/* Completion Banner */}
//             {isMarkedCompleted && (
//               <CompletionBanner
//                 completionType={completionType}
//                 chapterId={chapterId}
//                 lessonId={lessonId}
//                 navigate={navigate}
//               />
//             )}

//             {/* Learning Tip */}
//             {!isMarkedCompleted && confidenceScore < 0.6 && <LearningTip />}

//             {/* Video Player */}
//             {currentSubject?.media?.url && (
//               <div className="mb-8">
//                 <EnhancedVideoPlayer
//                   media={medias}
//                   pageId={lessonId}
//                   course={currentSubject}
//                   video={"previewPlayer.video"}
//                   isEnrolled={"isEnrolled"}
//                   isPreview={"previewPlayer.isPreview"}
//                 />
//               </div>
//             )}

//             {/* Main Content Card - IMAGES WILL APPEAR HERE */}
//             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-slate-200/50 mb-8">
//               <div className="prose prose-slate max-w-none">
//                 <ReactMarkdown
//                   remarkPlugins={[remarkMath]}
//                   rehypePlugins={[rehypeKatex]}
//                   components={MarkdownComponents}
//                 >
//                   {processedContent}
//                 </ReactMarkdown>
//               </div>
//             </div>
//           </motion.div>
//         </main>
//       </div>
//     </div>
//   );
// };

// // --- Engagement Tracker Hook (defined outside) ---
// const useEngagementTracker = (contentRef, lessonId) => {
//   const [engagement, setEngagement] = useState({
//     scrollDepth: 0,
//     timeSpent: 0,
//     interactions: { clicks: 0, highlights: 0, notes: 0, replays: 0 },
//     activeTime: 0,
//     scrollPattern: [],
//   });

//   const startTimeRef = useRef(Date.now());
//   const lastActiveRef = useRef(Date.now());
//   const scrollEventsRef = useRef([]);
//   const isActiveRef = useRef(true);

//   // Track active time (tab focus)
//   useEffect(() => {
//     const handleFocus = () => {
//       isActiveRef.current = true;
//       lastActiveRef.current = Date.now();
//     };
//     const handleBlur = () => {
//       isActiveRef.current = false;
//       const sessionTime = Date.now() - lastActiveRef.current;
//       setEngagement((prev) => ({
//         ...prev,
//         activeTime: prev.activeTime + Math.floor(sessionTime / 1000),
//       }));
//     };

//     window.addEventListener("focus", handleFocus);
//     window.addEventListener("blur", handleBlur);

//     // Update active time every 5 seconds
//     const interval = setInterval(() => {
//       if (isActiveRef.current) {
//         const now = Date.now();
//         const activeSeconds = Math.floor((now - lastActiveRef.current) / 1000);
//         lastActiveRef.current = now;
//         setEngagement((prev) => ({
//           ...prev,
//           activeTime: prev.activeTime + activeSeconds,
//           timeSpent: Math.floor((now - startTimeRef.current) / 1000),
//         }));
//       }
//     }, 5000);

//     return () => {
//       clearInterval(interval);
//       window.removeEventListener("focus", handleFocus);
//       window.removeEventListener("blur", handleBlur);
//     };
//   }, []);

//   // Track scroll depth and pattern
//   useEffect(() => {
//     const contentElement = contentRef.current;
//     if (!contentElement) return;

//     const handleScroll = () => {
//       const scrollTop = contentElement.scrollTop;
//       const clientHeight = contentElement.clientHeight;
//       const scrollHeight = contentElement.scrollHeight;

//       const depth = Math.round(
//         ((scrollTop + clientHeight) / scrollHeight) * 100,
//       );

//       scrollEventsRef.current.push({
//         position: scrollTop,
//         timestamp: Date.now(),
//       });

//       // Keep last 50 scroll events
//       if (scrollEventsRef.current.length > 50) {
//         scrollEventsRef.current.shift();
//       }

//       setEngagement((prev) => ({
//         ...prev,
//         scrollDepth: Math.max(prev.scrollDepth, depth),
//         scrollPattern: scrollEventsRef.current.map((e) => ({
//           position: Math.round((e.position / scrollHeight) * 100),
//         })),
//       }));
//     };

//     contentElement.addEventListener("scroll", handleScroll);
//     return () => contentElement.removeEventListener("scroll", handleScroll);
//   }, [contentRef]);

//   // Track clicks
//   useEffect(() => {
//     const handleClick = () => {
//       setEngagement((prev) => ({
//         ...prev,
//         interactions: {
//           ...prev.interactions,
//           clicks: prev.interactions.clicks + 1,
//         },
//       }));
//     };

//     document.addEventListener("click", handleClick);
//     return () => document.removeEventListener("click", handleClick);
//   }, []);

//   return engagement;
// };

// // --- Completion Banner Component ---
// const CompletionBanner = ({
//   completionType,
//   chapterId,
//   lessonId,
//   navigate,
// }) => (
//   <motion.div
//     initial={{ opacity: 0, y: -10 }}
//     animate={{ opacity: 1, y: 0 }}
//     className={`mb-8 p-6 rounded-2xl shadow-sm border ${
//       completionType === "manual"
//         ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
//         : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
//     }`}
//   >
//     <div className="flex items-start gap-4">
//       <div
//         className={`p-3 rounded-xl ${completionType === "manual" ? "bg-emerald-100" : "bg-blue-100"}`}
//       >
//         {completionType === "manual" ? (
//           <Award className="text-emerald-600" size={24} />
//         ) : (
//           <Zap className="text-blue-600" size={24} />
//         )}
//       </div>
//       <div className="flex-1">
//         <h3 className="font-bold text-slate-800 text-lg mb-1">
//           {completionType === "manual"
//             ? "🎉 Lesson Completed!"
//             : "⚡ Auto-Completed!"}
//         </h3>
//         <p className="text-slate-600 mb-4">
//           {completionType === "manual"
//             ? "You marked this lesson as complete. Ready to test your knowledge?"
//             : "Great engagement! The system auto-completed this lesson."}
//         </p>
//         <div className="flex gap-3">
//           <button
//             onClick={() => navigate(`/chapter/${chapterId}/quiz`)}
//             className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg flex items-center gap-2"
//           >
//             <Trophy size={18} />
//             Take Quiz
//           </button>
//           <button
//             onClick={() => navigate(`/chapter/${chapterId}/dashboard`)}
//             className="px-5 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50"
//           >
//             Chapter Dashboard
//           </button>
//         </div>
//       </div>
//     </div>
//   </motion.div>
// );

// // --- Learning Tip Component ---
// const LearningTip = () => (
//   <motion.div
//     initial={{ opacity: 0, x: -20 }}
//     animate={{ opacity: 1, x: 0 }}
//     className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl"
//   >
//     <div className="flex items-center gap-3">
//       <AlertCircle className="text-amber-600" size={24} />
//       <div>
//         <h4 className="font-semibold text-amber-800">Learning Tip</h4>
//         <p className="text-amber-700 text-sm">
//           Spend more time reading and interacting with content for better
//           understanding.
//         </p>
//       </div>
//     </div>
//   </motion.div>
// );

// // --- Loading Skeleton ---
// const LoadingSkeleton = () => (
//   <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
//     <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60 h-20 flex-shrink-0"></div>
//     <div className="flex-1 overflow-y-auto">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
//         <div className="space-y-8">
//           <div className="h-8 bg-slate-200 rounded-xl w-3/4"></div>
//           <div className="bg-white rounded-3xl p-8 shadow-lg">
//             <div className="space-y-4">
//               <div className="h-4 bg-slate-200 rounded w-full"></div>
//               <div className="h-4 bg-slate-200 rounded w-5/6"></div>
//               <div className="h-4 bg-slate-200 rounded w-4/5"></div>
//               <div className="h-4 bg-slate-200 rounded w-full"></div>
//               <div className="h-4 bg-slate-200 rounded w-3/4"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // --- Error UI ---
// const ErrorUI = ({ onRetry }) => (
//   <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
//     <div className="max-w-md text-center">
//       <div className="text-8xl mb-6">🚀</div>
//       <h3 className="text-2xl font-bold text-slate-800 mb-3">
//         Connection Lost
//       </h3>
//       <p className="text-slate-600 mb-8">
//         We couldn't load the lesson. It might be orbiting in digital space.
//       </p>
//       <button
//         onClick={onRetry}
//         className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-shadow"
//       >
//         Reconnect Now
//       </button>
//     </div>
//   </div>
// );

// export default EachChapterStudy;
