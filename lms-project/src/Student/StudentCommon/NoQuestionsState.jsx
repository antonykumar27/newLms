import React from "react";
import { AlertCircle } from "lucide-react";

const NoQuestionsState = ({ onCancel }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        No Questions Available
      </h2>
      <p className="text-slate-600 mb-6">
        This quiz doesn't contain any questions yet.
      </p>
      <button
        onClick={onCancel}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default NoQuestionsState;
