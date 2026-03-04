// src/components/EnhancedVideoPlayer/components/ResourcesMenu.jsx

import React from "react";
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";

const ResourcesMenu = ({ resources, onDownload, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-20 right-4 bg-gray-900/90 backdrop-blur-lg 
                 rounded-xl p-4 shadow-2xl border border-gray-800 z-30 max-w-xs"
    >
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-400" />
        Resources ({resources.length})
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {resources.map((resource) => (
          <button
            key={resource._id}
            onClick={() => onDownload(resource)}
            className="w-full text-left p-3 rounded-lg bg-gray-800/50 
                       hover:bg-gray-800 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-200 truncate">
                {resource.name}
              </span>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="mt-3 w-full text-center text-gray-400 hover:text-white text-sm"
      >
        Close
      </button>
    </motion.div>
  );
};

export default ResourcesMenu;
