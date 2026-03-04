// components/ImageUploadManager.js

import React from "react";

const ImageUploadManager = ({
  isUploading,
  onUpload,
  fileInputRef,
  uploadedImages,
  onRemoveImage,
}) => {
  return (
    <>
      {/* Upload Button */}
      <label className="cursor-pointer">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />
        <div className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg">
          {isUploading ? (
            <>
              <LoadingSpinner />
              അപ്‌ലോഡ് ചെയ്യുന്നു...
            </>
          ) : (
            <>
              <UploadIcon />
              ചിത്രം അപ്‌ലോഡ് ചെയ്യുക
            </>
          )}
        </div>
      </label>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>📁</span> അപ്‌ലോഡ് ചെയ്ത ചിത്രങ്ങൾ ({uploadedImages.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <ImagePreviewCard
                key={index}
                image={image}
                onRemove={() => onRemoveImage(index)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const UploadIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

const ImagePreviewCard = ({ image, onRemove }) => (
  <div className="relative group bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border">
        <img
          src={image.preview}
          alt={image.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {image.name}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {image.size} • {image.file.type.split("/")[1].toUpperCase()}
        </p>
        <p className="text-xs text-blue-600 mt-1 font-mono">
          ![alt text]({image.name})
        </p>
      </div>
    </div>
    <button
      onClick={onRemove}
      className="absolute top-2 right-2 w-7 h-7 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-200"
      title="Remove image"
    >
      ×
    </button>
  </div>
);

export default ImageUploadManager;
