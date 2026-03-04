// src/components/EnhancedVideoPlayer.jsx - PRODUCTION READY WITH LMS INTEGRATION
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Captions,
  Download,
  PictureInPicture2,
  RotateCw,
  Zap,
  Sparkles,
  Eye,
  Lock,
  Clock,
  CheckCircle,
  Share2,
  Heart,
  Bookmark,
  FileText,
  Users,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../common/AuthContext";
import {
  useSaveWatchTimeMutation,
  useTrackInteractionMutation,
  useTrackInteractionhandleEnrollMutation,
  useSaveVideoProgressMutation,
  useTrackWatchTimeMutation,
  useGetUserVideoStateQuery,
  useTrackVideoSeekMutation,
  useTrackvideoscreenshotinteractionMutation,
  useTrackVideoInteractionMutation,
  useCompleteVideoMutation,
} from "../store/api/AllAnalyticsApi";
import {
  useToggleVideoLikeMutation,
  useToggleVideoWishlistMutation,
} from "../store/api/CourseApi";

// 1. First define  BEFORE
const useWatchTimeTracker = (
  videoRef, // വീഡിയോ HTML എലമെന്റിന്റെ റഫറൻസ്
  isPlaying, // വീഡിയോ പ്ലേ ചെയ്യുന്നോ എന്ന സ്റ്റേറ്റ്
  isEnrolled, // ഉപയോക്താവ് കോഴ്സിൽ എൻറോൾ ചെയ്തിട്ടുണ്ടോ
  isPreview, // പ്രിവ്യൂ മോഡിൽ ആണോ
  user, // ഉപയോക്താവിന്റെ വിവരങ്ങൾ
  course, // കോഴ്സ് വിവരങ്ങൾ
  video, // നിലവിലെ വീഡിയോ വിവരങ്ങൾ
) => {
  const [actualWatchTime, setActualWatchTime] = useState(0);

  // actualWatchTime: മില്ലിസെക്കൻഡിൽ കണ്ട സമയം
  // setActualWatchTime: ആ സമയം അപ്ഡേറ്റ് ചെയ്യാൻ
  const lastUpdateTimeRef = useRef(null);
  // കഴിഞ്ഞ അപ്ഡേറ്റിന്റെ ടൈംസ്റ്റാമ്പ് സംഭരിക്കുന്നു
  const accumulatedWatchTimeRef = useRef(0);
  // സെയ്വ് ചെയ്യാൻ കാത്തിരിക്കുന്ന സമയം (ഇത് 10 സെക്കൻഡ് കഴിഞ്ഞാണ് സെയ്വ് ചെയ്യുന്നത്)
  const isTrackingRef = useRef(false);
  // ഇപ്പോൾ ട്രാക്കിംഗ് നടക്കുന്നുണ്ടോ എന്ന് ട്രാക്ക് ചെയ്യുന്നു
  // Start/stop tracking when play/pause changes
  useEffect(() => {
    // videoRef ഇല്ലെങ്കിൽ ഒന്നും ചെയ്യാൻ പാടില്ല
    if (!videoRef?.current) return;
    // വീഡിയോ എലമെന്റ് എടുക്കുന്നു
    const videoElement = videoRef.current;
    // എപ്പോഴെല്ലാം വീഡിയോ ടൈം അപ്ഡേറ്റ് ആകുന്നുവോ അപ്പോൾ ഈ ഫങ്ഷൻ വിളിക്കും
    // step 2 also 2 here ഓരോ സീന്‍ കഴിയുമ്പോള്‍ ഒരു ഇടവേളയില്‍ ഓട്ടോമാറ്റിക്കായി ഈ ഫങ്ഷന്‍ വിളിക്കപ്പെടും.
    const handleTimeUpdate = () => {
      // വീഡിയോ പ്ലേ ചെയ്യുന്നില്ലെങ്കിൽ ട്രാക്ക് ചെയ്യാൻ പാടില്ല
      if (!isPlaying || !isTrackingRef.current) return;

      const now = Date.now(); // ഇപ്പോഴത്തെ സമയം
      //STEP 3: എത്ര സമയം കടന്നുപോയി എന്ന് കണക്കാക്കുന്നു ooro secondum etre vattam repeate cheythu ennu nookkunnu
      if (lastUpdateTimeRef.current) {
        const timeDiff = now - lastUpdateTimeRef.current;
        //STEP 4: ഈ സമയം സംഭരിക്കുന്നു angane save cheytha samayam sambarikkunnu
        //പിഗ്ഗി ബാങ്കില്‍ ഇപ്പോള്‍ ഉള്ളത്: ₹0
        //ഇപ്പോള്‍ കിട്ടിയത്: ₹5 (5 സെക്കന്ഡ്)
        //ആകെ: ₹5
        accumulatedWatchTimeRef.current += timeDiff; // സംഭരിക്കുന്നു
        //STEP 5: UI-യില്‍ കാണിക്കുന്നു
        setActualWatchTime((prev) => prev + timeDiff); // UI-യ്ക്ക് കാണിക്കുന്നു
        //STEP 6: 10 സെക്കന്ഡ് ആകുമ്പോള്‍ സേവ് ചെയ്യുന്നു
        // 10 സെക്കൻഡ് (10000ms) കടന്നാൽ ബാക്കെൻഡിലേക്ക് സേവ് ചെയ്യുന്നു
        if (accumulatedWatchTimeRef.current >= 10000) {
          // പിഗ്ഗി ബാങ്ക്: ₹10 ആയി!
          //ബാങ്കില്‍ നിക്ഷേപിക്കുന്നു: ₹10 സേവ് ചെയ്യുന്നു
          //പിഗ്ഗി ബാങ്ക്: ശൂന്യമാക്കുന്നു (₹0)
          saveActualWatchTime(accumulatedWatchTimeRef.current);
          accumulatedWatchTimeRef.current = 0; // റീസെറ്റ്
        }
      }
      //STEP 7: ഇപ്പോഴത്തെ സമയം സൂക്ഷിക്കുന്നുഇപ്പോഴത്തെ സമയം (6:00:05 PM) സൂക്ഷിക്കുന്നു,
      //  അടുത്ത തവണ ഇതില്‍ നിന്ന് കണക്കാക്കാന്‍.
      lastUpdateTimeRef.current = now; // ഇപ്പോഴത്തെ സമയം സംഭരിക്കുന്നു
    };
    //വീഡിയോ പ്ലേ ചെയ്യുമ്പോഴെല്ലാം timeupdate ഈവന്റ് ഓട്ടോമാറ്റിക്കായി വിളിക്കപ്പെടും.
    // ഓരോ 250ms കൂടുമ്പോഴും ഇത് വിളിക്കപ്പെടും.
    // വീഡിയോ പ്ലേ ആകുമ്പോൾ:
    //STEP 1: സിനിമ ആരംഭിക്കുന്നു
    if (isPlaying) {
      // ട്രാക്കിംഗ് ആരംഭിക്കുന്നു
      isTrackingRef.current = true;
      // ആരംഭ സമയം നോട്ട് ചെയ്യുന്നു ee video play cheyyunna ee samayam
      lastUpdateTimeRef.current = Date.now();
      // timeupdate ഈവന്റ് ലിസ്റ്റണർ ചേർക്കുന്നു
      //STEP 2: timeupdate ഈവന്റ് - ഓരോ കാണുന്ന സീന്‍ കഴിയുമ്പോള്‍ ee handleUpdate call cheyyum
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
    } else {
      //⏸️ സിനിമ പോസ് ആകുമ്പോള്‍:
      // STEP 8: വീഡിയോ പോസ് ആകുമ്പോള്‍
      isTrackingRef.current = false; // ട്രാക്കിംഗ് നിർത്തുന്നു
      // പോസ് ആകുന്നത് വരെയുള്ള സമയം കണക്കാക്കുന്നു
      if (lastUpdateTimeRef.current) {
        const finalTime = Date.now() - lastUpdateTimeRef.current;
        //സമയം എണ്ണം നിര്‍ത്തുന്നു)

        //നിര്‍ത്തുന്നത് വരെയുള്ള സമയം കണക്കാക്കുന്നു

        //ആ സമയവും പിഗ്ഗി ബാങ്കില്‍ ചേര്‍ക്കുന്നു
        accumulatedWatchTimeRef.current += finalTime;
        setActualWatchTime((prev) => prev + finalTime);
      }
      // ഈവന്റ് ലിസ്റ്റണർ നീക്കം ചെയ്യുന്നു
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    }
    //STEP 9: കോംപോണന്റ് അണ്‍മൌണ്ട് ആകുമ്പോള്‍ play alla pause alla a samayam
    return () => {
      // ഹുക്ക് അൺമൗണ്ട് ആകുമ്പോൾ ഈ ഫങ്ഷൻ വിളിക്കപ്പെടും
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      // ഇപ്പോഴും ട്രാക്കിംഗ് നടക്കുകയാണെങ്കിൽ അവസാന സമയം സേവ് ചെയ്യുന്നു
      //ലിസ്റ്റനര്‍ നീക്കം ചെയ്യുന്നു (കാണുന്നത് നിര്‍ത്തുന്നു)

      //അവസാന സമയം കണക്കാക്കുന്നു (വാച്ച് ഓണ്‍ ആയിരുന്നെങ്കില്‍)

      //ആ സമയവും പിഗ്ഗി ബാങ്കില്‍ ചേര്‍ക്കുന്നു
      if (isTrackingRef.current && lastUpdateTimeRef.current) {
        const finalTime = Date.now() - lastUpdateTimeRef.current;
        accumulatedWatchTimeRef.current += finalTime;
        //അവസാനം സേവ് ചെയ്യുമ്പോള്‍:
        //STEP 10: ബാക്കെന്‍ഡിലേക്ക് സേവ് ചെയ്യുന്നു
        setActualWatchTime((prev) => prev + finalTime);
      }
    };
  }, [isPlaying, videoRef]);

  // Save actual watch time to backend
  const [saveWatchTime] = useSaveWatchTimeMutation();

  const saveActualWatchTime = async (watchTimeMs) => {
    try {
      // ഓരോ സെഷനും യൂണീക്ക് ഐഡി സൃഷ്ടിക്കുന്നു
      const sessionId = `session_${Date.now()}_${user._id}`;

      const payload = {
        courseId: course._id,
        videoId: video._id,
        watchTimeMs, // കണ്ട സമയം (ms-ൽ)
        currentTime: videoRef.current?.currentTime || 0, // വീഡിയോയിൽ എവിടെയാണ്
        totalDuration: videoRef.current?.duration || 0, // വീഡിയോയുടെ ആകെ ദൈർഘ്യം
        isPreview: isPreview && !isEnrolled,
        sessionId,
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
            videoTime: videoRef.current?.currentTime || 0,
          },
        ],
      };

      await saveWatchTime(payload).unwrap();
    } catch (error) {
      console.error("❌ Failed to save watch time:", error);
    }
  };
  //എപ്പോൾ വിളിക്കും?
  //നിങ്ങൾ പുതിയ വീഡിയോ തുടങ്ങുമ്പോൾ അല്ലെങ്കിൽ എല്ലാം റീസെറ്റ് ചെയ്യേണ്ടിവരുമ്പോൾ:
  const resetWatchTime = () => {
    setActualWatchTime(0);
    accumulatedWatchTimeRef.current = 0;
    lastUpdateTimeRef.current = null;
  };
  //അവസാനം സേവ് ചെയ്യുമ്പോള്‍:
  //STEP 10: ബാക്കെന്‍ഡിലേക്ക് സേവ് ചെയ്യുന്നു
  const saveFinalWatchTime = () => {
    // 1 സെക്കൻഡിൽ കൂടുതൽ സമയമുണ്ടെങ്കിൽ സേവ് ചെയ്യുന്നു
    if (accumulatedWatchTimeRef.current > 1000) {
      saveActualWatchTime(accumulatedWatchTimeRef.current);
    }
  };
  // ഉപയോക്താവ് പേജ് വിടുമ്പോൾ ഓട്ടോമാറ്റിക്കായി വിളിക്കുന്നു
  useEffect(() => {
    return () => {
      saveFinalWatchTime(); // 🚪 പേജിൽ നിന്ന് പോകുമ്പോൾ
    };
  }, []);

  return {
    actualWatchTime,
    resetWatchTime,
    saveFinalWatchTime,
  };
};

