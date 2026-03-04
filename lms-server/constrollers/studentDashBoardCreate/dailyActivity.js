const DailyActivity = require("../../models/dailyActivity");

// ==============================================
// UPDATE DAILY ACTIVITY - PRODUCTION VERSION 🔥
// ==============================================
const updateDailyActivity = async (userId, activityData) => {
  try {
    const { date, type, videoId, subjectId, chapterId, pageId, data } =
      activityData;

    // Step 1: Today is 2026-03-03  const date = "2026-03-03";
    // Step 1: Convert to Date object
    // JavaScript automatically sets to UTC midnight
    // Output: 2026-03-03T00:00:00.000Z
    const activityDate = new Date(date);
    // Step 3: We want TODAY's midnight (start of day)
    // This sets LOCAL time to midnight
    // In India (UTC+5:30):
    // Local midnight = UTC 18:30 previous day
    // Output: 2026-03-02T18:30:00.000Z
    activityDate.setHours(0, 0, 0, 0);
    // 📍 Create START of day (copy of activityDate) = March 3, 00:00 AM IST March 3, 00:00:00
    const startOfDay = new Date(activityDate);
    // 📍 Create END of day endOfDay = copy of activityDate
    const endOfDay = new Date(activityDate);
    // Now endOfDay = March 3, 23:59:59.999 IST
    // In UTC: 2026-03-03T18:29:59.999Z
    // 23 -)o thiyathi midnight muthual 23-)o thiyathi 11:59 March 3, 23:59:59
    endOfDay.setHours(23, 59, 59, 999);

    // // Get current hour in LOCAL time
    const currentHour = new Date().getHours();

    // 🔍 Find or create daily activity
    let dailyActivity = await DailyActivity.findOne({
      studentId: userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (!dailyActivity) {
      // Create new daily activity document
      dailyActivity = new DailyActivity({
        studentId: userId,
        date: activityDate,
        totalWatchTime: 0,
        videosStarted: 0,
        videosCompleted: 0,
        hourlyBreakdown: [],
        subjectBreakdown: [],
        sessions: [],
        achievements: {
          completedDailyGoal: false,
          achievedStreak: false,
          badgesEarned: [],
        },
      });
    }

    // 🎯 Process based on interaction type
    switch (type) {
      case "video_play":
        await handleVideoPlay(dailyActivity, videoId, subjectId, currentHour);
        break;

      case "video_pause":
        await handleVideoPause(dailyActivity, subjectId, currentHour, data);
        break;

      case "video_end":
      case "video_complete":
        await handleVideoComplete(
          dailyActivity,
          videoId,
          subjectId,
          currentHour,
          data,
        );
        break;

      case "video_heartbeat":
        await handleHeartbeat(dailyActivity, subjectId, currentHour, data);
        break;

      default:
    }

    // ✅ Update daily goal check (10 minutes = 600 seconds)
    const DAILY_GOAL_SECONDS = 600; // 10 minutes
    if (dailyActivity.totalWatchTime >= DAILY_GOAL_SECONDS) {
      dailyActivity.achievements.completedDailyGoal = true;
    }

    // 💾 Save
    await dailyActivity.save();

    return dailyActivity;
  } catch (error) {
    console.error("❌ Daily activity update failed:", error);
    return null;
  }
};

// ==============================================
// HANDLER FUNCTIONS - FIXED VERSIONS 🔧
// ==============================================

// 🎬 Handle video play
const handleVideoPlay = async (
  dailyActivity,
  videoId,
  subjectId,
  currentHour,
) => {
  // Check for open session
  const lastSession = dailyActivity.sessions[dailyActivity.sessions.length - 1];

  // ✅ FIX: Prevent duplicate videosStarted on page refresh
  //ലോജിക്: ഒരു വീഡിയോ ആദ്യമായി തുടങ്ങുമ്പോൾ മാത്രം videosStarted കൗണ്ട് കൂട്ടുന്നു
  //പേജ് റിഫ്രഷ് ചെയ്താലും ഇത് വീണ്ടും കൂട്ടില്ല കാരണം videosWatched അറേയിൽ
  //  ആ വീഡിയോ ഇതിനകം ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു
  // lastSession illenkil koodathe aa lastSessionWacthed Array kakathu video id illenkil matram ithu work akum
  if (!lastSession || !lastSession.videosWatched.includes(videoId)) {
    dailyActivity.videosStarted += 1;

    // Update hourly breakdown (only for new videos) ലോജിക്: ഏത് മണിക്കൂറിലാണോ വീഡിയോ കണ്ടത്,
    //  ആ മണിക്കൂറിന്റെ videosWatched കൗണ്ട് കൂട്ടുന്നു
    updateHourlyBreakdown(dailyActivity, currentHour, 0, 1);

    // Update subject breakdown (only for new videos)
    updateSubjectBreakdown(dailyActivity, subjectId, 0, 1);
  }

  // Start new session
  const newSession = {
    startTime: new Date(),
    endTime: null,
    duration: 0,
    videosWatched: [videoId],
  };

  if (lastSession && !lastSession.endTime) {
    // Auto-close old session if older than 30 minutes
    const now = new Date();
    const sessionAge = (now - new Date(lastSession.startTime)) / (1000 * 60); // minutes

    if (sessionAge > 30) {
      // Close old session
      lastSession.endTime = lastSession.startTime;
      lastSession.duration = 0;

      // Start new session
      dailyActivity.sessions.push(newSession);
    } else {
      // Continue existing session
      if (!lastSession.videosWatched.includes(videoId)) {
        lastSession.videosWatched.push(videoId);
      }
    }
  } else {
    // No open session, create new
    dailyActivity.sessions.push(newSession);
  }
};

// ⏸️ Handle video pause
const handleVideoPause = async (
  dailyActivity,
  subjectId,
  currentHour,
  data,
) => {
  const currentTime = data.currentTime || 0;
  const lastSession = dailyActivity.sessions[dailyActivity.sessions.length - 1];

  if (lastSession && !lastSession.endTime) {
    // Update session duration
    const now = new Date();
    const sessionStart = new Date(lastSession.startTime);
    const duration = (now - sessionStart) / 1000; // seconds

    // ✅ FIX: Remove _doc usage, use direct property
    const previousDuration = lastSession.duration || 0;
    const watchTimeIncrease = Math.max(0, duration - previousDuration);

    lastSession.duration = duration;
    dailyActivity.totalWatchTime += watchTimeIncrease;

    // Update hourly breakdown
    updateHourlyBreakdown(dailyActivity, currentHour, watchTimeIncrease, 0);

    // Update subject breakdown
    updateSubjectBreakdown(dailyActivity, subjectId, watchTimeIncrease, 0);
  }
};

// ✅ Handle video complete
const handleVideoComplete = async (
  dailyActivity,
  videoId,
  subjectId,
  currentHour,
  data,
) => {
  // Increment videos completed
  dailyActivity.videosCompleted += 1;

  // Close session
  const lastSession = dailyActivity.sessions[dailyActivity.sessions.length - 1];
  if (lastSession && !lastSession.endTime) {
    const now = new Date();
    const sessionStart = new Date(lastSession.startTime);
    const duration = (now - sessionStart) / 1000; // seconds

    lastSession.endTime = now;

    // ✅ FIX: Remove _doc usage
    const previousDuration = lastSession.duration || 0;
    const watchTimeIncrease = Math.max(0, duration - previousDuration);

    lastSession.duration = duration;
    dailyActivity.totalWatchTime += watchTimeIncrease;

    // Update hourly breakdown (with video completion)
    updateHourlyBreakdown(dailyActivity, currentHour, watchTimeIncrease, 1);

    // Update subject breakdown
    updateSubjectBreakdown(dailyActivity, subjectId, watchTimeIncrease, 1);
  }
};

// 💓 Handle heartbeat - UPDATED to use data.currentTime
const handleHeartbeat = async (dailyActivity, subjectId, currentHour, data) => {
  const lastSession = dailyActivity.sessions[dailyActivity.sessions.length - 1];

  if (lastSession && !lastSession.endTime && data.currentTime) {
    // ✅ FIX: Use currentTime from frontend instead of time difference
    // This makes testing possible and is more accurate
    const sessionStart = new Date(lastSession.startTime);
    const expectedDuration = (new Date() - sessionStart) / 1000;

    // Use the smaller of actual time and reported position
    // This prevents fake time from heartbeat spam
    const actualWatchTime = Math.min(data.currentTime, expectedDuration);

    const previousDuration = lastSession.duration || 0;
    const watchTimeIncrease = Math.max(0, actualWatchTime - previousDuration);

    if (watchTimeIncrease > 0.5) {
      // Only count if > 0.5 seconds
      lastSession.duration = actualWatchTime;
      dailyActivity.totalWatchTime += watchTimeIncrease;

      updateHourlyBreakdown(dailyActivity, currentHour, watchTimeIncrease, 0);
      updateSubjectBreakdown(dailyActivity, subjectId, watchTimeIncrease, 0);
    }
  }
};

// ==============================================
// HELPER FUNCTIONS
// ==============================================

// 📊 Update hourly breakdown
const updateHourlyBreakdown = (
  dailyActivity,
  hour,
  watchTimeIncrease,
  videosIncrease,
) => {
  //ഉപയോക്താവ് ഏത് മണിക്കൂറിൽ എത്ര സമയം വീഡിയോ കണ്ടു, എത്ര വീഡിയോകൾ കണ്ടു എന്നത് ട്രാക്ക് ചെയ്യുക.
  //ippozhathe samayam  hour = 12 ആണെങ്കിൽ:
  // hourEntry = undefined (കാരണം 12 മണിക്കൂറിന്റെ ഡാറ്റ ഇല്ല) ennu karuthuka
  let hourEntry = dailyActivity.hourlyBreakdown.find((h) => h.hour === hour);
  //appol ithu work Akum !hourEntry എന്നാൽ ആ മണിക്കൂറിന് ഇതുവരെ ഡാറ്റ ഇല്ല എന്നർത്ഥം
  //// ആദ്യം hourlyBreakdown അറേ ഇങ്ങനെ ഉണ്ട്:
  // dailyActivity.hourlyBreakdown = [
  //   { hour: 9, watchTime: 120, videosWatched: 2 },
  // ];
  if (!hourEntry) {
    hourEntry = {
      hour,
      watchTime: 0,
      videosWatched: 0,
    };
    // ഇപ്പോൾ hourlyBreakdown:
    // [
    //   { hour: 9, watchTime: 120, videosWatched: 2 },
    //   { hour: 10, watchTime: 0, videosWatched: 0 }, // പുതിയത്
    // ];
    dailyActivity.hourlyBreakdown.push(hourEntry);
  }

  hourEntry.watchTime += watchTimeIncrease;
  hourEntry.videosWatched += videosIncrease;
};

// 📚 Update subject breakdown
const updateSubjectBreakdown = (
  dailyActivity,
  subjectId,
  watchTimeIncrease,
  videosIncrease,
) => {
  let subjectEntry = dailyActivity.subjectBreakdown.find(
    (s) => s.subjectId.toString() === subjectId.toString(),
  );

  if (!subjectEntry) {
    subjectEntry = {
      subjectId,
      watchTime: 0,
      videosWatched: 0,
    };
    dailyActivity.subjectBreakdown.push(subjectEntry);
  }

  subjectEntry.watchTime += watchTimeIncrease;
  subjectEntry.videosWatched += videosIncrease;
};

// ==============================================
// WEEKLY SUMMARY FUNCTION ONLY 📊
// ==============================================

const getWeeklySummary = async (userId, endDate = new Date()) => {
  try {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const weeklyData = await DailyActivity.find({
      studentId: userId,
      date: { $gte: start, $lte: end },
    })
      .sort({ date: 1 })
      .lean();

    const summary = {
      totalWatchTime: 0,
      totalVideosStarted: 0,
      totalVideosCompleted: 0,
      activeDays: weeklyData.length,
      dailyBreakdown: [],
    };

    weeklyData.forEach((day) => {
      summary.totalWatchTime += day.totalWatchTime || 0;
      summary.totalVideosStarted += day.videosStarted || 0;
      summary.totalVideosCompleted += day.videosCompleted || 0;

      summary.dailyBreakdown.push({
        date: day.date,
        watchTime: day.totalWatchTime || 0,
        videosCompleted: day.videosCompleted || 0,
        goalAchieved: day.achievements?.completedDailyGoal || false,
      });
    });

    return summary;
  } catch (error) {
    console.error("❌ Weekly summary failed:", error);
    return {
      totalWatchTime: 0,
      totalVideosStarted: 0,
      totalVideosCompleted: 0,
      activeDays: 0,
      dailyBreakdown: [],
    };
  }
};

// ==============================================
// EXPORT ONLY WHAT'S NEEDED
// ==============================================
module.exports = {
  updateDailyActivity,
  getWeeklySummary,
};
