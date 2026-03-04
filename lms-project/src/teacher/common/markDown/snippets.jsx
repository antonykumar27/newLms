// constants/snippets.js
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
export const SNIPPETS = [
  // Headings
  { code: "# ", label: "H1 Heading", icon: "H1", category: "headings" },
  { code: "## ", label: "H2 Heading", icon: "H2", category: "headings" },
  { code: "### ", label: "H3 Heading", icon: "H3", category: "headings" },
  { code: "#### ", label: "H4 Heading", icon: "H4", category: "headings" },
  { code: "##### ", label: "H5 Heading", icon: "H5", category: "headings" },
  { code: "###### ", label: "H6 Heading", icon: "H6", category: "headings" },

  // Math snippets
  {
    code: "$\n\\frac{a}{b}\n$",
    label: "ഭിന്നസംഖ്യ",
    icon: "½",
    category: "math",
  },
  { code: "$\nx^{2}\n$", label: "വർഗം", icon: "x²", category: "math" },
  { code: "$\n\\sqrt{x}\n$", label: "വർഗമൂലം", icon: "√", category: "math" },
  {
    code: "$$\n\\sum_{i=1}^{n} i\n$$",
    label: "സംഗ്രഹം",
    icon: "∑",
    category: "math",
  },
  {
    code: "$$\n\\int_{a}^{b} f(x)\\,dx\n$$",
    label: "ഇന്റഗ്രൽ",
    icon: "∫",
    category: "math",
  },
  {
    code: "$$\n\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$",
    label: "Quadratic",
    icon: "🔢",
    category: "math",
  },

  // Formatting
  { code: "**bold text**", label: "Bold", icon: "𝐁", category: "formatting" },
  { code: "*italic text*", label: "Italic", icon: "𝐼", category: "formatting" },
  { code: "- List item", label: "List", icon: "•", category: "formatting" },
  {
    code: "1. Numbered",
    label: "Numbered List",
    icon: "1.",
    category: "formatting",
  },
  { code: "> Quote", label: "Quote", icon: "❝", category: "formatting" },

  // Mermaid snippets
  {
    code: "```mermaid\ngraph TD\n    A[2 cm] --> B[3 cm]\n    B --> C[2 cm]\n    C --> D[3 cm]\n    D --> A\n    style A fill:#e1f5fe,stroke:#01579B,stroke-width:2px\n    style B fill:#e1f5fe,stroke:#01579B,stroke-width:2px\n    style C fill:#e1f5fe,stroke:#01579B,stroke-width:2px\n    style D fill:#e1f5fe,stroke:#01579B,stroke-width:2px\n```\n",
    label: "Rectangle 2:3",
    icon: "⬛",
    category: "mermaid",
  },
  {
    code: "```mermaid\ngraph TD\n    subgraph Rectangle [2 : 3 Ratio]\n        A[Height: 2k] --> B[Width: 3k]\n        B --> C[Height: 2k]\n        C --> D[Width: 3k]\n        D --> A\n    end\n    style A fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n    style B fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n    style C fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n    style D fill:#4CAF50,stroke:#2E7D32,stroke-width:2px\n```\n",
    label: "Ratio Rectangle",
    icon: "📐",
    category: "mermaid",
  },
  // ... rest of mermaid snippets
];

export const SAMPLE_CONTENT = `# അനുപാതം - ചതുരങ്ങൾ

## 2 : 3 അനുപാതത്തിലുള്ള ചതുരം

2 cm ഉയരവും 3 cm വീതിയുമുള്ള ഒരു ചതുരം:

\`\`\`mermaid
graph TD
    A[2 cm] --> B[3 cm]
    B --> C[2 cm]
    C --> D[3 cm]
    D --> A
    style A fill:#e1f5fe,stroke:#01579B,stroke-width:2px
    style B fill:#e1f5fe,stroke:#01579B,stroke-width:2px
    style C fill:#e1f5fe,stroke:#01579B,stroke-width:2px
    style D fill:#e1f5fe,stroke:#01579B,stroke-width:2px
\`\`\`

**അനുപാതം:** ഉയരം : വീതി = 2 : 3

## 4 cm × 6 cm ചതുരം

\`\`\`mermaid
graph LR
    A[4 cm] --> B[6 cm]
    B --> C[4 cm]
    C --> D[6 cm]
    D --> A
    style A fill:#FFB6C1,stroke:#FF1493,stroke-width:2px
    style B fill:#FFB6C1,stroke:#FF1493,stroke-width:2px
    style C fill:#FFB6C1,stroke:#FF1493,stroke-width:2px
    style D fill:#FFB6C1,stroke:#FF1493,stroke-width:2px
\`\`\`

**അനുപാതം:** 4 : 6 = 2 : 3

## രണ്ട് ചതുരങ്ങൾ താരതമ്യം

\`\`\`mermaid
graph TD
    subgraph Rectangle1 [Rectangle 1: 2cm x 3cm]
        A[2 cm] --> B[3 cm]
        B --> C[2 cm]
        C --> D[3 cm]
        D --> A
    end
    
    subgraph Rectangle2 [Rectangle 2: 4cm x 6cm]
        E[4 cm] --> F[6 cm]
        F --> G[4 cm]
        G --> H[6 cm]
        H --> E
    end
    
    style A fill:#FFD700,stroke:#B8860B,stroke-width:2px
    style B fill:#FFD700,stroke:#B8860B,stroke-width:2px
    style C fill:#FFD700,stroke:#B8860B,stroke-width:2px
    style D fill:#FFD700,stroke:#B8860B,stroke-width:2px
    style E fill:#98FB98,stroke:#006400,stroke-width:2px
    style F fill:#98FB98,stroke:#006400,stroke-width:2px
    style G fill:#98FB98,stroke:#006400,stroke-width:2px
    style H fill:#98FB98,stroke:#006400,stroke-width:2px
\`\`\`

രണ്ട് ചതുരങ്ങൾക്കും **ഒരേ അനുപാതം** (2 : 3) ആണ്.

## ഗണിത സമവാക്യങ്ങൾ

അനുപാതം കണ്ടെത്താൻ:

$$ \\frac{\\text{ഉയരം}}{\\text{വീതി}} = \\frac{2}{3} $$

$$ h = \\frac{2}{3} \\times w $$

$$ h : w = 2 : 3 $$`;

export const MARKDOWN_COMPONENTS = {
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
  img: ({ node, ...props }) => (
    <div className="my-4">
      <img
        {...props}
        className="max-w-full h-auto rounded-lg shadow-md mx-auto"
      />
      {props.alt && props.alt !== props.src && (
        <p className="text-center text-gray-600 text-sm mt-2 italic">
          {props.alt}
        </p>
      )}
    </div>
  ),
  h1: ({ node, ...props }) => (
    <h1
      className="text-3xl font-bold text-gray-900 mt-6 mb-4 pb-2 border-b-2 border-blue-200"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h2
      className="text-2xl font-bold text-gray-800 mt-5 mb-3 pb-2 border-b border-blue-100"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="text-gray-700 leading-relaxed my-3" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-4 border-blue-400 pl-4 italic text-gray-600 my-4 bg-blue-50 py-2 rounded-r"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-5 my-3 space-y-1" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-5 my-3 space-y-1" {...props} />
  ),
};

// Image validation constants
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
