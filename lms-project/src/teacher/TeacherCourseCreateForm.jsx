import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  X,
  Video,
  Music,
  AlertCircle,
  CheckCircle,
  Clock,
  Save,
  RefreshCw,
  ChevronLeft,
  Sparkles,
  FileVideo,
  FileAudio,
} from "lucide-react";
import { useCreateCourseMutation } from "../store/api/CourseApi";
// import { useCreateVideoAudioLessonMutation } from "../store/api/MathsLessonApi";

const TeacherCourseCreateForm = () => {
  const navigate = useNavigate();
  const { id: pageId } = useParams();
  const [loading, setLoading] = useState(false);
  const [createMedia, { isLoading }] = useCreateCourseMutation();

  const [formData, setFormData] = useState({
    type: "video",
    title: "", // ✅ NEW: Title field added
    mediaFile: null,
    mediaPreview: "",
    pageId: pageId,
  });

  const [errors, setErrors] = useState({});

  // 2026 UX: Clean up URL objects to prevent memory leaks
  useEffect(() => {
    return () => {
      if (formData.mediaPreview) URL.revokeObjectURL(formData.mediaPreview);
    };
  }, [formData.mediaPreview]);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = formData.type === "video";
    const maxSize = isVideo ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    const validTypes = isVideo
      ? ["video/mp4", "video/webm", "video/quicktime"]
      : ["audio/mpeg", "audio/wav", "audio/mp3", "audio/m4a"];

    if (!validTypes.includes(file.type)) {
      setErrors({ mediaFile: `Invalid format for ${formData.type}.` });
      return;
    }

    if (file.size > maxSize) {
      setErrors({ mediaFile: `File exceeds ${isVideo ? "500MB" : "50MB"}.` });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      mediaFile: file,
      mediaPreview: isVideo ? URL.createObjectURL(file) : "audio-present",
    }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate title
    if (!formData.title.trim()) {
      setErrors({ title: "Please enter a title for your content." });
      return;
    }

    if (!formData.mediaFile) {
      setErrors({ mediaFile: "Please select a file first." });
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("pageId", formData.pageId);
      submitData.append("title", formData.title); // ✅ Send title to backend
      submitData.append("media", formData.mediaFile);

      const response = await createMedia(submitData).unwrap();
      navigate(`/teacherDetails/eachChapterStudy/watch/${pageId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 selection:bg-blue-500/30 font-sans antialiased overflow-x-hidden">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-purple-600/20 blur-[120px] rounded-full animate-bounce duration-[10s]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb & Header */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-wide">
            Back to Dashboard
          </span>
        </button>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-blue-400 font-semibold tracking-widest text-xs uppercase">
              Content Creator
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
            Design Your Lecture
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Media Type Selection (Bento Style) */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                Select Medium
              </h2>

              <div className="flex flex-col gap-4">
                {[
                  {
                    id: "video",
                    label: "Video Lecture",
                    icon: Video,
                    color: "text-blue-400",
                    bg: "bg-blue-400/10",
                    border: "border-blue-400/20",
                  },
                  {
                    id: "audio",
                    label: "Audio Podcast",
                    icon: Music,
                    color: "text-emerald-400",
                    bg: "bg-emerald-400/10",
                    border: "border-emerald-400/20",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        type: item.id,
                        title: "", // Reset title when type changes
                        mediaFile: null,
                        mediaPreview: "",
                      }))
                    }
                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                      formData.type === item.id
                        ? `${item.border} bg-white/[0.05] shadow-[0_0_20px_rgba(59,130,246,0.1)] scale-[1.02]`
                        : "border-transparent bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {item.id === "video"
                          ? "High quality MP4/MOV"
                          : "Crystal clear MP3/WAV"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Micro-Stat Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl overflow-hidden relative group">
              <div className="relative z-10">
                <Clock className="w-8 h-8 mb-4 opacity-80" />
                <h3 className="text-xl font-bold">Fast Processing</h3>
                <p className="text-indigo-100/80 text-sm mt-2">
                  Our 2026 AI engine optimizes your content for 5G delivery
                  instantly.
                </p>
              </div>
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>
          </div>

          {/* Right Column: Upload & Preview */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ✅ NEW: Title Input Field */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Lecture Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: null });
                  }}
                  placeholder="e.g., Introduction to Fractions, Algebra Basics, etc."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                {errors.title && (
                  <div className="mt-2 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{errors.title}</span>
                  </div>
                )}
              </div>

              {/* Upload Area */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                {!formData.mediaFile ? (
                  <label className="flex flex-col items-center justify-center cursor-pointer group py-12">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/40 transition-colors" />
                      <div className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Upload className="w-8 h-8 text-blue-400 group-hover:animate-bounce" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 mb-2">
                      Upload your Masterpiece
                    </h3>
                    <p className="text-slate-400 text-center max-w-sm">
                      Drag and drop your {formData.type} here or{" "}
                      <span className="text-blue-400 underline underline-offset-4">
                        browse files
                      </span>
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleMediaUpload}
                      accept={formData.type === "video" ? "video/*" : "audio/*"}
                    />
                  </label>
                ) : (
                  <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        {formData.type === "video" ? (
                          <FileVideo className="text-blue-400" />
                        ) : (
                          <FileAudio className="text-emerald-400" />
                        )}
                        <span className="font-medium truncate max-w-[200px] md:max-w-md">
                          {formData.mediaFile.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            mediaFile: null,
                            mediaPreview: "",
                          }))
                        }
                        className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {formData.type === "video" ? (
                      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl border border-white/5">
                        <video
                          src={formData.mediaPreview}
                          controls
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Music className="w-8 h-8 text-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-emerald-400 font-semibold italic">
                          Audio Track Ready for Mixing
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {errors.mediaFile && (
                  <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 animate-shake">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {errors.mediaFile}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 px-4 text-sm text-slate-400 italic">
                  Drafts are auto-saved to your cloud storage.
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-medium transition-all"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isLoading}
                    className="flex-1 md:flex-none px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {loading ? "Generating..." : "Publish Lesson"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Global CSS for Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
};

export default TeacherCourseCreateForm;
