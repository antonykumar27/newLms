// utils/mermaidUtils.js

/**
 * Extracts mermaid code blocks from markdown content
 * @param {string} content - Markdown content
 * @returns {Array} Array of content parts with type and content
 */
export const extractMermaidCharts = (content) => {
  const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mermaidRegex.exec(content)) !== null) {
    // Add text before mermaid
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex, match.index),
      });
    }

    // Add mermaid chart
    parts.push({
      type: "mermaid",
      content: match[1].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.substring(lastIndex),
    });
  }

  return parts;
};

/**
 * Removes mermaid code blocks from content (for preview without rendering)
 * @param {string} content - Markdown content
 * @returns {string} Content without mermaid blocks
 */
export const removeMermaidBlocks = (content) => {
  return content.replace(/```mermaid\s*[\s\S]*?```/g, "[Mermaid Diagram]");
};
