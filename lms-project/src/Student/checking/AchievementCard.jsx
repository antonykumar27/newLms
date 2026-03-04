// components/AchievementCard.jsx
import React from "react";
import { Award, Trophy, Star, ChevronRight } from "lucide-react";

const AchievementCard = ({ recent, next, daysToGo }) => {
  return (
    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      {/* Floating Icons */}
      <Trophy className="absolute -right-5 -top-5 w-20 h-20 text-yellow-300 opacity-20 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
      <Award className="absolute -left-5 -bottom-5 w-16 h-16 text-yellow-300 opacity-20 -rotate-12 group-hover:-rotate-45 transition-transform duration-700" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-6 h-6 text-yellow-300 fill-current animate-pulse" />
          <h3 className="text-white font-semibold">Achievements</h3>
        </div>

        {/* Recent Badge */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3">
          <div className="text-white/80 text-xs mb-1">Recently earned</div>
          <div className="text-white font-medium flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            {recent}
          </div>
        </div>

        {/* Next Milestone */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <div className="text-white/80 text-xs mb-1">Next milestone</div>
          <div className="text-white font-medium mb-2">{next}</div>
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">{daysToGo} days to go</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: `${daysToGo > 0 ? ((8 - daysToGo) / 8) * 100 : 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
