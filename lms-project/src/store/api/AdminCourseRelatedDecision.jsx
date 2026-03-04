import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminCourseRelatedDecisionApi = createApi({
  reducerPath: "adminCourseRelatedDecisionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin`,

    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["AdminCourse", "AdminApplication", "AdminTeacher"],

  endpoints: (builder) => ({
    /* =====================================================
       COURSES
    ===================================================== */

    // Get all courses
    getAllCourses: builder.query({
      query: (params) => ({
        url: "/courses",
        params,
      }),
      providesTags: ["AdminCourse"],
    }),

    // Get course by ID
    getAdminCourseById: builder.query({
      query: (id) => `/courses/${id}`,
    }),

    // Update course status
    updateCourseStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/courses/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["AdminCourse"],
    }),

    // Approve course
    approveCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["AdminCourse"],
    }),

    // Reject course
    rejectCourse: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/courses/${id}/reject`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["AdminCourse"],
    }),

    // Delete course
    deleteAdminCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminCourse"],
    }),

    // Course statistics
    getAdminCourseStats: builder.query({
      query: () => "/courses/stats",
    }),

    // Pending courses
    getPendingCourses: builder.query({
      query: (params) => ({
        url: "/courses/pending",
        params,
      }),
      providesTags: ["AdminCourse"],
    }),

    /* =====================================================
       TEACHER APPLICATIONS
    ===================================================== */

    // Get all applications
    getApplications: builder.query({
      query: (filters) => ({
        url: "/applications",
        params: filters,
      }),
      providesTags: ["AdminApplication"],
    }),

    // Get application by ID
    getApplicationById: builder.query({
      query: (id) => `/applications/${id}`,
    }),

    // Approve application
    approveApplication: builder.mutation({
      query: ({ id, adminNotes }) => ({
        url: `/applications/${id}/approve`,
        method: "PUT",
        body: { adminNotes },
      }),
      invalidatesTags: ["AdminApplication", "AdminTeacher"],
    }),

    // Reject application
    rejectApplication: builder.mutation({
      query: ({ id, reason, feedback }) => ({
        url: `/applications/${id}/reject`,
        method: "PUT",
        body: { reason, feedback },
      }),
      invalidatesTags: ["AdminApplication"],
    }),

    // Bulk action
    bulkAction: builder.mutation({
      query: ({ action, applicationIds, reason }) => ({
        url: "/applications/bulk-action",
        method: "POST",
        body: { action, applicationIds, reason },
      }),
      invalidatesTags: ["AdminApplication", "AdminTeacher"],
    }),
    // refreshToken
    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh-token", // ✅ Correct endpoint
        method: "POST",
        // No body needed
      }),
      // invalidatesTags ആവശ്യമില്ല - ഇത് token refresh മാത്രം
    }),
    // Application statistics
    getApplicationStats: builder.query({
      query: () => "/teacher-applications/stats",
    }),

    /* =====================================================
       TEACHER MANAGEMENT
    ===================================================== */

    // ✅ Get all teachers
    getAllTeachers: builder.query({
      query: (params) => ({
        url: "/teachers",
        params,
      }),
      providesTags: ["AdminTeacher"],
    }),

    // ✅ Get teacher by ID
    getTeacherById: builder.query({
      query: (id) => `/teachers/${id}`,
      providesTags: (result, error, id) => [{ type: "AdminTeacher", id }],
    }),

    // ✅ Get teacher statistics
    getTeacherStats: builder.query({
      query: () => "/teachers/stats",
    }),

    // ✅ Update teacher status (activate/deactivate)
    updateTeacherStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/teachers/${id}/status`,
        method: "PUT",
        body: { status, reason },
      }),
      invalidatesTags: ["AdminTeacher"],
    }),

    // ✅ Get teacher courses
    getTeacherCourses: builder.query({
      query: (id) => `/teachers/${id}/courses`,
    }),

    // ✅ Search teachers
    searchTeachers: builder.query({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: "/teachers/search",
        params: { query, page, limit },
      }),
    }),
    getAdminStats: builder.query({
      query: () => "/dashboard/stats",
      providesTags: ["DashboardStats"],
    }),
    // ✅ Bulk update teacher status
    bulkUpdateTeacherStatus: builder.mutation({
      query: ({ teacherIds, status, reason }) => ({
        url: "/teachers/bulk-status",
        method: "PUT",
        body: { teacherIds, status, reason },
      }),
      invalidatesTags: ["AdminTeacher"],
    }),
    // Get all users with pagination and filters
    getAllUsers: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        role = "",
        status = "",
      }) => ({
        url: "/users",
        params: { page, limit, search, role, status },
      }),
      transformResponse: (response) => {
        if (response.success) {
          return {
            users: response.users,
            pagination: response.pagination,
          };
        }
        throw new Error(response.error || "Failed to fetch users");
      },
      providesTags: ["Users"],
    }),

    // Get user details
    getUserDetails: builder.query({
      query: (id) => `/users/${id}`,
      transformResponse: (response) => {
        if (response.success) {
          return response.user;
        }
        throw new Error(response.error || "Failed to fetch user details");
      },
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    // Update user
    updateUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (response) => {
        if (response.success) {
          toast.success(response.message);
          return response.user;
        }
        throw new Error(response.error || "Failed to update user");
      },
      invalidatesTags: ["Users"],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: ({ id, action = "soft" }) => ({
        url: `/users/${id}`,
        method: "DELETE",
        params: { action },
      }),
      transformResponse: (response) => {
        if (response.success) {
          toast.success(response.message);
          return response;
        }
        throw new Error(response.error || "Failed to delete user");
      },
      invalidatesTags: ["Users", "UserStats"],
    }),

    // Bulk user actions
    bulkUserAction: builder.mutation({
      query: ({ userIds, action }) => ({
        url: "/users/bulk-actions",
        method: "POST",
        body: { userIds, action },
      }),
      transformResponse: (response) => {
        if (response.success) {
          toast.success(response.message);
          return response;
        }
        throw new Error(response.error || "Bulk action failed");
      },
      invalidatesTags: ["Users", "UserStats"],
    }),

    // Export users
    exportUsers: builder.mutation({
      query: (format = "csv") => ({
        url: "/users/export",
        method: "GET",
        params: { format },
        responseHandler: (response) => {
          if (format === "csv") {
            return response.blob();
          }
          return response.json();
        },
      }),
      transformResponse: (response, meta, arg) => {
        if (arg === "csv") {
          const url = window.URL.createObjectURL(response);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "users.csv");
          document.body.appendChild(link);
          link.click();
          link.remove();
          toast.success("Users exported successfully");
          return { success: true };
        }
        return response;
      },
    }),

    // Get user stats (for dashboard)
    getUserStats: builder.query({
      query: () => "/users/stats",
      transformResponse: (response) => {
        if (response.success) {
          return response.stats;
        }
        throw new Error(response.error || "Failed to fetch user stats");
      },
      providesTags: ["UserStats"],
    }),
    /* ==========================================
       EXPORT USERS (CSV, JSON)
    =========================================== */
    exportUserss: builder.mutation({
      query: ({ format }) => ({
        url: `/users/export?format=${format}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

/* =====================================================
   EXPORT HOOKS
===================================================== */

export const {
  //refreshToken
  useRefreshTokenMutation,
  // Courses
  useGetAllCoursesQuery,
  useGetAdminCourseByIdQuery,
  useUpdateCourseStatusMutation,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useDeleteAdminCourseMutation,
  useGetAdminCourseStatsQuery,
  useGetPendingCoursesQuery,

  // Applications
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
  useBulkActionMutation,
  useGetApplicationStatsQuery,
  useGetAdminStatsQuery,

  // Teachers
  useGetAllTeachersQuery,
  useGetTeacherByIdQuery,
  useGetTeacherStatsQuery,
  useUpdateTeacherStatusMutation,
  useGetTeacherCoursesQuery,
  useSearchTeachersQuery,
  useBulkUpdateTeacherStatusMutation,

  useGetAllUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkUserActionMutation,
  useExportUsersMutation,
  useExportUserssMutation,
  useGetUserStatsQuery,
  useLazyGetAllUsersQuery,
} = adminCourseRelatedDecisionApi;
