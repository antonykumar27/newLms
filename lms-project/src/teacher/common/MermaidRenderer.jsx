// MermaidRenderer.js
import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

// Mermaid കോൺഫിഗറേഷൻ
mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "system-ui, -apple-system, sans-serif",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
  },
  themeVariables: {
    background: "#ffffff",
    primaryColor: "#4CAF50",
    primaryTextColor: "#333",
    primaryBorderColor: "#2E7D32",
    lineColor: "#666",
    secondaryColor: "#2196F3",
    tertiaryColor: "#FF9800",
  },
});

const MermaidRenderer = ({ chart }) => {
  const mermaidRef = useRef(null);

  useEffect(() => {
    if (mermaidRef.current && chart) {
      // മുമ്പത്തെ ഡയഗ്രം നീക്കം ചെയ്യുക
      mermaidRef.current.innerHTML = "";

      // പുതിയ ഡയഗ്രം റെൻഡർ ചെയ്യുക
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        mermaid.render(id, chart).then((svgGraph) => {
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svgGraph.svg;
          }
        });
      } catch (error) {
        console.error("Mermaid render error:", error);
        mermaidRef.current.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded">
          ❌ ഡയഗ്രം റെൻഡർ ചെയ്യാനായില്ല: ${error.message}
        </div>`;
      }
    }
  }, [chart]);

  return (
    <div className="mermaid-wrapper my-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div
        ref={mermaidRef}
        className="mermaid-diagram flex justify-center"
      ></div>
    </div>
  );
};

export default MermaidRenderer;
