// components/QuizPerformance.jsx
import React from "react";
import { ChartBarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const QuizPerformance = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          No quiz data available
        </p>
      </div>
    );
  }

  // Calculate statistics
  const averageScore =
    data.reduce((acc, quiz) => acc + quiz.score, 0) / data.length;
  const bestScore = Math.max(...data.map((quiz) => quiz.score));
  const worstScore = Math.min(...data.map((quiz) => quiz.score));
  const trend =
    data.length >= 2
      ? (
          ((data[data.length - 1].score - data[0].score) / data[0].score) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {averageScore.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Best</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {bestScore}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Worst</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {worstScore}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Trend</p>
          <div className="flex items-center">
            <p
              className={`text-lg font-bold ${trend >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </p>
            <ArrowTrendingUpIcon
              className={`h-4 w-4 ml-1 ${trend >= 0 ? "text-green-600" : "text-red-600 rotate-180"}`}
            />
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="relative h-40 mt-4">
        <div className="absolute inset-0 flex items-end justify-between">
          {data.map((quiz, index) => (
            <div
              key={quiz.quizId || index}
              className="flex flex-col items-center w-8"
            >
              <div
                className={`w-6 rounded-t-lg ${
                  quiz.score >= 80
                    ? "bg-green-500"
                    : quiz.score >= 60
                      ? "bg-yellow-500"
                      : quiz.score >= 40
                        ? "bg-orange-500"
                        : "bg-red-500"
                }`}
                style={{ height: `${quiz.score}%`, minHeight: "4px" }}
              />
              <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                {new Date(quiz.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Quizzes List */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Recent Quizzes
        </h4>
        <div className="space-y-2">
          {data.slice(0, 5).map((quiz, index) => (
            <div
              key={quiz.quizId || index}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {quiz.title}
                </p>
                <p className="text-xs text-gray-500">
                  {quiz.subject} • {new Date(quiz.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quiz.score >= 80
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : quiz.score >= 60
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {quiz.score}%
                </span>
                <span className="text-xs text-gray-500">
                  {quiz.questionsCorrect}/{quiz.totalQuestions}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPerformance;
