// src/components/EnhancedVideoPlayer/hooks/useVideoControls.js

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../../common/AuthContext";
import { useGetUserVideoStateQuery } from "../../../store/api/AllAnalyticsApi";
import { useToggleVideoLikeMutation } from "../../../store/api/CourseApi";
import { useToggleVideoWishlistMutation } from "../../../store/api/CourseApi";
import { PREVIEW_LIMIT_SECONDS, formatTime } from "./videoPlayerTypes";
import { useVideoInteractions } from "./useVideoInteractions";
import { useVideoProgress } from "./useVideoProgress";
import { useWatchTimeTracker } from "./useWatchTimeTracker";
import { toast } from "react-toastify";

export const useVideoControls = (
  videoRef,
  video,
  course,
  isEnrolled,
  isPreview,
  onLimitReached,
) => {
  const { user } = useAuth();

  // ===== CRITICAL REFS =====
  const isVideoEndedRef = useRef(false);
  const lastSavedTimeRef = useRef(0);
  const isPauseFromEndedRef = useRef(false);
  const hasSentCompletionRef = useRef(false);

  // Basic states
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [buffered, setBuffered] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isLiked, setIsLiked] = useState(course?.likedByMe || false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkTime, setBookmarkTime] = useState(null);
  const [hasAutoResumed, setHasAutoResumed] = useState(false);

  // Custom hooks
  const { sendInteraction } = useVideoInteractions(
    user,
    course,
    isPreview,
    isEnrolled,
    videoRef,
    isPlaying,
  );

  const { saveProgress, completeVideo } = useVideoProgress(
    course,
    video,
    isEnrolled,
    user,
    duration,
    isPlaying,
  );

  const { actualWatchTime, resetWatchTime, saveFinalWatchTime } =
    useWatchTimeTracker(
      videoRef,
      isPlaying,
      isEnrolled,
      isPreview,
      user,
      course,
      video,
    );

  // Mutations
  const [toggleVideoLike] = useToggleVideoLikeMutation();
  const [toggleVideoWishlist] = useToggleVideoWishlistMutation();

  // Get user's video state
  const { data: userVideoState, isSuccess: isStateLoaded } =
    useGetUserVideoStateQuery(
      {
        pageId: course?.lesson?._id,
        videoId: course?.lesson?.videoProgress?.video,
      },
      { skip: !user },
    );

  // Preview limit check
  const isPreviewLimitReached =
    isPreview && !isEnrolled && currentTime >= PREVIEW_LIMIT_SECONDS;

  // Load user's video state
  useEffect(() => {
    if (!isStateLoaded || !userVideoState || !videoRef.current) return;
    setIsLiked(userVideoState.isLiked || false);
    setIsBookmarked(userVideoState.isBookmarked || false);
    setBookmarkTime(userVideoState.bookmarkTime || null);
  }, [isStateLoaded, userVideoState, videoRef]);

  // Auto-resume logic
  useEffect(() => {
    if (!userVideoState?.lastPlayedTime || !videoRef.current || hasAutoResumed)
      return;

    const resumeTime = userVideoState.lastPlayedTime;
    const videoDuration = videoRef.current.duration || duration;
    const shouldResume =
      !userVideoState.completed &&
      resumeTime > 10 &&
      resumeTime < videoDuration - 5;

    if (shouldResume && isEnrolled) {
      setHasAutoResumed(true);
      videoRef.current.currentTime = resumeTime;
      setCurrentTime(resumeTime);
      toast.info(`Resumed from ${formatTime(resumeTime)}`, {
        position: "bottom-center",
        autoClose: 2000,
        icon: "🎬",
      });
    }
  }, [userVideoState, videoRef, duration, isEnrolled, hasAutoResumed]);

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!user) {
      toast.info("Please login to like videos");
      return;
    }

    const newLikeState = !isLiked;
    setIsLiked(newLikeState);

    try {
      await toggleVideoLike({
        courseId: course._id,
        videoId: video._id,
        liked: newLikeState,
      }).unwrap();

      toast.success(newLikeState ? "Video liked!" : "Like removed");
    } catch (error) {
      console.error("Failed to update like:", error);
      setIsLiked(!newLikeState);
      toast.error("Failed to update like");
    }
  }, [user, isLiked, course._id, video._id, toggleVideoLike]);

  // Toggle bookmark
  const toggleBookmark = useCallback(async () => {
    if (!user) {
      toast.info("Please login to add course to wishlist");
      return;
    }

    const newState = !isBookmarked;
    setIsBookmarked(newState);

    try {
      await toggleVideoWishlist({
        courseId: course._id,
        wishlisted: newState,
      }).unwrap();

      toast.success(
        newState ? "Added to wishlist ❤️" : "Removed from wishlist",
      );
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      setIsBookmarked(!newState);
      toast.error("Failed to update wishlist");
    }
  }, [isBookmarked, user, course._id, toggleVideoWishlist, video._id]);

  // ===== TOGGLE PLAY/PAUSE =====
  const togglePlay = useCallback(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPreviewLimitReached) {
      toast.info("Enroll to watch full video!", { position: "bottom-center" });
      return;
    }

    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);

      if (!isVideoEndedRef.current) {
        saveProgress(videoElement.currentTime, false, true);
      }
    } else {
      isVideoEndedRef.current = false;
      isPauseFromEndedRef.current = false;
      hasSentCompletionRef.current = false;

      const playPromise = videoElement.play();
      //ivide ithu start ayathu
      //togglePlay() itself does NOT send interaction. Instead 👇
      //This event listener sends it: videoElement.addEventListener("play", handlePlay);

      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            if (error.name !== "AbortError") {
              console.error("Play failed:", error);
              toast.error("Failed to play video");
            }
            setIsPlaying(false);
          });
      }
    }
  }, [isPlaying, isPreviewLimitReached, videoRef, saveProgress]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted, videoRef]);

  // Seek function
  const seekTo = useCallback(
    async (seconds) => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const oldTime = videoElement.currentTime;
      let newTime = Math.max(0, Math.min(seconds, duration));

      isVideoEndedRef.current = false;
      isPauseFromEndedRef.current = false;

      if (isPreview && !isEnrolled && newTime > PREVIEW_LIMIT_SECONDS) {
        newTime = PREVIEW_LIMIT_SECONDS;
        onLimitReached?.();
      }

      videoElement.currentTime = newTime;
      setCurrentTime(newTime);

      if (!isVideoEndedRef.current) {
        saveProgress(newTime, isPlaying, true);
      }

      if (user && Math.abs(newTime - oldTime) > 0.5) {
        sendInteraction(
          newTime > oldTime ? "video_seek_forward" : "video_seek_backward",
          { fromTime: oldTime, toTime: newTime },
        );
      }
    },
    [
      duration,
      isPreview,
      isEnrolled,
      user,
      onLimitReached,
      isPlaying,
      saveProgress,
      sendInteraction,
    ],
  );

  // Forward/rewind
  const forward = useCallback(
    () => seekTo(currentTime + 10),
    [currentTime, seekTo],
  );
  const rewind = useCallback(
    () => seekTo(currentTime - 10),
    [currentTime, seekTo],
  );

  // Resume from last position
  const resumeFromLastPosition = useCallback(() => {
    if (!userVideoState?.lastPlayedTime || !videoRef.current) return;

    const resumeTime = userVideoState.lastPlayedTime;
    const shouldResume =
      !userVideoState.completed &&
      resumeTime > 0 &&
      resumeTime < (duration || videoRef.current.duration || 60) - 5;

    if (shouldResume) {
      videoRef.current.currentTime = resumeTime;
      setCurrentTime(resumeTime);
      toast.success(`Resumed from ${formatTime(resumeTime)}`);

      if (userVideoState.wasPlaying) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      toast.info("Starting from beginning");
    }
  }, [userVideoState, videoRef, duration]);

  // ============================================
  // 🎯 MAIN VIDEO EVENT LISTENERS (FIXED - NO DUPLICATE END)
  // ============================================
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // 🎯 Time update handler
    const handleTimeUpdate = () => {
      if (
        //Video ended event trigger aayi ennalum, System parayunnu video ended
        isVideoEndedRef.current &&
        //currentTime still full duration reach cheythittillenkil But actually video last second reach cheythittilla
        //"Video finish aayi ennu paranjalum, actually last second vare play cheythittundo?"

        videoElement.currentTime < videoElement.duration - 1
      ) {
        isVideoEndedRef.current = false;
        isPauseFromEndedRef.current = false;
      }

      if (
        isPreview &&
        !isEnrolled &&
        videoElement.currentTime >= PREVIEW_LIMIT_SECONDS
      ) {
        videoElement.pause();
        videoElement.currentTime = PREVIEW_LIMIT_SECONDS;
        setIsPlaying(false);
        setCurrentTime(PREVIEW_LIMIT_SECONDS);
        onLimitReached?.();
        return;
      }

      if (!seeking) {
        setCurrentTime(videoElement.currentTime);

        if (
          isEnrolled &&
          !isVideoEndedRef.current &&
          Math.floor(videoElement.currentTime) % 10 === 0
        ) {
          if (
            Math.abs(videoElement.currentTime - lastSavedTimeRef.current) > 1
          ) {
            lastSavedTimeRef.current = videoElement.currentTime;
            requestAnimationFrame(() => {
              saveProgress(videoElement.currentTime, isPlaying, false);
              // 🔥 SEND INTERACTION SAME TIME
              sendInteraction("timeupdate", {
                currentTime: videoElement.currentTime,
                duration: videoElement.duration,
              });
            });
          }
        }
      }
    };

    // 🎯 Loaded metadata handler
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      videoElement.volume = volume;
      videoElement.playbackRate = playbackRate;
    };

    // 🎯 Progress handler
    const handleProgress = () => {
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(
          videoElement.buffered.length - 1,
        );
        setBuffered(duration > 0 ? bufferedEnd / duration : 0);
      }
    };

    // 🎯 Play handler ithanu ru toggleplay work akumbol automatic ayi send cheyyapedunnathu
    const handlePlay = () => {
      isVideoEndedRef.current = false;
      isPauseFromEndedRef.current = false;
      sendInteraction("video_play");
    };

    // 🎯 PAUSE HANDLER
    const handlePause = () => {
      if (videoElement.ended || isVideoEndedRef.current) {
        isPauseFromEndedRef.current = true;
        return;
      }

      sendInteraction("video_pause");

      requestAnimationFrame(() => {
        saveProgress(videoElement.currentTime, false, true);
      });
    };

    // 🎯 ENDED HANDLER - ONLY THIS SENDS END (NO DUPLICATE)
    const handleEnded = () => {
      isVideoEndedRef.current = true;
      setIsPlaying(false);

      // ✅ Send ONLY video_end (NOTHING ELSE)
      sendInteraction("video_end");

      // ✅ Save final watch time (this will send 'end' type)
      saveFinalWatchTime();

      // ✅ Mark as completed
      if (!hasSentCompletionRef.current) {
        hasSentCompletionRef.current = true;
        saveProgress(duration, false, true);
        completeVideo?.();
      }

      if (isPreview && !isEnrolled) {
        toast.success("Preview completed! Enroll for full course access.");
      }
    };

    // 🎯 Seeking handler
    const handleSeeking = () => {
      isVideoEndedRef.current = false;
      isPauseFromEndedRef.current = false;
      setSeeking(true);
    };

    // 🎯 Seeked handler
    const handleSeeked = () => {
      setSeeking(false);
    };

    // 🎯 Rate change handler
    const handleRateChange = () => {
      if (videoElement.playbackRate !== playbackRate) {
        sendInteraction("video_speed_change", {
          fromSpeed: playbackRate,
          toSpeed: videoElement.playbackRate,
        });
      }
    };

    // 🎯 Volume change handler
    const handleVolumeChange = () => {
      if (videoElement.volume !== volume || videoElement.muted !== isMuted) {
        sendInteraction(videoElement.muted ? "video_mute" : "video_unmute", {
          volume: videoElement.volume,
          muted: videoElement.muted,
        });
      }
    };

    // 🎯 Fullscreen handlers
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      sendInteraction(
        isFullscreen ? "video_fullscreen" : "video_exit_fullscreen",
      );
    };

    // Add all event listeners
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("progress", handleProgress);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("seeking", handleSeeking);
    videoElement.addEventListener("seeked", handleSeeked);
    videoElement.addEventListener("ratechange", handleRateChange);
    videoElement.addEventListener("volumechange", handleVolumeChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Cleanup
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("progress", handleProgress);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("seeking", handleSeeking);
      videoElement.removeEventListener("seeked", handleSeeked);
      videoElement.removeEventListener("ratechange", handleRateChange);
      videoElement.removeEventListener("volumechange", handleVolumeChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);

      if (videoElement.currentTime > 0 && !isVideoEndedRef.current) {
        saveProgress(videoElement.currentTime, isPlaying, true);
      }
    };
  }, [
    videoRef,
    volume,
    playbackRate,
    isPreview,
    isEnrolled,
    seeking,
    onLimitReached,
    saveProgress,
    isPlaying,
    duration,
    saveFinalWatchTime,
    completeVideo,
    sendInteraction,
  ]);

  // Apply playback rate changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, videoRef]);

  // Apply volume changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume, videoRef]);

  // Return all controls and states
  return {
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    currentTime,
    setCurrentTime,
    duration,
    playbackRate,
    setPlaybackRate,
    buffered,
    seeking,
    setSeeking,
    isPreviewLimitReached,
    PREVIEW_LIMIT_SECONDS,
    isLiked,
    toggleLike,
    isBookmarked,
    bookmarkTime,
    toggleBookmark,
    progressSynced: true,
    togglePlay,
    toggleMute,
    seekTo,
    forward,
    rewind,
    actualWatchTime,
    userVideoState,
    resumeFromLastPosition,
    hasAutoResumed,
  };
};

