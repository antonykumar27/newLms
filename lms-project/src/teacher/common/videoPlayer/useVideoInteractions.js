// src/components/EnhancedVideoPlayer/hooks/useVideoInteractions.js

import { useRef, useCallback, useState, useEffect } from "react";
import { useTrackVideoInteractionMutation } from "../../../store/api/AllAnalyticsApi";
import { useTrackProgressMutation } from "../../../store/api/ProgressApi";

// Simple session ID generator
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const useVideoInteractions = (
  user,
  course,
  isPreview,
  isEnrolled,
  videoRef,
  isPlaying, // Fixed typo from 'isPlaing'
) => {
  const lastEventRef = useRef({});
  const [watchTimeMs, setWatchTimeMs] = useState(0);
  const [actualWatchTime, setActualWatchTime] = useState(0); // For cumulative tracking
  const sessionIdRef = useRef(generateSessionId());
  const accumulatedWatchTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(null);
  const isTrackingRef = useRef(false);
  const isVideoEndedRef = useRef(false);

  const [trackVideoInteraction] = useTrackVideoInteractionMutation();
  const [trackProgress] = useTrackProgressMutation();

  const debounceTimes = {
    video_play: 1000,
    video_pause: 500,
    video_seek_forward: 300,
    default: 300,
  };

  // Function to save accumulated watch time
  const saveActualWatchTime = useCallback(
    (timeToSave, isEnded = false) => {
      if (timeToSave > 0) {
        const payload = {
          type: isEnded ? "video_ended" : "watch_time_update",
          sessionId: sessionIdRef.current,
          eventTime: Date.now(),
          eventISOTime: new Date().toISOString(),
          userId: user?._id,
          subjectId: course?.subjectId,
          chapterId: course?.lesson?.chapterId,
          pageId: course?.lesson?._id,
          videoId: course?.media?._id,
          totalDuration: videoRef.current?.duration || 0,
          currentTime: videoRef.current?.currentTime || 0,
          watchTimeMs: timeToSave,
          isPreview: isPreview && !isEnrolled,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };

        trackProgress(payload);
      }
    },
    [user, course, isPreview, isEnrolled, videoRef, trackProgress],
  );

  // Main tracking effect
  useEffect(() => {
    if (!videoRef?.current) return;
    const videoElement = videoRef.current;

    const handleTimeUpdate = () => {
      if (!isPlaying || !isTrackingRef.current || isVideoEndedRef.current) {
        return;
      }

      const now = Date.now();

      if (lastUpdateTimeRef.current) {
        const timeDiff = now - lastUpdateTimeRef.current;

        // Only count time if less than 2 seconds (prevents counting seeks/jumps)
        if (timeDiff < 2000 && timeDiff > 0) {
          accumulatedWatchTimeRef.current += timeDiff;
          setWatchTimeMs((prev) => prev + timeDiff);
          setActualWatchTime((prev) => prev + timeDiff);

          // Send to server every 10 seconds (10000ms)
          if (
            accumulatedWatchTimeRef.current >= 10000 &&
            !isVideoEndedRef.current
          ) {
            saveActualWatchTime(accumulatedWatchTimeRef.current, false);
            accumulatedWatchTimeRef.current = 0;
          }
        }
      }
      lastUpdateTimeRef.current = now;
    };

    const handleSeeking = () => {
      // When seeking, we don't want to count time
      if (lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = Date.now();
      }
    };

    const handleEnded = () => {
      isVideoEndedRef.current = true;
      isTrackingRef.current = false;

      // Save any remaining accumulated time
      if (accumulatedWatchTimeRef.current > 0) {
        saveActualWatchTime(accumulatedWatchTimeRef.current, true);
        accumulatedWatchTimeRef.current = 0;
      }
    };

    if (isPlaying && !isVideoEndedRef.current) {
      isTrackingRef.current = true;
      lastUpdateTimeRef.current = Date.now();
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      videoElement.addEventListener("seeking", handleSeeking);
      videoElement.addEventListener("ended", handleEnded);
    } else {
      isTrackingRef.current = false;
      if (lastUpdateTimeRef.current && !isVideoEndedRef.current) {
        const finalTime = Date.now() - lastUpdateTimeRef.current;
        if (finalTime < 2000 && finalTime > 0) {
          accumulatedWatchTimeRef.current += finalTime;
          setWatchTimeMs((prev) => prev + finalTime);
          setActualWatchTime((prev) => prev + finalTime);
        }
      }
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("seeking", handleSeeking);
      videoElement.removeEventListener("ended", handleEnded);
    }

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("seeking", handleSeeking);
      videoElement.removeEventListener("ended", handleEnded);

      // Save final watch time on cleanup
      if (
        isTrackingRef.current &&
        lastUpdateTimeRef.current &&
        !isVideoEndedRef.current
      ) {
        const finalTime = Date.now() - lastUpdateTimeRef.current;
        if (finalTime < 2000 && finalTime > 0) {
          accumulatedWatchTimeRef.current += finalTime;
          setWatchTimeMs((prev) => prev + finalTime);
          setActualWatchTime((prev) => prev + finalTime);

          // Save final accumulated time
          if (accumulatedWatchTimeRef.current > 0) {
            saveActualWatchTime(accumulatedWatchTimeRef.current, false);
            accumulatedWatchTimeRef.current = 0;
          }
        }
      }
    };
  }, [isPlaying, videoRef, saveActualWatchTime]);

  const sendInteraction = useCallback(
    (type, data = {}) => {
      const now = Date.now();
      const lastTime = lastEventRef.current[type] || 0;
      const debounceTime = debounceTimes[type] || debounceTimes.default;

      if (now - lastTime < debounceTime) return;

      lastEventRef.current[type] = now;

      const currentTime = videoRef.current?.currentTime || 0;
      const duration = videoRef.current?.duration || 0;

      const payload = {
        type,
        sessionId: sessionIdRef.current,
        eventTime: now,
        eventISOTime: new Date(now).toISOString(),
        userId: user?._id,
        subjectId: course?.subjectId,
        chapterId: course?.lesson?.chapterId,
        pageId: course?.lesson?._id,
        videoId: course?.media?._id,
        totalDuration: duration,
        currentTime,
        watchTimeMs: actualWatchTime, // Send cumulative watch time
        isPreview: isPreview && !isEnrolled,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        playerEvents: [
          {
            type: "watch_time_saved",
            timestamp: new Date(),
            videoTime: currentTime,
            watchTimeMs: actualWatchTime,
          },
        ],
        ...data,
      };

      trackVideoInteraction(payload);
      trackProgress(payload);
    },
    [
      user,
      course,
      isPreview,
      isEnrolled,
      videoRef,
      trackVideoInteraction,
      trackProgress,
      actualWatchTime, // Add actualWatchTime to dependencies
    ],
  );

  return {
    sendInteraction,
    sessionId: sessionIdRef.current,
    watchTimeMs, // Also return the current watch time if needed
    actualWatchTime,
  };
};

