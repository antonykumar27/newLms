// src/components/EnhancedVideoPlayer/components/PreviewLimitOverlay.jsx

import React from "react";
import { motion } from "framer-motion";
import { Lock, Users, Clock, Award, CheckCircle } from "lucide-react";
import { PREVIEW_LIMIT_SECONDS } from "./videoPlayerTypes";

const PreviewLimitOverlay = ({ onClose, onEnroll, course, duration }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-gradient-to-t from-black via-black/95 
                 to-transparent flex items-center justify-center z-30"
    >
      <div className="text-center max-w-2xl p-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block mb-6"
        >
          <div
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
                          p-6 rounded-full border border-yellow-500/30"
          >
            <Lock className="w-16 h-16 text-yellow-400" />
          </div>
        </motion.div>

        <h3 className="text-4xl font-bold text-white mb-4">
          Preview Completed! 🎉
        </h3>
        <p className="text-xl text-gray-300 mb-8">
          You've watched {PREVIEW_LIMIT_SECONDS / 60} minutes of free preview.
          <br />
          Enroll now to unlock the full course with {Math.floor(duration / 60)}+
          minutes of content!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-bold">
              {course.enrolledCount || 0}+ Students
            </p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-bold">
              {Math.floor(course.totalDuration / 60) || 0}+ Hours
            </p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-white font-bold">Certificate</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white 
                       rounded-xl font-bold transition-colors"
          >
            Continue Browsing
          </button>
          <button
            onClick={onEnroll}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-purple-500 
                       hover:from-primary-600 hover:to-purple-600 text-white 
                       rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Enroll Now & Continue Watching
          </button>
        </div>

        <p className="text-gray-400 text-sm mt-6">
          <CheckCircle className="inline-block w-4 h-4 mr-1" />
          Includes certificate • Lifetime access • 30-day money-back guarantee
        </p>
      </div>
    </motion.div>
  );
};

export default PreviewLimitOverlay;
