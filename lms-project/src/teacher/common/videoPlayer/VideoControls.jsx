// src/components/EnhancedVideoPlayer/components/VideoControls.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  FileText,
  Sparkles,
  Zap,
  Maximize,
  Minimize,
} from "lucide-react";
import { PLAYBACK_RATES, VIDEO_FILTERS, formatTime } from "./videoPlayerTypes";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";
import PlaybackSpeedMenu from "./PlaybackSpeedMenu";
import { useVideoProgress } from "./useVideoProgress";

const VideoControls = ({
  isPlaying,
  togglePlay,
  volume,
  setVolume,
  isMuted,
  toggleMute,
  currentTime,
  duration,
  playbackRate,
  setPlaybackRate,
  buffered,
  playedRatio,
  isPreview,
  isEnrolled,
  previewLimitRatio,
  userVideoState,
  onSeekStart,
  onSeekEnd,
  onSeekChange,
  resources,
  showMiniMap,
  setShowMiniMap,
  showHotkeysHint,
  setShowHotkeysHint,
  isFullscreen,
  toggleFullscreen,
  showSettings,
  setShowSettings,
  showResources,
  setShowResources,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  clearResumePoint,
}) => {
  const [showVolume, setShowVolume] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t 
                 from-black/95 via-black/80 to-transparent p-6 z-20"
    >
      <ProgressBar
        playedRatio={playedRatio}
        buffered={buffered}
        currentTime={currentTime}
        duration={duration}
        isPreview={isPreview}
        isEnrolled={isEnrolled}
        previewLimitRatio={previewLimitRatio}
        resumePositionRatio={
          userVideoState?.lastPlayedTime && duration > 0
            ? userVideoState.lastPlayedTime / duration
            : 0
        }
        onSeekStart={onSeekStart}
        onSeekEnd={onSeekEnd}
        onSeekChange={onSeekChange}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 
                       hover:from-primary-600 hover:to-purple-600 transition-all 
                       hover:scale-105 shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>

          {/* Volume Control */}
          <VolumeControl
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            toggleMute={toggleMute}
          />

          {/* Playback Speed */}
          <PlaybackSpeedMenu
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            brightness={brightness}
            setBrightness={setBrightness}
            contrast={contrast}
            setContrast={setContrast}
            userVideoState={userVideoState}
            clearResumePoint={clearResumePoint}
            formatTime={formatTime}
          />

          {/* Resources Button */}
          {resources.length > 0 && (
            <button
              onClick={() => setShowResources(!showResources)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 
                         transition-colors flex items-center gap-2"
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
  );
};

export default VideoControls;
