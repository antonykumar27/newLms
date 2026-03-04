// hooks/useContentEditor.js

import { useState, useRef, useCallback } from "react";
import { useCreateLessonMutation } from "../../../store/api/MathsLessonApi";
import { useParams, useNavigate } from "react-router-dom";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "./snippets";
import { removeImageMarkdown } from "./markdownUtils";

export const useContentEditor = ({ teacherId, onSuccess }) => {
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [pageNumber, setPageNumber] = useState(null);
  const [title, setTitle] = useState("");

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [createLesson, { isLoading, error }] = useCreateLessonMutation();
  const { id } = useParams();
  const navigate = useNavigate();
  const chapterId = id;

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      alert("ദയവായി ഉള്ളടക്കം നൽകുക");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("subject", "maths");
      formData.append("format", "markdown");
      formData.append("pageNumber", pageNumber);
      formData.append("chapterId", chapterId);
      if (teacherId) {
        formData.append("teacherId", teacherId);
      }

      uploadedImages.forEach((image, index) => {
        formData.append("media", image.file);
        formData.append("imageNames", image.name);
      });

      const result = await createLesson(formData).unwrap();

      if (result.success) {
        if (onSuccess) onSuccess(result.lessonId);
        resetEditor();

        const saveBtn = document.querySelector(".save-btn");
        if (saveBtn) {
          showTemporarySuccess(saveBtn);
        }
        navigate(-1);
      } else {
        alert(`Save failed: ${result.error}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert(`Error: ${err.data?.error || err.message || "Failed to save"}`);
    }
  }, [
    content,
    title,
    pageNumber,
    chapterId,
    teacherId,
    uploadedImages,
    createLesson,
    onSuccess,
    navigate,
  ]);

  const resetEditor = useCallback(() => {
    setContent("");
    setUploadedImages([]);
    setTitle("");
    setPageNumber(null);
  }, []);

  const showTemporarySuccess = (button) => {
    button.textContent = "✅ സേവ് ചെയ്തു!";
    setTimeout(() => {
      button.textContent = "സേവ് ചെയ്യുക";
    }, 2000);
  };

  const validateImage = useCallback((file) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("അനുവദനീയമായ ഫയൽ തരങ്ങൾ: JPEG, PNG, GIF, WEBP, SVG");
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("ഫയലിന്റെ വലിപ്പം 5MB ൽ കുറവായിരിക്കണം");
      return false;
    }

    return true;
  }, []);

  const handleImageUpload = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!validateImage(file)) return;

      setIsUploading(true);

      try {
        const imageName = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split(".").pop()}`;

        const newImage = {
          file: file,
          name: imageName,
          preview: URL.createObjectURL(file),
          size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
        };

        setUploadedImages((prev) => [...prev, newImage]);

        return imageName;
      } catch (error) {
        console.error("Image processing error:", error);
        alert("ചിത്രം പ്രോസസ്സ് ചെയ്യാനായില്ല.");
        return null;
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [validateImage],
  );

  const removeImage = useCallback(
    (index) => {
      const imageToRemove = uploadedImages[index];

      if (imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      setContent((prev) => removeImageMarkdown(prev, imageToRemove.name));
    },
    [uploadedImages],
  );

  const clearAll = useCallback(() => {
    uploadedImages.forEach((img) => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    setContent("");
    setUploadedImages([]);
  }, [uploadedImages]);

  return {
    // State
    content,
    setContent,
    preview,
    setPreview,
    isUploading,
    uploadedImages,
    pageNumber,
    setPageNumber,
    title,
    setTitle,
    isLoading,
    error,

    // Refs
    textareaRef,
    fileInputRef,

    // Functions
    handleSave,
    handleImageUpload,
    removeImage,
    clearAll,

    // IDs
    chapterId,
  };
};
