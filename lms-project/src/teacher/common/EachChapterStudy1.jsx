// import React, { useMemo, useState, useEffect, useRef } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   BookOpen,
//   Printer,
//   RefreshCw,
//   ChevronUp,
//   Clock,
//   Share2,
//   CheckCircle,
//   Loader2,
//   ChevronRight,
//   Trophy,
//   BarChart3,
//   Image as ImageIcon,
//   Target,
//   Brain,
//   Zap,
//   AlertCircle,
//   Lightbulb,
//   TrendingUp,
//   Bookmark,
//   PenTool,
//   Award,
//   Users,
//   Calendar,
//   Eye,
//   MousePointerClick,
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

// // --- Modern Markdown Components ---
// const MarkdownComponents = {
//   h1: ({ children }) => (
//     <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-12 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
//       {children}
//     </h1>
//   ),
//   h2: ({ children }) => (
//     <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-10 mb-4 flex items-center gap-2">
//       <div className="w-1 h-8 bg-blue-500 rounded-full" /> {children}
//     </h2>
//   ),
//   p: ({ children }) => (
//     <p className="text-slate-600 text-lg leading-relaxed mb-6 selection:bg-blue-100">
//       {children}
//     </p>
//   ),
//   ul: ({ children }) => <ul className="space-y-3 mb-6 ml-4">{children}</ul>,
//   li: ({ children }) => (
//     <li className="flex items-start gap-3 text-slate-700 text-lg">
//       <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
//       <span>{children}</span>
//     </li>
//   ),
//   blockquote: ({ children }) => (
//     <motion.div
//       initial={{ opacity: 0, x: -20 }}
//       whileInView={{ opacity: 1, x: 0 }}
//       className="border-l-4 border-blue-500 bg-blue-50/50 backdrop-blur-sm p-6 rounded-r-2xl my-8 italic text-slate-700 shadow-sm"
//     >
//       {children}
//     </motion.div>
//   ),
//   code: ({ inline, className, children, ...props }) => {
//     const match = /language-(\w+)/.exec(className || "");
//     return !inline ? (
//       <div className="rounded-2xl shadow-2xl my-8 border border-slate-800">
//         <SyntaxHighlighter
//           style={vscDarkPlus}
//           language={match?.[1] || "text"}
//           PreTag="div"
//           {...props}
//         >
//           {String(children).replace(/\n$/, "")}
//         </SyntaxHighlighter>
//       </div>
//     ) : (
//       <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-mono text-sm">
//         {children}
//       </code>
//     );
//   },
// };

// // Engagement Tracker Hook
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
//       const scrollSpeed =
//         scrollEventsRef.current.length > 0
//           ? Math.abs(
//               scrollTop -
//                 scrollEventsRef.current[scrollEventsRef.current.length - 1]
//                   .position,
//             )
//           : 0;

//       scrollEventsRef.current.push({
//         position: scrollTop,
//         timestamp: Date.now(),
//         speed: scrollSpeed,
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
//           speed: e.speed,
//         })),
//       }));
//     };

//     contentElement.addEventListener("scroll", handleScroll);
//     return () => contentElement.removeEventListener("scroll", handleScroll);
//   }, [contentRef]);

//   // Track clicks (simple interaction)
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

// // --- Main Lesson Component ---
// const EachChapterStudy = () => {
//   const { id: lessonId } = useParams();
//   const navigate = useNavigate();
//   const contentRef = useRef(null);

//   // Get data from Redux store
//   const { user } = useAuth();

//   // RTK Queries
//   const {
//     data: lessonData,
//     isLoading,
//     error,
//     refetch,
//   } = useGetLessonByIdQuery(lessonId);
//   console.log("lessonData", lessonData);
//   const [trackTimeSpent] = useTrackTimeSpentProgressMutation();
//   const medias = lessonData?.media || "";
//   const videoId = medias?.[0]?._id;

//   const chapterId = lessonData?.lesson?.chapterId;
//   const subjectId = lessonData?.subjectId;
//   const currentSubject = lessonData;

//   // Start time store ചെയ്യാൻ useRef ഉപയോഗിക്കുന്നു

