import React from "react";
import { Image as ImageIcon } from "lucide-react";

const QuestionMediaDisplay = ({
  questionImageUrl,
  title = "Question Image",
}) => {
  if (!questionImageUrl || !questionImageUrl.url) return null;

  return (
    <div className="mt-4 mb-6">
      <div className="relative group">
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <img
            src={questionImageUrl.url}
            alt={title}
            className="w-full h-auto max-h-[350px] object-contain"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <ImageIcon size={10} />
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionMediaDisplay;
