// src/components/EnhancedVideoPlayer/hooks/useKeyboardShortcuts.js

import { useEffect } from "react";

export const useKeyboardShortcuts = ({
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
  jumpToBookmark,
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
}) => {
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
          // Volume up handled separately
          break;
        case "arrowdown":
          e.preventDefault();
          // Volume down handled separately
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
        case "r":
          e.preventDefault();
          resumeFromLastPosition();
          break;
        case "escape":
          if (showSettings || showResources) {
            setShowSettings(false);
            setShowResources(false);
          } else if (isFullscreen) {
            toggleFullscreen();
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
    takeScreenshot,
    setShowHotkeysHint,
    toggleFullscreen,
    onClose,
  ]);
};
