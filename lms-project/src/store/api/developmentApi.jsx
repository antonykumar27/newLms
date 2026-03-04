import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const developmentCostApi = createApi({
  reducerPath: "developmentCostApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/developmentCost/`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token"); // Check both sources

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["DevelopmentCost"],
  endpoints: (builder) => ({
    // GET all development cost records
    getDevelopmentCostRecords: builder.query({
      query: ({ page = 1, limit = 10, sort = "-createdAt" } = {}) =>
        `/development-cost?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.developmentCosts.map(({ id }) => ({
                type: "DevelopmentCost",
                id,
              })),
              { type: "DevelopmentCost", id: "LIST" },
            ]
          : [{ type: "DevelopmentCost", id: "LIST" }],
    }),

    // GET single development cost record by ID
    getDevelopmentCostRecordById: builder.query({
      query: (id) => `/development-cost/${id}`,
      providesTags: (result, error, id) => [{ type: "DevelopmentCost", id }],
    }),

    // GET development cost by project ID
    getDevelopmentCostByProjectId: builder.query({
      query: (projectId) => `/development-cost/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "DevelopmentCost", id: projectId },
      ],
    }),

    // GET development stats
    getDevelopmentStats: builder.query({
      query: () => `/development-cost/stats/overview`,
    }),

    // GET cost breakdown
    getCostBreakdown: builder.query({
      query: (id) => `/development-cost/${id}/breakdown`,
    }),

    // POST calculate estimate
    calculateEstimate: builder.mutation({
      query: (data) => ({
        url: "/development-cost/calculate",
        method: "POST",
        body: data,
      }),
    }),

    // POST estimate timeline
    estimateTimeline: builder.mutation({
      query: (data) => ({
        url: "/development-cost/timeline",
        method: "POST",
        body: data,
      }),
    }),

    // POST suggest resources
    suggestResources: builder.mutation({
      query: (data) => ({
        url: "/development-cost/resources",
        method: "POST",
        body: data,
      }),
    }),

    // POST create development cost
    createDevelopmentCost: builder.mutation({
      query: (data) => ({
        url: "/development-cost",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "DevelopmentCost", id: "LIST" }],
    }),

    // PATCH update development cost
    updateDevelopmentCost: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/development-cost/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DevelopmentCost", id },
        { type: "DevelopmentCost", id: "LIST" },
      ],
    }),

    // DELETE development cost
    deleteDevelopmentCost: builder.mutation({
      query: (id) => ({
        url: `/development-cost/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DevelopmentCost", id: "LIST" }],
    }),

    // PATCH update hourly rates
    updateHourlyRates: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/development-cost/${id}/rates`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DevelopmentCost", id },
      ],
    }),

    // POST compare projects
    compareProjects: builder.mutation({
      query: (ids) => ({
        url: `/development-cost/compare/${ids.join(",")}`,
        method: "GET",
      }),
    }),

    // POST bulk create
    bulkCreateDevelopmentCosts: builder.mutation({
      query: (data) => ({
        url: "/development-cost/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "DevelopmentCost", id: "LIST" }],
    }),

    // PATCH bulk update rates
    bulkUpdateRates: builder.mutation({
      query: (data) => ({
        url: "/development-cost/bulk/rates",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [{ type: "DevelopmentCost", id: "LIST" }],
    }),
  }),
});

// Export hooks
export const {
  useGetDevelopmentCostRecordsQuery,
  useGetDevelopmentCostRecordByIdQuery,
  useGetDevelopmentCostByProjectIdQuery,
  useGetDevelopmentStatsQuery,
  useGetCostBreakdownQuery,
  useCalculateEstimateMutation,
  useEstimateTimelineMutation,
  useSuggestResourcesMutation,
  useCreateDevelopmentCostMutation,
  useUpdateDevelopmentCostMutation,
  useDeleteDevelopmentCostMutation,
  useUpdateHourlyRatesMutation,
  useCompareProjectsMutation,
  useBulkCreateDevelopmentCostsMutation,
  useBulkUpdateRatesMutation,
} = developmentCostApi;
