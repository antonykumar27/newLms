// src/components/EnhancedVideoPlayer/components/PlaybackSpeedMenu.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, RotateCw } from "lucide-react";
import { PLAYBACK_RATES, VIDEO_FILTERS } from "./videoPlayerTypes";

const PlaybackSpeedMenu = ({
  playbackRate,
  setPlaybackRate,
  showSettings,
  setShowSettings,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  userVideoState,
  clearResumePoint,
  formatTime,
}) => {
  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 
                   transition-colors flex items-center gap-2"
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
            className="absolute bottom-full left-0 mb-2 bg-gray-900/95 backdrop-blur-lg 
                       rounded-xl shadow-2xl border border-gray-800 p-3 min-w-44"
          >
            <h4 className="text-xs text-gray-400 mb-2">PLAYBACK SPEED</h4>
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  setPlaybackRate(rate);
                  setShowSettings(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors 
                           flex items-center justify-between ${
                             playbackRate === rate
                               ? "bg-primary-500/20 text-primary-300"
                               : "text-gray-300 hover:bg-white/10"
                           }`}
              >
                <span>{rate}x</span>
                {rate === 1 && (
                  <span className="text-xs text-gray-500">Normal</span>
                )}
              </button>
            ))}

            <div className="border-t border-gray-800 mt-3 pt-3">
              <h4 className="text-xs text-gray-400 mb-2">VIDEO FILTERS</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Brightness</span>
                  <input
                    type="range"
                    min={VIDEO_FILTERS.BRIGHTNESS_MIN}
                    max={VIDEO_FILTERS.BRIGHTNESS_MAX}
                    step={VIDEO_FILTERS.STEP}
                    value={brightness}
                    onChange={(e) => setBrightness(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer 
                               [&::-webkit-slider-thumb]:appearance-none 
                               [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Contrast</span>
                  <input
                    type="range"
                    min={VIDEO_FILTERS.CONTRAST_MIN}
                    max={VIDEO_FILTERS.CONTRAST_MAX}
                    step={VIDEO_FILTERS.STEP}
                    value={contrast}
                    onChange={(e) => setContrast(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer 
                               [&::-webkit-slider-thumb]:appearance-none 
                               [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
              </div>

              {/* Resume Settings */}
              <div className="border-t border-gray-800 mt-3 pt-3">
                <h4 className="text-xs text-gray-400 mb-2">RESUME SETTINGS</h4>

                <button
                  onClick={() => {
                    clearResumePoint();
                    setShowSettings(false);
                  }}
                  disabled={!userVideoState?.lastPlayedTime}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors 
                             flex items-center gap-2 ${
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
                    ? `Resumes from ${formatTime(userVideoState.lastPlayedTime)}`
                    : "No resume point set"}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaybackSpeedMenu;
