// src/components/EnhancedVideoPlayer/components/HotkeysHint.jsx

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { KEYBOARD_SHORTCUTS } from "./videoPlayerTypes";

const HotkeysHint = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute top-20 right-4 bg-gray-900/90 backdrop-blur-lg 
                 rounded-xl p-6 shadow-2xl border border-gray-800 z-30 max-w-xs"
    >
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        Keyboard Shortcuts
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          {KEYBOARD_SHORTCUTS.slice(0, 4).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                {item.key}
              </kbd>
              <span className="text-gray-300 text-sm">{item.action}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {KEYBOARD_SHORTCUTS.slice(4).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <kbd className="bg-gray-800 px-2 py-1 rounded text-sm">
                {item.key}
              </kbd>
              <span className="text-gray-300 text-sm">{item.action}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-4 w-full text-center text-gray-400 hover:text-white text-sm"
      >
        Press H to hide
      </button>
    </motion.div>
  );
};

export default HotkeysHint;
