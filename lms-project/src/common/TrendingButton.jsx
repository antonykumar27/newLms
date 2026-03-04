import React from "react";

const TrendingButton = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative group overflow-hidden px-6 py-3 rounded-xl font-semibold text-white 
        transition-all duration-300 active:scale-95
        /* Light Mode Gradient */
        bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 
        /* Dark Mode Adjustments - Slightly deeper saturation */
        dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500
        /* Shadow effects */
        shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]
        ${className}
      `}
    >
      {/* Glossy Overlay Shimmer */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />

      {/* Content Container */}
      <span className="relative flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default TrendingButton;
