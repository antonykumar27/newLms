// /// server/routes/lessons.js
// const express = require("express");
// const router = express.Router();
// const MathsLesson = require("../models/mathsLesson.js");
// const Video = require("../models/videoModel.js");
const {
  sanitizeLessonContent,
  sanitizeText,
  validateMathContent,
  convertInlineToBlockMath,
} = require("../models/sanitize.js"); // Adjust path as needed
// const { multerMiddleware } = require("../config/cloudinary.js");
// const { isAuthenticatedUser } = require("../middlewares/authenticate.js");
const { uploadFileToCloudinary } = require("../config/cloudinary");
// const StandardChapter = require("../models/standardChapterScheema.js");
// const StandardPage = require("../models/StandardPageScheema.js");
// const StandardSubject = require("../models/standardSubjectSchema.js");
const fs = require("fs");
// const Enrollment = require("../models/enrollment.js");
/// server/routes/lessons.js

const StandardChapter = require("../models/standardChapterScheema.js");
const StandardPage = require("../models/StandardPageScheema.js");
const StandardSubject = require("../models/standardSubjectSchema.js");

// router.post(
//   "/save",
//   isAuthenticatedUser,
//   multerMiddleware,
//   async (req, res) => {
//     const startTime = Date.now();
//     const teacherId = req.user.id;

//     try {
//       const { title, content, subject, description, chapterId, pageNumber } =
//         req.body;

//       /* ---------- VALIDATION ---------- */
//       if (!chapterId) {
//         return res.status(400).json({
//           success: false,
//           message: "chapterId is required",
//         });
//       }

//       // 1️⃣ Get chapter
//       const chapterDoc =
//         await StandardChapter.findById(chapterId).select("subjectId");

//       if (!chapterDoc) {
//         return res.status(404).json({
//           success: false,
//           error: "Chapter not found",
//         });
//       }

//       const subjectId = chapterDoc.subjectId;

//       // 2️⃣ Get subject
//       const subjectDoc =
//         await StandardSubject.findById(subjectId).select("standardId");

//       if (!subjectDoc) {
//         return res.status(404).json({
//           success: false,
//           error: "Subject not found",
//         });
//       }

//       const standardId = subjectDoc.standardId;
//       // ============================================
//       // 1. VALIDATION
//       // ============================================
//       if (!title || !title.trim()) {
//         return res.status(400).json({
//           success: false,
//           error: "Lesson title is required",
//         });
//       }

//       if (!content || !content.trim()) {
//         return res.status(400).json({
//           success: false,
//           error: "Lesson content cannot be empty",
//         });
//       }

//       if (title.length > 200) {
//         return res.status(400).json({
//           success: false,
//           error: "Title must be less than 200 characters",
//         });
//       }

//       if (content.length > 50000) {
//         return res.status(400).json({
//           success: false,
//           error: "Content too large (max 50,000 characters)",
//         });
//       }
//       // ============================================
//       // 2. MATH VALIDATION (BEFORE SANITIZATION)
//       // ============================================
//       const validation = validateMathContent(content);
//       if (!validation.isValid && validation.warnings.length > 0) {
//         console.warn("⚠️ Math validation warnings:", validation.warnings);

//         // Option 1: Auto-convert inline math to block math
//         const convertedContent = convertInlineToBlockMath(content);

//         // Continue with converted content
//         var contentToSanitize = convertedContent;
//       } else {
//         var contentToSanitize = content;
//       }
//       // ============================================
//       // 3. SANITIZATION
//       // ============================================
//       const sanitizedContent = sanitizeLessonContent(contentToSanitize);
//       const sanitizedTitle = sanitizeText(title.trim());
//       const sanitizedSubject = sanitizeText(subject || "maths");
//       const sanitizedDescription = sanitizeText(description || "");

//       // Check if content has meaningful LaTeX
//       const hasLatex =
//         sanitizedContent.includes("$$") ||
//         sanitizedContent.includes("\\begin{") ||
//         sanitizedContent.includes("\\frac") ||
//         sanitizedContent.includes("\\[") ||
//         sanitizedContent.includes("\\(");

//       // ============================================
//       // 3. DEBUG LOGGING
//       // ============================================

//       // Warn if LaTeX content but no math markers
//       if (sanitizedContent.includes("&") && !hasLatex) {
//         console.warn("⚠️  Content contains & but no LaTeX markers");
//       }

//       // ============================================
//       // 4. MEDIA UPLOAD (OPTIONAL)
//       // ============================================

//       const mediaFiles = req.files?.media || [];
//       const media = [];

//       for (const file of mediaFiles) {
//         const uploaded = await uploadFileToCloudinary(file);

//         if (uploaded?.url) {
//           let type = "image";
//           if (file.mimetype.includes("video")) type = "video";
//           if (file.mimetype.includes("pdf")) type = "pdf";

//           media.push({
//             url: uploaded.url,
//             type,
//             pdfUrl: type === "pdf" ? uploaded.pdfUrl || uploaded.url : null,
//           });
//         }

