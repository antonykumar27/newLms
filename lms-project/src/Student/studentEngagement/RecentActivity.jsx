// components/RecentActivity.jsx
import React from "react";
import { FaBook, FaCode, FaCheckCircle, FaClock } from "react-icons/fa";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "course",
      title: "Completed React Hooks",
      course: "Advanced React",
      time: "2 hours ago",
      icon: FaCode,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      id: 2,
      type: "quiz",
      title: "Scored 95% on JavaScript Quiz",
      course: "JavaScript Fundamentals",
      time: "5 hours ago",
      icon: FaCheckCircle,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      id: 3,
      type: "lesson",
      title: "Started Node.js Basics",
      course: "Backend Development",
      time: "yesterday",
      icon: FaBook,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      id: 4,
      type: "achievement",
      title: 'Earned "7 Day Streak" Badge',
      course: "",
      time: "yesterday",
      icon: FaClock,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
      <h3 className="font-bold text-white mb-6">Recent Activity</h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center flex-shrink-0`}
            >
              <activity.icon className={activity.color} />
            </div>

            <div className="flex-1">
              <p className="text-white text-sm font-medium">{activity.title}</p>
              {activity.course && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {activity.course}
                </p>
              )}
              <p className="text-xs text-zinc-600 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-center text-sm text-zinc-400 hover:text-white py-2 transition-colors">
        View All Activity →
      </button>
    </div>
  );
};

export default RecentActivity;
