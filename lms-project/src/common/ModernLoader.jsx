import React from "react";

const ModernLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-50 w-full">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring - Light/Dark adaptive border */}
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>

        {/* Orbiting Spinner - Trending gradient or solid accent */}
        <div className="absolute w-12 h-12 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>

        {/* Center Pulse - Optional "Heartbeat" effect */}
        <div className="absolute w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>

        {/* Screen Reader Label */}
        <span className="sr-only">Loading content...</span>
      </div>
    </div>
  );
};

export default ModernLoader;