//         // cleanup temp file
//         fs.unlink(file.path, () => {});
//       }

//       // ============================================
//       // 5. SAVE TO DATABASE
//       // ============================================
//       const lesson = new StandardPage({
//         title: title,
//         pageNumber: pageNumber,
//         content: sanitizedContent,
//         media,
//         subject: sanitizedSubject,
//         description: sanitizedDescription,
//         chapterId: chapterId,
//         subjectId: subjectId,
//         standardId: standardId,
//         teacherId,
//         views: 0,
//         createdBy: teacherId,
//         versions: [
//           {
//             content: sanitizedContent,
//             changeNote: "Initial version",
//             updatedAt: new Date(),
//           },
//         ],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });

//       await lesson.save();

//       const elapsedTime = Date.now() - startTime;

//       // ============================================
//       // 6. RESPONSE
//       // ============================================
//       res.status(201).json({
//         success: true,
//         message: "Lesson saved successfully",
//         data: {
//           lessonId: lesson._id,
//           title: lesson.title,
//           subject: lesson.subject,
//           createdAt: lesson.createdAt,
//           mediaCount: lesson.media.length,
//           contentLength: lesson.content.length,
//           hasLaTeX: hasLatex,
//           preview:
//             lesson.content.substring(0, 150) +
//             (lesson.content.length > 150 ? "..." : ""),
//         },
//       });
//     } catch (error) {
//       const elapsedTime = Date.now() - startTime;

//       console.error("\n❌ LESSON CREATION FAILED");
//       console.error("══════════════════════════════════");
//       console.error(`⏱️  Time before error: ${elapsedTime}ms`);
//       console.error(`👤 Teacher: ${teacherId}`);
//       console.error(`💥 Error: ${error.message}`);
//       console.error(`📋 Stack: ${error.stack}`);
//       console.error("══════════════════════════════════\n");

//       // Differentiate between validation and server errors
//       const isValidationError = error.name === "ValidationError";
//       const statusCode = isValidationError ? 400 : 500;

//       res.status(statusCode).json({
//         success: false,
//         error: isValidationError
//           ? "Invalid lesson data"
//           : "Failed to save lesson. Please try again.",
//         details:
//           process.env.NODE_ENV === "development"
//             ? { message: error.message, stack: error.stack }
//             : undefined,
//       });
//     }
//   },
// );

// // Update lesson
// router.get("/:chapterId", isAuthenticatedUser, async (req, res) => {
//   try {
//     const { chapterId } = req.params;

//     /* ---------- 1. FIND CHAPTER ---------- */
//     const chapter = await StandardChapter.findById(chapterId).populate({
//       path: "subjectId",
//       select: "subject standard part standardId",
//     });

//     if (!chapter) {
//       return res.status(404).json({
//         success: false,
//         message: "Chapter not found",
//       });
//     }

//     /* ---------- 2. FIND PAGES (OPTIONAL) ---------- */
//     const pages = await StandardPage.find({
//       chapterId: chapter._id,
//     }).sort({ pageNumber: 1 });

//     let hasSubscription = false;

//     // 👇 Check only if logged in
//     if (req.user) {
//       const enrollment = await Enrollment.findOne({
//         student: req.user._id,
//         standard: chapter.subjectId.standardId,
//         paymentStatus: "paid",
//         isActive: true,
//       }).populate("order");

//       if (enrollment) {
//         const now = new Date();
//         const endDate = enrollment.order.subscription.endDate;

//         if (now <= endDate) {
//           hasSubscription = true;
//         }
//       }
//     }

//     // 👇 Preview Logic

//     let visiblePages = pages.map((page, index) => {
//       return {
//         ...page._doc,
//         isLocked: !hasSubscription && index >= 2, // lock from 3rd page
//       };
//     });

//     let locked = !hasSubscription && pages.length > 2;

//     /* ---------- 3. RESPONSE (ALWAYS SUCCESS) ---------- */
//     res.status(200).json({
//       success: true,
//       data: {
//         chapter,
//         subject: chapter.subjectId,
//         pages: visiblePages,
//         subscription: {
//           hasSubscription,
//           locked,
//           totalPages: pages.length,
//           previewPages: hasSubscription ? pages.length : 2,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching lessons:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     });
//   }
// });

// router.get("/page/:lessonId", async (req, res) => {
//   try {
//     const { lessonId } = req.params;

//     // 1️⃣ Get lesson
//     const lesson = await StandardPage.findById(lessonId);

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     // 2️⃣ Get subjectId from chapter
//     const chapter = await StandardChapter.findById(lesson.chapterId).select(
//       "subjectId",
//     );

//     // 3️⃣ Get course media using pageId === lessonId
//     const video = await Video.findOne({ pageId: lessonId }).select(
//       "title url type totalDuration",
//     );

