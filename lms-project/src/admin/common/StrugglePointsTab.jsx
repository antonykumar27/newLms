// components/tabs/StrugglePointsTab.jsx
import React, { useState } from "react";
import {
  FiAlertTriangle,
  FiAlertCircle,
  FiRefreshCw,
  FiSkipForward,
  FiPauseCircle,
  FiHelpCircle,
  FiChevronRight,
} from "react-icons/fi";

const StrugglePointsTab = ({ profile }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const strugglePoints = profile?.struggleIndicators?.points || [];
  const needsHelp = profile?.struggleIndicators?.needsHelp;

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case "rewind":
        return <FiRefreshCw className="text-yellow-400" />;
      case "skip":
        return <FiSkipForward className="text-blue-400" />;
      case "pause":
        return <FiPauseCircle className="text-purple-400" />;
      default:
        return <FiAlertCircle className="text-red-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Warning Banner */}
      {needsHelp && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <FiAlertTriangle className="text-red-400 text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                ⚠️ Intervention Recommended
              </h3>
              <p className="text-gray-300">
                This student is showing significant struggle patterns. Consider
                providing additional support or resources.
              </p>
              <button className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all duration-300 flex items-center gap-2">
                <FiHelpCircle />
                Assign Tutor
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Struggle Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strugglePoints.map((point, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-xl p-6 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedPoint(point)}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {getActionIcon(point.action)}
                </div>
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm border border-yellow-500/20">
                  {point.count}x
                </span>
              </div>

              <h4 className="text-lg font-semibold text-white mb-2">
                At {point.timeInVideo}
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Action: <span className="text-yellow-400">{point.action}</span>
              </p>
              <p className="text-sm text-gray-300 bg-gray-700/30 p-3 rounded-xl">
                💡 {point.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Point Modal */}
      {selectedPoint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Struggle Point Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                {getActionIcon(selectedPoint.action)}
                <div>
                  <p className="text-sm text-gray-400">Action</p>
                  <p className="text-white font-semibold">
                    {selectedPoint.action}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                <FiClock className="text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Time in Video</p>
                  <p className="text-white font-semibold">
                    {selectedPoint.timeInVideo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                <FiAlertCircle className="text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Frequency</p>
                  <p className="text-white font-semibold">
                    {selectedPoint.count} times
                  </p>
                </div>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-xl">
                <p className="text-yellow-400 font-medium mb-2">
                  Recommendation
                </p>
                <p className="text-gray-300">{selectedPoint.recommendation}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrugglePointsTab;
