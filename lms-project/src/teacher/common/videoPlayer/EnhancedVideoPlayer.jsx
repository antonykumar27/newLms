// src/components/EnhancedVideoPlayer/EnhancedVideoPlayer.jsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../common/AuthContext";
import { Clock } from "lucide-react";
// Constants
import {
  PREVIEW_LIMIT_SECONDS,
  formatActualWatchTime,
} from "./videoPlayerTypes";

// Hooks
import { useVideoControls } from "./useVideoControls";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { useVideoProgress } from "./useVideoProgress";

// Components
import VideoContainer from "./VideoContainer";
import VideoControls from "./VideoControls";
import QuickActions from "./QuickActions";
import PreviewLimitOverlay from "./PreviewLimitOverlay";
import ResourcesMenu from "./ResourcesMenu";
import HotkeysHint from "./HotkeysHint";
import MiniTimeline from "./MiniTimeline";
import DebugInfo from "./DebugInfo";

// Mutations
import {
  useTrackvideoscreenshotinteractionMutation,
  useTrackInteractionhandleEnrollMutation,
  useTrackInteractionMutation,
} from "../../../store/api/AllAnalyticsApi";

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

  // Mutations
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
    isLiked,
    toggleLike,
    isBookmarked,
    bookmarkTime,
    toggleBookmark,
    togglePlay,
    toggleMute,
    seekTo,
    forward,
    rewind,
    actualWatchTime,
    userVideoState,
    resumeFromLastPosition,
    hasAutoResumed,
    saveProgress,
  } = useVideoControls(
    videoRef,
    video,
    course,
    isEnrolled,
    isPreview,
    handleLimitReached,
  );

  const { clearResumePoint } = useVideoProgress(
    course,
    video,
    isEnrolled,
    user,
    duration,
    isPlaying,
  );

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const toggleFullscreen = useCallback(() => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);

    if (newFullscreenState && videoRef.current && !isPlaying) {
      videoRef.current.play().catch(console.error);
    }

    trackInteraction({
      type: "player_fullscreen",
      courseId: course._id,
      videoId: video._id,
      data: {
        action: newFullscreenState ? "enter" : "exit",
        timestamp: new Date().toISOString(),
      },
    }).catch(console.error);

    showControlsTemporarily();
  }, [
    isFullscreen,
    isPlaying,
    course._id,
    video._id,
    trackInteraction,
    showControlsTemporarily,
  ]);

  const togglePictureInPicture = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        trackInteraction({
          type: "player_pip",
          courseId: course._id,
          videoId: video._id,
          data: { action: "exit", timestamp: new Date().toISOString() },
        }).catch(console.error);
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
        trackInteraction({
          type: "player_pip",
          courseId: course._id,
          videoId: video._id,
          data: { action: "enter", timestamp: new Date().toISOString() },
        }).catch(console.error);
      }
    } catch (err) {
      console.error("PiP failed:", err);
    }
  }, [course._id, video._id, trackInteraction]);

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
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }

      trackInteraction({
        type: "video_share",
        courseId: course._id,
        videoId: video._id,
        data: {
          platform: navigator.share ? "native_share" : "clipboard",
          shareUrl,
          timestamp: new Date().toISOString(),
        },
      }).catch(console.error);
    } catch (error) {
      console.error("Share failed:", error);
    }
  }, [course._id, course.title, video._id, video.title, trackInteraction]);

  const takeScreenshot = useCallback(async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.filter = `brightness(${brightness}) contrast(${contrast})`;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = `screenshot-${course.title}-${video.title}-${Date.now()}.png`;
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
  }, [
    brightness,
    contrast,
    course.title,
    course._id,
    video.title,
    video._id,
    user,
    trackVideoScreenshotInteraction,
  ]);

  const rotateVideo = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleEnrollClick = useCallback(async () => {
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
  }, [
    user,
    course._id,
    video._id,
    currentTime,
    navigate,
    trackInteractionhandleEnroll,
  ]);

  const downloadResource = useCallback(
    async (resource) => {
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
    },
    [course._id, video._id, trackInteraction],
  );

  // Seek handlers
  const wasPlayingRef = useRef(false);

  const handleSeekStart = useCallback(() => {
    wasPlayingRef.current = isPlaying;
    setSeeking(true);
    videoRef.current?.pause();
  }, [isPlaying, setSeeking]);

  const handleSeekChange = useCallback(
    (e) => {
      const newPlayedRatio = parseFloat(e.target.value);
      const newTime = newPlayedRatio * duration;
      setCurrentTime(newTime);
    },
    [duration, setCurrentTime],
  );

  const handleSeekEnd = useCallback(
    (e) => {
      setSeeking(false);
      const newPlayedRatio = parseFloat(e.target.value);
      const newTime = newPlayedRatio * duration;

      seekTo(newTime);

      if (wasPlayingRef.current) {
        videoRef.current?.play().catch(() => {});
      }
    },
    [duration, seekTo, setSeeking],
  );

  // Update playback history
  useEffect(() => {
    if (isPlaying && currentTime > 0 && Math.floor(currentTime) % 5 === 0) {
      setPlaybackHistory((prev) => [...prev.slice(-49), currentTime]);
    }
  }, [currentTime, isPlaying]);

  // Apply video filters
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.filter = `brightness(${brightness}) contrast(${contrast})`;
      videoRef.current.style.transform = `rotate(${rotation}deg)`;
    }
  }, [brightness, contrast, rotation]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    togglePlay,
    toggleMute,
    forward,
    rewind,
    seekTo,
    currentTime,
    isPreview,
    isEnrolled,
    PREVIEW_LIMIT_SECONDS,
    bookmarkTime,
    jumpToBookmark: () => {
      if (bookmarkTime && videoRef.current) {
        videoRef.current.currentTime = bookmarkTime;
        setCurrentTime(bookmarkTime);
        toast.success(`Jumped to bookmark at ${formatTime(bookmarkTime)}`);
      }
    },
    showSettings,
    showResources,
    setShowSettings,
    setShowResources,
    resumeFromLastPosition,
    takeScreenshot,
    setShowHotkeysHint,
    toggleFullscreen,
    isFullscreen,
    onClose,
  });

  // Smart cursor hiding
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.cursor = "auto";
    } else {
      if (isPlaying && !showControls) {
        const timer = setTimeout(() => {
          document.body.style.cursor = "none";
        }, 3000);
        return () => {
          clearTimeout(timer);
          document.body.style.cursor = "auto";
        };
      } else {
        document.body.style.cursor = "auto";
      }
    }
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isFullscreen, isPlaying, showControls]);

  // Video loading handlers
  const handleVideoLoaded = () => setIsLoading(false);
  const handleVideoError = () => {
    toast.error("Failed to load video. Please try again.");
    setIsLoading(false);
  };

  if (!course.media?.url) {
    return (
      <div className="max-w-6xl mx-auto bg-linear-to-br from-gray-900 z-100 flex items-center justify-center">
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
      className={`relative  backdrop-blur-xl backdrop-saturate-150 
                   border border-white/40 
                   ${isFullscreen ? "fixed inset-0 z-50" : "max-w-6xl mx-auto"}
`}
      onMouseMove={handleMouseMove}
    >
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
      {/* ithinte akathu video player with center play akunna button anu ullathu */}
      <VideoContainer
        videoRef={videoRef}
        videoSrc={course.media?.url}
        isFullscreen={isFullscreen}
        brightness={brightness}
        contrast={contrast}
        rotation={rotation}
        isPlaying={isPlaying}
        isPreviewLimitReached={isPreviewLimitReached}
        userVideoState={userVideoState}
        hasAutoResumed={hasAutoResumed}
        resumeFromLastPosition={resumeFromLastPosition}
        togglePlay={togglePlay}
        isLoading={isLoading}
        onLoadedData={handleVideoLoaded}
        onError={handleVideoError}
      >
        {/* ivide short cut Keys Hotkeys Hint */}
        <AnimatePresence>
          {showHotkeysHint && (
            <HotkeysHint onClose={() => setShowHotkeysHint(false)} />
          )}
        </AnimatePresence>

        {/*Down load paramaya karyangal Resources Menu */}
        <AnimatePresence>
          {showResources && resources.length > 0 && (
            <ResourcesMenu
              resources={resources}
              onDownload={downloadResource}
              onClose={() => setShowResources(false)}
            />
          )}
        </AnimatePresence>

        {/* Mini Timeline */}
        {showMiniMap && (
          <MiniTimeline
            duration={duration}
            playedRatio={playedRatio}
            userVideoState={userVideoState}
            resumePositionRatio={resumePositionRatio}
            playbackHistory={playbackHistory}
          />
        )}

        {/*sideil kanunna buttons Quick Actions */}
        <QuickActions
          rewind={rewind}
          forward={forward}
          togglePictureInPicture={togglePictureInPicture}
          rotateVideo={rotateVideo}
          resumeFromLastPosition={resumeFromLastPosition}
          userVideoState={userVideoState}
          showControls={showControls}
        />
      </VideoContainer>

      {/* Bottom Controls  ithu vannu  progress var and volume buttons logic adangiyirikkunna sthalam*/}
      <AnimatePresence>
        {showControls && !isPreviewLimitReached && (
          <VideoControls
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            toggleMute={toggleMute}
            currentTime={currentTime}
            duration={duration}
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            buffered={buffered}
            playedRatio={playedRatio}
            isPreview={isPreview}
            isEnrolled={isEnrolled}
            previewLimitRatio={previewLimitRatio}
            userVideoState={userVideoState}
            onSeekStart={handleSeekStart}
            onSeekEnd={handleSeekEnd}
            onSeekChange={handleSeekChange}
            resources={resources}
            showMiniMap={showMiniMap}
            setShowMiniMap={setShowMiniMap}
            showHotkeysHint={showHotkeysHint}
            setShowHotkeysHint={setShowHotkeysHint}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            showResources={showResources}
            setShowResources={setShowResources}
            brightness={brightness}
            setBrightness={setBrightness}
            contrast={contrast}
            setContrast={setContrast}
            clearResumePoint={clearResumePoint}
          />
        )}
      </AnimatePresence>

      {/* Preview Limit Overlay */}
      <AnimatePresence>
        {isPreviewLimitReached && (
          <PreviewLimitOverlay
            onClose={onClose}
            onEnroll={handleEnrollClick}
            course={course}
            duration={duration}
          />
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

      {/* Debug Info */}
      <DebugInfo
        actualWatchTime={actualWatchTime}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        isEnrolled={isEnrolled}
        isPreview={isPreview}
        userVideoState={userVideoState}
        hasAutoResumed={hasAutoResumed}
      />
    </div>
  );
};

export default EnhancedVideoPlayer;
