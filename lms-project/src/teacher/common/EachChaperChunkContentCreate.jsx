// EachChaperChunkContentCreate.js - COMPLETE FIXED VERSION WITH HTML STYLING
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { useParams, useNavigate } from "react-router-dom";
import { useCreateLessonMutation } from "../../store/api/MathsLessonApi";
import MermaidRenderer from "./MermaidRenderer";
// CSS Styles
import "katex/dist/katex.min.css";

// HTML Entity Decoder
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
    /&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;|&rsquo;|&mdash;|&ndash;|&copy;|&reg;|&trade;|&euro;|&pound;|&yen;|&cent;|&sect;|&para;|&deg;|&plusmn;|&times;|&divide;|&micro;|&middot;|&bull;|&hellip;|&prime;|&Prime;|&lsquo;|&rsquo;|&ldquo;|&rdquo;|&laquo;|&raquo;|&lsaquo;|&rsquo;|&oline;|&frasl;/g,
    (m) => entities[m] || m,
  );
};

// ✅ CUSTOM SANITIZE SCHEMA - Allow style, class, align attributes
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

const EachChaperChunkContentCreate = ({ teacherId, onSuccess }) => {
  // --- State Management ---
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [preview, setPreview] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [activeToolGroup, setActiveToolGroup] = useState("text"); // 'text', 'math', 'visual'
  const [isMobile, setIsMobile] = useState(false);
  const [fontSize, setFontSize] = useState(100);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { id: chapterId } = useParams();
  const navigate = useNavigate();
  const [createLesson, { isLoading, error }] = useCreateLessonMutation();

  // --- Check if mobile ---
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- Theme Logic ---
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const handler = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener("change", handler);
    return () => darkModeMediaQuery.removeEventListener("change", handler);
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      uploadedImages.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, [uploadedImages]);

  // --- Updated Sample Content with HTML styling examples ---
  const sampleContent = `# 📐 അനുപാതം - ചതുരങ്ങൾ

## 2 : 3 അനുപാതത്തിലുള്ള ചതുരം

<div style="background: #e3f2fd; padding: 1.5rem; border-radius: 1rem; border-left: 5px solid #1976d2; margin: 1rem 0;">
  <p style="font-size: 1.2rem; color: #0d47a1; font-weight: bold;">
    2 cm ഉയരവും 3 cm വീതിയുമുള്ള ഒരു ചതുരം:
  </p>
</div>

\`\`\`mermaid
graph TD
    A[2 cm] --> B[3 cm]
    B --> C[2 cm]
    C --> D[3 cm]
    D --> A
    style A fill:#e1f5fe,stroke:#01579B,stroke-width:2px
    style B fill:#e1f5fe,stroke:#01579B,stroke-width:2px
    style C fill:#e1f5fe,stroke:#01579B,stroke-width:2px
    style D fill:#e1f5fe,stroke:#01579B,stroke-width:2px
\`\`\`

<div style="background: #fff3e0; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; text-align: center;">
  <strong style="color: #e65100;">അനുപാതം:</strong> 
  <span style="font-size: 1.3rem; font-weight: bold; color: #bf360c;">ഉയരം : വീതി = 2 : 3</span>
</div>

## 🧮 ഗണിത സമവാക്യങ്ങൾ

<div style="background: #f5f5f5; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <p align="center" style="font-size: 1.2rem;">
    അനുപാതം കണ്ടെത്താൻ:
  </p>
  
  <p align="center" style="font-size: 1.5rem; background: white; padding: 1rem; border-radius: 0.5rem;">
    $$ \\frac{\\text{ഉയരം}}{\\text{വീതി}} = \\frac{2}{3} $$
  </p>
  
  <p align="center" style="font-size: 1.3rem; color: #1976d2;">
    $$ h = \\frac{2}{3} \\times w $$
  </p>
  
  <p align="center" style="font-size: 1.2rem; border-top: 2px dashed #ccc; padding-top: 1rem;">
    $$ h : w = 2 : 3 $$
  </p>
</div>

---

## 📚 മലയാളം കവിത - HTML Styling Examples

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 1rem; color: white; margin: 2rem 0;">
  <p align="center" style="font-size: 1.5rem; font-style: italic; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
    "സ്വർഗ്ഗത്തേക്കാൾ ഉന്നതമാണ്<br/>മനുഷ്യന്റെ പദവി."
  </p>
  
  <p align="right" style="margin-top: 1rem; font-size: 1.1rem; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 0.5rem;">
    — മുഹമ്മദ് ഇക്‌ബാൽ
  </p>
</div>

<div align="center" style="background: #f3f4f6; padding: 1.5rem; border-radius: 1rem; margin: 1rem 0; border: 2px solid #9c27b0;">
  <p style="font-size: 1.3rem; color: #6a1b9a; font-weight: bold;">
    “വിദ്യയാൽ വരും വിനയം, വിനയാൽ വരും യോഗ്യത”
  </p>
</div>

<details style="background: #e8eaf6; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
  <summary style="font-weight: bold; color: #3f51b5; cursor: pointer;">
    📖 കൂടുതൽ അറിയാൻ (Click)
  </summary>
  <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 0.5rem;">
    <p>അനുപാതം എന്നത് രണ്ട് അളവുകൾ തമ്മിലുള്ള ബന്ധമാണ്.</p>
    <ul style="list-style-type: square;">
      <li>2:3 എന്നാൽ ആദ്യത്തേത് 2 യൂണിറ്റും രണ്ടാമത്തേത് 3 യൂണിറ്റും</li>
      <li>ഇത് 4:6, 6:9 എന്നിങ്ങനെ വികസിപ്പിക്കാം</li>
    </ul>
  </div>
</details>

<marquee behavior="alternate" style="padding: 0.8rem; background: #ffeb3b; border-radius: 2rem; font-weight: bold; margin: 1rem 0;">
  ⭐ അനുപാതം - ഗണിതത്തിന്റെ അടിസ്ഥാനം ⭐
</marquee>

## 📊 ഉദാഹരണ പട്ടിക

<div style="overflow-x: auto; margin: 2rem 0;">
  <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <thead style="background: #1976d2; color: white;">
      <tr>
        <th style="padding: 1rem;">ഉയരം</th>
        <th style="padding: 1rem;">വീതി</th>
        <th style="padding: 1rem;">അനുപാതം</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 1rem; text-align: center;">2 cm</td>
        <td style="padding: 1rem; text-align: center;">3 cm</td>
        <td style="padding: 1rem; text-align: center; font-weight: bold;">2:3</td>
      </tr>
      <tr style="border-bottom: 1px solid #e0e0e0; background: #f5f5f5;">
        <td style="padding: 1rem; text-align: center;">4 cm</td>
        <td style="padding: 1rem; text-align: center;">6 cm</td>
        <td style="padding: 1rem; text-align: center; font-weight: bold;">2:3</td>
      </tr>
      <tr>
        <td style="padding: 1rem; text-align: center;">6 cm</td>
        <td style="padding: 1rem; text-align: center;">9 cm</td>
        <td style="padding: 1rem; text-align: center; font-weight: bold;">2:3</td>
      </tr>
    </tbody>
  </table>
</div>

<div align="right" style="margin-top: 2rem; font-style: italic; border-top: 2px dashed #9e9e9e; padding-top: 1rem;">
  <p>— ഗണിത പാഠപുസ്തകം, ക്ലാസ് 7</p>
</div>`;

  // --- Content Parsing Logic ---
  const extractMermaidCharts = (text) => {
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mermaidRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }
      parts.push({ type: "mermaid", content: match[1].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.substring(lastIndex) });
    }
    return parts;
  };

  // ✅ Enhanced Image Renderer with zoom
  const ImageRenderer = ({ src, alt }) => {
    const [imageError, setImageError] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const blobObj = uploadedImages.find((img) => img.name === src);
    const imageSrc = blobObj ? blobObj.preview : src;

    if (imageError) {
      return (
        <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center border border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            🖼️ ചിത്രം ലഭ്യമല്ല: {alt || src?.split("/").pop() || "Unnamed"}
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="relative group my-4">
          <img
            src={imageSrc}
            alt={alt || "Lesson image"}
            className="rounded-xl shadow-lg max-w-full border border-gray-200 dark:border-gray-700 cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
            onError={() => setImageError(true)}
          />
          {alt && alt !== "Image Description" && (
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic block text-center">
              {alt}
            </span>
          )}
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </button>
        </div>

        {/* Zoom Modal */}
        {isZoomed && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative max-w-5xl max-h-[90vh]">
              <img
                src={imageSrc}
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
            </div>
          </div>
        )}
      </>
    );
  };

  // ✅ COMPLETE Markdown Components with HTML support and font scaling
  const markdownComponents = {
    // HTML elements
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

    // Images with enhanced renderer
    img: ({ src, alt }) => <ImageRenderer src={src} alt={alt} />,

    // Headings with font scaling
    h1: ({ children }) => (
      <h1
        className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 mt-2"
        style={{ fontSize: `${fontSize * 1.5}%` }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2"
        style={{ fontSize: `${fontSize * 1.4}%` }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2"
        style={{ fontSize: `${fontSize * 1.3}%` }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-3 mb-2"
        style={{ fontSize: `${fontSize * 1.2}%` }}
      >
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5
        className="text-base font-medium text-gray-700 dark:text-gray-300 mt-2 mb-1"
        style={{ fontSize: `${fontSize * 1.1}%` }}
      >
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6
        className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 mb-1"
        style={{ fontSize: `${fontSize}%` }}
      >
        {children}
      </h6>
    ),

    // Paragraph with font scaling
    p: ({ children }) => {
      // Check if paragraph contains only an image
      const hasOnlyImage = React.Children.toArray(children).every(
        (child) => React.isValidElement(child) && child.type === "img",
      );

      if (hasOnlyImage) {
        return <>{children}</>;
      }

      return (
        <p
          className="leading-relaxed mb-4 text-gray-700 dark:text-gray-300"
          style={{ fontSize: `${fontSize}%` }}
        >
          {children}
        </p>
      );
    },

    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-gray-700 dark:text-gray-300">{children}</li>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-50 dark:bg-indigo-900/20 italic text-gray-700 dark:text-gray-300 rounded-r-lg">
        {children}
      </blockquote>
    ),

    // Code blocks
    code: ({ inline, className, children }) => {
      const match = /language-(\w+)/.exec(className || "");

      if (!inline && match) {
        return (
          <div className="my-4 rounded-lg overflow-hidden shadow-lg">
            <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 flex justify-between items-center">
              <span>{match[1]}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    String(children).replace(/\n$/, ""),
                  );
                  alert("Copied!");
                }}
                className="hover:text-white"
              >
                📋
              </button>
            </div>
            <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 overflow-x-auto">
              <code className="text-sm font-mono">{children}</code>
            </pre>
          </div>
        );
      }

      return inline ? (
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md text-sm font-mono text-pink-600 dark:text-pink-400">
          {children}
        </code>
      ) : (
        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-xl overflow-x-auto my-4">
          <code className="text-sm font-mono">{children}</code>
        </pre>
      );
    },

    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold border border-gray-300 dark:border-gray-700">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700">
        {children}
      </td>
    ),

    // Links
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        {children}
      </a>
    ),

    // Text formatting
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900 dark:text-white">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-800 dark:text-gray-200">{children}</em>
    ),
    del: ({ children }) => (
      <del className="line-through text-gray-500 dark:text-gray-500">
        {children}
      </del>
    ),
    hr: () => (
      <hr className="my-6 border-t border-gray-300 dark:border-gray-700" />
    ),

    // HTML5 elements
    details: ({ children }) => (
      <details className="my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {children}
      </details>
    ),
    summary: ({ children }) => (
      <summary className="font-semibold cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400">
        {children}
      </summary>
    ),
    figure: ({ children }) => <figure className="my-4">{children}</figure>,
    figcaption: ({ children }) => (
      <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
        {children}
      </figcaption>
    ),

    // Deprecated but useful
    center: ({ children }) => <div className="text-center">{children}</div>,
    font: ({ color, size, face, children }) => (
      <span style={{ color, fontSize: size, fontFamily: face }}>
        {children}
      </span>
    ),
    marquee: ({ children, ...props }) => (
      <marquee
        className="my-4 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded"
        {...props}
      >
        {children}
      </marquee>
    ),
    blink: ({ children }) => <span className="animate-pulse">{children}</span>,
  };

  // --- Tool Groups Configuration (Updated with HTML snippets) ---
  const toolGroups = {
    text: [
      { code: "# ", label: "H1", icon: "H1", description: "Heading 1" },
      { code: "## ", label: "H2", icon: "H2", description: "Heading 2" },
      { code: "### ", label: "H3", icon: "H3", description: "Heading 3" },
      { code: "**Bold**", label: "Bold", icon: "𝐁", description: "Bold text" },
      {
        code: "*Italic*",
        label: "Italic",
        icon: "𝐼",
        description: "Italic text",
      },
      {
        code: "- List item",
        label: "List",
        icon: "•",
        description: "Bullet list",
      },
      {
        code: "1. ",
        label: "Numbered",
        icon: "1.",
        description: "Numbered list",
      },
      { code: "> ", label: "Quote", icon: "❝", description: "Blockquote" },
      {
        code: "---",
        label: "Divider",
        icon: "—",
        description: "Horizontal rule",
      },
      // HTML snippets
      {
        code: '<p style="color: blue; font-size: 1.2rem;">Text</p>',
        label: "Styled P",
        icon: "📝",
        description: "Styled paragraph",
      },
      {
        code: '<div style="background: #f0f0f0; padding: 1rem; border-radius: 0.5rem;">Content</div>',
        label: "Styled Div",
        icon: "📦",
        description: "Styled div",
      },
      {
        code: '<span style="color: red; font-weight: bold;">Text</span>',
        label: "Styled Span",
        icon: "🎨",
        description: "Styled span",
      },
      {
        code: '<p align="center">Centered text</p>',
        label: "Center",
        icon: "⏺️",
        description: "Center align",
      },
      {
        code: '<p align="right">Right text</p>',
        label: "Right",
        icon: "➡️",
        description: "Right align",
      },
      {
        code: "<details><summary>Click</summary>Hidden content</details>",
        label: "Details",
        icon: "🔽",
        description: "Expandable section",
      },
      {
        code: "<marquee>Scrolling text</marquee>",
        label: "Marquee",
        icon: "🎪",
        description: "Scrolling text",
      },
    ],
    math: [
      {
        code: "$\\frac{a}{b}$",
        label: "Fraction",
        icon: "½",
        description: "Fraction a/b",
      },
      { code: "$x^2$", label: "Square", icon: "x²", description: "x squared" },
      {
        code: "$\\sqrt{x}$",
        label: "Root",
        icon: "√",
        description: "Square root",
      },
      {
        code: "$$\\sum_{i=1}^{n} i$$",
        label: "Sum",
        icon: "∑",
        description: "Summation",
      },
      {
        code: "$$\\int_{a}^{b} f(x)dx$$",
        label: "Integral",
        icon: "∫",
        description: "Integral",
      },
      { code: "$\\pi$", label: "Pi", icon: "π", description: "Pi constant" },
      {
        code: "$\\theta$",
        label: "Theta",
        icon: "θ",
        description: "Theta angle",
      },
      {
        code: "$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$",
        label: "Quadratic",
        icon: "🔢",
        description: "Quadratic formula",
      },
    ],
    visual: [
      {
        code: "```mermaid\ngraph TD\n  A[Start] --> B[Process]\n  B --> C[End]\n```\n",
        label: "Flowchart",
        icon: "📊",
        description: "Basic flowchart",
      },
      {
        code: "```mermaid\ngraph TD\n  A[2 cm] --> B[3 cm]\n  B --> C[2 cm]\n  C --> D[3 cm]\n  D --> A\n```\n",
        label: "Rectangle",
        icon: "⬛",
        description: "2:3 ratio rectangle",
      },
      {
        code: "```mermaid\nsequenceDiagram\n  A->>B: Message\n  B-->>A: Response\n```\n",
        label: "Sequence",
        icon: "🔄",
        description: "Sequence diagram",
      },
      {
        code: '```mermaid\npie title Distribution\n  "Category A" : 40\n  "Category B" : 30\n  "Category C" : 30\n```\n',
        label: "Pie Chart",
        icon: "🥧",
        description: "Pie chart",
      },
      {
        code: "```mermaid\ngantt\n  title Project Plan\n  section Section\n  Task A :a1, 2023-01-01, 30d\n  Task B :after a1, 20d\n```\n",
        label: "Gantt",
        icon: "📅",
        description: "Gantt chart",
      },
    ],
  };

  // --- Handlers ---
  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      content.substring(0, start) + text + content.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 10);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      alert("അനുവദനീയമായ ഫയൽ തരങ്ങൾ: JPEG, PNG, GIF, WEBP, SVG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ഫയലിന്റെ വലിപ്പം 5MB ൽ കുറവായിരിക്കണം");
      return;
    }

    setIsUploading(true);

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop();
    const imageName = `img_${timestamp}_${randomStr}.${extension}`;

    const newImage = {
      file,
      name: imageName,
      preview: URL.createObjectURL(file),
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
    };

    setUploadedImages((prev) => [...prev, newImage]);
    insertAtCursor(`\n![Image Description](${imageName})\n`);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    const imageToRemove = uploadedImages[index];

    if (imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    setUploadedImages((prev) => prev.filter((_, i) => i !== index));

    const regex = new RegExp(`!\\[.*?\\]\\(${imageToRemove.name}\\)\\s*`, "g");
    const newContent = content.replace(regex, "");
    setContent(newContent);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("ദയവായി പാഠത്തിന്റെ തലക്കെട്ട് നൽകുക");
      return;
    }

    if (!content.trim()) {
      alert("ദയവായി ഉള്ളടക്കം നൽകുക");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", content);
      formData.append("pageNumber", pageNumber || "1");
      formData.append("chapterId", chapterId);

      if (teacherId) {
        formData.append("teacherId", teacherId);
      }

      uploadedImages.forEach((img) => {
        formData.append("media", img.file);
        formData.append("imageNames", img.name);
      });

      const result = await createLesson(formData).unwrap();

      const saveBtn = document.querySelector(".save-btn");
      if (saveBtn) {
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = "✅ സേവ് ചെയ്തു!";
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
        }, 2000);
      }

      if (onSuccess) {
        onSuccess(result.lessonId);
      }

      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (err) {
      console.error("Save error:", err);
      alert(
        `പിശക്: ${err.data?.error || err.message || "സേവ് ചെയ്യാൻ സാധിച്ചില്ല"}`,
      );
    }
  };

  const insertSampleContent = () => {
    setContent(sampleContent);
    setTitle("അനുപാതം - ചതുരങ്ങൾ");
    setPageNumber("1");
  };

  const clearAll = () => {
    if (window.confirm("എല്ലാം മായ്ക്കണോ? നിങ്ങളുടെ എഴുത്ത് നഷ്ടമാകും.")) {
      setContent("");
      setTitle("");
      setPageNumber("");

      uploadedImages.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      setUploadedImages([]);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        setPreview(!preview);
      }

      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        insertAtCursor("**Bold**");
      }

      if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        insertAtCursor("*Italic*");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, preview]);

  // ==================== RENDER PREVIEW COMPONENT ====================
  const renderPreview = (showTitle = true) => (
    <div style={{ fontSize: `${fontSize}%` }}>
      {showTitle && title && (
        <h1 className="text-3xl font-bold border-b pb-4 mb-6 dark:text-white">
          {title}
        </h1>
      )}

      {extractMermaidCharts(content).map((part, index) =>
        part.type === "mermaid" ? (
          <div key={index} className="my-6">
            <MermaidRenderer chart={part.content} />
          </div>
        ) : (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkMath]}
            rehypePlugins={[
              rehypeRaw,
              [rehypeSanitize, customSanitizeSchema], // ✅ Custom schema for HTML styling
              rehypeKatex,
            ]}
            components={markdownComponents}
          >
            {part.content}
          </ReactMarkdown>
        ),
      )}

      {!content && (
        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 opacity-50 italic">
          <span className="text-6xl mb-4">📄</span>
          <p className="text-lg">Preview will appear here</p>
          <p className="text-sm">
            Start writing in the editor to see the preview
          </p>
        </div>
      )}
    </div>
  );

  // ==================== RENDER EDITOR ====================
  const renderEditor = () => (
    <>
      {/* Title and Page Number */}
      <div className="grid grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Lesson Title..."
          className="col-span-2 p-3 rounded-xl border dark:border-slate-800 dark:bg-slate-900 outline-none focus:ring-2 ring-indigo-500 transition-all backdrop-blur-sm bg-white/50 dark:bg-slate-900/50"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Page #"
          className="p-3 rounded-xl border dark:border-slate-800 dark:bg-slate-900 outline-none focus:ring-2 ring-indigo-500 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50"
          value={pageNumber}
          onChange={(e) => setPageNumber(e.target.value)}
        />
      </div>

      {/* Font Size Controls */}
      <div className="flex items-center justify-end gap-2 mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Font Size:
        </span>
        <button
          onClick={() => setFontSize(Math.max(80, fontSize - 10))}
          className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          A-
        </button>
        <span className="text-sm w-12 text-center dark:text-white">
          {fontSize}%
        </span>
        <button
          onClick={() => setFontSize(Math.min(150, fontSize + 10))}
          className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          A+
        </button>
      </div>

      {/* Modern Toolbar */}
      <div className="flex flex-col gap-2">
        {/* Tool Groups Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveToolGroup("text")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeToolGroup === "text"
                ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            📝 Text
          </button>
          <button
            onClick={() => setActiveToolGroup("math")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeToolGroup === "math"
                ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            🧮 Math
          </button>
          <button
            onClick={() => setActiveToolGroup("visual")}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeToolGroup === "visual"
                ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            📊 Visual
          </button>
        </div>

        {/* Toolbar Actions */}
        <div className="flex flex-wrap gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {/* Image Upload */}
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span>📷</span>
                <span>Image</span>
              </>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={handleImageUpload}
            accept="image/*"
          />

          {/* Sample Button */}
          <button
            onClick={insertSampleContent}
            className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all text-sm font-medium flex items-center gap-2"
          >
            <span>📋</span>
            <span>Sample</span>
          </button>

          {/* Clear Button */}
          <button
            onClick={clearAll}
            className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-sm font-medium flex items-center gap-2"
          >
            <span>🗑️</span>
            <span>Clear</span>
          </button>

          <div className="h-8 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Dynamic Tool Buttons */}
          {toolGroups[activeToolGroup].map((tool, idx) => (
            <button
              key={idx}
              onClick={() => insertAtCursor(tool.code)}
              className="px-3 py-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg text-xs hover:border-indigo-500 dark:hover:border-indigo-400 transition-all flex items-center gap-1.5 shadow-sm"
              title={tool.description}
            >
              <span className="font-medium">{tool.icon}</span>
              <span className="hidden lg:inline">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text Editor */}
      <textarea
        ref={textareaRef}
        className="flex-1 w-full p-4 rounded-2xl border dark:border-slate-800 dark:bg-slate-900 font-mono text-sm resize-none focus:ring-2 ring-indigo-500 outline-none shadow-inner backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 min-h-[400px]"
        placeholder={`Start writing with Markdown, LaTeX, HTML, or Mermaid...

# Heading 1
## Heading 2
**Bold text**
*Italic text*

Math: $\\frac{a}{b}$

HTML with styling:
<div style="background: #f0f0f0; padding: 1rem; border-radius: 0.5rem;">
  Styled content
</div>

<p align="right">— Author</p>

<details><summary>Click to expand</summary>
Hidden content
</details>

<marquee>Scrolling text</marquee>

Mermaid:
\`\`\`mermaid
graph TD
  A-->B
\`\`\`

Images: ![alt](filename.jpg)`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Editor Stats */}
      <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between px-2">
        <span>📝 {content.length} chars</span>
        <span>📁 {uploadedImages.length} images</span>
        <span>💾 Ctrl+S to save</span>
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h4 className="text-sm font-semibold mb-2">📁 Uploaded Images:</h4>
          <div className="flex flex-wrap gap-2">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img.preview}
                  alt={img.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div
      className={`${isDarkMode ? "dark" : ""} transition-colors duration-300`}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-3 md:p-6 text-slate-900 dark:text-slate-100">
        {/* --- Sticky Glassmorphic Header --- */}
        <header className="sticky top-3 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/50 rounded-2xl p-4 mb-6 shadow-xl shadow-indigo-500/5 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
              {title ? title.charAt(0).toUpperCase() : "L"}
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
                Lesson Creator
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {chapterId
                  ? `Chapter ID: ${chapterId.substring(0, 8)}...`
                  : "New Lesson"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* Mobile Preview Toggle */}
            {isMobile && (
              <button
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-medium backdrop-blur-sm border border-slate-300 dark:border-slate-700"
              >
                {showMobilePreview ? "✏️ Edit" : "👁️ Preview"}
              </button>
            )}

            {/* Desktop Preview Toggle */}
            {!isMobile && (
              <button
                onClick={() => setPreview(!preview)}
                className="hidden md:flex px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-medium items-center gap-2 backdrop-blur-sm border border-slate-300 dark:border-slate-700 hover:border-indigo-500 transition-colors"
              >
                <span>{preview ? "✏️" : "👁️"}</span>
                {preview ? "Edit Mode" : "Preview Mode"}
              </button>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="save-btn px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    ></path>
                  </svg>
                  <span className="hidden sm:inline">Publish</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl backdrop-blur-sm">
            <p className="text-red-700 dark:text-red-400 font-medium flex items-center gap-2">
              <span>⚠️</span>
              Error:{" "}
              {error.data?.error || error.message || "Something went wrong"}
            </p>
          </div>
        )}

        {/* Main Content - FULLY RESPONSIVE */}
        <main className="max-w-7xl mx-auto">
          {/* ===== MOBILE VIEW ===== */}
          {isMobile && (
            <div className="md:hidden">
              {showMobilePreview ? (
                /* Mobile Preview */
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h2 className="font-semibold flex items-center gap-2">
                      <span>👁️</span> Live Preview
                    </h2>
                    <span className="text-xs text-slate-500">
                      {uploadedImages.length} images
                    </span>
                  </div>
                  <div className="p-6 prose dark:prose-invert max-w-none overflow-y-auto max-h-[calc(100vh-250px)]">
                    {renderPreview(true)}
                  </div>
                </div>
              ) : (
                /* Mobile Editor */
                <div className="flex flex-col gap-4">{renderEditor()}</div>
              )}
            </div>
          )}

          {/* ===== DESKTOP VIEW ===== */}
          {!isMobile && (
            <div
              className="hidden md:grid md:grid-cols-2 gap-6"
              style={{ minHeight: "calc(100vh - 180px)" }}
            >
              {/* Left Column: Editor */}
              <section className="flex flex-col gap-4 overflow-y-auto pr-2">
                {renderEditor()}
              </section>

              {/* Right Column: Live Preview */}
              <section className="flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h2 className="font-semibold flex items-center gap-2">
                      <span>👁️</span> Live Preview
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-full">
                        {preview ? "Preview Mode" : "Edit Mode"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 prose dark:prose-invert max-w-none">
                    {renderPreview(true)}
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>

        {/* Mobile Action Bar */}
        {isMobile && !showMobilePreview && (
          <div className="fixed bottom-4 left-4 right-4 md:hidden">
            <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800 rounded-2xl p-3 shadow-2xl flex gap-2">
              <button
                onClick={() => fileInputRef.current.click()}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <span>📷</span> Image
              </button>
              <button
                onClick={insertSampleContent}
                className="flex-1 py-3 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <span>📋</span> Sample
              </button>
              <button
                onClick={clearAll}
                className="flex-1 py-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <span>🗑️</span> Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EachChaperChunkContentCreate;
