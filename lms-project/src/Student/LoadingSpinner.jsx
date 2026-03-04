import React from "react";

const LoadingSpinner = ({
  size = "medium",
  color = "blue",
  fullScreen = false,
  text = "Loading...",
}) => {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16",
    xlarge: "h-20 w-20",
  };

  const colorClasses = {
    blue: "text-blue-600",
    white: "text-white",
    gray: "text-gray-600",
    purple: "text-purple-600",
    green: "text-green-600",
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div
            className={`inline-block ${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
          >
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          {text && (
            <p className="mt-4 text-gray-600 font-medium animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}
        ></div>

        {/* Spinning ring */}
        <div
          className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-4 ${colorClasses[color]} border-t-transparent animate-spin`}
        ></div>

        {/* Optional inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`h-1/2 w-1/2 rounded-full ${colorClasses[color]} opacity-20`}
          ></div>
        </div>
      </div>

      {text && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 font-medium mb-2">{text}</p>
          <div className="flex justify-center space-x-1">
            <div
              className="h-1 w-1 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="h-1 w-1 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="h-1 w-1 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Variants for different use cases
export const PageLoader = () => (
  <LoadingSpinner size="large" fullScreen text="Loading content..." />
);

export const ButtonLoader = ({ color = "white" }) => (
  <div className="flex items-center">
    <div
      className={`h-4 w-4 border-2 ${
        color === "white" ? "border-white" : "border-blue-600"
      } border-t-transparent rounded-full animate-spin mr-2`}
    ></div>
    <span>Loading...</span>
  </div>
);

export const InlineLoader = () => (
  <div className="inline-flex items-center">
    <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
    <span className="text-sm text-gray-600">Loading</span>
  </div>
);

export default LoadingSpinner;