// // src/components/EnhancedVideoPlayer/hooks/useVideoControls.js

// import { useState, useRef, useEffect, useCallback } from "react";
// import { useAuth } from "../../../common/AuthContext";
// import { useGetUserVideoStateQuery } from "../../../store/api/AllAnalyticsApi";
// import { useToggleVideoLikeMutation } from "../../../store/api/CourseApi";
// import { useToggleVideoWishlistMutation } from "../../../store/api/CourseApi";
// import { PREVIEW_LIMIT_SECONDS, formatTime } from "./videoPlayerTypes";
// import { useVideoInteractions } from "./useVideoInteractions";
// import { useVideoProgress } from "./useVideoProgress";
// import { useWatchTimeTracker } from "./useWatchTimeTracker";
// import { toast } from "react-toastify";

// export const useVideoControls = (
//   videoRef,
//   video,
//   course,
//   isEnrolled,
//   isPreview,
//   onLimitReached,
// ) => {
//   const { user } = useAuth();

//   // Refs
//   const isVideoEndedRef = useRef(false); // 🎯 CRITICAL: ended flag

//   const lastSavedTimeRef = useRef(0); // Prevent duplicate saves

//   // Basic states
//   const [isPlaying, setIsPlaying] = useState(false);

//   const [volume, setVolume] = useState(0.8);
//   const [isMuted, setIsMuted] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [playbackRate, setPlaybackRate] = useState(1.0);
//   const [buffered, setBuffered] = useState(0);
//   const [seeking, setSeeking] = useState(false);
//   const [isLiked, setIsLiked] = useState(course?.likedByMe || false);
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [bookmarkTime, setBookmarkTime] = useState(null);
//   const [hasAutoResumed, setHasAutoResumed] = useState(false);

//   // Custom hooks
//   const { sendInteraction } = useVideoInteractions(
//     user,
//     course,
//     isPreview,
//     isEnrolled,
//     videoRef,
//   );

//   const { saveProgress, completeVideo } = useVideoProgress(
//     course,
//     video,
//     isEnrolled,
//     user,
//     duration,
//     isPlaying,
//   );

//   const { actualWatchTime, resetWatchTime, saveFinalWatchTime } =
//     useWatchTimeTracker(
//       videoRef,
//       isPlaying,
//       isEnrolled,
//       isPreview,
//       user,
//       course,
//       video,
//     );

//   // Mutations
//   const [toggleVideoLike] = useToggleVideoLikeMutation();
//   const [toggleVideoWishlist] = useToggleVideoWishlistMutation();

//   // Get user's video state
//   const { data: userVideoState, isSuccess: isStateLoaded } =
//     useGetUserVideoStateQuery(
//       {
//         courseId: course._id,
//         videoId: video._id,
//       },
//       { skip: !user },
//     );

//   // Preview limit check
//   const isPreviewLimitReached =
//     isPreview && !isEnrolled && currentTime >= PREVIEW_LIMIT_SECONDS;

//   // Load user's video state
//   useEffect(() => {
//     if (!isStateLoaded || !userVideoState || !videoRef.current) return;
//     setIsLiked(userVideoState.isLiked || false);
//     setIsBookmarked(userVideoState.isBookmarked || false);
//     setBookmarkTime(userVideoState.bookmarkTime || null);
//   }, [isStateLoaded, userVideoState, videoRef]);

