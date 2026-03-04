import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import {
  useUpdateLessonMutation,
  useGetLessonByIdQuery,
} from "../../store/api/MathsLessonApi";

import { useParams, useNavigate } from "react-router-dom";

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

  const { id } = useParams();
  const navigate = useNavigate();
  const lessonId = id;

  // Fetch existing lesson data
  const {
    data: lessonData,
    isLoading: isLoadingData,
    error: isErrorData,
  } = useGetLessonByIdQuery(lessonId);

  // Update mutation
  const [updateLesson, { isLoading, error }] = useUpdateLessonMutation();
  console.log("Loading lesson data:", lessonData);
  // Effect to populate form with existing data
  // Effect to populate form with existing data
  useEffect(() => {
    if (
      lessonData &&
      lessonData.success &&
      lessonData.lesson &&
      lessonData.lesson._id
    ) {
      console.log("Loading lesson data:", lessonData.lesson);

      const lesson = lessonData.lesson;

      // Set content
      if (lesson.content) {
        setContent(lesson.content);
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
          name: image.url.split("/").pop(), // Extract filename from URL
          preview: image.url,
          url: image.url,
          isExisting: true,
          _id: image._id,
          file: null, // No file for existing images
          size: "Existing", // Placeholder
        }));
        setUploadedImages(uploadedImagesData);
      }
    }
  }, [lessonData]);

  // Loading state
  if (isLoadingData) {
    return (
      <div className="container mx-auto p-6 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
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
      <div className="container mx-auto p-6 bg-white rounded-2xl shadow-xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">
            Error: {isErrorData.data?.error || isErrorData.message}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ബാക്ക്
          </button>
        </div>
      </div>
    );
  }

  // Markdown + Math snippets
  const snippets = [
    // Headings
    { code: "# ", label: "H1 Heading", icon: "H1" },
    { code: "## ", label: "H2 Heading", icon: "H2" },
    { code: "### ", label: "H3 Heading", icon: "H3" },
    { code: "#### ", label: "H4 Heading", icon: "H4" },
    { code: "##### ", label: "H5 Heading", icon: "H5" },
    { code: "###### ", label: "H6 Heading", icon: "H6" },

    // **തിരുത്തിയ MATH snippets:**
    { code: "$\n\\frac{a}{b}\n$", label: "ഭിന്നസംഖ്യ", icon: "½" },
    { code: "$\nx^{2}\n$", label: "വർഗം", icon: "x²" },
    {
      code: "$\n\\sqrt{x}\n$$\n",
      label: "വർഗമൂലം",
      icon: "√",
    },
    {
      code: "$$\n\\sum_{i=1}^{n} i\n$$\n",
      label: "സംഗ്രഹം",
      icon: "∑",
    },
    {
      code: "$$\n\\int_{a}^{b} f(x)\\,dx\n$$\n",
      label: "ഇന്റഗ്രൽ",
      icon: "∫",
    },

    // Formatting
    { code: "**bold text**", label: "Bold", icon: "𝐁" },
    { code: "*italic text*", label: "Italic", icon: "𝐼" },
    { code: "- List item", label: "List", icon: "•" },
    { code: "1. Numbered", label: "Numbered List", icon: "1." },
  ];

  // Sample textbook content
  const sampleContent = `# ത്രികോണമിതി

## സൈൻ നിയമം

ഒരു ത്രികോണത്തിൽ, സൈൻ നിയമം ഉപയോഗിച്ച് നമുക്ക് വശങ്ങളും കോണുകളും കണ്ടെത്താം.

### സൂത്രവാക്യം

സൈൻ നിയമത്തിന്റെ സൂത്രവാക്യം:

\\\\( \\\\frac{a}{\\\\sin A} = \\\\frac{b}{\\\\sin B} = \\\\frac{c}{\\\\sin C} \\\\)

അല്ലെങ്കിൽ ഡിസ്പ്ലേ രൂപത്തിൽ:

$$
\\\\frac{a}{\\\\sin A} = \\\\frac{b}{\\\\sin B} = \\\\frac{c}{\\\\sin C} = 2R
$$

ഇവിടെ \\( R \\) എന്നത് പരിവൃത്തത്തിന്റെ ആരമാണ്.

## ഉദാഹരണം

**ചോദ്യം:** ത്രികോണത്തിൽ \\( A = 30^\\\\circ \\), \\( B = 45^\\\\circ \\), \\( a = 10 \\) cm ആയാൽ \\( b \\) കണ്ടെത്തുക.

**പരിഹാരം:**

$$
\\\\frac{a}{\\\\sin A} = \\\\frac{b}{\\\\sin B}
$$

$$
\\\\frac{10}{\\\\sin 30^\\\\circ} = \\\\frac{b}{\\\\sin 45^\\\\circ}
$$

$$
b = \\\\frac{10 \\\\times \\\\sin 45^\\\\circ}{\\\\sin 30^\\\\circ}
$$

$$
b = \\\\frac{10 \\\\times \\\\frac{\\\\sqrt{2}}{2}}{\\\\frac{1}{2}} = 10\\\\sqrt{2} \\\\approx 14.14 \\\\text{ cm}
$$

## പ്രയോഗങ്ങൾ

സൈൻ നിയമം ഉപയോഗിക്കുന്ന സാഹചര്യങ്ങൾ:

1. **രണ്ട് കോണുകളും ഒരു വശവും** അറിയാമെങ്കിൽ
2. **രണ്ട് വശങ്ങളും ഒരു കോണും** അറിയാമെങ്കിൽ
3. **ത്രികോണമിതി പ്രശ്നങ്ങൾ** പരിഹരിക്കാൻ

## ചിത്രം

![ത്രികോണം](triangle.png)

## സമാനതകൾ

ഇതും നോക്കുക:

- കോസൈൻ നിയമം
- ത്രികോണത്തിന്റെ വിസ്തീർണ്ണം
- ഹെറോണിന്റെ സൂത്രവാക്യം

## സംഗ്രഹം

സൈൻ നിയമം ത്രികോണമിതിയിലെ **പ്രാഥമിക സൂത്രവാക്യങ്ങളിൽ** ഒന്നാണ്. ഇത് ഓർക്കാൻ:

> "വശം ÷ അതിന്റെ എതിർകോണിന്റെ സൈൻ = സ്ഥിരം"

ഈ സ്ഥിരം ത്രികോണത്തിന്റെ പരിവൃത്ത വ്യാസത്തിന് തുല്യമാണ്.`;

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
          saveBtn.textContent = "✅ എഡിറ്റ് ചെയ്തു!";
          setTimeout(() => {
            saveBtn.textContent = "ലെസ്സൺ അപ്ഡേറ്റ് ചെയ്യുക";
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

  // Custom renderers for ReactMarkdown
  // Custom renderers for ReactMarkdown
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

    // ✅ COMPLETELY FIXED IMAGE RENDERER - useState ഇല്ല
    img: ({ node, src, alt, ...props }) => {
      // Safety check
      if (!src) return null;

      // Try to find the image in uploadedImages (for preview mode)
      const matchedImage = uploadedImages.find((img) => {
        if (!img?.name) return false;

        const imgName = img.name;
        return (
          src === imgName ||
          src?.endsWith(imgName) ||
          imgName === src?.split("/").pop() ||
          src?.includes(imgName)
        );
      });

      // Determine the correct image source
      let imageSrc = src;
      let isBlobUrl = false;

      if (matchedImage) {
        // Priority: preview (blob URL) > url (server URL) > original src
        imageSrc = matchedImage.preview || matchedImage.url || src;
        isBlobUrl = imageSrc?.startsWith("blob:");

        if (isBlobUrl) {
          console.log(`✅ Blob URL found for: ${src}`);
        }
      }

      // Custom fallback component without useState
      const renderFallback = () => (
        <div className="my-4 p-4 bg-gray-100 rounded-lg text-center border border-gray-300">
          <p className="text-gray-500 text-sm">
            🖼️ ചിത്രം ലഭ്യമല്ല: {alt || src?.split("/").pop() || "Unnamed"}
          </p>
          {alt && alt !== src && (
            <p className="text-gray-400 text-xs mt-1 italic">{alt}</p>
          )}
        </div>
      );

      // Use a key to force re-render if needed
      const imgKey = `img-${src}-${Date.now()}`;

      return (
        <div className="my-4" key={imgKey}>
          <img
            src={imageSrc}
            alt={alt || "Lesson image"}
            className="max-w-full h-auto rounded-lg shadow-md mx-auto border border-gray-200"
            onError={(e) => {
              console.error("💥 Image failed to load:", {
                requestedSrc: src,
                attemptedSrc: imageSrc,
                alt: alt,
                isBlobUrl: isBlobUrl,
              });

              // Replace with fallback content
              const parent = e.target.parentNode;
              if (parent) {
                // Create fallback element
                const fallbackDiv = document.createElement("div");
                fallbackDiv.className =
                  "my-4 p-4 bg-gray-100 rounded-lg text-center border border-gray-300";
                fallbackDiv.innerHTML = `
                <p class="text-gray-500 text-sm">
                  🖼️ ചിത്രം ലഭ്യമല്ല: ${alt || src?.split("/").pop() || "Unnamed"}
                </p>
                ${alt && alt !== src ? `<p class="text-gray-400 text-xs mt-1 italic">${alt}</p>` : ""}
              `;

                // Replace img with fallback
                parent.innerHTML = "";
                parent.appendChild(fallbackDiv);
              }
            }}
          />
          {alt && alt !== src && (
            <p className="text-center text-gray-600 text-sm mt-2 italic">
              {alt}
            </p>
          )}
        </div>
      );
    },

    h1: ({ node, ...props }) => (
      <h1
        className="text-3xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-blue-200"
        {...props}
      />
    ),

    h2: ({ node, ...props }) => (
      <h2
        className="text-2xl font-bold text-gray-800 mt-5 mb-3 pb-2 border-b border-blue-100"
        {...props}
      />
    ),

    h3: ({ node, ...props }) => (
      <h3
        className="text-xl font-semibold text-gray-700 mt-4 mb-2"
        {...props}
      />
    ),

    h4: ({ node, ...props }) => (
      <h4
        className="text-lg font-semibold text-gray-700 mt-3 mb-1"
        {...props}
      />
    ),

    h5: ({ node, ...props }) => (
      <h5
        className="text-base font-semibold text-gray-700 mt-2 mb-1"
        {...props}
      />
    ),

    h6: ({ node, ...props }) => (
      <h6
        className="text-sm font-semibold text-gray-700 mt-2 mb-1"
        {...props}
      />
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
        <p className="text-gray-700 leading-relaxed my-3" {...props}>
          {children}
        </p>
      );
    },

    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-blue-400 pl-4 italic text-gray-600 my-4 bg-blue-50 py-2 pr-2 rounded-r"
        {...props}
      />
    ),

    ul: ({ node, ...props }) => (
      <ul className="list-disc pl-5 my-3 space-y-1" {...props} />
    ),

    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-5 my-3 space-y-1" {...props} />
    ),

    li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,

    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table
          className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg"
          {...props}
        />
      </div>
    ),

    thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,

    tbody: ({ node, ...props }) => (
      <tbody className="bg-white divide-y divide-gray-200" {...props} />
    ),

    tr: ({ node, ...props }) => <tr className="hover:bg-gray-50" {...props} />,

    th: ({ node, ...props }) => (
      <th
        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
        {...props}
      />
    ),

    td: ({ node, ...props }) => (
      <td className="px-4 py-2 text-sm text-gray-700 border-b" {...props} />
    ),

    a: ({ node, ...props }) => (
      <a
        className="text-blue-600 hover:text-blue-800 hover:underline"
        {...props}
      />
    ),

    strong: ({ node, ...props }) => (
      <strong className="font-bold text-gray-900" {...props} />
    ),

    em: ({ node, ...props }) => (
      <em className="italic text-gray-800" {...props} />
    ),

    del: ({ node, ...props }) => (
      <del className="line-through text-gray-500" {...props} />
    ),

    hr: ({ node, ...props }) => (
      <hr className="my-6 border-t border-gray-300" {...props} />
    ),

    pre: ({ node, ...props }) => (
      <pre
        className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto my-4"
        {...props}
      />
    ),
  };

  return (
    <div className="container mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            📚 പാഠപുസ്തക എഡിറ്റർ - {lessonData?.title || "Loading..."}
          </h1>
          <p className="text-gray-600 mt-1">
            {lessonData
              ? `Editing: ${lessonData.title}`
              : "Markdown + LaTeX ഉപയോഗിച്ച് മുഴുനീളം പാഠപുസ്തകങ്ങൾ എഴുതുക"}
          </p>
          {lessonData && (
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>📄 Page: {lessonData.pageNumber}</span>
              <span>
                📅 Created:{" "}
                {new Date(lessonData.createdAt).toLocaleDateString()}
              </span>
              <span>🔄 Versions: {lessonData.versions?.length || 0}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
          <button
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-2"
            onClick={() => setContent(sampleContent)}
          >
            <span>📋</span> സാമ്പിൾ പാഠം
          </button>
          <button
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center gap-2"
            onClick={() => setPreview(!preview)}
          >
            <span>{preview ? "✏️" : "👁️"}</span>
            {preview ? "എഡിറ്റ് മോഡ്" : "പ്രിവ്യൂ മോഡ്"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">
            Error: {error.data?.error || error.message}
          </p>
        </div>
      )}

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && !preview && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>📁</span> അപ്‌ലോഡ് ചെയ്ത ചിത്രങ്ങൾ ({uploadedImages.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {image.isExisting ? "Existing" : image.size} •{" "}
                      {image.isExisting
                        ? "Stored"
                        : image.file?.type.split("/")[1].toUpperCase()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 font-mono truncate">
                      ![alt text]({image.name})
                    </p>
                    {image.isExisting && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                        Existing
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-200"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Mode */}
      {preview ? (
        <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200 min-h-[400px]">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              📖 പാഠപുസ്തക പ്രിവ്യൂ
            </span>
            <span className="text-gray-500 text-sm">
              ഇതാണ് വിദ്യാർത്ഥികൾക്ക് കാണാൻ കിട്ടുന്നത്
            </span>
            {uploadedImages.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                📁 {uploadedImages.length} ചിത്രങ്ങൾ
              </span>
            )}
          </div>

          <div className="prose prose-lg max-w-none p-6 bg-white rounded-lg shadow-inner">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
              components={components}
            >
              {content || "ഉള്ളടക്കം ഇല്ല. എഡിറ്റ് ബട്ടൺ അമർത്തി എഴുതുക."}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Image Upload */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg">
                  {isUploading ? (
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
                      അപ്‌ലോഡ് ചെയ്യുന്നു...
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        ></path>
                      </svg>
                      ചിത്രം അപ്‌ലോഡ് ചെയ്യുക
                    </>
                  )}
                </div>
              </label>

              {/* Clear Button */}
              <button
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                onClick={() => {
                  if (window.confirm("നിങ്ങൾക്ക് ഉള്ളടക്കം മായ്ക്കണമോ?")) {
                    setContent("");
                    setUploadedImages([]);
                  }
                }}
              >
                <span>🗑️</span> മായ്ക്കുക
              </button>
            </div>

            {/* Quick Insert Toolbar */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                ⚡ വേഗത്തിൽ ചേർക്കുക:
              </h3>

              <div className="space-y-3">
                {/* Headings */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Headings:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {snippets.slice(0, 6).map((snippet, index) => (
                      <button
                        key={index}
                        className="px-3 py-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        onClick={() => insertAtCursor(snippet.code)}
                        title={snippet.label}
                      >
                        <span className="font-bold text-blue-700">
                          {snippet.icon}
                        </span>
                        <span className="text-sm text-blue-700">
                          {snippet.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Math */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Math:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {snippets.slice(6, 11).map((snippet, index) => (
                      <button
                        key={index}
                        className="px-3 py-2 bg-white hover:bg-green-50 border border-green-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        onClick={() => insertAtCursor(snippet.code)}
                        title={snippet.label}
                      >
                        <span className="text-lg">{snippet.icon}</span>
                        <span className="text-sm text-green-700">
                          {snippet.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formatting */}
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Formatting:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {snippets.slice(11).map((snippet, index) => (
                      <button
                        key={index}
                        className="px-3 py-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        onClick={() => insertAtCursor(snippet.code)}
                        title={snippet.label}
                      >
                        <span className="font-bold text-purple-700">
                          {snippet.icon}
                        </span>
                        <span className="text-sm text-purple-700">
                          {snippet.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title & Page Number */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                📘 Lesson Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lesson title"
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-base md:text-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>

            {/* Page Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                📄 Page No
              </label>
              <input
                type="number"
                min={1}
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-base md:text-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Text Editor */}
          <div className="mb-6">
            <textarea
              ref={textareaRef}
              className="w-full h-[500px] p-4 font-mono text-base md:text-lg border-2 border-blue-300 rounded-xl bg-gradient-to-b from-blue-50/50 to-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`🎯 ഇവിടെ നിങ്ങളുടെ പാഠപുസ്തകം എഴുതുക...

📚 Headings:
# ഹെഡിംഗ് 1
## ഹെഡിംഗ് 2
### ഹെഡിംഗ് 3

🧮 Math:
Inline: \\( E = mc^2 \\)
Display: $$ \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a} $$

🖼️ Images:
![alt text](image.png)

📝 Formatting:
**bold text**
*italic text*
- List item
1. Numbered list

> Quote

💡 Example Structure:
# Chapter Title
## Section 1
Normal text with inline math \\( x^2 + y^2 = z^2 \\)

$$
\\\\int_0^\\\\infty e^{-x^2} dx = \\\\frac{\\\\sqrt{\\\\pi}}{2}
$$

![Diagram](diagram.png)`}
            />

            <div className="mt-2 text-sm text-gray-500 flex justify-between">
              <span>📝 {content.length} characters</span>
              <span>📁 {uploadedImages.length} images</span>
              <span>💾 Ctrl+S to save</span>
            </div>
          </div>

          {/* Quick Reference Guide */}
          <div className="mb-6 p-5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>📖</span> പാഠപുസ്തക എഴുതാം (സങ്കേതം)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-bold text-gray-700 mb-2">📖 ഘടന</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                      #
                    </code>
                    <span className="text-gray-700">പ്രധാന ഹെഡിംഗ്</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                      ##
                    </code>
                    <span className="text-gray-700">ഉപഹെഡിംഗ്</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                      ###
                    </code>
                    <span className="text-gray-700">ചെറിയ ഹെഡിംഗ്</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-700 mb-2">∫ ഗണിതം</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                      \\(...\\)
                    </code>
                    <span className="text-gray-700">ഇൻലൈൻ സമവാക്യം</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                      $$...$$
                    </code>
                    <span className="text-gray-700">ഡിസ്പ്ലേ സമവാക്യം</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                      \\frac{}
                      {}
                    </code>
                    <span className="text-gray-700">ഭിന്നസംഖ്യ</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-700 mb-2">🎨 ഫോർമാറ്റ്</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                      **text**
                    </code>
                    <span className="text-gray-700">ബോൾഡ്</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                      *text*
                    </code>
                    <span className="text-gray-700">ഇറ്റാലിക്</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                      ![alt](img)
                    </code>
                    <span className="text-gray-700">ചിത്രം</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button
          className="save-btn flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleSave}
          disabled={isLoading || !content}
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
              അപ്ഡേറ്റ് ചെയ്യുന്നു...
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
              ലെസ്സൺ അപ്ഡേറ്റ് ചെയ്യുക
            </>
          )}
        </button>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800 font-medium flex items-center gap-2">
          <span>💡</span> പ്രൊഫഷണൽ ടിപ്സ്:
        </p>
        <ul className="mt-2 text-amber-700 text-sm space-y-1">
          <li>• # ഉപയോഗിച്ച് ഹെഡിംഗ് ചെയ്യുക - യഥാർത്ഥ പാഠപുസ്തകം പോലെ</li>
          <li>• ചിത്രങ്ങൾക്ക് alt text (വിവരണം) നൽകുക - അക്സസിബിൾ</li>
          <li>• \\(...\\) - ഇൻലൈൻ, $$...$$ - ഡിസ്പ്ലേ സമവാക്യങ്ങൾ</li>
          <li>• **ബോൾഡ്**, *ഇറ്റാലിക്* - ഊന്നിപ്പറയാൻ</li>
          <li>• ഓരോ ടോപിക്കും ഹെഡിംഗ് ഉണ്ടാക്കുക - ക്ലീൻ ഘടന</li>
          <li>• പ്രിവ്യൂ മോഡിൽ പൂർണ്ണ പാഠപുസ്തക കാഴ്ച പരിശോധിക്കുക</li>
        </ul>
      </div>
    </div>
  );
};

export default ChapterRelatedPageDisplayEdit;
