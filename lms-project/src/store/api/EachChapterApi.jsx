import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chapterApi = createApi({
  reducerPath: "chapterApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/createChapter/`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token"); // Check both sources

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Chapter"],
  endpoints: (builder) => ({
    // Get all chapters for a subject
    getChaptersBySubject: builder.query({
      query: (subjectId) => `/chapters/subject/${subjectId}`,
      providesTags: (result, error, subjectId) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: "Chapter", id: _id })),
              { type: "Chapter", id: "LIST" },
            ]
          : [{ type: "Chapter", id: "LIST" }],
    }),
    // Get single chapter by ID
    getSubjectRelatedDataById: builder.query({
      query: (id) => `/getSubjectRelatedDataById/${id}`,
      providesTags: (result, error, id) => [{ type: "Chapter", id }],
    }),
    // Get single chapter by ID
    getChapterById: builder.query({
      query: (id) => `/chapters/${id}`,
      providesTags: (result, error, id) => [{ type: "Chapter", id }],
    }),
    // Get single Rate by ID
    getStandardRateById: builder.query({
      query: (id) => `/standardRate/${id}`,
      providesTags: (result, error, id) => [{ type: "Chapter", id }],
    }),
    // Create new chapter
    createChapter: builder.mutation({
      query: (formData) => ({
        url: "/chapters",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Chapter", id: "LIST" }],
    }),

    // Update chapter
    updateChapter: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: `/chapters/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Chapter", id }],
    }),

    // Delete chapter
    deleteChapter: builder.mutation({
      query: (id) => ({
        url: `/chapters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Chapter", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSubjectRelatedDataByIdQuery,
  useGetChaptersBySubjectQuery,
  useGetChapterByIdQuery,

  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  useGetStandardRateByIdQuery,
} = chapterApi;
