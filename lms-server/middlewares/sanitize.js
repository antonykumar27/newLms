// middleware/sanitizeLessonContent.js

/**
 * Sanitizes regular text (for titles, subjects, descriptions)
 * Escapes HTML entities to prevent XSS
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== "string") return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .trim();
};

/**
 * STRICT SANITIZER: Only allows $$...$$ block math
 * Rejects inline math ($...$ and \(...\)) for consistency
 */
const sanitizeLessonContentStrict = (content) => {
  if (!content || typeof content !== "string") return "";

  // Normalize line endings
  let sanitized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Track protected blocks
  const protectedBlocks = [];
  const errors = [];

  // === STEP 1: Extract and protect LaTeX/math content ===
  // Protect $$...$$ blocks
  sanitized = sanitized.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    const id = `__PROTECTED_BLOCK_${protectedBlocks.length}__`;
    protectedBlocks.push({ id, content: match });
    return id;
  });

  // Protect \begin{}...\end{} environments
  sanitized = sanitized.replace(
    /\\begin\{([^}]+)\}[\s\S]*?\\end\{\1\}/g,
    (match) => {
      const id = `__PROTECTED_BLOCK_${protectedBlocks.length}__`;
      protectedBlocks.push({ id, content: match });
      return id;
    },
  );

  // Protect \includegraphics commands
  sanitized = sanitized.replace(
    /\\includegraphics(?:\[[^\]]*\])?\{[^}]*\}/g,
    (match) => {
      const id = `__PROTECTED_BLOCK_${protectedBlocks.length}__`;
      protectedBlocks.push({ id, content: match });
      return id;
    },
  );

  // Protect other LaTeX commands that might contain special chars
  // This protects things like \frac{a < b}{c > d}
  sanitized = sanitized.replace(/\\[a-zA-Z]+\{.*?\}/g, (match) => {
    // Check if this contains HTML special chars that shouldn't be escaped
    if (/[<>&]/.test(match)) {
      const id = `__PROTECTED_BLOCK_${protectedBlocks.length}__`;
      protectedBlocks.push({ id, content: match });
      return id;
    }
    return match;
  });

  // === STEP 2: Convert or remove inline math based on policy ===
  // POLICY: Convert all inline math to block math automatically
  sanitized = sanitized.replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, "$$$1$$");
  sanitized = sanitized.replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$$");
  sanitized = sanitized.replace(/\\\[([\s\S]*?)\\\]/g, "$$$1$$");

  // === STEP 3: Basic HTML escaping for the rest ===
  // Only escape HTML in non-LaTeX parts
  sanitized = sanitized
    .replace(/&(?!amp;|lt;|gt;|quot;|#39;|#x?[0-9a-fA-F]+;|#)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // === STEP 4: Restore protected blocks ===
  protectedBlocks.forEach(({ id, content }) => {
    sanitized = sanitized.replace(id, () => content);
  });

  // === STEP 5: Final validation ===
  const mathBlockCount = (sanitized.match(/\$\$/g) || []).length;
  if (mathBlockCount % 2 !== 0) {
    errors.push("Unmatched $$ delimiters detected");
  }

  // === STEP 6: Logging ===
  console.log("🧹 Sanitization Report:");
  console.log(`   Protected LaTeX blocks: ${protectedBlocks.length}`);
  if (errors.length > 0) {
    console.error("❌ Errors:", errors.join(", "));
  }

  return sanitized.trim();
};

/**
 * PERMISSIVE SANITIZER: Allows both inline and block math
 */
const sanitizeLessonContentPermissive = (content) => {
  if (!content || typeof content !== "string") return "";

  let sanitized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const protectedBlocks = [];

  // === STEP 1: Protect ALL math/LaTeX content ===
  // This regex captures all math environments
  const mathRegex =
    /(\$\$[\s\S]*?\$\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\})/g;

  sanitized = sanitized.replace(mathRegex, (match) => {
    const id = `__MATH_BLOCK_${protectedBlocks.length}__`;
    protectedBlocks.push({ id, content: match });
    return id;
  });

  // Also protect standalone LaTeX commands
  sanitized = sanitized.replace(
    /\\[a-zA-Z]+(?:\{[^}]*\}(?:\{[^}]*\})?)?/g,
    (match) => {
      // Only protect if not already protected
      if (!match.startsWith("__MATH_BLOCK_")) {
        const id = `__MATH_BLOCK_${protectedBlocks.length}__`;
        protectedBlocks.push({ id, content: match });
        return id;
      }
      return match;
    },
  );

  // === STEP 2: HTML escape everything else ===
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // === STEP 3: Restore protected content ===
  protectedBlocks.forEach(({ id, content }) => {
    sanitized = sanitized.replace(id, () => content);
  });

  return sanitized.trim();
};

/**
 * MIGRATION HELPER: Auto-converts inline math to block math
 */
const convertInlineToBlockMath = (content) => {
  if (!content) return content;

  let converted = content;

  // Convert \(...\) to $$...$$
  converted = converted.replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$$");

  // Convert $...$ to $$...$$ (but not $$...$$)
  converted = converted.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, "$$$1$$");

  // Convert \[...\] to $$...$$
  converted = converted.replace(/\\\[([\s\S]*?)\\\]/g, "$$$1$$");

  return converted;
};

/**
 * VALIDATION: Check if content contains unsupported inline math
 */
const validateMathContent = (content) => {
  const warnings = [];

  // Check for inline $...$ (single dollar signs)
  const inlineSingleDollars = (
    content.match(/(?<!\\)\$(?!\$)([^$\n]*?)(?<!\\)\$(?!\$)/g) || []
  ).length;
  if (inlineSingleDollars > 0) {
    warnings.push(`Contains ${inlineSingleDollars} inline $...$ math blocks`);
  }

  // Check for \(...\)
  const inlineBrackets = (content.match(/\\\([\s\S]*?\\\)/g) || []).length;
  if (inlineBrackets > 0) {
    warnings.push(`Contains ${inlineBrackets} \\(...\\) math blocks`);
  }

  // Check for unmatched delimiters
  const dollarCount = (content.match(/\$\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    warnings.push(`Uneven number of $$ pairs (${dollarCount})`);
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    hasMath: (content.match(/\$\$|\\\(|\\\[|\\begin\{/) || []).length > 0,
  };
};

module.exports = {
  sanitizeText,
  sanitizeLessonContent: sanitizeLessonContentStrict, // Default to strict
  sanitizeLessonContentStrict,
  sanitizeLessonContentPermissive,
  convertInlineToBlockMath,
  validateMathContent,
};
