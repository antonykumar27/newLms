// src/components/EnhancedVideoPlayer/hooks/useWatchTimeTracker.js

import { useState, useRef, useEffect } from "react";
import { useSaveWatchTimeMutation } from "../../../store/api/AllAnalyticsApi";
import { useTrackProgressMutation } from "../../../store/api/ProgressApi";
import { useTrackVideoInteractionMutation } from "../../../store/api/AllAnalyticsApi";

export const useWatchTimeTracker = (
  videoRef,
  isPlaying,
  isEnrolled,
  isPreview,
  user,
  course,
  video,
  sessionId,
) => {
  const [actualWatchTime, setActualWatchTime] = useState(0);
  const lastUpdateTimeRef = useRef(null);
  const accumulatedWatchTimeRef = useRef(0);
  const isTrackingRef = useRef(false);
  const isVideoEndedRef = useRef(false);

  const [saveWatchTime] = useSaveWatchTimeMutation();
  const [trackProgress] = useTrackProgressMutation();
  const [trackVideoInteraction] = useTrackVideoInteractionMutation();

  // 🎯 Save watch time function
  const saveActualWatchTime = async (watchTimeMs, isEndAction = false) => {
    try {
      const currentTime = videoRef.current?.currentTime || 0;
      const totalDuration = videoRef.current?.duration || 0;

      if (isVideoEndedRef.current && !isEndAction) {
        console.log("⏸️ Watch time save skipped - video ended");
        return;
      }

      const payload = {
        subjectId: course.subjectId,
        chapterId: course.lesson.chapterId,
        pageId: course.lesson._id,
        videoId: course.media._id,
        watchTimeMs,
        currentTime,
        totalDuration,
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
          },
        ],
      };

      await saveWatchTime(payload).unwrap();

      // ✅ Send progress update (type: 'end' only if isEndAction)
      if (!isVideoEndedRef.current || isEndAction) {
        await trackProgress({
          type: isEndAction ? "end" : "timeupdate",
          userId: user._id,
          subjectId: course.subjectId,
          chapterId: course.lesson.chapterId,
          pageId: course.lesson._id,
          videoId: course.media._id,
          currentTime: isEndAction ? totalDuration : currentTime,
          totalDuration,
          isPreview: isPreview && !isEnrolled,
          deviceInfo: payload.deviceInfo,
        }).unwrap();
      }

      // ✅ Always send heartbeat
      await trackVideoInteraction({
        type: "video_heartbeat",
        userId: user._id,
        subjectId: course.subjectId,
        chapterId: course.lesson.chapterId,
        pageId: course.lesson._id,
        videoId: course.media._id,
        sessionId,
        currentTime,
        totalDuration,
        isPreview,
        deviceInfo: payload.deviceInfo,
      }).unwrap();
    } catch (error) {
      console.error("❌ Failed to save watch time:", error);
    }
  };

  // Main tracking effect
  useEffect(() => {
    if (!videoRef?.current) return;
    const videoElement = videoRef.current;

    const handleVideoEnded = () => {
      console.log("🏁 WatchTimeTracker: Video ended");
      isVideoEndedRef.current = true;

      if (accumulatedWatchTimeRef.current > 0) {
        saveActualWatchTime(accumulatedWatchTimeRef.current, true);
        accumulatedWatchTimeRef.current = 0;
      }
      isTrackingRef.current = false;
    };

    const handleVideoPlay = () => {
      console.log("▶️ WatchTimeTracker: Video played");
      isVideoEndedRef.current = false;
    };

    videoElement.addEventListener("ended", handleVideoEnded);
    videoElement.addEventListener("play", handleVideoPlay);

    const handleTimeUpdate = () => {
      if (!isPlaying || !isTrackingRef.current || isVideoEndedRef.current) {
        return;
      }

      const now = Date.now();

      if (lastUpdateTimeRef.current) {
        const timeDiff = now - lastUpdateTimeRef.current;

        if (timeDiff < 2000) {
          accumulatedWatchTimeRef.current += timeDiff;
          setActualWatchTime((prev) => prev + timeDiff);

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

    if (isPlaying && !isVideoEndedRef.current) {
      isTrackingRef.current = true;
      lastUpdateTimeRef.current = Date.now();
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
    } else {
      isTrackingRef.current = false;
      if (lastUpdateTimeRef.current && !isVideoEndedRef.current) {
        const finalTime = Date.now() - lastUpdateTimeRef.current;
        if (finalTime < 2000) {
          accumulatedWatchTimeRef.current += finalTime;
          setActualWatchTime((prev) => prev + finalTime);
        }
      }
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("ended", handleVideoEnded);
      videoElement.removeEventListener("play", handleVideoPlay);

      if (
        isTrackingRef.current &&
        lastUpdateTimeRef.current &&
        !isVideoEndedRef.current
      ) {
        const finalTime = Date.now() - lastUpdateTimeRef.current;
        if (finalTime < 2000 && finalTime > 0) {
          accumulatedWatchTimeRef.current += finalTime;
          setActualWatchTime((prev) => prev + finalTime);
        }
      }
    };
  }, [isPlaying, videoRef]);

  const resetWatchTime = () => {
    setActualWatchTime(0);
    accumulatedWatchTimeRef.current = 0;
    lastUpdateTimeRef.current = null;
    isVideoEndedRef.current = false;
  };

  const saveFinalWatchTime = () => {
    if (accumulatedWatchTimeRef.current > 1000 && !isVideoEndedRef.current) {
      saveActualWatchTime(accumulatedWatchTimeRef.current, false);
      accumulatedWatchTimeRef.current = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (accumulatedWatchTimeRef.current > 1000 && !isVideoEndedRef.current) {
        saveActualWatchTime(accumulatedWatchTimeRef.current, false);
      }
    };
  }, []);

  return {
    actualWatchTime,
    resetWatchTime,
    saveFinalWatchTime,
  };
};