//     res.json({
//       success: true,
//       lesson,
//       subjectId: chapter?.subjectId || null,
//       media: video, // 👈 THIS IS WHAT YOU WANT
//     });
//   } catch (error) {
//     console.error("Error fetching lesson:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// router.get("/page/:lessonId", async (req, res) => {
//   try {
//     const lesson = await MathsLesson.findById(req.params.lessonId);

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     // Fetch ONLY subjectId from chapter
//     const chapter = await StandardChapter.findById(lesson.chapterId).select(
//       "subjectId",
//     );

//     res.json({
//       success: true,
//       lesson,
//       subjectId: chapter?.subjectId || null,
//     });
//   } catch (error) {
//     console.error("Error fetching lesson:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// Get all lessons for a teacher
// router.get("/teacher/:teacherId", async (req, res) => {
//   try {
//     const lessons = await StandardPage.find({
//       teacherId: req.params.teacherId,
//     }).sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       lessons: lessons.map((lesson) => ({
//         id: lesson._id,
//         title: lesson.title,
//         subject: lesson.subject,
//         createdAt: lesson.createdAt,
//         updatedAt: lesson.updatedAt,
//         views: lesson.views || 0,
//         isPublished: lesson.isPublished || false,
//       })),
//     });
//   } catch (error) {
//     console.error("Error fetching teacher lessons:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });
// module.exports = router;

//////////////////////////////
const express = require("express");
const {
  getUserAllProgress,
  getChapterProgress,
  getStudentChapters,
  getChapterQuizProgress,
} = require("../constrollers/pageLesson");
const { isAuthenticatedUser } = require("../middlewares/authenticate");
const { multerMiddleware } = require("../config/cloudinary");
const router = express.Router();

// ✅ Public routes
router.get("/:chapterId", isAuthenticatedUser, getUserAllProgress);
router.get("/pageprogress/:chapterId", isAuthenticatedUser, getChapterProgress);
router.get(
  "/pageQuizprogress/:chapterId",
  isAuthenticatedUser,
  getChapterQuizProgress,
);

