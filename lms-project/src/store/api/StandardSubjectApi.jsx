// api/standardSubjectApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const standardSubjectApi = createApi({
  reducerPath: "standardSubjectApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/standardSubjects/`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token"); // Check both sources

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["StandardSubject", "Standard"],
  endpoints: (builder) => ({
    // Get all standard subjects
    getStandardSubjects: builder.query({
      query: () => "/createdThisStandardSubject",
      providesTags: ["StandardSubject"],
    }),
    // Get all standard subjects
    getStandardSubjectsForAdmin: builder.query({
      query: () => "/createdThisStandardSubjectForAdmin",
      providesTags: ["StandardSubject"],
    }),
    // Get all standard subjects
    getStandardSubjectsForStudent: builder.query({
      query: () => "/createdThisStandardSubjectForStudent",
      providesTags: ["StandardSubject"],
    }),
    // Get all standard subjects
    getStandardSubjectsTeacher: builder.query({
      query: () => "teacher",
      providesTags: ["StandardSubject"],
    }),
    // Get standard subjects by range
    getStandardSubjectsByRange: builder.query({
      query: ({ min, max }) => `range/${min}/${max}`,
      providesTags: ["StandardSubject"],
    }),

    // Get single standard subject by standard number
    getStandardSubjectByStandard: builder.query({
      query: (standard) => standard,
      providesTags: (result, error, standard) => [
        { type: "StandardSubject", id: result?._id },
        { type: "StandardSubject", standard },
      ],
    }),

    // Get single standard subject by ID
    getStandardSubjectById: builder.query({
      query: (id) => id,
      providesTags: (result, error, id) => [{ type: "StandardSubject", id }],
    }),

    // Create new standard subject
    createStandardSubject: builder.mutation({
      query: (standardSubjectData) => ({
        url: "/createStandardSubject",
        method: "POST",
        body: standardSubjectData,
      }),
      invalidatesTags: ["StandardSubject"],
    }),

    // Update standard subject
    updateStandardSubject: builder.mutation({
      query: (submitFormData) => ({
        url: "/updateStandardSubject",
        method: "PUT",
        body: submitFormData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StandardSubject", id },
        "StandardSubject",
      ],
    }),

    // Delete standard subject
    deleteStandardSubject: builder.mutation({
      query: (id) => ({
        url: id,
        method: "DELETE",
      }),
      invalidatesTags: ["StandardSubject"],
    }),

    // Add media to standard subject
    addMediaToStandardSubject: builder.mutation({
      query: ({ id, mediaData }) => ({
        url: `${id}/media`,
        method: "POST",
        body: mediaData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StandardSubject", id },
      ],
    }),

    // Remove media from standard subject
    removeMediaFromStandardSubject: builder.mutation({
      query: ({ id, mediaId }) => ({
        url: `${id}/media/${mediaId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StandardSubject", id },
      ],
    }),
    // Create new standard
    createStandard: builder.mutation({
      query: (standardSubjectData) => ({
        url: "/createStandard",
        method: "POST",
        body: standardSubjectData,
      }),
      invalidatesTags: ["Standard"],
    }),

    // Update standard
    updateStandard: builder.mutation({
      query: (submitFormData) => ({
        url: "/updateStandard",
        method: "PUT",
        body: submitFormData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Standard", id },
        "Standard",
      ],
    }),
    // Delete standard
    deleteStandard: builder.mutation({
      query: (id) => ({
        url: `deleteStandard/${id}`,

        method: "DELETE",
      }),
      invalidatesTags: ["Standard"],
    }),
    // Get all standard
    getStandard: builder.query({
      query: () => "/getAllStandards",
      providesTags: ["Standard"],
    }),
    // Get all standard
    getAllStandardsForStudents: builder.query({
      query: () => "/getAllStandardsForStudents",
      providesTags: ["Standard"],
    }),
    // Get all standard
    getStandardForTeacher: builder.query({
      query: () => "/getAllStandardsForTeacher",
      providesTags: ["Standard"],
    }),
    // Get single standard subject by ID
    getStandardById: builder.query({
      query: (id) => `/getThisStandard/${id}`,
      providesTags: (result, error, id) => [{ type: "Standard", id }],
    }),
  }),
});

export const {
  useGetStandardSubjectsQuery,
  useGetStandardSubjectsForAdminQuery,
  useGetStandardSubjectsForStudentQuery,
  useGetStandardSubjectsTeacherQuery,
  useGetStandardSubjectsByRangeQuery,
  useGetStandardSubjectByStandardQuery,
  useGetStandardSubjectByIdQuery,
  useCreateStandardSubjectMutation,
  useUpdateStandardSubjectMutation,
  useDeleteStandardSubjectMutation,
  useAddMediaToStandardSubjectMutation,
  useRemoveMediaFromStandardSubjectMutation,
  useGetStandardForTeacherQuery,
  //standard Create
  useGetStandardQuery,
  useGetAllStandardsForStudentsQuery,
  useCreateStandardMutation,
  useUpdateStandardMutation,
  useGetStandardByIdQuery,
  useDeleteStandardMutation,
} = standardSubjectApi;
