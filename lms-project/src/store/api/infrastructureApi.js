import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const infrastructureApi = createApi({
  reducerPath: "infrastructureApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/Infrastructure`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token"); // Check both sources

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Infrastructure"],
  endpoints: (builder) => ({
    // GET all infrastructure records
    getInfrastructure: builder.query({
      query: ({ page = 1, limit = 10, sort = "-createdAt" } = {}) =>
        `/infrastructure?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.infrastructure.map(({ id }) => ({
                type: "Infrastructure",
                id,
              })),
              { type: "Infrastructure", id: "LIST" },
            ]
          : [{ type: "Infrastructure", id: "LIST" }],
    }),

    // GET single infrastructure by ID
    getInfrastructureById: builder.query({
      query: (id) => `/infrastructure/${id}`,
      providesTags: (result, error, id) => [{ type: "Infrastructure", id }],
    }),

    // GET infrastructure by project ID
    getInfrastructureByProjectId: builder.query({
      query: (projectId) => `/infrastructure/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "Infrastructure", id: projectId },
      ],
    }),

    // LAZY check if infrastructure exists
    checkInfrastructureExists: builder.query({
      query: (projectId) => `/infrastructure/project/${projectId}`,
      providesTags: ["Infrastructure"],
    }),

    // POST create new infrastructure
    createInfrastructure: builder.mutation({
      query: (data) => ({
        url: "/infrastructure",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Infrastructure", id: "LIST" }],
    }),

    // PATCH update infrastructure
    updateInfrastructure: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/infrastructure/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Infrastructure", id },
        { type: "Infrastructure", id: "LIST" },
      ],
    }),

    // DELETE infrastructure
    deleteInfrastructure: builder.mutation({
      query: (id) => ({
        url: `/infrastructure/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Infrastructure", id: "LIST" }],
    }),

    // GET optimization suggestions
    getOptimizationSuggestions: builder.query({
      query: (id) => `/infrastructure/${id}/optimize`,
    }),

    // GET monthly breakdown
    getMonthlyBreakdown: builder.query({
      query: (id) => `/infrastructure/${id}/monthly-breakdown`,
    }),

    // POST compare providers
    compareProviders: builder.mutation({
      query: (requirements) => ({
        url: "/infrastructure/compare-providers",
        method: "POST",
        body: requirements,
      }),
    }),

    // POST estimate scaling
    estimateScaling: builder.mutation({
      query: (data) => ({
        url: "/infrastructure/estimate-scaling",
        method: "POST",
        body: data,
      }),
    }),

    // POST usage forecast
    getUsageForecast: builder.mutation({
      query: (data) => ({
        url: "/infrastructure/forecast",
        method: "POST",
        body: data,
      }),
    }),

    // PATCH upgrade backend tier
    upgradeBackendTier: builder.mutation({
      query: ({ id, newTier }) => ({
        url: `/infrastructure/${id}/upgrade-backend`,
        method: "PATCH",
        body: { newTier },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Infrastructure", id },
      ],
    }),

    // PATCH upgrade database tier
    upgradeDatabaseTier: builder.mutation({
      query: ({ id, newTier }) => ({
        url: `/infrastructure/${id}/upgrade-database`,
        method: "PATCH",
        body: { newTier },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Infrastructure", id },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetInfrastructureQuery,
  useGetInfrastructureByIdQuery,
  useGetInfrastructureByProjectIdQuery,
  useLazyCheckInfrastructureExistsQuery,
  useCreateInfrastructureMutation,
  useUpdateInfrastructureMutation,
  useDeleteInfrastructureMutation,
  useGetOptimizationSuggestionsQuery,
  useGetMonthlyBreakdownQuery,
  useCompareProvidersMutation,
  useEstimateScalingMutation,
  useGetUsageForecastMutation,
  useUpgradeBackendTierMutation,
  useUpgradeDatabaseTierMutation,
} = infrastructureApi;
