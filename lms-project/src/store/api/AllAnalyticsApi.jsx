// services/api/analyticsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const allAnalyticsApi = createApi({
  reducerPath: "allAnalyticsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/analytics/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["WatchTime", "Analytics"],

  endpoints: (builder) => ({
    // ========================
    // WATCH TIME
    // ========================
    saveWatchTime: builder.mutation({
      query: (data) => ({
        url: "watch-time",
        method: "POST",
        body: data, // ⬅️ send RAW data only
      }),
    }),

    batchSaveWatchTime: builder.mutation({
      query: (sessions) => ({
        url: "watch-time/batch",
        method: "POST",
        body: { sessions },
      }),
    }),

    getVideoProgress: builder.query({
      query: ({ courseId, videoId }) => `progress/${courseId}/${videoId}`,
      providesTags: ["WatchTime"],
    }),

    // ========================
    // USER INTERACTIONS
    // ========================
    trackInteraction: builder.mutation({
      query: (data) => ({
        url: "/interaction",
        method: "POST",
        body: data,
      }),
    }),
    trackInteractionhandleEnroll: builder.mutation({
      query: (data) => ({
        url: "/conversion",
        method: "POST",
        body: data,
      }),
    }),
    trackvideoscreenshotinteraction: builder.mutation({
      query: (data) => ({
        url: "/video_screenshot/interaction",
        method: "POST",
        body: data,
      }),
    }),
    saveVideoProgress: builder.mutation({
      query: ({ courseId, videoId, data }) => ({
        url: `/courses/${courseId}/videos/${videoId}/progress`,
        method: "POST",
        body: data,
      }),
    }),
    // ✅ Track watch time
    trackWatchTime: builder.mutation({
      query: (data) => ({
        url: "/analytics/watch-time",
        method: "POST",
        body: data,
      }),
    }),
    getUserVideoState: builder.query({
      query: ({ pageId, videoId }) => ({
        url: `/page/${pageId}/videos/${videoId}/`,
        method: "Get",
      }),
    }),
    getUserVideoWatchTime: builder.query({
      query: ({ courseId, videoId }) => ({
        url: `/courses/${courseId}/videos/${videoId}/watch-time/student`,
        method: "Get",
      }),
    }),
    trackVideoSeek: builder.mutation({
      query: (data) => ({
        url: "/analytics/interaction",
        method: "POST",
        body: data,
      }),
    }),
    //play and interaction save ivide yanu
    trackVideoInteraction: builder.mutation({
      query: (data) => ({
        url: "/analytics/interaction",
        method: "POST",
        body: data,
      }),
    }),

    completeVideo: builder.mutation({
      query: ({ courseId, videoId }) => ({
        url: `/${courseId}/videos/${videoId}/complete`,
        method: "POST",
      }),
    }),
    // ✅ GET USER INTERACTIONS
    getUserInteractions: builder.query({
      query: (params = {}) => ({
        url: "/analytics/interaction/user",
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          type: params.type,
          courseId: params.courseId,
          videoId: params.videoId,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }),
      providesTags: ["Interaction"],
    }),
    // ✅ GET INTERACTION STATS
    getInteractionStats: builder.query({
      query: (params = {}) => ({
        url: "/analytics/interaction/stats",
        params,
      }),
    }),
    // ========================
    // LEARNING STATS
    // ========================
    getLearningStats: builder.query({
      query: () => "stats",
      providesTags: ["Analytics"],
    }),
    getUserAnalytics: builder.query({
      query: () => "/analytics/stats",
      providesTags: ["WatchTime", "Interaction"],
    }),

    getDailyStudyTime: builder.query({
      query: ({ startDate, endDate }) => ({
        url: "study-time",
        params: { startDate, endDate },
      }),
    }),

    getCourseAnalytics: builder.query({
      query: (courseId) => `courses/${courseId}`,
      providesTags: ["Analytics"],
    }),
    // ========================
    // STUDENT ANALYTICS (NEW)
    // ========================

    // 📊 Overall Student Analytics
    getStudentAnalytics: builder.query({
      query: () => "student/overview",
      providesTags: ["Analytics"],
    }),

    // 🔥 Student Streak
    getStudentStreak: builder.query({
      query: () => "student/streak",
      providesTags: ["Analytics"],
    }),

    // 📈 Weekly Activity Chart
    getWeeklyActivity: builder.query({
      query: ({ startDate, endDate }) => ({
        url: "student/weekly-activity",
        params: { startDate, endDate },
      }),
      providesTags: ["Analytics"],
    }),

    // 🏆 Student Badges
    getStudentBadges: builder.query({
      query: () => "student/badges",
      providesTags: ["Analytics"],
    }),

    // 🧠 Smart Insights
    getStudentInsights: builder.query({
      query: () => "student/insights",
      providesTags: ["Analytics"],
    }),

    // 🟢 Heatmap Data
    getHeatmapData: builder.query({
      query: ({ year }) => ({
        url: "student/heatmap",
        params: { year },
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  // Watch time
  useSaveWatchTimeMutation,

  useBatchSaveWatchTimeMutation,
  useGetVideoProgressQuery,

  // Interactions
  useTrackInteractionMutation,
  useGetUserInteractionsQuery,
  useTrackInteractionhandleEnrollMutation,
  useSaveVideoProgressMutation,
  useTrackvideoscreenshotinteractionMutation,
  useTrackWatchTimeMutation,
  useGetUserVideoStateQuery,
  useTrackVideoSeekMutation,

  useTrackVideoInteractionMutation,
  useCompleteVideoMutation,
  // Stats
  useGetUserAnalyticsQuery,
  useGetLearningStatsQuery,
  useGetDailyStudyTimeQuery,
  useGetCourseAnalyticsQuery,
  useGetInteractionStatsQuery,
  useGetUserVideoWatchTimeQuery,
  //analytics
  useGetStudentAnalyticsQuery,
  useGetStudentStreakQuery,
  useGetWeeklyActivityQuery,
  useGetStudentBadgesQuery,
  useGetStudentInsightsQuery,
  useGetHeatmapDataQuery,
} = allAnalyticsApi;
