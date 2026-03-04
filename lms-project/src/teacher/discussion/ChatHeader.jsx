import React, { useState } from "react";
import { MoreVertical, Users, Pin, Settings } from "lucide-react";

const ChatHeader = ({ room, onlineUsers, user, onMuteUser }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const isTeacher = user.role === "teacher";

  return (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold">
            {room?.subject?.charAt(0) || "C"}
          </span>
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">{room?.name}</h2>
          <p className="text-sm text-gray-500">
            {room?.subject} • {room?.standard}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Online Count */}
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <Users size={20} />
          <span>{onlineUsers.length} online</span>
        </button>

        {/* Pin Messages */}
        {isTeacher && (
          <button className="p-2 text-gray-600 hover:text-blue-600">
            <Pin size={20} />
          </button>
        )}

        {/* Settings Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-600 hover:text-blue-600"
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-10">
              {isTeacher && (
                <>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    Room Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    Mute All Students
                  </button>
                  <hr className="my-2" />
                </>
              )}
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Clear Chat
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                Export Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 max-w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Participants</h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {onlineUsers.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">
                        {participant.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {participant.role}
                      </p>
                    </div>
                  </div>
                  {isTeacher && participant.role === "student" && (
                    <button
                      onClick={() => onMuteUser(participant.userId, 30)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Mute
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