//   // Auto-resume logic
//   useEffect(() => {
//     if (!userVideoState?.lastPlayedTime || !videoRef.current || hasAutoResumed)
//       return;

//     const resumeTime = userVideoState.lastPlayedTime;
//     const videoDuration = videoRef.current.duration || duration;
//     const shouldResume =
//       !userVideoState.completed &&
//       resumeTime > 10 &&
//       resumeTime < videoDuration - 5;

//     if (shouldResume && isEnrolled) {
//       setHasAutoResumed(true);
//       videoRef.current.currentTime = resumeTime;
//       setCurrentTime(resumeTime);
//       toast.info(`Resumed from ${formatTime(resumeTime)}`, {
//         position: "bottom-center",
//         autoClose: 2000,
//         icon: "🎬",
//       });
//     }
//   }, [userVideoState, videoRef, duration, isEnrolled, hasAutoResumed]);

//   // Toggle like
//   const toggleLike = useCallback(async () => {
//     if (!user) {
//       toast.info("Please login to like videos");
//       return;
//     }

//     const newLikeState = !isLiked;
//     setIsLiked(newLikeState);

//     try {
//       await toggleVideoLike({
//         courseId: course._id,
//         videoId: video._id,
//         liked: newLikeState,
//       }).unwrap();

//       toast.success(newLikeState ? "Video liked!" : "Like removed");
//     } catch (error) {
//       console.error("Failed to update like:", error);
//       setIsLiked(!newLikeState);
//       toast.error("Failed to update like");
//     }
//   }, [user, isLiked, course._id, video._id, toggleVideoLike]);

//   // Toggle bookmark
//   const toggleBookmark = useCallback(async () => {
//     if (!user) {
//       toast.info("Please login to add course to wishlist");
//       return;
//     }

//     const newState = !isBookmarked;
//     setIsBookmarked(newState);

//     try {
//       await toggleVideoWishlist({
//         courseId: course._id,
//         wishlisted: newState,
//       }).unwrap();

//       toast.success(
//         newState ? "Added to wishlist ❤️" : "Removed from wishlist",
//       );
//     } catch (err) {
//       console.error("Failed to update wishlist:", err);
//       setIsBookmarked(!newState);
//       toast.error("Failed to update wishlist");
//     }
//   }, [isBookmarked, user, course._id, toggleVideoWishlist, video._id]);

//   // Toggle play/pause
//   const togglePlay = useCallback(() => {
//     const videoElement = videoRef.current;
//     if (!videoElement) return;

//     if (isPreviewLimitReached) {
//       toast.info("Enroll to watch full video!", { position: "bottom-center" });
//       return;
//     }

//     if (isPlaying) {
//       videoElement.pause();
//       setIsPlaying(false);
//       saveProgress(videoElement.currentTime, false, true);
//     } else {
//       // 🎯 Reset ended flag when playing again
//       if (isVideoEndedRef.current) {
//         isVideoEndedRef.current = false;
//       }

//       const playPromise = videoElement.play();
//       if (playPromise !== undefined) {
//         playPromise
//           .then(() => setIsPlaying(true))
//           .catch((error) => {
//             if (error.name !== "AbortError") {
//               console.error("Play failed:", error);
//               toast.error("Failed to play video");
//             }
//             setIsPlaying(false);
//           });
//       }
//     }
//   }, [isPlaying, isPreviewLimitReached, videoRef, saveProgress]);

//   // Toggle mute
//   const toggleMute = useCallback(() => {
//     const videoElement = videoRef.current;
//     if (videoElement) {
//       videoElement.muted = !isMuted;
//       setIsMuted(!isMuted);
//     }
//   }, [isMuted, videoRef]);

//   // Seek function
//   const seekTo = useCallback(
//     async (seconds) => {
//       const videoElement = videoRef.current;
//       if (!videoElement) return;

//       const oldTime = videoElement.currentTime;
//       let newTime = Math.max(0, Math.min(seconds, duration));

//       // 🎯 Reset ended flag on seek
//       if (isVideoEndedRef.current) {
//         isVideoEndedRef.current = false;
//       }

//       if (isPreview && !isEnrolled && newTime > PREVIEW_LIMIT_SECONDS) {
//         newTime = PREVIEW_LIMIT_SECONDS;
//         onLimitReached?.();
//       }

//       videoElement.currentTime = newTime;
//       setCurrentTime(newTime);
//       saveProgress(newTime, isPlaying, true);

//       if (user && Math.abs(newTime - oldTime) > 0.5) {
//         sendInteraction(
//           newTime > oldTime ? "video_seek_forward" : "video_seek_backward",
//           { fromTime: oldTime, toTime: newTime },
//         );
//       }
//     },
//     [
//       duration,
//       isPreview,
//       isEnrolled,
//       user,
//       onLimitReached,
//       isPlaying,
//       saveProgress,
//       sendInteraction,
//     ],
//   );

//   // Forward/rewind
//   const forward = useCallback(
//     () => seekTo(currentTime + 10),
//     [currentTime, seekTo],
//   );
//   const rewind = useCallback(
//     () => seekTo(currentTime - 10),
//     [currentTime, seekTo],
//   );

//   // Resume from last position
//   const resumeFromLastPosition = useCallback(() => {
//     if (!userVideoState?.lastPlayedTime || !videoRef.current) return;

//     const resumeTime = userVideoState.lastPlayedTime;
//     const shouldResume =
//       !userVideoState.completed &&
//       resumeTime > 0 &&
//       resumeTime < (duration || videoRef.current.duration || 60) - 5;

//     if (shouldResume) {
//       videoRef.current.currentTime = resumeTime;
//       setCurrentTime(resumeTime);
//       toast.success(`Resumed from ${formatTime(resumeTime)}`);

//       if (userVideoState.wasPlaying) {
//         videoRef.current.play().catch(() => {});
//       }
//     } else {
//       toast.info("Starting from beginning");
//     }
//   }, [userVideoState, videoRef, duration]);

//   // ============================================
//   // 🎯 MAIN VIDEO EVENT LISTENERS (FIXED)
//   // ============================================
//   useEffect(() => {
//     const videoElement = videoRef.current;
//     if (!videoElement) return;

//     // 🎯 Time update handler
//     const handleTimeUpdate = () => {
//       // Reset ended flag if user seeks away from end
//       if (
//         isVideoEndedRef.current &&
//         videoElement.currentTime < videoElement.duration - 1
//       ) {
//         isVideoEndedRef.current = false;
//       }

//       // Preview limit check
//       if (
//         isPreview &&
//         !isEnrolled &&
//         videoElement.currentTime >= PREVIEW_LIMIT_SECONDS
//       ) {
//         videoElement.pause();
//         videoElement.currentTime = PREVIEW_LIMIT_SECONDS;
//         setIsPlaying(false);
//         setCurrentTime(PREVIEW_LIMIT_SECONDS);
//         onLimitReached?.();
//         return;
//       }

