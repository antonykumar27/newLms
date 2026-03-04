// components/ContentPreview.js

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import MermaidRenderer from "./MermaidRenderer";
import { extractMermaidCharts } from "./mermaidUtils";
import { MARKDOWN_COMPONENTS } from "./snippets";

const ContentPreview = ({ content, uploadedImages }) => {
  const contentParts = extractMermaidCharts(content);

  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200 min-h-[400px]">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          📖 പാഠപുസ്തക പ്രിവ്യൂ
        </span>
        <span className="text-gray-500 text-sm">
          ഇതാണ് വിദ്യാർത്ഥികൾക്ക് കാണാൻ കിട്ടുന്നത്
        </span>
        {uploadedImages.length > 0 && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            📁 {uploadedImages.length} ചിത്രങ്ങൾ
          </span>
        )}
      </div>

      <div className="prose prose-lg max-w-none p-6 bg-white rounded-lg shadow-inner">
        {contentParts.length > 0 ? (
          contentParts.map((part, index) => {
            if (part.type === "mermaid") {
              return <MermaidRenderer key={index} chart={part.content} />;
            } else {
              return (
                <ReactMarkdown
                  key={index}
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={MARKDOWN_COMPONENTS}
                >
                  {part.content}
                </ReactMarkdown>
              );
            }
          })
        ) : (
          <p className="text-gray-400 text-center py-8">
            ഉള്ളടക്കം ഇല്ല. എഡിറ്റ് ബട്ടൺ അമർത്തി എഴുതുക.
          </p>
        )}
      </div>
    </div>
  );
};

export default ContentPreview;
