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
  Sparkles,
  Layers,
  Eye,
  Save,
  ChevronRight,
  Zap,
  Compass,
  Target,
  Award,
  Clock,
  CheckCircle,
} from "lucide-react";

import {
  useCreatePagesMutation,
  useUpdatePageMutation,
  useGetPageByIdQuery,
} from "../../store/api/EachPageStudentApi";

const ChapterRelatedPageCreate = ({
  chapterId = null,
  onSuccess,
  onCancel,
  standardSubjectId,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const subjectId = standardSubjectId || id;

  const [formData, setFormData] = useState({
    standardSubject: subjectId,
    chapterNumber: "",
    chapterTitle: "",
    description: "",
    media: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState("details");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // RTK Query hooks
  const [createChapter, { isLoading: isCreating }] = useCreatePagesMutation();
  const [updateChapter, { isLoading: isUpdating }] = useUpdatePageMutation();
  const { data: existingData, isLoading: isFetching } = useGetPageByIdQuery(
    chapterId,
    { skip: !chapterId },
  );

  useEffect(() => {
    if (existingData?.data) {
      const data = existingData.data;
      setFormData({
        standardSubject: data.standardSubject || subjectId,
        chapterNumber: data.chapterNumber || "",
        chapterTitle: data.chapterTitle || "",
        description: data.description || "",
        media: data.media || [],
      });
      if (data.media?.[0]?.url) setImagePreview(data.media[0].url);
    }
  }, [existingData, subjectId]);

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
      if (!file.type.match("image.*"))
        return toast.error("Please select an image file");
      if (file.size > 5 * 1024 * 1024)
        return toast.error("Image size should be less than 5MB");

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
      if (formData.description)
        submitFormData.append("description", formData.description.trim());

      if (formData.media[0]) {
        const media = formData.media[0];
        media.file
          ? submitFormData.append("media", media.file)
          : submitFormData.append("mediaUrl", media.url);
      }

      let response;
      if (chapterId) {
        submitFormData.append("id", chapterId);
        response = await updateChapter(submitFormData).unwrap();
        toast.success("Chapter updated successfully!");
      } else {
        response = await createChapter(submitFormData).unwrap();
        toast.success("Chapter created successfully!");
      }

      if (onSuccess) {
        onSuccess(response.data);
      } else {
        navigate(-1);
      }
    } catch (error) {
      toast.error(error?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching && chapterId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Get gradient based on mode
  const getGradient = () => {
    if (darkMode) {
      return "from-indigo-500/20 via-purple-500/20 to-pink-500/20";
    }
    return "from-indigo-100 via-purple-100 to-pink-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Floating Header with Glass Effect */}
      <div className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (onCancel ? onCancel() : navigate(-1))}
                className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </motion.button>

              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                >
                  {chapterId ? "Edit Chapter" : "Create New Chapter"}
                </motion.h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {chapterId
                    ? "Update your chapter content"
                    : "Add a new chapter to your curriculum"}
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg flex items-center gap-2"
            >
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step{" "}
                {formData.chapterTitle && formData.chapterNumber
                  ? "2/2"
                  : "1/2"}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form - Takes 8 columns on large screens */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
            >
              {/* Animated Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-50`}
              />

              {/* Floating Particles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                  }}
                  transition={{
                    duration: 5 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                />
              ))}

              {/* Tabs for mobile */}
              {isMobile && (
                <div className="relative p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex gap-2">
                    {["details", "media"].map((tab) => (
                      <motion.button
                        key={tab}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          activeTab === tab
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                            : "bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {tab === "details" ? "Details" : "Cover Image"}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative p-6 md:p-8">
                {/* Form Fields - Hidden on mobile based on tab */}
                <div
                  className={
                    isMobile && activeTab !== "details" ? "hidden" : "block"
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chapter Number - Bento Style */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                          <Hash size={14} className="text-white" />
                        </div>
                        Chapter Number
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          name="chapterNumber"
                          value={formData.chapterNumber}
                          onChange={handleInputChange}
                          className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                          placeholder="e.g. 1"
                          required
                        />
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </motion.div>

                    {/* Chapter Title - Bento Style */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                          <BookOpen size={14} className="text-white" />
                        </div>
                        Chapter Title
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          name="chapterTitle"
                          value={formData.chapterTitle}
                          onChange={handleInputChange}
                          className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                          placeholder="Enter title"
                          required
                        />
                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Description - Bento Style */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2 mt-6"
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <FileText size={14} className="text-white" />
                      </div>
                      Description
                    </label>
                    <div className="relative group">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="5"
                        className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white resize-none"
                        placeholder="What will students learn in this chapter? Describe the key concepts and learning outcomes..."
                      />
                      <FileText className="absolute left-3 top-4 h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>

                    {/* Character count */}
                    <div className="flex justify-end">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.description.length} / 500 characters
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Media Upload - Hidden on mobile based on tab */}
                <div
                  className={
                    isMobile && activeTab !== "media" ? "hidden" : "block mt-6"
                  }
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                        <ImageIcon size={14} className="text-white" />
                      </div>
                      Cover Image
                    </label>

                    <AnimatePresence mode="wait">
                      {!imagePreview ? (
                        <motion.label
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300/50 dark:border-gray-700/50 rounded-2xl cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 transition-all group relative overflow-hidden"
                        >
                          {/* Animated background */}
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 90, 0],
                            }}
                            transition={{
                              duration: 10,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"
                          />

                          <div className="relative flex flex-col items-center justify-center">
                            <motion.div
                              animate={{
                                y: [0, -10, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                            >
                              <Upload className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 transition-colors mb-3" />
                            </motion.div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                              Click to upload or drag & drop
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              SVG, PNG, JPG or GIF (max. 5MB)
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
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative rounded-2xl overflow-hidden group border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={removeImage}
                              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                            >
                              <X size={20} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() =>
                                document.getElementById("file-input").click()
                              }
                              className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all shadow-lg"
                            >
                              <Upload size={20} />
                            </motion.button>
                          </div>
                          <input
                            id="file-input"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Form Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-end gap-3 pt-8 mt-6 border-t border-gray-200/50 dark:border-gray-700/50"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onCancel || (() => navigate(-1))}
                    className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || isCreating || isUpdating}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-70 flex items-center gap-2"
                  >
                    {loading || isCreating || isUpdating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        {chapterId ? "Update Chapter" : "Create Chapter"}
                        <Zap size={16} className="opacity-70" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </div>

          {/* Sidebar - Takes 4 columns on large screens (Bento Stats) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Pro Tips
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: Hash,
                    text: "Use clear chapter numbers for better organization",
                  },
                  {
                    icon: BookOpen,
                    text: "Make titles descriptive and engaging",
                  },
                  {
                    icon: FileText,
                    text: "Include learning objectives in description",
                  },
                  {
                    icon: ImageIcon,
                    text: "Add a cover image to make chapters visually appealing",
                  },
                ].map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg mt-0.5">
                      <tip.icon className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {tip.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Chapter Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Layers, label: "Pages", value: "0" },
                  { icon: Eye, label: "Views", value: "0" },
                  { icon: Clock, label: "Est. Time", value: "15 min" },
                  { icon: CheckCircle, label: "Completed", value: "0" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-3 bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl text-center"
                  >
                    <stat.icon className="h-4 w-4 mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Live Preview
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Chapter {formData.chapterNumber || "?"}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formData.chapterTitle || "Untitled Chapter"}
                  </p>
                  {formData.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {formData.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full text-xs text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50">
            <Sparkles className="h-3 w-3" />
            <span>Create engaging content • Every chapter matters</span>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button for Mobile - Quick Save */}
      {isMobile && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSubmit}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl z-50"
        >
          <Compass className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
};

export default ChapterRelatedPageCreate;

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ArrowLeft,
//   Upload,
//   X,
//   BookOpen,
//   FileText,
//   Hash,
//   Image as ImageIcon,
//   Loader2,
// } from "lucide-react";

// import {
//   useCreatePagesMutation,
//   useUpdatePageMutation,
//   useGetPageByIdQuery,
// } from "../../store/api/EachPageStudentApi";

// const ChapterRelatedPageCreate = ({
//   chapterId = null,
//   onSuccess,
//   onCancel,
//   standardSubjectId,
// }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const subjectId = standardSubjectId || id;

//   const [formData, setFormData] = useState({
//     standardSubject: subjectId,
//     chapterNumber: "",
//     chapterTitle: "",
//     description: "",
//     media: [],
//   });

//   const [imagePreview, setImagePreview] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // RTK Query hooks
//   const [createChapter, { isLoading: isCreating }] = useCreatePagesMutation();
//   const [updateChapter, { isLoading: isUpdating }] = useUpdatePageMutation();
//   const { data: existingData, isLoading: isFetching } = useGetPageByIdQuery(
//     chapterId,
//     { skip: !chapterId },
//   );

//   useEffect(() => {
//     if (existingData?.data) {
//       const data = existingData.data;
//       setFormData({
//         standardSubject: data.standardSubject || subjectId,
//         chapterNumber: data.chapterNumber || "",
//         chapterTitle: data.chapterTitle || "",
//         description: data.description || "",
//         media: data.media || [],
//       });
//       if (data.media?.[0]?.url) setImagePreview(data.media[0].url);
//     }
//   }, [existingData, subjectId]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "chapterNumber" ? parseInt(value) || "" : value,
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.match("image.*"))
//         return toast.error("Please select an image file");
//       if (file.size > 5 * 1024 * 1024)
//         return toast.error("Image size should be less than 5MB");

//       setFormData((prev) => ({
//         ...prev,
//         media: [{ url: URL.createObjectURL(file), type: "image", file }],
//       }));

//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeImage = () => {
//     setFormData((prev) => ({ ...prev, media: [] }));
//     setImagePreview(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const submitFormData = new FormData();
//       submitFormData.append("standardSubject", formData.standardSubject);
//       submitFormData.append("chapterNumber", formData.chapterNumber);
//       submitFormData.append("chapterTitle", formData.chapterTitle.trim());
//       if (formData.description)
//         submitFormData.append("description", formData.description.trim());

//       if (formData.media[0]) {
//         const media = formData.media[0];
//         media.file
//           ? submitFormData.append("media", media.file)
//           : submitFormData.append("mediaUrl", media.url);
//       }

//       let response;
//       if (chapterId) {
//         submitFormData.append("id", chapterId);
//         response = await updateChapter(submitFormData).unwrap();
//         toast.success("Chapter updated!");
//         navigate(-1);
//       } else {
//         response = await createChapter(submitFormData).unwrap();
//         toast.success("Chapter created!");
//         navigate(-1);
//       }
//       if (onSuccess) onSuccess(response.data);
//     } catch (error) {
//       toast.error(error?.data?.message || "Operation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isFetching && chapterId) {
//     return (
//       <div className="flex h-64 items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-3xl mx-auto"
//     >
//       {/* Header Section */}
//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => (onCancel ? onCancel() : navigate(-1))}
//             className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-400"
//           >
//             <ArrowLeft size={24} />
//           </button>
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//               {chapterId ? "Edit Chapter" : "New Chapter"}
//             </h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Fill in the details to manage your curriculum.
//             </p>
//           </div>
//         </div>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800"
//       >
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Chapter Number */}
//           <div className="space-y-2">
//             <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//               <Hash size={16} className="text-indigo-500" /> Chapter Number
//             </label>
//             <input
//               type="number"
//               name="chapterNumber"
//               value={formData.chapterNumber}
//               onChange={handleInputChange}
//               className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
//               placeholder="e.g. 1"
//               required
//             />
//           </div>

//           {/* Chapter Title */}
//           <div className="space-y-2">
//             <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//               <BookOpen size={16} className="text-indigo-500" /> Chapter Title
//             </label>
//             <input
//               type="text"
//               name="chapterTitle"
//               value={formData.chapterTitle}
//               onChange={handleInputChange}
//               className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
//               placeholder="Enter title"
//               required
//             />
//           </div>
//         </div>

//         {/* Description */}
//         <div className="space-y-2">
//           <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//             <FileText size={16} className="text-indigo-500" /> Description
//           </label>
//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleInputChange}
//             rows="4"
//             className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
//             placeholder="What will students learn in this chapter?"
//           />
//         </div>

//         {/* Media Upload */}
//         <div className="space-y-2">
//           <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
//             <ImageIcon size={16} className="text-indigo-500" /> Cover Image
//           </label>

//           <AnimatePresence mode="wait">
//             {!imagePreview ? (
//               <motion.label
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-all group"
//               >
//                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                   <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
//                   <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
//                     Click to upload or drag & drop
//                   </p>
//                 </div>
//                 <input
//                   type="file"
//                   className="hidden"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                 />
//               </motion.label>
//             ) : (
//               <motion.div
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 className="relative rounded-2xl overflow-hidden group border border-gray-200 dark:border-slate-700"
//               >
//                 <img
//                   src={imagePreview}
//                   alt="Preview"
//                   className="w-full h-48 object-cover"
//                 />
//                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                   <button
//                     type="button"
//                     onClick={removeImage}
//                     className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform active:scale-95"
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Actions */}
//         <div className="flex items-center justify-end gap-4 pt-4">
//           <button
//             type="button"
//             onClick={onCancel || (() => navigate(-1))}
//             className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading || isCreating || isUpdating}
//             className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
//           >
//             {(loading || isCreating || isUpdating) && (
//               <Loader2 size={18} className="animate-spin" />
//             )}
//             {chapterId ? "Update Chapter" : "Create Chapter"}
//           </button>
//         </div>
//       </form>
//     </motion.div>
//   );
// };

// export default ChapterRelatedPageCreate;
