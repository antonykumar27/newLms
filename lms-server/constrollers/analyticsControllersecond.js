const Video = require("../models/videoModel");
const UserProgress = require("../models/userProgressSchema");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const mongoose = require("mongoose");

// exports.getVideoState = async (req, res) => {
//   try {
//     const { courseId, videoId } = req.params;
//     const userId = req.user._id;

//     // Get or create user progress
//     let progress = await UserProgress.findOne({
//       userId,
//       courseId,
//       videoId,
//     });

//     // If no progress exists, create minimal record
//     if (!progress) {
//       progress = new UserProgress({
//         userId,
//         courseId,
//         videoId,
//         lastPosition: 0,
//         totalWatched: 0,
//         completionPercentage: 0,
//         isCompleted: false,
//       });
//       await progress.save();
//     }

//     // Get video details
//     const video = await Video.findById(videoId).select(
//       "title duration thumbnail order"
//     );

//     res.status(200).json({
//       success: true,
//       data: {
//         lastPosition: progress.lastPosition,
//         completionPercentage: progress.completionPercentage,
//         isCompleted: progress.isCompleted,
//         totalWatched: progress.totalWatched,
//         lastPlayedAt: progress.lastPlayedAt,
//         video: {
//           title: video?.title,
//           duration: video?.duration,
//           thumbnail: video?.thumbnail,
//           order: video?.order,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Get video state error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to get video state",
//     });
//   }
// };
// 🎯 GET progress state for a specific video
exports.getVideoProgressState = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, videoId } = req.params;

    console.log(
      `📡 GET Progress State - User: ${userId}, Course: ${courseId}, Video: ${videoId}`,
    );

    // 1️⃣ Check enrollment
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      paymentStatus: "paid",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: "Not enrolled in this course",
      });
    }

    // 2️⃣ Get FULL course details with all sections
    const course = await Course.findOne(
      {
        _id: courseId,
        "sections.lectures._id": videoId,
      },
      {
        sections: 1,
        title: 1,
        thumbnail: 1,
        description: 1,
        instructor: 1,
      },
    ).lean();

    if (!course || !course.sections?.length) {
      return res.status(404).json({
        success: false,
        error: "Course or lecture not found",
      });
    }

    // Find the specific lecture and its section
    let currentLecture = null;
    let currentSection = null;

    for (const section of course.sections) {
      const foundLecture = section.lectures.find(
        (lec) => lec._id.toString() === videoId,
      );
      if (foundLecture) {
        currentLecture = foundLecture;
        currentSection = {
          _id: section._id,
          title: section.title,
          order: section.order,
          description: section.description || "",
        };
        break;
      }
    }

    if (!currentLecture) {
      return res.status(404).json({
        success: false,
        error: "Lecture not found in course",
      });
    }

    // 3️⃣ Get user progress for this course
    const userProgress = await UserProgress.findOne({
      userId: userId,
      courseId: courseId,
    });

    let lectureProgress = null;
    if (userProgress && userProgress.lectures) {
      lectureProgress = userProgress.lectures.find(
        (l) => l.lectureId && l.lectureId.toString() === videoId,
      );
    }

    // 🔥 FIX: CORRECT DURATION HANDLING
    let lectureDurationSeconds = currentLecture.duration || 0;

    // Check if duration is in minutes (e.g., 2) and convert to seconds
    if (lectureDurationSeconds < 100 && lectureDurationSeconds > 0) {
      lectureDurationSeconds = lectureDurationSeconds * 60;
    }

    // 4️⃣ SECTION-WISE PROGRESS CALCULATION
    const sectionProgress = [];

    for (const section of course.sections) {
      let sectionCompletedLectures = 0;
      let sectionTotalLectures = section.lectures.length;
      let sectionTotalDuration = 0;
      let sectionWatchedDuration = 0;
      let sectionLectures = [];

      // Calculate for each lecture in section
      for (const lecture of section.lectures) {
        const lectureId = lecture._id.toString();
        let isCompleted = false;
        let completionPercentage = 0;
        let lastPosition = 0;
        let totalWatched = 0;

        // Find progress for this lecture
        if (userProgress && userProgress.lectures) {
          const lProgress = userProgress.lectures.find(
            (l) => l.lectureId && l.lectureId.toString() === lectureId,
          );

          if (lProgress) {
            isCompleted = lProgress.isCompleted || false;
            completionPercentage = lProgress.completionPercentage || 0;
            lastPosition = lProgress.lastPosition || 0;
            totalWatched = lProgress.totalWatched || 0;

            if (isCompleted) {
              sectionCompletedLectures++;
            }

            sectionWatchedDuration += totalWatched;
          }
        }

        // Calculate lecture duration
        let lecDuration = lecture.duration || 0;
        if (lecDuration < 100 && lecDuration > 0) {
          lecDuration = lecDuration * 60;
        }
        sectionTotalDuration += lecDuration;

        // Prepare lecture data for section
        sectionLectures.push({
          _id: lecture._id,
          title: lecture.title,
          duration: lecDuration,
          order: lecture.order,
          isCompleted: isCompleted,
          completionPercentage: completionPercentage,
          lastPosition: lastPosition,
          totalWatched: totalWatched,
          isFree: lecture.isFree || false,
        });
      }

      // Calculate section progress percentage
      const sectionProgressPercentage =
        sectionTotalLectures > 0
          ? Math.round((sectionCompletedLectures / sectionTotalLectures) * 100)
          : 0;

      sectionProgress.push({
        _id: section._id,
        title: section.title,
        order: section.order,
        description: section.description || "",
        totalLectures: sectionTotalLectures,
        completedLectures: sectionCompletedLectures,
        progressPercentage: sectionProgressPercentage,
        totalDuration: sectionTotalDuration,
        watchedDuration: sectionWatchedDuration,
        isCompleted: sectionProgressPercentage === 100,
        lectures: sectionLectures,
      });
    }

    // Sort sections by order
    sectionProgress.sort((a, b) => a.order - b.order);

    // 5️⃣ COURSE COMPLETION DETAILS
    const allLectures = [];
    let courseTotalDuration = 0;
    let courseWatchedDuration = 0;
    let totalCourseLectures = 0;
    let completedCourseLectures = 0;

    for (const section of course.sections) {
      if (section.lectures && section.lectures.length > 0) {
        section.lectures.forEach((lec) => {
          // Calculate duration
          let lecDuration = lec.duration || 0;
          if (lecDuration < 100 && lecDuration > 0) {
            lecDuration = lecDuration * 60;
          }
          courseTotalDuration += lecDuration;

          // Find progress
          let isCompleted = false;
          let totalWatched = 0;
          if (userProgress && userProgress.lectures) {
            const lProgress = userProgress.lectures.find(
              (l) =>
                l.lectureId && l.lectureId.toString() === lec._id.toString(),
            );
            if (lProgress) {
              isCompleted = lProgress.isCompleted || false;
              totalWatched = lProgress.totalWatched || 0;
              if (isCompleted) completedCourseLectures++;
              courseWatchedDuration += totalWatched;
            }
          }

          allLectures.push({
            _id: lec._id,
            title: lec.title,
            duration: lecDuration,
            videoUrl: lec.videoUrl,
            sectionId: section._id,
            sectionTitle: section.title,
            order: lec.order,
            isFree: lec.isFree || false,
            isCompleted: isCompleted,
          });

          totalCourseLectures++;
        });
      }
    }

    // Sort lectures by order
    allLectures.sort((a, b) => a.order - b.order);

    // Find current lecture index
    const currentIndex = allLectures.findIndex(
      (lec) => lec._id.toString() === videoId,
    );

    // Get previous and next lectures
    const previousLecture =
      currentIndex > 0 ? allLectures[currentIndex - 1] : null;
    const nextLecture =
      currentIndex < allLectures.length - 1
        ? allLectures[currentIndex + 1]
        : null;

    // Check if previous lecture is completed
    let isPreviousCompleted = true;
    if (previousLecture && userProgress) {
      const prevLectureProgress = userProgress.lectures.find(
        (l) =>
          l.lectureId &&
          l.lectureId.toString() === previousLecture._id.toString(),
      );
      isPreviousCompleted = prevLectureProgress
        ? prevLectureProgress.isCompleted
        : false;
    }

    // Calculate course progress
    const courseProgressPercentage =
      totalCourseLectures > 0
        ? Math.round((completedCourseLectures / totalCourseLectures) * 100)
        : 0;

    // Get user's overall course stats from progress document
    const courseCompletedAt = userProgress?.completedAt || null;
    const totalTimeSpent = userProgress?.totalTimeSpent || 0;
    const lastAccessed = userProgress?.lastAccessedLecture || null;

    // 6️⃣ CURRENT LECTURE PROGRESS DATA
    let progressData = {
      lastPosition: 0,
      totalWatched: 0,
      completionPercentage: 0,
      isCompleted: false,
      completedAt: null,
      lastPlayedAt: null,
      playCount: 0,
      pauseCount: 0,
      seekCount: 0,
      watchedRanges: [],
    };

    if (lectureProgress) {
      progressData = {
        lastPosition: lectureProgress.lastPosition || 0,
        totalWatched: lectureProgress.totalWatched || 0,
        completionPercentage: lectureProgress.completionPercentage || 0,
        isCompleted: lectureProgress.isCompleted || false,
        completedAt: lectureProgress.completedAt,
        lastPlayedAt: lectureProgress.lastPlayedAt,
        playCount: lectureProgress.playCount || 0,
        pauseCount: lectureProgress.pauseCount || 0,
        seekCount: lectureProgress.seekCount || 0,
        watchedRanges: lectureProgress.watchedRanges || [],
      };

      // Double-check calculation if data seems wrong
      if (progressData.totalWatched > 0 && lectureDurationSeconds > 0) {
        const recalculatedPercentage = Math.min(
          100,
          Math.round(
            (progressData.totalWatched / lectureDurationSeconds) * 100,
          ),
        );

        if (
          Math.abs(progressData.completionPercentage - recalculatedPercentage) >
          10
        ) {
          console.warn(`⚠️ Progress mismatch for lecture ${videoId}:`);
          console.warn(`   Stored: ${progressData.completionPercentage}%`);
          console.warn(`   Calculated: ${recalculatedPercentage}%`);
        }
      }
    }

    // 7️⃣ PREPARE COMPLETE RESPONSE
    const responseData = {
      lecture: {
        _id: currentLecture._id,
        title: currentLecture.title,
        description: currentLecture.description || "",
        duration: lectureDurationSeconds / 60, // Convert to minutes for display
        durationSeconds: lectureDurationSeconds,
        totalVideoDuration: lectureDurationSeconds,
        videoUrl: currentLecture.videoUrl,
        thumbnail: currentLecture.thumbnail || course.thumbnail,
        isFree: currentLecture.isFree || false,
        resources: currentLecture.resources || [],
      },
      section: currentSection,
      progress: progressData,
      navigation: {
        previousLecture: previousLecture
          ? {
              _id: previousLecture._id,
              title: previousLecture.title,
              isCompleted: isPreviousCompleted,
              isLocked: !isPreviousCompleted,
            }
          : null,
        nextLecture: nextLecture
          ? {
              _id: nextLecture._id,
              title: nextLecture.title,
              isLocked: !progressData.isCompleted,
            }
          : null,
        currentIndex: currentIndex + 1,
        totalLectures: totalCourseLectures,
      },
      course: {
        _id: course._id,
        title: course.title,
        description: course.description || "",
        thumbnail: course.thumbnail,
        instructor: course.instructor,

        // Course completion details
        progressPercentage: courseProgressPercentage,
        completedLectures: completedCourseLectures,
        totalLectures: totalCourseLectures,

        // Time tracking
        totalDuration: courseTotalDuration,
        watchedDuration: courseWatchedDuration,
        totalTimeSpent: totalTimeSpent,

        // Completion status
        isCompleted: courseProgressPercentage === 100,
        completedAt: courseCompletedAt,
        enrolledAt: enrollment.enrolledAt || enrollment.createdAt,

        // Last accessed
        lastAccessedLecture: lastAccessed,

        // Section-wise progress (NEW)
        sections: sectionProgress,
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Progress state retrieved for video ${videoId}`);
    console.log(
      `   - Lecture: ${progressData.completionPercentage}% completed`,
    );
    console.log(`   - Course: ${courseProgressPercentage}% completed`);
    console.log(`   - Sections: ${sectionProgress.length} sections`);
    console.log(`   - Time spent: ${totalTimeSpent}s`);

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Get video progress state error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get progress state",
    });
  }
};
exports.saveVideoProgress = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const userId = req.user._id;
    const { currentTime, event } = req.body;

    // Get video duration for calculations
    const video = await Video.findById(videoId).select("duration");
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Find or create progress record
    let progress = await UserProgress.findOne({
      userId,
      courseId,
      videoId,
    });

    if (!progress) {
      progress = new UserProgress({
        userId,
        courseId,
        videoId,
      });
    }

    // Update based on event type
    switch (event) {
      case "timeupdate":
      case "pause":
        progress.updateProgress(currentTime, video.duration);
        break;

      case "seek":
        progress.recordSeek(progress.lastPosition, currentTime);
        progress.lastPosition = currentTime;
        break;

      case "play":
        progress.playCount += 1;
        break;

      case "ended":
        progress.updateProgress(video.duration, video.duration);
        progress.isCompleted = true;
        progress.completedAt = new Date();
        break;
    }

    await progress.save();

    // Update aggregate analytics (async, don't await)
    Video.updateAnalytics(videoId, currentTime).catch(console.error);

    res.status(200).json({
      success: true,
      data: {
        lastPosition: progress.lastPosition,
        completionPercentage: progress.completionPercentage,
        isCompleted: progress.isCompleted,
        totalWatched: progress.totalWatched,
      },
    });
  } catch (error) {
    console.error("Save progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save progress",
    });
  }
};
