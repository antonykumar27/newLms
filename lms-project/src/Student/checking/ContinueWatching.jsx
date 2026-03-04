// components/ContinueWatching.jsx
import React from "react";
import { Play, Clock, MoreVertical } from "lucide-react";

const videos = [
  {
    id: 1,
    title: "Chapter 2: Cell Structure",
    progress: 30,
    thumbnail:
      "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=200",
    duration: "15:30",
    subject: "Biology",
  },
  {
    id: 2,
    title: "Chapter 5: Genetics Basics",
    progress: 60,
    thumbnail:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200",
    duration: "22:15",
    subject: "Biology",
  },
  {
    id: 3,
    title: "Chapter 7: Evolution Theory",
    progress: 15,
    thumbnail:
      "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=200",
    duration: "18:45",
    subject: "Biology",
  },
];

const ContinueWatching = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
        >
          {/* Thumbnail */}
          <div className="relative h-32 overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Play Button Overlay */}
            <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-purple-600 fill-current ml-0.5" />
              </div>
            </button>

            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {video.duration}
            </div>

            {/* Subject Tag */}
            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-lg">
              {video.subject}
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <h4 className="font-semibold text-sm mb-2 line-clamp-1 dark:text-white">
              {video.title}
            </h4>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{video.progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${video.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <button className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors">
                Continue
              </button>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContinueWatching;
