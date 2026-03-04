// components/EditorToolbar.js

import React from "react";
import {
  SNIPPETS,
  SAMPLE_CONTENT,
  MARKDOWN_COMPONENTS,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "./snippets";

const ToolbarButton = ({
  snippet,
  onClick,
  bgColor,
  hoverColor,
  borderColor,
  textColor,
}) => (
  <button
    className={`px-3 py-2 bg-white hover:${bgColor} border ${borderColor} rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2`}
    onClick={() => onClick(snippet.code)}
    title={snippet.label}
  >
    <span className={`text-lg ${textColor}`}>{snippet.icon}</span>
    <span className={`text-sm ${textColor}`}>{snippet.label}</span>
  </button>
);

const ToolbarSection = ({
  title,
  snippets,
  category,
  onInsert,
  colorScheme,
}) => {
  const filteredSnippets = snippets.filter((s) => s.category === category);
  if (filteredSnippets.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-2">{title}:</p>
      <div className="flex flex-wrap gap-2">
        {filteredSnippets.map((snippet, index) => (
          <ToolbarButton
            key={index}
            snippet={snippet}
            onClick={onInsert}
            {...colorScheme}
          />
        ))}
      </div>
    </div>
  );
};

const EditorToolbar = ({ onInsert }) => {
  const colorSchemes = {
    headings: {
      bgColor: "hover:bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
    },
    math: {
      bgColor: "hover:bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
    },
    formatting: {
      bgColor: "hover:bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
    },
    mermaid: {
      bgColor: "hover:bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
    },
  };

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        ⚡ വേഗത്തിൽ ചേർക്കുക:
      </h3>

      <div className="space-y-3">
        <ToolbarSection
          title="Headings"
          snippets={SNIPPETS}
          category="headings"
          onInsert={onInsert}
          colorScheme={colorSchemes.headings}
        />

        <ToolbarSection
          title="Math"
          snippets={SNIPPETS}
          category="math"
          onInsert={onInsert}
          colorScheme={colorSchemes.math}
        />

        <ToolbarSection
          title="Formatting"
          snippets={SNIPPETS}
          category="formatting"
          onInsert={onInsert}
          colorScheme={colorSchemes.formatting}
        />

        <ToolbarSection
          title="Mermaid Diagrams"
          snippets={SNIPPETS}
          category="mermaid"
          onInsert={onInsert}
          colorScheme={colorSchemes.mermaid}
        />
      </div>
    </div>
  );
};

export default EditorToolbar;
