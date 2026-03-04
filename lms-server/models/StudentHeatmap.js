const mongoose = require("mongoose");

// ഓരോ ദിവസത്തെയും ഹീറ്റ്മാപ്പ് സെൽ
const heatmapCellSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    intensity: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
      default: 0,
    },
    watchTime: {
      type: Number,
      default: 0, // സെക്കന്റിൽ
      min: 0,
    },
    videosCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    videosStarted: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      enum: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
      default: "#ebedf0",
    },
    // മണിക്കൂർ തിരിച്ചുള്ള ബ്രേക്ക്ഡൗൺ
    hourlyActivity: [
      {
        hour: Number,
        intensity: Number,
        watchTime: Number,
      },
    ],
    subjects: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
        watchTime: Number,
        videosWatched: Number,
      },
    ],
    note: String,
    hasAchievement: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

// മാസം തിരിച്ചുള്ള ബ്രേക്ക്ഡൗൺ
const monthlyBreakdownSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 0,
    max: 11,
  },
  year: {
    type: Number,
    required: true,
  },
  totalWatchTime: {
    type: Number,
    default: 0,
  },
  activeDays: {
    type: Number,
    default: 0,
  },
  averageDailyTime: {
    type: Number,
    default: 0,
  },
  peakHour: Number,
  favoriteSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
});

// മെയിൻ ഹീറ്റ്മാപ്പ് സ്കീമ
const studentHeatmapSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    cells: [heatmapCellSchema],

    // സംഗ്രഹ സ്ഥിതിവിവരങ്ങൾ
    summary: {
      totalActiveDays: {
        type: Number,
        default: 0,
      },
      totalWatchTime: {
        type: Number,
        default: 0,
      },
      totalVideosCompleted: {
        type: Number,
        default: 0,
      },
      totalVideosStarted: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      mostActiveMonth: Number,
      mostActiveHour: Number,
      consistencyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      favoriteSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    },

    monthlyBreakdown: [monthlyBreakdownSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
studentHeatmapSchema.index({ studentId: 1, year: -1 });
studentHeatmapSchema.index({ "cells.date": 1 });

// 🔥 Intensity കണക്കാക്കാനുള്ള മെത്തേഡ്
studentHeatmapSchema.methods.calculateIntensity = function (
  watchTime,
  videosCount,
) {
  if (watchTime === 0) return 0;
  if (watchTime < 900) return 1; // 15 മിനിട്ടിൽ താഴെ
  if (watchTime < 1800) return 2; // 15-30 മിനിട്ട്
  if (watchTime < 3600) return 3; // 30-60 മിനിട്ട്
  return 4; // 1 മണിക്കൂറിൽ കൂടുതൽ
};

// 🎨 Intensity അനുസരിച്ച് നിറം തിരികെ നൽകുക
studentHeatmapSchema.methods.getColorForIntensity = function (intensity) {
  const colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
  return colors[intensity] || colors[0];
};

// 📊 Consistency Score കണക്കാക്കുക
studentHeatmapSchema.methods.calculateConsistencyScore = function () {
  const totalDays = this.cells.length;
  if (totalDays === 0) return 0;

  const activeDays = this.cells.filter((cell) => cell.intensity > 0).length;
  const baseScore = (activeDays / totalDays) * 100;

  // Streak bonus
  const streakBonus = Math.min(this.summary.currentStreak * 2, 20);

  return Math.min(baseScore + streakBonus, 100);
};

// ⏱️ Streak കണക്കാക്കുക
studentHeatmapSchema.methods.calculateCurrentStreak = function () {
  const sortedCells = this.cells.sort((a, b) => b.date - a.date);
  let streak = 0;

  for (let cell of sortedCells) {
    if (cell.intensity > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

const StudentHeatmap = mongoose.model("StudentHeatmap", studentHeatmapSchema);
module.exports = StudentHeatmap;
