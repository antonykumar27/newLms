import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const kpiApi = createApi({
  reducerPath: "kpiApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/kpi/`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["KPI"],
  endpoints: (builder) => ({
    // GET all KPI records
    getKPIRecords: builder.query({
      query: ({ page = 1, limit = 10, sort = "-createdAt" } = {}) =>
        `/kpi?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.kpis.map(({ id }) => ({
                type: "KPI",
                id,
              })),
              { type: "KPI", id: "LIST" },
            ]
          : [{ type: "KPI", id: "LIST" }],
    }),

    // GET single KPI record by ID
    getKPIRecordById: builder.query({
      query: (id) => `/kpi/${id}`,
      providesTags: (result, error, id) => [{ type: "KPI", id }],
    }),

    // GET KPI by project ID
    getKPIByProjectId: builder.query({
      query: (projectId) => `/kpi/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "KPI", id: projectId },
      ],
    }),

    // GET KPI dashboard
    getKPIDashboard: builder.query({
      query: (projectId) => `/kpi/dashboard/${projectId}`,
    }),

    // GET user metrics
    getUserMetrics: builder.query({
      query: (projectId) => `/kpi/${projectId}/user-metrics`,
    }),

    // GET financial metrics
    getFinancialMetrics: builder.query({
      query: (projectId) => `/kpi/${projectId}/financial-metrics`,
    }),

    // GET content metrics
    getContentMetrics: builder.query({
      query: (projectId) => `/kpi/${projectId}/content-metrics`,
    }),

    // GET engagement metrics
    getEngagementMetrics: builder.query({
      query: (projectId) => `/kpi/${projectId}/engagement-metrics`,
    }),

    // GET KPI trends
    getKPITrends: builder.query({
      query: ({ projectId, days = 30 }) =>
        `/kpi/trends/${projectId}?days=${days}`,
    }),

    // GET KPI forecast
    getKPIForecast: builder.query({
      query: ({ projectId, months = 12 }) =>
        `/kpi/forecast/${projectId}?months=${months}`,
    }),

    // GET goal progress
    getGoalProgress: builder.query({
      query: (id) => `/kpi/${id}/progress`,
    }),

    // POST create KPI record
    createKPIRecord: builder.mutation({
      query: (data) => ({
        url: "/kpi",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "KPI", id: "LIST" }],
    }),

    // PATCH update KPI record
    updateKPIRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/kpi/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "KPI", id },
        { type: "KPI", id: "LIST" },
      ],
    }),

    // DELETE KPI record
    deleteKPIRecord: builder.mutation({
      query: (id) => ({
        url: `/kpi/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "KPI", id: "LIST" }],
    }),

    // PATCH set targets
    setKPITargets: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/kpi/${id}/targets`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "KPI", id }],
    }),

    // GET export KPI report
    exportKPIReport: builder.query({
      query: (projectId) => `/kpi/export/${projectId}`,
    }),
  }),
});

// Export hooks
export const {
  useGetKPIRecordsQuery,
  useGetKPIRecordByIdQuery,
  useGetKPIByProjectIdQuery,
  useGetKPIDashboardQuery,
  useGetUserMetricsQuery,
  useGetFinancialMetricsQuery,
  useGetContentMetricsQuery,
  useGetEngagementMetricsQuery,
  useGetKPITrendsQuery,
  useGetKPIForecastQuery,
  useGetGoalProgressQuery,
  useCreateKPIRecordMutation,
  useUpdateKPIRecordMutation,
  useDeleteKPIRecordMutation,
  useSetKPITargetsMutation,
  useExportKPIReportQuery,
} = kpiApi;
