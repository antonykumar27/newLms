import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const mathsLessonsApi = createApi({
  reducerPath: "mathsLessonsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/mathsLessons`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Lessons", "Lesson", "Progress", "Engagement"],

  endpoints: (builder) => ({
    // 🔸 CREATE LESSON (Teacher)
    createLesson: builder.mutation({
      query: (data) => ({
        url: "/save",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Lessons"],
    }),
    // 🔸 CREATE LESSON (Teacher)
    createVideoAudioLesson: builder.mutation({
      query: (data) => ({
        url: "/saveVideoAudio",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Lessons"],
    }),
    markAsCompleted: builder.mutation({
      query: (data) => ({
        url: "/markAsCompleted",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Lessons"],
    }),
    // 🔸 GET SINGLE LESSON (Student View)
    getLessonById: builder.query({
      query: (lessonId) => `/page/${lessonId}`,
      providesTags: (result, error, lessonId) => [
        { type: "Lesson", id: lessonId },
      ],
    }),
    // 🔸 GET SINGLE LESSON (Student View)
    getChapterById: builder.query({
      query: (ChapterId) => `/${ChapterId}`,
      providesTags: (result, error, ChapterId) => [
        { type: "Chapter", id: ChapterId },
      ],
    }),
    // 🔸 GET PageId progress
    getChapterByPageId: builder.query({
      query: (ChapterId) => `/pageprogress/${ChapterId}`,
      providesTags: (result, error, ChapterId) => [
        { type: "Chapter", id: ChapterId },
      ],
    }),
    // 🔸 GET PageId Quiz progress
    getChapterQuizByPageId: builder.query({
      query: (ChapterId) => `/pageQuizprogress/${ChapterId}`,
      providesTags: (result, error, ChapterId) => [
        { type: "Chapter", id: ChapterId },
      ],
    }),
    // 🔸 UPDATE LESSON
    updateLesson: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Lesson", id }],
    }),

    // 🔸 GET ALL LESSONS BY TEACHER
    getLessonsByTeacher: builder.query({
      query: (teacherId) => `/teacher/${teacherId}`,
      providesTags: ["Lessons"],
    }),
    // Update or create progress
    updateProgress: builder.mutation({
      query: (progressData) => ({
        url: "/progress/update",
        method: "POST",
        body: progressData,
      }),
      invalidatesTags: ["Progress"],
    }),

    // Get user's progress for a chapter
    getChapterProgress: builder.query({
      query: ({ userId, chapterId }) => ({
        url: `/progress/chapter/${chapterId}`,
        params: { userId },
      }),
      providesTags: ["Progress"],
    }),

    // Get overall progress for subject
    getSubjectProgress: builder.query({
      query: ({ userId, subjectId }) => ({
        url: `/progress/subject/${subjectId}`,
        params: { userId },
      }),
      providesTags: ["Progress"],
    }),

    // Mark multiple pages as completed
    bulkUpdateProgress: builder.mutation({
      query: (progressArray) => ({
        url: "/progress/bulk-update",
        method: "POST",
        body: { progress: progressArray },
      }),
      invalidatesTags: ["Progress"],
    }),
    updateEngagement: builder.mutation({
      query: (data) => ({
        url: "/progress/engagement-update",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Engagement"],
    }),
  }),
});

export const {
  useUpdateEngagementMutation,
  useMarkAsCompletedMutation,
  useCreateLessonMutation,
  useCreateVideoAudioLessonMutation,
  useGetLessonByIdQuery,
  useGetChapterByIdQuery,
  useGetChapterByPageIdQuery,
  useGetChapterQuizByPageIdQuery,
  useUpdateLessonMutation,
  useGetLessonsByTeacherQuery,
  useUpdateProgressMutation,
  useGetChapterProgressQuery,
  useGetSubjectProgressQuery,
  useBulkUpdateProgressMutation,
} = mathsLessonsApi;
