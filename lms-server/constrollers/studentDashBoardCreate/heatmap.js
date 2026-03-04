const StudentHeatmap = require("../../models/StudentHeatmap");
const DailyActivity = require("../../models/dailyActivity");
const heatmapService = require("../../services/heatmapService");

// 🎯 ഹീറ്റ്മാപ്പ് അപ്ഡേറ്റ് ചെയ്യുക
const updateStudentHeatmap = async (userId, activityData) => {
  try {
    const { date, type, videoId, subjectId, chapterId, pageId, data } =
      activityData;
    const studentId = userId;
    // DailyActivity-യിൽ നിന്നും ഡാറ്റ എടുക്കുക
    const dailyActivity = await DailyActivity.findOne({
      studentId,
      date: new Date(date).setHours(0, 0, 0, 0),
    });

    if (!dailyActivity) {
      return res.status(404).json({
        success: false,
        message: "ഇന്നത്തെ പ്രവർത്തനങ്ങൾ ഒന്നും കണ്ടെത്തിയില്ല",
      });
    }

    // ഹീറ്റ്മാപ്പ് അപ്ഡേറ്റ് ചെയ്യുക
    const heatmap = await heatmapService.updateHeatmap(
      studentId,
      dailyActivity,
      { type, subjectId, videoId, data },
    );
  } catch (error) {
    console.error("Heatmap update error:", error);
    res.status(500).json({
      success: false,
      message: "ഹീറ്റ്മാപ്പ് അപ്ഡേറ്റ് ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു",
      error: error.message,
    });
  }
};

// 📊 ഒരു വർഷത്തെ ഹീറ്റ്മാപ്പ് കാണുക
const getYearlyHeatmap = async (req, res) => {
  try {
    const { studentId, year } = req.params;

    const heatmap = await StudentHeatmap.findOne({
      studentId,
      year: parseInt(year),
    }).populate("summary.favoriteSubject", "name color");

    if (!heatmap) {
      return res.status(404).json({
        success: false,
        message: "ഈ വർഷത്തെ ഹീറ്റ്മാപ്പ് കണ്ടെത്തിയില്ല",
      });
    }

    // ഫ്രണ്ട്-എൻഡിന് വേണ്ടി ഫോർമാറ്റ് ചെയ്യുക
    const formattedData = {
      year: heatmap.year,
      summary: heatmap.summary,
      cells: heatmap.cells.map((cell) => ({
        date: cell.date,
        intensity: cell.intensity,
        color: cell.color,
        watchTime: cell.watchTime,
        videosCompleted: cell.videosCompleted,
        note: cell.note,
        hasAchievement: cell.hasAchievement,
      })),
      monthlyBreakdown: heatmap.monthlyBreakdown,
    };

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Get heatmap error:", error);
    res.status(500).json({
      success: false,
      message: "ഹീറ്റ്മാപ്പ് ലഭ്യമാക്കുന്നതിൽ പിശക് സംഭവിച്ചു",
      error: error.message,
    });
  }
};

// 📈 മാസ തിരിച്ചുള്ള വിശകലനം
const getMonthlyAnalysis = async (req, res) => {
  try {
    const { studentId, year, month } = req.params;

    const heatmap = await StudentHeatmap.findOne({
      studentId,
      year: parseInt(year),
    });

    if (!heatmap) {
      return res.status(404).json({
        success: false,
        message: "ഡാറ്റ കണ്ടെത്തിയില്ല",
      });
    }

    const monthlyData = heatmap.monthlyBreakdown.find(
      (m) => m.month === parseInt(month) && m.year === parseInt(year),
    );

    // ആ മാസത്തെ സെല്ലുകൾ ഫിൽട്ടർ ചെയ്യുക
    const monthCells = heatmap.cells.filter((cell) => {
      const cellDate = new Date(cell.date);
      return (
        cellDate.getMonth() === parseInt(month) &&
        cellDate.getFullYear() === parseInt(year)
      );
    });

    res.status(200).json({
      success: true,
      data: {
        summary: monthlyData,
        dailyBreakdown: monthCells,
      },
    });
  } catch (error) {
    console.error("Monthly analysis error:", error);
    res.status(500).json({
      success: false,
      message: "മാസ വിശകലനം ലഭ്യമാക്കുന്നതിൽ പിശക്",
      error: error.message,
    });
  }
};