//   const startTimeRef = useRef(null);
//   const hasTrackedRef = useRef(false);

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

//       hasTrackedRef.current = true; // prevent double call

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

//   const [
//     updateProgress,
//     { isLoading: isUpdatingProgress, isSuccess: progressUpdated },
//   ] = useUpdateProgressMutation();

//   // Engagement Mutation
//   const [updateEngagement] = useUpdateEngagementMutation();

//   // State
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [isMarkedCompleted, setIsMarkedCompleted] = useState(false);
//   const [completionType, setCompletionType] = useState(null);
//   const [showEngagementStats, setShowEngagementStats] = useState(false);

//   // Engagement Tracking
//   const engagement = useEngagementTracker(contentRef, lessonId);

//   // Calculate confidence score
//   const confidenceScore = useMemo(() => {
//     return calculateConfidenceScore({
//       scrollDepth: engagement.scrollDepth,
//       timeSpent: engagement.activeTime,
//       expectedTime: 300, // 5 minutes per lesson
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
//       engagement.activeTime >= 120 && // At least 2 minutes active
//       confidenceScore >= 0.6;

//     if (shouldAutoComplete) {
//       handleAutoComplete();
//     }
//   }, [engagement, confidenceScore, user, isMarkedCompleted]);
//   const handleManualWatchProgress = () => {
//     navigate(`/studentDetails/watchProgress/${videoId}/${lessonId}`);
//   };

//   // Manual Completion Handler
//   const handleManualComplete = async () => {
//     if (!user) {
//       toast.error("Please login to track progress");
//       navigate("/login");
//       return;
//     }

//     if (!subjectId || !chapterId) {
//       toast.error("Subject/Chapter information missing");
//       return;
//     }

//     const progressData = {
//       userId: user._id,
//       subjectId,
//       chapterId,
//       pageId: lessonId,
//       completed: true,
//       completionType: "manual",
//       engagement: {
//         scrollDepth: engagement.scrollDepth,
//         timeSpent: engagement.activeTime,
//         interactions: engagement.interactions,
//         activeTime: engagement.activeTime,
//         scrollPattern: engagement.scrollPattern.slice(-10), // Last 10 scroll events
//       },
//       quality: {
//         confidenceScore,
//         attentionScore: calculateAttentionScore(engagement.scrollPattern),
//         comprehensionFlag: confidenceScore >= 0.6 ? "high" : "medium",
//         expectedTime: 300,
//         timeRatio: engagement.activeTime / 300,
//       },
//       context: {
//         device: /Mobi|Android/i.test(navigator.userAgent)
//           ? "mobile"
//           : "desktop",
//         timeOfDay:
//           new Date().getHours() < 12
//             ? "morning"
//             : new Date().getHours() < 17
//               ? "afternoon"
//               : "evening",
//         sessionDuration: engagement.timeSpent,
//         previousAttempts: 0,
//       },
//       startedAt: new Date(startTimeRef.current).toISOString(),
//       completedAt: new Date().toISOString(),
//       manualCompleted: true,
//     };

//     try {
//       // Save to API
//       await updateProgress(progressData).unwrap();

//       // Save engagement data separately
//       await updateEngagement({
//         userId: user._id,
//         lessonId,
//         engagement: progressData.engagement,
//         quality: progressData.quality,
//       }).unwrap();

//       // Save to localStorage
//       const progressKey = `progress_${user._id}_${lessonId}`;
//       localStorage.setItem(
//         progressKey,
//         JSON.stringify({
//           completed: true,
//           completionType: "manual",
//           completedAt: new Date().toISOString(),
//         }),
//       );

//       setIsMarkedCompleted(true);
//       setCompletionType("manual");

//       toast.success(
//         <div className="flex items-center gap-2">
//           <Award className="text-green-500" size={20} />
//           <span>
//             Lesson marked as completed! Confidence:{" "}
//             {(confidenceScore * 100).toFixed(0)}%
//           </span>
//         </div>,
//         { duration: 3000 },
//       );
//     } catch (err) {
//       console.error("Progress update failed:", err);
//       toast.error("Failed to save progress. Please try again.");
//     }
//   };

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

