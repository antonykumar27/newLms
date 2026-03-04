// src/components/EnhancedVideoPlayer/hooks/useVideoProgress.js

import { useCallback, useRef, useEffect } from "react";
import {
  useSaveVideoProgressMutation,
  useCompleteVideoMutation,
  useTrackInteractionMutation,
} from "../../../store/api/AllAnalyticsApi";
import { useTrackVideoInteractionMutation } from "../../../store/api/AllAnalyticsApi";

import { toast } from "react-toastify";
import { debounce } from "./debounce";

export const useVideoProgress = (
  course,
  video,
  isEnrolled,
  user,
  duration,
  isPlaying,
  sessionId,
) => {
  const [saveVideoProgress] = useSaveVideoProgressMutation();
  const [completeVideo] = useCompleteVideoMutation();
  const [trackInteraction] = useTrackInteractionMutation();
  const [trackVideoInteraction] = useTrackVideoInteractionMutation();
  // Store ALL dynamic values in refs to prevent recreating functions
  const courseIdRef = useRef(course?._id);
  const videoIdRef = useRef(video?._id);
  const isEnrolledRef = useRef(isEnrolled);
  const userIdRef = useRef(user?._id);
  const durationRef = useRef(duration);

  // Update refs when values change (without causing re-renders)
  useEffect(() => {
    courseIdRef.current = course?._id;
    videoIdRef.current = video?._id;
    isEnrolledRef.current = isEnrolled;
    userIdRef.current = user?._id;
    durationRef.current = duration;
  }, [course?._id, video?._id, isEnrolled, user?._id, duration]);

  // Store deviceInfo in a ref (never changes)
  const deviceInfoRef = useRef({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // Tracking refs
  const lastSavedTimeRef = useRef(0);
  const saveInProgressRef = useRef(false);
  const pendingSaveRef = useRef(null);

  // Stable performSave - ONLY depends on saveVideoProgress mutation
  const performSave = useCallback(
    async (time, wasPlaying) => {
      // Prevent multiple simultaneous save operations
      if (saveInProgressRef.current) return;

      // Only save if enough time has passed (5 seconds threshold)
      if (Math.abs(time - lastSavedTimeRef.current) < 5) return;

      // Use ref values (not direct props)
      if (!isEnrolledRef.current || !userIdRef.current) return;

      try {
        saveInProgressRef.current = true;

        await saveVideoProgress({
          courseId: courseIdRef.current,
          videoId: videoIdRef.current,
          data: {
            currentTime: time,
            duration: durationRef.current,
            progressPercentage:
              durationRef.current > 0 ? (time / durationRef.current) * 100 : 0,
            wasPlaying,
            lastUpdated: new Date().toISOString(),
            deviceInfo: deviceInfoRef.current,
          },
        }).unwrap();

        lastSavedTimeRef.current = time;
        pendingSaveRef.current = null;
      } catch (error) {
        console.error("Failed to save progress:", error);
      } finally {
        saveInProgressRef.current = false;
      }
    },
    [saveVideoProgress], // ONLY dependency!
  );

  // Create debounced function and store in ref
  const debouncedSaveRef = useRef();

  useEffect(() => {
    // Create new debounced function when performSave changes
    debouncedSaveRef.current = debounce((time, wasPlaying) => {
      performSave(time, wasPlaying);
    }, 2000);

    // Cleanup function to cancel any pending debounced calls
    return () => {
      if (debouncedSaveRef.current && debouncedSaveRef.current.cancel) {
        debouncedSaveRef.current.cancel();
      }
    };
  }, [performSave]);

  // Main save function with immediate flag
  const saveProgress = useCallback(
    async (time, wasPlaying = isPlaying, immediate = false) => {
      if (immediate) {
        // Cancel any pending debounced save
        if (debouncedSaveRef.current && debouncedSaveRef.current.cancel) {
          debouncedSaveRef.current.cancel();
        }
        // Immediate save
        return performSave(time, wasPlaying);
      } else {
        // Debounced save
        if (debouncedSaveRef.current) {
          return debouncedSaveRef.current(time, wasPlaying);
        }
      }
    },
    [performSave, isPlaying], // isPlaying is fine here as it doesn't cause loops
  );

  const clearResumePoint = useCallback(async () => {
    try {
      await saveVideoProgress({
        courseId: courseIdRef.current,
        videoId: videoIdRef.current,
        data: {
          currentTime: 0,
          wasPlaying: false,
          clearedResume: true,
          deviceInfo: deviceInfoRef.current,
        },
      }).unwrap();
      toast.success("Resume point cleared");
    } catch (error) {
      console.error("Failed to clear resume point:", error);
    }
  }, [saveVideoProgress]); // Only saveVideoProgress dependency

  return {
    saveProgress,

    clearResumePoint,
  };
};
