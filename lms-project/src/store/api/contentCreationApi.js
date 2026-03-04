import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const contentCreationApi = createApi({
  reducerPath: "contentCreationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/contentCreation`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token"); // Check both sources

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["ContentCreation"],
  endpoints: (builder) => ({
    // GET all content plans
    getContentPlans: builder.query({
      query: ({ page = 1, limit = 10, sort = "-createdAt" } = {}) =>
        `/content-creation?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.contentPlans.map(({ id }) => ({
                type: "ContentCreation",
                id,
              })),
              { type: "ContentCreation", id: "LIST" },
            ]
          : [{ type: "ContentCreation", id: "LIST" }],
    }),

    // GET single content plan by ID
    getContentPlanById: builder.query({
      query: (id) => `/content-creation/${id}`,
      providesTags: (result, error, id) => [{ type: "ContentCreation", id }],
    }),

    // GET content plan by project ID
    getContentPlanByProjectId: builder.query({
      query: (projectId) => `/content-creation/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "ContentCreation", id: projectId },
      ],
    }),

    // GET content statistics
    getContentStats: builder.query({
      query: () => "/content-creation/stats/overview",
      providesTags: ["ContentCreation"],
    }),

    // GET cost breakdown
    getCostBreakdown: builder.query({
      query: (id) => `/content-creation/${id}/breakdown`,
    }),

    // GET budget projection
    getBudgetProjection: builder.query({
      query: (id) => `/content-creation/${id}/budget-projection`,
    }),

    // GET compare plans
    compareContentPlans: builder.query({
      query: (ids) => `/content-creation/compare/${ids.join(",")}`,
    }),

    // POST create content plan
    createContentPlan: builder.mutation({
      query: (data) => ({
        url: "/content-creation",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ContentCreation", id: "LIST" }],
    }),

    // PATCH update content plan
    updateContentPlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/content-creation/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ContentCreation", id },
        { type: "ContentCreation", id: "LIST" },
      ],
    }),

    // DELETE content plan
    deleteContentPlan: builder.mutation({
      query: (id) => ({
        url: `/content-creation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ContentCreation", id: "LIST" }],
    }),

    // POST add camera
    addCamera: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/content-creation/${id}/cameras`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ContentCreation", id },
      ],
    }),

    // PATCH update camera
    updateCamera: builder.mutation({
      query: ({ id, cameraId, ...data }) => ({
        url: `/content-creation/${id}/cameras/${cameraId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ContentCreation", id },
      ],
    }),

    // DELETE camera
    deleteCamera: builder.mutation({
      query: ({ id, cameraId }) => ({
        url: `/content-creation/${id}/cameras/${cameraId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ContentCreation", id },
      ],
    }),

    // POST add full-time teacher
    addFullTimeTeacher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/content-creation/${id}/fulltime-teachers`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ContentCreation", id },
      ],
    }),

    // POST add part-time teacher
    addPartTimeTeacher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/content-creation/${id}/parttime-teachers`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ContentCreation", id },
      ],
    }),

    // PATCH update video production
    updateVideoProduction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/content-creation/${id}/video-production`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ContentCreation", id },
      ],
    }),

    // POST bulk create
    bulkCreateContentPlans: builder.mutation({
      query: (data) => ({
        url: "/content-creation/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ContentCreation", id: "LIST" }],
    }),
  }),
});

// Export hooks
export const {
  useGetContentPlansQuery,
  useGetContentPlanByIdQuery,
  useGetContentPlanByProjectIdQuery,
  useGetContentStatsQuery,
  useGetCostBreakdownQuery,
  useGetBudgetProjectionQuery,
  useCompareContentPlansQuery,
  useCreateContentPlanMutation,
  useUpdateContentPlanMutation,
  useDeleteContentPlanMutation,
  useAddCameraMutation,
  useUpdateCameraMutation,
  useDeleteCameraMutation,
  useAddFullTimeTeacherMutation,
  useAddPartTimeTeacherMutation,
  useUpdateVideoProductionMutation,
  useBulkCreateContentPlansMutation,
} = contentCreationApi;
