// components/WelcomeCard.jsx
import React from "react";
import { useDashboard } from "./DashboardContext";
import { FaWaveSquare } from "react-icons/fa";

const WelcomeCard = () => {
  const { user } = useDashboard();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-8 border border-zinc-700/50">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <FaWaveSquare />
            <span className="text-sm uppercase tracking-wider">
              {greeting()}
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            {user.name}! 👋
          </h2>
          <p className="text-zinc-400 max-w-xl">
            You're on a{" "}
            <span className="text-emerald-400 font-semibold">
              12-day streak
            </span>
            . Keep up the momentum! Your next milestone is just around the
            corner.
          </p>
        </div>

        <div className="hidden md:block text-right">
          <p className="text-sm text-zinc-500">{user.title}</p>
          <p className="text-2xl font-bold text-white">Level {user.level}</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
