import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Bell,
  Hash,
  UserPlus,
  CheckCircle,
  Lock,
  Users,
  X,
  ChevronRight,
  BookOpen,
  Users as UsersIcon,
  Filter,
  Calendar,
  Globe,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Star,
  Award,
  Zap,
  Bookmark,
  Download,
  Share2,
} from "lucide-react";
import {
  useCreateRoomMutation,
  useJoinRoomMutation,
} from "../../store/api/ChatStudentDiscussionApi";
import { toast } from "react-toastify";

const Sidebar = ({
  rooms = [],
  activeRoom,
  onRoomSelect,
  user,
  isJoining,
  onClose,
  isMobile,
  subjectId,
  location,
  refetchMessages,
}) => {
  const item = location.state?.item || {};

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const [newRoomData, setNewRoomData] = useState({
    name: "",
    description: "",
    standard: "",
    subject: "",
    part: "",
    medium: "",
    settings: {
      allowStudentMessages: true,
      allowFileUpload: true,
      allowVoiceMessages: true,
    },
  });

  const [createRoom, { isLoading: creating }] = useCreateRoomMutation();
  const [joinRoom, { isLoading: joining }] = useJoinRoomMutation();

  // Initialize form with item data
  useEffect(() => {
    if (item.subject || item.standard || item.part) {
      setNewRoomData((prev) => ({
        ...prev,
        standard: item.standard || prev.standard,
        subject: item.subject || prev.subject,
        part: item.part || prev.part,
        medium: item.medium || prev.medium,
      }));
    }
  }, [item]);

  // Safely filter rooms with multiple criteria
  const filteredRooms = (Array.isArray(rooms) ? rooms : []).filter((room) => {
    if (!room) return false;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = room.name?.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...newRoomData,
        subjectId,
      };

      const res = await createRoom(payload).unwrap();
      toast.success(res?.message || "Study hub created successfully! 🎉");
      refetchMessages();
      setShowCreateForm(false);
      setNewRoomData({
        name: "",
        description: "",
        standard: item.standard || "",
        subject: item.subject || "",
        part: item.part || "",
        medium: item.medium || "",
        settings: {
          allowStudentMessages: true,
          allowFileUpload: true,
          allowVoiceMessages: true,
        },
      });
    } catch (error) {
      toast.error(
        error?.data?.message || error?.error || "Failed to create hub",
      );
    }
  };

  const handleJoinRoom = async (roomId, e) => {
    e.stopPropagation();
    try {
      const res = await joinRoom(roomId).unwrap();
      toast.success(res?.message || "Successfully joined the hub! 🎯");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to join hub");
    }
  };
  //some() എന്താണ് ചെയ്യുന്നത്? 👉 Array-ൽ കുറഞ്ഞത് ഒരു item എങ്കിലും condition satisfy ചെയ്‌താൽ true return ചെയ്യും

  const isUserMember = (room) => {
    if (!user || !room) return false;
    const userId = user._id;

    // Check multiple membership structures
    if (room.members && Array.isArray(room.members)) {
      return room.members.some(
        (member) =>
          member?.user === userId ||
          member?.user?._id === userId ||
          member === userId,
      );
    }
    if (room.eligibleStudents?.includes(userId)) return true;
    if (room.teacherId?._id === userId || room.teacherId === userId)
      return true;
    if (room.createdBy === userId) return true;

    return false;
  };

  const canUserJoin = (room) => {
    if (!user || !room) return false;

    if (user.roles?.includes("admin") || user.roles?.includes("teacher")) {
      return true;
    }

    return !isUserMember(room);
  };

  // Stats calculations
  const totalRooms = rooms.length;
  const joinedRooms = rooms.filter((room) => isUserMember(room)).length;
  const popularRooms = rooms.filter((room) => room.members?.length >= 5).length;

  return (
    <div
      className={`
      h-full bg-linear-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900
      border-r border-slate-200/80 dark:border-slate-800/50
      flex flex-col shadow-xl dark:shadow-slate-900/50
      backdrop-blur-sm
      ${isMobile ? "w-full" : "w-80 lg:w-96 xl:w-105"}
      transition-all duration-300
    `}
    >
      {/* Header with gradient */}
      <div className="p-4 md:p-6 space-y-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Ask Doubts
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Collaborative learning spaces
                </p>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            )}

            {(user?.roles?.includes("admin") ||
              user?.roles?.includes("teacher")) && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="group relative p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5 text-white transition-transform group-hover:rotate-90" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Stats Bar */}
        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
            <input
              type="text"
              placeholder="Search hubs, topics, or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-slate-100 placeholder-slate-400 text-sm shadow-sm"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Hub Form */}
      {showCreateForm && (
        <div className="m-4 p-5 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-900/50 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 shadow-xl backdrop-blur-sm overflow-y-scroll">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                Create New Hub
              </h3>
            </div>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-4 ">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Hub Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Advanced Calculus Discussion"
                value={newRoomData.name}
                onChange={(e) =>
                  setNewRoomData({ ...newRoomData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Standard
                </label>
                <input
                  type="text"
                  placeholder="Grade"
                  value={newRoomData.standard}
                  onChange={(e) =>
                    setNewRoomData({ ...newRoomData, standard: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Subject"
                  value={newRoomData.subject}
                  onChange={(e) =>
                    setNewRoomData({ ...newRoomData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  part
                </label>
                <input
                  type="number"
                  placeholder="part"
                  value={newRoomData.part}
                  onChange={(e) =>
                    setNewRoomData({ ...newRoomData, part: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  medium
                </label>
                <input
                  type="text"
                  placeholder="medium"
                  value={newRoomData.medium}
                  onChange={(e) =>
                    setNewRoomData({ ...newRoomData, medium: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                placeholder="What will this hub focus on? (optional)"
                value={newRoomData.description}
                onChange={(e) =>
                  setNewRoomData({
                    ...newRoomData,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white text-sm"
                rows="2"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Hub
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Room List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl">
              <Hash className="w-12 h-12 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                {searchQuery ? "No matching hubs found" : "No study hubs yet"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                {searchQuery
                  ? "Try different keywords or create a new hub"
                  : "Be the first to create a collaborative learning space!"}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all"
              >
                Create First Hub
              </button>
            )}
          </div>
        ) : (
          filteredRooms.map((room) => {
            if (!room) return null;

            const isActive = activeRoom?._id === room._id;
            const isMember = isUserMember(room);

            const canJoin = canUserJoin(room);

            const memberCount =
              room.members?.length || room.eligibleStudents?.length || 0;
            const isPopular = memberCount >= 10;

            return (
              <div
                key={room._id}
                onClick={() => {
                  if (isMember) {
                    onRoomSelect(room);
                    if (isMobile && onClose) onClose();
                  }
                }}
                className={`
                  group relative p-4 rounded-2xl transition-all duration-300 cursor-pointer
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-lg"
                      : "bg-white/80 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                  }
                  ${!isMember && "opacity-80"}
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                )}

                <div className="flex items-start gap-4">
                  {/* Room Icon */}
                  <div
                    className={`
                    w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                    ${
                      isActive
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30"
                        : isMember
                          ? "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20"
                          : "bg-slate-100 dark:bg-slate-700"
                    }
                  `}
                  >
                    <MessageSquare
                      className={`
                      w-6 h-6
                      ${
                        isActive
                          ? "text-white"
                          : isMember
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400"
                      }
                    `}
                    />
                  </div>

                  {/* Room Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`
                            font-bold truncate
                            ${
                              isActive
                                ? "text-blue-700 dark:text-blue-300"
                                : isMember
                                  ? "text-slate-800 dark:text-slate-100"
                                  : "text-slate-600 dark:text-slate-400"
                            }
                          `}
                          >
                            {room.name || "Unnamed Hub"}
                          </h3>
                          {isPopular && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                              POPULAR
                            </span>
                          )}
                          {!isMember && (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Grade {room.standard || "All"}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {room.subject || "General"}
                          </span>
                        </div>

                        {room.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                            {room.description}
                          </p>
                        )}
                      </div>

                      {/* Join Button */}
                      <div className="flex flex-col items-end gap-2">
                        {isMember ? (
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Joined
                          </div>
                        ) : canJoin ? (
                          <button
                            onClick={(e) => handleJoinRoom(room._id, e)}
                            disabled={joining}
                            className="group/join flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-500/30 disabled:opacity-50"
                          >
                            <UserPlus className="w-3.5 h-3.5 group-hover/join:scale-110 transition-transform" />
                            {joining ? "Joining..." : "Join"}
                          </button>
                        ) : null}

                        {/* Member Count */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-semibold">{memberCount}</span>
                          </div>
                          {room.isActive === false && (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-xs">
                              Archived
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Teacher/Author */}
                    {room.teacherId && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                          {room.teacherId.name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {room.teacherId.name || "Teacher"}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Host
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Profile & Actions */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">
                {user?.name || "User"}
              </h4>
              <div className="flex items-center gap-2">
                {user?.roles?.map((role, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Zap className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