router.put("/:id", isAuthenticatedUser, multerMiddleware, async (req, res) => {
  const startTime = Date.now();
  const teacherId = req.user.id;
  const lessonId = req.params.id; // Get lesson ID from URL params

  try {
    const {
      title,
      content,
      subject,
      description,
      chapterId,
      pageNumber,
      changeNote,
      existingMediaIds,
      imagesToDelete,
      imageNames, // 🔥 New: receive image names for new uploads
    } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required",
      });
    }

    // ============================================
    // 1. FIND EXISTING LESSON
    // ============================================
    const existingLesson = await StandardPage.findById(lessonId);

    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    // Check if teacher owns this lesson
    if (existingLesson.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this lesson",
      });
    }

    // ============================================
    // 2. VALIDATION
    // ============================================
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Lesson title is required",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: "Lesson content cannot be empty",
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        error: "Title must be less than 200 characters",
      });
    }

    if (content.length > 50000) {
      return res.status(400).json({
        success: false,
        error: "Content too large (max 50,000 characters)",
      });
    }

    // ============================================
    // 3. MATH VALIDATION (BEFORE SANITIZATION)
    // ============================================
    const validation = validateMathContent(content);
    let contentToSanitize = content;

    if (!validation.isValid && validation.warnings.length > 0) {
      console.warn("⚠️ Math validation warnings:", validation.warnings);
      // Auto-convert inline math to block math
      contentToSanitize = convertInlineToBlockMath(content);
    }

    // ============================================
    // 4. SANITIZATION
    // ============================================
    const sanitizedContent = sanitizeLessonContent(contentToSanitize);
    const sanitizedTitle = sanitizeText(title.trim());
    const sanitizedSubject = sanitizeText(subject || "maths");
    const sanitizedDescription = sanitizeText(description || "");

    // ============================================
    // 5. HANDLE IMAGES & CONTENT REPLACEMENT (🔥 FIX HERE)
    // ============================================
    const mediaFiles = req.files?.media || [];
    const newMedia = [];

    // 🔥 Parse imageNames array
    let imageNamesArray = [];
    if (imageNames) {
      try {
        imageNamesArray = JSON.parse(imageNames);
      } catch (e) {
        imageNamesArray = Array.isArray(imageNames) ? imageNames : [imageNames];
      }
    }

    // Start with sanitized content
    let finalContent = sanitizedContent;

    // 🔥 Upload new files and REPLACE filenames in content
    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];

      try {
        // Upload to Cloudinary
        const uploaded = await uploadFileToCloudinary(file);

        if (uploaded?.url) {
          let type = "image";
          if (file.mimetype.includes("video")) type = "video";
          if (file.mimetype.includes("pdf")) type = "pdf";

          // Get the original filename from imageNames array
          const localFilename = imageNamesArray[i] || file.originalname;

          // 🔥 CRITICAL: Replace the local filename with Cloudinary URL
          const regex1 = new RegExp(
            `\\(${escapeRegExp(localFilename)}\\)`,
            "g",
          );
          finalContent = finalContent.replace(regex1, `(${uploaded.url})`);

          // Also match with different markdown patterns
          const regex2 = new RegExp(
            `!\\[.*?\\]\\(${escapeRegExp(localFilename)}\\)`,
            "g",
          );
          finalContent = finalContent.replace(regex2, (match) => {
            return match.replace(localFilename, uploaded.url);
          });

          // Add to new media array
          newMedia.push({
            url: uploaded.url,
            type,
            pdfUrl: type === "pdf" ? uploaded.pdfUrl || uploaded.url : null,
            originalFilename: localFilename, // Save for reference
          });
        }
      } catch (uploadError) {
        console.error(`❌ Failed to upload file ${i}:`, uploadError);
        // Continue with other files even if one fails
      } finally {
        // Cleanup temp file
        fs.unlink(file.path, () => {});
      }
    }

    // ============================================
    // 6. UPDATE EXISTING MEDIA
    // ============================================
    let updatedMedia = [...existingLesson.media];

    // Remove deleted images
    if (imagesToDelete) {
      const deleteIds = Array.isArray(imagesToDelete)
        ? imagesToDelete
        : [imagesToDelete];
      updatedMedia = updatedMedia.filter(
        (item) => !deleteIds.includes(item._id.toString()),
      );
    }

    // Filter existing media to keep (if provided)
    if (existingMediaIds) {
      const keepIds = Array.isArray(existingMediaIds)
        ? existingMediaIds
        : [existingMediaIds];
      updatedMedia = updatedMedia.filter((item) =>
        keepIds.includes(item._id.toString()),
      );
    }

    // Add new media
    updatedMedia = [...updatedMedia, ...newMedia];

    // 🔥 Log the final content preview

    // Check if content has meaningful LaTeX
    const hasLatex =
      finalContent.includes("$$") ||
      finalContent.includes("\\begin{") ||
      finalContent.includes("\\frac") ||
      finalContent.includes("\\[") ||
      finalContent.includes("\\(");

    // ============================================
    // 7. CREATE VERSION HISTORY
    // ============================================
    const newVersion = {
      content: finalContent, // ✅ Save finalContent with Cloudinary URLs
      changeNote: changeNote || "Content updated",
      updatedAt: new Date(),
    };

    // Keep only last 10 versions
    const updatedVersions = [...existingLesson.versions, newVersion];
    if (updatedVersions.length > 10) {
      updatedVersions.shift(); // Remove oldest version
    }

    // ============================================
    // 8. UPDATE THE LESSON
    // ============================================
    existingLesson.title = sanitizedTitle;
    existingLesson.content = finalContent; // ✅ Now has Cloudinary URLs!
    existingLesson.pageNumber = pageNumber || existingLesson.pageNumber;
    existingLesson.media = updatedMedia;
    existingLesson.subject = sanitizedSubject;
    existingLesson.description =
      sanitizedDescription || existingLesson.description;
    existingLesson.versions = updatedVersions;
    existingLesson.updatedAt = new Date();

    await existingLesson.save();

    const elapsedTime = Date.now() - startTime;

    // ============================================
    // 9. RESPONSE
    // ============================================
    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: {
        lessonId: existingLesson._id,
        title: existingLesson.title,
        subject: existingLesson.subject,
        pageNumber: existingLesson.pageNumber,
        updatedAt: existingLesson.updatedAt,
        mediaCount: existingLesson.media.length,
        contentLength: existingLesson.content.length,
        versionCount: existingLesson.versions.length,
        hasLaTeX: hasLatex,
        preview:
          existingLesson.content.substring(0, 150) +
          (existingLesson.content.length > 150 ? "..." : ""),
      },
    });
  } catch (error) {
    const elapsedTime = Date.now() - startTime;

    console.error("\n❌ LESSON UPDATE FAILED");
    console.error("══════════════════════════════════");
    console.error(`🆔 Lesson ID: ${lessonId}`);
    console.error(`⏱️  Time before error: ${elapsedTime}ms`);
    console.error(`👤 Teacher: ${teacherId}`);
    console.error(`💥 Error: ${error.message}`);
    console.error(`📋 Stack: ${error.stack}`);
    console.error("══════════════════════════════════\n");

    const isValidationError = error.name === "ValidationError";
    const statusCode = isValidationError ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: isValidationError
        ? "Invalid lesson data"
        : "Failed to update lesson. Please try again.",
      details:
        process.env.NODE_ENV === "development"
          ? { message: error.message, stack: error.stack }
          : undefined,
    });
  }
});

// 🔥 Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// router.put("/:id", isAuthenticatedUser, multerMiddleware, async (req, res) => {
//   const startTime = Date.now();
//   const teacherId = req.user.id;
//   const lessonId = req.params.id; // Get lesson ID from URL params

//   try {
//     const {
//       title,
//       content,
//       subject,
//       description,
//       chapterId,
//       pageNumber,
//       changeNote,
//       existingMediaIds,
//       imagesToDelete,
//     } = req.body;

