import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const financialSummaryApi = createApi({
  reducerPath: "financialSummaryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/financialSummary`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token"); // Check both sources

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["FinancialSummary"],
  endpoints: (builder) => ({
    // GET all financial summaries
    getFinancialSummaries: builder.query({
      query: ({ page = 1, limit = 10, sort = "-createdAt" } = {}) =>
        `/financial-summary?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.financialSummaries.map(({ id }) => ({
                type: "FinancialSummary",
                id,
              })),
              { type: "FinancialSummary", id: "LIST" },
            ]
          : [{ type: "FinancialSummary", id: "LIST" }],
    }),

    // GET single financial summary by ID
    getFinancialSummaryById: builder.query({
      query: (id) => `/financial-summary/${id}`,
      providesTags: (result, error, id) => [{ type: "FinancialSummary", id }],
    }),

    // GET financial summary by project ID
    getFinancialSummaryByProjectId: builder.query({
      query: (projectId) => `/financial-summary/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "FinancialSummary", id: projectId },
      ],
    }),

    // GET financial dashboard
    getFinancialDashboard: builder.query({
      query: (projectId) => `/financial-summary/dashboard/${projectId}`,
    }),

    // GET profit & loss statement
    getProfitLossStatement: builder.query({
      query: (id) => `/financial-summary/${id}/pnl`,
    }),

    // GET cash flow statement
    getCashFlowStatement: builder.query({
      query: ({ id, months = 12 }) =>
        `/financial-summary/${id}/cashflow?months=${months}`,
    }),

    // GET break-even analysis
    getBreakEvenAnalysis: builder.query({
      query: (id) => `/financial-summary/${id}/breakeven`,
    }),

    // GET investment metrics
    getInvestmentMetrics: builder.query({
      query: (id) => `/financial-summary/${id}/investment`,
    }),

    // POST create financial summary
    createFinancialSummary: builder.mutation({
      query: (data) => ({
        url: "/financial-summary",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "FinancialSummary", id: "LIST" }],
    }),

    // POST generate from references
    generateFromReferences: builder.mutation({
      query: (projectId) => ({
        url: `/financial-summary/generate/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, projectId) => [
        { type: "FinancialSummary", id: projectId },
        { type: "FinancialSummary", id: "LIST" },
      ],
    }),

    // PATCH update financial summary
    updateFinancialSummary: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/financial-summary/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FinancialSummary", id },
        { type: "FinancialSummary", id: "LIST" },
      ],
    }),

    // DELETE financial summary
    deleteFinancialSummary: builder.mutation({
      query: (id) => ({
        url: `/financial-summary/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "FinancialSummary", id: "LIST" }],
    }),

    // POST recalculate metrics
    recalculateMetrics: builder.mutation({
      query: (id) => ({
        url: `/financial-summary/${id}/recalculate`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "FinancialSummary", id },
      ],
    }),

    // POST run scenarios
    runScenarios: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/financial-summary/${id}/scenarios`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetFinancialSummariesQuery,
  useGetFinancialSummaryByIdQuery,
  useGetFinancialSummaryByProjectIdQuery,
  useGetFinancialDashboardQuery,
  useGetProfitLossStatementQuery,
  useGetCashFlowStatementQuery,
  useGetBreakEvenAnalysisQuery,
  useGetInvestmentMetricsQuery,
  useCreateFinancialSummaryMutation,
  useGenerateFromReferencesMutation,
  useUpdateFinancialSummaryMutation,
  useDeleteFinancialSummaryMutation,
  useRecalculateMetricsMutation,
  useRunScenariosMutation,
} = financialSummaryApi;
