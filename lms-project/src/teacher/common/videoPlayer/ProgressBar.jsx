// src/components/EnhancedVideoPlayer/components/ProgressBar.jsx

import React from "react";
import { formatTime } from "./videoPlayerTypes";

const ProgressBar = ({
  playedRatio,
  buffered,
  currentTime,
  duration,
  isPreview,
  isEnrolled,
  previewLimitRatio,
  resumePositionRatio,
  onSeekStart,
  onSeekEnd,
  onSeekChange,
}) => {
  const progressBackground =
    isPreview && !isEnrolled
      ? `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${previewLimitRatio * 100}%, 
       #4f46e5 ${previewLimitRatio * 100}%, #4f46e5 ${playedRatio * 100}%, 
       #4b5563 ${playedRatio * 100}%, #4b5563 100%)`
      : `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${playedRatio * 100}%, 
       #4b5563 ${playedRatio * 100}%, #4b5563 100%)`;

  return (
    <div className="relative mb-6 group">
      {/* Buffer bar */}
      <div
        className="absolute top-0 left-0 h-1.5 bg-gray-600/50 rounded-full transition-all"
        style={{ width: `${buffered * 100}%` }}
      />

      {/* Resume position indicator */}
      {resumePositionRatio > 0 && (
        <div
          className="absolute top-0 h-4 w-1 bg-blue-400 pointer-events-none z-10"
          style={{ left: `${resumePositionRatio * 100}%` }}
        >
          <div
            className="absolute -top-6 -left-3 bg-blue-500 text-white 
                          text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
          >
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
        onChange={onSeekChange}
        onMouseDown={onSeekStart}
        onMouseUp={onSeekEnd}
        onTouchStart={onSeekStart}
        onTouchEnd={onSeekEnd}
        className="absolute top-0 left-0 w-full h-1.5 appearance-none bg-transparent 
                   cursor-pointer [&::-webkit-slider-thumb]:appearance-none 
                   [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                   [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:hover:opacity-100"
        style={{ background: progressBackground }}
      />

      {/* Preview limit marker */}
      {isPreview && !isEnrolled && (
        <div
          className="absolute top-0 h-4 w-0.5 bg-yellow-500 pointer-events-none"
          style={{ left: `${previewLimitRatio * 100}%` }}
        >
          <div
            className="absolute -top-6 -left-2 bg-yellow-500 text-black 
                          text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none"
          >
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
  );
};

export default ProgressBar;