//     const speeds = scrollPattern.map((p) => p.speed);
//     const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
//     const variance =
//       speeds.reduce((a, b) => a + Math.pow(b - avgSpeed, 2), 0) / speeds.length;

//     // Lower variance = more consistent reading = higher attention
//     return Math.max(0.1, 1 - variance / 1000);
//   };

//   const scrollToTop = () => {
//     if (contentRef.current) {
//       contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const processedContent = useMemo(() => {
//     if (!lessonData?.lesson?.content) return "";
//     let content = decodeHTMLEntities(lessonData.lesson.content);
//     content = content.replace(/!\[.*?\]\(.*?\)/g, "");
//     content = content.replace(/\\\\(begin|end|frac)/g, "\\$1");
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
//         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//             >
//               <ChevronRight className="rotate-180" size={20} />
//             </button>
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <BookOpen size={20} />
//             </div>
//             <div>
//               <h2 className="font-bold text-slate-900 leading-tight line-clamp-1 max-w-xs">
//                 {lesson?.title}
//               </h2>
//               <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
//                 <span
//                   className={`px-2 py-1 rounded-full ${confidenceLevel.bg} ${confidenceLevel.color}`}
//                 >
//                   {confidenceLevel.label} Engagement
//                 </span>
//                 <span>•</span>
//                 <span className="flex items-center gap-1">
//                   <Clock size={12} /> {Math.floor(engagement.activeTime / 60)}{" "}
//                   min
//                 </span>
//                 <span>•</span>
//                 <span className="flex items-center gap-1">
//                   <Eye size={12} /> {engagement.scrollDepth}% viewed
//                 </span>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             {/* Engagement Stats Toggle */}
//             <button
//               onClick={() => setShowEngagementStats(!showEngagementStats)}
//               className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//               title="View Engagement Stats"
//             >
//               <BarChart3 size={20} />
//             </button>

//             {/* Completion Button */}
//             <button
//               onClick={handleManualWatchProgress}
//               disabled={isMarkedCompleted}
//               className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium ${
//                 isMarkedCompleted
//                   ? completionType === "manual"
//                     ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
//                     : "bg-blue-100 text-blue-700 border border-blue-200"
//                   : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
//               }`}
//             >
//               <CheckCircle size={18} />
//               <span className="hidden sm:inline">Watch Progress</span>
//             </button>
//             <button
//               onClick={handleManualComplete}
//               disabled={isMarkedCompleted}
//               className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium ${
//                 isMarkedCompleted
//                   ? completionType === "manual"
//                     ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
//                     : "bg-blue-100 text-blue-700 border border-blue-200"
//                   : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
//               }`}
//             >
//               {isMarkedCompleted ? (
//                 <>
//                   <CheckCircle size={18} />
//                   <span className="hidden sm:inline">
//                     {completionType === "manual"
//                       ? "Manually Completed"
//                       : "Auto Completed"}
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle size={18} />
//                   <span className="hidden sm:inline">Mark Complete</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Engagement Stats Modal */}
//       <AnimatePresence>
//         {showEngagementStats && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: -10 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: -10 }}
//             transition={{ type: "spring", damping: 25, stiffness: 300 }}
//             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
//             onClick={(e) => {
//               if (e.target === e.currentTarget) setShowEngagementStats(false);
//             }}
//           >
//             <motion.div
//               layout
//               className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
//             >
//               {/* Header - Sticky */}
//               <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
//                     <Brain className="text-white" size={22} />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-slate-900">
//                       Engagement Analytics
//                     </h3>
//                     <p className="text-sm text-slate-500">
//                       Real-time learning insights
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setShowEngagementStats(false)}
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                   aria-label="Close"
//                 >
//                   <svg
//                     className="w-5 h-5 text-slate-500"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               {/* Scrollable Content */}
//               <div className="flex-1 overflow-y-auto px-6 py-6">
//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//                   <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200 hover:border-blue-300 transition-all hover:shadow-lg">
//                     <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                       <Eye className="text-blue-600" size={16} />
//                     </div>
//                     <div className="text-3xl font-bold text-blue-700 mb-1">
//                       {engagement.scrollDepth}%
//                     </div>
//                     <div className="text-sm font-medium text-blue-600">
//                       Scroll Depth
//                     </div>
//                     <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
//                       <motion.div
//                         initial={{ width: 0 }}
//                         animate={{ width: `${engagement.scrollDepth}%` }}
//                         className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
//                       />
//                     </div>
//                   </div>

