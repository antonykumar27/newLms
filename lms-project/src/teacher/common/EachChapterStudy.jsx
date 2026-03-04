// EachChapterStudy.js - COMPLETE FIXED VERSION WITH CUSTOM SANITIZE SCHEMA
import React, { useMemo, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  ChevronLeft,
  Trophy,
  Image as ImageIcon,
  Brain,
  Zap,
  AlertCircle,
  ZoomIn,
  Moon,
  Sun,
  Share2,
  Bookmark,
  BarChart3,
  MessageSquare,
  Menu,
  X,
  BookOpen,
  Minus,
  Plus,
  Clock,
  CheckCircle,
  Copy,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "katex/dist/katex.min.css";
import { useAuth } from "../../common/AuthContext";

// RTK APIs
import {
  useGetLessonByIdQuery,
  useUpdateProgressMutation,
} from "../../store/api/MathsLessonApi";
import { useTrackTimeSpentProgressMutation } from "../../store/api/ProgressApi";

import EnhancedVideoPlayer from "./videoPlayer/EnhancedVideoPlayer";

// ✅ CUSTOM SANITIZE SCHEMA - Allow ALL styling attributes
const customSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,

    // Allow style, class, align for ALL elements
    "*": [
      ...(defaultSchema.attributes["*"] || []),
      "style",
      "className",
      "class",
      "align",
      "width",
      "height",
      "bgcolor",
      "border",
      "cellpadding",
      "cellspacing",
    ],

    // Div elements
    div: [
      ...(defaultSchema.attributes?.div || []),
      "style",
      "class",
      "className",
      "align",
      "id",
      "data-*",
    ],

    // Paragraph
    p: [
      ...(defaultSchema.attributes?.p || []),
      "style",
      "class",
      "align",
      "id",
    ],

    // Span
    span: [...(defaultSchema.attributes?.span || []), "style", "class", "id"],

    // Headings
    h1: [...(defaultSchema.attributes?.h1 || []), "style", "class", "align"],
    h2: [...(defaultSchema.attributes?.h2 || []), "style", "class", "align"],
    h3: [...(defaultSchema.attributes?.h3 || []), "style", "class", "align"],
    h4: [...(defaultSchema.attributes?.h4 || []), "style", "class", "align"],
    h5: [...(defaultSchema.attributes?.h5 || []), "style", "class", "align"],
    h6: [...(defaultSchema.attributes?.h6 || []), "style", "class", "align"],

    // Tables
    table: [
      ...(defaultSchema.attributes?.table || []),
      "style",
      "class",
      "border",
      "cellpadding",
      "cellspacing",
      "width",
    ],
    td: [
      ...(defaultSchema.attributes?.td || []),
      "style",
      "class",
      "colspan",
      "rowspan",
      "width",
      "bgcolor",
    ],
    th: [
      ...(defaultSchema.attributes?.th || []),
      "style",
      "class",
      "colspan",
      "rowspan",
      "width",
      "bgcolor",
    ],
    tr: [...(defaultSchema.attributes?.tr || []), "style", "class", "bgcolor"],

    // Images
    img: [
      ...(defaultSchema.attributes?.img || []),
      "style",
      "class",
      "width",
      "height",
      "align",
    ],

    // Lists
    ul: [...(defaultSchema.attributes?.ul || []), "style", "class"],
    ol: [...(defaultSchema.attributes?.ol || []), "style", "class"],
    li: [...(defaultSchema.attributes?.li || []), "style", "class"],

    // Links
    a: [
      ...(defaultSchema.attributes?.a || []),
      "style",
      "class",
      "target",
      "rel",
    ],

    // Blockquotes
    blockquote: [
      ...(defaultSchema.attributes?.blockquote || []),
      "style",
      "class",
    ],

    // Code blocks
    pre: [...(defaultSchema.attributes?.pre || []), "style", "class"],
    code: [...(defaultSchema.attributes?.code || []), "style", "class"],

    // HTML5 elements
    details: [...(defaultSchema.attributes?.details || []), "style", "class"],
    summary: [...(defaultSchema.attributes?.summary || []), "style", "class"],
    figure: [...(defaultSchema.attributes?.figure || []), "style", "class"],
    figcaption: [
      ...(defaultSchema.attributes?.figcaption || []),
      "style",
      "class",
    ],

    // Media
    iframe: [
      ...(defaultSchema.attributes?.iframe || []),
      "style",
      "class",
      "width",
      "height",
      "allow",
      "allowfullscreen",
    ],
    video: [
      ...(defaultSchema.attributes?.video || []),
      "style",
      "class",
      "width",
      "height",
      "controls",
      "autoplay",
      "loop",
      "muted",
    ],
    audio: [
      ...(defaultSchema.attributes?.audio || []),
      "style",
      "class",
      "controls",
      "autoplay",
      "loop",
    ],

    // Deprecated but useful
    center: [...(defaultSchema.attributes?.center || []), "style", "class"],
    font: [
      ...(defaultSchema.attributes?.font || []),
      "style",
      "class",
      "color",
      "size",
      "face",
    ],
    marquee: [
      ...(defaultSchema.attributes?.marquee || []),
      "style",
      "class",
      "behavior",
      "direction",
      "scrollamount",
    ],
    blink: [...(defaultSchema.attributes?.blink || []), "style", "class"],
  },

  // Allow these tag names
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "center",
    "font",
    "marquee",
    "blink",
    "details",
    "summary",
    "figure",
    "figcaption",
    "iframe",
    "video",
    "audio",
  ],
};