// Helper function to format time
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");

  if (hh > 0) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const useVideoControls = (
  videoRef,
  video,
  course,
  isEnrolled,
  isPreview,
  onLimitReached,
) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const lastEventRef = useRef({
    video_play: 0,
    video_pause: 0,
  });

  const sendInteraction = useCallback(
    (type, data) => {
      const now = Date.now();
      const lastTime = lastEventRef.current[type] || 0;

      const debounceTimes = {
        video_play: 1000,
        video_pause: 500,
        video_seek_forward: 300,
        default: 300,
      };

      const debounceTime = debounceTimes[type] || debounceTimes.default;

      if (now - lastTime < debounceTime) {
        return;
      }

      lastEventRef.current[type] = now;

      trackVideoInteraction({
        type,
        userId: user._id,
        courseId: course._id,
        totalDuration: videoRef.current?.duration || 0,
        videoId: video._id,
        ...data,
        isPreview: isPreview && !isEnrolled,
      });
    },
    [user, course._id, video._id, isPreview, isEnrolled],
  );

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
  const [progressSynced, setProgressSynced] = useState(true);
  const [hasAutoResumed, setHasAutoResumed] = useState(false);

  const [saveVideoProgress] = useSaveVideoProgressMutation();
  const [trackWatchTimeMutation] = useTrackWatchTimeMutation();
  const [trackVideoSeek] = useTrackVideoSeekMutation();
  const [trackVideoInteraction] = useTrackVideoInteractionMutation();
  const [trackInteraction] = useTrackInteractionMutation();
  const [completeVideo] = useCompleteVideoMutation();

  // Get user's video state including resume position
  const { data: userVideoState, isSuccess: isStateLoaded } =
    useGetUserVideoStateQuery(
      {
        courseId: course._id,
        videoId: video._id,
      },
      {
        skip: !user,
      },
    );

  const PREVIEW_LIMIT_SECONDS = 120;

  const isPreviewLimitReached =
    isPreview && !isEnrolled && currentTime >= PREVIEW_LIMIT_SECONDS;

  // Add actual watch time tracking
  const {
    actualWatchTime = 0,
    resetWatchTime,
    saveFinalWatchTime,
  } = useWatchTimeTracker(
    videoRef,
    isPlaying,
    isEnrolled,
    isPreview,
    user,
    course,
    video,
  );
  console.log("actualWatchTimeactualWatchTimeactualWatchTime", actualWatchTime);

  // Load user's video state (likes, bookmarks, progress)
  useEffect(() => {
    if (!isStateLoaded || !userVideoState || !videoRef.current) return;

    setIsLiked(userVideoState.isLiked || false);
    setIsBookmarked(userVideoState.isBookmarked || false);
    setBookmarkTime(userVideoState.bookmarkTime || null);

    // Don't auto-resume if video was completed
    const shouldAutoResume =
      userVideoState.lastPlayedTime &&
      userVideoState.lastPlayedTime > 10 &&
      !userVideoState.completed &&
      userVideoState.lastPlayedTime <
        (duration || videoRef.current.duration || 60) - 5;

    if (shouldAutoResume && !hasAutoResumed) {
      // Store resume time for later use
      setCurrentTime(userVideoState.lastPlayedTime);
      // Don't set video time here - will be set in handleLoadedMetadata
    }
  }, [isStateLoaded, userVideoState, videoRef, duration, hasAutoResumed]);

  // Handle auto-resume when video metadata is loaded
  const handleAutoResume = useCallback(() => {
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

      // Show subtle notification
      toast.info(`Resumed from ${formatTime(resumeTime)}`, {
        position: "bottom-center",
        autoClose: 2000,
        icon: "🎬",
      });
    }
  }, [userVideoState, videoRef, duration, isEnrolled, hasAutoResumed]);

  // Save progress function
  const saveProgress = useCallback(
    async (time, wasPlaying = isPlaying) => {
      if (!isEnrolled || !user || !userVideoState) return;

      try {
        const progressData = {
          currentTime: time,
          duration,
          progressPercentage: duration > 0 ? (time / duration) * 100 : 0,
          actualWatchTimeMs: actualWatchTime,
          actualWatchSeconds: Math.floor(actualWatchTime / 1000),
          wasPlaying,
          lastUpdated: new Date().toISOString(),
        };

        // Only save if significant change (more than 5 seconds difference)
        const lastSavedTime = userVideoState.lastPlayedTime || 0;

        const shouldSave = Math.abs(time - lastSavedTime) > 5;

        if (shouldSave) {
          await saveVideoProgress({
            courseId: course._id,
            videoId: video._id,
            data: progressData,
          }).unwrap();

          setProgressSynced(true);
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
        setProgressSynced(false);
      }
    },
    [
      saveVideoProgress,
      course._id,
      video._id,
      isEnrolled,
      user,
      duration,
      actualWatchTime,
      isPlaying,
      userVideoState,
    ],
  );

  const trackWatchTime = (watchData) => {
    const dataToSend = {
      userId: user?._id,
      courseId: course._id,
      videoId: video._id,
      watchTime: watchData.watchTime,
      isPreview: isPreview && !isEnrolled,
      timestamp: new Date().toISOString(),
    };

    try {
      trackWatchTimeMutation(dataToSend);
    } catch (error) {
      console.error("Failed to track watch time:", error);
    }
  };

  // Toggle like with backend sync
  const [toggleVideoLike] = useToggleVideoLikeMutation();

  const [toggleVideoWishlist] = useToggleVideoWishlistMutation();

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

      trackInteraction({
        type: "video_like",
        courseId: course._id,
        videoId: video._id,
        data: { value: newLikeState, timestamp: new Date().toISOString() },
      }).catch((err) => console.error(err));
    } catch (error) {
      console.error("Failed to update like:", error);
      setIsLiked(!newLikeState);
      toast.error("Failed to update like");
    }
  }, [user, isLiked, course._id, video._id, toggleVideoLike, trackInteraction]);

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

      trackInteraction({
        type: "wishlist_toggle",
        courseId: course._id,
        videoId: video._id,
        data: {
          value: newState,
          timestamp: new Date().toISOString(),
          action: newState ? "added_to_wishlist" : "removed_from_wishlist",
        },
      }).catch((err) => console.error("Analytics error:", err));
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      setIsBookmarked(!newState);
      toast.error("Failed to update wishlist");
    }
  }, [
    isBookmarked,
    user,
    course._id,
    toggleVideoWishlist,
    trackInteraction,
    video._id,
  ]);

  const jumpToBookmark = useCallback(() => {
    if (bookmarkTime && videoRef.current) {
      videoRef.current.currentTime = bookmarkTime;
      setCurrentTime(bookmarkTime);
      toast.success(`Jumped to bookmark at ${formatTime(bookmarkTime)}`);
    }
  }, [bookmarkTime, videoRef]);

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
      // Save progress when pausing
      saveProgress(videoElement.currentTime, false);
    } else {
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
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

  const toggleMute = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted, videoRef]);

  const seekTo = useCallback(
    (seconds) => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const oldTime = currentTime;
      let newTime = seconds;
      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;

      if (isPreview && !isEnrolled && newTime > PREVIEW_LIMIT_SECONDS) {
        newTime = PREVIEW_LIMIT_SECONDS;
        if (onLimitReached) onLimitReached();
      }

      videoElement.currentTime = newTime;
      setCurrentTime(newTime);
      setProgressSynced(false);

      // Save progress after seeking
      saveProgress(newTime, isPlaying);

      if (user && Math.abs(newTime - oldTime) > 0.5) {
        const isForward = newTime > oldTime;
        const seekType = isForward
          ? "video_seek_forward"
          : "video_seek_backward";

        trackVideoSeek({
          type: seekType,
          userId: user._id,
          courseId: course._id,
          videoId: video._id,
          fromTime: oldTime,
          toTime: newTime,
          timestamp: new Date().toISOString(),
        }).catch((err) => {
          console.error("Seek tracking failed:", err);
        });
      }
    },
    [
      duration,
      isPreview,
      isEnrolled,
      currentTime,
      user,
      course._id,
      video._id,
      trackVideoSeek,
      onLimitReached,
      videoRef,
      isPlaying,
      saveProgress,
    ],
  );

  const forward = useCallback(
    () => seekTo(currentTime + 10),
    [currentTime, seekTo],
  );

  const rewind = useCallback(
    () => seekTo(currentTime - 10),
    [currentTime, seekTo],
  );

  // Manual resume function
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

      // Auto-play if user was playing before
      if (userVideoState.wasPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            if (error.name !== "AbortError") {
              console.log("Auto-play blocked");
            }
          });
        }
      }
    } else {
      toast.info("Starting from beginning");
    }
  }, [userVideoState, videoRef, duration]);

  // Initialize video event listeners with progress tracking
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      if (
        isPreview &&
        !isEnrolled &&
        videoElement.currentTime >= PREVIEW_LIMIT_SECONDS
      ) {
        videoElement.pause();
        videoElement.currentTime = PREVIEW_LIMIT_SECONDS;
        setIsPlaying(false);
        setCurrentTime(PREVIEW_LIMIT_SECONDS);
        if (onLimitReached) onLimitReached();
        return;
      }

      if (!seeking) {
        setCurrentTime(videoElement.currentTime);

        // Auto-save progress every 10 seconds
        if (isEnrolled && Math.floor(videoElement.currentTime) % 10 === 0) {
          saveProgress(videoElement.currentTime, isPlaying);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      videoElement.volume = volume;
      videoElement.playbackRate = playbackRate;

      // Call auto-resume after metadata is loaded
      if (!hasAutoResumed) {
        setTimeout(() => {
          handleAutoResume();
        }, 100);
      }

      // Secure signed URL check for enrolled users
      if (isEnrolled) {
        const url = new URL(videoElement.src);
        if (url.searchParams.has("expires")) {
          const expires = parseInt(url.searchParams.get("expires"));
          if (Date.now() / 1000 > expires) {
            toast.error("Video URL expired. Please refresh.");
            videoElement.src = "";
          }
        }
      }
    };

    const handleProgress = () => {
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(
          videoElement.buffered.length - 1,
        );
        const bufferedRatio = duration > 0 ? bufferedEnd / duration : 0;
        setBuffered(bufferedRatio);
      }
    };

    const handlePlay = () => {
      sendInteraction("video_play", {
        currentTime: videoRef.current?.currentTime || 0,
      });
    };

    const handlePause = () => {
      sendInteraction("video_pause", {
        currentTime: videoRef.current?.currentTime || 0,
      });

      // Save progress when paused
      saveProgress(videoElement.currentTime, false);
    };

    const handleEnded = async () => {
      setIsPlaying(false);
      saveFinalWatchTime();

      // Save as completed
      saveProgress(duration, false);

      if (isEnrolled) {
        try {
          await completeVideo({
            courseId: course._id,
            videoId: video._id,
          }).unwrap();

          await trackInteraction({
            type: "video_complete",
            courseId: course._id,
            videoId: video._id,
            data: {
              duration,
              totalWatched: actualWatchTime,
              timestamp: new Date().toISOString(),
            },
          }).unwrap();

          toast.success("Video completed!");
        } catch (err) {
          console.error("Failed to complete video:", err);
        }
      }

      if (isPreview && !isEnrolled) {
        toast.success("Preview completed! Enroll for full course access.");
      }
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("progress", handleProgress);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("progress", handleProgress);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("ended", handleEnded);

      // Save final progress on unmount
      if (videoElement.currentTime > 0) {
        saveProgress(videoElement.currentTime, isPlaying);
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
    user,
    course._id,
    video._id,
    saveProgress,
    trackWatchTime,
    isPlaying,
    handleAutoResume,
    hasAutoResumed,
    duration,
    actualWatchTime,
    saveFinalWatchTime,
    completeVideo,
    trackInteraction,
    sendInteraction,
  ]);

  // Apply playback rate when it changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.playbackRate = playbackRate;
    }
  }, [playbackRate, videoRef]);

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
    jumpToBookmark,
    progressSynced,
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