//                   <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-2xl border border-emerald-200 hover:border-emerald-300 transition-all hover:shadow-lg">
//                     <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                       <Clock className="text-emerald-600" size={16} />
//                     </div>
//                     <div className="text-3xl font-bold text-emerald-700 mb-1">
//                       {Math.floor(engagement.activeTime / 60)}m
//                     </div>
//                     <div className="text-sm font-medium text-emerald-600">
//                       Active Time
//                     </div>
//                     <div className="mt-2 text-xs text-emerald-500">
//                       {Math.floor((engagement.activeTime % 3600) / 60)}m{" "}
//                       {engagement.activeTime % 60}s
//                     </div>
//                   </div>

//                   <div className="group relative bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200 hover:border-amber-300 transition-all hover:shadow-lg">
//                     <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                       <MousePointerClick className="text-amber-600" size={16} />
//                     </div>
//                     <div className="text-3xl font-bold text-amber-700 mb-1">
//                       {engagement.interactions.clicks}
//                     </div>
//                     <div className="text-sm font-medium text-amber-600">
//                       Interactions
//                     </div>
//                     <div className="mt-2 text-xs text-amber-500">
//                       Clicks, highlights, notes
//                     </div>
//                   </div>

//                   <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200 hover:border-purple-300 transition-all hover:shadow-lg">
//                     <div className="absolute -top-2 -right-2 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                       <Target className="text-purple-600" size={16} />
//                     </div>
//                     <div className="text-3xl font-bold text-purple-700 mb-1">
//                       {(confidenceScore * 100).toFixed(0)}%
//                     </div>
//                     <div className="text-sm font-medium text-purple-600">
//                       Confidence
//                     </div>
//                     <div className="mt-2 text-xs text-purple-500">
//                       {confidenceLevel.label} Level
//                     </div>
//                   </div>
//                 </div>

//                 {/* Main Content */}
//                 <div className="space-y-6">
//                   {/* Confidence Score Card */}
//                   <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl p-6 border border-slate-200">
//                     <div className="flex items-center justify-between mb-4">
//                       <div>
//                         <h4 className="font-bold text-slate-800 text-lg mb-1">
//                           Engagement Level
//                         </h4>
//                         <div className="flex items-center gap-2">
//                           <span
//                             className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceLevel.bg} ${confidenceLevel.color}`}
//                           >
//                             {confidenceLevel.label}
//                           </span>
//                           <span className="text-slate-500 text-sm">
//                             {(confidenceScore * 100).toFixed(1)}% score
//                           </span>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-2xl font-bold text-slate-900">
//                           {confidenceScore >= 0.8
//                             ? "🎯"
//                             : confidenceScore >= 0.6
//                               ? "🚀"
//                               : "📚"}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <div>
//                         <div className="flex justify-between text-sm text-slate-600 mb-2">
//                           <span>Progress</span>
//                           <span>{Math.round(confidenceScore * 100)}%</span>
//                         </div>
//                         <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-100 rounded-full overflow-hidden shadow-inner">
//                           <motion.div
//                             initial={{ width: 0 }}
//                             animate={{ width: `${confidenceScore * 100}%` }}
//                             transition={{
//                               delay: 0.2,
//                               duration: 1,
//                               ease: "easeOut",
//                             }}
//                             className={`h-full rounded-full ${
//                               confidenceScore >= 0.8
//                                 ? "bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-emerald-200"
//                                 : confidenceScore >= 0.6
//                                   ? "bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg shadow-blue-200"
//                                   : confidenceScore >= 0.3
//                                     ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-200"
//                                     : "bg-gradient-to-r from-rose-400 to-pink-500 shadow-lg shadow-rose-200"
//                             }`}
//                           />
//                         </div>
//                       </div>

//                       <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100">
//                         <div className="flex items-start gap-3">
//                           <div className="p-2 bg-blue-100 rounded-lg">
//                             <Lightbulb className="text-blue-600" size={18} />
//                           </div>
//                           <div className="flex-1">
//                             <p className="text-sm font-medium text-blue-800 mb-1">
//                               Learning Insight
//                             </p>
//                             <p className="text-sm text-blue-600">
//                               {confidenceScore >= 0.8
//                                 ? "Excellent engagement! You're learning deeply and retaining information effectively."
//                                 : confidenceScore >= 0.6
//                                   ? "Good engagement! You're on the right track. Consider taking notes for better retention."
//                                   : "Consider spending more time with the material. Active reading helps with long-term retention."}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Quick Stats */}
//                   <div className="grid md:grid-cols-2 gap-6">
//                     <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
//                       <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
//                         <Bookmark className="text-indigo-500" size={20} />
//                         Completion Details
//                       </h4>
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between py-2 border-b border-slate-100">
//                           <span className="text-slate-600">Type</span>
//                           <span
//                             className={`px-3 py-1 rounded-full text-sm font-medium ${
//                               completionType === "manual"
//                                 ? "bg-emerald-100 text-emerald-700"
//                                 : completionType === "auto"
//                                   ? "bg-blue-100 text-blue-700"
//                                   : "bg-slate-100 text-slate-600"
//                             }`}
//                           >
//                             {completionType
//                               ? completionType === "manual"
//                                 ? "Manual ✅"
//                                 : "Auto ⚡"
//                               : "Pending"}
//                           </span>
//                         </div>
//                         <div className="flex items-center justify-between py-2 border-b border-slate-100">
//                           <span className="text-slate-600">
//                             Interaction Rate
//                           </span>
//                           <span className="font-medium text-slate-900">
//                             {engagement.interactions.clicks} /min
//                           </span>
//                         </div>
//                         <div className="flex items-center justify-between py-2">
//                           <span className="text-slate-600">Focus Score</span>
//                           <span className="font-medium text-slate-900">
//                             {calculateAttentionScore(
//                               engagement.scrollPattern,
//                             ).toFixed(1)}
//                             /1.0
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Learning Tips */}
//                     <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
//                       <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
//                         <Lightbulb className="text-amber-500" size={20} />
//                         Pro Tips
//                       </h4>
//                       <ul className="space-y-3">
//                         <li className="flex items-start gap-3 p-3 bg-white/80 rounded-xl hover:bg-white transition-colors">
//                           <div className="p-1.5 bg-blue-100 rounded-md flex-shrink-0">
//                             <span className="text-blue-600 text-sm font-bold">
//                               1
//                             </span>
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-slate-800">
//                               Active Reading
//                             </p>
//                             <p className="text-xs text-slate-600">
//                               Engage with content by taking notes
//                             </p>
//                           </div>
//                         </li>
//                         <li className="flex items-start gap-3 p-3 bg-white/80 rounded-xl hover:bg-white transition-colors">
//                           <div className="p-1.5 bg-emerald-100 rounded-md flex-shrink-0">
//                             <span className="text-emerald-600 text-sm font-bold">
//                               2
//                             </span>
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-slate-800">
//                               Practice Tests
//                             </p>
//                             <p className="text-xs text-slate-600">
//                               Quizzes reinforce learning by 40%
//                             </p>
//                           </div>
//                         </li>
//                         <li className="flex items-start gap-3 p-3 bg-white/80 rounded-xl hover:bg-white transition-colors">
//                           <div className="p-1.5 bg-purple-100 rounded-md flex-shrink-0">
//                             <span className="text-purple-600 text-sm font-bold">
//                               3
//                             </span>
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-slate-800">
//                               Regular Reviews
//                             </p>
//                             <p className="text-xs text-slate-600">
//                               Review material within 24 hours
//                             </p>
//                           </div>
//                         </li>
//                       </ul>
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="grid md:grid-cols-2 gap-4 pt-4">
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => {
//                         navigate(`/chapter/${chapterId}/quiz`);
//                         setShowEngagementStats(false);
//                       }}
//                       className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center justify-center gap-3"
//                     >
//                       <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
//                       <Trophy className="relative z-10" size={20} />
//                       <span className="relative z-10">Take Chapter Quiz</span>
//                       <ChevronRight
//                         className="relative z-10 group-hover:translate-x-1 transition-transform"
//                         size={18}
//                       />
//                     </motion.button>

//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => {
//                         navigate(`/chapter/${chapterId}/dashboard`);
//                         setShowEngagementStats(false);
//                       }}
//                       className="px-6 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
//                     >
//                       <BarChart3 size={20} />
//                       <span>View Chapter Dashboard</span>
//                     </motion.button>
//                   </div>

//                   {/* Performance Indicator */}
//                   {confidenceScore < 0.6 && (
//                     <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 bg-amber-100 rounded-lg">
//                           <AlertCircle className="text-amber-600" size={20} />
//                         </div>
//                         <div className="flex-1">
//                           <h5 className="font-semibold text-amber-800 mb-1">
//                             Improvement Opportunity
//                           </h5>
//                           <p className="text-sm text-amber-700">
//                             Your engagement score suggests you might benefit
//                             from:
//                           </p>
//                           <ul className="mt-2 space-y-1">
//                             <li className="text-sm text-amber-600 flex items-center gap-2">
//                               <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
//                               Re-reading difficult sections
//                             </li>
//                             <li className="text-sm text-amber-600 flex items-center gap-2">
//                               <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
//                               Taking summary notes
//                             </li>
//                             <li className="text-sm text-amber-600 flex items-center gap-2">
//                               <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
//                               Completing practice exercises
//                             </li>
//                           </ul>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="sticky bottom-0 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200 px-6 py-4">
//                 <div className="flex items-center justify-between">
//                   <div className="text-sm text-slate-500">
//                     Updated{" "}
//                     {new Date().toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </div>
//                   <button
//                     onClick={() => setShowEngagementStats(false)}
//                     className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
//                   >
//                     Close Panel
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//       {/* Scrollable Content Area */}
//       <div ref={contentRef} className="flex-1 overflow-y-auto relative">
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//             {/* Main Content */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="lg:col-span-8"
//             >
//               {/* Completion Banner */}
//               {isMarkedCompleted && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className={`mb-8 p-6 rounded-2xl shadow-sm border ${
//                     completionType === "manual"
//                       ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
//                       : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
//                   }`}
//                 >
//                   <div className="flex items-start gap-4">
//                     <div
//                       className={`p-3 rounded-xl ${
//                         completionType === "manual"
//                           ? "bg-emerald-100"
//                           : "bg-blue-100"
//                       }`}
//                     >
//                       {completionType === "manual" ? (
//                         <Award className="text-emerald-600" size={24} />
//                       ) : (
//                         <Zap className="text-blue-600" size={24} />
//                       )}
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-bold text-slate-800 text-lg mb-1">
//                         {completionType === "manual"
//                           ? "🎉 Lesson Manually Completed!"
//                           : "⚡ Lesson Auto-Completed!"}
//                       </h3>
//                       <p className="text-slate-600 mb-4">
//                         {completionType === "manual"
//                           ? "You marked this lesson as complete. Ready to test your knowledge?"
//                           : "Great engagement! The system auto-completed this lesson based on your activity."}
//                       </p>
//                       <div className="flex gap-3">
//                         <button
//                           onClick={() =>
//                             navigate(`/teacherDetails/playQuiz${lessonId}`)
//                           }
//                           className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-colors flex items-center gap-2"
//                         >
//                           <Trophy size={18} />
//                           Take Quiz
//                         </button>
//                         <button
//                           onClick={() =>
//                             navigate(`/chapter/${chapterId}/dashboard`)
//                           }
//                           className="px-5 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors"
//                         >
//                           Chapter Dashboard
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//               {/* Learning Tip */}
//               {!isMarkedCompleted && confidenceScore < 0.6 && (
//                 <motion.div
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl"
//                 >
//                   <div className="flex items-center gap-3">
//                     <AlertCircle className="text-amber-600" size={24} />
//                     <div>
//                       <h4 className="font-semibold text-amber-800">
//                         Learning Tip
//                       </h4>
//                       <p className="text-amber-700 text-sm">
//                         Spend more time reading and interacting with content for
//                         better understanding.
//                       </p>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}

//               {currentSubject.media?.url && (
//                 <motion.div
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl"
//                 >
//                   <EnhancedVideoPlayer
//                     media={medias} // actual media object
//                     pageId={lessonId}
//                     course={currentSubject}
//                     video={"previewPlayer.video"}
//                     isEnrolled={"isEnrolled"}
//                     isPreview={"previewPlayer.isPreview"}
//                   />
//                 </motion.div>
//               )}
//               {/* Content Card */}
//               <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-slate-200/50 mb-8">
//                 <div className="prose prose-slate max-w-none">
//                   <ReactMarkdown
//                     remarkPlugins={[remarkMath]}
//                     rehypePlugins={[rehypeKatex]}
//                     components={MarkdownComponents}
//                   >
//                     {processedContent}
//                   </ReactMarkdown>
//                 </div>

//                 {/* Completion Section */}
//                 <div className="mt-12 pt-8 border-t border-slate-200">
//                   <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
//                     <div className="flex-1">
//                       <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
//                         <Target size={20} />
//                         Finish this lesson
//                       </h4>
//                       <p className="text-slate-600 text-sm">
//                         {isMarkedCompleted
//                           ? "Ready to test your knowledge?"
//                           : `Current engagement: ${confidenceLevel.label} (${(confidenceScore * 100).toFixed(0)}%)`}
//                       </p>
//                       {!isMarkedCompleted && (
//                         <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
//                           <span className="flex items-center gap-1">
//                             <Eye size={14} /> {engagement.scrollDepth}% viewed
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Clock size={14} />{" "}
//                             {Math.floor(engagement.activeTime / 60)} min
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <MousePointerClick size={14} />{" "}
//                             {engagement.interactions.clicks} clicks
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-4">
//                       {!isMarkedCompleted && (
//                         <>
//                           <button
//                             onClick={handleManualComplete}
//                             disabled={isMarkedCompleted}
//                             className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
//                               isMarkedCompleted
//                                 ? "bg-slate-100 text-slate-400 cursor-not-allowed"
//                                 : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
//                             }`}
//                           >
//                             <PenTool size={20} />
//                             Mark Complete
//                           </button>
//                           <button
//                             onClick={() =>
//                               navigate(`/teacherDetails/playQuiz/${lessonId}`)
//                             }
//                             className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
//                           >
//                             <Trophy size={20} />
//                             Take Quiz
//                           </button>
//                         </>
//                       )}
//                       {isMarkedCompleted && (
//                         <button
//                           onClick={() => navigate(`/chapter/${chapterId}/quiz`)}
//                           className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
//                         >
//                           <Trophy size={20} />
//                           Test Your Knowledge
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Sidebar */}
//             <aside className="lg:col-span-4 space-y-6">
//               {/* Teaching Reference Images */}
//               {lesson?.media?.length > 0 && (
//                 <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
//                   <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-6">
//                     <ImageIcon className="text-blue-500" size={20} />
//                     Reference Diagrams
//                   </h3>

//                   <div className="space-y-10">
//                     {lesson.media.map((item, index) => (
//                       <figure key={item._id || index} className="w-full">
//                         <div className="w-full min-h-[420px] md:min-h-[520px] lg:min-h-[620px] bg-slate-100 rounded-xl overflow-hidden border border-slate-300">
//                           <img
//                             src={item.url}
//                             alt={`Reference diagram ${index + 1}`}
//                             className="w-full h-full object-contain"
//                             loading="lazy"
//                             onError={(e) => {
//                               e.currentTarget.src = `https://placehold.co/1200x800?text=Reference+Image`;
//                             }}
//                           />
//                         </div>

//                         {/* Caption / Explanation */}
//                         {item.caption && (
//                           <figcaption className="mt-3 text-base text-slate-700 leading-relaxed">
//                             <span className="font-semibold text-slate-900">
//                               Figure {index + 1}:
//                             </span>{" "}
//                             {item.caption}
//                           </figcaption>
//                         )}
//                       </figure>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </aside>
//           </div>
//         </main>
//       </div>

//       {/* Floating Action Buttons */}
//       <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
//         <AnimatePresence>
//           {showScrollTop && (
//             <motion.button
//               initial={{ opacity: 0, scale: 0.8, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.8, y: 20 }}
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={scrollToTop}
//               className="w-14 h-14 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-slate-600 border border-slate-200 hover:border-blue-300"
//             >
//               <ChevronUp size={22} />
//             </motion.button>
//           )}
//         </AnimatePresence>

