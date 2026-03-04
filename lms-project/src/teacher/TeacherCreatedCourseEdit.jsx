import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  BookOpen,
  FileText,
  Hash,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Sparkles,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useCreatePagesMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  useGetSinglePageByIdQuery,
} from "../store/api/EachPageStudentApi";

const TeacherCreatedCourseEdit = ({ standardSubjectId }) => {
  const { id: chapterId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    standardSubject: standardSubjectId || "",
    chapterNumber: "",
    chapterTitle: "",
    description: "",
    media: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  // RTK Query hooks
  const [createChapter, { isLoading: isCreating }] = useCreatePagesMutation();
  const [updateChapter, { isLoading: isUpdating }] = useUpdatePageMutation();
  const [deleteChapter, { isLoading: isDeleting }] = useDeletePageMutation();
  const { data: existingData, isLoading: isFetching } =
    useGetSinglePageByIdQuery(chapterId, { skip: !chapterId });

  useEffect(() => {
    if (existingData?.data) {
      const data = existingData.data;
      setFormData({
        standardSubject: data.standardSubject || standardSubjectId || "",
        chapterNumber: data.chapterNumber || "",
        chapterTitle: data.chapterTitle || "",
        description: data.description || "",
        media: data.media || [],
      });
      if (data.media?.[0]?.url) setImagePreview(data.media[0].url);
    }
  }, [existingData, standardSubjectId]);

  // Listen for dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "chapterNumber" ? parseInt(value) || "" : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        toast.error("Please select an image file (PNG, JPG, JPEG, WEBP)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        media: [{ url: URL.createObjectURL(file), type: "image", file }],
      }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, media: [] }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("standardSubject", formData.standardSubject);
      submitFormData.append("chapterNumber", formData.chapterNumber);
      submitFormData.append("chapterTitle", formData.chapterTitle.trim());

      if (formData.description) {
        submitFormData.append("description", formData.description.trim());
      }

      if (formData.media[0]) {
        const media = formData.media[0];
        if (media.file) {
          submitFormData.append("media", media.file);
        } else if (media.url) {
          submitFormData.append("media", media.url);
        }
      }

      let response;
      if (chapterId) {
        submitFormData.append("id", chapterId);
        response = await updateChapter({
          id: chapterId,
          submitFormData, // 🔑 SAME KEY NAME
        }).unwrap();
        toast.success("✨ Chapter updated successfully!");
        setTimeout(() => navigate(-1), 1000);
      } else {
        response = await createChapter(submitFormData).unwrap();
        toast.success("🎉 Chapter created successfully!");
        setTimeout(() => navigate(-1), 1000);
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Operation failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!chapterId) return;

    try {
      await deleteChapter(chapterId).unwrap();
      toast.success("🗑️ Chapter deleted successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete chapter");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (isFetching && chapterId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-purple-500 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium animate-pulse">
            Loading chapter data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-900/10 px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Glass Effect Container */}
      <div className="max-w-5xl mx-auto">
        {/* Header with Glass Effect */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/50 rounded-3xl p-6 mb-8 border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-gray-200/30 dark:shadow-slate-900/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 text-gray-700 dark:text-gray-300 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={22} />
              </motion.button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {chapterId ? "Edit Chapter" : "Create New Chapter"}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {chapterId
                    ? "Refine your chapter details below"
                    : "Build amazing learning experiences for your students"}
                </p>
              </div>
            </div>

            {chapterId && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-red-500/20 transition-all duration-300"
              >
                <Trash2 size={18} />
                Delete
              </motion.button>
            )}
          </div>
        </div>

        {/* Main Form with Glass Effect */}
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-gray-200/30 dark:shadow-slate-900/30"
        >
          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Text Inputs */}
            <div className="space-y-6">
              {/* Chapter Number with Floating Label */}
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Hash
                      size={18}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Chapter Number
                  </label>
                </div>
                <input
                  type="number"
                  name="chapterNumber"
                  value={formData.chapterNumber}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-slate-900/50 border-2 border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 transition-all duration-300 outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter chapter number"
                  required
                  min="1"
                />
              </div>

              {/* Chapter Title with Floating Label */}
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <BookOpen
                      size={18}
                      className="text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Chapter Title
                  </label>
                </div>
                <input
                  type="text"
                  name="chapterTitle"
                  value={formData.chapterTitle}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-slate-900/50 border-2 border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-lg focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 transition-all duration-300 outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter chapter title"
                  required
                />
              </div>

              {/* Description with Floating Label */}
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <FileText
                      size={18}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Description
                  </label>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full bg-white dark:bg-slate-900/50 border-2 border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 transition-all duration-300 outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                  placeholder="Describe what students will learn in this chapter..."
                />
              </div>
            </div>

            {/* Right Column - Media Upload */}
            <div className="space-y-6">
              {/* Cover Image Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                    <ImageIcon
                      size={18}
                      className="text-rose-600 dark:text-rose-400"
                    />
                  </div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Cover Image
                  </label>
                </div>

                <AnimatePresence mode="wait">
                  {!imagePreview ? (
                    <motion.label
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex flex-col items-center justify-center w-full min-h-[300px] border-3 border-dashed border-gray-300 dark:border-slate-600 rounded-3xl cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900/50 dark:to-slate-800/50 hover:from-gray-100 hover:to-gray-200 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-500 group relative overflow-hidden"
                    >
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <div className="relative z-10 flex flex-col items-center justify-center p-8">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Upload Cover Image
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                          Drag & drop or click to browse
                          <br />
                          <span className="text-xs">
                            PNG, JPG, WEBP up to 10MB
                          </span>
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </motion.label>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-3xl overflow-hidden group border-2 border-gray-200 dark:border-slate-700"
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-[300px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-4 right-4 flex gap-3">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={removeImage}
                            className="p-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-red-500/30"
                          >
                            <X size={20} />
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => window.open(imagePreview, "_blank")}
                            className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
                          >
                            <Eye size={20} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Preview Section */}
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900/50 dark:to-slate-800/50 rounded-2xl p-5 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-500" />
                  Chapter Preview
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-semibold">Number:</span>{" "}
                    {formData.chapterNumber || "Not set"}
                  </p>
                  <p>
                    <span className="font-semibold">Title:</span>{" "}
                    {formData.chapterTitle || "Not set"}
                  </p>
                  <p>
                    <span className="font-semibold">Description:</span>{" "}
                    {formData.description
                      ? `${formData.description.substring(0, 60)}...`
                      : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="px-7 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-300 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
              >
                Cancel
              </motion.button>

              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 text-gray-700 dark:text-gray-300"
              >
                {isDarkMode ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || isCreating || isUpdating}
              className="px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 dark:shadow-indigo-900/30 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 group"
            >
              {loading || isCreating || isUpdating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="animate-pulse">
                    {chapterId ? "Updating..." : "Creating..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles
                    size={18}
                    className="group-hover:rotate-180 transition-transform duration-500"
                  />
                  <span>{chapterId ? "Update Chapter" : "Create Chapter"}</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-red-200 dark:border-red-900/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2
                    size={28}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Chapter?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This action cannot be undone. All data associated with this
                  chapter will be permanently deleted.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all flex-1 border border-gray-200 dark:border-slate-700"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-xl transition-all flex-1 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Permanently
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeacherCreatedCourseEdit;
