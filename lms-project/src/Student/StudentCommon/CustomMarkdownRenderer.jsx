import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

const CustomMarkdownRenderer = ({ content }) => {
  if (!content) return null;

  const processedContent =
    typeof content === "string" ? content.replace(/^#\s*/, "") : content;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        img({ src, alt }) {
          const imageUrl = src?.startsWith("http")
            ? src
            : `${process.env.REACT_APP_API_URL || ""}${src}`;
          return (
            <div className="my-4">
              <img
                src={imageUrl}
                alt={alt || "Content image"}
                className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
                loading="lazy"
              />
              {alt && (
                <p className="text-sm text-slate-500 text-center mt-2">{alt}</p>
              )}
            </div>
          );
        },
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-slate-800 mt-6 mb-4">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-slate-800 mt-5 mb-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold text-slate-700 mt-3 mb-2">
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-sm font-medium text-slate-700 mt-2 mb-1">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-xs font-medium text-slate-600 mt-2 mb-1">
            {children}
          </h6>
        ),
        p: ({ children }) => (
          <p className="text-slate-700 mb-3 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-slate-700 mb-1">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-3 italic text-slate-600 bg-indigo-50 rounded-r">
            {children}
          </blockquote>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default CustomMarkdownRenderer;
