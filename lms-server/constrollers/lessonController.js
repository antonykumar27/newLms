const fs = require("fs");
const StandardChapter = require("../models/StandardChapter");
const StandardSubject = require("../models/StandardSubject");
const StandardPage = require("../models/StandardPage");

const { sanitizeLessonContent, sanitizeText } = require("../utils/sanitizer");

const {
  validateMathContent,
  convertInlineToBlockMath,
} = require("../utils/mathValidator");

const uploadFileToCloudinary = require("../utils/cloudinaryUpload");

// ============================================
// CREATE LESSON CONTROLLER
// ============================================
exports.createLesson = async (req, res) => {
  const startTime = Date.now();
  const teacherId = req.user.id;

  try {
    const { title, content, subject, description, chapterId, pageNumber } =
      req.body;

    // ============================================
    // 1️⃣ BASIC VALIDATION
    // ============================================
    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "chapterId is required",
      });
    }

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
    // 2️⃣ FETCH CHAPTER + SUBJECT
    // ============================================
    const chapterDoc =
      await StandardChapter.findById(chapterId).select("subjectId");

    if (!chapterDoc) {
      return res.status(404).json({
        success: false,
        error: "Chapter not found",
      });
    }

    const subjectDoc = await StandardSubject.findById(
      chapterDoc.subjectId,
    ).select("standardId");

    if (!subjectDoc) {
      return res.status(404).json({
        success: false,
        error: "Subject not found",
      });
    }

    const subjectId = chapterDoc.subjectId;
    const standardId = subjectDoc.standardId;

    // ============================================
    // 3️⃣ MATH VALIDATION
    // ============================================
    const validation = validateMathContent(content);

    let contentToSanitize = content;

    if (!validation.isValid && validation.warnings.length > 0) {
      console.warn("⚠️ Math warnings:", validation.warnings);
      contentToSanitize = convertInlineToBlockMath(content);
    }

    // ============================================
    // 4️⃣ SANITIZATION
    // ============================================
    const sanitizedContent = sanitizeLessonContent(contentToSanitize);
    const sanitizedTitle = sanitizeText(title.trim());
    const sanitizedSubject = sanitizeText(subject || "maths");
    const sanitizedDescription = sanitizeText(description || "");

    const hasLatex =
      sanitizedContent.includes("$$") ||
      sanitizedContent.includes("\\begin{") ||
      sanitizedContent.includes("\\frac") ||
      sanitizedContent.includes("\\[") ||
      sanitizedContent.includes("\\(");

    // ============================================
    // 5️⃣ MEDIA UPLOAD
    // ============================================
    const mediaFiles = req.files?.media || [];
    const media = [];

    for (const file of mediaFiles) {
      const uploaded = await uploadFileToCloudinary(file);

      if (uploaded?.url) {
        let type = "image";
        if (file.mimetype.includes("video")) type = "video";
        if (file.mimetype.includes("pdf")) type = "pdf";

        media.push({
          url: uploaded.url,
          type,
          pdfUrl: type === "pdf" ? uploaded.pdfUrl || uploaded.url : null,
        });
      }

      fs.unlink(file.path, () => {});
    }

    // ============================================
    // 6️⃣ SAVE TO DATABASE
    // ============================================
    const lesson = new StandardPage({
      title: sanitizedTitle,
      pageNumber,
      content: sanitizedContent,
      media,
      subject: sanitizedSubject,
      description: sanitizedDescription,
      chapterId,
      subjectId,
      standardId,
      teacherId,
      views: 0,
      createdBy: teacherId,
      versions: [
        {
          content: sanitizedContent,
          changeNote: "Initial version",
          updatedAt: new Date(),
        },
      ],
    });

    await lesson.save();

    const elapsedTime = Date.now() - startTime;

    // ============================================
    // 7️⃣ RESPONSE
    // ============================================
    return res.status(201).json({
      success: true,
      message: "Lesson saved successfully",
      processingTime: `${elapsedTime}ms`,
      data: {
        lessonId: lesson._id,
        title: lesson.title,
        subject: lesson.subject,
        createdAt: lesson.createdAt,
        mediaCount: lesson.media.length,
        contentLength: lesson.content.length,
        hasLaTeX,
        preview:
          lesson.content.substring(0, 150) +
          (lesson.content.length > 150 ? "..." : ""),
      },
    });
  } catch (error) {
    const elapsedTime = Date.now() - startTime;

    console.error("\n❌ LESSON CREATION FAILED");
    console.error(`⏱️  Time before error: ${elapsedTime}ms`);
    console.error(`👤 Teacher: ${teacherId}`);
    console.error(`💥 Error: ${error.message}`);

    const isValidationError = error.name === "ValidationError";
    const statusCode = isValidationError ? 400 : 500;

    return res.status(statusCode).json({
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
};
