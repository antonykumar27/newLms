const Progress = require("../models/progressModel");
const Question = require("../models/questionModel");
const Chapter = require("../models/chapterModel");
const User = require("../models/loginUserModel");

// Get user's progress across all chapters
exports.getMyProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all progress for the user
    const progress = await Progress.find({ user: userId })
      .populate({
        path: "chapterId",
        select: "chapterName chapterNumber standard subject thumbnail",
      })
      .sort({ lastAttempt: -1 });

    // Calculate overall stats
    const totalChapters = await Chapter.countDocuments({ isFree: true });
    const completedChapters = progress.filter(
      (p) => p.status === "Completed",
    ).length;
    const totalQuestions = progress.reduce(
      (sum, p) => sum + p.totalQuestions,
      0,
    );
    const attemptedQuestions = progress.reduce(
      (sum, p) => sum + p.attempted,
      0,
    );
    const correctAnswers = progress.reduce((sum, p) => sum + p.correct, 0);
    const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
    const averageScore =
      attemptedQuestions > 0 ? (totalScore / attemptedQuestions) * 100 : 0;

    // Get recent activity
    const recentActivity = await Progress.find({ user: userId })
      .populate({
        path: "chapterId",
        select: "chapterName subject",
      })
      .sort({ lastAttempt: -1 })
      .limit(10);

    // Get subject-wise performance
    const subjectStats = await calculateSubjectStats(userId);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalChapters,
          completedChapters,
          completionRate:
            totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0,
          totalQuestions,
          attemptedQuestions,
          correctAnswers,
          accuracy:
            attemptedQuestions > 0
              ? (correctAnswers / attemptedQuestions) * 100
              : 0,
          averageScore,
          streak: await calculateStreak(userId),
          bestStreak: await getBestStreak(userId),
        },
        progress,
        recentActivity,
        subjectStats,
        weeklyProgress: await getWeeklyProgress(userId),
        recommendations: await getStudyRecommendations(userId),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get progress",
      error: err.message,
    });
  }
};

// Get progress for specific chapter
exports.getChapterProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({
      user: userId,
      chapterId,
    }).populate("bookmarkQuestions notes.questionId");

    if (!progress) {
      // Initialize progress if not exists
      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        return res.status(404).json({
          success: false,
          message: "Chapter not found",
        });
      }

      const newProgress = await Progress.create({
        user: userId,
        chapterId,
        totalQuestions: 0,
        status: "Not Started",
      });

      return res.status(200).json({
        success: true,
        data: newProgress,
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get chapter progress",
      error: err.message,
    });
  }
};

// Bookmark a question
exports.bookmarkQuestion = async (req, res) => {
  try {
    const { questionId } = req.body;
    const userId = req.user.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Find or create progress for the chapter
    let progress = await Progress.findOne({
      user: userId,
      chapterId: question.chapterId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: userId,
        chapterId: question.chapterId,
      });
    }

    // Check if already bookmarked
    const isBookmarked = progress.bookmarkQuestions.includes(questionId);

    if (isBookmarked) {
      // Remove bookmark
      progress.bookmarkQuestions = progress.bookmarkQuestions.filter(
        (id) => id.toString() !== questionId,
      );
      await progress.save();

      return res.status(200).json({
        success: true,
        message: "Question removed from bookmarks",
        data: { bookmarked: false },
      });
    } else {
      // Add bookmark
      progress.bookmarkQuestions.push(questionId);
      await progress.save();

      return res.status(200).json({
        success: true,
        message: "Question bookmarked",
        data: { bookmarked: true },
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to bookmark question",
      error: err.message,
    });
  }
};

// Add note to question
exports.addNote = async (req, res) => {
  try {
    const { questionId, note } = req.body;
    const userId = req.user.id;

    if (!note || note.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Note cannot be empty",
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Find or create progress for the chapter
    let progress = await Progress.findOne({
      user: userId,
      chapterId: question.chapterId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: userId,
        chapterId: question.chapterId,
      });
    }

    // Check if note exists for this question
    const existingNoteIndex = progress.notes.findIndex(
      (n) => n.questionId.toString() === questionId,
    );

    if (existingNoteIndex !== -1) {
      // Update existing note
      progress.notes[existingNoteIndex].note = note;
      progress.notes[existingNoteIndex].createdAt = new Date();
    } else {
      // Add new note
      progress.notes.push({
        questionId,
        note,
      });
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: existingNoteIndex !== -1 ? "Note updated" : "Note added",
      data: {
        questionId,
        note,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: err.message,
    });
  }
};

// Get bookmarked questions
exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const progressWithBookmarks = await Progress.find({
      user: userId,
      bookmarkQuestions: { $exists: true, $not: { $size: 0 } },
    })
      .populate({
        path: "bookmarkQuestions",
        select: "question options difficulty marks questionType",
      })
      .populate({
        path: "chapterId",
        select: "chapterName subject standard",
      });

    const bookmarks = progressWithBookmarks.flatMap((progress) =>
      progress.bookmarkQuestions.map((question) => ({
        question,
        chapter: progress.chapterId,
        bookmarkedAt: progress.lastAttempt,
      })),
    );

    res.status(200).json({
      success: true,
      data: bookmarks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get bookmarks",
      error: err.message,
    });
  }
};

// Get study notes
exports.getStudyNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    const progressWithNotes = await Progress.find({
      user: userId,
      notes: { $exists: true, $not: { $size: 0 } },
    })
      .populate({
        path: "notes.questionId",
        select: "question questionType",
      })
      .populate({
        path: "chapterId",
        select: "chapterName subject",
      });

    const notes = progressWithNotes.flatMap((progress) =>
      progress.notes.map((note) => ({
        note: note.note,
        question: note.questionId,
        chapter: progress.chapterId,
        createdAt: note.createdAt,
      })),
    );

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get study notes",
      error: err.message,
    });
  }
};

// Update progress after answering question
exports.updateProgress = async (req, res) => {
  try {
    const { questionId, isCorrect } = req.body;
    const userId = req.user.id;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Find or create progress
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

      progress = await Progress.create({
        user: userId,
        chapterId: question.chapterId,
        totalQuestions,
      });
    }

    // Update progress
    progress.attempted += 1;
    if (isCorrect) {
      progress.correct += 1;
      progress.score += question.marks || 1;
    }
    progress.lastAttempt = new Date();

    // Update status
    if (progress.attempted === progress.totalQuestions) {
      progress.status = "Completed";
    } else if (progress.attempted > 0) {
      progress.status = "In Progress";
    }

    await progress.save();

    // Update user's overall stats
    await updateUserStats(userId, isCorrect);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: err.message,
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = "weekly", limit = 20 } = req.query;

    let startDate;
    const now = new Date();

    switch (type) {
      case "daily":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "monthly":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Aggregate progress data for leaderboard
    const leaderboard = await Progress.aggregate([
      {
        $match: {
          lastAttempt: { $gte: startDate },
          attempted: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$score" },
          totalAttempted: { $sum: "$attempted" },
          totalCorrect: { $sum: "$correct" },
          completedChapters: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
          lastActive: { $max: "$lastAttempt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          class: "$user.standard",
          totalScore: 1,
          accuracy: {
            $cond: [
              { $eq: ["$totalAttempted", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$totalCorrect", "$totalAttempted"] },
                  100,
                ],
              },
            ],
          },
          completedChapters: 1,
          lastActive: 1,
        },
      },
      {
        $sort: { totalScore: -1 },
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get leaderboard",
      error: err.message,
    });
  }
};

// Delete progress (reset)
exports.deleteProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOneAndDelete({
      user: userId,
      chapterId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Progress reset successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete progress",
      error: err.message,
    });
  }
};

// ===== HELPER FUNCTIONS =====

// Calculate subject-wise stats
const calculateSubjectStats = async (userId) => {
  const progress = await Progress.find({ user: userId }).populate({
    path: "chapterId",
    select: "subject",
  });

  const subjectMap = {};

  progress.forEach((p) => {
    const subject = p.chapterId?.subject;
    if (!subject) return;

    if (!subjectMap[subject]) {
      subjectMap[subject] = {
        subject,
        totalChapters: 0,
        completedChapters: 0,
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        score: 0,
      };
    }

    subjectMap[subject].totalChapters++;
    if (p.status === "Completed") {
      subjectMap[subject].completedChapters++;
    }
    subjectMap[subject].totalQuestions += p.totalQuestions;
    subjectMap[subject].attempted += p.attempted;
    subjectMap[subject].correct += p.correct;
    subjectMap[subject].score += p.score;
  });

  return Object.values(subjectMap).map((subject) => ({
    ...subject,
    completionRate: (subject.completedChapters / subject.totalChapters) * 100,
    accuracy:
      subject.attempted > 0 ? (subject.correct / subject.attempted) * 100 : 0,
    averageScore:
      subject.attempted > 0 ? (subject.score / subject.attempted) * 100 : 0,
  }));
};

// Calculate learning streak
const calculateStreak = async (userId) => {
  const progress = await Progress.find({ user: userId })
    .sort({ lastAttempt: -1 })
    .limit(30);

  if (progress.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const uniqueDates = [
    ...new Set(progress.map((p) => p.lastAttempt.toISOString().split("T")[0])),
  ];

  for (let i = 0; i < uniqueDates.length; i++) {
    const date = new Date(uniqueDates[i]);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Get best streak
const getBestStreak = async (userId) => {
  // In production, you'd store this in user profile
  // For now, calculate from progress
  const progress = await Progress.find({ user: userId })
    .sort({ lastAttempt: -1 })
    .limit(100);

  if (progress.length === 0) return 0;

  let bestStreak = 0;
  let currentStreak = 0;
  let previousDate = null;

  const uniqueDates = [
    ...new Set(progress.map((p) => p.lastAttempt.toISOString().split("T")[0])),
  ];

  uniqueDates.sort().reverse();

  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);

    if (previousDate) {
      const diffDays = Math.floor(
        (previousDate - currentDate) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        bestStreak = Math.max(bestStreak, currentStreak);
        currentStreak = 0;
      }
    } else {
      currentStreak = 1;
    }

    previousDate = currentDate;
  }

  return Math.max(bestStreak, currentStreak);
};

// Get weekly progress
const getWeeklyProgress = async (userId) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const progress = await Progress.find({
    user: userId,
    lastAttempt: { $gte: oneWeekAgo },
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = {};

  days.forEach((day) => {
    weeklyData[day] = {
      questions: 0,
      correct: 0,
      timeSpent: 0,
    };
  });

  progress.forEach((p) => {
    const day = days[p.lastAttempt.getDay()];
    weeklyData[day].questions += p.attempted;
    weeklyData[day].correct += p.correct;
  });

  return Object.entries(weeklyData).map(([day, data]) => ({
    day,
    ...data,
    accuracy: data.questions > 0 ? (data.correct / data.questions) * 100 : 0,
  }));
};

// Get study recommendations
const getStudyRecommendations = async (userId) => {
  const progress = await Progress.find({ user: userId })
    .populate({
      path: "chapterId",
      select: "chapterName subject difficulty",
    })
    .sort({ score: 1 }) // Lowest scores first
    .limit(5);

  return progress.map((p) => ({
    chapter: p.chapterId,
    currentScore: p.attempted > 0 ? (p.score / p.attempted) * 100 : 0,
    recommendation: p.score < 60 ? "Needs revision" : "Practice more",
    priority: p.score < 60 ? "High" : "Medium",
  }));
};

// Update user stats
const updateUserStats = async (userId, isCorrect) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.stats.totalQuestions += 1;
    if (isCorrect) {
      user.stats.correctAnswers += 1;
    }
    user.stats.lastActive = new Date();

    // Update streak
    const today = new Date().toDateString();
    if (user.stats.lastStudyDay !== today) {
      const lastStudy = new Date(user.stats.lastStudyDay);
      const diffDays = Math.floor(
        (new Date() - lastStudy) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        user.stats.currentStreak += 1;
        user.stats.bestStreak = Math.max(
          user.stats.bestStreak,
          user.stats.currentStreak,
        );
      } else if (diffDays > 1) {
        user.stats.currentStreak = 1;
      }

      user.stats.lastStudyDay = today;
    }

    await user.save();
  } catch (err) {
    console.error("Error updating user stats:", err);
  }
};
