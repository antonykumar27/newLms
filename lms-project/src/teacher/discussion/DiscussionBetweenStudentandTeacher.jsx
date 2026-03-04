import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  MessageCircle,
  LayoutGrid,
  AlertCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import {
  useGetMyRoomsQuery,
  useJoinRoomMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useUploadFileMutation,
  useMuteUserMutation,
  useDeleteMessageMutation,
  usePinMessageMutation,
  useHandleReactMembersMessageMutation,
  useHandleReplyMembersMessageMutation,
  useHandlehandleStarMembersMessageMutation,
} from "../../store/api/ChatStudentDiscussionApi";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import { useSocket } from "../../common/Socket";
import { toast } from "react-toastify";
import { useAuth } from "../../common/AuthContext";
import { useLocation, useParams } from "react-router-dom";

const DiscussionBetweenStudentandTeacher = () => {
  const { user } = useAuth();
  console.log("user", user);
  const { id: subjectId } = useParams();
  const { socket } = useSocket();
  const location = useLocation();

  const createdById = location?.state?.item?.createdBy?.id;
  const isTeacherView = Boolean(createdById);

  const context = React.useMemo(() => {
    if (isTeacherView) {
      const item = location.state?.item || {};
      return {
        subject: item.subject,
        name: item.name,
        medium: item.medium,
        standard: item.standard,
        part: item.part,
        subjectId: item._id,
      };
    }

    const subjectData = location.state?.subject || {};
    return {
      subject: subjectData.subject,
      name: subjectData.name,
      medium: subjectData.medium,
      standard: subjectData.standard,
      part: subjectData.part,
      subjectId: subjectData._id,
    };
  }, [createdById, location.state, user?._id]);

  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [joinError, setJoinError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState("");

  // Scroll refs and state
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // API Hooks
  const queryParams = useMemo(
    () => ({
      subject: context.subject,
      name: context.name,
      medium: context.medium,
      standard: context.standard,
      subjectId: context.subjectId,
      part: context.part,
    }),
    [
      context.subject,
      context.name,
      context.medium,
      context.standard,
      context.subjectId,
      context.part,
    ],
  );

  const {
    data: roomsData,
    refetch: refetchRooms,
    isLoading: roomsLoading,
    error: roomsError,
  } = useGetMyRoomsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [joinRoom, { isLoading: joining }] = useJoinRoomMutation();
  const {
    data: messagesData,
    refetch: refetchMessages,
    isLoading: messagesLoading,
  } = useGetMessagesQuery(
    { roomId: activeRoom?._id },
    { skip: !activeRoom?._id },
  );

  const [sendMessage] = useSendMessageMutation();
  const [uploadFile] = useUploadFileMutation();
  const [muteUser] = useMuteUserMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [pinMessage] = usePinMessageMutation();

  // NEW: Add mutation hooks for reactions, replies, and starring
  const [reactToMessage] = useHandleReactMembersMessageMutation();
  const [replyToMessage] = useHandleReplyMembersMessageMutation();
  const [starMessage] = useHandlehandleStarMembersMessageMutation();
  const onDeleteReply = () => {
    setReplyTo(null);
  };
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile(); // ✅ initial check

    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);
  // ====================== REACTION LOGIC ======================
  const handleReactMessage = async (messageId, emoji) => {
    if (!messageId || !activeRoom?._id || !user?._id) {
      console.error("Missing data for reaction:", {
        messageId,
        activeRoom,
        user,
      });
      return;
    }

    try {
      // Call the mutation
      const response = await reactToMessage({
        roomId: activeRoom._id,
        messageId,
        emoji,
      }).unwrap();
    } catch (error) {
      console.error("Failed to react to message:", error);
      toast.error("Failed to react to message");
    }
  };

  // ====================== STAR LOGIC ======================
  const handleStarMessage = async (messageId, isStarred) => {
    if (!messageId || !activeRoom?._id) {
      console.error("Missing data for starring:", { messageId, activeRoom });
      return;
    }

    try {
      // Call the mutation
      const response = await starMessage({
        roomId: activeRoom._id,
        messageId,
        isStarred,
      }).unwrap();

      // Update local state optimistically
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            return {
              ...msg,
              isStarred,
            };
          }
          return msg;
        }),
      );

      toast.success(isStarred ? "Message starred" : "Message unstarred");
    } catch (error) {
      console.error("Failed to star message:", error);
      toast.error("Failed to star message");
    }
  };

  // ====================== REPLY LOGIC ======================
  const handleReplyToMessage = async (originalMessage) => {
    // console.log("originalMessage", originalMessage);
    // if (!originalMessage || !activeRoom?._id) {
    //   console.error("Missing data for reply:", { originalMessage, activeRoom });
    //   return;
    // }
    // try {
    //   // Set the message to reply to in local state
    //   setReplyTo(originalMessage);
    // } catch (error) {
    //   console.error("Failed to set reply:", error);
    //   toast.error("Failed to set reply");
    // }
  };

  // ====================== SEND MESSAGE WITH REPLY ======================
  const handleSendMessage = async (text) => {
    // console.log("handleSendMessage", text);
    // if (!text.trim() || !activeRoom || !user) return;
    // try {
    //   const messageData = {
    //     roomId: activeRoom._id,
    //     content: { text },
    //     messageType: "text",
    //     replyTo: replyTo?._id,
    //   };
    //   const response = await sendMessage(messageData).unwrap();
    //   // If this is a reply, track it in the backend
    //   if (replyTo?._id) {
    //     try {
    //       await replyToMessage({
    //         roomId: activeRoom._id,
    //         originalMessageId: replyTo._id,
    //         replyMessageId: response._id,
    //       }).unwrap();
    //     } catch (replyError) {
    //       console.error("Failed to track reply in backend:", replyError);
    //       // Don't show error to user, just log it
    //     }
    //   }
    //   // Clear reply state
    //   setReplyTo(null);
    // } catch (error) {
    //   console.error("Failed to send message:", error);
    //   toast.error("Failed to send message");
    // }
  };

  // ====================== COPY MESSAGE TEXT ======================
  const handleCopyMessage = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Message copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy message");
      });
  };

  // ====================== DELETE MESSAGE ======================
  const handleDeleteMessage = async (messageId) => {
    if (!messageId || !activeRoom?._id) return;

    try {
      // Call backend only
      await deleteMessage(messageId).unwrap();

      // ❌ Do NOT update state here
      // Socket event will update all clients (including you)

      toast.success("Message deleted");
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("Failed to delete message");
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      if (file.type.startsWith("image")) {
        setFileType("image");
      } else if (file.type.startsWith("video")) {
        setFileType("video");
      } else if (file.type === "application/pdf") {
        setFileType("pdf");
      }

      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
    e.target.value = "";
  };
  // Send file
  const handleSendFile = async (file) => {
    if (!file || !activeRoom || !user) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("roomId", activeRoom._id);

      const uploadResponse = await uploadFile(formData).unwrap();

      const messageData = {
        roomId: activeRoom._id,
        content: {
          file: {
            url: uploadResponse.url,
            name: file.name,
            type: file.type,
            size: file.size,
          },
        },
        messageType: "file",
      };

      await sendMessage(messageData).unwrap();
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error("Failed to send file:", error);
      toast.error("Failed to send file");
    }
  };
  // Send voice message
  const handleSendVoice = async (voiceBlob) => {
    if (!voiceBlob || !activeRoom || !user) return;

    try {
      const formData = new FormData();
      formData.append("file", voiceBlob, "voice-message.webm");
      formData.append("roomId", activeRoom._id);

      const uploadResponse = await uploadFile(formData).unwrap();

      const messageData = {
        roomId: activeRoom._id,
        content: {
          voice: {
            url: uploadResponse.url,
            duration: voiceBlob.duration,
          },
        },
        messageType: "voice",
      };

      await sendMessage(messageData).unwrap();
    } catch (error) {
      console.error("Failed to send voice message:", error);
    }
  };

  // Mute user
  const handleMuteUser = async (userId, duration) => {
    if (!userId || !activeRoom) return;

    try {
      await muteUser({ userId, roomId: activeRoom._id, duration }).unwrap();
    } catch (error) {
      console.error("Failed to mute user:", error);
    }
  };
  // ====================== PIN MESSAGE ======================
  const handlePinMessage = async (messageId, isPinned) => {
    if (!messageId) return;

    try {
      await pinMessage({
        messageId,
        isPinned,
        roomId: activeRoom?._id,
      }).unwrap();

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            return {
              ...msg,
              isPinned,
            };
          }
          return msg;
        }),
      );

      toast.success(isPinned ? "Message pinned" : "Message unpinned");
    } catch (error) {
      console.error("Failed to pin message:", error);
      toast.error("Failed to pin message");
    }
  };

  // ====================== SOCKET HANDLERS ======================
  // Handle real-time message updates
  useEffect(() => {
    if (!socket || !activeRoom?._id) return;

    const handleNewMessage = ({ message }) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    const handleMessageReactionUpdated = ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg,
        ),
      );
    };

    const handleMessageStarred = ({ messageId, isStarred }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isStarred } : msg,
        ),
      );
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    };

    const handleMessagePinned = ({ messageId, isPinned }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, isPinned } : msg)),
      );
    };

    socket.emit("join-room", activeRoom._id);

    socket.on("newMessage", handleNewMessage);
    socket.on("messageReactionUpdated", handleMessageReactionUpdated); // ✅ FIX
    socket.on("message-starred", handleMessageStarred);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("message-pinned", handleMessagePinned);

    return () => {
      socket.emit("leave-room", activeRoom._id);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageReactionUpdated", handleMessageReactionUpdated); // ✅ FIX
      socket.off("message-starred", handleMessageStarred);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("message-pinned", handleMessagePinned);
    };
  }, [socket, activeRoom]);

  // ====================== LOAD MESSAGES ======================

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData.messages || []);
    }
  }, [messagesData]);

  // ====================== TYPING INDICATORS ======================
  const handleTyping = useCallback(() => {
    if (socket && activeRoom) {
      socket.emit("typing", activeRoom._id);
    }
  }, [socket, activeRoom]);

  const handleStopTyping = useCallback(() => {
    if (socket && activeRoom) {
      socket.emit("stop-typing", activeRoom._id);
    }
  }, [socket, activeRoom]);
  const handleBackToRooms = () => {
    setActiveRoom(null); // room close
    setShowSidebar(true); // sidebar open
  };

  // ====================== ROOM SELECTION ======================
  const handleRoomSelect = (room) => {
    if (!user || !room) return;

    if (!isUserMember(room)) {
      setJoinError("You need to join this hub first to access messages");
      return;
    }

    setActiveRoom(room);
    setMessages([]);
    setReplyTo(null);
    setJoinError(null);
  };
  // In DiscussionStart.jsx - handleRoomSelect function

  // Check if user is a member of the room
  const isUserMember = (room) => {
    if (!user || !room) return false;

    if (
      room.members?.some(
        (member) => member.user === user._id || member.user?._id === user._id,
      )
    ) {
      return true;
    }

    if (room.eligibleStudents?.includes(user._id)) {
      return true;
    }

    if (room.teacherId?._id === user._id || room.teacherId === user._id) {
      return true;
    }

    return false;
  };

  // ====================== SCROLL LOGIC ======================
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom < 50;

    setShowScrollToBottom(!isAtBottom);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (isAtBottom) {
      scrollTimeoutRef.current = setTimeout(() => {
        setShowScrollToBottom(false);
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      const container = messagesContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      if (isNearBottom) {
        const timer = setTimeout(() => {
          scrollToBottom();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, scrollToBottom]);

  const handleManualScrollToBottom = useCallback(() => {
    scrollToBottom();
    setShowScrollToBottom(false);
  }, [scrollToBottom]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // ====================== RENDER ======================
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-600 dark:text-slate-300 px-4 text-center">
          Please login to access the chat
        </p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-600 dark:text-slate-300 px-4 text-center">
          Please login to access the chat
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-screen min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Mobile Header */}
      {isMobile && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          {activeRoom ? (
            <>
              <button
                onClick={handleBackToRooms}
                className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <ChevronLeft size={24} />
                hall
              </button>
              <div className="flex-1 min-w-0 ml-2">
                <h1 className="text-lg font-bold truncate text-slate-800 dark:text-slate-100">
                  {activeRoom.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {onlineUsers.length} online
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Study Hubs
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Join discussions
                </p>
              </div>
            </>
          )}
          {!activeRoom && (
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {showSidebar ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
        ${isMobile ? "fixed top-16 inset-x-0 bottom-0 z-40 transform transition-transform duration-300" : "relative"}
        ${showSidebar || !isMobile ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar
          rooms={roomsData?.rooms || []}
          activeRoom={activeRoom}
          onRoomSelect={handleRoomSelect}
          user={user}
          isJoining={joining}
          onClose={() => setShowSidebar(false)}
          isMobile={isMobile}
          subjectId={subjectId}
          location={location}
          refetchMessages={refetchMessages}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <main
        className={`
        flex-1 flex flex-col relative overflow-hidden
        ${isMobile ? "pt-16" : ""}
        ${!activeRoom && isMobile ? "hidden" : "block"}
      `}
      >
        {activeRoom ? (
          <>
            {/* Blurry Background Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 md:w-96 md:h-96 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Chat Header - Hidden on mobile */}
            {!isMobile && (
              <ChatHeader
                room={activeRoom}
                onlineUsers={onlineUsers}
                user={user}
                // onMuteUser={handleMuteUser}
              />
            )}
            {/* chat content display ivide thudangunnu no tension slow code single */}
            <div className="flex-1 overflow-hidden flex flex-col relative z-10">
              {/* Loading messages */}
              {messagesLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3 md:px-4 py-2"
              >
                {/* Scroll to bottom button namal scrool cheythu mukalilethiyal thazhe pokan parayunnu */}
                {showScrollToBottom && messages.length > 0 && (
                  <button
                    onClick={handleManualScrollToBottom}
                    className="sticky bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 z-50 animate-bounce"
                    style={{ animationDuration: "2s", top: "auto" }}
                  >
                    <ChevronDown size={16} />
                    Scroll to latest
                  </button>
                )}
                {/* oru messagum illenkil ithu work akum */}
                {messages.length === 0 && !messagesLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                      No messages yet
                    </h3>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md px-4">
                      Be the first to start the conversation in this study hub!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* MessageList with all handlers */}
                    <MessageList
                      messages={messages}
                      user={user}
                      onDeleteMessage={handleDeleteMessage}
                      onPinMessage={handlePinMessage}
                      onReply={handleReplyToMessage}
                      onReactMessage={handleReactMessage}
                      onStarMessage={handleStarMessage}
                      onCopyMessage={handleCopyMessage}
                    />

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 italic">
                        {typingUsers.length > 1
                          ? "Several people are typing..."
                          : "Someone is typing..."}
                      </div>
                    )}

                    {/* Scroll anchor at the bottom */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Reply Preview Card messaginte marupadi */}

              {/* Chat Input */}
              <ChatInput
                handleFileChange={handleFileChange}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
                replyTo={replyTo}
                user={user}
                activeRoom={activeRoom}
                isMobile={isMobile}
                selectedFile={selectedFile}
                filePreview={filePreview}
                fileType={fileType}
                onSendFile={handleSendFile}
                onSendVoice={handleSendVoice}
                onDeleteReply={onDeleteReply}
                onClearFile={() => {
                  setSelectedFile(null);
                  setFilePreview(null);
                }}
              />
            </div>
          </>
        ) : (
          !isMobile && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 dark:opacity-10 animate-pulse" />
                <div className="relative bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl md:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl">
                  <LayoutGrid
                    size={40}
                    className="md:w-12 md:h-12 text-blue-500 mx-auto"
                  />
                </div>
              </div>

              {joinError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl max-w-md w-full">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle size={20} />
                    <span className="font-semibold text-sm md:text-base">
                      {joinError}
                    </span>
                  </div>
                </div>
              )}

              <h3 className="text-2xl md:text-3xl font-black mb-3 bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Select a Study Hub
              </h3>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 max-w-md px-4">
                Choose a study hub from the sidebar to join discussions with
                classmates and teachers.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-md w-full">
                <div className="p-3 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="text-blue-500 font-bold text-base md:text-lg mb-2">
                    📚
                  </div>
                  <p className="text-xs md:text-sm font-semibold">
                    Study Groups
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Collaborate on assignments
                  </p>
                </div>
                <div className="p-3 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="text-green-500 font-bold text-base md:text-lg mb-2">
                    💬
                  </div>
                  <p className="text-xs md:text-sm font-semibold">
                    Q&A Discussions
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Get help from experts
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {/* Mobile Empty State */}
        {isMobile && !activeRoom && !showSidebar && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 dark:opacity-10 animate-pulse" />
              <div className="relative bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl">
                <LayoutGrid size={48} className="text-blue-500 mx-auto" />
              </div>
            </div>

            <h3 className="text-2xl font-black mb-3 bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              View Study Hubs
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 max-w-sm">
              Tap the menu button to browse and join study hubs
            </p>

            <button
              onClick={() => setShowSidebar(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
            >
              Browse Hubs
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DiscussionBetweenStudentandTeacher;
