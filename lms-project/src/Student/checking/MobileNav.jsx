// components/MobileNav.jsx
import React, { useState } from "react";
import { Home, BookOpen, BarChart3, Trophy, User, Plus } from "lucide-react";

const MobileNav = () => {
  const [active, setActive] = useState("home");

  return (
    <>
      {/* Desktop/Tablet - Hidden on mobile */}
      <div className="hidden md:block fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-6">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "learn", icon: BookOpen, label: "Learn" },
            { id: "stats", icon: BarChart3, label: "Stats" },
            { id: "achievements", icon: Trophy, label: "Achievements" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                active === item.id
                  ? "text-purple-600 dark:text-purple-400 scale-110"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile - Fixed Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: "home", icon: Home },
            { id: "learn", icon: BookOpen },
            { id: "stats", icon: BarChart3 },
            { id: "achievements", icon: Trophy },
            { id: "profile", icon: User },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`p-3 rounded-xl transition-all ${
                active === item.id
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  : "text-gray-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      {/* FAB for quick action (mobile) */}
      <button className="md:hidden fixed bottom-20 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
};

export default MobileNav;
