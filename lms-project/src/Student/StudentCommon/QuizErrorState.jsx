import React from "react";
import { AlertCircle, BookOpen } from "lucide-react";

const QuizErrorState = ({ quizError, onRetry, onCancel }) => {
  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 text-center mt-10">
      <div className="relative inline-block mb-4">
        <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
        <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
          <BookOpen className="h-6 w-6 text-red-400" />
        </div>
      </div>
      <div className="text-red-700 font-bold text-2xl mb-3">
        Quiz Unavailable
      </div>
      <p className="text-red-600 mb-6 text-lg">
        {quizError?.data?.message ||
          "Unable to load the quiz. Please try again later."}
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => onRetry()}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md flex items-center"
        >
          Retry Loading
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizErrorState;