//       if (!seeking) {
//         setCurrentTime(videoElement.currentTime);

//         // Save progress every 10 seconds
//         if (isEnrolled && Math.floor(videoElement.currentTime) % 10 === 0) {
//           // Prevent duplicate saves at same time
//           if (
//             Math.abs(videoElement.currentTime - lastSavedTimeRef.current) > 1
//           ) {
//             lastSavedTimeRef.current = videoElement.currentTime;
//             requestAnimationFrame(() => {
//               saveProgress(videoElement.currentTime, isPlaying, false);
//             });
//           }
//         }
//       }
//     };

//     // 🎯 Loaded metadata handler
//     const handleLoadedMetadata = () => {
//       setDuration(videoElement.duration);
//       videoElement.volume = volume;
//       videoElement.playbackRate = playbackRate;
//     };

//     // 🎯 Progress handler
//     const handleProgress = () => {
//       if (videoElement.buffered.length > 0) {
//         const bufferedEnd = videoElement.buffered.end(
//           videoElement.buffered.length - 1,
//         );
//         setBuffered(duration > 0 ? bufferedEnd / duration : 0);
//       }
//     };

//     // 🎯 Play handler
//     const handlePlay = () => {
//       isVideoEndedRef.current = false;
//       sendInteraction("video_play");
//     };

//     // 🎯 PAUSE HANDLER - CRITICAL FIX
//     const handlePause = () => {
//       // If video ended naturally, ignore pause
//       if (videoElement.ended) {
//         return;
//       }

//       sendInteraction("video_pause");

//       requestAnimationFrame(() => {
//         saveProgress(videoElement.currentTime, false, true);
//       });
//     };

//     // 🎯 ENDED HANDLER - CRITICAL FIX
//     const handleEnded = async () => {
//       isVideoEndedRef.current = true; // ✅ Set ended flag

//       setIsPlaying(false);

//       // ✅ Send ONLY video_end, NOT video_pause
//       sendInteraction("video_end");

//       saveFinalWatchTime();
//       saveProgress(duration, false, true);

//       if (isPreview && !isEnrolled) {
//         toast.success("Preview completed! Enroll for full course access.");
//       }
//     };

//     // 🎯 Seeking handler
//     const handleSeeking = () => {
//       // Reset ended flag on seek
//       if (isVideoEndedRef.current) {
//         isVideoEndedRef.current = false;
//       }
//       setSeeking(true);
//     };

//     // 🎯 Seeked handler
//     const handleSeeked = () => {
//       setSeeking(false);
//     };

//     // 🎯 Rate change handler
//     const handleRateChange = () => {
//       if (videoElement.playbackRate !== playbackRate) {
//         sendInteraction("video_speed_change", {
//           fromSpeed: playbackRate,
//           toSpeed: videoElement.playbackRate,
//         });
//       }
//     };

//     // 🎯 Volume change handler
//     const handleVolumeChange = () => {
//       if (videoElement.volume !== volume || videoElement.muted !== isMuted) {
//         sendInteraction(videoElement.muted ? "video_mute" : "video_unmute", {
//           volume: videoElement.volume,
//           muted: videoElement.muted,
//         });
//       }
//     };

//     // 🎯 Fullscreen handlers
//     const handleFullscreenChange = () => {
//       const isFullscreen = !!document.fullscreenElement;
//       sendInteraction(
//         isFullscreen ? "video_fullscreen" : "video_exit_fullscreen",
//       );
//     };

//     // Add all event listeners
//     videoElement.addEventListener("timeupdate", handleTimeUpdate);
//     videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
//     videoElement.addEventListener("progress", handleProgress);
//     videoElement.addEventListener("play", handlePlay);
//     videoElement.addEventListener("pause", handlePause);
//     videoElement.addEventListener("ended", handleEnded);
//     videoElement.addEventListener("seeking", handleSeeking);
//     videoElement.addEventListener("seeked", handleSeeked);
//     videoElement.addEventListener("ratechange", handleRateChange);
//     videoElement.addEventListener("volumechange", handleVolumeChange);
//     document.addEventListener("fullscreenchange", handleFullscreenChange);

