// utils/markdownUtils.js

/**
 * Inserts text at cursor position in textarea
 * @param {Object} textareaRef - React ref object for textarea
 * @param {string} content - Current content
 * @param {string} textToInsert - Text to insert
 * @param {Function} setContent - State setter for content
 */
export const insertAtCursor = (
  textareaRef,
  content,
  textToInsert,
  setContent,
) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const newContent =
    content.substring(0, start) + textToInsert + content.substring(end);

  setContent(newContent);

  setTimeout(() => {
    textarea.focus();
    const cursorPos = start + textToInsert.length;
    textarea.setSelectionRange(cursorPos, cursorPos);
  }, 10);
};

/**
 * Removes image markdown from content
 * @param {string} content - Current content
 * @param {string} imageName - Name of image to remove
 * @returns {string} Updated content
 */
export const removeImageMarkdown = (content, imageName) => {
  const regex = new RegExp(`!\\[${imageName}\\]\\(${imageName}\\)\\s*`, "g");
  return content.replace(regex, "");
};
