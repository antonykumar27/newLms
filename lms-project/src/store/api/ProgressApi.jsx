// src/store/api/ProgressApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const progressApi = createApi({
  reducerPath: "progressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/progressRoutes`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Progress",
    "Certificate",
    "UserInteraction",
    "CourseAnalytics",
    "Alerts",
  ],
  endpoints: (builder) => ({
    // Get user progress for a course

    getUserProgress: builder.query({
      query: () => "/reports/progress/now",
      providesTags: ["Progress"],
      transformResponse: (response) => response.data,
    }),

    // ✅ Get specific course progress
    getCourseProgress: builder.query({
      query: (courseId) => `/reports/progress?courseId=${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: "Progress", id: courseId },
        "Progress",
      ],
      transformResponse: (response) => response.data,
    }),

    // ✅ Get student progress (for teachers/admins)
    getStudentProgress: builder.query({
      query: ({ studentId, courseId }) => {
        let url = `/reports/progress?studentId=${studentId}`;
        if (courseId) url += `&courseId=${courseId}`;
        return url;
      },
      providesTags: (result, error, { studentId }) => [
        { type: "Progress", id: `student-${studentId}` },
        "Progress",
      ],
      transformResponse: (response) => response.data,
    }),

    // ✅ Refresh progress data
    refreshProgress: builder.mutation({
      query: (courseId) => ({
        url: courseId
          ? `/reports/progress?courseId=${courseId}`
          : "/reports/progress",
        method: "GET",
      }),
      invalidatesTags: ["Progress"],
    }),
    // Get specific lecture progress
    getLectureProgress: builder.query({
      query: ({ courseId, lectureId }) =>
        `/course/${courseId}/lecture/${lectureId}`,
      providesTags: (result, error, { lectureId }) => [
        { type: "Progress", id: lectureId },
      ],
    }),

    // Track video progress
    trackProgress: builder.mutation({
      query: (data) => ({
        url: "/track",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Progress"],
    }),
    // Track page Time spent Time progress
    trackTimeSpentProgress: builder.mutation({
      query: (data) => ({
        url: "/trackSpentTime",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Progress"],
    }),

    // Mark lecture as complete
    markLectureComplete: builder.mutation({
      query: (data) => ({
        url: "/complete",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Progress"],
    }),

    // Generate certificate
    generateCertificate: builder.mutation({
      query: (courseId) => ({
        url: `/certificates/${courseId}/generate`,
        method: "POST",
      }),
      invalidatesTags: ["Certificate"],
    }),

    // Get certificate
    getCertificate: builder.query({
      query: (courseId) => `/certificates/${courseId}`,
      providesTags: ["Certificate"],
    }),
    // 📊 Get User Interaction Profile
    getUserInteractionProfile: builder.query({
      query: ({ userId, days = 30 }) => ({
        url: `/interaction-analytics/user/${userId}`,
        params: { days },
      }),
      providesTags: (result, error, { userId }) => [
        { type: "UserInteraction", id: userId },
      ],
    }),

    // Refresh data
    refreshUserProfile: builder.mutation({
      query: ({ userId, days = 30 }) => ({
        url: `/interaction-analytics/user/${userId}/refresh`,
        method: "POST",
        params: { days },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "UserInteraction", id: userId },
      ],
    }),
    // 📊 Get Course Analytics
    getCourseAnalytics: builder.query({
      query: ({ subjectId, startDate, endDate }) => ({
        url: `/progressRoutes/interaction-analytics/course/${subjectId}`,
        params: { startDate, endDate },
      }),
      providesTags: (result, error, { subjectId }) => [
        { type: "CourseAnalytics", id: subjectId },
      ],
    }),

    // 🔄 Refresh Course Analytics
    refreshCourseAnalytics: builder.mutation({
      query: ({ subjectId, startDate, endDate }) => ({
        url: `/progressRoutes/interaction-analytics/course/${subjectId}/refresh`,
        method: "POST",
        params: { startDate, endDate },
      }),
      invalidatesTags: (result, error, { subjectId }) => [
        { type: "CourseAnalytics", id: subjectId },
      ],
    }),

    // 📥 Export Course Report
    exportCourseReport: builder.mutation({
      query: ({ subjectId, format = "pdf", startDate, endDate }) => ({
        url: `/progressRoutes/interaction-analytics/course/${subjectId}/export`,
        method: "POST",
        params: { format, startDate, endDate },
      }),
    }),
    // 📊 Get Platform Analytics
    getPlatformAnalytics: builder.query({
      query: ({ days = 30, tier }) => ({
        url: "/progressRoutes/interaction-analytics/platform",
        params: { days, tier },
      }),
      providesTags: ["PlatformAnalytics"],
    }),

    // 🔄 Refresh Platform Analytics
    refreshPlatformAnalytics: builder.mutation({
      query: ({ days, tier }) => ({
        url: "/progressRoutes/interaction-analytics/platform/refresh",
        method: "POST",
        params: { days, tier },
      }),
      invalidatesTags: ["PlatformAnalytics"],
    }),

    // 📥 Export Executive Report
    exportExecutiveReport: builder.mutation({
      query: ({ format = "pdf", days }) => ({
        url: "/progressRoutes/interaction-analytics/platform/export",
        method: "POST",
        params: { format, days },
      }),
    }),
    // Add video deep dive endpoints
    getVideoDeepDive: builder.query({
      query: (videoId) => ({
        url: `/progressRoutes/interaction-analytics/video/${videoId}/deepdive`,
      }),
      providesTags: (result, error, videoId) => [
        { type: "VideoAnalytics", id: videoId },
      ],
    }),

    refreshVideoDeepDive: builder.mutation({
      query: (videoId) => ({
        url: `/progressRoutes/interaction-analytics/video/${videoId}/refresh`,
        method: "POST",
      }),
      invalidatesTags: (result, error, videoId) => [
        { type: "VideoAnalytics", id: videoId },
      ],
    }),

    exportVideoDeepDive: builder.mutation({
      query: ({ videoId, format = "pdf" }) => ({
        url: `/progressRoutes/interaction-analytics/video/${videoId}/export`,
        method: "POST",
        params: { format },
      }),
    }),
    // 🚨 Get All Alerts
    getAlerts: builder.query({
      query: () => ({
        url: "/progressRoutes/interaction-analytics/alerts",
      }),
      providesTags: ["Alerts"],
      pollingInterval: 30000, // Poll every 30 seconds
    }),

    // ✅ Acknowledge Alert
    acknowledgeAlert: builder.mutation({
      query: (alertId) => ({
        url: `/progressRoutes/interaction-analytics/alerts/${alertId}/acknowledge`,
        method: "POST",
      }),
      invalidatesTags: ["Alerts"],
    }),

    // 🔕 Mute Alert
    muteAlert: builder.mutation({
      query: (alertId) => ({
        url: `/progressRoutes/interaction-analytics/alerts/${alertId}/mute`,
        method: "POST",
      }),
      invalidatesTags: ["Alerts"],
    }),

    // 📊 Get Alert History
    getAlertHistory: builder.query({
      query: ({ days = 7 }) => ({
        url: "/progressRoutes/interaction-analytics/alerts/history",
        params: { days },
      }),
    }),

    // Get single video progress
    getUserWatchProgress: builder.query({
      query: ({ videoId, pageId }) => ({
        url: `/progress/${videoId}/${pageId}`,
        method: "GET",
      }),
      providesTags: (result, error, { pageId }) => [
        { type: "WatchProgress", id: pageId },
      ],
    }),

    // Get all user progress with filters
    getUserAllProgress: builder.query({
      query: (filters) => ({
        url: "/progress/all",
        method: "GET",
        params: filters,
      }),
      providesTags: ["WatchProgress"],
    }),
    // Get all user progress with filters
    getUserAllStudentDashBoard: builder.query({
      query: () => ({
        url: "/progress/allStudentDashBoard",
        method: "GET",
      }),
      providesTags: ["WatchProgress"],
    }),
    // Get continue watching list
    getContinueWatching: builder.query({
      query: (limit = 10) => ({
        url: "/progress/continue-watching",
        method: "GET",
        params: { limit },
      }),
      providesTags: ["WatchProgress"],
    }),

    // Get video analytics
    getVideoAnalytics: builder.query({
      query: ({ videoId, ...params }) => ({
        url: `/analytics/video/${videoId}`,
        method: "GET",
        params,
      }),
      providesTags: (result, error, { videoId }) => [
        { type: "Analytics", id: videoId },
      ],
    }),

    // Get user engagement report
    getUserEngagementReport: builder.query({
      query: ({ userId, days = 30 }) => ({
        url: `/analytics/user/${userId}`,
        method: "GET",
        params: { days },
      }),
      providesTags: (result, error, { userId }) => [
        { type: "UserEngagement", id: userId },
      ],
    }),

    // Get platform analytics (admin only)
    useGetPlatformAnalytics1Query: builder.query({
      query: (params) => ({
        url: "/analytics/platform",
        method: "GET",
        params,
      }),
      providesTags: ["PlatformAnalytics"],
    }),
  }),
});

export const {
  useGetUserProgressQuery,
  useGetUserAllStudentDashBoardQuery,

  useGetLectureProgressQuery,
  useTrackProgressMutation,
  useTrackTimeSpentProgressMutation,
  useMarkLectureCompleteMutation,
  useGenerateCertificateMutation,
  useGetCertificateQuery,

  useGetCourseProgressQuery,
  useGetStudentProgressQuery,
  useRefreshProgressMutation,

  //analytic 2/13/2026 night
  useGetUserInteractionProfileQuery,
  useRefreshUserProfileMutation,
  useGetCourseAnalyticsQuery,
  useRefreshCourseAnalyticsMutation,
  useExportCourseReportMutation,
  useGetPlatformAnalyticsQuery,
  useRefreshPlatformAnalyticsMutation,
  useExportExecutiveReportMutation,
  useGetVideoDeepDiveQuery, // Add this
  useRefreshVideoDeepDiveMutation, // Add this
  useExportVideoDeepDiveMutation, // Add this
  useGetAlertsQuery,
  useAcknowledgeAlertMutation,
  useMuteAlertMutation,
  useGetAlertHistoryQuery,

  useGetUserWatchProgressQuery,
  useGetUserAllProgressQuery,
  useGetContinueWatchingQuery,
  useGetVideoAnalyticsQuery,
  useGetUserEngagementReportQuery,
  useGetPlatformAnalytics1Query,
} = progressApi;
