import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chapterPageApi = createApi({
  reducerPath: "chapterPageApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/chapterPages`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: ["Page"],

  endpoints: (builder) => ({
    /* ---------- GET ALL PAGES BY CHAPTER ---------- */
    getPagesByChapter: builder.query({
      query: (chapterId) => `/pages/chapter/${chapterId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((page) => ({
                type: "Page",
                id: page._id,
              })),
              { type: "Page", id: "LIST" },
            ]
          : [{ type: "Page", id: "LIST" }],
    }),

    /* ---------- GET SINGLE PAGE ---------- */
    getPageById: builder.query({
      query: (id) => `/pages/${id}`,
      providesTags: (result, error, id) => [{ type: "Page", id }],
    }),
    /* ---------- GET SINGLE PAGE ---------- */
    getSinglePageById: builder.query({
      query: (id) => `/singlePage/${id}`,
      providesTags: (result, error, id) => [{ type: "Page", id }],
    }),
    /* ---------- CREATE PAGE ---------- */
    createPages: builder.mutation({
      query: (data) => ({
        url: `/pages`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Page", id: "LIST" }],
    }),

    /* ---------- UPDATE PAGE ---------- */
    updatePage: builder.mutation({
      query: ({ id, submitFormData }) => ({
        url: `/pages/${id}`,
        method: "PUT",
        body: submitFormData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Page", id }],
    }),

    /* ---------- DELETE PAGE ---------- */
    deletePage: builder.mutation({
      query: (id) => ({
        url: `/pages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Page", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPagesByChapterQuery,
  useGetPageByIdQuery,
  useGetSinglePageByIdQuery,
  useCreatePagesMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = chapterPageApi;
