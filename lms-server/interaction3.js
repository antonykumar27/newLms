models/Leaderboard.js (If not exists)
javascript
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  standardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Standard',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
  },
  entries: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: String,
    score: Number,
    performanceIndex: Number,
    streak: Number,
    pagesCompleted: Number,
    quizzesPassed: Number,
    watchMinutes: Number,
    rank: Number,
    percentile: Number,
    lastActive: Date,
  }],
  totalStudents: Number,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

leaderboardSchema.index({ standardId: 1, date: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
📁 cron/automation.js - Scheduled Tasks
javascript
const cron = require('node-cron');
const { runMidnightAutomation } = require('../controllers/enhancedTrackingController');

// Run at midnight every day (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running midnight automation...');
  await runMidnightAutomation();
});

// Run every hour to update real-time metrics if needed
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Running hourly check...');
  // Add hourly tasks if needed
});

module.exports = cron;
📁 routes/studentRoutes.js - New Routes
javascript
const express = require('express');
const router = express.Router();
const enhancedTracking = require('../controllers/enhancedTrackingController');
const auth = require('../middleware/auth');

// Get complete student dashboard
router.get('/dashboard', auth, enhancedTracking.getStudentDashboard);

// Get page progress
router.get('/progress/page/:pageId', auth, async (req, res) => {
  const progress = await enhancedTracking.calculatePageProgress(
    req.user._id, 
    req.params.pageId
  );
  res.json({ success: true, data: progress });
});

// Get chapter progress
router.get('/progress/chapter/:chapterId', auth, async (req, res) => {
  const progress = await enhancedTracking.calculateChapterProgress(
    req.user._id, 
    req.params.chapterId
  );
  res.json({ success: true, data: progress });
});

// Get subject progress
router.get('/progress/subject/:subjectId', auth, async (req, res) => {
  const progress = await enhancedTracking.calculateSubjectProgress(
    req.user._id, 
    req.params.subjectId
  );
  res.json({ success: true, data: progress });
});

// Get standard progress
router.get('/progress/standard', auth, async (req, res) => {
  const progress = await enhancedTracking.calculateStandardProgress(
    req.user._id, 
    req.user.standard
  );
  res.json({ success: true, data: progress });
});

// Get performance index
router.get('/performance-index', auth, async (req, res) => {
  const api = await enhancedTracking.calculatePerformanceIndex(
    req.user._id, 
    req.user.standard
  );
  res.json({ success: true, data: api });
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  const leaderboard = await enhancedTracking.updateLeaderboard(req.user.standard);
  res.json({ success: true, data: leaderboard });
});

// Get insights
router.get('/insights', auth, async (req, res) => {
  const insights = await enhancedTracking.generateStudentInsights(req.user._id);
  res.json({ success: true, data: insights });
});

// Manual trigger for midnight automation (admin only)
router.post('/run-automation', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  await enhancedTracking.runMidnightAutomation();
  res.json({ success: true, message: 'Automation triggered' });
});

module.exports = router;
📁 integration/interactionController.js - Update Your Existing Controller
Add this at the end of your trackInteraction function, after saving the interaction:

javascript
// At the end of exports.trackInteraction in your existing controller
// Add these enhanced tracking calls

try {
  // Update heatmap with enhanced data
  const todayActivity = await DailyActivity.findOne({ 
    userId, 
    date: new Date().toISOString().split('T')[0] 
  });
  
  if (todayActivity) {
    await enhancedTracking.updateStudentHeatmap(userId, {
      date: new Date(),
      type,
      subjectId,
      timeSpent: todayActivity.metrics?.totalWatchTime || 0,
      pagesVisited: todayActivity.metrics?.pagesVisited || 0,
      quizzesTaken: todayActivity.metrics?.quizzesTaken || 0,
    });
  }

  // Update leaderboard if needed (can be done in background)
  if (type === 'video_end' || type === 'quiz_complete') {
    // Trigger leaderboard update in background
    setTimeout(() => {
      enhancedTracking.updateLeaderboard(standardId).catch(console.error);
    }, 1000);
  }

  // Generate insights if needed (background)
  if (Math.random() < 0.1) { // 10% chance to trigger insight generation
    enhancedTracking.generateStudentInsights(userId).catch(console.error);
  }
} catch (enhancedError) {
  console.error("Enhanced tracking error:", enhancedError);
  // Don't fail the main request
}
📊 SUMMARY OF WHAT THIS ENHANCED SYSTEM PROVIDES
✅ Complete Academic Tracking
Page Progress - Video + Quiz combined

Chapter Progress - All pages + chapter quiz

Subject Progress - All chapters + subject quiz + accuracy

Standard Progress - All subjects + consistency

Performance Index (API) - Weighted overall score

✅ Intelligent Insights
Weak subject detection

Repeated failure detection

Improvement patterns

Surface learning detection

Low engagement detection

Personalized recommendations

✅ Gamification
Enhanced streak system with freezes

Milestone badges

Leaderboard with percentiles

Heatmap with color coding

✅ Automation
Midnight streak updates

Daily insight generation

Weekly reports

Leaderboard updates

✅ Real Student Example (Class 8)
text
Student: Rahul, Class 8

Dashboard Shows:
📊 Page Progress: 47% (10/21 pages completed)
📚 Chapter Progress: 60% (3/5 chapters completed)
🎯 Subject Progress: 50% (1/2 subjects completed)
📈 Performance Index: 55%

🔥 Streak: 7 days (Longest: 14 days)
🏆 Rank: #15 out of 120 students

Insights Generated:
⚠️ "Maths needs improvement" (Weak subject)
⚠️ "Quadratic Equations chapter requires revision" (Repeated failures)
🎉 "Great progress in English!" (Improvement detected)