//     /* ---------- VALIDATION ---------- */
//     if (!lessonId) {
//       return res.status(400).json({
//         success: false,
//         message: "Lesson ID is required",
//       });
//     }

//     // ============================================
//     // 1. FIND EXISTING LESSON
//     // ============================================
//     const existingLesson = await StandardPage.findById(lessonId);

//     if (!existingLesson) {
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     // Check if teacher owns this lesson
//     if (existingLesson.teacherId.toString() !== teacherId) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to update this lesson",
//       });
//     }

//     // ============================================
//     // 2. VALIDATION
//     // ============================================
//     if (!title || !title.trim()) {
//       return res.status(400).json({
//         success: false,
//         error: "Lesson title is required",
//       });
//     }

//     if (!content || !content.trim()) {
//       return res.status(400).json({
//         success: false,
//         error: "Lesson content cannot be empty",
//       });
//     }

//     if (title.length > 200) {
//       return res.status(400).json({
//         success: false,
//         error: "Title must be less than 200 characters",
//       });
//     }

//     if (content.length > 50000) {
//       return res.status(400).json({
//         success: false,
//         error: "Content too large (max 50,000 characters)",
//       });
//     }

//     // ============================================
//     // 3. MATH VALIDATION (BEFORE SANITIZATION)
//     // ============================================
//     const validation = validateMathContent(content);
//     let contentToSanitize = content;

//     if (!validation.isValid && validation.warnings.length > 0) {
//       console.warn("⚠️ Math validation warnings:", validation.warnings);
//       // Auto-convert inline math to block math
//       contentToSanitize = convertInlineToBlockMath(content);
//     }

//     // ============================================
//     // 4. SANITIZATION
//     // ============================================
//     const sanitizedContent = sanitizeLessonContent(contentToSanitize);
//     const sanitizedTitle = sanitizeText(title.trim());
//     const sanitizedSubject = sanitizeText(subject || "maths");
//     const sanitizedDescription = sanitizeText(description || "");

//     // Check if content has meaningful LaTeX
//     const hasLatex =
//       sanitizedContent.includes("$$") ||
//       sanitizedContent.includes("\\begin{") ||
//       sanitizedContent.includes("\\frac") ||
//       sanitizedContent.includes("\\[") ||
//       sanitizedContent.includes("\\(");

//     // ============================================
//     // 5. DEBUG LOGGING
//     // ============================================

//     // ============================================
//     // 6. HANDLE IMAGES
//     // ============================================
//     const newMedia = [];
//     const mediaFiles = req.files?.media || [];

//     // Upload new media files
//     for (const file of mediaFiles) {
//       const uploaded = await uploadFileToCloudinary(file);

//       if (uploaded?.url) {
//         let type = "image";
//         if (file.mimetype.includes("video")) type = "video";
//         if (file.mimetype.includes("pdf")) type = "pdf";

//         newMedia.push({
//           url: uploaded.url,
//           type,
//           pdfUrl: type === "pdf" ? uploaded.pdfUrl || uploaded.url : null,
//         });
//       }

//       // cleanup temp file
//       fs.unlink(file.path, () => {});
//     }

//     // ============================================
//     // 7. UPDATE EXISTING MEDIA
//     // ============================================
//     let updatedMedia = [...existingLesson.media];

//     // Remove deleted images
//     if (imagesToDelete) {
//       const deleteIds = Array.isArray(imagesToDelete)
//         ? imagesToDelete
//         : [imagesToDelete];
//       updatedMedia = updatedMedia.filter(
//         (item) => !deleteIds.includes(item._id.toString()),
//       );
//     }

//     // Filter existing media to keep (if provided)
//     if (existingMediaIds) {
//       const keepIds = Array.isArray(existingMediaIds)
//         ? existingMediaIds
//         : [existingMediaIds];
//       updatedMedia = updatedMedia.filter((item) =>
//         keepIds.includes(item._id.toString()),
//       );
//     }

//     // Add new media
//     updatedMedia = [...updatedMedia, ...newMedia];

//     // ============================================
//     // 8. CREATE VERSION HISTORY
//     // ============================================
//     const newVersion = {
//       content: sanitizedContent,
//       changeNote: changeNote || "Content updated",
//       updatedAt: new Date(),
//     };

//     // Keep only last 10 versions
//     const updatedVersions = [...existingLesson.versions, newVersion];
//     if (updatedVersions.length > 10) {
//       updatedVersions.shift(); // Remove oldest version
//     }

//     // ============================================
//     // 9. UPDATE THE LESSON
//     // ============================================
//     existingLesson.title = sanitizedTitle;
//     existingLesson.content = sanitizedContent;
//     existingLesson.pageNumber = pageNumber || existingLesson.pageNumber;
//     existingLesson.media = updatedMedia;
//     existingLesson.subject = sanitizedSubject;
//     existingLesson.description =
//       sanitizedDescription || existingLesson.description;
//     existingLesson.versions = updatedVersions;
//     existingLesson.updatedAt = new Date();

