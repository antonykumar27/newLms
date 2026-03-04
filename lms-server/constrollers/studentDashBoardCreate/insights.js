const StudentInsight = require("../../models/StudentInsight.js");
const DailyActivity = require("../../models/dailyActivity.js");

// ==============================================
// UPDATE STUDENT INSIGHTS (FIXED VERSION)
// ==============================================
const updateStudentInsights = async (userId, insightData) => {
  try {
    const { type, subjectId, videoId, chapterId, pageId, date, data } =
      insightData;

    // Find or create insights document
    let insights = await StudentInsight.findOne({ studentId: userId });

    if (!insights) {
      insights = new StudentInsight({
        studentId: userId,
        patterns: {
          preferredStudyTime: {
            timeOfDay: "evening",
            confidence: 0,
          },
          preferredDays: [],
          averageSessionLength: 0,
          learningPace: "moderate",
          consistencyTrend: "stable",
        },
        performance: {
          subjectComparison: [],
          progressVelocity: {},
        },
        insights: [],
        recommendations: [],
        predictions: {
          streakRisk: { atRisk: false, riskLevel: 0 },
          completionForecast: {},
        },
        lastCalculated: new Date(),
      });
      await insights.save();
      return insights;
    }

    // Get current hour for preferred study time calculation
    const activityHour = new Date(date).getHours();
    let timeOfDay = "evening";

    if (activityHour < 4) timeOfDay = "late_night";
    else if (activityHour < 7) timeOfDay = "early_morning";
    else if (activityHour < 11) timeOfDay = "morning";
    else if (activityHour < 14) timeOfDay = "afternoon";
    else if (activityHour < 18) timeOfDay = "evening";
    else timeOfDay = "night";

    // ========== FIX: Use updateOne instead of direct modification ==========
    // Prepare update object
    const updateData = {
      lastCalculated: new Date(),
    };

    // Update preferred study time with weighted average
    if (insights.patterns?.preferredStudyTime) {
      const currentConfidence =
        insights.patterns.preferredStudyTime.confidence || 0;
      updateData["patterns.preferredStudyTime.timeOfDay"] = timeOfDay;
      updateData["patterns.preferredStudyTime.confidence"] = Math.min(
        100,
        currentConfidence + 5,
      );
    }

    // Update preferred days
    const dayOfWeek = new Date(date).getDay();

    // Get current preferredDays or initialize
    const currentPreferredDays = insights.patterns?.preferredDays || [];
    const dayIndex = currentPreferredDays.findIndex((d) => d.day === dayOfWeek);

    if (dayIndex === -1) {
      // Add new day
      updateData["patterns.preferredDays"] = [
        ...currentPreferredDays,
        { day: dayOfWeek, activityLevel: 10 },
      ];
    } else {
      // Update existing day
      const updatedDays = [...currentPreferredDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        activityLevel: Math.min(
          100,
          (updatedDays[dayIndex].activityLevel || 0) + 5,
        ),
      };
      updateData["patterns.preferredDays"] = updatedDays;
    }

    // Calculate average session length from DailyActivity
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateStr = oneWeekAgo.toISOString().split("T")[0];

    const weeklyActivities = await DailyActivity.find({
      studentId: userId,
      date: { $gte: new Date(dateStr) },
    });

    if (weeklyActivities.length > 0) {
      // Calculate average session length from sessions array
      let totalSessionLength = 0;
      let sessionCount = 0;

      weeklyActivities.forEach((activity) => {
        if (activity.sessions && activity.sessions.length > 0) {
          activity.sessions.forEach((session) => {
            if (session.duration) {
              totalSessionLength += session.duration / 60; // Convert to minutes
              sessionCount++;
            }
          });
        }
      });

      if (sessionCount > 0) {
        updateData["patterns.averageSessionLength"] = Math.round(
          totalSessionLength / sessionCount,
        );
      }

      // Calculate learning pace based on videos completed
      const totalVideosCompleted = weeklyActivities.reduce(
        (sum, day) => sum + (day.videosCompleted || 0),
        0,
      );

      const weeklyAverage = totalVideosCompleted / 7;
      if (weeklyAverage > 10) updateData["patterns.learningPace"] = "very_fast";
      else if (weeklyAverage > 5) updateData["patterns.learningPace"] = "fast";
      else if (weeklyAverage > 2)
        updateData["patterns.learningPace"] = "moderate";
      else updateData["patterns.learningPace"] = "slow";

      // Calculate consistency trend
      const firstHalf = weeklyActivities.slice(0, 3);
      const secondHalf = weeklyActivities.slice(-3);

      const firstHalfActive = firstHalf.filter(
        (d) => d.videosCompleted > 0,
      ).length;
      const secondHalfActive = secondHalf.filter(
        (d) => d.videosCompleted > 0,
      ).length;

      if (secondHalfActive > firstHalfActive) {
        updateData["patterns.consistencyTrend"] = "improving";
      } else if (secondHalfActive < firstHalfActive) {
        updateData["patterns.consistencyTrend"] = "declining";
      } else {
        updateData["patterns.consistencyTrend"] = "stable";
      }
    }

    // Update subject comparison if subjectId provided
    if (subjectId && weeklyActivities.length > 0) {
      // Get current subjectComparison or initialize
      const currentSubjectComparison =
        insights.performance?.subjectComparison || [];

      // Find subject index
      const subjectIndex = currentSubjectComparison.findIndex(
        (s) => s.subjectId && s.subjectId.toString() === subjectId.toString(),
      );

      let updatedSubjectComparison = [...currentSubjectComparison];

      if (subjectIndex === -1) {
        // Add new subject
        const newSubject = {
          subjectId: subjectId,
          rank: updatedSubjectComparison.length + 1,
          percentile: 50,
          vsClassAverage: 0,
        };
        updatedSubjectComparison.push(newSubject);
      } else {
        // Update existing subject
        const subjectPerf = updatedSubjectComparison[subjectIndex];

        // Calculate watch time for this subject
        const subjectWatchTime = weeklyActivities.reduce((sum, day) => {
          const subjectBreak = day.subjectBreakdown?.find(
            (s) =>
              s.subjectId && s.subjectId.toString() === subjectId.toString(),
          );
          return sum + (subjectBreak?.watchTime || 0);
        }, 0);

        // Update rank based on watch time
        updatedSubjectComparison.sort((a, b) => {
          const aTime = subjectWatchTime;
          const bTime = subjectWatchTime;
          return bTime - aTime;
        });

        const newRank =
          updatedSubjectComparison.findIndex(
            (s) => s.subjectId.toString() === subjectId.toString(),
          ) + 1;

        updatedSubjectComparison[subjectIndex] = {
          ...subjectPerf,
          rank: newRank,
          percentile: Math.round(
            (1 - newRank / updatedSubjectComparison.length) * 100,
          ),
        };
      }

      updateData["performance.subjectComparison"] = updatedSubjectComparison;
    }

    // Generate insights based on activity
    if (type === "video_complete" || type === "video_end") {
      // Get current insights or initialize
      const currentInsights = insights.insights || [];

      // Add new insight
      const newInsight = {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "achievement",
        title: "Video Completed! 🎉",
        description: `You've completed a video${subjectId ? " in this subject" : ""}. Keep up the great work!`,
        category: "completion",
        priority: 3,
        generatedAt: new Date(),
        isRead: false,
        isDismissed: false,
      };

      // Add to beginning and keep only last 20
      updateData["insights"] = [newInsight, ...currentInsights].slice(0, 20);
    }

    // Update predictions
    // Calculate streak risk (if no activity for 2+ days)
    const lastActivity = weeklyActivities[weeklyActivities.length - 1];
    let streakRiskData = {
      atRisk: false,
      riskLevel: 0,
    };

    if (lastActivity) {
      const daysSinceLastActivity = Math.floor(
        (new Date() - new Date(lastActivity.date)) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceLastActivity >= 2) {
        streakRiskData = {
          atRisk: true,
          riskLevel: Math.min(100, daysSinceLastActivity * 20),
          recommendedAction: "Watch a video today to maintain your streak!",
        };
      }
    }

    updateData["predictions.streakRisk"] = streakRiskData;

    // ========== FIX: Use updateOne instead of save() ==========
    await StudentInsight.updateOne({ studentId: userId }, { $set: updateData });

    // Return updated document
    const updatedInsights = await StudentInsight.findOne({ studentId: userId });
    return updatedInsights;
  } catch (error) {
    console.error("Insights update failed:", error);

    // Retry logic with fresh document
    try {
      console.log("🔄 Retrying insights update with fresh document...");

      const freshInsights = await StudentInsight.findOne({ studentId: userId });
      if (freshInsights) {
        // Simple update with just essential fields
        await StudentInsight.updateOne(
          { studentId: userId },
          {
            $set: {
              lastCalculated: new Date(),
              ...(type === "video_complete" || type === "video_end"
                ? {
                    $push: {
                      insights: {
                        $each: [
                          {
                            id: `insight_${Date.now()}_retry`,
                            type: "achievement",
                            title: "Video Completed!",
                            description: "Great job completing another video!",
                            category: "completion",
                            priority: 3,
                            generatedAt: new Date(),
                            isRead: false,
                            isDismissed: false,
                          },
                        ],
                        $slice: -20,
                      },
                    },
                  }
                : {}),
            },
          },
        );
        console.log("✅ Retry successful");
      }
    } catch (retryError) {
      console.error("❌ Retry also failed:", retryError);
    }

    return null;
  }
};

module.exports = updateStudentInsights;
