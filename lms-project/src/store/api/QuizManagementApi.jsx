import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const quizManagementApi = createApi({
  reducerPath: "quizManagementApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token"); // Check both sources

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Chapters", "Questions", "Progress", "Results"],
  endpoints: (builder) => ({
    // 🔸 Chapters
    getAllChapters: builder.query({
      query: ({ standard, subject } = {}) => {
        const params = new URLSearchParams();
        if (standard) params.append("standard", standard);
        if (subject) params.append("subject", subject);
        return `/chapters?${params.toString()}`;
      },
      providesTags: ["Chapters"],
    }),

    getQuestionsByPageId: builder.query({
      query: (id) => `/questions/questionPage/${id}`,
      providesTags: (result, error, id) => [{ type: "Chapters", id }],
    }),
    getChapterById: builder.query({
      query: (id) => `/chapters/${id}`,
      providesTags: (result, error, id) => [{ type: "Chapters", id }],
    }),
    createChapter: builder.mutation({
      query: (data) => ({
        url: "/chapters/createChapter",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chapters"],
    }),
    createFullChapter: builder.mutation({
      query: (data) => ({
        url: "/chapters/createFullChapter",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chapters"],
    }),
    // 🔸 Questions
    getQuestions: builder.query({
      query: ({ standard, subject, chapter, difficulty, type } = {}) => {
        const params = new URLSearchParams();
        if (standard) params.append("standard", standard);
        if (subject) params.append("subject", subject);
        if (chapter) params.append("chapter", chapter);
        if (difficulty) params.append("difficulty", difficulty);
        if (type) params.append("type", type);
        return `/questions?${params.toString()}`;
      },
      providesTags: ["Questions"],
    }),

    submitAnswer: builder.mutation({
      query: (data) => ({
        url: "/submit-answer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Progress", "Results"],
    }),

    createQuestion: builder.mutation({
      query: (data) => ({
        url: "/questions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Questions"],
    }),
    createTextBook: builder.mutation({
      query: (data) => ({
        url: "/questions/createTextBook",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Questions"],
    }),
    updateQuestion: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/questions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Questions"],
    }),

    // 🔸 Progress
    getMyProgress: builder.query({
      query: () => "/my-progress",
      providesTags: ["Progress"],
    }),
    getMyAllResults: builder.query({
      query: () => "/questions/getMyAllResults",
      providesTags: ["QuizAttempt"],
    }),
    dropQuestions: builder.mutation({
      query: () => ({
        url: `/questions`,
        method: "DELETE",
      }),
    }),
    bookmarkQuestion: builder.mutation({
      query: (data) => ({
        url: "/bookmark",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Progress"],
    }),

    insertQuestions: builder.mutation({
      query: (formData) => ({
        url: "/questions/questions",
        method: "POST",
        body: formData, // ✅ FormData
      }),
      invalidatesTags: [{ type: "Questions", id: "LIST" }],
    }),
    addNote: builder.mutation({
      query: (data) => ({
        url: "/add-note",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Progress"],
    }),

    // 🔸 Results (Keep your existing)
    getResult: builder.query({
      query: () => `/questions/questions`,
      providesTags: ["Results"],
    }),

    storeResult: builder.mutation({
      query: (data) => ({
        url: `/questions/result`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Results"],
    }),

    dropResult: builder.mutation({
      query: () => ({
        url: `/questions/result`,
        method: "DELETE",
      }),
      invalidatesTags: ["Results"],
    }),
  }),
});

export const {
  useGetMyAllResultsQuery,
  useGetQuestionsByPageIdQuery,
  useGetAllChaptersQuery,
  useGetChapterByIdQuery,
  useCreateChapterMutation,
  useCreateFullChapterMutation,
  useGetQuestionsQuery,
  useSubmitAnswerMutation,
  useCreateQuestionMutation,
  useCreateTextBookMutation,
  useUpdateQuestionMutation,
  useGetMyProgressQuery,
  useBookmarkQuestionMutation,
  useAddNoteMutation,
  useInsertQuestionsMutation,
  useDropQuestionsMutation,
  useGetResultQuery,
  useStoreResultMutation,
  useDropResultMutation,
  useGetQuestionsByIdQuery,
} = quizManagementApi;
// services/quizApi.js
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const quizApi = createApi({
//   reducerPath: "quizApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1`, // adjust your base path
//     prepareHeaders: (headers, { getState }) => {
//       const token =
//         getState()?.auth?.user?.token || localStorage.getItem("token");
//       if (token) headers.set("Authorization", `Bearer ${token}`);
//       return headers;
//     },
//   }),
//   endpoints: (builder) => ({
//     // 🔸 Questions
//     getQuestions: builder.query({
//       query: () => `/questions/questions`,
//     }),
//     getQuestionsById: builder.query({
//       query: (id) => `/questions/questionsById/${id}`,
//     }),

//     insertQuestions: builder.mutation({
//       query: (data) => ({
//         url: `/questions/questions`,
//         method: "POST",
//         body: data,
//       }),
//     }),
//     dropQuestions: builder.mutation({
//       query: () => ({
//         url: `/questions`,
//         method: "DELETE",
//       }),
//     }),

//     // 🔸 Result
//     getResult: builder.query({
//       query: () => `/questions/result`,
//     }),
//     storeResult: builder.mutation({
//       query: (data) => ({
//         url: `/questions/result`,
//         method: "POST",
//         body: data,
//       }),
//     }),
//     dropResult: builder.mutation({
//       query: () => ({
//         url: `/questions/result`,
//         method: "DELETE",
//       }),
//     }),
//   }),
// });

// export const {
//   useGetQuestionsQuery,
//   useGetQuestionsByIdQuery,
//   useInsertQuestionsMutation,
//   useDropQuestionsMutation,
//   useGetResultQuery,
//   useStoreResultMutation,
//   useDropResultMutation,
// } = quizApi;
