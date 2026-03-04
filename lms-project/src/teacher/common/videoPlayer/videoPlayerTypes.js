// src/components/EnhancedVideoPlayer/constants/videoPlayerTypes.js

export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const PREVIEW_LIMIT_SECONDS = 120;

export const DEFAULT_VOLUME = 0.8;

export const VIDEO_FILTERS = {
  BRIGHTNESS_MIN: 0.5,
  BRIGHTNESS_MAX: 2,
  CONTRAST_MIN: 0.5,
  CONTRAST_MAX: 2,
  STEP: 0.1,
};

export const KEYBOARD_SHORTCUTS = [
  { key: "Space/K", action: "Play/Pause" },
  { key: "F", action: "Fullscreen" },
  { key: "M", action: "Mute" },
  { key: "B", action: "Bookmark" },
  { key: "← →", action: "Seek 10s" },
  { key: "J/L", action: "Seek 10s" },
  { key: "R", action: "Resume" },
  { key: "H", action: "This Menu" },
];

export const formatTime = (seconds) => {
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

export const formatActualWatchTime = (ms) => {
  if (!ms || isNaN(ms) || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
