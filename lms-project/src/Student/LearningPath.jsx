// components/LearningPath.jsx
import React, { useState } from "react";
import {
  CheckCircleIcon,
  LockClosedIcon,
  PlayCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  AcademicCapIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

const LearningPath = ({ data = {}, onNodeClick }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  const {
    nodes = [],
    edges = [],
    currentNode = null,
    progress = 0,
    estimatedCompletion = null,
    recommendations = [],
  } = data;

  if (!nodes || nodes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
        <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Learning Path Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start learning to generate your personalized path
        </p>
      </div>
    );
  }

  const getNodeIcon = (type) => {
    switch (type) {
      case "video":
        return PlayCircleIcon;
      case "quiz":
        return AcademicCapIcon;
      case "milestone":
        return SparklesIcon;
      default:
        return AcademicCapIcon;
    }
  };

  const getNodeStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "current":
        return "text-blue-500";
      case "locked":
        return "text-gray-400";
      default:
        return "text-gray-300";
    }
  };

  const getNodeBgColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/30";
      case "current":
        return "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500";
      case "locked":
        return "bg-gray-100 dark:bg-gray-700";
      default:
        return "bg-white dark:bg-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Your Learning Journey</h2>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {progress}% Complete
          </span>
        </div>

        <div className="w-full bg-white/30 rounded-full h-2 mb-4">
          <div
            className="bg-white h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {estimatedCompletion && (
          <div className="flex items-center text-sm">
            <ClockIcon className="h-4 w-4 mr-1" />
            Estimated completion:{" "}
            {new Date(estimatedCompletion).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Learning Path Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm overflow-x-auto">
        <div className="relative min-w-max py-8">
          {/* Path Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2" />

          {/* Nodes */}
          <div className="relative flex items-center justify-around">
            {nodes.map((node, index) => {
              const NodeIcon = getNodeIcon(node.type);
              const isSelected = selectedNode === node.id;

              return (
                <div
                  key={node.id}
                  className="relative flex flex-col items-center"
                >
                  {/* Node Connection Line Progress */}
                  {index < nodes.length - 1 && node.status === "completed" && (
                    <div
                      className="absolute top-1/2 left-1/2 h-0.5 bg-green-500 transform -translate-y-1/2"
                      style={{ width: "100%" }}
                    />
                  )}

                  {/* Node */}
                  <button
                    onClick={() => {
                      setSelectedNode(node.id);
                      onNodeClick?.(node.id);
                    }}
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${getNodeBgColor(node.status)}`}
                    disabled={node.status === "locked"}
                  >
                    {node.status === "completed" ? (
                      <CheckCircleSolid
                        className={`h-6 w-6 ${getNodeStatusColor(node.status)}`}
                      />
                    ) : (
                      <NodeIcon
                        className={`h-6 w-6 ${getNodeStatusColor(node.status)}`}
                      />
                    )}

                    {node.status === "locked" && (
                      <LockClosedIcon className="absolute -bottom-1 -right-1 h-4 w-4 text-gray-400 bg-white dark:bg-gray-800 rounded-full p-0.5" />
                    )}
                  </button>

                  {/* Node Label */}
                  <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] text-center">
                    {node.title}
                  </p>

                  {/* Node Type */}
                  <span className="mt-1 text-[10px] text-gray-500">
                    {node.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          {nodes
            .filter((n) => n.id === selectedNode)
            .map((node) => (
              <div key={node.id}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {node.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {node.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {node.type}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {node.duration || "N/A"}
                    </p>
                  </div>
                </div>

                {node.prerequisites && node.prerequisites.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prerequisites:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {node.prerequisites.map((preq, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 dark:text-gray-400"
                        >
                          {preq}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recommended Next Steps
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <SparklesIcon className="h-5 w-5 text-yellow-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {rec.title}
                  </p>
                  <p className="text-xs text-gray-500">{rec.reason}</p>
                </div>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPath;
