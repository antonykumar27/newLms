import React from "react";
import { BookOpen } from "lucide-react";

const QuizLoadingState = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="relative">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-indigo-500 mb-6"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-indigo-500" />
        </div>
      </div>
      <p className="text-slate-600 text-lg font-medium">Loading your quiz...</p>
      <p className="text-slate-500 text-sm mt-2">
        Preparing questions and content
      </p>
    </div>
  );
};

export default QuizLoadingState;
