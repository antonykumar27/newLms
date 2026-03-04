// src/components/EnhancedVideoPlayer/components/QuickActions.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  SkipBack,
  SkipForward,
  PictureInPicture2,
  RotateCw,
} from "lucide-react";

const QuickActions = ({
  rewind,
  forward,
  togglePictureInPicture,
  rotateVideo,
  resumeFromLastPosition,
  userVideoState,
  showControls,
}) => {
  const actions = [
    { icon: SkipBack, action: rewind, label: "Rewind 10s" },
    { icon: SkipForward, action: forward, label: "Forward 10s" },
    {
      icon: PictureInPicture2,
      action: togglePictureInPicture,
      label: "Picture-in-Picture",
    },
    { icon: RotateCw, action: rotateVideo, label: "Rotate" },
    {
      icon: RotateCw,
      action: resumeFromLastPosition,
      label: "Resume from last position",
      disabled: !userVideoState?.lastPlayedTime || userVideoState.completed,
    },
  ];

  if (!showControls) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20"
    >
      {actions.map((item, i) => (
        <motion.button
          key={i}
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={(e) => {
            e.stopPropagation();
            if (!item.disabled) item.action();
          }}
          disabled={item.disabled}
          className={`group relative p-3 rounded-xl border border-white/10 
                     hover:border-primary-500/50 transition-all hover:scale-110 ${
                       item.disabled
                         ? "bg-black/40 cursor-not-allowed opacity-50"
                         : "bg-black/60 backdrop-blur-sm hover:bg-black/80"
                     }`}
        >
          <item.icon className="w-5 h-5 text-white" />
          <span
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 
                           whitespace-nowrap bg-gray-900 text-white text-sm 
                           px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                           transition-opacity pointer-events-none"
          >
            {item.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default QuickActions;
