// components/ContinueLearning.jsx
import React, { useState } from "react";
import { Play, Clock, ChevronRight, Sparkles } from "lucide-react";

const ContinueLearning = ({ title, progress, thumbnail, lastWatched }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90"></div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: "3s",
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-white/80 text-sm flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Continue Learning
            </span>
            <h3 className="text-white text-xl font-bold mt-1 line-clamp-1">
              {title}
            </h3>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <Clock className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-white/80 text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Clock className="w-4 h-4" />
            <span>{lastWatched}</span>
          </div>

          {/* Animated Play Button */}
          <button
            className={`
            flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold
            transition-all duration-300 transform
            ${isHovered ? "scale-110 shadow-xl" : "scale-100"}
          `}
          >
            <Play
              className={`w-4 h-4 transition-all duration-300 ${isHovered ? "fill-current" : ""}`}
            />
            <span>Resume</span>
            <ChevronRight
              className={`w-4 h-4 transition-all duration-300 ${isHovered ? "translate-x-1" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinueLearning;
