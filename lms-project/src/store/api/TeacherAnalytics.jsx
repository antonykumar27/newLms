import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherAnalyticsApi = createApi({
  reducerPath: "teacherAnalyticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/teacher/`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Dashboard",
    "Course",
    "Session",
    "Student",
    "Analytics",
    "Activity",
    "Material",
    "Assignment",
    "Request",
  ],
  endpoints: (builder) => ({
    // 📊 DASHBOARD STATS
    getDashboardStats: builder.query({
      query: (range = "month") => ({
        url: `dashboard/stats?range=${range}`,
        method: "GET",
      }),
      providesTags: ["Dashboard"],
      // Cache for 1 minute
      keepUnusedDataFor: 60,
    }),

    // 📈 COURSE ANALYTICS
    getCourseAnalytics: builder.query({
      query: () => ({
        url: "courses/analytics",
        method: "GET",
      }),
      providesTags: ["Course", "Analytics"],
    }),

    // 📅 UPCOMING SESSIONS
    getUpcomingSessions: builder.query({
      query: () => ({
        url: "sessions/upcoming",
        method: "GET",
      }),
      providesTags: ["Session"],
    }),

    // 📝 RECENT ACTIVITIES
    getRecentActivities: builder.query({
      query: () => ({
        url: "activities",
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),

    // 👥 STUDENT REQUESTS
    getStudentRequests: builder.query({
      query: () => ({
        url: "student-requests",
        method: "GET",
      }),
      providesTags: ["Student", "Request"],
    }),

    // ✅ APPROVE STUDENT REQUEST
    approveStudentRequest: builder.mutation({
      query: (requestId) => ({
        url: `student-requests/${requestId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Student", "Request", "Dashboard"],
    }),

    // ❌ REJECT STUDENT REQUEST
    rejectStudentRequest: builder.mutation({
      query: (requestId) => ({
        url: `student-requests/${requestId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["Student", "Request"],
    }),

    // 📚 COURSES MANAGEMENT
    getCourses: builder.query({
      query: ({ page = 1, limit = 10, status = "" } = {}) => ({
        url: `courses?page=${page}&limit=${limit}&status=${status}`,
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    getCourseById: builder.query({
      query: (courseId) => ({
        url: `courses/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [{ type: "Course", id: arg }],
    }),

    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "courses",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Course", "Dashboard"],
    }),

    updateCourse: builder.mutation({
      query: ({ id, ...courseData }) => ({
        url: `courses/${id}`,
        method: "PUT",
        body: courseData,
      }),
      invalidatesTags: ["Course"],
    }),

    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course", "Dashboard"],
    }),

    // 🏫 CREATE SCHOOL COURSE
    createSchoolCourse: builder.mutation({
      query: (courseData) => ({
        url: "courses/school",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Course", "Dashboard"],
    }),

    // 🎓 STUDENTS MANAGEMENT
    getStudents: builder.query({
      query: ({ page = 1, limit = 10, courseId = "" } = {}) => ({
        url: `students?page=${page}&limit=${limit}&courseId=${courseId}`,
        method: "GET",
      }),
      providesTags: ["Student"],
    }),

    getStudentDetails: builder.query({
      query: (studentId) => ({
        url: `students/${studentId}`,
        method: "GET",
      }),
      providesTags: ["Student"],
    }),

    // 📅 SESSIONS MANAGEMENT
    getSessions: builder.query({
      query: ({ page = 1, limit = 10, status = "upcoming" } = {}) => ({
        url: `sessions?page=${page}&limit=${limit}&status=${status}`,
        method: "GET",
      }),
      providesTags: ["Session"],
    }),

    createSession: builder.mutation({
      query: (sessionData) => ({
        url: "sessions",
        method: "POST",
        body: sessionData,
      }),
      invalidatesTags: ["Session", "Dashboard"],
    }),

    updateSession: builder.mutation({
      query: ({ id, ...sessionData }) => ({
        url: `sessions/${id}`,
        method: "PUT",
        body: sessionData,
      }),
      invalidatesTags: ["Session"],
    }),

    deleteSession: builder.mutation({
      query: (sessionId) => ({
        url: `sessions/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Session"],
    }),

    startSession: builder.mutation({
      query: (sessionId) => ({
        url: `sessions/${sessionId}/start`,
        method: "POST",
      }),
      invalidatesTags: ["Session"],
    }),

    // 📝 ASSIGNMENTS
    getAssignments: builder.query({
      query: ({ page = 1, limit = 10, courseId = "" } = {}) => ({
        url: `assignments?page=${page}&limit=${limit}&courseId=${courseId}`,
        method: "GET",
      }),
      providesTags: ["Assignment"],
    }),

    createAssignment: builder.mutation({
      query: (assignmentData) => ({
        url: "assignments",
        method: "POST",
        body: assignmentData,
      }),
      invalidatesTags: ["Assignment"],
    }),

    gradeAssignment: builder.mutation({
      query: ({ assignmentId, studentId, grade, feedback }) => ({
        url: `assignments/${assignmentId}/grade/${studentId}`,
        method: "POST",
        body: { grade, feedback },
      }),
      invalidatesTags: ["Assignment"],
    }),

    // 📁 MATERIALS
    getMaterials: builder.query({
      query: ({ page = 1, limit = 10, courseId = "" } = {}) => ({
        url: `materials?page=${page}&limit=${limit}&courseId=${courseId}`,
        method: "GET",
      }),
      providesTags: ["Material"],
    }),

    uploadMaterial: builder.mutation({
      query: (formData) => ({
        url: "materials",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Material"],
    }),

    deleteMaterial: builder.mutation({
      query: (materialId) => ({
        url: `materials/${materialId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Material"],
    }),

    // 💰 EARNINGS & PAYMENTS
    getEarnings: builder.query({
      query: ({ startDate, endDate } = {}) => ({
        url: `earnings?startDate=${startDate || ""}&endDate=${endDate || ""}`,
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),

    requestWithdrawal: builder.mutation({
      query: (amount) => ({
        url: "withdrawals/request",
        method: "POST",
        body: { amount },
      }),
      invalidatesTags: ["Dashboard"],
    }),

    getWithdrawals: builder.query({
      query: () => ({
        url: "withdrawals",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),

    // 💬 MESSAGES
    getMessages: builder.query({
      query: ({ studentId = "", page = 1, limit = 20 } = {}) => ({
        url: `messages?studentId=${studentId}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),

    sendMessage: builder.mutation({
      query: ({ studentId, message }) => ({
        url: "messages",
        method: "POST",
        body: { studentId, message },
      }),
      invalidatesTags: ["Activity"],
    }),

    // 📊 ADVANCED ANALYTICS
    getPerformanceAnalytics: builder.query({
      query: ({ startDate, endDate, metrics = [] } = {}) => ({
        url: "analytics/performance",
        method: "POST",
        body: { startDate, endDate, metrics },
      }),
      providesTags: ["Analytics"],
    }),

    // 🔄 BULK ACTIONS
    bulkUpdateCourseStatus: builder.mutation({
      query: ({ courseIds, status }) => ({
        url: "courses/bulk/status",
        method: "PUT",
        body: { courseIds, status },
      }),
      invalidatesTags: ["Course", "Dashboard"],
    }),

    // 📄 EXPORT DATA
    exportData: builder.mutation({
      query: ({ type, format = "csv", filters = {} }) => ({
        url: "export",
        method: "POST",
        body: { type, format, filters },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Dashboard
  useGetDashboardStatsQuery,
  useLazyGetDashboardStatsQuery,

  // Course Analytics
  useGetCourseAnalyticsQuery,
  useLazyGetCourseAnalyticsQuery,

  // Sessions
  useGetUpcomingSessionsQuery,
  useLazyGetUpcomingSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useStartSessionMutation,

  // Activities
  useGetRecentActivitiesQuery,
  useLazyGetRecentActivitiesQuery,

  // Student Requests
  useGetStudentRequestsQuery,
  useLazyGetStudentRequestsQuery,
  useApproveStudentRequestMutation,
  useRejectStudentRequestMutation,

  // Courses
  useGetCoursesQuery,
  useLazyGetCoursesQuery,
  useGetCourseByIdQuery,
  useLazyGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useCreateSchoolCourseMutation,

  // Students
  useGetStudentsQuery,
  useLazyGetStudentsQuery,
  useGetStudentDetailsQuery,
  useLazyGetStudentDetailsQuery,

  // Sessions
  useGetSessionsQuery,
  useLazyGetSessionsQuery,

  // Assignments
  useGetAssignmentsQuery,
  useLazyGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useGradeAssignmentMutation,

  // Materials
  useGetMaterialsQuery,
  useLazyGetMaterialsQuery,
  useUploadMaterialMutation,
  useDeleteMaterialMutation,

  // Earnings
  useGetEarningsQuery,
  useLazyGetEarningsQuery,
  useRequestWithdrawalMutation,
  useGetWithdrawalsQuery,
  useLazyGetWithdrawalsQuery,

  // Messages
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,

  // Analytics
  useGetPerformanceAnalyticsQuery,
  useLazyGetPerformanceAnalyticsQuery,

  // Bulk Actions
  useBulkUpdateCourseStatusMutation,

  // Export
  useExportDataMutation,
} = teacherAnalyticsApi;