// Add this helper function before the EnhancedVideoPlayer component:
const formatActualWatchTime = (ms) => {
  if (!ms || isNaN(ms) || ms <= 0) return "0:00";

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const EnhancedVideoPlayer = ({
  video,
  onClose,
  course,
  isEnrolled = false,
  isPreview = false,
  resources = [],
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // UI states
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showHotkeysHint, setShowHotkeysHint] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [playbackHistory, setPlaybackHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [trackVideoScreenshotInteraction] =
    useTrackvideoscreenshotinteractionMutation();
  const [trackInteractionhandleEnroll] =
    useTrackInteractionhandleEnrollMutation();
  const [trackInteraction] = useTrackInteractionMutation();

  const handleLimitReached = useCallback(() => {
    toast.info("Preview limit reached! Enroll for full access.", {
      position: "bottom-center",
      autoClose: 3000,
    });
  }, []);

  // Use custom hook for video controls
  const {
    isPlaying,
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
    jumpToBookmark,
    progressSynced,
    togglePlay,
    toggleMute,
    seekTo,
    forward,
    rewind,
    actualWatchTime,
    userVideoState,
    resumeFromLastPosition,
    hasAutoResumed,
  } = useVideoControls(
    videoRef,
    video,
    course,
    isEnrolled,
    isPreview,
    handleLimitReached,
  );

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);

      trackInteraction({
        type: "player_fullscreen",
        courseId: course._id,
        videoId: video._id,
        data: { action: "enter", timestamp: new Date().toISOString() },
      }).catch((err) => console.error("Failed to track fullscreen:", err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);

      trackInteraction({
        type: "player_fullscreen",
        courseId: course._id,
        videoId: video._id,
        data: { action: "exit", timestamp: new Date().toISOString() },
      }).catch((err) => console.error("Failed to track fullscreen:", err));
    }
    showControlsTemporarily();
  };

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();

        trackInteraction({
          type: "player_pip",
          courseId: course._id,
          videoId: video._id,
          data: { action: "exit", timestamp: new Date().toISOString() },
        }).catch((err) => console.error("Failed to track PiP:", err));
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();

        trackInteraction({
          type: "player_pip",
          courseId: course._id,
          videoId: video._id,
          data: { action: "enter", timestamp: new Date().toISOString() },
        }).catch((err) => console.error("Failed to track PiP:", err));
      }
    } catch (err) {
      console.error("PiP failed:", err);
    }
  };

  const shareVideo = useCallback(async () => {
    const shareUrl = `${window.location.origin}/courses/${course._id}/preview/${video._id}`;
    const shareText = `Watch "${video.title}" from "${course.title}"`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: shareUrl,
        });

        trackInteraction({
          type: "video_share",
          courseId: course._id,
          videoId: video._id,
          data: {
            platform: "native_share",
            shareUrl,
            timestamp: new Date().toISOString(),
          },
        }).catch((err) => console.error("Failed to track share:", err));
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");

        trackInteraction({
          type: "video_share",
          courseId: course._id,
          videoId: video._id,
          data: {
            platform: "clipboard",
            shareUrl,
            timestamp: new Date().toISOString(),
          },
        }).catch((err) => console.error("Failed to track share:", err));
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  }, [course._id, course.title, video._id, video.title, trackInteraction]);

  const takeScreenshot = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.filter = `brightness(${brightness}) contrast(${contrast})`;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = `screenshot-${course.title}-${
      video.title
    }-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast.success("Screenshot saved!");

    if (user) {
      try {
        await trackVideoScreenshotInteraction({
          type: "video_screenshot",
          userId: user._id,
          courseId: course._id,
          videoId: video._id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Screenshot tracking failed", error);
      }
    }
  };

  const rotateVideo = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleEnrollClick = async () => {
    try {
      await trackInteractionhandleEnroll({
        type: "preview_to_enrollment_cta",
        userId: user?._id,
        courseId: course._id,
        videoId: video._id,
        previewTime: currentTime,
        timestamp: new Date().toISOString(),
      }).unwrap();

      navigate(`/courses/${course._id}/enroll?video=${video._id}`);
    } catch (error) {
      console.error("Analytics tracking failed", error);
    }
  };

  const downloadResource = async (resource) => {
    const link = document.createElement("a");
    link.href = resource.url;
    link.download = resource.name;
    link.click();

    toast.success(`Downloading ${resource.name}`);

    try {
      await trackInteraction({
        type: "resource_download",
        courseId: course._id,
        videoId: video._id,
        data: {
          resourceId: resource._id,
          resourceName: resource.name,
          resourceType: resource.type,
          timestamp: new Date().toISOString(),
        },
      }).unwrap();
    } catch (error) {
      console.error("Failed to track resource download:", error);
    }
  };

  // Clear resume point
  const clearResumePoint = useCallback(async () => {
    try {
      await saveVideoProgress({
        courseId: course._id,
        videoId: video._id,
        data: {
          currentTime: 0,
          wasPlaying: false,
          clearedResume: true,
        },
      }).unwrap();

      toast.success("Resume point cleared");
    } catch (error) {
      console.error("Failed to clear resume point:", error);
    }
  }, [course._id, video._id]);

  // Update playback history (limited to 50 points)
  useEffect(() => {
    if (isPlaying && currentTime > 0 && Math.floor(currentTime) % 5 === 0) {
      setPlaybackHistory((prev) => {
        const newHistory = [...prev.slice(-49), currentTime];
        return newHistory;
      });
    }
  }, [currentTime, isPlaying]);

  // Apply video filters
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.filter = `
        brightness(${brightness}) 
        contrast(${contrast})
      `;
      videoRef.current.style.transform = `rotate(${rotation}deg)`;
    }
  }, [brightness, contrast, rotation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
          e.preventDefault();
          if (isPreview && !isEnrolled && currentTime - 10 < 0) break;
          rewind();
          break;
        case "arrowright":
          e.preventDefault();
          if (
            isPreview &&
            !isEnrolled &&
            currentTime + 10 > PREVIEW_LIMIT_SECONDS
          )
            break;
          forward();
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          break;
        case "j":
          e.preventDefault();
          if (isPreview && !isEnrolled && currentTime - 10 < 0) break;
          seekTo(currentTime - 10);
          break;
        case "l":
          e.preventDefault();
          if (
            isPreview &&
            !isEnrolled &&
            currentTime + 10 > PREVIEW_LIMIT_SECONDS
          )
            break;
          seekTo(currentTime + 10);
          break;
        case "s":
          e.preventDefault();
          takeScreenshot();
          break;
        case "h":
          e.preventDefault();
          setShowHotkeysHint((prev) => !prev);
          break;
        case "b":
          e.preventDefault();
          if (bookmarkTime) jumpToBookmark();
          break;
        case "r": // Resume from last position
          e.preventDefault();
          resumeFromLastPosition();
          break;
        case "escape":
          if (showSettings || showResources) {
            setShowSettings(false);
            setShowResources(false);
          } else if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlay,
    toggleMute,
    forward,
    rewind,
    currentTime,
    seekTo,
    isFullscreen,
    isPreview,
    isEnrolled,
    PREVIEW_LIMIT_SECONDS,
    bookmarkTime,
    jumpToBookmark,
    showSettings,
    showResources,
    resumeFromLastPosition,
  ]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Smart cursor hiding in fullscreen
  useEffect(() => {
    if (isFullscreen && isPlaying) {
      document.body.style.cursor = "none";
    } else {
      document.body.style.cursor = "auto";
    }

    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isFullscreen, isPlaying]);

  // Handle video loading
  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    toast.error("Failed to load video. Please try again.");
    setIsLoading(false);
  };

  // Handle seek
  const handleSeekChange = (e) => {
    const newPlayedRatio = parseFloat(e.target.value);
    const newTime = newPlayedRatio * duration;
    setCurrentTime(newTime);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    const newPlayedRatio = parseFloat(e.target.value);
    const newTime = newPlayedRatio * duration;

    requestAnimationFrame(() => {
      seekTo(newTime);

      if (isPlaying && videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (err.name !== "AbortError") {
              console.error("Failed to resume play:", err);
            }
          });
        }
      }
    });
  };

  // Change volume
  const changeVolume = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
    showControlsTemporarily();
  };

  if (!video?.videoUrl) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-gray-900 to-black z-100 flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <div className="text-6xl mb-4 animate-pulse">🎬</div>
          <h3 className="text-2xl font-bold mb-2">Video Unavailable</h3>
          <p className="text-gray-400 mb-6">
            The video content is currently not available.
          </p>
          <button
            onClick={onClose}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
          >
            Return to Course
          </button>
        </div>
      </div>
    );
  }

  const playedRatio = duration > 0 ? currentTime / duration : 0;
  const previewLimitRatio = duration > 0 ? PREVIEW_LIMIT_SECONDS / duration : 0;
  const resumePositionRatio =
    userVideoState?.lastPlayedTime && duration > 0
      ? userVideoState.lastPlayedTime / duration
      : 0;

  return (
    <div
      className="fixed inset-0 z-100 
             bg-white/10 
             backdrop-blur-xl 
             backdrop-saturate-150
             border border-white/40"
      onMouseMove={handleMouseMove}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Loading video...</p>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-size-[40px_40px]"></div>
      </div>

      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 z-20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="group p-2 rounded-xl bg-black/50 hover:bg-black/70 transition-all hover:scale-105"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
                </button>
                <div className="max-w-xl">
                  <h2 className="text-white font-bold truncate text-lg">
                    {video.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(duration)}
                    </span>
                    {course?.title && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="truncate">{course.title}</span>
                      </>
                    )}
                    {!progressSynced && (
                      <span className="text-yellow-400 text-xs">
                        Syncing...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isPreview && !isEnrolled && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                    <Eye className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm font-medium">
                      Preview
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleLike}
                    className={`p-2 rounded-xl transition-all hover:scale-105 ${
                      isLiked
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={isLiked ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    onClick={toggleBookmark}
                    className={`p-2 rounded-xl transition-all hover:scale-105 ${
                      isBookmarked
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    <Bookmark
                      className="w-5 h-5"
                      fill={isBookmarked ? "currentColor" : "none"}
                    />
                  </button>
                  {bookmarkTime && (
                    <button
                      onClick={jumpToBookmark}
                      className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all hover:scale-105"
                      title="Jump to bookmark"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={shareVideo}
                    className="p-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-all hover:scale-105"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watch Time Indicator */}
      {(actualWatchTime || 0) > 0 && (
        <div className="absolute top-20 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 z-30">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white">
              Watched: {formatActualWatchTime(actualWatchTime || 0)}
            </span>
          </div>
        </div>
      )}

      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center bg-black"
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="max-w-full max-h-full object-contain"
          style={{
            filter: `brightness(${brightness}) contrast(${contrast})`,
            transform: `rotate(${rotation}deg)`,
          }}
          playsInline
          preload="metadata"
          controls={false}
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
        />

        {/* Resume Button (if not auto-resumed and there's a resume point) */}
        {!hasAutoResumed &&
          userVideoState?.lastPlayedTime &&
          userVideoState.lastPlayedTime > 10 &&
          !isPlaying &&
          !userVideoState.completed && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={resumeFromLastPosition}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       z-10 mt-20 bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-700 hover:to-purple-700 text-white 
                       px-6 py-3 rounded-xl font-bold flex items-center gap-2 
                       shadow-2xl border border-white/20"
            >
              <RotateCw className="w-5 h-5" />
              Continue from {formatTime(userVideoState.lastPlayedTime)}
            </motion.button>
          )}

        {/* Center Play Button */}
        {!isPlaying &&
          !isPreviewLimitReached &&
          !userVideoState?.lastPlayedTime && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="bg-linear-to-r from-primary-500/20 to-purple-500/20 backdrop-blur-lg p-8 rounded-full border border-white/20"
              >
                <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-6 rounded-full shadow-2xl">
                  <Play className="w-16 h-16 text-white ml-1" />
                </div>
              </motion.div>
            </button>
          )}

        {/* Preview Limit Indicator */}
        {isPreview && !isEnrolled && (
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none">
            <div className="relative mx-8">
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="bg-gradient-to-r from-transparent via-yellow-500/30 to-yellow-500/50 p-4 pl-12 rounded-l-full">
                  <div className="flex items-center gap-2 text-white">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Preview Limit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SHotkeys Hint */}
        <AnimatePresence>
          {showHotkeysHint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-20 right-4 bg-gray-900/90 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-gray-800 z-30 max-w-xs"
            >
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                      Space/K
                    </kbd>
                    <span className="text-gray-300 text-sm">Play/Pause</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                      F
                    </kbd>
                    <span className="text-gray-300 text-sm">Fullscreen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                      M
                    </kbd>
                    <span className="text-gray-300 text-sm">Mute</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                      B
                    </kbd>
                    <span className="text-gray-300 text-sm">Bookmark</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                      ← →
                    </kbd>
                    <span className="text-gray-300 text-sm">Seek 10s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                      J/L
                    </kbd>
                    <span className="text-gray-300 text-sm">Seek 10s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                      R
                    </kbd>
                    <span className="text-gray-300 text-sm">Resume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                      H
                    </kbd>
                    <span className="text-gray-300 text-sm">This Menu</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowHotkeysHint(false)}
                className="mt-4 w-full text-center text-gray-400 hover:text-white text-sm"
              >
                Press H to hide
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resources Menu */}
        <AnimatePresence>
          {showResources && resources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-20 right-4 bg-gray-900/90 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-gray-800 z-30 max-w-xs"
            >
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Resources ({resources.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {resources.map((resource) => (
                  <button
                    key={resource._id}
                    onClick={() => downloadResource(resource)}
                    className="w-full text-left p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-200 truncate">
                        {resource.name}
                      </span>
                    </div>
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowResources(false)}
                className="mt-3 w-full text-center text-gray-400 hover:text-white text-sm"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini Progress Timeline */}
        {showMiniMap && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-lg rounded-xl p-4 w-64">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>0:00</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-purple-500"
                style={{ width: `${playedRatio * 100}%` }}
              />
              {userVideoState?.lastPlayedTime && (
                <div
                  className="absolute top-0 w-2 h-full bg-blue-400 rounded-full"
                  style={{
                    left: `${resumePositionRatio * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                  title={`Resume from ${formatTime(
                    userVideoState.lastPlayedTime,
                  )}`}
                />
              )}
              {playbackHistory.map((time, i) => (
                <div
                  key={i}
                  className="absolute top-0 w-0.5 h-full bg-white/30"
                  style={{
                    left: `${duration > 0 ? (time / duration) * 100 : 0}%`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Bar */}
        <AnimatePresence>
          {showControls && !isPreviewLimitReached && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20"
            >
              {[
                { icon: SkipBack, action: rewind, label: "Rewind 10s" },
                { icon: SkipForward, action: forward, label: "Forward 10s" },
                {
                  icon: PictureInPicture2,
                  action: togglePictureInPicture,
                  label: "Picture-in-Picture",
                },
                { icon: RotateCw, action: rotateVideo, label: "Rotate" },
                {
                  icon: RotateCw,
                  action: resumeFromLastPosition,
                  label: "Resume from last position",
                  disabled:
                    !userVideoState?.lastPlayedTime || userVideoState.completed,
                },
              ].map((item, i) => (
                <motion.button
                  key={i}
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!item.disabled) item.action();
                  }}
                  disabled={item.disabled}
                  className={`group relative p-3 rounded-xl border border-white/10 hover:border-primary-500/50 transition-all hover:scale-110 ${
                    item.disabled
                      ? "bg-black/40 cursor-not-allowed opacity-50"
                      : "bg-black/60 backdrop-blur-sm hover:bg-black/80"
                  }`}
                >
                  <item.icon className="w-5 h-5 text-white" />
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && !isPreviewLimitReached && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 z-20"
          >
            {/* Progress Bar */}
            <div className="relative mb-6 group">
              {/* Buffer bar */}
              <div
                className="absolute top-0 left-0 h-1.5 bg-gray-600/50 rounded-full transition-all"
                style={{ width: `${buffered * 100}%` }}
              />

              {/* Resume position indicator */}
              {userVideoState?.lastPlayedTime && duration > 0 && (
                <div
                  className="absolute top-0 h-4 w-1 bg-blue-400 pointer-events-none z-10"
                  style={{ left: `${resumePositionRatio * 100}%` }}
                >
                  <div className="absolute -top-6 -left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    Resume
                  </div>
                </div>
              )}

              {/* Progress bar */}
              <input
                type="range"
                min="0"
                max="1"
                step="any"
                value={playedRatio}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                className="absolute top-0 left-0 w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:hover:opacity-100"
                style={{
                  background:
                    isPreview && !isEnrolled
                      ? `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                          previewLimitRatio * 100
                        }%, #4f46e5 ${previewLimitRatio * 100}%, #4f46e5 ${
                          playedRatio * 100
                        }%, #4b5563 ${playedRatio * 100}%, #4b5563 100%)`
                      : `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${
                          playedRatio * 100
                        }%, #4b5563 ${playedRatio * 100}%, #4b5563 100%)`,
                }}
              />

              {/* Preview limit marker */}
              {isPreview && !isEnrolled && (
                <div
                  className="absolute top-0 h-4 w-0.5 bg-yellow-500 pointer-events-none"
                  style={{ left: `${previewLimitRatio * 100}%` }}
                >
                  <div className="absolute -top-6 -left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    Preview ends
                  </div>
                </div>
              )}

              {/* Time labels */}
              <div className="flex justify-between text-sm text-gray-300 mt-3">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 transition-all hover:scale-105 shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2 group">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <div className="w-24 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={changeVolume}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                </div>

                {/* Playback Rate */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">{playbackRate}x</span>
                  </button>

                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 p-3 min-w-44"
                      >
                        <h4 className="text-xs text-gray-400 mb-2">
                          PLAYBACK SPEED
                        </h4>
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(
                          (rate) => (
                            <button
                              key={rate}
                              onClick={() => {
                                setPlaybackRate(rate);
                                setShowSettings(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                                playbackRate === rate
                                  ? "bg-primary-500/20 text-primary-300"
                                  : "text-gray-300 hover:bg-white/10"
                              }`}
                            >
                              <span>{rate}x</span>
                              {rate === 1 && (
                                <span className="text-xs text-gray-500">
                                  Normal
                                </span>
                              )}
                            </button>
                          ),
                        )}

                        <div className="border-t border-gray-800 mt-3 pt-3">
                          <h4 className="text-xs text-gray-400 mb-2">
                            VIDEO FILTERS
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">
                                Brightness
                              </span>
                              <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={brightness}
                                onChange={(e) =>
                                  setBrightness(parseFloat(e.target.value))
                                }
                                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">
                                Contrast
                              </span>
                              <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={contrast}
                                onChange={(e) =>
                                  setContrast(parseFloat(e.target.value))
                                }
                                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                              />
                            </div>
                          </div>

                          {/* Resume Settings */}
                          <div className="border-t border-gray-800 mt-3 pt-3">
                            <h4 className="text-xs text-gray-400 mb-2">
                              RESUME SETTINGS
                            </h4>

                            <button
                              onClick={() => {
                                clearResumePoint();
                                setShowSettings(false);
                              }}
                              disabled={!userVideoState?.lastPlayedTime}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                userVideoState?.lastPlayedTime
                                  ? "text-gray-300 hover:bg-white/10"
                                  : "text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              <RotateCw className="w-4 h-4" />
                              Clear resume point
                            </button>

                            <div className="text-xs text-gray-500 mt-2">
                              {userVideoState?.lastPlayedTime
                                ? `Resumes from ${formatTime(
                                    userVideoState.lastPlayedTime,
                                  )}`
                                : "No resume point set"}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Resources Button */}
                {resources.length > 0 && (
                  <button
                    onClick={() => setShowResources(!showResources)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Resources</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mini Map Toggle */}
                <button
                  onClick={() => setShowMiniMap(!showMiniMap)}
                  className={`p-2 rounded-xl transition-colors ${
                    showMiniMap
                      ? "bg-primary-500/20 text-primary-300"
                      : "bg-white/10 hover:bg-white/20 text-gray-300"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </button>

                {/* Hotkeys Hint Toggle */}
                <button
                  onClick={() => setShowHotkeysHint(!showHotkeysHint)}
                  className={`p-2 rounded-xl transition-colors ${
                    showHotkeysHint
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-white/10 hover:bg-white/20 text-gray-300"
                  }`}
                >
                  <Zap className="w-5 h-5" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Limit Overlay */}
      <AnimatePresence>
        {isPreviewLimitReached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent flex items-center justify-center z-30"
          >
            <div className="text-center max-w-2xl p-8">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="inline-block mb-6"
              >
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-full border border-yellow-500/30">
                  <Lock className="w-16 h-16 text-yellow-400" />
                </div>
              </motion.div>

              <h3 className="text-4xl font-bold text-white mb-4">
                Preview Completed! 🎉
              </h3>
              <p className="text-xl text-gray-300 mb-8">
                You've watched {PREVIEW_LIMIT_SECONDS / 60} minutes of free
                preview.
                <br />
                Enroll now to unlock the full course with{" "}
                {Math.floor(duration / 60)}+ minutes of content!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-bold">
                    {course.enrolledCount || 0}+ Students
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-bold">
                    {Math.floor(course.totalDuration / 60) || 0}+ Hours
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white font-bold">Certificate</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={handleEnrollClick}
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Enroll Now & Continue Watching
                </button>
              </div>

              <p className="text-gray-400 text-sm mt-6">
                <CheckCircle className="inline-block w-4 h-4 mr-1" />
                Includes certificate • Lifetime access • 30-day money-back
                guarantee
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Animation for Controls Hint */}
      {!showControls && isPlaying && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-gray-400 text-sm pointer-events-none"
        >
          Move mouse to show controls
        </motion.div>
      )}

      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-4 left-110 bg-black/80 text-xs p-3 rounded-lg z-50 max-w-xs">
          <div className="text-yellow-400 font-bold mb-2">🎥 Debug Info</div>
          <div className="space-y-1 text-white">
            <div>
              Actual Watch: {formatActualWatchTime(actualWatchTime || 0)}
            </div>
            <div>
              Video Time: {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <div>Status: {isPlaying ? "▶️ Playing" : "⏸️ Paused"}</div>
            <div>Enrolled: {isEnrolled ? "✅" : "❌"}</div>
            <div>Preview: {isPreview ? "👁️" : "👤"}</div>
            <div>
              Resume Point:{" "}
              {userVideoState?.lastPlayedTime
                ? formatTime(userVideoState.lastPlayedTime)
                : "None"}
            </div>
            <div>Auto-resumed: {hasAutoResumed ? "✅" : "❌"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoPlayer;
