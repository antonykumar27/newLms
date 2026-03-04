// EachChaperChunkContentCreate.js
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useParams, useNavigate } from "react-router-dom";
import { useCreateLessonMutation } from "../../store/api/MathsLessonApi";
import MermaidRenderer from "./MermaidRenderer";

// CSS Styles
import "katex/dist/katex.min.css";

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

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { id: chapterId } = useParams();
  const navigate = useNavigate();
  const [createLesson, { isLoading, error }] = useCreateLessonMutation();

  // --- Theme Logic ---
  useEffect(() => {
    // Check system preference
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    // Listen for changes
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

  // --- Sample Content ---
  const sampleContent = `# അനുപാതം - ചതുരങ്ങൾ

## 2 : 3 അനുപാതത്തിലുള്ള ചതുരം

2 cm ഉയരവും 3 cm വീതിയുമുള്ള ഒരു ചതുരം:

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

**അനുപാതം:** ഉയരം : വീതി = 2 : 3

## ഗണിത സമവാക്യങ്ങൾ

അനുപാതം കണ്ടെത്താൻ:

$$ \\frac{\\text{ഉയരം}}{\\text{വീതി}} = \\frac{2}{3} $$

$$ h = \\frac{2}{3} \\times w $$

$$ h : w = 2 : 3 $$`;

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

  // --- Custom Markdown Components with proper image handling ---
  const markdownComponents = {
    img: ({ src, alt }) => {
      // Check if this is an uploaded image (by name) or external URL
      const blobObj = uploadedImages.find((img) => img.name === src);
      const imageSrc = blobObj ? blobObj.preview : src;

      return (
        <div className="my-6 flex flex-col items-center">
          <img
            src={imageSrc}
            alt={alt || "Lesson image"}
            className="rounded-xl shadow-lg max-w-full border border-gray-200 dark:border-gray-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/400x300?text=Image+not+found";
            }}
          />
          {alt && alt !== "Image Description" && (
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
              {alt}
            </span>
          )}
        </div>
      );
    },
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 mt-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
        {children}
      </p>
    ),
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
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-50 dark:bg-indigo-900/20 italic text-gray-700 dark:text-gray-300 rounded-r-lg">
        {children}
      </blockquote>
    ),
    code: ({ inline, children }) => {
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
  };

  // --- Tool Groups Configuration ---
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

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 10);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
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

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("ഫയലിന്റെ വലിപ്പം 5MB ൽ കുറവായിരിക്കണം");
      return;
    }

    setIsUploading(true);

    // Create unique filename
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

    // Insert markdown image syntax with proper description placeholder
    insertAtCursor(`\n![Image Description](${imageName})\n`);

    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    const imageToRemove = uploadedImages[index];

    // Revoke object URL to free memory
    if (imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    // Remove from state
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));

    // Remove image references from content
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

      // Append basic fields
      formData.append("title", title);
      formData.append("content", content);
      formData.append("pageNumber", pageNumber || "1");
      formData.append("chapterId", chapterId);

      if (teacherId) {
        formData.append("teacherId", teacherId);
      }

      // Append images
      uploadedImages.forEach((img) => {
        formData.append("media", img.file);
        formData.append("imageNames", img.name);
      });

      const result = await createLesson(formData).unwrap();

      // Show success message
      const saveBtn = document.querySelector(".save-btn");
      if (saveBtn) {
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = "✅ സേവ് ചെയ്തു!";
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
        }, 2000);
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result.lessonId);
      }

      // Navigate back
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

      // Cleanup image URLs
      uploadedImages.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      setUploadedImages([]);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S to save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      // Ctrl+P to toggle preview
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        setPreview(!preview);
      }

      // Ctrl+B for bold
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        insertAtCursor("**Bold**");
      }

      // Ctrl+I for italic
      if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        insertAtCursor("*Italic*");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, preview]);

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
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-medium md:hidden backdrop-blur-sm border border-slate-300 dark:border-slate-700"
            >
              {showMobilePreview ? "✏️ Edit" : "👁️ Preview"}
            </button>

            {/* Desktop Preview Toggle */}
            <button
              onClick={() => setPreview(!preview)}
              className="hidden md:flex px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-medium items-center gap-2 backdrop-blur-sm border border-slate-300 dark:border-slate-700 hover:border-indigo-500 transition-colors"
            >
              <span>{preview ? "✏️" : "👁️"}</span>
              {preview ? "Edit Mode" : "Preview Mode"}
            </button>

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

        {/* Main Content - Responsive Grid */}
        <main className="max-w-7xl mx-auto">
          {/* Mobile View - Toggle between Editor and Preview */}
          <div className="md:hidden">
            {showMobilePreview ? (
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
                  {title && <h1 className="border-b pb-4 mb-6">{title}</h1>}
                  {extractMermaidCharts(content).map((part, index) =>
                    part.type === "mermaid" ? (
                      <MermaidRenderer key={index} chart={part.content} />
                    ) : (
                      <ReactMarkdown
                        key={index}
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={markdownComponents}
                      >
                        {part.content}
                      </ReactMarkdown>
                    ),
                  )}
                  {!content && (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 opacity-50 italic">
                      <span className="text-4xl mb-2">📄</span>
                      Preview will appear here
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Mobile Editor */
              <div className="flex flex-col gap-4">
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
                    placeholder="Pg #"
                    className="p-3 rounded-xl border dark:border-slate-800 dark:bg-slate-900 outline-none focus:ring-2 ring-indigo-500 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50"
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                  />
                </div>

                {/* Editor */}
                <textarea
                  ref={textareaRef}
                  className="w-full h-[400px] p-4 rounded-2xl border dark:border-slate-800 dark:bg-slate-900 font-mono text-sm resize-none focus:ring-2 ring-indigo-500 outline-none shadow-inner backdrop-blur-sm bg-white/50 dark:bg-slate-900/50"
                  placeholder="Start writing with Markdown, LaTeX, or Mermaid..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Desktop View - Side by Side */}
          <div className="hidden md:grid md:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
            {/* Left Column: Editor */}
            <section className="flex flex-col gap-4 overflow-hidden">
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
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
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

                  {/* Dynamic Tool Buttons based on active group */}
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
                className="flex-1 w-full p-4 rounded-2xl border dark:border-slate-800 dark:bg-slate-900 font-mono text-sm resize-none focus:ring-2 ring-indigo-500 outline-none shadow-inner backdrop-blur-sm bg-white/50 dark:bg-slate-900/50"
                placeholder={`Start writing with Markdown, LaTeX, or Mermaid...

# Heading 1
## Heading 2
**Bold text**
*Italic text*

Math: $\\frac{a}{b}$

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
                  {title && <h1 className="border-b pb-4 mb-6">{title}</h1>}
                  {extractMermaidCharts(content).map((part, index) =>
                    part.type === "mermaid" ? (
                      <div key={index} className="my-6">
                        <MermaidRenderer chart={part.content} />
                      </div>
                    ) : (
                      <ReactMarkdown
                        key={index}
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
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
              </div>
            </section>
          </div>
        </main>

        {/* Mobile Action Bar */}
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
      </div>
    </div>
  );
};

export default EachChaperChunkContentCreate;

// // EachChaperChunkContentCreate.js
// import React, { useState, useRef } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";

// import "katex/dist/katex.min.css";
// import { useCreateLessonMutation } from "../../store/api/MathsLessonApi";
// import { useParams, useNavigate } from "react-router-dom";
// import MermaidRenderer from "./MermaidRenderer"; // Mermaid കമ്പോണന്റ് ഇറക്കുമതി ചെയ്യുക

// const EachChaperChunkContentCreate = ({ teacherId, onSuccess }) => {
//   const [content, setContent] = useState("");
//   const [preview, setPreview] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const textareaRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const [pageNumber, setPageNumber] = useState(null);
//   const [title, setTitle] = useState("");
//   const [createLesson, { isLoading, error }] = useCreateLessonMutation();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const chapterId = id;
//   console.log("content", content);
//   // Mermaid കോഡ് തിരിച്ചറിയാനുള്ള ഫംഗ്ഷൻ
//   const extractMermaidCharts = (content) => {
//     const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;
//     const parts = [];
//     let lastIndex = 0;
//     let match;

//     while ((match = mermaidRegex.exec(content)) !== null) {
//       // മുമ്പത്തെ ടെക്സ്റ്റ് ചേർക്കുക
//       if (match.index > lastIndex) {
//         parts.push({
//           type: "text",
//           content: content.substring(lastIndex, match.index),
//         });
//       }

//       // Mermaid ചാർട്ട് ചേർക്കുക
//       parts.push({
//         type: "mermaid",
//         content: match[1].trim(),
//       });

//       lastIndex = match.index + match[0].length;
//     }

//     // ബാക്കിയുള്ള ടെക്സ്റ്റ് ചേർക്കുക
//     if (lastIndex < content.length) {
//       parts.push({
//         type: "text",
//         content: content.substring(lastIndex),
//       });
//     }

//     return parts;
//   };

//   // Markdown + Math + Mermaid snippets
//   const snippets = [
//     // Headings
//     { code: "# ", label: "H1 Heading", icon: "H1" },
//     { code: "## ", label: "H2 Heading", icon: "H2" },
//     { code: "### ", label: "H3 Heading", icon: "H3" },
//     { code: "#### ", label: "H4 Heading", icon: "H4" },
//     { code: "##### ", label: "H5 Heading", icon: "H5" },
//     { code: "###### ", label: "H6 Heading", icon: "H6" },

//     // Math snippets
//     { code: "$\n\\frac{a}{b}\n$", label: "ഭിന്നസംഖ്യ", icon: "½" },
//     { code: "$\nx^{2}\n$", label: "വർഗം", icon: "x²" },
//     { code: "$\n\\sqrt{x}\n$", label: "വർഗമൂലം", icon: "√" },
//     { code: "$$\n\\sum_{i=1}^{n} i\n$$", label: "സംഗ്രഹം", icon: "∑" },
//     { code: "$$\n\\int_{a}^{b} f(x)\\,dx\n$$", label: "ഇന്റഗ്രൽ", icon: "∫" },
//     {
//       code: "$$\n\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$",
//       label: "Quadratic",
//       icon: "🔢",
//     },

//     // Formatting
//     { code: "**bold text**", label: "Bold", icon: "𝐁" },
//     { code: "*italic text*", label: "Italic", icon: "𝐼" },
//     { code: "- List item", label: "List", icon: "•" },
//     { code: "1. Numbered", label: "Numbered List", icon: "1." },
//     { code: "> Quote", label: "Quote", icon: "❝" },

//     // Mermaid snippets - Rectangle diagrams for ratio
//     {
//       code: "```mermaid\ngraph TD\n    A[2 cm] --> B[3 cm]\n    B --> C[2 cm]\n    C --> D[3 cm]\n    D --> A\n    style A fill:#e1f5fe,stroke:#01579B,stroke-width:2px\n    style B fill:#e1f5fe,stroke:#01579B,stroke-width:2px\n    style C fill:#e1f5fe,stroke:#01579B,stroke-width:2px\n    style D fill:#e1f5fe,stroke:#01579B,stroke-width:2px\n```\n",
//       label: "Rectangle 2:3",
//       icon: "⬛",
//     },
//     {
//       code: "```mermaid\ngraph TD\n    subgraph Rectangle [2 : 3 Ratio]\n        A[Height: 2k] --> B[Width: 3k]\n        B --> C[Height: 2k]\n        C --> D[Width: 3k]\n        D --> A\n    end\n    style A fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n    style B fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n    style C fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n    style D fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n```\n",
//       label: "Ratio Rectangle",
//       icon: "📐",
//     },
//     {
//       code: "```mermaid\ngraph LR\n    A[4 cm] --> B[6 cm]\n    B --> C[4 cm]\n    C --> D[6 cm]\n    D --> A\n    style A fill:#FFB6C1,stroke:#FF1493,stroke-width:2px\n    style B fill:#FFB6C1,stroke:#FF1493,stroke-width:2px\n    style C fill:#FFB6C1,stroke:#FF1493,stroke-width:2px\n    style D fill:#FFB6C1,stroke:#FF1493,stroke-width:2px\n```\n",
//       label: "Rectangle 4:6",
//       icon: "🔲",
//     },
//     {
//       code: "```mermaid\ngraph TD\n    subgraph Comparison [Two Rectangles]\n        A[2 cm] --> B[3 cm]\n        B --> C[2 cm]\n        C --> D[3 cm]\n        D --> A\n        \n        E[4 cm] --> F[6 cm]\n        F --> G[4 cm]\n        G --> H[6 cm]\n        H --> E\n    end\n    style A fill:#FFD700,stroke:#B8860B,stroke-width:2px\n    style B fill:#FFD700,stroke:#B8860B,stroke-width:2px\n    style C fill:#FFD700,stroke:#B8860B,stroke-width:2px\n    style D fill:#FFD700,stroke:#B8860B,stroke-width:2px\n    style E fill:#98FB98,stroke:#006400,stroke-width:2px\n    style F fill:#98FB98,stroke:#006400,stroke-width:2px\n    style G fill:#98FB98,stroke:#006400,stroke-width:2px\n    style H fill:#98FB98,stroke:#006400,stroke-width:2px\n```\n",
//       label: "Two Rectangles",
//       icon: "🔳",
//     },
//     {
//       code: '```mermaid\npie title Rectangle Ratios\n    "2:3 Ratio" : 40\n    "3:4 Ratio" : 30\n    "1:2 Ratio" : 20\n    "Other" : 10\n```\n',
//       label: "Pie Chart",
//       icon: "🥧",
//     },
//     {
//       code: "```mermaid\nsequenceDiagram\n    Student->>Teacher: What is 2:3 ratio?\n    Teacher-->>Student: Height is 2/3 of width\n    Student->>Rectangle: Draw 4cm x 6cm\n    Rectangle-->>Student: Ratio = 4:6 = 2:3\n```\n",
//       label: "Sequence",
//       icon: "🔄",
//     },
//   ];

//   // Sample textbook content with Mermaid
//   const sampleContent = `# അനുപാതം - ചതുരങ്ങൾ

// ## 2 : 3 അനുപാതത്തിലുള്ള ചതുരം

// 2 cm ഉയരവും 3 cm വീതിയുമുള്ള ഒരു ചതുരം:

// \`\`\`mermaid
// graph TD
//     A[2 cm] --> B[3 cm]
//     B --> C[2 cm]
//     C --> D[3 cm]
//     D --> A
//     style A fill:#e1f5fe,stroke:#01579B,stroke-width:2px
//     style B fill:#e1f5fe,stroke:#01579B,stroke-width:2px
//     style C fill:#e1f5fe,stroke:#01579B,stroke-width:2px
//     style D fill:#e1f5fe,stroke:#01579B,stroke-width:2px
// \`\`\`

// **അനുപാതം:** ഉയരം : വീതി = 2 : 3

// ## 4 cm × 6 cm ചതുരം

// \`\`\`mermaid
// graph LR
//     A[4 cm] --> B[6 cm]
//     B --> C[4 cm]
//     C --> D[6 cm]
//     D --> A
//     style A fill:#FFB6C1,stroke:#FF1493,stroke-width:2px
//     style B fill:#FFB6C1,stroke:#FF1493,stroke-width:2px
//     style C fill:#FFB6C1,stroke:#FF1493,stroke-width:2px
//     style D fill:#FFB6C1,stroke:#FF1493,stroke-width:2px
// \`\`\`

// **അനുപാതം:** 4 : 6 = 2 : 3

// ## രണ്ട് ചതുരങ്ങൾ താരതമ്യം

// \`\`\`mermaid
// graph TD
//     subgraph Rectangle1 [Rectangle 1: 2cm x 3cm]
//         A[2 cm] --> B[3 cm]
//         B --> C[2 cm]
//         C --> D[3 cm]
//         D --> A
//     end

//     subgraph Rectangle2 [Rectangle 2: 4cm x 6cm]
//         E[4 cm] --> F[6 cm]
//         F --> G[4 cm]
//         G --> H[6 cm]
//         H --> E
//     end

//     style A fill:#FFD700,stroke:#B8860B,stroke-width:2px
//     style B fill:#FFD700,stroke:#B8860B,stroke-width:2px
//     style C fill:#FFD700,stroke:#B8860B,stroke-width:2px
//     style D fill:#FFD700,stroke:#B8860B,stroke-width:2px
//     style E fill:#98FB98,stroke:#006400,stroke-width:2px
//     style F fill:#98FB98,stroke:#006400,stroke-width:2px
//     style G fill:#98FB98,stroke:#006400,stroke-width:2px
//     style H fill:#98FB98,stroke:#006400,stroke-width:2px
// \`\`\`

// രണ്ട് ചതുരങ്ങൾക്കും **ഒരേ അനുപാതം** (2 : 3) ആണ്.

// ## ഗണിത സമവാക്യങ്ങൾ

// അനുപാതം കണ്ടെത്താൻ:

// $$ \\frac{\\text{ഉയരം}}{\\text{വീതി}} = \\frac{2}{3} $$

// $$ h = \\frac{2}{3} \\times w $$

// $$ h : w = 2 : 3 $$`;

//   const handleSave = async () => {
//     if (!content.trim()) {
//       alert("ദയവായി ഉള്ളടക്കം നൽകുക");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("content", content);
//       formData.append("subject", "maths");
//       formData.append("format", "markdown");
//       formData.append("pageNumber", pageNumber);
//       formData.append("chapterId", chapterId);
//       if (teacherId) {
//         formData.append("teacherId", teacherId);
//       }

//       uploadedImages.forEach((image, index) => {
//         formData.append("media", image.file);
//         formData.append("imageNames", image.name);
//       });

//       const result = await createLesson(formData).unwrap();

//       if (result.success) {
//         if (onSuccess) onSuccess(result.lessonId);
//         setContent("");
//         setUploadedImages([]);

//         const saveBtn = document.querySelector(".save-btn");
//         if (saveBtn) {
//           saveBtn.textContent = "✅ സേവ് ചെയ്തു!";
//           setTimeout(() => {
//             saveBtn.textContent = "സേവ് ചെയ്യുക";
//           }, 2000);
//         }
//         navigate(-1);
//       } else {
//         alert(`Save failed: ${result.error}`);
//       }
//     } catch (err) {
//       console.error("Save error:", err);
//       alert(`Error: ${err.data?.error || err.message || "Failed to save"}`);
//     }
//   };

//   const handleImageUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const validTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/gif",
//       "image/webp",
//       "image/svg+xml",
//     ];
//     if (!validTypes.includes(file.type)) {
//       alert("അനുവദനീയമായ ഫയൽ തരങ്ങൾ: JPEG, PNG, GIF, WEBP, SVG");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       alert("ഫയലിന്റെ വലിപ്പം 5MB ൽ കുറവായിരിക്കണം");
//       return;
//     }

//     setIsUploading(true);

//     try {
//       const imageName = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split(".").pop()}`;

//       const newImage = {
//         file: file,
//         name: imageName,
//         preview: URL.createObjectURL(file),
//         size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
//       };

//       setUploadedImages((prev) => [...prev, newImage]);

//       insertAtCursor(`![${imageName}](${imageName})\n\n`);
//     } catch (error) {
//       console.error("Image processing error:", error);
//       alert("ചിത്രം പ്രോസസ്സ് ചെയ്യാനായില്ല.");
//     } finally {
//       setIsUploading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   };

//   const insertAtCursor = (text) => {
//     const textarea = textareaRef.current;
//     if (!textarea) return;

//     const start = textarea.selectionStart;
//     const end = textarea.selectionEnd;
//     const newContent =
//       content.substring(0, start) + text + content.substring(end);

//     setContent(newContent);

//     setTimeout(() => {
//       textarea.focus();
//       const cursorPos = start + text.length;
//       textarea.setSelectionRange(cursorPos, cursorPos);
//     }, 10);
//   };

//   const removeImage = (index) => {
//     const imageToRemove = uploadedImages[index];

//     if (imageToRemove.preview) {
//       URL.revokeObjectURL(imageToRemove.preview);
//     }

//     setUploadedImages((prev) => prev.filter((_, i) => i !== index));

//     const regex = new RegExp(
//       `!\\[${imageToRemove.name}\\]\\(${imageToRemove.name}\\)\\s*`,
//       "g",
//     );
//     const newContent = content.replace(regex, "");
//     setContent(newContent);
//   };

//   return (
//     <div className="container mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
//         <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
//           <button
//             className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-2"
//             onClick={() => setContent(sampleContent)}
//           >
//             <span>📋</span> സാമ്പിൾ പാഠം
//           </button>
//           <button
//             className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center gap-2"
//             onClick={() => setPreview(!preview)}
//           >
//             <span>{preview ? "✏️" : "👁️"}</span>
//             {preview ? "എഡിറ്റ് മോഡ്" : "പ്രിവ്യൂ മോഡ്"}
//           </button>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-red-700 font-medium">
//             Error: {error.data?.error || error.message}
//           </p>
//         </div>
//       )}

//       {/* Uploaded Images Preview */}
//       {uploadedImages.length > 0 && !preview && (
//         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
//           <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
//             <span>📁</span> അപ്‌ലോഡ് ചെയ്ത ചിത്രങ്ങൾ ({uploadedImages.length})
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {uploadedImages.map((image, index) => (
//               <div
//                 key={index}
//                 className="relative group bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
//               >
//                 <div className="flex items-start gap-3">
//                   <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border">
//                     <img
//                       src={image.preview}
//                       alt={image.name}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-800 truncate">
//                       {image.name}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {image.size} •{" "}
//                       {image.file.type.split("/")[1].toUpperCase()}
//                     </p>
//                     <p className="text-xs text-blue-600 mt-1 font-mono">
//                       ![alt text]({image.name})
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => removeImage(index)}
//                   className="absolute top-2 right-2 w-7 h-7 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-200"
//                   title="Remove image"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Preview Mode */}
//       {preview ? (
//         <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200 min-h-[400px]">
//           <div className="mb-4 flex flex-wrap items-center gap-2">
//             <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//               📖 പാഠപുസ്തക പ്രിവ്യൂ
//             </span>
//             <span className="text-gray-500 text-sm">
//               ഇതാണ് വിദ്യാർത്ഥികൾക്ക് കാണാൻ കിട്ടുന്നത്
//             </span>
//             {uploadedImages.length > 0 && (
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                 📁 {uploadedImages.length} ചിത്രങ്ങൾ
//               </span>
//             )}
//           </div>

//           <div className="prose prose-lg max-w-none p-6 bg-white rounded-lg shadow-inner">
//             {extractMermaidCharts(content).map((part, index) => {
//               if (part.type === "mermaid") {
//                 return <MermaidRenderer key={index} chart={part.content} />;
//               } else {
//                 return (
//                   <ReactMarkdown
//                     key={index}
//                     remarkPlugins={[remarkMath]}
//                     rehypePlugins={[rehypeKatex]}
//                     components={components}
//                   >
//                     {part.content}
//                   </ReactMarkdown>
//                 );
//               }
//             })}
//             {!content && "ഉള്ളടക്കം ഇല്ല. എഡിറ്റ് ബട്ടൺ അമർത്തി എഴുതുക."}
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Toolbar */}
//           <div className="mb-6">
//             <div className="flex flex-wrap gap-3 mb-4">
//               {/* Image Upload */}
//               <label className="cursor-pointer">
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                 />
//                 <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg">
//                   {isUploading ? (
//                     <>
//                       <svg
//                         className="animate-spin h-5 w-5 text-white"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         ></circle>
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                         ></path>
//                       </svg>
//                       അപ്‌ലോഡ് ചെയ്യുന്നു...
//                     </>
//                   ) : (
//                     <>
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
//                         ></path>
//                       </svg>
//                       ചിത്രം അപ്‌ലോഡ് ചെയ്യുക
//                     </>
//                   )}
//                 </div>
//               </label>

//               {/* Clear Button */}
//               <button
//                 className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
//                 onClick={() => {
//                   setContent("");
//                   setUploadedImages([]);
//                 }}
//               >
//                 <span>🗑️</span> മായ്ക്കുക
//               </button>
//             </div>

//             {/* Quick Insert Toolbar */}
//             <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
//               <h3 className="text-sm font-semibold text-gray-700 mb-3">
//                 ⚡ വേഗത്തിൽ ചേർക്കുക:
//               </h3>

//               <div className="space-y-3">
//                 {/* Headings */}
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-2">
//                     Headings:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {snippets.slice(0, 6).map((snippet, index) => (
//                       <button
//                         key={index}
//                         className="px-3 py-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
//                         onClick={() => insertAtCursor(snippet.code)}
//                         title={snippet.label}
//                       >
//                         <span className="font-bold text-blue-700">
//                           {snippet.icon}
//                         </span>
//                         <span className="text-sm text-blue-700">
//                           {snippet.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Math */}
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-2">
//                     Math:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {snippets.slice(6, 13).map((snippet, index) => (
//                       <button
//                         key={index}
//                         className="px-3 py-2 bg-white hover:bg-green-50 border border-green-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
//                         onClick={() => insertAtCursor(snippet.code)}
//                         title={snippet.label}
//                       >
//                         <span className="text-lg">{snippet.icon}</span>
//                         <span className="text-sm text-green-700">
//                           {snippet.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Formatting */}
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-2">
//                     Formatting:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {snippets.slice(13, 18).map((snippet, index) => (
//                       <button
//                         key={index}
//                         className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
//                         onClick={() => insertAtCursor(snippet.code)}
//                         title={snippet.label}
//                       >
//                         <span className="font-bold text-purple-700">
//                           {snippet.icon}
//                         </span>
//                         <span className="text-sm text-purple-700">
//                           {snippet.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Mermaid Diagrams */}
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-2">
//                     📊 Mermaid Diagrams:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {snippets.slice(18).map((snippet, index) => (
//                       <button
//                         key={index}
//                         className="px-3 py-2 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
//                         onClick={() => insertAtCursor(snippet.code)}
//                         title={snippet.label}
//                       >
//                         <span className="text-lg">{snippet.icon}</span>
//                         <span className="text-sm text-amber-700">
//                           {snippet.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Title & Page Number */}
//           <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Title */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-semibold text-gray-700 mb-1">
//                 📘 Lesson Title
//               </label>
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Enter lesson title"
//                 className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-base md:text-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
//               />
//             </div>

//             {/* Page Number */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">
//                 📄 Page No
//               </label>
//               <input
//                 type="number"
//                 min={1}
//                 value={pageNumber}
//                 onChange={(e) => setPageNumber(Number(e.target.value))}
//                 className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-base md:text-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
//               />
//             </div>
//           </div>

//           {/* Text Editor */}
//           <div className="mb-6">
//             <textarea
//               ref={textareaRef}
//               className="w-full h-[500px] p-4 font-mono text-base md:text-lg border-2 border-blue-300 rounded-xl bg-gradient-to-b from-blue-50/50 to-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all resize-y"
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               placeholder={`🎯 ഇവിടെ നിങ്ങളുടെ പാഠപുസ്തകം എഴുതുക...

// 📚 Headings:
// # ഹെഡിംഗ് 1
// ## ഹെഡിംഗ് 2
// ### ഹെഡിംഗ് 3

// 🧮 Math:
// Inline: \\( E = mc^2 \\)
// Display: $$ \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$

// 📊 Mermaid Diagrams:
// \`\`\`mermaid
// graph TD
//     A[2 cm] --> B[3 cm]
//     B --> C[2 cm]
//     C --> D[3 cm]
//     D --> A
// \`\`\`

// 🖼️ Images:
// ![alt text](image.png)

// 📝 Formatting:
// **bold text**
// *italic text*
// - List item
// 1. Numbered list

// > Quote`}
//             />

//             <div className="mt-2 text-sm text-gray-500 flex justify-between">
//               <span>📝 {content.length} characters</span>
//               <span>📁 {uploadedImages.length} images</span>
//               <span>💾 Ctrl+S to save</span>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Action Buttons */}
//       <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
//         <button
//           className="save-btn flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           onClick={handleSave}
//           disabled={isLoading || !content.trim()}
//         >
//           {isLoading ? (
//             <>
//               <svg
//                 className="animate-spin h-5 w-5 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               സേവിംഗ്...
//             </>
//           ) : (
//             <>
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
//                 ></path>
//               </svg>
//               പാഠപുസ്തകം സേവ് ചെയ്യുക
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default EachChaperChunkContentCreate;

// import React, { useState, useRef } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// import "katex/dist/katex.min.css";
// import { useCreateLessonMutation } from "../../store/api/MathsLessonApi";

// import { useParams, useNavigate } from "react-router-dom";

// const EachChaperChunkContentCreate = ({ teacherId, onSuccess }) => {
//   const [content, setContent] = useState("");
//   const [preview, setPreview] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const textareaRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const [pageNumber, setPageNumber] = useState(null);
//   const [title, setTitle] = useState("");
//   const [createLesson, { isLoading, error }] = useCreateLessonMutation();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const chapterId = id;
//   // Markdown + Math snippets
//   const snippets = [
//     // Headings
//     { code: "# ", label: "H1 Heading", icon: "H1" },
//     { code: "## ", label: "H2 Heading", icon: "H2" },
//     { code: "### ", label: "H3 Heading", icon: "H3" },
//     { code: "#### ", label: "H4 Heading", icon: "H4" },
//     { code: "##### ", label: "H5 Heading", icon: "H5" },
//     { code: "###### ", label: "H6 Heading", icon: "H6" },

//     // **തിരുത്തിയ MATH snippets:**
//     { code: "$\n\\frac{a}{b}\n$", label: "ഭിന്നസംഖ്യ", icon: "½" },

//     { code: "$\nx^{2}\n$", label: "വർഗം", icon: "x²" },

//     {
//       code: "$\n\\sqrt{x}\n$$\n",
//       label: "വർഗമൂലം",
//       icon: "√",
//     },

//     {
//       code: "$$\n\\sum_{i=1}^{n} i\n$$\n",
//       label: "സംഗ്രഹം",
//       icon: "∑",
//     },
//     {
//       code: "$$\n\\int_{a}^{b} f(x)\\,dx\n$$\n",
//       label: "ഇന്റഗ്രൽ",
//       icon: "∫",
//     },

//     // Formatting
//     { code: "**bold text**", label: "Bold", icon: "𝐁" },
//     { code: "*italic text*", label: "Italic", icon: "𝐼" },
//     { code: "- List item", label: "List", icon: "•" },
//     { code: "1. Numbered", label: "Numbered List", icon: "1." },
//   ];

//   // Sample textbook content
//   const sampleContent = `# ത്രികോണമിതി

// ## സൈൻ നിയമം

// ഒരു ത്രികോണത്തിൽ, സൈൻ നിയമം ഉപയോഗിച്ച് നമുക്ക് വശങ്ങളും കോണുകളും കണ്ടെത്താം.

// ### സൂത്രവാക്യം

// സൈൻ നിയമത്തിന്റെ സൂത്രവാക്യം:

// \\\\( \\\\frac{a}{\\\\sin A} = \\\\frac{b}{\\\\sin B} = \\\\frac{c}{\\\\sin C} \\\\)

// അല്ലെങ്കിൽ ഡിസ്പ്ലേ രൂപത്തിൽ:

// $$
// \\\\frac{a}{\\\\sin A} = \\\\frac{b}{\\\\sin B} = \\\\frac{c}{\\\\sin C} = 2R
// $$

// ഇവിടെ \\( R \\) എന്നത് പരിവൃത്തത്തിന്റെ ആരമാണ്.

// ## ഉദാഹരണം

// **ചോദ്യം:** ത്രികോണത്തിൽ \\( A = 30^\\\\circ \\), \\( B = 45^\\\\circ \\), \\( a = 10 \\) cm ആയാൽ \\( b \\) കണ്ടെത്തുക.

// **പരിഹാരം:**

// $$
// \\\\frac{a}{\\\\sin A} = \\\\frac{b}{\\\\sin B}
// $$

// $$
// \\\\frac{10}{\\\\sin 30^\\\\circ} = \\\\frac{b}{\\\\sin 45^\\\\circ}
// $$

// $$
// b = \\\\frac{10 \\\\times \\\\sin 45^\\\\circ}{\\\\sin 30^\\\\circ}
// $$

// $$
// b = \\\\frac{10 \\\\times \\\\frac{\\\\sqrt{2}}{2}}{\\\\frac{1}{2}} = 10\\\\sqrt{2} \\\\approx 14.14 \\\\text{ cm}
// $$

// ## പ്രയോഗങ്ങൾ

// സൈൻ നിയമം ഉപയോഗിക്കുന്ന സാഹചര്യങ്ങൾ:

// 1. **രണ്ട് കോണുകളും ഒരു വശവും** അറിയാമെങ്കിൽ
// 2. **രണ്ട് വശങ്ങളും ഒരു കോണും** അറിയാമെങ്കിൽ
// 3. **ത്രികോണമിതി പ്രശ്നങ്ങൾ** പരിഹരിക്കാൻ

// ## ചിത്രം

// ![ത്രികോണം](triangle.png)

// ## സമാനതകൾ

// ഇതും നോക്കുക:

// - കോസൈൻ നിയമം
// - ത്രികോണത്തിന്റെ വിസ്തീർണ്ണം
// - ഹെറോണിന്റെ സൂത്രവാക്യം

// ## സംഗ്രഹം

// സൈൻ നിയമം ത്രികോണമിതിയിലെ **പ്രാഥമിക സൂത്രവാക്യങ്ങളിൽ** ഒന്നാണ്. ഇത് ഓർക്കാൻ:

// > "വശം ÷ അതിന്റെ എതിർകോണിന്റെ സൈൻ = സ്ഥിരം"

// ഈ സ്ഥിരം ത്രികോണത്തിന്റെ പരിവൃത്ത വ്യാസത്തിന് തുല്യമാണ്.`;

//   const handleSave = async () => {
//     if (!content.trim()) {
//       alert("ദയവായി ഉള്ളടക്കം നൽകുക");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("content", content);
//       formData.append("subject", "maths");
//       formData.append("format", "markdown");
//       formData.append("pageNumber", pageNumber);
//       formData.append("chapterId", chapterId);
//       if (teacherId) {
//         formData.append("teacherId", teacherId);
//       }

//       uploadedImages.forEach((image, index) => {
//         formData.append("media", image.file);
//         formData.append("imageNames", image.name);
//       });

//       const result = await createLesson(formData).unwrap();

//       if (result.success) {
//         if (onSuccess) onSuccess(result.lessonId);
//         setContent("");
//         setUploadedImages([]);

//         const saveBtn = document.querySelector(".save-btn");
//         if (saveBtn) {
//           saveBtn.textContent = "✅ സേവ് ചെയ്തു!";
//           setTimeout(() => {
//             saveBtn.textContent = "സേവ് ചെയ്യുക";
//           }, 2000);
//         }
//         navigate(-1);
//       } else {
//         alert(`Save failed: ${result.error}`);
//       }
//     } catch (err) {
//       console.error("Save error:", err);
//       alert(`Error: ${err.data?.error || err.message || "Failed to save"}`);
//     }
//   };

//   const handleImageUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const validTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/gif",
//       "image/webp",
//       "image/svg+xml",
//     ];
//     if (!validTypes.includes(file.type)) {
//       alert("അനുവദനീയമായ ഫയൽ തരങ്ങൾ: JPEG, PNG, GIF, WEBP, SVG");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       alert("ഫയലിന്റെ വലിപ്പം 5MB ൽ കുറവായിരിക്കണം");
//       return;
//     }

//     setIsUploading(true);

//     try {
//       const imageName = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split(".").pop()}`;

//       const newImage = {
//         file: file,
//         name: imageName,
//         preview: URL.createObjectURL(file),
//         size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
//       };

//       setUploadedImages((prev) => [...prev, newImage]);

//       insertAtCursor(`![${imageName}](${imageName})\n\n`);
//     } catch (error) {
//       console.error("Image processing error:", error);
//       alert("ചിത്രം പ്രോസസ്സ് ചെയ്യാനായില്ല.");
//     } finally {
//       setIsUploading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   };

//   const insertAtCursor = (text) => {
//     const textarea = textareaRef.current;
//     if (!textarea) return;

//     const start = textarea.selectionStart;
//     const end = textarea.selectionEnd;
//     const newContent =
//       content.substring(0, start) + text + content.substring(end);

//     setContent(newContent);

//     setTimeout(() => {
//       textarea.focus();
//       const cursorPos = start + text.length;
//       textarea.setSelectionRange(cursorPos, cursorPos);
//     }, 10);
//   };

//   const removeImage = (index) => {
//     const imageToRemove = uploadedImages[index];

//     if (imageToRemove.preview) {
//       URL.revokeObjectURL(imageToRemove.preview);
//     }

//     setUploadedImages((prev) => prev.filter((_, i) => i !== index));

//     const regex = new RegExp(
//       `!\\[${imageToRemove.name}\\]\\(${imageToRemove.name}\\)\\s*`,
//       "g",
//     );
//     const newContent = content.replace(regex, "");
//     setContent(newContent);
//   };

//   // Custom renderers for ReactMarkdown
//   const components = {
//     code({ node, inline, className, children, ...props }) {
//       const match = /language-(\w+)/.exec(className || "");
//       return !inline && match ? (
//         <SyntaxHighlighter
//           style={vscDarkPlus}
//           language={match[1]}
//           PreTag="div"
//           {...props}
//         >
//           {String(children).replace(/\n$/, "")}
//         </SyntaxHighlighter>
//       ) : (
//         <code className={className} {...props}>
//           {children}
//         </code>
//       );
//     },
//     img: ({ node, ...props }) => (
//       <div className="my-4">
//         <img
//           {...props}
//           className="max-w-full h-auto rounded-lg shadow-md mx-auto"
//         />
//         {props.alt && props.alt !== props.src && (
//           <p className="text-center text-gray-600 text-sm mt-2 italic">
//             {props.alt}
//           </p>
//         )}
//       </div>
//     ),
//     h1: ({ node, ...props }) => (
//       <h1
//         className="text-3xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-blue-200"
//         {...props}
//       />
//     ),
//     h2: ({ node, ...props }) => (
//       <h2
//         className="text-2xl font-bold text-gray-800 mt-5 mb-3 pb-2 border-b border-blue-100"
//         {...props}
//       />
//     ),
//     h3: ({ node, ...props }) => (
//       <h3
//         className="text-xl font-semibold text-gray-700 mt-4 mb-2"
//         {...props}
//       />
//     ),
//     p: ({ node, ...props }) => (
//       <p className="text-gray-700 leading-relaxed my-3" {...props} />
//     ),
//     blockquote: ({ node, ...props }) => (
//       <blockquote
//         className="border-l-4 border-blue-400 pl-4 italic text-gray-600 my-4 bg-blue-50 py-2 rounded-r"
//         {...props}
//       />
//     ),
//     ul: ({ node, ...props }) => (
//       <ul className="list-disc pl-5 my-3 space-y-1" {...props} />
//     ),
//     ol: ({ node, ...props }) => (
//       <ol className="list-decimal pl-5 my-3 space-y-1" {...props} />
//     ),
//   };

//   return (
//     <div className="container mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">
//             📚 പാഠപുസ്തക എഡിറ്റർ
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Markdown + LaTeX ഉപയോഗിച്ച് മുഴുനീളം പാഠപുസ്തകങ്ങൾ എഴുതുക
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
//           <button
//             className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-2"
//             onClick={() => setContent(sampleContent)}
//           >
//             <span>📋</span> സാമ്പിൾ പാഠം
//           </button>
//           <button
//             className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center gap-2"
//             onClick={() => setPreview(!preview)}
//           >
//             <span>{preview ? "✏️" : "👁️"}</span>
//             {preview ? "എഡിറ്റ് മോഡ്" : "പ്രിവ്യൂ മോഡ്"}
//           </button>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-red-700 font-medium">
//             Error: {error.data?.error || error.message}
//           </p>
//         </div>
//       )}

//       {/* Uploaded Images Preview */}
//       {uploadedImages.length > 0 && !preview && (
//         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
//           <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
//             <span>📁</span> അപ്‌ലോഡ് ചെയ്ത ചിത്രങ്ങൾ ({uploadedImages.length})
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {uploadedImages.map((image, index) => (
//               <div
//                 key={index}
//                 className="relative group bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
//               >
//                 <div className="flex items-start gap-3">
//                   <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border">
//                     <img
//                       src={image.preview}
//                       alt={image.name}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-800 truncate">
//                       {image.name}
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {image.size} •{" "}
//                       {image.file.type.split("/")[1].toUpperCase()}
//                     </p>
//                     <p className="text-xs text-blue-600 mt-1 font-mono">
//                       ![alt text]({image.name})
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => removeImage(index)}
//                   className="absolute top-2 right-2 w-7 h-7 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-200"
//                   title="Remove image"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Preview Mode */}
//       {preview ? (
//         <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200 min-h-[400px]">
//           <div className="mb-4 flex flex-wrap items-center gap-2">
//             <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//               📖 പാഠപുസ്തക പ്രിവ്യൂ
//             </span>
//             <span className="text-gray-500 text-sm">
//               ഇതാണ് വിദ്യാർത്ഥികൾക്ക് കാണാൻ കിട്ടുന്നത്
//             </span>
//             {uploadedImages.length > 0 && (
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                 📁 {uploadedImages.length} ചിത്രങ്ങൾ
//               </span>
//             )}
//           </div>

//           <div className="prose prose-lg max-w-none p-6 bg-white rounded-lg shadow-inner">
//             <ReactMarkdown
//               remarkPlugins={[remarkMath]}
//               rehypePlugins={[rehypeKatex]}
//               components={components}
//             >
//               {content || "ഉള്ളടക്കം ഇല്ല. എഡിറ്റ് ബട്ടൺ അമർത്തി എഴുതുക."}
//             </ReactMarkdown>
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Toolbar */}
//           <div className="mb-6">
//             <div className="flex flex-wrap gap-3 mb-4">
//               {/* Image Upload */}
//               <label className="cursor-pointer">
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                 />
//                 <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg">
//                   {isUploading ? (
//                     <>
//                       <svg
//                         className="animate-spin h-5 w-5 text-white"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         ></circle>
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                         ></path>
//                       </svg>
//                       അപ്‌ലോഡ് ചെയ്യുന്നു...
//                     </>
//                   ) : (
//                     <>
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
//                         ></path>
//                       </svg>
//                       ചിത്രം അപ്‌ലോഡ് ചെയ്യുക
//                     </>
//                   )}
//                 </div>
//               </label>

//               {/* Clear Button */}
//               <button
//                 className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
//                 onClick={() => {
//                   setContent("");
//                   setUploadedImages([]);
//                 }}
//               >
//                 <span>🗑️</span> മായ്ക്കുക
//               </button>
//             </div>

//             {/* Quick Insert Toolbar */}
//             <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
//               <h3 className="text-sm font-semibold text-gray-700 mb-3">
//                 ⚡ വേഗത്തിൽ ചേർക്കുക:
//               </h3>

//               <div className="space-y-3">
//                 {/* Headings */}
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-2">
//                     Headings:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {snippets.slice(0, 6).map((snippet, index) => (
//                       <button
//                         key={index}
//                         className="px-3 py-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
//                         onClick={() => insertAtCursor(snippet.code)}
//                         title={snippet.label}
//                       >
//                         <span className="font-bold text-blue-700">
//                           {snippet.icon}
//                         </span>
//                         <span className="text-sm text-blue-700">
//                           {snippet.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Math */}
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-2">
//                     Math:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {snippets.slice(6, 11).map((snippet, index) => (
//                       <button
//                         key={index}
//                         className="px-3 py-2 bg-white hover:bg-green-50 border border-green-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
//                         onClick={() => insertAtCursor(snippet.code)}
//                         title={snippet.label}
//                       >
//                         <span className="text-lg">{snippet.icon}</span>
//                         <span className="text-sm text-green-700">
//                           {snippet.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Formatting */}
//                 <div>
//                   <p className="text-xs font-medium text-gray-600 mb-2">
//                     Formatting:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {snippets.slice(11).map((snippet, index) => (
//                       <button
//                         key={index}
//                         className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
//                         onClick={() => insertAtCursor(snippet.code)}
//                         title={snippet.label}
//                       >
//                         <span className="font-bold text-purple-700">
//                           {snippet.icon}
//                         </span>
//                         <span className="text-sm text-purple-700">
//                           {snippet.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* Title & Page Number */}
//           <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Title */}
//             <div className="md:col-span-2">
//               <label className="block text-sm font-semibold text-gray-700 mb-1">
//                 📘 Lesson Title
//               </label>
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Enter lesson title"
//                 className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-base md:text-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
//               />
//             </div>

//             {/* Page Number */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-1">
//                 📄 Page No
//               </label>
//               <input
//                 type="number"
//                 min={1}
//                 value={pageNumber}
//                 onChange={(e) => setPageNumber(Number(e.target.value))}
//                 className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-base md:text-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
//               />
//             </div>
//           </div>

//           {/* Text Editor */}
//           <div className="mb-6">
//             <textarea
//               ref={textareaRef}
//               className="w-full h-[500px] p-4 font-mono text-base md:text-lg border-2 border-blue-300 rounded-xl bg-gradient-to-b from-blue-50/50 to-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all resize-y"
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               placeholder={`🎯 ഇവിടെ നിങ്ങളുടെ പാഠപുസ്തകം എഴുതുക...

// 📚 Headings:
// # ഹെഡിംഗ് 1
// ## ഹെഡിംഗ് 2
// ### ഹെഡിംഗ് 3

// 🧮 Math:
// Inline: \\( E = mc^2 \\)
// Display: $$ \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a} $$

// 🖼️ Images:
// ![alt text](image.png)

// 📝 Formatting:
// **bold text**
// *italic text*
// - List item
// 1. Numbered list

// > Quote

// 💡 Example Structure:
// # Chapter Title
// ## Section 1
// Normal text with inline math \\( x^2 + y^2 = z^2 \\)

// $$
// \\\\int_0^\\\\infty e^{-x^2} dx = \\\\frac{\\\\sqrt{\\\\pi}}{2}
// $$

// ![Diagram](diagram.png)`}
//             />

//             <div className="mt-2 text-sm text-gray-500 flex justify-between">
//               <span>📝 {content.length} characters</span>
//               <span>📁 {uploadedImages.length} images</span>
//               <span>💾 Ctrl+S to save</span>
//             </div>
//           </div>

//           {/* Quick Reference Guide */}
//           <div className="mb-6 p-5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
//             <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
//               <span>📖</span> പാഠപുസ്തക എഴുതാം (സങ്കേതം)
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <h4 className="font-bold text-gray-700 mb-2">📖 ഘടന</h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex items-start gap-2">
//                     <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
//                       #
//                     </code>
//                     <span className="text-gray-700">പ്രധാന ഹെഡിംഗ്</span>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
//                       ##
//                     </code>
//                     <span className="text-gray-700">ഉപഹെഡിംഗ്</span>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
//                       ###
//                     </code>
//                     <span className="text-gray-700">ചെറിയ ഹെഡിംഗ്</span>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <h4 className="font-bold text-gray-700 mb-2">∫ ഗണിതം</h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex items-start gap-2">
//                     <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
//                       \\(...\\)
//                     </code>
//                     <span className="text-gray-700">ഇൻലൈൻ സമവാക്യം</span>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
//                       $$...$$
//                     </code>
//                     <span className="text-gray-700">ഡിസ്പ്ലേ സമവാക്യം</span>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
//                       \\frac{}
//                       {}
//                     </code>
//                     <span className="text-gray-700">ഭിന്നസംഖ്യ</span>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <h4 className="font-bold text-gray-700 mb-2">🎨 ഫോർമാറ്റ്</h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex items-start gap-2">
//                     <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
//                       **text**
//                     </code>
//                     <span className="text-gray-700">ബോൾഡ്</span>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
//                       *text*
//                     </code>
//                     <span className="text-gray-700">ഇറ്റാലിക്</span>
//                   </div>
//                   <div className="flex items-start gap-2">
//                     <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
//                       ![alt](img)
//                     </code>
//                     <span className="text-gray-700">ചിത്രം</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Action Buttons */}
//       <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
//         <button
//           className="save-btn flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//           onClick={handleSave}
//           disabled={isLoading || !content.trim()}
//         >
//           {isLoading ? (
//             <>
//               <svg
//                 className="animate-spin h-5 w-5 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               സേവിംഗ്...
//             </>
//           ) : (
//             <>
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
//                 ></path>
//               </svg>
//               പാഠപുസ്തകം സേവ് ചെയ്യുക
//             </>
//           )}
//         </button>
//       </div>

//       {/* Tips */}
//       <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
//         <p className="text-amber-800 font-medium flex items-center gap-2">
//           <span>💡</span> പ്രൊഫഷണൽ ടിപ്സ്:
//         </p>
//         <ul className="mt-2 text-amber-700 text-sm space-y-1">
//           <li>• # ഉപയോഗിച്ച് ഹെഡിംഗ് ചെയ്യുക - യഥാർത്ഥ പാഠപുസ്തകം പോലെ</li>
//           <li>• ചിത്രങ്ങൾക്ക് alt text (വിവരണം) നൽകുക - അക്സസിബിൾ</li>
//           <li>• \\(...\\) - ഇൻലൈൻ, $$...$$ - ഡിസ്പ്ലേ സമവാക്യങ്ങൾ</li>
//           <li>• **ബോൾഡ്**, *ഇറ്റാലിക്* - ഊന്നിപ്പറയാൻ</li>
//           <li>• ഓരോ ടോപിക്കും ഹെഡിംഗ് ഉണ്ടാക്കുക - ക്ലീൻ ഘടന</li>
//           <li>• പ്രിവ്യൂ മോഡിൽ പൂർണ്ണ പാഠപുസ്തക കാഴ്ച പരിശോധിക്കുക</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default EachChaperChunkContentCreate;
