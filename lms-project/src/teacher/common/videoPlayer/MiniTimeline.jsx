// src/components/EnhancedVideoPlayer/components/MiniTimeline.jsx

import React from "react";
import { formatTime } from "./videoPlayerTypes";

const MiniTimeline = ({
  duration,
  playedRatio,
  userVideoState,
  resumePositionRatio,
  playbackHistory,
}) => {
  return (
    <div
      className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/80 
                    backdrop-blur-lg rounded-xl p-4 w-64"
    >
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
            title={`Resume from ${formatTime(userVideoState.lastPlayedTime)}`}
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
  );
};

export default MiniTimeline;
