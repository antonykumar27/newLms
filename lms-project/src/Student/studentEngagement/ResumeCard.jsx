// components/ResumeCard.jsx
import React from "react";
import { FaPlay, FaClock, FaBookOpen, FaPercentage } from "react-icons/fa";

const ResumeCard = () => {
  const currentCourse = {
    title: "Advanced React & Next.js",
    progress: 65,
    chapter: "Chapter 4: Server Components",
    timeLeft: "2.5 hours",
    lessons: "24/36 completed",
    instructor: "John Doe",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    nextLesson: "Building a Full-Stack App",
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 overflow-hidden hover:border-emerald-500/30 transition-colors">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="md:w-48 h-32 md:h-auto relative">
          <img
            src={currentCourse.thumbnail}
            alt="course"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                Continue Learning
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {currentCourse.title}
              </h3>
            </div>
            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
              <FaPlay className="text-sm" />
              <span>Resume</span>
            </button>
          </div>

          <p className="text-zinc-400 text-sm mb-3">{currentCourse.chapter}</p>

          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Course Progress</span>
              <span className="text-white font-medium">
                {currentCourse.progress}%
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                style={{ width: `${currentCourse.progress}%` }}
              />
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <FaClock /> {currentCourse.timeLeft} left
            </span>
            <span className="flex items-center gap-1">
              <FaBookOpen /> {currentCourse.lessons}
            </span>
            <span className="flex items-center gap-1">
              <FaPercentage /> Next: {currentCourse.nextLesson}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
