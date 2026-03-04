import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Paperclip,
  X,
  Image,
  Video,
  FileText,
  Mic,
  Loader2,
  Pause,
  Play,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { Trash2 } from "lucide-react";
import { useSendMessageMutation } from "../../store/api/ChatStudentDiscussionApi";

const ChatInput = ({
  onTyping,
  onStopTyping,
  replyTo,
  user,
  activeRoom,
  onDeleteReply,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = isMobile ? 100 : 120;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message, isMobile]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setEmojiPickerVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      onTyping?.();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onStopTyping?.();
      }
    }, 1000);
  };

  const [sendMessage] = useSendMessageMutation();

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (isMuted || !canSend || isSending) return;

    const hasContent = message.trim() || selectedFile || audioBlob;
    if (!hasContent || !activeRoom || !user) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("roomId", activeRoom._id);
      formData.append("text", message.trim());

      if (replyTo?._id) {
        formData.append("replyTo", replyTo._id);
      }

      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      if (audioBlob) {
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        formData.append("media", audioFile);
      }

      await sendMessage(formData);
      resetForm();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setMessage("");
    setSelectedFile(null);
    setFilePreview(null);
    setAudioPreview(null);
    setFileType(null);
    setAudioBlob(null);
    setIsTyping(false);
    onStopTyping?.();
    onDeleteReply?.();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }

    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Emoji handling
  const handleEmojiSelect = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setEmojiPickerVisible(false);
    textareaRef.current?.focus();
  };

  // File handling
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setAudioBlob(null);
    setAudioPreview(null);

    const reader = new FileReader();
    const type = file.type.split("/")[0];
    setFileType(type);

    if (type === "image" || type === "video") {
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (type === "audio") {
      reader.onloadend = () => {
        setAudioPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setAudioPreview(null);
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      setRecordingTime(0);

      clearFile();

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const audioUrl = URL.createObjectURL(blob);
        setAudioPreview(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Recording failed:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const clearVoice = () => {
    setAudioBlob(null);
    setAudioPreview(null);
    setIsRecording(false);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  };

  // Audio playback controls
  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlayingAudio(false);
    const handlePause = () => setIsPlayingAudio(false);
    const handlePlay = () => setIsPlayingAudio(true);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Permissions check
  const isMuted = user?.isMuted;
  const canSend =
    activeRoom?.settings?.allowStudentMessages || user?.role !== "student";
  const hasContent = message.trim() || selectedFile || audioBlob;

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [audioPreview]);

  if (isMuted) {
    return (
      <div className="px-4 py-3 bg-gradient-to-r from-red-500/10 to-rose-500/10 border-t border-red-200 dark:border-red-900">
        <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">
          ⚠️ You are muted and cannot send messages
        </p>
      </div>
    );
  }

  if (!canSend) {
    return (
      <div className="px-4 py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-t border-amber-200 dark:border-amber-900">
        <p className="text-amber-600 dark:text-amber-400 text-sm text-center font-medium">
          📢 Students cannot send messages in this room
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      {/* Reply Preview */}

      {replyTo && (
        <div className="mx-3 md:mx-6 mb-2 p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-blue-200 dark:border-blue-900/30 flex justify-between items-center">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-1 bg-blue-500 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                Replying to {replyTo.senderId?.name || "User"}
              </p>

              <p className="text-sm opacity-70 truncate">
                {replyTo.text
                  ? replyTo.text
                  : replyTo.messageType === "file"
                    ? "📎 Media message"
                    : "Message"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDeleteReply}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0 ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4">
        <div className="flex items-end gap-2 sm:gap-3">
          {/* Left Controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 mb-1">
            {/* Emoji Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
                className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Smile size={isMobile ? 20 : 22} />
              </button>

              {emojiPickerVisible && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-full mb-2 left-0 z-50"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <EmojiPicker
                      onEmojiClick={handleEmojiSelect}
                      theme="dark"
                      width={isMobile ? 300 : 350}
                      height={350}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Paperclip size={isMobile ? 20 : 22} />
            </button>

            {/* Voice Recording Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 sm:p-2.5 rounded-lg transition-colors ${
                isRecording
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }`}
            >
              {isRecording ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs">{formatTime(recordingTime)}</span>
                </div>
              ) : (
                <Mic size={isMobile ? 20 : 22} />
              )}
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Input Container with Inline Preview */}
          <div className="flex-1 relative min-h-[48px]" ref={containerRef}>
            {/* File/Audio Preview - Inline WhatsApp Style */}
            {(filePreview || audioPreview) && (
              <div className="mb-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {filePreview && fileType === "image" && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {filePreview && fileType === "video" && (
                      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Video size={20} className="text-slate-500" />
                      </div>
                    )}

                    {filePreview && fileType === "pdf" && (
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText
                          size={20}
                          className="text-red-600 dark:text-red-400"
                        />
                      </div>
                    )}

                    {audioPreview && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={toggleAudioPlayback}
                          className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          {isPlayingAudio ? (
                            <Pause
                              size={20}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          ) : (
                            <Play
                              size={20}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Voice message
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {formatTime(recordingTime)}
                            </span>
                            <audio
                              ref={audioRef}
                              src={audioPreview}
                              className="hidden"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {!audioPreview && (
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {selectedFile?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedFile &&
                            `${(selectedFile.size / 1024).toFixed(1)}KB`}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={audioPreview ? clearVoice : clearFile}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-slate-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type message here..."
              className="
                w-full
                min-h-[48px]
                max-h-[120px]
                bg-slate-50 dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                rounded-xl sm:rounded-2xl
                px-4 py-3 pr-20 sm:pr-24
                resize-none
                overflow-y-auto
                whitespace-pre-wrap
                break-words
                focus:outline-none
                focus:ring-2 focus:ring-blue-500
                transition-all
                text-base
                leading-relaxed
                disabled:opacity-50
              "
              style={{
                height: "48px",
                lineHeight: "1.5",
              }}
              disabled={!activeRoom || isSending}
              rows="1"
            />
          </div>

          {/* Send/Loading Button */}
          <button
            type="submit"
            disabled={
              !hasContent ||
              !activeRoom ||
              isMuted ||
              !canSend ||
              isSending ||
              isRecording
            }
            className="
              p-2.5 sm:p-3 
              bg-gradient-to-r from-blue-600 to-indigo-600 
              text-white 
              rounded-xl 
              hover:from-blue-700 hover:to-indigo-700 
              disabled:from-slate-300 disabled:to-slate-400 
              disabled:cursor-not-allowed 
              transition-all duration-200 
              shadow-lg shadow-blue-500/25
              flex-shrink-0
              mb-1
              min-w-[44px]
              min-h-[44px]
              flex items-center justify-center
            "
          >
            {isSending ? (
              <Loader2 size={isMobile ? 20 : 22} className="animate-spin" />
            ) : (
              <Send size={isMobile ? 20 : 22} />
            )}
          </button>
        </div>
      </form>

      {/* Audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default ChatInput;
