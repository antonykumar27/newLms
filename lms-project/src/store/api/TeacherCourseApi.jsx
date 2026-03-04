// services/teacherCourseApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherCourseApi = createApi({
  reducerPath: "teacherCourseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/teacherRoutes`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["TeacherCourse", "TeacherCourseStats"],
  endpoints: (builder) => ({
    // Get all teacher's courses
    getTeacherCourses: builder.query({
      query: (params) => ({
        url: "/courses",
        params,
      }),
      providesTags: ["TeacherCourse"],
      transformResponse: (response) => {
        if (response.courses) {
          return response.courses.map((course) => ({
            ...course,
            // Add calculated fields for UI
            totalEnrollments: course.students?.length || 0,
            averageRating:
              course.reviews?.length > 0
                ? course.reviews.reduce(
                    (acc, review) => acc + review.rating,
                    0,
                  ) / course.reviews.length
                : 0,
            totalRatings: course.reviews?.length || 0,
            totalLectures:
              course.sections?.reduce(
                (acc, section) => acc + (section.lectures?.length || 0),
                0,
              ) || 0,
            revenue: (course.price || 0) * (course.students?.length || 0),
          }));
        }
        return [];
      },
    }),

    // Get teacher course stats
    getTeacherCourseStats: builder.query({
      query: () => "/courses/stats",
      providesTags: ["TeacherCourseStats"],
      transformResponse: (response) => ({
        total: response.total || 0,
        published: response.published || 0,
        draft: response.draft || 0,
        pending: response.pending || 0,
        totalEnrollments: response.totalEnrollments || 0,
        totalRevenue: response.totalRevenue || 0,
        avgRating: response.avgRating || 0,
      }),
    }),

    // Create course
    createTeacherCourse: builder.mutation({
      query: (data) => ({
        url: "/courses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TeacherCourse", "TeacherCourseStats"],
    }),
    createApplyAsTeacher: builder.mutation({
      query: (data) => ({
        url: "/applyAsTeacher",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TeacherApplication"],
    }),
    getTeacherCourseById: builder.query({
      query: (id) => `/${id}/preview`,
    }),
    // NEW: Submit course for admin review
    submitCourseForReview: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/submit-review`,
        method: "POST",
      }),
    }),

    // NEW: Withdraw course from review
    withdrawCourseFromReview: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/withdraw-review`,
        method: "POST",
      }),
    }),
    // Update course
    updateTeacherCourseDraft: builder.mutation({
      query: ({ id, data }) => ({
        url: `/course/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["TeacherCourse", "TeacherCourseStats"],
    }),
    // Drafts course
    updateTeacherCourse: builder.mutation({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["TeacherCourse", "TeacherCourseStats"],
    }),
    // Delete course
    deleteTeacherCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TeacherCourse", "TeacherCourseStats"],
    }),

    // Publish course
    publishTeacherCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}/publish`,
        method: "PUT",
      }),
      invalidatesTags: ["TeacherCourse", "TeacherCourseStats"],
    }),

    // Unpublish course
    unpublishTeacherCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}/unpublish`,
        method: "PUT",
      }),
      invalidatesTags: ["TeacherCourse", "TeacherCourseStats"],
    }),

    // Archive course
    archiveTeacherCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}/archive`,
        method: "PUT",
      }),
      invalidatesTags: ["TeacherCourse", "TeacherCourseStats"],
    }),

    // Duplicate course
    duplicateTeacherCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}/duplicate`,
        method: "POST",
      }),
      invalidatesTags: ["TeacherCourse", "TeacherCourseStats"],
    }),

    // Bulk actions
    bulkTeacherCourseAction: builder.mutation({
      query: ({ action, courseIds }) => ({
        url: "/courses/bulk-action",
        method: "POST",
        body: { action, courseIds },
      }),
      invalidatesTags: ["TeacherCourse", "TeacherCourseStats"],
    }),

    // Get course analytics
    getTeacherCourseAnalytics: builder.query({
      query: (id) => `/courses/${id}/analytics`,
    }),
  }),
});

export const {
  useGetTeacherCoursesQuery,
  useGetTeacherCourseStatsQuery,
  useGetTeacherCourseByIdQuery,
  useCreateTeacherCourseMutation,
  useUpdateTeacherCourseMutation,
  useUpdateTeacherCourseDraftMutation,
  useDeleteTeacherCourseMutation,
  usePublishTeacherCourseMutation,
  useUnpublishTeacherCourseMutation,
  useArchiveTeacherCourseMutation,
  useDuplicateTeacherCourseMutation,
  useBulkTeacherCourseActionMutation,
  useGetTeacherCourseAnalyticsQuery,
  useCreateApplyAsTeacherMutation,
  useSubmitCourseForReviewMutation, // NEW
  useWithdrawCourseFromReviewMutation, // NEW
} = teacherCourseApi;
