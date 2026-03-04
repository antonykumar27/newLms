import React from "react";
import { Image as ImageIcon } from "lucide-react";

const OptionMediaDisplay = ({ optionImageUrl, optionIndex }) => {
  if (!optionImageUrl || !optionImageUrl.url) return null;

  return (
    <div className="ml-8 mt-2">
      <div className="relative inline-block">
        <img
          src={optionImageUrl.url}
          alt={`Option ${optionIndex + 1} Image`}
          className="max-h-40 rounded-lg border border-slate-300"
          loading="lazy"
        />
        <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <ImageIcon size={10} />
          Option {optionIndex + 1}
        </div>
      </div>
    </div>
  );
};

export default OptionMediaDisplay;