// --- HTML Entity Decoder ---
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
    "&mdash;": "—",
    "&ndash;": "–",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&euro;": "€",
    "&pound;": "£",
    "&yen;": "¥",
    "&cent;": "¢",
    "&sect;": "§",
    "&para;": "¶",
    "&deg;": "°",
    "&plusmn;": "±",
    "&times;": "×",
    "&divide;": "÷",
    "&micro;": "µ",
    "&middot;": "·",
    "&bull;": "•",
    "&hellip;": "…",
    "&prime;": "′",
    "&Prime;": "″",
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&laquo;": "«",
    "&raquo;": "»",
    "&lsaquo;": "‹",
    "&rsaquo;": "›",
    "&oline;": "‾",
    "&frasl;": "/",
  };
  return text.replace(
    /&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;|&rsquo;|&mdash;|&ndash;|&copy;|&reg;|&trade;|&euro;|&pound;|&yen;|&cent;|&sect;|&para;|&deg;|&plusmn;|&times;|&divide;|&micro;|&middot;|&bull;|&hellip;|&prime;|&Prime;|&lsquo;|&rsquo;|&ldquo;|&rdquo;|&laquo;|&raquo;|&lsaquo;|&rsaquo;|&oline;|&frasl;/g,
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

  const scrollScore = (scrollDepth / 100) * 0.4;
  const timeRatio = Math.min(timeSpent / expectedTime, 1.5);
  const timeScore = Math.min(timeRatio, 1) * 0.3;

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

// ✅ Enhanced Image Renderer with styling
const EnhancedImage = ({
  src,
  alt,
  lessonData,
  className,
  style,
  ...props
}) => {
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
    imageUrl = matchingMedia.url;
  } else if (!src?.startsWith("http")) {
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
    <>
      <motion.figure
        whileHover={{ scale: 1.01 }}
        className="my-10 overflow-hidden rounded-3xl border-4 border-white dark:border-slate-800 shadow-2xl"
        style={style}
      >
        <div
          className="relative group cursor-pointer"
          onClick={() => setIsZoomed(true)}
        >
          <img
            src={imageUrl}
            alt={alt || "Lesson image"}
            className={`w-full object-cover ${className || ""}`}
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
      </motion.figure>

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
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
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
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
  const chapterId = lessonData?.lesson?.chapterId;
  const subjectId = lessonData?.subjectId;
  const currentSubject = lessonData;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // State
  const [isMarkedCompleted, setIsMarkedCompleted] = useState(false);
  const [completionType, setCompletionType] = useState(null);
  const [showEngagementStats, setShowEngagementStats] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [readingMode, setReadingMode] = useState(false);

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

  // ✅ Markdown Components with FULL HTML SUPPORT and CUSTOM SCHEMA
  const MarkdownComponents = useMemo(
    () => ({
      // HTML elements with full styling support
      div: ({ node, className, children, ...props }) => (
        <div className={className} {...props}>
          {children}
        </div>
      ),

      span: ({ node, className, children, ...props }) => (
        <span className={className} {...props}>
          {children}
        </span>
      ),

      p: ({ node, children, ...props }) => {
        const hasOnlyImage = React.Children.toArray(children).every(
          (child) =>
            child?.type === "img" ||
            child?.props?.src ||
            child?.type === "figure" ||
            child?.props?.className?.includes("image-container"),
        );

        if (hasOnlyImage) {
          return <>{children}</>;
        }

        return (
          <p
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium"
            style={{ fontSize: `${fontSize}%` }}
            {...props}
          >
            {children}
          </p>
        );
      },

      // Enhanced Images with styling
      img: ({ node, src, alt, className, style, ...props }) => (
        <EnhancedImage
          src={src}
          alt={alt}
          lessonData={lessonData}
          className={className}
          style={style}
          {...props}
        />
      ),

      // Headings with font scaling
      h1: ({ node, children, className, style, ...props }) => (
        <h1
          className={`text-4xl md:text-6xl font-black mb-8 dark:text-white leading-tight ${className || ""}`}
          style={{ fontSize: `${fontSize * 1.5}%`, ...style }}
          {...props}
        >
          {children}
          <span className="text-blue-600">.</span>
        </h1>
      ),

      h2: ({ node, children, className, style, ...props }) => (
        <h2
          className={`text-2xl md:text-3xl font-bold mt-12 mb-6 dark:text-slate-100 flex items-center gap-3 ${className || ""}`}
          style={{ fontSize: `${fontSize * 1.3}%`, ...style }}
          {...props}
        >
          <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block" />
          {children}
        </h2>
      ),

      h3: ({ node, children, className, style, ...props }) => (
        <h3
          className={`text-xl md:text-2xl font-semibold mt-8 mb-3 dark:text-slate-200 ${className || ""}`}
          style={{ fontSize: `${fontSize * 1.2}%`, ...style }}
          {...props}
        >
          {children}
        </h3>
      ),

      h4: ({ node, children, className, style, ...props }) => (
        <h4
          className={`text-lg md:text-xl font-medium mt-6 mb-2 dark:text-slate-300 ${className || ""}`}
          style={{ fontSize: `${fontSize * 1.1}%`, ...style }}
          {...props}
        >
          {children}
        </h4>
      ),

      h5: ({ node, children, className, style, ...props }) => (
        <h5
          className={`text-base md:text-lg font-medium mt-4 mb-2 dark:text-slate-300 ${className || ""}`}
          style={{ fontSize: `${fontSize}%`, ...style }}
          {...props}
        >
          {children}
        </h5>
      ),

      h6: ({ node, children, className, style, ...props }) => (
        <h6
          className={`text-sm md:text-base font-medium mt-4 mb-2 dark:text-slate-400 ${className || ""}`}
          style={{ fontSize: `${fontSize * 0.9}%`, ...style }}
          {...props}
        >
          {children}
        </h6>
      ),

      // Lists
      ul: ({ node, children, className, style, ...props }) => (
        <ul
          className={`space-y-3 mb-6 ml-4 list-none ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </ul>
      ),

      ol: ({ node, children, className, style, ...props }) => (
        <ol
          className={`space-y-3 mb-6 ml-4 list-decimal marker:text-blue-500 dark:marker:text-blue-400 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </ol>
      ),

      li: ({ node, children, className, style, ...props }) => (
        <li
          className={`flex items-start gap-3 text-slate-700 dark:text-slate-300 text-lg ${className || ""}`}
          style={{ fontSize: `${fontSize}%`, ...style }}
          {...props}
        >
          <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          <span className="flex-1">{children}</span>
        </li>
      ),

      // Blockquotes with animation
      blockquote: ({ node, children, className, style, ...props }) => (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`border-l-4 border-blue-500 bg-blue-50/80 dark:bg-blue-950/30 backdrop-blur-sm p-6 rounded-r-2xl my-8 italic text-slate-700 dark:text-slate-300 shadow-sm ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </motion.div>
      ),

      // Code blocks
      code: ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "");

        if (!inline && match) {
          return (
            <div className="my-8 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span>{match[1]}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      String(children).replace(/\n$/, ""),
                    );
                    toast.success("Copied to clipboard!");
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <Copy size={14} />
                </button>
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
          <code
            className={`bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md font-bold ${className || ""}`}
            {...props}
          >
            {children}
          </code>
        );
      },

      // Tables
      table: ({ node, children, className, style, ...props }) => (
        <div className="overflow-x-auto my-8">
          <table
            className={`min-w-full border-collapse border border-slate-200 dark:border-slate-700 ${className || ""}`}
            style={style}
            {...props}
          >
            {children}
          </table>
        </div>
      ),

      thead: ({ node, children, className, style, ...props }) => (
        <thead
          className={`bg-slate-50 dark:bg-slate-800 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </thead>
      ),

      tbody: ({ node, children, className, style, ...props }) => (
        <tbody
          className={`divide-y divide-slate-200 dark:divide-slate-700 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </tbody>
      ),

      tr: ({ node, children, className, style, ...props }) => (
        <tr
          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </tr>
      ),

      th: ({ node, children, className, style, ...props }) => (
        <th
          className={`border border-slate-200 dark:border-slate-700 px-4 py-3 text-left font-semibold dark:text-white ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </th>
      ),

      td: ({ node, children, className, style, ...props }) => (
        <td
          className={`border border-slate-200 dark:border-slate-700 px-4 py-3 dark:text-slate-300 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </td>
      ),

      // Horizontal rule
      hr: ({ node, className, style, ...props }) => (
        <hr
          className={`my-8 border-t-2 border-slate-200 dark:border-slate-700 ${className || ""}`}
          style={style}
          {...props}
        />
      ),

      // Links
      a: ({ node, href, children, className, style, ...props }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </a>
      ),

      // Text formatting
      strong: ({ node, children, className, style, ...props }) => (
        <strong
          className={`font-bold text-slate-900 dark:text-white ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </strong>
      ),

      em: ({ node, children, className, style, ...props }) => (
        <em
          className={`italic text-slate-700 dark:text-slate-300 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </em>
      ),

      del: ({ node, children, className, style, ...props }) => (
        <del
          className={`line-through text-slate-500 dark:text-slate-500 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </del>
      ),

      ins: ({ node, children, className, style, ...props }) => (
        <ins
          className={`underline decoration-slate-500 dark:decoration-slate-400 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </ins>
      ),

      mark: ({ node, children, className, style, ...props }) => (
        <mark
          className={`bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </mark>
      ),

      sub: ({ node, children, className, style, ...props }) => (
        <sub className={`text-sm ${className || ""}`} style={style} {...props}>
          {children}
        </sub>
      ),

      sup: ({ node, children, className, style, ...props }) => (
        <sup className={`text-sm ${className || ""}`} style={style} {...props}>
          {children}
        </sup>
      ),

      // Details/Summary
      details: ({ node, children, className, style, ...props }) => (
        <details
          className={`my-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </details>
      ),

      summary: ({ node, children, className, style, ...props }) => (
        <summary
          className={`font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </summary>
      ),

      // Definition List
      dl: ({ node, children, className, style, ...props }) => (
        <dl
          className={`my-4 grid grid-cols-1 gap-2 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </dl>
      ),

      dt: ({ node, children, className, style, ...props }) => (
        <dt
          className={`font-semibold dark:text-white ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </dt>
      ),

      dd: ({ node, children, className, style, ...props }) => (
        <dd
          className={`ml-4 text-slate-600 dark:text-slate-400 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </dd>
      ),

      // Figure
      figure: ({ node, children, className, style, ...props }) => (
        <figure className={`my-8 ${className || ""}`} style={style} {...props}>
          {children}
        </figure>
      ),

      figcaption: ({ node, children, className, style, ...props }) => (
        <figcaption
          className={`text-center text-sm text-slate-500 dark:text-slate-400 mt-2 ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </figcaption>
      ),

      // Iframe
      iframe: ({ node, src, title, className, style, ...props }) => (
        <div
          className="my-8 relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-2xl"
          style={style}
        >
          <iframe
            src={src}
            title={title || "Embedded content"}
            className={`absolute top-0 left-0 w-full h-full ${className || ""}`}
            allowFullScreen
            {...props}
          />
        </div>
      ),

      // Video
      video: ({ node, src, className, style, ...props }) => (
        <div
          className="my-8 rounded-2xl overflow-hidden shadow-2xl"
          style={style}
        >
          <video
            src={src}
            controls
            className={`w-full ${className || ""}`}
            {...props}
          />
        </div>
      ),

      // Audio
      audio: ({ node, src, className, style, ...props }) => (
        <div
          className={`my-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl ${className || ""}`}
          style={style}
        >
          <audio src={src} controls className="w-full" {...props} />
        </div>
      ),

      // Canvas
      canvas: ({ node, className, style, ...props }) => (
        <canvas
          className={`my-4 border border-slate-200 dark:border-slate-700 rounded-xl ${className || ""}`}
          style={style}
          {...props}
        />
      ),

      // SVG
      svg: ({ node, className, style, ...props }) => (
        <svg className={`my-4 ${className || ""}`} style={style} {...props} />
      ),

      // Center
      center: ({ node, children, className, style, ...props }) => (
        <div
          className={`text-center ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </div>
      ),

      // Font
      font: ({
        node,
        color,
        size,
        face,
        children,
        className,
        style,
        ...props
      }) => (
        <span
          style={{
            color: color,
            fontSize: size,
            fontFamily: face,
            ...style,
          }}
          className={className}
          {...props}
        >
          {children}
        </span>
      ),

      // Marquee
      marquee: ({ node, children, className, style, ...props }) => (
        <marquee
          className={`my-4 p-2 bg-slate-100 dark:bg-slate-800 rounded ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </marquee>
      ),

      // Blink
      blink: ({ node, children, className, style, ...props }) => (
        <span
          className={`animate-pulse ${className || ""}`}
          style={style}
          {...props}
        >
          {children}
        </span>
      ),
    }),
    [lessonData, isDarkMode, fontSize],
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

  const calculateAttentionScore = (scrollPattern) => {
    if (scrollPattern.length < 3) return 0.5;
    return 0.7;
  };

  // Process content
  const processedContent = useMemo(() => {
    if (!lessonData?.lesson?.content) return "";
    let content = decodeHTMLEntities(lessonData.lesson.content);
    content = content.replace(/\\\\/g, "\\");
    return content.trim();
  }, [lessonData]);

  // Loading and Error states
  if (isLoading) return <LoadingPulse />;
  if (error) return <ErrorUI onRetry={refetch} />;

  const lesson = lessonData?.lesson;

  return (
    <div
      className={`h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300 ${
        readingMode ? "reading-mode" : ""
      }`}
    >
      {/* Reading Mode Toggle */}
      {readingMode && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setReadingMode(false)}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <X size={20} className="text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-50 origin-left"
        style={{ scaleX }}
      />

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
        className="flex-1 overflow-y-auto pt-20 pb-20 px-4 scroll-smooth"
      >
        <div
          className={`max-w-4xl mx-auto transition-all duration-300 ${
            readingMode ? "max-w-2xl" : ""
          }`}
        >
          {/* Header Bento Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="relative p-8 bg-indigo-600 rounded-[2rem] text-white flex flex-col justify-between min-h-[220px] shadow-xl">
              <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="absolute top-6 right-6 opacity-20">
                <BarChart3 size={28} />
              </div>
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

          {/* Main Content Card - WITH CUSTOM SANITIZE SCHEMA */}
          <article
            className={`prose dark:prose-invert max-w-none mb-12 ${
              readingMode ? "prose-lg" : ""
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[
                rehypeRaw,
                [rehypeSanitize, customSanitizeSchema], // ✅ CUSTOM SCHEMA for styling
                rehypeKatex,
              ]}
              components={MarkdownComponents}
            >
              {processedContent}
            </ReactMarkdown>
          </article>

          {/* Engagement Stats Panel */}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div>
                    <p className="text-sm text-slate-500">Confidence</p>
                    <p className="text-2xl font-bold dark:text-white">
                      {(confidenceScore * 100).toFixed(0)}%
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

          {/* Learning Tip */}
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

      {/* Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t dark:border-slate-800 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2 md:py-3">
            {/* Left Section */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title={isDarkMode ? "Light mode" : "Dark mode"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={() => setReadingMode(!readingMode)}
                className={`p-2 md:p-3 rounded-xl transition-all ${
                  readingMode
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="Reading mode"
              >
                <BookOpen size={20} />
              </button>

              {/* Font Size Controls */}
              <div className="hidden md:flex items-center gap-1 ml-2 border-l pl-2 border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm w-12 text-center">{fontSize}%</span>
                <button
                  onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Center Section */}
            {isMobile ? (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"
              >
                <Menu size={20} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEngagementStats(!showEngagementStats)}
                  className={`p-2 md:p-3 rounded-xl transition-all ${
                    showEngagementStats
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title="Engagement stats"
                >
                  <BarChart3 size={20} />
                </button>
                <button
                  className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  title="Bookmark"
                >
                  <Bookmark size={20} />
                </button>
                <button
                  className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  title="Share"
                >
                  <Share2 size={20} />
                </button>
                <button
                  className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  title="Discussion"
                >
                  <MessageSquare size={20} />
                </button>
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {isMarkedCompleted ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium hidden md:inline">
                    Completed
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Clock size={18} />
                  <span className="text-sm font-medium hidden md:inline">
                    In Progress
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobile && showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="py-4 grid grid-cols-4 gap-2 border-t dark:border-slate-800">
                  <button
                    onClick={() => setShowEngagementStats(!showEngagementStats)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <BarChart3 size={20} />
                    <span className="text-xs">Stats</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Bookmark size={20} />
                    <span className="text-xs">Bookmark</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Share2 size={20} />
                    <span className="text-xs">Share</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                    <MessageSquare size={20} />
                    <span className="text-xs">Discuss</span>
                  </button>
                </div>

                {/* Mobile Font Controls */}
                <div className="py-4 border-t dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Text Size</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm w-12 text-center">
                        {fontSize}%
                      </span>
                      <button
                        onClick={() =>
                          setFontSize(Math.min(150, fontSize + 10))
                        }
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Engagement Tracker Hook ---
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
