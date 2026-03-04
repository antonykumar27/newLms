// models/StudentInsight.js
const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Learning patterns
    patterns: {
      preferredStudyTime: {
        timeOfDay: {
          type: String,
          enum: [
            "early_morning",
            "morning",
            "afternoon",
            "evening",
            "night",
            "late_night",
          ],
          default: "evening",
        },
        confidence: { type: Number, min: 0, max: 100, default: 0 },
      },

      preferredDays: [
        {
          day: { type: Number, min: 0, max: 6 }, // 0 = Sunday
          activityLevel: { type: Number, min: 0, max: 100 },
        },
      ],

      averageSessionLength: { type: Number }, // minutes
      learningPace: {
        type: String,
        enum: ["slow", "moderate", "fast", "very_fast"],
      },

      consistencyTrend: {
        type: String,
        enum: ["improving", "stable", "declining"],
      },
    },

    // Performance metrics
    performance: {
      strongestSubject: {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        score: { type: Number, min: 0, max: 100 },
        strengths: [String],
      },

      weakestSubject: {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        score: { type: Number, min: 0, max: 100 },
        improvementAreas: [String],
      },

      subjectComparison: [
        {
          subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
          rank: { type: Number },
          percentile: { type: Number },
          vsClassAverage: { type: Number }, // percentage difference
        },
      ],

      progressVelocity: {
        weekly: { type: Number }, // videos per week
        monthly: { type: Number },
        projectedCompletion: { type: Date },
      },
    },

    // Generated insights (updated weekly)
    insights: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: [
            "achievement",
            "warning",
            "tip",
            "encouragement",
            "prediction",
          ],
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: {
          type: String,
          enum: ["streak", "time", "subject", "completion", "consistency"],
        },
        priority: { type: Number, min: 1, max: 5, default: 3 },

        // Action data
        action: {
          type: {
            type: String,
            enum: ["watch", "review", "practice", "share"],
          },
          target: { type: String },
          url: { type: String },
        },

        // Metrics
        impact: { type: Number, min: 0, max: 100 }, // potential impact score
        generatedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        isRead: { type: Boolean, default: false },
        isDismissed: { type: Boolean, default: false },
      },
    ],

    // Recommendations
    recommendations: [
      {
        type: {
          type: String,
          enum: ["video", "subject", "practice", "break"],
        },
        title: { type: String },
        description: { type: String },
        targetId: { type: mongoose.Schema.Types.ObjectId },
        reason: { type: String },
        urgency: { type: Number, min: 1, max: 5 },
        expiresAt: { type: Date },
      },
    ],

    // Predictive analytics
    predictions: {
      nextBadge: {
        badgeId: { type: String },
        estimatedDays: { type: Number },
        probability: { type: Number, min: 0, max: 100 },
      },

      streakRisk: {
        atRisk: { type: Boolean, default: false },
        riskLevel: { type: Number, min: 0, max: 100 },
        recommendedAction: { type: String },
      },

      completionForecast: {
        expectedDate: { type: Date },
        confidence: { type: Number, min: 0, max: 100 },
        requiredDaily: { type: Number }, // minutes per day
      },
    },

    lastCalculated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Indexes
insightSchema.index({ studentId: 1 });
insightSchema.index({ "insights.generatedAt": -1 });
insightSchema.index({ "performance.strongestSubject.subjectId": 1 });

// Methods
insightSchema.methods.generateInsight = async function () {
  // AI-like insight generation logic
  const newInsights = [];

  // Check streak
  if (this.patterns.consistencyTrend === "improving") {
    newInsights.push({
      id: `insight_${Date.now()}`,
      type: "encouragement",
      title: "Great consistency! 🔥",
      description: "You've been studying more regularly this week. Keep it up!",
      category: "consistency",
      priority: 4,
    });
  }

  // Add more insight generation logic...

  this.insights = [...this.insights, ...newInsights].slice(-20); // Keep last 20
  return newInsights;
};
const StudentInsight = mongoose.model("StudentInsight", insightSchema);
module.exports = StudentInsight;
