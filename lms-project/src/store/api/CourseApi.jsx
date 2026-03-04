// services/courseApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/courseRoutes`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Course"],
  endpoints: (builder) => ({
    // Courses
    getCourses: builder.query({
      query: (params) => ({ url: "/", params }),
      providesTags: ["Course"],
    }),
    getCourseDetails: builder.query({
      query: (courseId) => ({
        url: `/entolledCorses/${courseId}`,
      }),
      providesTags: ["Course"],
    }),

    getCourseById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    createCourse: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),
    createCourseOtp: builder.mutation({
      query: (videoId) => ({
        url: `/otp/${videoId}`,
        method: "GET",
      }),
      invalidatesTags: ["Course"],
    }),
    toggleVideoLike: builder.mutation({
      query: ({ courseId, videoId, liked }) => ({
        url: `/${courseId}/videos/${videoId}/like`,
        method: "POST",
        body: { liked },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),
    // In your apiSlice or courseApi
    toggleVideoWishlist: builder.mutation({
      query: ({ courseId, videoId, bookmarked, timestamp }) => ({
        url: `/${courseId}/videos/${videoId}/wishlist`,
        method: "POST",
        body: { bookmarked, timestamp },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    toggleVideoLikeStatus: builder.query({
      query: ({ courseId, videoId }) =>
        `/${courseId}/videos/${videoId}/like-status`,
      providesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),
    updateCourse: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Course", id }],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),
    // Enroll in a course
    enrollCourses: builder.mutation({
      query: ({ id, enrollmentPayload }) => ({
        url: `courses/${id}/enroll`,
        method: "POST",
        body: enrollmentPayload,
      }),
      invalidatesTags: ["Course"],
    }),
    getEnrollCourses: builder.query({
      query: () => ({
        url: "courses/enroll",
        method: "GET",
      }),
      invalidatesTags: ["Course"],
    }),
    // Add to wishlist
    addToWishlist: builder.mutation({
      query: (courseId) => ({
        url: `courses/${courseId}/wishlist`,
        method: "POST",
      }),
      invalidatesTags: ["Course"],
    }),

    // Remove from wishlist
    removeFromWishlist: builder.mutation({
      query: (courseId) => ({
        url: `courses/${courseId}/wishlist`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),

    // Add review
    addReview: builder.mutation({
      query: ({ courseId, rating, comment }) => ({
        url: `courses/${courseId}/reviews`,
        method: "POST",
        body: { rating, comment },
      }),
      invalidatesTags: ["Course"],
    }),

    // Get user progress
    getUserProgress: builder.query({
      query: (courseId) => `courses/${courseId}/progress`,
      providesTags: ["Progress"],
    }),

    // Update lesson progress
    updateProgress: builder.mutation({
      query: ({ courseId, lessonId, completed }) => ({
        url: `courses/${courseId}/progress`,
        method: "PUT",
        body: { lessonId, completed },
      }),
      invalidatesTags: ["Progress"],
    }),

    // Share course (TRACKING ONLY)
    shareCourse: builder.mutation({
      query: ({ courseId, platform }) => ({
        url: `/courses/${courseId}/share`,
        method: "POST",
        body: { platform },
      }),
    }),

    // Lessons
    createLesson: builder.mutation({
      query: ({ courseId, data }) => ({
        url: `/${courseId}/lessons`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),
    updateLesson: builder.mutation({
      query: ({ id, data }) => ({
        url: `/lessons/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),
    deleteLesson: builder.mutation({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),
    enrollCourse: builder.mutation({
      query: (id) => ({
        url: `/lessons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),
    // Get user profile
    getStudentProfile: builder.query({
      query: () => `courses/myown/profile`,
      providesTags: ["Profile"],
    }),
  }),
});

export const {
  // Courses
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useCreateCourseOtpMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseDetailsQuery,
  // Enrollment
  useEnrollCourseMutation,
  useEnrollCoursesMutation,

  useGetEnrollCoursesQuery,
  // Wishlist
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useToggleVideoWishlistMutation,
  // Reviews
  useAddReviewMutation,

  // Progress
  useGetUserProgressQuery,
  useUpdateProgressMutation,

  // Share
  useShareCourseMutation,

  // Lessons
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useToggleVideoLikeMutation,
  useToggleVideoLikeStatusQuery,
  //student
  useGetStudentProfileQuery,
} = courseApi;
