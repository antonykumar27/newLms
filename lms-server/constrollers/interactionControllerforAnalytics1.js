// controllers/interactionAnalyticsController.js

const Interaction = require("../models/interaction");
const User = require("../models/loginUserModel");
const mongoose = require("mongoose");
const {
  aggregatePlatformMetrics,
  segmentUsersByBehavior,
  analyzeFeatureAdoption,
} = require("../services/platformMetrics");
/**
 * ===========================================
 * 📊 LEVEL 1: SINGLE USER ANALYTICS
 * ===========================================
 * Purpose: Understand individual learner behavior
 * Business: Personalization, engagement scoring, churn prediction
 */
exports.getUserInteractionProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get all user interactions in time period
    const interactions = await Interaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      eventTime: { $gte: since },
    }).sort({ eventTime: 1 });

    // 1️⃣ Engagement Score Calculation
    const engagementScore = calculateEngagementScore(interactions);

    // 2️⃣ Learning Behavior Patterns
    const behaviorPatterns = analyzeBehaviorPatterns(interactions);

    // 3️⃣ Struggle Points Identification
    const strugglePoints = identifyStrugglePoints(interactions);

    // 4️⃣ Churn Risk Assessment
    const churnRisk = assessChurnRisk(interactions, days);

    // 5️⃣ Content Affinity
    const contentAffinity = calculateContentAffinity(interactions);

    // 6️⃣ Daily Activity Pattern
    const activityPattern = getActivityPattern(interactions);

    res.json({
      success: true,
      data: {
        userId,
        period: `${days} days`,

        // 🎯 Engagement Score (0-100)
        engagement: {
          score: engagementScore.total,
          level: engagementScore.level, // "Low", "Medium", "High"
          factors: engagementScore.factors,
          percentile: await getUserPercentile(userId, engagementScore.total),
        },

        // 📚 Learning Behavior
        learningStyle: {
          primary: behaviorPatterns.primaryStyle, // "Binger", "Regular", "Sporadic"
          averageSessionLength: formatDuration(
            behaviorPatterns.avgSessionLength / 1000, // Convert ms to seconds
          ),
          preferredTime: behaviorPatterns.preferredTime, // "Morning", "Afternoon", "Night"
          consistency: behaviorPatterns.consistency + "%",
          completionRate: behaviorPatterns.completionRate + "%",
        },

        // ⚠️ Struggle Indicators
        struggleIndicators: {
          hasStruggles: strugglePoints.hasStruggles,
          points: strugglePoints.points.map((p) => ({
            videoId: p.videoId,
            timeInVideo: formatDuration(p.time),
            action: p.action,
            count: p.count,
            recommendation: p.recommendation,
          })),
          needsHelp: strugglePoints.needsIntervention,
        },

        // 📈 Churn Prediction
        churnPrediction: {
          risk: churnRisk.level, // "Low", "Medium", "High"
          probability: churnRisk.probability + "%",
          factors: churnRisk.factors,
          recommendedAction: churnRisk.action,
        },

        // ❤️ Content Preferences
        preferences: {
          favoriteSubjects: contentAffinity.topSubjects,
          favoriteVideoLength: contentAffinity.preferredLength,
          interactionDensity: contentAffinity.density + "/min",
          completionVsStart: contentAffinity.completionRatio,
        },

        // 📅 Activity Timeline
        activity: {
          dailyAverage: activityPattern.dailyAvg,
          mostActiveDay: activityPattern.mostActiveDay,
          inactiveDays: activityPattern.inactiveDays,
          streak: activityPattern.currentStreak,
          longestStreak: activityPattern.longestStreak,
        },

        // Raw stats
        stats: {
          totalInteractions: interactions.length,
          uniqueVideosWatched: new Set(
            interactions.map((i) => i.videoId?.toString()).filter(Boolean),
          ).size,
          averagePerDay: (interactions.length / days).toFixed(1),
          lastActive: interactions[interactions.length - 1]?.eventTime,
        },
      },
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ===========================================
 * 📈 LEVEL 2: COURSE/SUBJECT ANALYTICS
 * ===========================================
 * Purpose: Understand content effectiveness
 * Business: Content improvement, dropout points, engagement hotspots
 */
exports.getCourseInteractionAnalytics = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.eventTime = {};
      if (startDate) dateFilter.eventTime.$gte = new Date(startDate);
      if (endDate) dateFilter.eventTime.$lte = new Date(endDate);
    }

    // Get all interactions for this course
    const interactions = await Interaction.find({
      subjectId,
      ...dateFilter,
    }).populate("userId", "name email tier");

    // 1️⃣ Video-by-video breakdown
    const videoBreakdown = await getVideoBreakdown(subjectId, dateFilter);

    // 2️⃣ Drop-off Analysis
    const dropoffAnalysis = analyzeDropoffs(interactions);

    // 3️⃣ Engagement Heatmap
    const heatmap = generateEngagementHeatmap(interactions);

    // 4️⃣ Struggling Videos
    const strugglingVideos = findStrugglingVideos(interactions);

    // 5️⃣ Completion Funnel
    const funnel = buildCompletionFunnel(interactions);

    res.json({
      success: true,
      data: {
        courseId: subjectId,
        period: { startDate, endDate },

        // 📊 Overview Metrics
        overview: {
          totalStudents: new Set(interactions.map((i) => i.userId?.toString()))
            .size,
          totalInteractions: interactions.length,
          avgInteractionsPerStudent: (
            interactions.length /
            Math.max(
              1,
              new Set(interactions.map((i) => i.userId?.toString())).size,
            )
          ).toFixed(1),
          engagementRate: calculateCourseEngagement(interactions) + "%",
        },

        // 🎥 Video Performance
        videoPerformance: videoBreakdown.map((v) => ({
          videoId: v.videoId,
          title: v.title,
          metrics: {
            totalViews: v.views,
            uniqueViewers: v.uniqueViewers,
            avgWatchTime: formatDuration(v.avgWatchTime),
            completionRate: v.completionRate + "%",
            rewatchCount: v.rewatches,

            // 🔴 CRITICAL: Drop-off point
            dropOffPoint: formatDuration(v.dropOffPoint),
            dropOffPercentage: v.dropOffPercentage + "%",

            // 🟢 Engagement
            engagementScore: v.engagementScore,
            pauseFrequency: v.pausesPerMinute + "/min",
            seekFrequency: v.seeksPerMinute + "/min",
          },

          // ⚠️ Warning if problematic
          warnings: v.warnings || [], // ["High drop-off at 2:30", "Excessive pausing"]
        })),

        // 📉 Funnel Analysis
        funnel: {
          started: funnel.started,
          watched25: funnel.watched25,
          watched50: funnel.watched50,
          watched75: funnel.watched75,
          completed: funnel.completed,
          conversionRate: funnel.conversionRate + "%",

          // Where students drop most
          criticalDropoff: funnel.criticalPoint, // e.g., "5-10 minute mark"
        },

        // 🔥 Problem Areas
        problemAreas: {
          hasProblems: strugglingVideos.length > 0,
          videos: strugglingVideos.map((v) => ({
            videoId: v.videoId,
            title: v.title,
            issue: v.issue, // "High dropoff", "Excessive seeking", "Buffering"
            severity: v.severity, // "Low", "Medium", "High"
            suggestedAction: v.suggestion,
          })),
        },

        // ⏰ Time-based Patterns
        timePatterns: {
          peakHours: heatmap.peakHours,
          weekdayVsWeekend: heatmap.weekdayRatio,
          bestTimeToPublish: heatmap.bestTimeToPublish,
        },

        // 📝 Recommendations
        recommendations: generateCourseRecommendations(
          videoBreakdown,
          strugglingVideos,
        ),
      },
    });
  } catch (error) {
    console.error("Error getting course analytics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ===========================================
 * 🏢 LEVEL 3: BUSINESS/PLATFORM ANALYTICS
 * ===========================================
 * Purpose: Overall business health, growth metrics
 * Business: Investor reports, growth tracking, ROI
 */
exports.getPlatformInteractionAnalytics = async (req, res) => {
  try {
    const { days = 30, tier } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Base filters
    let baseFilter = { eventTime: { $gte: since } };
    if (tier) {
      const users = await User.find({ tier }).select("_id");
      baseFilter.userId = { $in: users.map((u) => u._id) };
    }

    // 1️⃣ Aggregated platform metrics
    const platformMetrics = await aggregatePlatformMetrics(baseFilter);

    // 2️⃣ User segmentation by behavior
    const userSegments = await segmentUsersByBehavior(baseFilter);

    // 3️⃣ Feature adoption
    const featureAdoption = await analyzeFeatureAdoption(baseFilter);

    // 4️⃣ Monetization insights
    const monetization = await getMonetizationInsights(baseFilter);

    // 5️⃣ Predictive growth
    const growthPredictions = await predictGrowth(platformMetrics);

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        generatedAt: new Date(),

        // 📊 EXECUTIVE DASHBOARD
        executiveSummary: {
          totalUsers: platformMetrics.totalUsers,
          activeUsers: platformMetrics.activeUsers,
          retentionRate: platformMetrics.retentionRate + "%",

          // 🎯 KEY METRICS
          engagement: {
            dailyActiveUsers: platformMetrics.dau,
            weeklyActiveUsers: platformMetrics.wau,
            monthlyActiveUsers: platformMetrics.mau,
            stickiness:
              ((platformMetrics.dau / platformMetrics.mau) * 100).toFixed(1) +
              "%",

            averageSessionTime: formatDuration(platformMetrics.avgSessionTime),
            interactionsPerUser: platformMetrics.interactionsPerUser,
          },

          // 💰 BUSINESS HEALTH
          businessHealth: {
            payingUsers: platformMetrics.payingUsers,
            conversionRate: platformMetrics.conversionRate + "%",
            churnRate: platformMetrics.churnRate + "%",
            lifetimeValue: "$" + platformMetrics.ltv,

            // Feature usage by tier
            tierUsage: platformMetrics.tierUsage,
          },

          // 📈 GROWTH
          growth: {
            newUsers: platformMetrics.newUsers,
            growthRate: platformMetrics.growthRate + "%",
            projectedUsers: growthPredictions.nextMonth,
            projectedRevenue: "$" + growthPredictions.nextMonthRevenue,
          },
        },

        // 👥 USER SEGMENTATION
        userSegments: {
          // Behavior-based segments
          powerUsers: userSegments.powerUsers, // High engagement
          atRisk: userSegments.atRisk, // Might churn
          casual: userSegments.casual, // Low engagement
          dormant: userSegments.dormant, // No activity

          // Segment details
          details: {
            powerUsers: {
              count: userSegments.powerUsersCount,
              percentage: userSegments.powerUsersPercent + "%",
              characteristics: userSegments.powerUsersTraits,
            },
            atRisk: {
              count: userSegments.atRiskCount,
              percentage: userSegments.atRiskPercent + "%",
              riskFactors: userSegments.riskFactors,
              recommendedActions: userSegments.recoveryActions,
            },
          },
        },

        // 🚀 FEATURE ADOPTION
        featureAdoption: {
          mostUsed: featureAdoption.topFeatures,
          leastUsed: featureAdoption.bottomFeatures,

          adoptionByTier: {
            free: featureAdoption.freeAdoption,
            premium: featureAdoption.premiumAdoption,
            enterprise: featureAdoption.enterpriseAdoption,
          },

          // Feature correlation with retention
          // featureImpact: featureAdoption.retentionImpact.map((f) => ({
          //   feature: f.name,
          //   usersWhoUseIt: f.usersCount,
          //   theirRetention: f.retentionRate + "%",
          //   impact: f.impact, // "High", "Medium", "Low"
          // })),
        },

        // 🔥 REAL-TIME INSIGHTS
        realtime: {
          currentlyActive: await getCurrentlyActiveUsers(),
          todayInteractions: await getTodayInteractions(),
          trendingVideos: await getTrendingContent(),
          anomalies: await detectAnomalies(),
        },

        // 📉 CHURN ANALYSIS
        churnAnalysis: {
          overallChurn: platformMetrics.churnRate + "%",
          churnByTier: platformMetrics.churnByTier,
          churnByBehavior: platformMetrics.churnByBehavior,
          predictedChurn: growthPredictions.nextMonthChurn + "%",

          // Why users churn
          topReasons: platformMetrics.churnReasons.map((r) => ({
            reason: r.reason,
            percentage: r.percentage + "%",
            prevention: r.preventionStrategy,
          })),
        },

        // 📈 TRENDS
        trends: {
          daily: platformMetrics.dailyTrend,
          weekly: platformMetrics.weeklyTrend,
          monthly: platformMetrics.monthlyTrend,

          // YoY Comparison
          yearOverYear: {
            growth: platformMetrics.yoyGrowth + "%",
            engagement: platformMetrics.yoyEngagement + "%",
          },
        },

        // 🎯 RECOMMENDATIONS
        recommendations: [
          {
            priority: "High",
            area: "Content",
            insight: "Videos over 10 minutes have 40% higher dropoff",
            action: "Create shorter, focused content",
          },
          {
            priority: "Medium",
            area: "Engagement",
            insight: "Users who bookmark videos have 85% retention",
            action: "Encourage bookmarking with UI prompts",
          },
          {
            priority: "Low",
            area: "Monetization",
            insight: "Premium users use 2x more features",
            action: "Highlight premium features in free tier",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error getting platform analytics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ===========================================
 * 🔥 LEVEL 4: VIDEO-SPECIFIC DEEP DIVE
 * ===========================================
 * Purpose: Understand exactly how users watch a video
 * Business: Content optimization, teaching improvement
 */
exports.getVideoInteractionDeepDive = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Get all interactions for this video
    const interactions = await Interaction.find({ videoId })
      .populate("userId", "name email tier")
      .sort({ eventTime: -1 });

    // 1️⃣ Watch Pattern Analysis
    const watchPatterns = analyzeWatchPatterns(interactions);

    // 2️⃣ Frame-by-frame engagement
    const frameEngagement = generateFrameEngagement(interactions);

    // 3️⃣ Replay/Skip points
    const navigationPoints = analyzeNavigation(interactions);

    // 4️⃣ Performance metrics
    const performance = analyzePerformance(interactions);

    res.json({
      success: true,
      data: {
        videoId,

        // 📊 OVERALL
        summary: {
          totalViews: watchPatterns.totalViews,
          uniqueViewers: watchPatterns.uniqueViewers,
          avgCompletion: watchPatterns.avgCompletion + "%",
          totalWatchTime: formatDuration(watchPatterns.totalWatchTime),

          // Grade (A-F)
          grade: watchPatterns.grade,
          percentileVsAverage: watchPatterns.percentile,
        },

        // 🎯 ENGAGEMENT HEATMAP (by second)
        heatmap: frameEngagement.map((frame) => ({
          time: formatDuration(frame.time),
          engagement: frame.engagement, // 0-100
          viewers: frame.viewers,
          action: frame.topAction, // "Pause", "Rewind", "Skip"
        })),

        // 🔄 NAVIGATION PATTERNS
        navigation: {
          // Where users rewind most (confusing parts)
          rewindPoints: navigationPoints.rewinds.map((p) => ({
            time: formatDuration(p.time),
            count: p.count,
            likelyReason: p.reason, // "Complex concept", "Missed something"
          })),

          // Where users skip (boring parts)
          skipPoints: navigationPoints.skips.map((p) => ({
            time: formatDuration(p.time),
            count: p.count,
            likelyReason: p.reason, // "Too slow", "Already known"
          })),

          // Where users pause (taking notes/confused)
          pausePoints: navigationPoints.pauses.map((p) => ({
            time: formatDuration(p.time),
            avgPauseDuration: formatDuration(p.avgDuration),
            noteTaking: p.likelyNoteTaking, // true/false
          })),
        },

        // 📉 DROPOFF CURVE
        dropoff: {
          curve: watchPatterns.dropoffCurve.map((point) => ({
            time: formatDuration(point.time),
            viewersRemaining: point.viewers,
            percentage: point.percentage + "%",
          })),
          criticalPoint: formatDuration(watchPatterns.criticalDropoff),
          survivalRate: watchPatterns.survivalRate + "%",
        },

        // ⏱️ SPEED PREFERENCES
        playbackSpeeds: {
          mostUsed: watchPatterns.commonSpeed + "x",
          distribution: watchPatterns.speedDistribution,
          insight: watchPatterns.speedInsight,
        },

        // 🔧 PERFORMANCE
        performance: {
          bufferingEvents: performance.bufferingCount,
          avgBufferingTime: formatDuration(performance.avgBuffering),
          usersWithBuffering: performance.usersAffected + "%",

          quality: performance.quality, // "HD", "SD", etc.
          deviceBreakdown: performance.devices,
        },

        // 💡 RECOMMENDATIONS
        improvements: [
          {
            issue: "High dropoff at 2:30",
            suggestion: "Add visual summary at 2:00",
            impact: "Could improve completion by 15%",
          },
          {
            issue: "Many rewinds at 5:15",
            suggestion: "Explain concept more clearly",
            impact: "Would reduce confusion",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error getting video deep dive:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * ===========================================
 * 🚨 LEVEL 5: ALERTS & ANOMALIES
 * ===========================================
 * Purpose: Detect problems in real-time
 * Business: Quick intervention, quality control
 */
exports.getInteractionAlerts = async (req, res) => {
  try {
    const alerts = [];

    // 1️⃣ Sudden drop in engagement
    const engagementDrop = await detectEngagementDrop();
    if (engagementDrop.significant) {
      alerts.push({
        type: "ENGAGEMENT_DROP",
        severity: "High",
        message: `Engagement dropped ${engagementDrop.percent}% in last hour`,
        affectedVideos: engagementDrop.videos,
        action: "Check content or platform issues",
      });
    }

    // 2️⃣ Unusual behavior (cheating)
    const suspiciousActivity = await detectSuspiciousActivity();
    if (suspiciousActivity.found) {
      alerts.push({
        type: "SUSPICIOUS_ACTIVITY",
        severity: "Critical",
        message: `${suspiciousActivity.count} users showing bot-like behavior`,
        users: suspiciousActivity.users,
        action: "Investigate and block if necessary",
      });
    }

    // 3️⃣ Video with high buffering
    const bufferingIssues = await detectBufferingIssues();
    if (bufferingIssues.found) {
      alerts.push({
        type: "BUFFERING_ISSUES",
        severity: "Medium",
        message: `${bufferingIssues.videos.length} videos have high buffering`,
        videos: bufferingIssues.videos,
        action: "Optimize video encoding or CDN",
      });
    }

    // 4️⃣ Struggling students
    const strugglingStudents = await detectStrugglingStudents();
    if (strugglingStudents.length > 0) {
      alerts.push({
        type: "STUDENTS_STRUGGLING",
        severity: "Medium",
        message: `${strugglingStudents.length} students showing struggle patterns`,
        students: strugglingStudents.slice(0, 5),
        action: "Send help prompts or assign tutor",
      });
    }

    // 5️⃣ Content going viral
    const trendingContent = await detectTrending();
    if (trendingContent.length > 0) {
      alerts.push({
        type: "TRENDING_CONTENT",
        severity: "Info",
        message: `${trendingContent.length} videos trending`,
        videos: trendingContent,
        action: "Promote in recommendations",
      });
    }

    res.json({
      success: true,
      data: {
        timestamp: new Date(),
        critical: alerts.filter((a) => a.severity === "Critical"),
        high: alerts.filter((a) => a.severity === "High"),
        medium: alerts.filter((a) => a.severity === "Medium"),
        info: alerts.filter((a) => a.severity === "Info"),
        all: alerts,
      },
    });
  } catch (error) {
    console.error("Error getting alerts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===========================================
// 📦 HELPER FUNCTIONS (ALL DEFINED HERE)
// ===========================================

/**
 * Calculate engagement score from interactions
 */
function calculateEngagementScore(interactions) {
  const weights = {
    video_end: 10,
    comment_add: 8,
    note_add: 7,
    video_like: 5,
    video_bookmark: 6,
    video_play: 1,
    video_pause: 1,
  };

  // 🔒 If no interactions
  if (!interactions || interactions.length === 0) {
    return {
      total: 0,
      level: "Low",
      factors: [],
    };
  }

  let score = 0;
  let factors = [];

  interactions.forEach((i) => {
    score += weights[i.type] || 1;
  });

  // Normalize safely (0-100)
  score = Math.min(100, Math.floor((score / interactions.length) * 10));

  let level = "Low";
  if (score >= 70) level = "High";
  else if (score >= 40) level = "Medium";

  return { total: score, level, factors };
}

/**
 * Calculate completion rate from interactions
 */
function calculateCompletionRate(interactions) {
  if (!interactions || interactions.length === 0) return 0;

  const videoEnds = interactions.filter((i) => i.type === "video_end").length;
  const totalVideos = new Set(
    interactions.filter((i) => i.videoId).map((i) => i.videoId.toString()),
  ).size;

  return totalVideos > 0 ? Math.floor((videoEnds / totalVideos) * 100) : 0;
}

/**
 * Analyze behavior patterns from interactions
 */
function analyzeBehaviorPatterns(interactions) {
  if (!interactions || interactions.length === 0) {
    return {
      primaryStyle: "No Activity",
      avgSessionLength: 0,
      preferredTime: "Unknown",
      consistency: 0,
      completionRate: 0,
    };
  }

  // Group by session (30 min gap)
  let sessions = [];
  let currentSession = [];

  interactions.forEach((i, index) => {
    if (index === 0) {
      currentSession.push(i);
    } else {
      const timeDiff = i.eventTime - interactions[index - 1].eventTime;
      if (timeDiff < 30 * 60 * 1000) {
        // 30 minutes
        currentSession.push(i);
      } else {
        sessions.push(currentSession);
        currentSession = [i];
      }
    }
  });
  if (currentSession.length) sessions.push(currentSession);

  const avgSessionLength =
    sessions.length > 0
      ? sessions.reduce(
          (sum, s) => sum + (s[s.length - 1].eventTime - s[0].eventTime),
          0,
        ) / sessions.length
      : 0;

  // Find preferred time
  const hourCounts = {};
  interactions.forEach((i) => {
    const hour = new Date(i.eventTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const preferredHour = Object.entries(hourCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  let timeOfDay = "Morning";
  if (preferredHour >= 12 && preferredHour < 17) timeOfDay = "Afternoon";
  else if (preferredHour >= 17) timeOfDay = "Night";

  // Calculate consistency (days active / total days)
  const uniqueDays = new Set(
    interactions.map((i) => i.eventTime.toISOString().split("T")[0]),
  ).size;

  const totalDays =
    Math.ceil(
      (interactions[interactions.length - 1]?.eventTime -
        interactions[0]?.eventTime) /
        (24 * 60 * 60 * 1000),
    ) || 1;

  const consistency = Math.min(100, Math.floor((uniqueDays / totalDays) * 100));

  return {
    primaryStyle:
      sessions.length > 10
        ? "Regular"
        : sessions.length > 5
          ? "Casual"
          : "Sporadic",
    avgSessionLength,
    preferredTime: timeOfDay,
    consistency,
    completionRate: calculateCompletionRate(interactions),
  };
}

/**
 * Identify struggle points from interactions
 */
function identifyStrugglePoints(interactions) {
  const strugglePoints = [];

  // Find rewind points
  const seeks = interactions.filter(
    (i) => i.type === "video_seek_backward" && i.data?.seekAmount > 10,
  );

  seeks.forEach((seek) => {
    const point = strugglePoints.find(
      (p) =>
        p.videoId === seek.videoId?.toString() &&
        Math.abs(p.time - seek.data.currentTime) < 10,
    );

    if (point) {
      point.count++;
    } else {
      strugglePoints.push({
        videoId: seek.videoId,
        time: seek.data.currentTime,
        action: "Rewind",
        count: 1,
        recommendation: "Check if concept needs clearer explanation",
      });
    }
  });

  // Find pause points (long pauses might indicate confusion)
  const pauses = interactions.filter(
    (i) => i.type === "video_pause" && i.data?.pauseDuration > 30, // Paused for >30 seconds
  );

  pauses.forEach((pause) => {
    const point = strugglePoints.find(
      (p) =>
        p.videoId === pause.videoId?.toString() &&
        Math.abs(p.time - pause.data.currentTime) < 10,
    );

    if (point) {
      point.count++;
    } else {
      strugglePoints.push({
        videoId: pause.videoId,
        time: pause.data.currentTime,
        action: "Long Pause",
        count: 1,
        recommendation: "Content might need simplification at this point",
      });
    }
  });

  return {
    hasStruggles: strugglePoints.length > 0,
    points: strugglePoints.sort((a, b) => b.count - a.count).slice(0, 5),
    needsIntervention: strugglePoints.some((p) => p.count > 3),
  };
}

/**
 * Assess churn risk based on activity patterns
 */
function assessChurnRisk(interactions, days) {
  const last7Days = interactions.filter(
    (i) => i.eventTime > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length;

  const previous7Days = interactions.filter(
    (i) =>
      i.eventTime <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
      i.eventTime > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  ).length;

  const dropoff =
    previous7Days > 0 ? ((previous7Days - last7Days) / previous7Days) * 100 : 0;

  let risk = "Low";
  let probability = 10;
  let factors = [];

  if (dropoff > 50) {
    risk = "High";
    probability = 70;
    factors.push("70% drop in activity");
  } else if (dropoff > 25) {
    risk = "Medium";
    probability = 40;
    factors.push("25% drop in activity");
  }

  if (last7Days === 0) {
    risk = "High";
    probability = 90;
    factors.push("No activity in last week");
  }

  // Check engagement quality
  const hasCompletions = interactions.some((i) => i.type === "video_end");
  if (!hasCompletions && interactions.length > 10) {
    factors.push("Watching but not completing");
    if (risk !== "High") {
      risk = "Medium";
      probability = 50;
    }
  }

  return {
    level: risk,
    probability,
    factors: factors.length ? factors : ["Activity stable"],
    action:
      risk === "High"
        ? "Send re-engagement email with personalized content"
        : risk === "Medium"
          ? "Send nudge notification"
          : "Continue monitoring",
  };
}

/**
 * Calculate content affinity/preferences
 */
function calculateContentAffinity(interactions) {
  // Group by subject
  const subjectCount = {};
  interactions.forEach((i) => {
    if (i.subjectId) {
      const id = i.subjectId.toString();
      subjectCount[id] = (subjectCount[id] || 0) + 1;
    }
  });

  // Group by video length preference (from watch time)
  let totalWatchTime = 0;
  let videoCount = 0;
  interactions.forEach((i) => {
    if (i.data?.duration) {
      totalWatchTime += i.data.duration;
      videoCount++;
    }
  });

  const avgVideoLength = videoCount > 0 ? totalWatchTime / videoCount : 0;
  let preferredLength = "Medium (5-10 min)";
  if (avgVideoLength < 300) preferredLength = "Short (<5 min)";
  else if (avgVideoLength > 600) preferredLength = "Long (>10 min)";

  // Calculate interaction density
  const timeSpan =
    interactions.length > 1
      ? (interactions[interactions.length - 1].eventTime -
          interactions[0].eventTime) /
        (1000 * 60) // in minutes
      : 30;
  const density = (interactions.length / Math.max(1, timeSpan)).toFixed(1);

  return {
    topSubjects: Object.entries(subjectCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => ({ id, count })),
    preferredLength,
    density,
    completionRatio: calculateCompletionRate(interactions) + "%",
  };
}

/**
 * Get activity pattern from interactions
 */
function getActivityPattern(interactions) {
  const days = {};
  interactions.forEach((i) => {
    const date = i.eventTime.toISOString().split("T")[0];
    days[date] = (days[date] || 0) + 1;
  });

  const uniqueDays = Object.keys(days).length;

  // Calculate streaks
  const sortedDates = Object.keys(days).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  let prevDate = null;

  sortedDates.forEach((date) => {
    if (prevDate) {
      const diff =
        (new Date(date) - new Date(prevDate)) / (24 * 60 * 60 * 1000);
      if (diff === 1) {
        streak++;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    longestStreak = Math.max(longestStreak, streak);
    prevDate = date;
  });

  // Check current streak
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (days[today]) {
    currentStreak = 1;
    let date = yesterday;
    while (days[date]) {
      currentStreak++;
      date = new Date(new Date(date) - 86400000).toISOString().split("T")[0];
    }
  } else if (days[yesterday]) {
    currentStreak = 1;
    let date = new Date(yesterday - 86400000).toISOString().split("T")[0];
    while (days[date]) {
      currentStreak++;
      date = new Date(new Date(date) - 86400000).toISOString().split("T")[0];
    }
  }

  return {
    dailyAvg:
      uniqueDays > 0 ? (interactions.length / uniqueDays).toFixed(1) : "0",
    mostActiveDay:
      Object.entries(days).sort((a, b) => b[1] - a[1])[0]?.[0] || "No activity",
    inactiveDays: 30 - uniqueDays,
    currentStreak,
    longestStreak,
  };
}

/**
 * Get user percentile (mock implementation)
 */
async function getUserPercentile(userId, score) {
  // In production, you'd query all users and calculate real percentile
  // This is a mock implementation
  return Math.min(99, Math.max(1, Math.floor(score)));
}

/**
 * Format duration from seconds to readable string
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0s";
  seconds = Math.floor(seconds);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// ===========================================
// 📦 ADDITIONAL HELPER FUNCTIONS (Placeholders)
// ===========================================

async function getVideoBreakdown(subjectId, dateFilter) {
  // Implement based on your data structure
  return [];
}

function analyzeDropoffs(interactions) {
  return {};
}

function generateEngagementHeatmap(interactions) {
  return {
    peakHours: [],
    weekdayRatio: "50:50",
    bestTimeToPublish: "10:00 AM",
  };
}

function findStrugglingVideos(interactions) {
  return [];
}

function buildCompletionFunnel(interactions) {
  return {
    started: 0,
    watched25: 0,
    watched50: 0,
    watched75: 0,
    completed: 0,
    conversionRate: 0,
    criticalPoint: "N/A",
  };
}

function calculateCourseEngagement(interactions) {
  return 50;
}

function generateCourseRecommendations(videoBreakdown, strugglingVideos) {
  return [];
}

function analyzeWatchPatterns(interactions) {
  return {
    totalViews: 0,
    uniqueViewers: 0,
    avgCompletion: 0,
    totalWatchTime: 0,
    grade: "N/A",
    percentile: 0,
    dropoffCurve: [],
    criticalDropoff: 0,
    survivalRate: 0,
    commonSpeed: 1,
    speedDistribution: {},
    speedInsight: "Normal",
  };
}

function generateFrameEngagement(interactions) {
  return [];
}

function analyzeNavigation(interactions) {
  return {
    rewinds: [],
    skips: [],
    pauses: [],
  };
}

function analyzePerformance(interactions) {
  return {
    bufferingCount: 0,
    avgBuffering: 0,
    usersAffected: 0,
    quality: "HD",
    devices: {},
  };
}

async function getMonetizationInsights(baseFilter) {
  return {};
}

async function predictGrowth(platformMetrics) {
  return {
    nextMonth: 0,
    nextMonthRevenue: 0,
    nextMonthChurn: 0,
  };
}

async function getCurrentlyActiveUsers() {
  return 0;
}

async function getTodayInteractions() {
  return 0;
}

async function getTrendingContent() {
  return [];
}

async function detectAnomalies() {
  return [];
}

async function detectEngagementDrop() {
  return { significant: false, percent: 0, videos: [] };
}

async function detectSuspiciousActivity() {
  return { found: false, count: 0, users: [] };
}

async function detectBufferingIssues() {
  return { found: false, videos: [] };
}

async function detectStrugglingStudents() {
  return [];
}

async function detectTrending() {
  return [];
}
