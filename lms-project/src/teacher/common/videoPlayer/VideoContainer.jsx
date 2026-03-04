// src/components/EnhancedVideoPlayer/components/VideoContainer.jsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCw, Lock } from "lucide-react";
import { formatTime } from "./videoPlayerTypes";

const VideoContainer = ({
  videoRef,
  videoSrc,
  isFullscreen,
  brightness,
  contrast,
  rotation,
  isPlaying,
  isPreviewLimitReached,
  userVideoState,
  hasAutoResumed,
  resumeFromLastPosition,
  togglePlay,
  isLoading,
  onLoadedData,
  onError,
  children,
}) => {
  const [showResumeButton, setShowResumeButton] = useState(false);

  useEffect(() => {
    if (
      !hasAutoResumed &&
      userVideoState?.lastPlayedTime > 10 &&
      !isPlaying &&
      !userVideoState?.completed
    ) {
      setShowResumeButton(true);
    } else {
      setShowResumeButton(false);
    }
  }, [hasAutoResumed, userVideoState, isPlaying]);

  return (
    <div
      className={`relative w-full ${isFullscreen ? "h-screen" : "h-auto"} 
                  flex items-center justify-center bg-black`}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className={`${isFullscreen ? "w-full h-full" : "max-w-full max-h-full"} object-contain`}
        style={{
          filter: `brightness(${brightness}) contrast(${contrast})`,
          transform: `rotate(${rotation}deg)`,
        }}
        playsInline
        preload="metadata"
        controls={false}
        onLoadedData={onLoadedData}
        onError={onError}
      />

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

      {/* Resume Button */}
      {showResumeButton && (
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

      {/* Center Play Button  ithanu namal valuthayi kanunna centeril ulla button*/}
      {!isPlaying && !isPreviewLimitReached && !showResumeButton && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="bg-linear-to-r from-primary-500/20 to-purple-500/20 
                       backdrop-blur-lg p-8 rounded-full border border-white/20"
          >
            <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-6 rounded-full shadow-2xl">
              <Play className="w-16 h-16 text-white ml-1" />
            </div>
          </motion.div>
        </button>
      )}

      {/* Preview Limit Indicator */}
      {isPreviewLimitReached && (
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

      {children}
    </div>
  );
};

export default VideoContainer;
