// components/QuizCard.jsx
import React from "react";
import { Brain, TrendingUp, CheckCircle, XCircle } from "lucide-react";

const QuizCard = ({ lastQuiz, score, trend, passed }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl group-hover:scale-110 transition-transform">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold dark:text-white">Last Quiz</h3>
            <p className="text-sm text-gray-500">{lastQuiz}</p>
          </div>
        </div>
        {passed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold dark:text-white">{score}%</div>
          <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
            <TrendingUp className="w-4 h-4" />
            <span>{trend} from last</span>
          </div>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-purple-700 transition-colors">
          Try Quiz
        </button>
      </div>

      {/* Performance Bar */}
      <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-green-500"
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizCard;