//     await existingLesson.save();

//     const elapsedTime = Date.now() - startTime;

//     // ============================================
//     // 10. RESPONSE
//     // ============================================
//     res.status(200).json({
//       success: true,
//       message: "Lesson updated successfully",
//       data: {
//         lessonId: existingLesson._id,
//         title: existingLesson.title,
//         subject: existingLesson.subject,
//         pageNumber: existingLesson.pageNumber,
//         updatedAt: existingLesson.updatedAt,
//         mediaCount: existingLesson.media.length,
//         contentLength: existingLesson.content.length,
//         versionCount: existingLesson.versions.length,
//         hasLaTeX: hasLatex,
//         preview:
//           existingLesson.content.substring(0, 150) +
//           (existingLesson.content.length > 150 ? "..." : ""),
//       },
//     });
//   } catch (error) {
//     const elapsedTime = Date.now() - startTime;

//     console.error("\n❌ LESSON UPDATE FAILED");
//     console.error("══════════════════════════════════");
//     console.error(`🆔 Lesson ID: ${lessonId}`);
//     console.error(`⏱️  Time before error: ${elapsedTime}ms`);
//     console.error(`👤 Teacher: ${teacherId}`);
//     console.error(`💥 Error: ${error.message}`);
//     console.error(`📋 Stack: ${error.stack}`);
//     console.error("══════════════════════════════════\n");

//     const isValidationError = error.name === "ValidationError";
//     const statusCode = isValidationError ? 400 : 500;

//     res.status(statusCode).json({
//       success: false,
//       error: isValidationError
//         ? "Invalid lesson data"
//         : "Failed to update lesson. Please try again.",
//       details:
//         process.env.NODE_ENV === "development"
//           ? { message: error.message, stack: error.stack }
//           : undefined,
//     });
//   }
// });

// router.post(
//   "/save",
//   isAuthenticatedUser,
//   multerMiddleware,
//   async (req, res) => {
//     const startTime = Date.now();
//     const teacherId = req.user.id;

//     try {
//       const { title, content, subject, description, chapterId, pageNumber } =
//         req.body;

//       /* ---------- VALIDATION ---------- */
//       if (!chapterId) {
//         return res.status(400).json({
//           success: false,
//           message: "chapterId is required",
//         });
//       }

//       // 1️⃣ Get chapter
//       const chapterDoc =
//         await StandardChapter.findById(chapterId).select("subjectId");

//       if (!chapterDoc) {
//         return res.status(404).json({
//           success: false,
//           error: "Chapter not found",
//         });
//       }

//       const subjectId = chapterDoc.subjectId;

//       // 2️⃣ Get subject
//       const subjectDoc =
//         await StandardSubject.findById(subjectId).select("standardId");

//       if (!subjectDoc) {
//         return res.status(404).json({
//           success: false,
//           error: "Subject not found",
//         });
//       }

//       const standardId = subjectDoc.standardId;
//       // ============================================
//       // 1. VALIDATION
//       // ============================================
//       if (!title || !title.trim()) {
//         return res.status(400).json({
//           success: false,
//           error: "Lesson title is required",
//         });
//       }

//       if (!content || !content.trim()) {
//         return res.status(400).json({
//           success: false,
//           error: "Lesson content cannot be empty",
//         });
//       }

//       if (title.length > 200) {
//         return res.status(400).json({
//           success: false,
//           error: "Title must be less than 200 characters",
//         });
//       }

//       if (content.length > 50000) {
//         return res.status(400).json({
//           success: false,
//           error: "Content too large (max 50,000 characters)",
//         });
//       }
//       // ============================================
//       // 2. MATH VALIDATION (BEFORE SANITIZATION)
//       // ============================================
//       const validation = validateMathContent(content);
//       if (!validation.isValid && validation.warnings.length > 0) {
//         console.warn("⚠️ Math validation warnings:", validation.warnings);

//         // Option 1: Auto-convert inline math to block math
//         const convertedContent = convertInlineToBlockMath(content);

//         // Continue with converted content
//         var contentToSanitize = convertedContent;
//       } else {
//         var contentToSanitize = content;
//       }

//       // ============================================
//       // 3. SANITIZATION
//       // ============================================
//       const sanitizedContent = sanitizeLessonContent(contentToSanitize);
//       const sanitizedTitle = sanitizeText(title.trim());
//       const sanitizedSubject = sanitizeText(subject || "maths");
//       const sanitizedDescription = sanitizeText(description || "");

//       // Check if content has meaningful LaTeX
//       const hasLatex =
//         sanitizedContent.includes("$$") ||
//         sanitizedContent.includes("\\begin{") ||
//         sanitizedContent.includes("\\frac") ||
//         sanitizedContent.includes("\\[") ||
//         sanitizedContent.includes("\\(");

//       // ============================================
//       // 3. DEBUG LOGGING
//       // ============================================