// // src/components/EnhancedVideoPlayer/hooks/useVideoInteractions.js

// import { useRef, useCallback } from "react";
// import { useTrackVideoInteractionMutation } from "../../../store/api/AllAnalyticsApi";
// import { useTrackProgressMutation } from "../../../store/api/ProgressApi";

// // Simple session ID generator
// const generateSessionId = () => {
//   return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
// };

// export const useVideoInteractions = (
//   user,
//   course,
//   isPreview,
//   isEnrolled,
//   videoRef,
// ) => {
//   const lastEventRef = useRef({});

//   // ✅ Add sessionId (one per page load)
//   const sessionIdRef = useRef(generateSessionId());

//   const [trackVideoInteraction] = useTrackVideoInteractionMutation();
//   const [trackProgress] = useTrackProgressMutation();

//   const debounceTimes = {
//     video_play: 1000,
//     video_pause: 500,
//     video_seek_forward: 300,
//     default: 300,
//   };

//   const sendInteraction = useCallback(
//     (type, data = {}) => {
//       const now = Date.now();
//       const lastTime = lastEventRef.current[type] || 0;
//       const debounceTime = debounceTimes[type] || debounceTimes.default;

//       if (now - lastTime < debounceTime) return;

//       lastEventRef.current[type] = now;

//       const currentTime = videoRef.current?.currentTime || 0;

//       const payload = {
//         type,
//         sessionId: sessionIdRef.current, // ✅ Added sessionId here
//         eventTime: now, // ✅ ADD THIS LINE
//         eventISOTime: new Date(now).toISOString(), // optional but recommended

//         userId: user?._id,
//         subjectId: course?.subjectId,
//         chapterId: course?.lesson?.chapterId,
//         pageId: course?.lesson?._id,
//         videoId: course?.media?._id,
//         totalDuration: videoRef.current?.duration || 0,
//         currentTime,
//         isPreview: isPreview && !isEnrolled,
//         deviceInfo: {
//           userAgent: navigator.userAgent,
//           platform: navigator.platform,
//           screenResolution: `${window.screen.width}x${window.screen.height}`,
//           language: navigator.language,
//           timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//         },
//         playerEvents: [
//           {
//             type: "watch_time_saved",
//             timestamp: new Date(),
//             videoTime: currentTime,
//           },
//         ],
//         ...data,
//       };

//       trackVideoInteraction(payload);
//       trackProgress(payload);
//     },
//     [
//       user,
//       course,
//       isPreview,
//       isEnrolled,
//       videoRef,
//       trackVideoInteraction,
//       trackProgress,
//     ],
//   );

//   return {
//     sendInteraction,
//     sessionId: sessionIdRef.current,
//   };
// };
