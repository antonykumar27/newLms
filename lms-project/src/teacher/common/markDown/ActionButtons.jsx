// components/ActionButtons.js

import React from "react";

const ActionButtons = ({
  isLoading,
  onSave,
  onClear,
  onSample,
  onTogglePreview,
  isPreview,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-2"
          onClick={onSample}
        >
          <span>📋</span> സാമ്പിൾ
        </button>
        <button
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center gap-2"
          onClick={onTogglePreview}
        >
          <span>{isPreview ? "✏️" : "👁️"}</span>
          {isPreview ? "എഡിറ്റ്" : "പ്രിവ്യൂ"}
        </button>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
          onClick={onClear}
        >
          <span>🗑️</span> മായ്ക്കുക
        </button>
      </div>

      <button
        className="save-btn flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? <SavingSpinner /> : <SaveButtonContent />}
      </button>
    </div>
  );
};

const SavingSpinner = () => (
  <>
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    സേവിംഗ്...
  </>
);

const SaveButtonContent = () => (
  <>
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
    പാഠപുസ്തകം സേവ് ചെയ്യുക
  </>
);

export default ActionButtons;
