// components/TodayGoal.jsx
import React, { useState } from "react";
import { CheckCircle2, Circle, Target, Sparkles } from "lucide-react";

const TodayGoal = ({ goals }) => {
  const [checked, setChecked] = useState(goals.map(() => false));
  const [showConfetti, setShowConfetti] = useState(false);

  const toggleGoal = (index) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);

    // Check if all goals completed
    if (
      newChecked.every((v) => v === true) &&
      !checked.every((v) => v === true)
    ) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const completedCount = checked.filter(Boolean).length;
  const progress = (completedCount / goals.length) * 100;

  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-lg font-semibold">
              Today's Goal
            </span>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
        </div>

        {/* Progress to today's goal */}
        <div className="mb-4">
          <div className="flex justify-between text-white/80 text-sm mb-1">
            <span>Daily progress</span>
            <span>
              {completedCount}/{goals.length}
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.map((goal, index) => (
            <button
              key={index}
              onClick={() => toggleGoal(index)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all group"
            >
              {checked[index] ? (
                <CheckCircle2 className="w-6 h-6 text-green-300 animate-scale" />
              ) : (
                <Circle className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
              )}
              <span
                className={`text-white flex-1 text-left ${checked[index] ? "line-through opacity-70" : ""}`}
              >
                {goal.text}
              </span>
              {!checked[index] && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  +10 pts
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Start Button */}
        <button className="w-full mt-4 bg-white text-emerald-600 font-semibold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
          <span>Start Learning</span>
          <Target className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TodayGoal;
