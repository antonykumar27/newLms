const Question = require("../models/questionModel.js");

const Progress = require("../models/progressModel.js");
const StandardSubject = require("../models/standardSubjectSchema.js");
const StandardChapter = require("../models/standardChapterScheema.js");
const TextbookPage = require("../models/textbookPage.js");
const { uploadFileToCloudinary } = require("../config/cloudinary");
const fs = require("fs");
const {
  sanitizeLessonContent,
  sanitizeText,
  validateMathContent,
} = require("../middlewares/sanitize.js");
// Get questions by filters
exports.getQuestions = async (req, res) => {
  try {
    const { standard, subject, chapter, difficulty, type, limit } = req.query;
    let filter = { isFree: true };

    if (standard) filter.standard = standard;
    if (subject) filter.subject = subject;
    if (chapter) filter.chapterNumber = chapter;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.questionType = type;

    const query = Question.find(filter).select("-correctAnswer");

    // Apply limit if provided
    if (limit) {
      query.limit(parseInt(limit));
    }

    const questions = await query.sort({ chapterNumber: 1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Don't send answer if user is not authenticated
    if (!req.user) {
      question.correctAnswer = undefined;
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Submit answer and get explanation
exports.submitAnswer = async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;
    const userId = req.user?.id;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const isCorrect = question.correctAnswer === userAnswer;

    // Update progress if user is logged in
    if (userId) {
      await updateUserProgress(userId, question, isCorrect);
    }

    // Return answer with explanation
    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        malayalamExplanation: question.malayalamExplanation,
        hints: question.hints,
        solutionSteps: question.solutionSteps,
        marks: question.marks,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Create new question

// exports.createQuestion = async (req, res) => {
//   try {
//     console.log("login User", req.user._id);
//     console.log("request from client", req.body);

//     // Destructure quiz-level fields
//     const {
//       quizTitle,
//       description,
//       questions,
//       standard,

//       subject,
//       chapter,
//       chapterNumber,
//       topic,
//       difficulty,
//       marks,
//       language,
//     } = req.body;

//     // Validation - Check if questions array exists
//     if (!Array.isArray(questions) || questions.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Questions array is required with at least one question",
//       });
//     }

//     // 🔹 Handle media uploads
//     const mediaFiles = req.files?.media || [];
//     const mediaUrls = [];

//     for (const file of mediaFiles) {
//       const uploaded = await uploadFileToCloudinary(file);
//       if (uploaded?.url) {
//         // Determine file type
//         let fileType = "image";
//         if (file.mimetype.includes("video")) fileType = "video";
//         if (file.mimetype.includes("pdf")) fileType = "pdf";

//         mediaUrls.push({
//           url: uploaded.url,
//           type: fileType,
//           pdfUrl: fileType === "pdf" ? uploaded.url : null,
//         });
//       }
//       // Clean up temp file
//       fs.unlink(file.path, () => {});
//     }

//     const savedQuestions = [];

//     // 🔹 Process each question in the quiz
//     for (const [index, q] of questions.entries()) {
//       console.log(`Processing question ${index + 1}:`, q);

//       // Extract options values from the array of objects
//       const options = Array.isArray(q.options)
//         ? q.options.map((opt) => opt.value || opt)
//         : [];

//       // Convert correctAnswer index to actual value
//       let correctAnswerValue;
//       const correctAnswerIndex = parseInt(q.correctAnswer);

//       if (!isNaN(correctAnswerIndex) && options[correctAnswerIndex]) {
//         correctAnswerValue = options[correctAnswerIndex];
//       } else {
//         // If correctAnswer is already the value, use it directly
//         correctAnswerValue = q.correctAnswer;
//       }

//       // Validate individual question
//       if (!q.question || options.length < 2 || !correctAnswerValue) {
//         console.error(`Invalid question at index ${index}:`, q);
//         return res.status(400).json({
//           success: false,
//           message: `Invalid data for question ${index + 1}`,
//           question: q.question || "No question text",
//         });
//       }

//       // Create the question
//       const newQuestion = await Question.create({
//         standard: standard || 9, // Default to 9 if not provided
//         subject: subject || "Science", // Default if not provided
//         chapter: chapter || "General", // Required by schema
//         chapterNumber: chapterNumber || 1, // Required by schema
//         topic: topic || quizTitle || "General Quiz",
//         question: q.question,
//         options: options,
//         correctAnswer: correctAnswerValue,
//         explanation: description || `Explanation for: ${q.question}`,
//         difficulty: difficulty || "Medium",
//         marks: marks || 1,
//         questionType: q.questionType === "single" ? "MCQ" : "MCQ",
//         media: mediaUrls, // Attach all media to each question (or customize as needed)
//         language: language || "Malayalam",
//         createdBy: req.user._id,
//         isFree: true,
//       });

//       savedQuestions.push(newQuestion);
//     }

//     return res.status(201).json({
//       success: true,
//       message: `Successfully created ${savedQuestions.length} questions`,
//       count: savedQuestions.length,
//       data: savedQuestions,
//       quizTitle,
//       description,
//     });
//   } catch (err) {
//     console.error("Error creating quiz questions:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
// controllers/quizController.js
const parseImageField = (fieldname) => {
  let match;

  // questions[0][questionImage]
  match = fieldname.match(/^questions\[(\d+)\]\[questionImage\]$/);
  if (match) {
    return { type: "question", qIndex: Number(match[1]) };
  }

  // questions[0][options][1][optionImage]
  match = fieldname.match(
    /^questions\[(\d+)\]\[options\]\[(\d+)\]\[optionImage\]$/,
  );
  if (match) {
    return {
      type: "option",
      qIndex: Number(match[1]),
      oIndex: Number(match[2]),
    };
  }

  return null;
};

exports.createQuestion = async (req, res) => {
  try {
    console.log("Files:", req.body);

    let questions = [];

    // 🔹 Check if questions are sent as JSON array in the body
    if (req.body.questions && typeof req.body.questions === "string") {
      try {
        questions = JSON.parse(req.body.questions);
      } catch (parseError) {
        console.error("Error parsing questions JSON:", parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid questions format",
        });
      }
    } else if (req.body.questions && Array.isArray(req.body.questions)) {
      questions = req.body.questions;
    } else {
      // Parse form-data format
      const body = req.body;

      Object.keys(body).forEach((key) => {
        // Match keys like questions[0][question]
        const match = key.match(/questions\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];

          if (!questions[index]) {
            questions[index] = {
              question: "",
              questionType: "single", // Default type
              options: [],
              correctAnswer: "",
              hint: "",
            };
          }

          if (field === "question") {
            questions[index][field] = sanitizeLessonContent(body[key]);
          } else if (
            field === "questionType" ||
            field === "correctAnswer" ||
            field === "hint"
          ) {
            questions[index][field] = sanitizeText(body[key]);
          }
        }

        // Match options like questions[0][options][0][value]
        const optionMatch = key.match(
          /questions\[(\d+)\]\[options\]\[(\d+)\]\[value\]/,
        );
        if (optionMatch) {
          const questionIndex = parseInt(optionMatch[1]);
          const optionIndex = parseInt(optionMatch[2]);

          if (!questions[questionIndex]) {
            questions[questionIndex] = {
              question: "",
              questionType: "single",
              options: [],
              correctAnswer: "",
              hint: "",
            };
          }

          if (!questions[questionIndex].options[optionIndex]) {
            questions[questionIndex].options[optionIndex] = { value: "" };
          }

          questions[questionIndex].options[optionIndex].value =
            sanitizeLessonContent(body[key]);
        }
      });
    }

    console.log("Parsed questions:", JSON.stringify(questions, null, 2));

    // Destructure and sanitize quiz-level fields
    const {
      quizTitle,
      description,
      standard,
      subject,
      chapter,
      chapterNumber,
      topic,
      difficulty,
      marks,
      language,
      pageId,
      chapterId,
    } = req.body;

    // Validation
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array is required with at least one question",
      });
    }
    // 1️⃣ Validate input
    if (!chapterId || !pageId) {
      return res.status(400).json({
        success: false,
        error: "chapterId, pageId are required",
      });
    }
    // 2️⃣ Validate standard
    const chapterForSubject = await StandardChapter.findById(chapterId);
    if (!chapterForSubject) {
      return res.status(404).json({
        success: false,
        error: "Standard not found",
      });
    }
    const SubjectNewId = chapterForSubject?.subjectId;
    // 2️⃣ Validate standard
    const standardNewId = await StandardSubject.findById(SubjectNewId);
    if (!standardNewId) {
      return res.status(404).json({
        success: false,
        error: "StandardId not found",
      });
    }
    const standardId = standardNewId.standardId;
    // 🔹 Handle indexed images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const parsed = parseImageField(file.fieldname);
        if (!parsed) continue;

        const uploaded = await uploadFileToCloudinary(file);

        if (parsed.type === "question") {
          questions[parsed.qIndex].questionImageUrl = uploaded.url;
        }

        if (parsed.type === "option") {
          // Only add option images for MCQ questions
          if (
            questions[parsed.qIndex] &&
            questions[parsed.qIndex].questionType !== "text"
          ) {
            if (!questions[parsed.qIndex].options[parsed.oIndex]) {
              questions[parsed.qIndex].options[parsed.oIndex] = { value: "" };
            }
            questions[parsed.qIndex].options[parsed.oIndex].optionImageUrl =
              uploaded.url;
          }
        }

        fs.unlink(file.path, () => {});
      }
    }

    const savedQuestions = [];

    // 🔹 Process each question
    for (const [index, q] of questions.entries()) {
      console.log(
        `Processing question ${index + 1} (type: ${q.questionType}):`,
        q,
      );

      // Validate based on question type
      if (!q.question) {
        console.error(`Invalid question at index ${index}: No question text`);
        return res.status(400).json({
          success: false,
          message: `Question ${index + 1} is required`,
        });
      }

      // Set questionType in database format
      let questionTypeInDB;
      if (q.questionType === "text") {
        questionTypeInDB = "TEXT";
      } else if (q.questionType === "single") {
        questionTypeInDB = "MCQ_SINGLE";
      } else if (q.questionType === "multiple") {
        questionTypeInDB = "MCQ_MULTIPLE";
      } else {
        questionTypeInDB = "MCQ_SINGLE"; // Default
      }

      // For TEXT questions
      if (q.questionType === "text") {
        if (!q.correctAnswer) {
          console.error(
            `Invalid text question at index ${index}: No correct answer`,
          );
          return res.status(400).json({
            success: false,
            message: `Correct answer is required for typed answer question ${index + 1}`,
          });
        }

        // Create TEXT question
        const newQuestion = await Question.create({
          standard: standard || 9,
          subject: subject || "General",
          chapter: chapter || "General",
          chapterNumber: chapterNumber || 1,
          topic: topic || quizTitle || "General Quiz",

          question: q.question,
          questionType: questionTypeInDB,

          // ✅ SAVE QUESTION IMAGE IF EXISTS
          questionImageUrl: q.questionImageUrl
            ? { url: q.questionImageUrl, mediaType: "image" }
            : { url: null },

          // ✅ TEXT QUESTIONS DON'T HAVE OPTIONS
          options: [],

          // ✅ SAVE CORRECT ANSWER FOR TEXT QUESTION
          correctAnswer: q.correctAnswer,

          // ✅ SAVE HINT IF EXISTS
          hints: q.hint ? [q.hint] : [],

          explanation: description || `Explanation for: ${q.question}`,
          difficulty: difficulty || "Medium",
          marks: marks || 1,
          language: language || "Malayalam",

          createdBy: req.user._id,
          isFree: true,
          pageId,
          chapterId,
        });

        savedQuestions.push(newQuestion);
        continue; // Skip to next question
      }

      // For MCQ questions (single/multiple)
      // Ensure options is an array
      const options = Array.isArray(q.options) ? q.options : [];

      // Validate MCQ has at least 2 options
      if (options.length < 2) {
        console.error(
          `Invalid MCQ question at index ${index}: Need at least 2 options`,
        );
        return res.status(400).json({
          success: false,
          message: `MCQ question ${index + 1} needs at least 2 options`,
        });
      }

      // Handle correct answer based on question type
      let correctAnswerValue;

      if (q.questionType === "single") {
        // Single choice: correctAnswer is index
        const correctAnswerIndex = parseInt(q.correctAnswer);

        if (isNaN(correctAnswerIndex) || !options[correctAnswerIndex]) {
          console.error(
            `Invalid single choice answer at index ${index}:`,
            q.correctAnswer,
          );
          return res.status(400).json({
            success: false,
            message: `Invalid correct answer for question ${index + 1}`,
          });
        }

        const option = options[correctAnswerIndex];
        correctAnswerValue =
          typeof option === "object" ? option.value || option : option;
      } else if (q.questionType === "multiple") {
        // Multiple choice: correctAnswer is array of indices
        let correctAnswerIndices;

        if (Array.isArray(q.correctAnswer)) {
          correctAnswerIndices = q.correctAnswer.map((idx) => parseInt(idx));
        } else {
          // Try to parse as JSON array or comma-separated
          try {
            correctAnswerIndices = JSON.parse(q.correctAnswer).map((idx) =>
              parseInt(idx),
            );
          } catch {
            correctAnswerIndices = q.correctAnswer
              .split(",")
              .map((idx) => parseInt(idx.trim()));
          }
        }

        // Filter valid indices and get option values
        const validIndices = correctAnswerIndices.filter(
          (idx) => !isNaN(idx) && options[idx],
        );

        if (validIndices.length === 0) {
          console.error(
            `Invalid multiple choice answers at index ${index}:`,
            q.correctAnswer,
          );
          return res.status(400).json({
            success: false,
            message: `No valid correct answers for question ${index + 1}`,
          });
        }

        correctAnswerValue = JSON.stringify(validIndices);
      }

      // Extract option values
      const optionValues = options.map((opt) =>
        typeof opt === "object" ? opt.value || opt : opt,
      );

      // Prepare media array (optional)
      const media = [];

      // Add question image to media if exists
      if (q.questionImageUrl) {
        media.push({
          type: "image",
          url: q.questionImageUrl,
          description: "Question Image",
        });
      }

      // Process options for MCQ
      const processedOptions = options.map((opt, optIndex) => {
        const optionData = {
          value: typeof opt === "object" ? opt.value || "" : opt || "",
        };

        // Add option image to media if exists
        if (opt.optionImageUrl) {
          media.push({
            type: "image",
            url: opt.optionImageUrl,
            description: `Option ${optIndex + 1} Image`,
            optionIndex: optIndex,
          });

          optionData.optionImageUrl = {
            url: opt.optionImageUrl,
            mediaType: "image",
          };
        }

        return optionData;
      });

      // Create the MCQ question
      const newQuestion = await Question.create({
        standardId: standardId,

        subjectId: SubjectNewId,

        chapterNumber: chapterNumber || 1,

        question: q.question,
        questionType: questionTypeInDB,

        // ✅ SAVE QUESTION IMAGE PROPERLY
        questionImageUrl: q.questionImageUrl
          ? { url: q.questionImageUrl, mediaType: "image" }
          : { url: null },

        // ✅ SAVE OPTIONS WITH IMAGES
        options: processedOptions,

        // ✅ SAVE CORRECT ANSWER
        correctAnswer: correctAnswerValue,

        explanation: description || `Explanation for: ${q.question}`,

        marks: marks || 1,

        createdBy: req.user._id,
        isFree: true,
        pageId,
        chapterId,
      });

      savedQuestions.push(newQuestion);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully created ${savedQuestions.length} questions`,
      count: savedQuestions.length,
      data: savedQuestions,
      quizTitle,
      description,
    });
  } catch (err) {
    console.error("Error creating quiz questions:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// exports.createQuestion = async (req, res) => {
//   try {
//     console.log("Files:", req.files);

//     let questions = [];

//     // 🔹 Check if questions are sent as JSON array in the body
//     if (req.body.questions && typeof req.body.questions === "string") {
//       try {
//         questions = JSON.parse(req.body.questions);
//       } catch (parseError) {
//         console.error("Error parsing questions JSON:", parseError);
//         return res.status(400).json({
//           success: false,
//           message: "Invalid questions format",
//         });
//       }
//     } else if (req.body.questions && Array.isArray(req.body.questions)) {
//       questions = req.body.questions;
//     } else {
//       // Parse form-data format
//       const body = req.body;

//       Object.keys(body).forEach((key) => {
//         // Match keys like questions[0][question]
//         const match = key.match(/questions\[(\d+)\]\[(\w+)\]/);
//         if (match) {
//           const index = parseInt(match[1]);
//           const field = match[2];

//           if (!questions[index]) {
//             questions[index] = {
//               question: "",
//               questionType: "single",
//               options: [],
//               correctAnswer: "",
//             };
//           }

//           if (field === "question") {
//             questions[index][field] = sanitizeLessonContent(body[key]);
//           } else if (field === "questionType" || field === "correctAnswer") {
//             questions[index][field] = sanitizeText(body[key]);
//           }
//         }

//         // Match options like questions[0][options][0][value]
//         const optionMatch = key.match(
//           /questions\[(\d+)\]\[options\]\[(\d+)\]\[value\]/,
//         );
//         if (optionMatch) {
//           const questionIndex = parseInt(optionMatch[1]);
//           const optionIndex = parseInt(optionMatch[2]);

//           if (!questions[questionIndex]) {
//             questions[questionIndex] = {
//               question: "",
//               questionType: "single",
//               options: [],
//               correctAnswer: "",
//             };
//           }

//           if (!questions[questionIndex].options[optionIndex]) {
//             questions[questionIndex].options[optionIndex] = { value: "" };
//           }

//           questions[questionIndex].options[optionIndex].value =
//             sanitizeLessonContent(body[key]);
//         }
//       });
//     }

//     console.log("Parsed questions:", questions);

//     // Destructure and sanitize quiz-level fields
//     const {
//       quizTitle,
//       description,
//       standard,
//       subject,
//       chapter,
//       chapterNumber,
//       topic,
//       difficulty,
//       marks,
//       language,
//       pageId,
//       chapterId,
//     } = req.body;

//     // Validation
//     if (!Array.isArray(questions) || questions.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Questions array is required with at least one question",
//       });
//     }

//     // 🔹 Handle indexed images
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const parsed = parseImageField(file.fieldname);
//         if (!parsed) continue;

//         const uploaded = await uploadFileToCloudinary(file);

//         if (parsed.type === "question") {
//           questions[parsed.qIndex].questionImageUrl = uploaded.url;
//         }

//         if (parsed.type === "option") {
//           questions[parsed.qIndex].options[parsed.oIndex].optionImageUrl =
//             uploaded.url;
//         }

//         fs.unlink(file.path, () => {});
//       }
//     }

//     const savedQuestions = [];

//     // 🔹 Process each question
//     for (const [index, q] of questions.entries()) {
//       console.log(`Processing question ${index + 1}:`, q);

//       // Ensure options is an array
//       const options = Array.isArray(q.options) ? q.options : [];

//       // Convert correctAnswer index to actual option value
//       let correctAnswerValue;
//       const correctAnswerIndex = parseInt(q.correctAnswer);

//       if (!isNaN(correctAnswerIndex) && options[correctAnswerIndex]) {
//         const option = options[correctAnswerIndex];
//         correctAnswerValue = option.value || option;
//       } else {
//         correctAnswerValue = q.correctAnswer;
//       }

//       // Extract option values
//       const optionValues = options.map((opt) =>
//         typeof opt === "object" ? opt.value || opt : opt,
//       );

//       // Validate individual question
//       if (!q.question || optionValues.length < 2 || !correctAnswerValue) {
//         console.error(`Invalid question at index ${index}:`, q);
//         return res.status(400).json({
//           success: false,
//           message: `Invalid data for question ${index + 1}`,
//           question: q.question || "No question text",
//           options: optionValues,
//           correctAnswer: correctAnswerValue,
//         });
//       }

//       // Prepare media array
//       const media = [];

//       // Add question image to media if exists
//       if (q.questionImageUrl) {
//         media.push({
//           type: "image",
//           url: q.questionImageUrl,
//           description: "Question Image",
//         });
//       }

//       // Process options
//       const processedOptions = options.map((opt, optIndex) => {
//         const optionData = {
//           value: typeof opt === "object" ? opt.value || "" : opt || "",
//         };

//         // Add option image to media if exists
//         if (opt.optionImageUrl) {
//           media.push({
//             type: "image",
//             url: opt.optionImageUrl,
//             description: `Option ${optIndex + 1} Image`,
//             optionIndex: optIndex,
//           });
//         }

//         return optionData;
//       });

//       // Create the question
//       const newQuestion = await Question.create({
//         standard: standard || 9,
//         subject: subject || "Science",
//         chapter: chapter || "General",
//         chapterNumber: chapterNumber || 1,
//         topic: topic || quizTitle || "General Quiz",

//         question: q.question,

//         // ✅ SAVE QUESTION IMAGE PROPERLY
//         questionImageUrl: q.questionImageUrl
//           ? { url: q.questionImageUrl, mediaType: "image" }
//           : { url: null },

//         // ✅ SAVE OPTION IMAGES PROPERLY
//         options: options.map((opt) => ({
//           value: opt.value,
//           optionImageUrl: opt.optionImageUrl
//             ? { url: opt.optionImageUrl, mediaType: "image" }
//             : { url: null },
//         })),

//         correctAnswer: correctAnswerValue,
//         explanation: description || `Explanation for: ${q.question}`,
//         difficulty: difficulty || "Medium",
//         marks: marks || 1,
//         questionType: "MCQ",
//         language: language || "Malayalam",

//         // ❌ REMOVE media: media
//         createdBy: req.user._id,
//         isFree: true,
//         pageId,
//         chapterId,
//       });

//       savedQuestions.push(newQuestion);
//     }

//     return res.status(201).json({
//       success: true,
//       message: `Successfully created ${savedQuestions.length} questions`,
//       count: savedQuestions.length,
//       data: savedQuestions,
//       quizTitle,
//       description,
//     });
//   } catch (err) {
//     console.error("Error creating quiz questions:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

exports.getQuestionquizById = async (req, res) => {
  try {
    const { pageId } = req.params;

    const questions = await Question.find({ pageId })
      .populate("createdBy", "name email")
      .sort({ createdAt: 1 });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this page",
      });
    }

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (err) {
    console.error("Error fetching questions by pageId:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const mongoose = require("mongoose");

exports.getQuestionquizByChapterId = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chapterId",
      });
    }

    const chapterObjectId = new mongoose.Types.ObjectId(chapterId);

    // 🔥 1️⃣ Get Chapter Info
    const chapter = await StandardChapter.findById(chapterObjectId).select(
      "chapterTitle chapterNumber",
    );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    // 🔥 2️⃣ Count Questions
    const totalQuestions = await Question.countDocuments({
      chapterId: chapterObjectId,
    });

    if (totalQuestions === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this chapter",
      });
    }

    // 🔥 3️⃣ Decide quiz size
    const quizSize = Math.min(20, totalQuestions);

    // 🔥 4️⃣ Random selection
    const questions = await Question.aggregate([
      { $match: { chapterId: chapterObjectId } },
      { $sample: { size: quizSize } },
    ]);

    // 🔥 5️⃣ Remove correctAnswer
    const safeQuestions = questions.map((q) => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    return res.status(200).json({
      success: true,
      chapterTitle: chapter.chapterTitle,
      chapterNumber: chapter.chapterNumber,
      totalAvailable: totalQuestions,
      quizSize,
      data: safeQuestions,
    });
  } catch (err) {
    console.error("Error fetching quiz by chapterId:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getQuestionquizBySubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subjectId",
      });
    }

    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);

    // 🔥 1️⃣ Get subject info (including part)
    const subject = await StandardSubject.findById(subjectObjectId).select(
      "subject standard part medium",
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // 🔥 2️⃣ Count total questions
    const totalQuestions = await Question.countDocuments({
      subjectId: subjectObjectId,
    });

    if (totalQuestions === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this subject",
      });
    }

    // 🔥 3️⃣ Decide quiz size
    const quizSize = Math.min(50, totalQuestions);

    // 🔥 4️⃣ Random selection
    const questions = await Question.aggregate([
      { $match: { subjectId: subjectObjectId } },
      { $sample: { size: quizSize } },
    ]);

    // 🔥 5️⃣ Remove correctAnswer
    const safeQuestions = questions.map((q) => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    return res.status(200).json({
      success: true,
      subjectName: subject.subject,
      standard: subject.standard,
      part: subject.part,
      medium: subject.medium,
      totalAvailable: totalQuestions,
      quizSize,
      data: safeQuestions,
    });
  } catch (err) {
    console.error("Error fetching subject quiz:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get random questions for practice
exports.getRandomQuestions = async (req, res) => {
  try {
    const { count = 10, standard, subject } = req.query;
    let filter = { isFree: true };

    if (standard) filter.standard = standard;
    if (subject) filter.subject = subject;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(count) } },
      { $project: { correctAnswer: 0 } },
    ]);

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update user progress helper
const updateUserProgress = async (userId, question, isCorrect) => {
  try {
    // Find existing progress
    let progress = await Progress.findOne({
      user: userId,
      chapterId: question.chapterId,
    });

    if (!progress) {
      // Get total questions for this chapter
      const totalQuestions = await Question.countDocuments({
        chapterNumber: question.chapterNumber,
        standard: question.standard,
        subject: question.subject,
        isFree: true,
      });

      // Create new progress
      progress = await Progress.create({
        user: userId,
        chapterId: question.chapterId,
        totalQuestions,
        attempted: 1,
        correct: isCorrect ? 1 : 0,
        score: isCorrect ? question.marks || 1 : 0,
        lastAttempt: new Date(),
        status: totalQuestions === 1 ? "Completed" : "In Progress",
      });
    } else {
      // Update existing progress
      progress.attempted += 1;
      if (isCorrect) {
        progress.correct += 1;
        progress.score += question.marks || 1;
      }
      progress.lastAttempt = new Date();

      if (progress.attempted >= progress.totalQuestions) {
        progress.status = "Completed";
      } else {
        progress.status = "In Progress";
      }

      await progress.save();
    }

    return progress;
  } catch (err) {
    console.error("Error updating progress:", err);
  }
};
// Create new TextBook
exports.createTextBook = async (req, res) => {
  try {
    const { pageId, textbookId, chapter, title, content } = req.body;

    const page = await TextbookPage.findOneAndUpdate(
      { pageId },
      {
        textbookId,
        chapter,
        title,
        content,
        lastEdited: new Date(),
        $inc: { version: 1 },
      },
      { upsert: true, new: true },
    );

    res.json({ success: true, page });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Create new TextBook
exports.gettextBookById = async (req, res) => {
  try {
    const page = await TextbookPage.findOne({
      pageId: req.params.pageId,
      status: "published",
    });

    if (!page) return res.status(404).json({ error: "Page not found" });

    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
