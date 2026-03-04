import React, { memo, useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  Trash2,
  Pin,
  Reply,
  Check,
  CheckCheck,
  FileIcon,
  Image as ImageIcon,
  Music,
  Play,
  Pause,
  Download,
  MoreHorizontal,
  Video,
  Maximize2,
  User,
  Copy,
  Star,
  Smile,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- WhatsApp Emoji Reactions (Common ones) ---
const QUICK_REACTIONS = [
  "👍", // I agree / Correct
  "👏", // Good explanation
  "💡", // Got the idea / Insightful
  "❓", // I have a doubt
  "🧠", // Thinking / Deep concept
  "📌", // Important / Remember this
  "✅", // Answer is correct
  "⚠️", // Needs clarification
  "🔥", // Excellent / Well done
  "🙏", // Thanks / Helped me
  "❌", // Wrong
  "📝", // Needs revision
  "⭐", // Excellent
];

// --- Action Item Component ---
const ActionItem = ({ icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
      danger
        ? "text-red-400 hover:bg-red-500/10 active:bg-red-500/20"
        : "text-slate-300 hover:bg-white/10 active:bg-white/20"
    }`}
  >
    <div className={`${danger ? "text-red-400" : "text-slate-400"}`}>
      {icon}
    </div>
    <span className="font-medium">{label}</span>
  </button>
);

// --- Quick Reactions Component ---
const QuickReactions = ({
  onReact,
  messageReactions = {},
  currentUserId,
  isOwnMessage,
}) => {
  const [showAllReactions, setShowAllReactions] = useState(false);
  const reactionsRef = useRef(null);

  // Get user's current reaction to this message
  const getUserReaction = () => {
    if (!messageReactions || typeof messageReactions !== "object") return null;

    for (const [emoji, users] of Object.entries(messageReactions)) {
      if (Array.isArray(users)) {
        if (
          users.some((u) => u._id === currentUserId || u.id === currentUserId)
        ) {
          return emoji;
        }
      }
    }
    return null;
  };

  const userReaction = getUserReaction();

  // Handle reaction click
  const handleReactionClick = (emoji, e) => {
    e.stopPropagation();
    e.preventDefault();

    // If user is clicking their current reaction, remove it
    if (emoji === userReaction) {
      onReact(null); // Remove reaction
    } else {
      onReact(emoji); // Add or change reaction
    }

    setShowAllReactions(false);
  };

  // Close reactions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        reactionsRef.current &&
        !reactionsRef.current.contains(event.target)
      ) {
        setShowAllReactions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Render reaction bubbles with count (only if reactions exist)
  const renderReactionBubbles = () => {
    if (!messageReactions || Object.keys(messageReactions).length === 0)
      return null;

    return (
      <div
        className={`flex flex-wrap gap-1 mt-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
      >
        {Object.entries(messageReactions).map(([emoji, users]) => {
          if (!Array.isArray(users)) return null;
          const userCount = users.length;
          const hasUserReacted = users.some(
            (u) => u._id === currentUserId || u.id === currentUserId,
          );

          return (
            <div
              key={emoji}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                hasUserReacted
                  ? "bg-blue-500/20 border-blue-400/30"
                  : "bg-slate-800/50 border-slate-700/50"
              }`}
            >
              <span className="text-sm">{emoji}</span>
              {userCount > 1 && (
                <span
                  className={`text-[10px] font-bold ${hasUserReacted ? "text-blue-300" : "text-slate-400"}`}
                >
                  {userCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative" ref={reactionsRef}>
      {/* Reaction Bubbles Display (only shows if reactions exist) */}
      {renderReactionBubbles()}

      {/* Reaction Picker (ALWAYS shows the button) ithanu reaction button display ayirikkunnathu */}
      <div
        className={`relative mt-1 ${isOwnMessage ? "flex justify-end" : "flex justify-start"}`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAllReactions(!showAllReactions);
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 bg-red-500 ${
            userReaction
              ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
              : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white border border-slate-700/50"
          }`}
          aria-label="Add reaction"
        >
          {userReaction ? (
            <span className="text-sm">{userReaction}</span>
          ) : (
            <Smile size={16} />
          )}
        </button>

        {/* Full Reactions Panel */}
        <AnimatePresence>
          {showAllReactions && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-50 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl ${
                isOwnMessage
                  ? "bottom-full right-0 mb-2 origin-bottom-right"
                  : "bottom-full left-0 mb-2 origin-bottom-left"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-wrap gap-2 max-w-xs">
                {QUICK_REACTIONS.map((emoji) => {
                  const isCurrent = emoji === userReaction;
                  return (
                    <button
                      key={emoji}
                      onClick={(e) => handleReactionClick(emoji, e)}
                      className={`w-10 h-10 flex items-center justify-center text-2xl rounded-full transition-all duration-200
                        ${
                          isCurrent
                            ? "bg-blue-500/30 border-2 border-blue-400 scale-110"
                            : "hover:bg-white/10 active:scale-90 hover:scale-110"
                        }`}
                      aria-label={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  );
                })}

                {/* Remove reaction button (only shows if user has a reaction) */}
                {userReaction && (
                  <button
                    onClick={(e) => handleReactionClick(userReaction, e)}
                    className="w-10 h-10 flex items-center justify-center text-red-400 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-all"
                    aria-label="Remove reaction"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Media Renderer (Responsive) ---
const MediaRenderer = ({ media }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  if (!media) return null;

  const { type, url, name, size, duration } = media;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || (type !== "audio" && type !== "voice")) return;

    const updateProgress = () => {
      if (audio.duration && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [type]);

  const togglePlayback = (e) => {
    e.preventDefault();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  switch (type) {
    case "image":
      return (
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 w-full max-w-xs sm:max-w-sm md:max-w-md">
          <img
            src={url}
            alt="Attachment"
            className="w-full h-auto max-h-80 object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      );

    case "video":
      return (
        <div className="overflow-hidden rounded-2xl border border-white/10 w-full max-w-xs sm:max-w-sm md:max-w-md">
          <video
            src={url}
            controls
            className="w-full h-auto max-h-80 object-cover"
            playsInline
          />
        </div>
      );

    case "audio":
    case "voice":
      return (
        <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-xs sm:max-w-sm md:max-w-md">
          <button
            onClick={togglePlayback}
            className="w-10 h-10 flex items-center justify-center bg-blue-500 rounded-full text-white shadow-lg shadow-blue-500/40 hover:scale-105 active:scale-95 transition-transform touch-manipulation"
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-1" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wider">
              <span>{isPlaying ? "Playing..." : "Voice Note"}</span>
              <span>{duration ? `${duration}s` : "0:00"}</span>
            </div>

            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            <audio
              ref={audioRef}
              src={url}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          </div>
        </div>
      );

    case "file":
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-slate-800/40 border border-white/5 rounded-2xl hover:bg-slate-800/60 transition-all cursor-pointer group w-full max-w-xs sm:max-w-sm"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
            <FileIcon size={20} />
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate text-gray-200">
              {name || "Document"}
            </p>
            <p className="text-[10px] text-gray-500 font-mono uppercase">
              {size ? `${Math.round(size / 1024)} KB` : "File"}
            </p>
          </div>

          <Download
            size={16}
            className="text-gray-500 group-hover:text-white transition-colors shrink-0"
          />
        </a>
      );

    default:
      return null;
  }
};

// --- Helper function to get user info ---
const getUserInfo = (message, currentUser) => {
  const isOwnMessage =
    message.senderId === currentUser._id ||
    message.senderId?._id === currentUser._id ||
    (message.sender && message.sender._id === currentUser._id);

  let senderData = {};

  if (message.sender) {
    senderData = message.sender;
  } else if (
    typeof message.senderId === "object" &&
    message.senderId !== null
  ) {
    senderData = message.senderId;
  } else {
    senderData = {
      _id: message.senderId,
      name: "Unknown User",
      avatar: null,
    };
  }

  let recipientData = {};
  if (message.recipient) {
    recipientData = message.recipient;
  } else if (
    typeof message.recipientId === "object" &&
    message.recipientId !== null
  ) {
    recipientData = message.recipientId;
  }

  return {
    isOwnMessage,
    sender: {
      id: senderData._id || senderData.id,
      fullName: senderData.fullName || senderData.name || "User",
      firstName:
        senderData.firstName || senderData.name?.split(" ")[0] || "User",
      lastName: senderData.lastName || senderData.name?.split(" ")[1] || "",
      avatar:
        senderData.parishImage ||
        senderData.avatar ||
        senderData.profileImage ||
        null,
      role: Array.isArray(senderData.roles)
        ? senderData.roles[0]
        : senderData.role || "user",
      email: senderData.email || "",
      isOnline: senderData.isOnline || false,
    },
    recipient: {
      id: recipientData._id || recipientData.id,
      fullName: recipientData.fullName || recipientData.name || "",
      avatar: recipientData.avatar || recipientData.profileImage || null,
    },
  };
};

// --- Reply Preview Component ---
const ReplyPreview = ({ replyTo, isOwnMessage }) => {
  if (!replyTo) return null;

  const getReplyContent = () => {
    if (!replyTo) return "Message";

    if (replyTo.text) return replyTo.text;
    if (replyTo.content?.text) return replyTo.content.text;
    if (replyTo.media && replyTo.media.length > 0) {
      const media = replyTo.media[0];
      if (media.type === "image") return "📷 Image";
      if (media.type === "video") return "🎬 Video";
      if (media.type === "audio" || media.type === "voice") return "🎵 Audio";
      if (media.type === "file") return "📄 File";
      return "Attachment";
    }
    return "Message";
  };

  const getReplySenderName = () => {
    return replyTo?.senderId?.name || "Unknown";
  };

  return (
    <div
      className={`mx-2 mt-2 mb-1 p-3 rounded-xl text-xs border-l-4 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
        isOwnMessage
          ? "bg-blue-700/40 border-white/40"
          : "bg-slate-900/50 border-blue-500"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center gap-1">
          <Reply size={10} className="opacity-70" />
          <p className="font-bold opacity-80">{getReplySenderName()}</p>
        </div>
      </div>
      <p className="truncate opacity-90">{getReplyContent()}</p>
    </div>
  );
};

// --- Main Message Item Component ---
const MessageItem = memo(
  ({ message, user, onDelete, onPin, onReply, onReact, onStar, onCopy }) => {
    const { isOwnMessage, sender } = getUserInfo(message, user);
    const isTeacher = user.roles?.includes("teacher");

    const canDelete = isOwnMessage || isTeacher;
    const canPin = isTeacher;
    const messageTime = format(new Date(message.createdAt), "HH:mm");
    const messageDate = format(new Date(message.createdAt), "MMM d");

    const [showActionMenu, setShowActionMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState(null);
    const bubbleRef = useRef(null);
    const actionMenuRef = useRef(null);

    // Check if mobile on mount and resize
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          bubbleRef.current &&
          !bubbleRef.current.contains(event.target) &&
          actionMenuRef.current &&
          !actionMenuRef.current.contains(event.target)
        ) {
          setShowActionMenu(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, {
        passive: true,
      });

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }, []);

    // Handle emoji reaction
    const handleReact = (emoji) => {
      if (onReact) {
        onReact(message._id, emoji);
      }
    };

    // Handle copy
    const handleCopy = () => {
      if (message.text && onCopy) {
        onCopy(message.text);
      }
      setShowActionMenu(false);
    };

    // Handle reply
    const handleReply = () => {
      if (onReply) {
        onReply(message);
      }
      setShowActionMenu(false);
    };

    // Handle long press (mobile only)
    const handleTouchStart = (e) => {
      if (isMobile) {
        e.preventDefault();
        const timer = setTimeout(() => {
          setShowActionMenu(true);
        }, 500);
        setLongPressTimer(timer);
      }
    };

    const handleTouchEnd = (e) => {
      if (isMobile && longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    };

    const handleTouchMove = (e) => {
      if (isMobile && longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    };

    return (
      <div
        className={`flex w-full mb-4 px-2 sm:px-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[85%] md:max-w-[70%] ${
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Avatar */}
          {!isOwnMessage && (
            <div className="relative shrink-0 self-end">
              {sender.avatar ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                  <img
                    src={sender.avatar}
                    alt={sender.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-xs tracking-tight bg-gradient-to-tr from-violet-500 via-blue-600 to-cyan-400 text-white"
                    style={{ display: "none" }}
                  >
                    {sender.fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm bg-slate-800 text-slate-300 border border-white/10">
                  {sender.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <div
            className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
          >
            {/* Sender Name (for others' messages) */}
            {!isOwnMessage && (
              <div className="flex items-center gap-2 mb-1 ml-1">
                <span className="text-sm font-bold text-slate-300">
                  {sender.fullName}
                </span>
                {sender.role === "teacher" && (
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold uppercase tracking-tighter">
                    Teacher
                  </span>
                )}
              </div>
            )}

            {/* Bubble Container */}
            <div
              ref={bubbleRef}
              className={`relative group/bubble transition-all duration-300 w-full ${
                isMobile ? "touch-manipulation" : ""
              } ${
                isOwnMessage
                  ? "bg-blue-600 text-white rounded-3xl rounded-br-sm"
                  : "bg-slate-800 text-slate-200 rounded-3xl rounded-bl-sm"
              }`}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowActionMenu(true);
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
            >
              {/* Reply Context */}
              {(message.replyTo || message.replyToId) && (
                <ReplyPreview
                  replyTo={message.replyTo}
                  isOwnMessage={isOwnMessage}
                />
              )}

              {/* Content */}
              <div className="px-4 py-3">
                {/* Text Content */}
                {message.text && (
                  <p className="leading-relaxed whitespace-pre-wrap break-words text-sm">
                    {message.text}
                  </p>
                )}

                {/* Media Content */}
                {message.media?.map((mediaItem, index) => (
                  <div key={index} className="mt-2">
                    <MediaRenderer media={mediaItem} />
                  </div>
                ))}

                {/* Pinned Badge */}
                {message.isPinned && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
                    <Pin size={10} />
                    <span>Pinned</span>
                  </div>
                )}

                {/* ⭐⭐⭐ CRITICAL FIX HERE ⭐⭐⭐ */}
                {/* ALWAYS render QuickReactions component */}
                {/* (Previously only rendered if reactions existed) */}
                <QuickReactions
                  onReact={handleReact}
                  messageReactions={message.reactions || {}}
                  currentUserId={user._id}
                  isOwnMessage={isOwnMessage}
                />
              </div>

              {/* More (⋮) Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionMenu(!showActionMenu);
                }}
                className={`absolute top-2 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${
                  isOwnMessage ? "left-2" : "right-2"
                } ${
                  showActionMenu || isMobile
                    ? "opacity-100"
                    : "opacity-0 group-hover/bubble:opacity-100"
                } bg-white/5 hover:bg-white/20 hover:scale-110 active:scale-95`}
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Action Menu */}
              <AnimatePresence>
                {showActionMenu && (
                  <motion.div
                    ref={actionMenuRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute z-50 w-48 sm:w-52 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ${
                      isOwnMessage ? "left-2" : "right-2"
                    }`}
                    style={{
                      top: "10px",
                      transformOrigin: isOwnMessage ? "top left" : "top right",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Remove the "React" option from menu since we already have the button */}
                    {/* Or you can keep it but fix the onClick handler */}

                    <ActionItem
                      icon={<Reply size={16} />}
                      label="Reply"
                      onClick={handleReply}
                    />

                    {message.text && (
                      <ActionItem
                        icon={<Copy size={16} />}
                        label="Copy"
                        onClick={handleCopy}
                      />
                    )}

                    {canPin && (
                      <ActionItem
                        icon={<Pin size={16} />}
                        label={message.isPinned ? "Unpin" : "Pin"}
                        onClick={() => {
                          onPin(message._id, !message.isPinned);
                          setShowActionMenu(false);
                        }}
                      />
                    )}

                    {canDelete && (
                      <ActionItem
                        danger
                        icon={<Trash2 size={16} />}
                        label="Delete"
                        onClick={() => {
                          onDelete(message._id);
                          setShowActionMenu(false);
                        }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Metadata */}
            <div
              className={`flex items-center gap-2 mt-1 px-1 ${
                isOwnMessage ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span className="text-[11px] text-slate-500">{messageTime}</span>
              {isOwnMessage && (
                <div className="flex items-center">
                  {message.readBy?.length > 0 ? (
                    <CheckCheck size={12} className="text-blue-400" />
                  ) : (
                    <Check size={12} className="text-slate-600" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Avatar for own messages */}
          {isOwnMessage && (
            <div className="relative shrink-0 self-end">
              {sender.avatar ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                  <img
                    src={sender.avatar}
                    alt={sender.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {sender.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

// --- Message List Component ---
const MessageList = ({
  messages,
  user,
  onDeleteMessage,
  onPinMessage,
  onReply,
  onReactMessage,
  onStarMessage,
  onCopyMessage,
}) => {
  const groupMessagesByDate = () => {
    const groups = {};

    messages.forEach((message) => {
      const date = format(new Date(message.createdAt), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate();
  const dates = Object.keys(messageGroups).sort();

  // Handle reaction in parent component
  const handleReaction = (messageId, emoji) => {
    if (onReactMessage) {
      // Send to backend: messageId and emoji (null to remove)
      onReactMessage(messageId, emoji);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 border border-white/10">
              <User size={32} className="text-slate-500" />
            </div>
            <p className="text-lg font-bold text-white mb-2">No messages yet</p>
            <p className="text-sm text-slate-500">
              Start a conversation by sending a message
            </p>
          </div>
        ) : (
          <>
            {dates.map((date) => (
              <div key={date} className="mb-8">
                {/* Date Separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="px-4 py-2 bg-slate-800/50 rounded-full border border-white/10 backdrop-blur-sm">
                    <span className="text-sm font-medium text-slate-400">
                      {format(new Date(date), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>

                {/* Messages for this date */}
                {messageGroups[date].map((message) => (
                  <MessageItem
                    key={message._id}
                    message={message}
                    user={user}
                    onDelete={onDeleteMessage}
                    onPin={onPinMessage}
                    onReply={onReply}
                    onReact={handleReaction}
                    onStar={onStarMessage}
                    onCopy={onCopyMessage}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// Add CSS animations
const styles = `
@keyframes scaleFade {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-fade {
  animation: scaleFade 0.15s ease-out;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .touch-manipulation {
    touch-action: manipulation;
  }
  
  button, [role="button"] {
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  
  /* Improve mobile touch targets */
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Optimize reaction picker for mobile */
  .reaction-picker {
    max-width: 100vw;
    margin: 0 8px;
  }
  
  /* Ensure message bubble doesn't overflow */
  .message-bubble {
    max-width: 100% !important;
  }
}

/* Improve button feedback */
button:active {
  transform: scale(0.95);
}

/* Optimize images for mobile */
img {
  content-visibility: auto;
}

/* Message bubble hover effect for desktop only */
@media (min-width: 769px) {
  .group:hover .group-hover\\/bubble\\:opacity-100 {
    opacity: 1 !important;
  }
}

/* Smooth transitions for reaction bubbles */
.reaction-bubble {
  transition: all 0.2s ease;
}

/* Prevent text selection on mobile */
@media (max-width: 768px) {
  * {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  /* Allow text selection in message content */
  .message-content {
    -webkit-user-select: text;
    user-select: text;
  }
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default MessageList;
