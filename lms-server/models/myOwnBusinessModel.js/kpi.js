const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },

  // ===== USER METRICS =====
  userMetrics: {
    totalRegisteredUsers: Number,
    activeUsersMonthly: Number,
    activeUsersDaily: Number,
    newUsersThisMonth: Number,
    averageSessionDuration: Number, // minutes
    courseCompletionRate: Number, // percentage
  },

  // ===== FINANCIAL METRICS =====
  financialMetrics: {
    mrr: Number, // Monthly Recurring Revenue
    arr: Number, // Annual Recurring Revenue
    arpu: Number, // Average Revenue Per User
    ltv: Number, // Lifetime Value
    cac: Number, // Customer Acquisition Cost
    ltvCacRatio: Number,
    churnRate: Number, // percentage
  },

  // ===== CONTENT METRICS =====
  contentMetrics: {
    totalCourses: Number,
    totalVideoHours: Number,
    newContentPerMonth: Number,
    popularCourses: [
      {
        courseId: String,
        courseName: String,
        enrollments: Number,
        revenue: Number,
      },
    ],
    categoryWise: [
      {
        category: String,
        courses: Number,
        enrollments: Number,
      },
    ],
  },

  // ===== ENGAGEMENT METRICS =====
  engagementMetrics: {
    averageWatchTime: Number, // minutes
    completionRate: Number, // percentage
    quizPassRate: Number, // percentage
    certificateEarned: Number,
    discussionPosts: Number,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("KPI", kpiSchema);
