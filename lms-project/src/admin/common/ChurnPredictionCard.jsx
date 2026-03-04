// components/ChurnPredictionCard.jsx
import React from "react";
import { FiAlertTriangle, FiTrendingDown, FiShield } from "react-icons/fi";

const ChurnPredictionCard = ({ churnData }) => {
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FiTrendingDown className="text-red-400" />
        Churn Prediction
      </h3>

      <div className="space-y-4">
        {/* Risk Level */}
        <div
          className={`p-4 rounded-xl border ${getRiskColor(churnData?.risk)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Risk Level</span>
            <span className="font-bold text-lg">{churnData?.risk}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                churnData?.risk === "High"
                  ? "bg-red-500"
                  : churnData?.risk === "Medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${churnData?.probability || 0}%` }}
            ></div>
          </div>
          <p className="text-right text-sm mt-1 text-gray-400">
            {churnData?.probability}% probability
          </p>
        </div>

        {/* Risk Factors */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Risk Factors:</p>
          <ul className="space-y-2">
            {churnData?.factors?.map((factor, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <FiAlertTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Action */}
        <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-start gap-3">
            <FiShield className="text-blue-400 text-xl" />
            <div>
              <p className="text-sm text-gray-400 mb-1">Recommended Action</p>
              <p className="text-white font-medium">
                {churnData?.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurnPredictionCard;
