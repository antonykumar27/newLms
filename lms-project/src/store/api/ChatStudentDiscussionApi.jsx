import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ DEFINE BASE QUERY FIRST
const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/studentDiscussion`,
  prepareHeaders: (headers, { getState }) => {
    const state = getState();
    const token = state.auth?.user?.token || localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const chatDiscussionApi = createApi({
  reducerPath: "chatDiscussionApi",
  baseQuery,
  tagTypes: ["ChatRoom", "Message"],

  endpoints: (builder) => ({
    // ================= ROOM =================
    createRoom: builder.mutation({
      query: (roomData) => ({
        url: "/chat/rooms",
        method: "POST",
        body: roomData,
      }),
      invalidatesTags: ["ChatRoom"],
    }),

    getMyRooms: builder.query({
      query: ({ subjectId, subject, name, medium, standard, part }) => ({
        url: "/chat/rooms",
        params: {
          ...(subject && { subject }),
          ...(name && { name }),
          ...(medium && { medium }),
          ...(standard && { standard }),
          ...(part && { part }),
          ...(subjectId && { subjectId }),
        },
      }),
      providesTags: ["ChatRoom"],
    }),

    getStudentRooms: builder.query({
      query: () => "/chat/rooms/student",
      providesTags: ["ChatRoom"],
    }),
    joinRoom: builder.mutation({
      query: (roomId) => ({
        url: `/chat/rooms/${roomId}/join`,
        method: "POST",
      }),
      invalidatesTags: ["ChatRoom"],
    }),

    // ================= MESSAGES =================
    getMessages: builder.query({
      query: ({ roomId, page = 1 }) =>
        `/chat/rooms/${roomId}/messages?page=${page}`,
      providesTags: (result, error, arg) => [
        { type: "Message", id: arg.roomId },
      ],
    }),

    sendMessage: builder.mutation({
      query: (formData) => ({
        url: `/chat/rooms/messages`,
        method: "POST",
        body: formData,
      }),
    }),

    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `/chat/messages/${messageId}`,
        method: "DELETE",
      }),
    }),

    pinMessage: builder.mutation({
      query: (messageId) => ({
        url: `/chat/messages/${messageId}/pin`,
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateMessage(data.message));
        } catch (error) {
          console.error("Failed to pin message:", error);
        }
      },
    }),

    // ================= FILE =================
    uploadFile: builder.mutation({
      query: (formData) => ({
        url: "/chat/upload",
        method: "POST",
        body: formData,
      }),
    }),

    // ================= USERS =================
    muteUser: builder.mutation({
      query: ({ userId, roomId, duration }) => ({
        url: `/chat/users/${userId}/mute`,
        method: "POST",
        body: { roomId, duration },
      }),
    }),

    getRoomMembers: builder.query({
      query: (roomId) => `/chat/rooms/${roomId}/members`,
    }),
    handleReactMembersMessage: builder.mutation({
      query: ({ roomId, messageId, emoji }) => ({
        url: `/chat/rooms/react/${messageId}/members`,
        method: "POST",
        body: {
          roomId,
          emoji, // null = remove reaction
        },
      }),
    }),

    handleReplyMembersMessage: builder.mutation({
      query: (messageId) => ({
        url: `/chat/rooms/replay/${messageId}/members`,
        method: "POST",
      }),
    }),
    handlehandleStarMembersMessage: builder.mutation({
      query: (messageId) => ({
        url: `/chat/rooms/star/${messageId}/members`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useHandleReactMembersMessageMutation,
  useHandleReplyMembersMessageMutation,
  useHandlehandleStarMembersMessageMutation,
  useCreateRoomMutation,
  useGetMyRoomsQuery,
  useGetStudentRoomsQuery,
  useJoinRoomMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  usePinMessageMutation,
  useUploadFileMutation,
  useMuteUserMutation,
  useGetRoomMembersQuery,
} = chatDiscussionApi;

export default chatDiscussionApi;
