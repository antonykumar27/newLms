// components/LeaderboardCard.jsx
import React from "react";
import { FaCrown, FaMedal, FaStar, FaArrowUp } from "react-icons/fa";

const LeaderboardCard = () => {
  const leaderboard = [
    {
      rank: 1,
      name: "Rahul",
      points: 5840,
      avatar: "https://i.pravatar.cc/150?img=1",
      change: "up",
    },
    {
      rank: 2,
      name: "Priya",
      points: 5720,
      avatar: "https://i.pravatar.cc/150?img=2",
      change: "same",
    },
    {
      rank: 3,
      name: "You",
      points: 5450,
      avatar: "https://i.pravatar.cc/150?img=7",
      change: "up",
      isUser: true,
    },
    {
      rank: 4,
      name: "Amal",
      points: 5210,
      avatar: "https://i.pravatar.cc/150?img=3",
      change: "down",
    },
    {
      rank: 5,
      name: "Neha",
      points: 4980,
      avatar: "https://i.pravatar.cc/150?img=4",
      change: "down",
    },
  ];

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-400" />;
    if (rank === 2) return <FaMedal className="text-zinc-400" />;
    if (rank === 3) return <FaMedal className="text-amber-600" />;
    return <span className="text-zinc-600 w-4 text-center">{rank}</span>;
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white flex items-center gap-2">
          <FaCrown className="text-yellow-400" />
          Leaderboard
        </h3>
        <span className="text-xs text-zinc-500">This Week</span>
      </div>

      <div className="space-y-3">
        {leaderboard.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
              user.isUser
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "hover:bg-zinc-800/50"
            }`}
          >
            <div className="w-6">{getRankIcon(user.rank)}</div>

            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />

            <div className="flex-1">
              <p
                className={`text-sm font-medium ${user.isUser ? "text-emerald-400" : "text-white"}`}
              >
                {user.name}
              </p>
              <p className="text-xs text-zinc-500">{user.points} XP</p>
            </div>

            {user.change === "up" && (
              <FaArrowUp className="text-emerald-400 text-xs" />
            )}
            {user.change === "down" && (
              <FaArrowUp className="text-red-400 text-xs rotate-180" />
            )}
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-center text-sm text-zinc-400 hover:text-white py-2 transition-colors">
        View Full Leaderboard →
      </button>
    </div>
  );
};

export default LeaderboardCard;