//       // Warn if LaTeX content but no math markers
//       if (sanitizedContent.includes("&") && !hasLatex) {
//         console.warn("⚠️  Content contains & but no LaTeX markers");
//       }

//       // ============================================
//       // 4. MEDIA UPLOAD (OPTIONAL)
//       // ============================================

//       const mediaFiles = req.files?.media || [];
//       const media = [];

//       for (const file of mediaFiles) {
//         const uploaded = await uploadFileToCloudinary(file);

//         if (uploaded?.url) {
//           let type = "image";
//           if (file.mimetype.includes("video")) type = "video";
//           if (file.mimetype.includes("pdf")) type = "pdf";

//           media.push({
//             url: uploaded.url,
//             type,
//             pdfUrl: type === "pdf" ? uploaded.pdfUrl || uploaded.url : null,
//           });
//         }

//         // cleanup temp file
//         fs.unlink(file.path, () => {});
//       }

//       // ============================================
//       // 5. SAVE TO DATABASE
//       // ============================================
//       const lesson = new StandardPage({
//         title: title,
//         pageNumber: pageNumber,
//         content: sanitizedContent,
//         media,
//         subject: sanitizedSubject,
//         description: sanitizedDescription,
//         chapterId: chapterId,
//         subjectId: subjectId,
//         standardId: standardId,
//         teacherId,
//         views: 0,
//         createdBy: teacherId,
//         versions: [
//           {
//             content: sanitizedContent,
//             changeNote: "Initial version",
//             updatedAt: new Date(),
//           },
//         ],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });

//       await lesson.save();

//       const elapsedTime = Date.now() - startTime;

//       // ============================================
//       // 6. RESPONSE
//       // ============================================
//       res.status(201).json({
//         success: true,
//         message: "Lesson saved successfully",
//         data: {
//           lessonId: lesson._id,
//           title: lesson.title,
//           subject: lesson.subject,
//           createdAt: lesson.createdAt,
//           mediaCount: lesson.media.length,
//           contentLength: lesson.content.length,
//           hasLaTeX: hasLatex,
//           preview:
//             lesson.content.substring(0, 150) +
//             (lesson.content.length > 150 ? "..." : ""),
//         },
//       });
//     } catch (error) {
//       const elapsedTime = Date.now() - startTime;

//       console.error("\n❌ LESSON CREATION FAILED");
//       console.error("══════════════════════════════════");
//       console.error(`⏱️  Time before error: ${elapsedTime}ms`);
//       console.error(`👤 Teacher: ${teacherId}`);
//       console.error(`💥 Error: ${error.message}`);
//       console.error(`📋 Stack: ${error.stack}`);
//       console.error("══════════════════════════════════\n");

//       // Differentiate between validation and server errors
//       const isValidationError = error.name === "ValidationError";
//       const statusCode = isValidationError ? 400 : 500;

//       res.status(statusCode).json({
//         success: false,
//         error: isValidationError
//           ? "Invalid lesson data"
//           : "Failed to save lesson. Please try again.",
//         details:
//           process.env.NODE_ENV === "development"
//             ? { message: error.message, stack: error.stack }
//             : undefined,
//       });
//     }
//   },
// );