// 🏆 സ്ട്രീക്ക് വിവരങ്ങൾ
const getStreakInfo = async (req, res) => {
  try {
    const { studentId } = req.params;
    const currentYear = new Date().getFullYear();

    const heatmap = await StudentHeatmap.findOne({
      studentId,
      year: currentYear,
    });

    if (!heatmap) {
      return res.status(200).json({
        success: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          streakHistory: [],
        },
      });
    }

    // സ്ട്രീക്ക് ഹിസ്റ്ററി കണക്കാക്കുക
    const streakHistory = [];
    let currentStreak = 0;

    for (let cell of heatmap.cells.sort((a, b) => a.date - b.date)) {
      if (cell.intensity > 0) {
        currentStreak++;
      } else {
        if (currentStreak > 0) {
          streakHistory.push({
            startDate: new Date(
              cell.date - currentStreak * 24 * 60 * 60 * 1000,
            ),
            endDate: cell.date,
            days: currentStreak,
          });
        }
        currentStreak = 0;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        currentStreak: heatmap.summary.currentStreak,
        longestStreak: heatmap.summary.longestStreak,
        streakHistory,
      },
    });
  } catch (error) {
    console.error("Streak info error:", error);
    res.status(500).json({
      success: false,
      message: "സ്ട്രീക്ക് വിവരങ്ങൾ ലഭ്യമാക്കുന്നതിൽ പിശക്",
      error: error.message,
    });
  }
};

// 📝 കുറിപ്പ് ചേർക്കുക
const addNoteToDay = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { date, note } = req.body;

    const year = new Date(date).getFullYear();

    const heatmap = await StudentHeatmap.findOne({
      studentId,
      year,
    });

    if (!heatmap) {
      return res.status(404).json({
        success: false,
        message: "ഹീറ്റ്മാപ്പ് കണ്ടെത്തിയില്ല",
      });
    }

    const cell = heatmap.cells.find(
      (c) => c.date.toDateString() === new Date(date).toDateString(),
    );

    if (cell) {
      cell.note = note;
      await heatmap.save();
    }

    res.status(200).json({
      success: true,
      message: "കുറിപ്പ് വിജയകരമായി ചേർത്തു",
    });
  } catch (error) {
    console.error("Add note error:", error);
    res.status(500).json({
      success: false,
      message: "കുറിപ്പ് ചേർക്കുന്നതിൽ പിശക്",
      error: error.message,
    });
  }
};

// 🔄 ഹീറ്റ്മാപ്പ് പുനഃക്രമീകരിക്കുക (റീകാൽക്കുലേറ്റ്)
const recalculateHeatmap = async (req, res) => {
  try {
    const { studentId, year } = req.params;

    const heatmap = await heatmapService.recalculateHeatmap(
      studentId,
      parseInt(year),
    );

    res.status(200).json({
      success: true,
      message: "ഹീറ്റ്മാപ്പ് വിജയകരമായി പുനഃക്രമീകരിച്ചു",
      data: heatmap,
    });
  } catch (error) {
    console.error("Recalculate error:", error);
    res.status(500).json({
      success: false,
      message: "പുനഃക്രമീകരണത്തിൽ പിശക്",
      error: error.message,
    });
  }
};

module.exports = {
  updateStudentHeatmap,
  getYearlyHeatmap,
  getMonthlyAnalysis,
  getStreakInfo,
  addNoteToDay,
  recalculateHeatmap,
};
