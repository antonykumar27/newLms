import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const marketingApi = createApi({
  reducerPath: "marketingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/marketing`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Marketing"],
  endpoints: (builder) => ({
    // GET all marketing plans
    getMarketingPlans: builder.query({
      query: ({ page = 1, limit = 10, sort = "-createdAt" } = {}) =>
        `/marketing?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.marketingPlans.map(({ id }) => ({
                type: "Marketing",
                id,
              })),
              { type: "Marketing", id: "LIST" },
            ]
          : [{ type: "Marketing", id: "LIST" }],
    }),

    // GET single marketing plan by ID
    getMarketingPlanById: builder.query({
      query: (id) => `/marketing/${id}`,
      providesTags: (result, error, id) => [{ type: "Marketing", id }],
    }),

    // GET marketing plan by project ID
    getMarketingPlanByProjectId: builder.query({
      query: (projectId) => `/marketing/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "Marketing", id: projectId },
      ],
    }),

    // GET marketing dashboard
    getMarketingDashboard: builder.query({
      query: (projectId) => `/marketing/dashboard/${projectId}`,
    }),

    // GET ROI analysis
    getROIAnalysis: builder.query({
      query: (id) => `/marketing/${id}/roi-analysis`,
    }),

    // GET channel performance
    getChannelPerformance: builder.query({
      query: (id) => `/marketing/${id}/channel-performance`,
    }),

    // GET lead metrics
    getLeadMetrics: builder.query({
      query: (id) => `/marketing/${id}/lead-metrics`,
    }),

    // GET campaign calendar
    getCampaignCalendar: builder.query({
      query: ({ id, year, month }) =>
        `/marketing/${id}/campaign-calendar?year=${year}&month=${month}`,
    }),

    // POST create marketing plan
    createMarketingPlan: builder.mutation({
      query: (data) => ({
        url: "/marketing",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Marketing", id: "LIST" }],
    }),

    // PATCH update marketing plan
    updateMarketingPlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/marketing/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Marketing", id },
        { type: "Marketing", id: "LIST" },
      ],
    }),

    // DELETE marketing plan
    deleteMarketingPlan: builder.mutation({
      query: (id) => ({
        url: `/marketing/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Marketing", id: "LIST" }],
    }),

    // POST add social platform
    addSocialPlatform: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/marketing/${id}/social-platforms`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Marketing", id }],
    }),

    // PATCH update social platform
    updateSocialPlatform: builder.mutation({
      query: ({ id, platformIndex, ...data }) => ({
        url: `/marketing/${id}/social-platforms/${platformIndex}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Marketing", id }],
    }),

    // DELETE social platform
    deleteSocialPlatform: builder.mutation({
      query: ({ id, platformIndex }) => ({
        url: `/marketing/${id}/social-platforms/${platformIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Marketing", id }],
    }),

    // POST create campaign
    createCampaign: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/marketing/${id}/campaigns`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Marketing", id }],
    }),

    // GET export report
    exportMarketingReport: builder.query({
      query: (projectId) => `/marketing/export/${projectId}`,
    }),
  }),
});

// Export hooks
export const {
  useGetMarketingPlansQuery,
  useGetMarketingPlanByIdQuery,
  useGetMarketingPlanByProjectIdQuery,
  useGetMarketingDashboardQuery,
  useGetROIAnalysisQuery,
  useGetChannelPerformanceQuery,
  useGetLeadMetricsQuery,
  useGetCampaignCalendarQuery,
  useCreateMarketingPlanMutation,
  useUpdateMarketingPlanMutation,
  useDeleteMarketingPlanMutation,
  useAddSocialPlatformMutation,
  useUpdateSocialPlatformMutation,
  useDeleteSocialPlatformMutation,
  useCreateCampaignMutation,
  useExportMarketingReportQuery,
} = marketingApi;