router.post(
  "/save",
  isAuthenticatedUser,
  multerMiddleware,
  async (req, res) => {
    const startTime = Date.now();
    const teacherId = req.user.id;

    try {
      const {
        title,
        content,
        subject,
        description,
        chapterId,
        pageNumber,
        imageNames,
      } = req.body;

      /* ---------- VALIDATION ---------- */
      if (!chapterId) {
        return res.status(400).json({
          success: false,
          message: "chapterId is required",
        });
      }

      // 1️⃣ Get chapter
      const chapterDoc =
        await StandardChapter.findById(chapterId).select("subjectId");

      if (!chapterDoc) {
        return res.status(404).json({
          success: false,
          error: "Chapter not found",
        });
      }

      const subjectId = chapterDoc.subjectId;

      // 2️⃣ Get subject
      const subjectDoc =
        await StandardSubject.findById(subjectId).select("standardId");

      if (!subjectDoc) {
        return res.status(404).json({
          success: false,
          error: "Subject not found",
        });
      }

      const standardId = subjectDoc.standardId;

      // ============================================
      // 1. VALIDATION
      // ============================================
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          error: "Lesson title is required",
        });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          error: "Lesson content cannot be empty",
        });
      }

      if (title.length > 200) {
        return res.status(400).json({
          success: false,
          error: "Title must be less than 200 characters",
        });
      }

      if (content.length > 50000) {
        return res.status(400).json({
          success: false,
          error: "Content too large (max 50,000 characters)",
        });
      }

      // ============================================
      // 2. MATH VALIDATION (BEFORE SANITIZATION)
      // ============================================
      const validation = validateMathContent(content);
      let contentToSanitize = content;

      if (!validation.isValid && validation.warnings.length > 0) {
        console.warn("⚠️ Math validation warnings:", validation.warnings);
        // Auto-convert inline math to block math
        contentToSanitize = convertInlineToBlockMath(content);
      }

      // ============================================
      // 3. SANITIZATION
      // ============================================
      const sanitizedContent = sanitizeLessonContent(contentToSanitize);
      const sanitizedTitle = sanitizeText(title.trim());
      const sanitizedSubject = sanitizeText(subject || "maths");
      const sanitizedDescription = sanitizeText(description || "");

      // ============================================
      // 4. MEDIA UPLOAD & CONTENT REPLACEMENT (🔥 FIX HERE)
      // ============================================
      const mediaFiles = req.files?.media || [];
      const media = [];

      // 🔥 Parse imageNames array
      let imageNamesArray = [];
      if (imageNames) {
        try {
          imageNamesArray = JSON.parse(imageNames);
        } catch (e) {
          imageNamesArray = Array.isArray(imageNames)
            ? imageNames
            : [imageNames];
        }
      }

      // Start with sanitized content
      let finalContent = sanitizedContent;

      // 🔥 Upload files and REPLACE filenames in content
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];

        try {
          // Upload to Cloudinary
          const uploaded = await uploadFileToCloudinary(file);

          if (uploaded?.url) {
            let type = "image";
            if (file.mimetype.includes("video")) type = "video";
            if (file.mimetype.includes("pdf")) type = "pdf";

            // Get the original filename from imageNames array
            const localFilename = imageNamesArray[i] || file.originalname;

            // 🔥 CRITICAL: Replace the local filename with Cloudinary URL
            // Match: (filename) or (path/filename) or (filename with spaces)
            const regex1 = new RegExp(
              `\\(${escapeRegExp(localFilename)}\\)`,
              "g",
            );
            finalContent = finalContent.replace(regex1, `(${uploaded.url})`);

            // Also match with different markdown patterns
            const regex2 = new RegExp(
              `!\\[.*?\\]\\(${escapeRegExp(localFilename)}\\)`,
              "g",
            );
            finalContent = finalContent.replace(regex2, (match) => {
              return match.replace(localFilename, uploaded.url);
            });

            // Add to media array
            media.push({
              url: uploaded.url,
              type,
              pdfUrl: type === "pdf" ? uploaded.pdfUrl || uploaded.url : null,
              originalFilename: localFilename, // Save for reference
            });
          }
        } catch (uploadError) {
          console.error(`❌ Failed to upload file ${i}:`, uploadError);
          // Continue with other files even if one fails
        } finally {
          // Cleanup temp file
          fs.unlink(file.path, () => {});
        }
      }

      // 🔥 Log the final content preview

      // Check if content has meaningful LaTeX
      const hasLatex =
        finalContent.includes("$$") ||
        finalContent.includes("\\begin{") ||
        finalContent.includes("\\frac") ||
        finalContent.includes("\\[") ||
        finalContent.includes("\\(");

      // ============================================
      // 5. SAVE TO DATABASE (with finalContent)
      // ============================================
      const lesson = new StandardPage({
        title: sanitizedTitle,
        pageNumber: pageNumber,
        content: finalContent, // ✅ Now has Cloudinary URLs!
        media,
        subject: sanitizedSubject,
        description: sanitizedDescription,
        chapterId: chapterId,
        subjectId: subjectId,
        standardId: standardId,
        teacherId,
        views: 0,
        createdBy: teacherId,
        versions: [
          {
            content: finalContent,
            changeNote: "Initial version",
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await lesson.save();

      const elapsedTime = Date.now() - startTime;

      // ============================================
      // 6. RESPONSE
      // ============================================
      res.status(201).json({
        success: true,
        message: "Lesson saved successfully",
        data: {
          lessonId: lesson._id,
          title: lesson.title,
          subject: lesson.subject,
          createdAt: lesson.createdAt,
          mediaCount: lesson.media.length,
          contentLength: lesson.content.length,
          hasLaTeX: hasLatex,
          preview:
            lesson.content.substring(0, 150) +
            (lesson.content.length > 150 ? "..." : ""),
        },
      });
    } catch (error) {
      const elapsedTime = Date.now() - startTime;

      console.error("\n❌ LESSON CREATION FAILED");
      console.error("══════════════════════════════════");
      console.error(`⏱️  Time before error: ${elapsedTime}ms`);
      console.error(`👤 Teacher: ${teacherId}`);
      console.error(`💥 Error: ${error.message}`);
      console.error(`📋 Stack: ${error.stack}`);
      console.error("══════════════════════════════════\n");

      // Differentiate between validation and server errors
      const isValidationError = error.name === "ValidationError";
      const statusCode = isValidationError ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        error: isValidationError
          ? "Invalid lesson data"
          : "Failed to save lesson. Please try again.",
        details:
          process.env.NODE_ENV === "development"
            ? { message: error.message, stack: error.stack }
            : undefined,
      });
    }
  },
);

// 🔥 Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get("/page/:lessonId", isAuthenticatedUser, getStudentChapters);

module.exports = router;
