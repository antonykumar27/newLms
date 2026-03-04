// src/teacher/common/markDown/MermaidRenderer.jsx

import React, { useEffect, useRef, useState } from "react";

const MermaidRenderer = ({ chart }) => {
  const [svg, setSvg] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mermaidRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const renderMermaid = async () => {
      try {
        // Dynamically import mermaid to avoid SSR issues
        const mermaid = (await import("mermaid")).default;

        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "inherit",
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
          },
          sequence: {
            useMaxWidth: true,
            showSequenceNumbers: false,
          },
          gantt: {
            useMaxWidth: true,
          },
        });

        // Generate a unique ID for this chart
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Render the chart
        const { svg } = await mermaid.render(id, chart);

        if (isMounted) {
          setSvg(svg);
          setError(null);
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        if (isMounted) {
          setError(err.message || "Failed to render diagram");
          setSvg(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (chart && chart.trim()) {
      renderMermaid();
    } else {
      setIsLoading(false);
      setError("No diagram content provided");
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
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
          <span className="text-gray-600">വരയ്ക്കുന്നു...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg
            className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-red-700 font-medium">Diagram Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <pre className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 overflow-x-auto">
              {chart}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (!svg) {
    return null;
  }

  return (
    <div className="my-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div
        ref={mermaidRef}
        className="mermaid-chart overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {chart.includes("graph") && (
        <p className="text-center text-xs text-gray-500 mt-2">
          ⬆️ മുകളിലെ ഡയഗ്രം ശ്രദ്ധിക്കുക
        </p>
      )}
    </div>
  );
};

export default MermaidRenderer;
