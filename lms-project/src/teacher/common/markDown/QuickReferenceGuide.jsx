// components/QuickReferenceGuide.js

import React from "react";

const QuickReferenceGuide = () => {
  const sections = [
    {
      title: "📖 ഘടന",
      icon: "📖",
      items: [
        { code: "#", label: "പ്രധാന ഹെഡിംഗ്" },
        { code: "##", label: "ഉപഹെഡിംഗ്" },
        { code: "###", label: "ചെറിയ ഹെഡിംഗ്" },
      ],
    },
    {
      title: "∫ ഗണിതം",
      icon: "∫",
      items: [
        { code: "\\(...\\)", label: "ഇൻലൈൻ സമവാക്യം" },
        { code: "$$...$$", label: "ഡിസ്പ്ലേ സമവാക്യം" },
        { code: "\\frac{}{}", label: "ഭിന്നസംഖ്യ" },
      ],
    },
    {
      title: "📊 Mermaid",
      icon: "📊",
      items: [
        { code: "```mermaid", label: "ഡയഗ്രം തുടങ്ങുക" },
        { code: "graph TD", label: "ഫ്ലോചാർട്ട്" },
        { code: "A-->B", label: "കണക്ഷൻ" },
      ],
    },
    {
      title: "🎨 ഫോർമാറ്റ്",
      icon: "🎨",
      items: [
        { code: "**text**", label: "ബോൾഡ്" },
        { code: "*text*", label: "ഇറ്റാലിക്" },
        { code: "![alt](img)", label: "ചിത്രം" },
      ],
    },
  ];

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>📖</span> പാഠപുസ്തക എഴുതാം (സങ്കേതം)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h4 className="font-bold text-gray-700 mb-2">{section.title}</h4>
            <div className="space-y-2 text-sm">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-start gap-2">
                  <code className="bg-white px-2 py-1 rounded border border-cyan-200 text-cyan-700 font-mono text-xs">
                    {item.code}
                  </code>
                  <span className="text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickReferenceGuide;