//         <motion.button
//           whileHover={{ scale: 1.1, rotate: 180 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={refetch}
//           className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-300 rounded-2xl flex items-center justify-center text-white"
//           title="Refresh Content"
//         >
//           <RefreshCw size={22} />
//         </motion.button>

//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => setShowEngagementStats(true)}
//           className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 shadow-2xl shadow-emerald-300 rounded-2xl flex items-center justify-center text-white"
//           title="View Engagement Stats"
//         >
//           <Brain size={22} />
//         </motion.button>
//       </div>
//     </div>
//   );
// };

// // --- Loading Skeleton ---
// const LoadingSkeleton = () => (
//   <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
//     <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60 h-20 flex-shrink-0"></div>
//     <div className="flex-1 overflow-y-auto">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//           <div className="lg:col-span-8 space-y-8">
//             <div className="h-8 bg-slate-200 rounded-xl w-3/4"></div>
//             <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50">
//               <div className="space-y-4">
//                 <div className="h-4 bg-slate-200 rounded w-full"></div>
//                 <div className="h-4 bg-slate-200 rounded w-5/6"></div>
//                 <div className="h-4 bg-slate-200 rounded w-4/5"></div>
//               </div>
//             </div>
//           </div>
//           <div className="lg:col-span-4 space-y-6">
//             <div className="bg-white rounded-2xl p-6 h-64"></div>
//             <div className="bg-white rounded-2xl p-6 h-48"></div>
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
// ![image_1768936112012_xpl5i6mxe.jpg](image_1768936112012_xpl5i6mxe.jpg)

