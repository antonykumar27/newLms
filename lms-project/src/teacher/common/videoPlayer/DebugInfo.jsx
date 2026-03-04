// src/components/EnhancedVideoPlayer/components/DebugInfo.jsx

import React from "react";
import { formatTime, formatActualWatchTime } from "./videoPlayerTypes";

const DebugInfo = ({
  actualWatchTime,
  currentTime,
  duration,
  isPlaying,
  isEnrolled,
  isPreview,
  userVideoState,
  hasAutoResumed,
}) => {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="absolute bottom-4 left-110 bg-black/80 text-xs p-3 rounded-lg z-50 max-w-xs">
      <div className="text-yellow-400 font-bold mb-2">🎥 Debug Info</div>
      <div className="space-y-1 text-white">
        <div>Actual Watch: {formatActualWatchTime(actualWatchTime || 0)}</div>
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
  );
};

export default DebugInfo;