//     // Cleanup function
//     return () => {
//       //✅ timeupdate 🎥 Video play cheyyumbo automatic fire cheyyum  User click venda Browser engine currentTime update cheyyumbo fire cheyyum
//       //👉 Pure browser behaviour

//       videoElement.removeEventListener("timeupdate", handleTimeUpdate);
//       //✅ loadedmetadata Video duration, dimensions ready aayal fire cheyyum User action illa
//       //👉 Pure browser behaviour

//       videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
//       //✅ progress Video buffering nadakkumbo fire cheyyum Network activity base cheythu 👉 Pure browser behaviour

//       videoElement.removeEventListener("progress", handleProgress);
//       //✅ ended Video natural aayi theerumbo fire cheyyum User click illa 👉 Pure browser behaviour

//       videoElement.removeEventListener("ended", handleEnded);
//       //🖱 2️⃣ User Interaction Triggered (But Browser Fires)
//       //Ithu important difference 👇 User action und, but event fire cheyyunnathu browser aanu.
//       //▶️ play User play button click cheythal Or code video.play() vilichal Browser fire cheyyum 👉 Trigger = user / code 👉 Fire = browser

//       videoElement.removeEventListener("play", handlePlay);
//       //⏸ pause User pause cheythal Or code pause vilichal Browser fire cheyyum

//       videoElement.removeEventListener("pause", handlePause);
//       //🔄 seeking User timeline drag cheyyumbo Browser fire cheyyum

//       videoElement.removeEventListener("seeking", handleSeeking);
//       //✅ seeked Seek complete aayal browser fire cheyyum

//       videoElement.removeEventListener("seeked", handleSeeked);
//       //⚡ ratechange User speed change cheyyumbo Or code playbackRate change cheythal

//       videoElement.removeEventListener("ratechange", handleRateChange);
//       //🔊 volumechange User volume change cheyyumbo Or muted change cheyyumbo

//       videoElement.removeEventListener("volumechange", handleVolumeChange);
//       //🖥 fullscreenchange User fullscreen click cheyyumbo Or JS requestFullscreen vilichal

//       document.removeEventListener("fullscreenchange", handleFullscreenChange);

//       // Save progress on unmount
//       if (videoElement.currentTime > 0) {
//         saveProgress(videoElement.currentTime, isPlaying, true);
//       }
//     };
//   }, [
//     videoRef,
//     volume,
//     playbackRate,
//     isPreview,
//     isEnrolled,
//     seeking,
//     onLimitReached,
//     saveProgress,
//     isPlaying,
//     duration,
//     saveFinalWatchTime,
//     completeVideo,
//     actualWatchTime,
//     sendInteraction,
//   ]);

//   // Apply playback rate changes
//   useEffect(() => {
//     if (videoRef.current) {
//       videoRef.current.playbackRate = playbackRate;
//     }
//   }, [playbackRate, videoRef]);

//   // Apply volume changes
//   useEffect(() => {
//     if (videoRef.current) {
//       videoRef.current.volume = volume;
//     }
//   }, [volume, videoRef]);

//   // Return all controls and states
//   return {
//     isPlaying,
//     setIsPlaying,
//     volume,
//     setVolume,
//     isMuted,
//     setIsMuted,
//     currentTime,
//     setCurrentTime,
//     duration,
//     playbackRate,
//     setPlaybackRate,
//     buffered,
//     seeking,
//     setSeeking,
//     isPreviewLimitReached,
//     PREVIEW_LIMIT_SECONDS,
//     isLiked,
//     toggleLike,
//     isBookmarked,
//     bookmarkTime,
//     toggleBookmark,
//     progressSynced: true,
//     togglePlay,
//     toggleMute,
//     seekTo,
//     forward,
//     rewind,
//     actualWatchTime,
//     userVideoState,
//     resumeFromLastPosition,
//     hasAutoResumed,
//   };
// };
