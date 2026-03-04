const Chapter = require("../models/chapterModel");
const Question = require("../models/questionModel");
const Progress = require("../models/progressModel");

// Get all chapters
exports.getAllChapters = async (req, res) => {
  try {
    const { standard, subject } = req.query;
    let filter = { isFree: true };

    if (standard) filter.standard = standard;
    if (subject) filter.subject = subject;

    const chapters = await Chapter.find(filter).sort({
      standard: 1,
      chapterNumber: 1,
    });

    // Add progress data if user is logged in
    if (req.user) {
      const userProgress = await Progress.find({ user: req.user.id });
      const chaptersWithProgress = chapters.map((chapter) => {
        const progress = userProgress.find(
          (p) => p.chapterId.toString() === chapter._id.toString(),
        );
        return {
          ...chapter.toObject(),
          progress: progress || null,
        };
      });

      return res.status(200).json({
        success: true,
        count: chaptersWithProgress.length,
        data: chaptersWithProgress,
      });
    }

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get single chapter with questions
exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    // Get questions for this chapter
    const questions = await Question.find({
      chapterNumber: chapter.chapterNumber,
      standard: chapter.standard,
      subject: chapter.subject,
      isFree: true,
    }).select("-correctAnswer"); // Don't send answer directly

    // Get user progress if logged in
    let progress = null;
    if (req.user) {
      progress = await Progress.findOne({
        user: req.user.id,
        chapterId: chapter._id,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        chapter,
        questions: {
          count: questions.length,
          data: questions,
        },
        progress,
        totalQuestions: questions.length,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Create new chapter
exports.createChapter = async (req, res) => {
  try {
    const {
      chapterName,
      chapterNumber,
      standard,
      subject,
      description,
      malayalamTitle,
      topics,
      learningOutcomes,
      videoLinks,
      notes,
    } = req.body;

    // Validation
    if (!chapterName || !chapterNumber || !standard || !subject) {
      return res.status(400).json({
        success: false,
        message: "Please provide chapter name, number, standard, and subject",
      });
    }

    // Check if chapter already exists
    const existingChapter = await Chapter.findOne({
      chapterNumber,
      standard,
      subject,
    });

    if (existingChapter) {
      return res.status(400).json({
        success: false,
        message: "Chapter already exists",
      });
    }

    const chapter = await Chapter.create({
      chapterName,
      malayalamTitle,
      chapterNumber,
      standard,
      subject,
      description,
      topics,
      learningOutcomes,
      videoLinks,
      notes,
      isFree: true,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: chapter,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update chapter
exports.updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    res.status(200).json({
      success: true,
      data: chapter,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete chapter
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    // Delete associated questions
    await Question.deleteMany({
      chapterNumber: chapter.chapterNumber,
      standard: chapter.standard,
      subject: chapter.subject,
    });

    // Delete associated progress
    await Progress.deleteMany({ chapterId: chapter._id });

    res.status(200).json({
      success: true,
      message: "Chapter and associated data deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get chapters by subject
exports.getChaptersBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const { standard } = req.query;

    let filter = { subject, isFree: true };
    if (standard) filter.standard = standard;

    const chapters = await Chapter.find(filter).sort({ chapterNumber: 1 });

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get popular chapters
exports.getPopularChapters = async (req, res) => {
  try {
    const chapters = await Chapter.aggregate([
      { $match: { isFree: true } },
      { $sample: { size: 6 } },
      {
        $lookup: {
          from: "progresses",
          localField: "_id",
          foreignField: "chapterId",
          as: "progress",
        },
      },
      {
        $addFields: {
          popularity: { $size: "$progress" },
        },
      },
      { $sort: { popularity: -1 } },
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      data: chapters,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