// ### Multiplicative comparisons.
// ###### We can compare the lengths of the screws in many ways. Using addition and subtraction:
// - The length of the short screw is 8 millimetres less than the length of the long screw.
// - The length of the long screw is 8 millimetres more than the length of the short screw.
// ###### We can also compare using multiplication and division:
// - The length of the short screw is half the length of the long screw.
// - The length of the long screw is twice the length of the short screw.
// ###### We have seen in Class 7 that the second kind of comparison can be said in a different manner:
// - The ratio of the length of the short screw to the length of the long screw is 1 to 2.
// - The ratio of the length of the long screw to the length of the short screw is 2 to 1.
// ###### (The section Other measures of the lesson **Ratio** in the Class 7 textbook).
// ###### In the same lesson, we have seen that the ratio 1 to 2 is written 1 : 2 and the ratio 2 to 1 is written 2 : 1
// ###### How do you state the relation between their lengths as a ratio?
// ###### For that, we will have to compute what fraction of the length of the long screw is the length of the short screw.
// ###### That is, what fraction of 12 is 8?
// ###### Remember doing such problems in Class 7? (The section **Times and parts** of the lesson **Reciprocals**).
// ###### 1 is  $$ \frac{1}{12} $$ of 12; and 8 is **8 times 1**.
// ###### thus 8 is $$ \frac{8}{12} $$ of 12.
// ###### We can remove common factors and write  $$ \frac{8}{12} $$ like this:.
// $$
// \frac{8}{12}
// = \frac{2 \times 4}{3 \times 4}
// = \frac{2}{3}
// $$

export default EachChapterStudy1;
