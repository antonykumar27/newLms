// ChapterRelatedPageDisplayEdit.js - COMPLETE FIXED VERSION WITH HTML STYLING SUPPORT
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"; // ✅ Import defaultSchema
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import {
  useUpdateLessonMutation,
  useGetLessonByIdQuery,
} from "../../store/api/MathsLessonApi";

import { useParams, useNavigate } from "react-router-dom";

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

const ChapterRelatedPageDisplayEdit = ({ teacherId, onSuccess }) => {
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [pageNumber, setPageNumber] = useState("");
  const [title, setTitle] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [activeTab, setActiveTab] = useState("write"); // 'write' or 'preview'

  const { id } = useParams();
  const navigate = useNavigate();
  const lessonId = id;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  // Fetch existing lesson data
  const {
    data: lessonData,
    isLoading: isLoadingData,
    error: isErrorData,
  } = useGetLessonByIdQuery(lessonId);

  // Update mutation
  const [updateLesson, { isLoading, error }] = useUpdateLessonMutation();

  // Effect to populate form with existing data
  useEffect(() => {
    if (
      lessonData &&
      lessonData.success &&
      lessonData.lesson &&
      lessonData.lesson._id
    ) {
      const lesson = lessonData.lesson;

      // Set content - decode HTML entities
      if (lesson.content) {
        setContent(decodeHTMLEntities(lesson.content));
      }

      // Set title
      if (lesson.title) {
        setTitle(lesson.title);
      }

      // Set page number
      if (lesson.pageNumber) {
        setPageNumber(lesson.pageNumber.toString());
      }

      // Handle existing images
      if (lesson.media && lesson.media.length > 0) {
        const existingMedia = lesson.media.filter(
          (item) => item.type === "image",
        );
        setExistingImages(existingMedia);

        // Convert existing images to uploadedImages format
        const uploadedImagesData = existingMedia.map((image) => ({
          name: image.url.split("/").pop(),
          preview: image.url,
          url: image.url,
          isExisting: true,
          _id: image._id,
          file: null,
          size: "Existing",
        }));
        setUploadedImages(uploadedImagesData);
      }
    }
  }, [lessonData]);

  // Markdown + Math snippets
  const snippets = [
    // Headings
    { code: "# ", label: "H1", icon: "H1", desc: "Main heading" },
    { code: "## ", label: "H2", icon: "H2", desc: "Sub heading" },
    { code: "### ", label: "H3", icon: "H3", desc: "Section heading" },
    { code: "#### ", label: "H4", icon: "H4", desc: "Sub section" },
    { code: "##### ", label: "H5", icon: "H5", desc: "Small heading" },
    { code: "###### ", label: "H6", icon: "H6", desc: "Tiny heading" },

    // HTML Elements with style
    {
      code: '<div style="background: #e3f2fd; padding: 1rem; border-radius: 0.5rem;">Content</div>',
      label: "Styled Div",
      icon: "📦",
      desc: "Div with styling",
    },
    {
      code: '<p style="color: blue; font-size: 1.2rem;">Text</p>',
      label: "Styled P",
      icon: "📝",
      desc: "Paragraph with styling",
    },
    {
      code: '<span style="color: red; font-weight: bold;">Text</span>',
      label: "Styled Span",
      icon: "🎨",
      desc: "Span with styling",
    },
    {
      code: '<p align="center" style="background: #f5f5f5;">Centered</p>',
      label: "Center",
      icon: "⏺️",
      desc: "Center align with style",
    },
    {
      code: '<p align="right" style="font-style: italic;">Right</p>',
      label: "Right",
      icon: "➡️",
      desc: "Right align with style",
    },
    {
      code: "<details><summary>Click</summary>Hidden content</details>",
      label: "Details",
      icon: "🔽",
      desc: "Expandable section",
    },
    {
      code: '<marquee style="background: yellow; padding: 0.5rem;">Scrolling</marquee>',
      label: "Marquee",
      icon: "🎪",
      desc: "Scrolling text with style",
    },

    // Math
    {
      code: "\\(\\frac{a}{b}\\)",
      label: "Fraction",
      icon: "½",
      desc: "Fraction",
    },
    { code: "\\(x^2\\)", label: "Square", icon: "x²", desc: "Square" },
    { code: "\\(\\sqrt{x}\\)", label: "Root", icon: "√", desc: "Square root" },
    {
      code: "$$\\sum_{i=1}^{n} i$$",
      label: "Sum",
      icon: "∑",
      desc: "Summation",
    },
    {
      code: "$$\\int_{a}^{b} f(x)dx$$",
      label: "Integral",
      icon: "∫",
      desc: "Integral",
    },
    {
      code: "$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$",
      label: "Quadratic",
      icon: "🔢",
      desc: "Quadratic formula",
    },

    // Formatting
    { code: "**bold**", label: "Bold", icon: "𝐁", desc: "Bold text" },
    { code: "*italic*", label: "Italic", icon: "𝐼", desc: "Italic text" },
    {
      code: "~~strikethrough~~",
      label: "Strike",
      icon: "~~",
      desc: "Strikethrough",
    },
    { code: "`code`", label: "Code", icon: "{}", desc: "Inline code" },
    {
      code: "```js\nconsole.log('hello')\n```",
      label: "Code block",
      icon: "⌨️",
      desc: "Code block",
    },
    { code: "- List item", label: "Bullet", icon: "•", desc: "Bullet list" },
    {
      code: "1. Numbered",
      label: "Numbered",
      icon: "1.",
      desc: "Numbered list",
    },
    { code: "> Quote", label: "Quote", icon: "❝", desc: "Blockquote" },
    { code: "---", label: "HR", icon: "—", desc: "Horizontal rule" },
    { code: "[Link](url)", label: "Link", icon: "🔗", desc: "Hyperlink" },
    { code: "![Alt](image.jpg)", label: "Image", icon: "🖼️", desc: "Image" },
    {
      code: "| Col1 | Col2 |\n|------|------|\n| Data1 | Data2 |",
      label: "Table",
      icon: "📊",
      desc: "Markdown table",
    },
  ];

  // Sample textbook content with HTML styling
  const sampleContent = `# 📚 ത്രികോണമിതി

## 1.1 സൈൻ നിയമം

<div style="background: #e3f2fd; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; border-left: 5px solid #1976d2;">
  <strong style="color: #1976d2; font-size: 1.2rem;">💡 പ്രധാന സൂത്രവാക്യം:</strong>
  <p align="center" style="font-size: 1.3rem; font-weight: bold; color: #0d47a1;">
    $$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$$
  </p>
</div>

### 📐 ഉദാഹരണം

> "വശം ÷ അതിന്റെ എതിർകോണിന്റെ സൈൻ = സ്ഥിരം"

**ചോദ്യം:** ത്രികോണത്തിൽ \\( A = 30^\\circ \\), \\( B = 45^\\circ \\), \\( a = 10 \\) cm ആയാൽ \\( b \\) കണ്ടെത്തുക.

**പരിഹാരം:**

<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 0.5rem;">

$$
\\frac{a}{\\sin A} = \\frac{b}{\\sin B}
$$

$$
\\frac{10}{\\sin 30^\\circ} = \\frac{b}{\\sin 45^\\circ}
$$

$$
b = \\frac{10 \\times \\sin 45^\\circ}{\\sin 30^\\circ}
$$

</div>

<div align="center" style="background: #e8f5e8; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; border: 2px solid #4caf50;">
  <p style="font-size: 1.5rem; color: #2e7d32; font-weight: bold;">
    $$b = 10\\sqrt{2} \\approx 14.14 \\text{ cm}$$
  </p>
</div>

---

## 1.2 പ്രയോഗങ്ങൾ

<details style="background: #fff3e0; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
  <summary style="font-weight: bold; color: #e65100; cursor: pointer;">📋 സൈൻ നിയമം ഉപയോഗിക്കുന്ന സാഹചര്യങ്ങൾ (Click to expand)</summary>
  
  <ul style="margin-top: 1rem; list-style-type: none;">
    <li style="padding: 0.5rem; background: white; margin: 0.3rem 0; border-radius: 0.3rem;">
      ✅ <strong>രണ്ട് കോണുകളും ഒരു വശവും</strong> അറിയാമെങ്കിൽ
    </li>
    <li style="padding: 0.5rem; background: white; margin: 0.3rem 0; border-radius: 0.3rem;">
      ✅ <strong>രണ്ട് വശങ്ങളും ഒരു കോണും</strong> അറിയാമെങ്കിൽ
    </li>
    <li style="padding: 0.5rem; background: white; margin: 0.3rem 0; border-radius: 0.3rem;">
      ✅ <strong>ത്രികോണമിതി പ്രശ്നങ്ങൾ</strong> പരിഹരിക്കാൻ
    </li>
  </ul>
</details>

<marquee behavior="alternate" style="padding: 0.5rem; background: #ffeb3b; border-radius: 0.5rem; font-weight: bold;">
  ⭐ നോക്കുക: സൈൻ നിയമം, കോസൈൻ നിയമം, ഹെറോണിന്റെ സൂത്രവാക്യം ⭐
</marquee>

## 📊 താരതമ്യ പട്ടിക

<div style="overflow-x: auto; margin: 1rem 0;">
  <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 0.5rem; overflow: hidden;">
    <thead style="background: #1976d2; color: white;">
      <tr>
        <th style="padding: 0.8rem;">നിയമം</th>
        <th style="padding: 0.8rem;">സൂത്രവാക്യം</th>
        <th style="padding: 0.8rem;">ഉപയോഗം</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 0.8rem; font-weight: bold;">സൈൻ നിയമം</td>
        <td style="padding: 0.8rem;">$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B}$$</td>
        <td style="padding: 0.8rem;">കോണുകളും വശങ്ങളും തമ്മിൽ</td>
      </tr>
      <tr style="border-bottom: 1px solid #e0e0e0; background: #f5f5f5;">
        <td style="padding: 0.8rem; font-weight: bold;">കോസൈൻ നിയമം</td>
        <td style="padding: 0.8rem;">$$c^2 = a^2 + b^2 - 2ab\\cos C$$</td>
        <td style="padding: 0.8rem;">എല്ലാ വശങ്ങളും തമ്മിൽ</td>
      </tr>
      <tr>
        <td style="padding: 0.8rem; font-weight: bold;">ഹെറോണിന്റെ സൂത്രവാക്യം</td>
        <td style="padding: 0.8rem;">$$\\Delta = \\sqrt{s(s-a)(s-b)(s-c)}$$</td>
        <td style="padding: 0.8rem;">വിസ്തീർണ്ണം കണ്ടെത്താൻ</td>
      </tr>
    </tbody>
  </table>
</div>

<div align="right" style="margin-top: 2rem; font-style: italic; border-top: 2px dashed #ccc; padding-top: 1rem;">
  <p style="color: #666;">— ഗണിത പാഠപുസ്തകം, ക്ലാസ് 10</p>
</div>`;

  const handleSave = async () => {
    if (!content.trim()) {
      alert("ദയവായി ഉള്ളടക്കം നൽകുക");
      return;
    }

    if (!id) {
      alert("Lesson ID ലഭ്യമല്ല");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", content);
      formData.append("subject", "maths");
      formData.append("format", "markdown");
      formData.append("pageNumber", pageNumber);
      formData.append("lessonId", lessonId);

      if (teacherId) {
        formData.append("teacherId", teacherId);
      }

      uploadedImages.forEach((image) => {
        if (image.isExisting && image._id) {
          formData.append("existingMediaIds", image._id);
        }

        if (!image.isExisting && image.file) {
          formData.append("media", image.file);
          formData.append("imageNames", image.name);
        }
      });

      imagesToDelete.forEach((imageId) => {
        formData.append("imagesToDelete", imageId);
      });

      const result = await updateLesson({ id, formData }).unwrap();

      if (result.success) {
        onSuccess?.(result.lessonId);

        const saveBtn = document.querySelector(".save-btn");
        if (saveBtn) {
          saveBtn.textContent = "✅ അപ്ഡേറ്റ് ചെയ്തു!";
          setTimeout(() => {
            saveBtn.textContent = "📚 ലെസ്സൺ അപ്ഡേറ്റ് ചെയ്യുക";
          }, 2000);
        }
      } else {
        alert(result.error || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert(err?.data?.error || err.message || "Failed to update");
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
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

    try {
      const imageName = `image_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${file.name.split(".").pop()}`;

      const newImage = {
        file: file,
        name: imageName,
        preview: URL.createObjectURL(file),
        size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
        isExisting: false,
      };

      setUploadedImages((prev) => [...prev, newImage]);

      insertAtCursor(`![${imageName}](${imageName})\n\n`);
    } catch (error) {
      console.error("Image processing error:", error);
      alert("ചിത്രം പ്രോസസ്സ് ചെയ്യാനായില്ല.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      const cursorPos = start + text.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 10);
  };

  const removeImage = (index) => {
    const imageToRemove = uploadedImages[index];

    // For new images, revoke object URL
    if (imageToRemove.preview && !imageToRemove.isExisting) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    // For existing images, add to delete list
    if (imageToRemove.isExisting && imageToRemove._id) {
      setImagesToDelete((prev) => [...prev, imageToRemove._id]);
    }

    // Remove from uploadedImages
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));

    // Remove image reference from content
    if (imageToRemove.name) {
      const regex = new RegExp(
        `!\\[.*?\\]\\(${imageToRemove.name}\\)\\s*`,
        "g",
      );
      const newContent = content.replace(regex, "");
      setContent(newContent);
    }
  };

  // ✅ FIXED: Image renderer with proper HTML support
  const ImageRenderer = ({ src, alt }) => {
    const [imageError, setImageError] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    // Find image in uploaded images
    const matchedImage = uploadedImages.find((img) => {
      if (!img?.name) return false;
      return (
        src === img.name ||
        src?.endsWith(img.name) ||
        img.name === src?.split("/").pop() ||
        src?.includes(img.name)
      );
    });

    let imageSrc = src;
    if (matchedImage) {
      imageSrc = matchedImage.preview || matchedImage.url || src;
    }

    if (imageError) {
      return (
        <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center border border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            🖼️ ചിത്രം ലഭ്യമല്ല: {alt || src?.split("/").pop() || "Unnamed"}
          </p>
          {alt && alt !== src && (
            <p className="text-gray-400 text-xs mt-1 italic">{alt}</p>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="relative group my-4">
          <img
            src={imageSrc}
            alt={alt || "Lesson image"}
            className="max-w-full h-auto rounded-lg shadow-md mx-auto border border-gray-200 dark:border-gray-700 cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
            onError={() => setImageError(true)}
          />
          {alt && alt !== src && (
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-2 italic">
              {alt}
            </p>
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

  // ✅ COMPLETE markdown components with HTML support
  const components = {
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
    p: ({ node, children, ...props }) => {
      // Check if paragraph contains only an image
      const hasOnlyImage = React.Children.toArray(children).every(
        (child) => React.isValidElement(child) && child.type === "img",
      );

      if (hasOnlyImage) {
        return <>{children}</>;
      }

      return (
        <p
          className="text-gray-700 dark:text-gray-300 leading-relaxed my-3"
          style={{ fontSize: `${fontSize}%` }}
          {...props}
        >
          {children}
        </p>
      );
    },

    // Images
    img: ({ node, src, alt, ...props }) => (
      <ImageRenderer src={src} alt={alt} />
    ),

    // Code blocks
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
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
          <SyntaxHighlighter
            style={isDarkMode ? vscDarkPlus : oneLight}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: 0,
            }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code
          className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-sm"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Headings with font size scaling
    h1: ({ node, children, ...props }) => (
      <h1
        className="text-4xl font-bold text-gray-900 dark:text-white mt-6 mb-4 pb-2 border-b-2 border-blue-200 dark:border-blue-800"
        style={{ fontSize: `${fontSize * 1.5}%` }}
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }) => (
      <h2
        className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-5 mb-3 pb-2 border-b border-blue-100 dark:border-blue-900"
        style={{ fontSize: `${fontSize * 1.4}%` }}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3
        className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2"
        style={{ fontSize: `${fontSize * 1.3}%` }}
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ node, children, ...props }) => (
      <h4
        className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-1"
        style={{ fontSize: `${fontSize * 1.2}%` }}
        {...props}
      >
        {children}
      </h4>
    ),
    h5: ({ node, children, ...props }) => (
      <h5
        className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-1"
        style={{ fontSize: `${fontSize * 1.1}%` }}
        {...props}
      >
        {children}
      </h5>
    ),
    h6: ({ node, children, ...props }) => (
      <h6
        className="text-base font-semibold text-gray-700 dark:text-gray-300 mt-2 mb-1"
        style={{ fontSize: `${fontSize}%` }}
        {...props}
      >
        {children}
      </h6>
    ),

    // Lists
    ul: ({ node, children, ...props }) => (
      <ul
        className="list-disc pl-5 my-3 space-y-1 text-gray-700 dark:text-gray-300"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }) => (
      <ol
        className="list-decimal pl-5 my-3 space-y-1 text-gray-700 dark:text-gray-300"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }) => (
      <li className="text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </li>
    ),

    // Blockquotes
    blockquote: ({ node, children, ...props }) => (
      <blockquote
        className="border-l-4 border-blue-400 dark:border-blue-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4 bg-blue-50 dark:bg-blue-900/20 py-2 pr-2 rounded-r"
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Tables
    table: ({ node, children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table
          className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ node, children, ...props }) => (
      <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ node, children, ...props }) => (
      <tbody
        className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
        {...props}
      >
        {children}
      </tbody>
    ),
    tr: ({ node, children, ...props }) => (
      <tr
        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        {...props}
      >
        {children}
      </tr>
    ),
    th: ({ node, children, ...props }) => (
      <th
        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-700"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ node, children, ...props }) => (
      <td
        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700"
        {...props}
      >
        {children}
      </td>
    ),

    // Links
    a: ({ node, href, children, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
        {...props}
      >
        {children}
      </a>
    ),

    // Text formatting
    strong: ({ node, children, ...props }) => (
      <strong className="font-bold text-gray-900 dark:text-white" {...props}>
        {children}
      </strong>
    ),
    em: ({ node, children, ...props }) => (
      <em className="italic text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </em>
    ),
    del: ({ node, children, ...props }) => (
      <del className="line-through text-gray-500 dark:text-gray-500" {...props}>
        {children}
      </del>
    ),
    hr: ({ node, ...props }) => (
      <hr
        className="my-6 border-t border-gray-300 dark:border-gray-700"
        {...props}
      />
    ),
    pre: ({ node, children, ...props }) => (
      <pre
        className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto my-4"
        {...props}
      >
        {children}
      </pre>
    ),

    // HTML5 elements
    details: ({ node, children, ...props }) => (
      <details
        className="my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        {...props}
      >
        {children}
      </details>
    ),
    summary: ({ node, children, ...props }) => (
      <summary
        className="font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
        {...props}
      >
        {children}
      </summary>
    ),
    figure: ({ node, children, ...props }) => (
      <figure className="my-4" {...props}>
        {children}
      </figure>
    ),
    figcaption: ({ node, children, ...props }) => (
      <figcaption
        className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2"
        {...props}
      >
        {children}
      </figcaption>
    ),
    iframe: ({ node, src, title, ...props }) => (
      <div className="my-4 relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
        <iframe
          src={src}
          title={title || "Embedded content"}
          className="absolute top-0 left-0 w-full h-full"
          allowFullScreen
          {...props}
        />
      </div>
    ),
    video: ({ node, src, ...props }) => (
      <div className="my-4 rounded-lg overflow-hidden shadow-lg">
        <video src={src} controls className="w-full" {...props} />
      </div>
    ),
    audio: ({ node, src, ...props }) => (
      <div className="my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <audio src={src} controls className="w-full" {...props} />
      </div>
    ),

    // Deprecated HTML
    center: ({ node, children, ...props }) => (
      <div className="text-center" {...props}>
        {children}
      </div>
    ),
    font: ({ node, color, size, face, children, ...props }) => (
      <span
        style={{
          color: color,
          fontSize: size,
          fontFamily: face,
        }}
        {...props}
      >
        {children}
      </span>
    ),
    marquee: ({ node, children, ...props }) => (
      <marquee
        className="my-4 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded"
        {...props}
      >
        {children}
      </marquee>
    ),
    blink: ({ node, children, ...props }) => (
      <span className="animate-pulse" {...props}>
        {children}
      </span>
    ),
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="container mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              ലെസ്സൺ ഡാറ്റ ലോഡ് ചെയ്യുന്നു...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isErrorData) {
    return (
      <div className="container mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400 font-medium">
            Error: {isErrorData.data?.error || isErrorData.message}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ബാക്ക്
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <div className="container mx-auto p-3 md:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span>📚</span> പാഠപുസ്തക എഡിറ്റർ
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
              {lessonData?.lesson?.title || "Loading..."}
            </p>
            {lessonData?.lesson && (
              <div className="flex flex-wrap gap-2 md:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                <span>📄 പേജ്: {lessonData.lesson.pageNumber}</span>
                <span>
                  📅{" "}
                  {new Date(lessonData.lesson.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? "Light mode" : "Dark mode"}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* Font Size Controls (Desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <span className="text-sm">A-</span>
              </button>
              <span className="text-sm w-12 text-center dark:text-white">
                {fontSize}%
              </span>
              <button
                onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <span className="text-sm">A+</span>
              </button>
            </div>

            <button
              className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors font-medium flex items-center gap-2"
              onClick={() => setContent(sampleContent)}
            >
              <span>📋</span> സാമ്പിൾ
            </button>

            {/* Mobile Tab Toggle */}
            {isMobile && (
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "write"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  ✏️ എഴുതുക
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "preview"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  👁️ കാണുക
                </button>
              </div>
            )}

            {/* Desktop Preview Toggle */}
            {!isMobile && (
              <button
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors font-medium flex items-center gap-2"
                onClick={() => setPreview(!preview)}
              >
                <span>{preview ? "✏️" : "👁️"}</span>
                {preview ? "എഡിറ്റ്" : "പ്രിവ്യൂ"}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 font-medium">
              Error: {error.data?.error || error.message}
            </p>
          </div>
        )}

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && !preview && activeTab !== "preview" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span>📁</span> അപ്‌ലോഡ് ചെയ്ത ചിത്രങ്ങൾ ({uploadedImages.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border dark:border-gray-600">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {image.isExisting ? "Existing" : image.size}
                      </p>
                      <code className="text-xs text-blue-600 dark:text-blue-400 mt-1 block truncate">
                        ![]({image.name})
                      </code>
                    </div>
                  </div>
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {isMobile ? (
          // Mobile: Tabbed Interface
          <div className="min-h-[500px]">
            {activeTab === "write" ? (
              <>
                {/* Title & Page Number */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      📘 പാഠത്തിന്റെ പേര്
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., ത്രികോണമിതി - പാഠം 1"
                      className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-base bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      📄 പേജ് നമ്പർ
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={pageNumber}
                      onChange={(e) => setPageNumber(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-base bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Mobile Toolbar */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <button
                      onClick={() => insertAtCursor("# ")}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => insertAtCursor("## ")}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg text-sm font-bold text-blue-600 dark:text-blue-400"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => insertAtCursor("**bold**")}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg text-sm font-bold text-blue-600 dark:text-blue-400"
                    >
                      𝐁
                    </button>
                    <button
                      onClick={() => insertAtCursor("*italic*")}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg text-sm italic text-blue-600 dark:text-blue-400"
                    >
                      I
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 bg-green-500 text-white rounded-lg text-sm"
                    >
                      📷
                    </button>
                    <button
                      onClick={() => insertAtCursor("\\(\\frac{a}{b}\\)")}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg text-sm text-purple-600 dark:text-purple-400"
                    >
                      ½
                    </button>
                    <button
                      onClick={() => insertAtCursor("$$\\sum_{i=1}^{n} i$$")}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg text-sm text-purple-600 dark:text-purple-400"
                    >
                      ∑
                    </button>
                    <button
                      onClick={() => insertAtCursor("> Quote")}
                      className="p-2 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400"
                    >
                      ❝
                    </button>
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  className="w-full h-[400px] p-4 font-mono text-base border-2 border-blue-300 dark:border-blue-700 rounded-xl bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-800 dark:to-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none transition-all resize-y"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="📝 ഇവിടെ എഴുതുക..."
                />
              </>
            ) : (
              // Mobile Preview
              <div className="min-h-[500px] p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[
                      rehypeRaw,
                      [rehypeSanitize, customSanitizeSchema], // ✅ CUSTOM SCHEMA
                      rehypeKatex,
                    ]}
                    components={components}
                  >
                    {content || "ഉള്ളടക്കം ഇല്ല"}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Desktop: Side by Side
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Editor */}
            <div className="space-y-4">
              {/* Title & Page Number */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    📘 പാഠത്തിന്റെ പേര്
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., ത്രികോണമിതി - പാഠം 1"
                    className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-base bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    📄 പേജ് നമ്പർ
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-base bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Desktop Toolbar */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-100 dark:border-gray-700">
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                  >
                    {isUploading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
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

                  <button
                    onClick={() => setContent(sampleContent)}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors font-medium flex items-center gap-2"
                  >
                    <span>📋</span> Sample
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm("മായ്ക്കണോ?")) {
                        setContent("");
                        setUploadedImages([]);
                      }
                    }}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors font-medium flex items-center gap-2"
                  >
                    <span>🗑️</span> Clear
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Quick Insert Grid */}
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-white dark:bg-gray-800 rounded-lg">
                  {snippets.map((snippet, index) => (
                    <button
                      key={index}
                      onClick={() => insertAtCursor(snippet.code)}
                      className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg text-xs flex flex-col items-center gap-1 transition-all"
                      title={snippet.desc}
                    >
                      <span className="text-base">{snippet.icon}</span>
                      <span className="text-gray-700 dark:text-gray-300 truncate w-full text-center">
                        {snippet.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                ref={textareaRef}
                className="w-full h-[500px] p-4 font-mono text-base border-2 border-blue-300 dark:border-blue-700 rounded-xl bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-800 dark:to-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none transition-all resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="📝 ഇവിടെ എഴുതുക..."
              />
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <span>👁️</span> തത്സമയ പ്രിവ്യൂ
                </h3>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                  {fontSize}% ഫോണ്ട്
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none h-[600px] overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[
                    rehypeRaw,
                    [rehypeSanitize, customSanitizeSchema], // ✅ CUSTOM SCHEMA
                    rehypeKatex,
                  ]}
                  components={components}
                >
                  {content || "ഉള്ളടക്കം ഇല്ല"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className="save-btn w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            onClick={handleSave}
            disabled={isLoading || !content}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                അപ്ഡേറ്റ് ചെയ്യുന്നു...
              </>
            ) : (
              <>
                <span>📚</span>
                ലെസ്സൺ അപ്ഡേറ്റ് ചെയ്യുക
              </>
            )}
          </button>
        </div>

        {/* Help Tips */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
            <span>💡</span> പ്രൊഫഷണൽ ടിപ്സ്:
          </p>
          <ul className="mt-2 text-amber-700 dark:text-amber-400 text-sm space-y-1">
            <li>
              • <strong>HTML Styling:</strong> &lt;p style="color: blue;
              background: #f0f0f0; padding: 10px;"&gt;Text&lt;/p&gt;
            </li>
            <li>
              • <strong>Math:</strong> \\(...\\) - ഇൻലൈൻ, $$...$$ - ഡിസ്പ്ലേ
              സമവാക്യങ്ങൾ
            </li>
            <li>
              • <strong>Tables:</strong> | Col1 | Col2 | - മാർക്ക്ഡൗൺ പട്ടികകൾ
            </li>
            <li>
              • <strong>Details:</strong>{" "}
              &lt;details&gt;&lt;summary&gt;Click&lt;/summary&gt;Content&lt;/details&gt;
            </li>
            <li>
              • <strong>Alignments:</strong> &lt;p align="right"&gt;, &lt;div
              align="center"&gt;
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChapterRelatedPageDisplayEdit;
