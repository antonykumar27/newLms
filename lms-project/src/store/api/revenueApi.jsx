// services/teacherCourseApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const revenueApi = createApi({
  reducerPath: "revenueApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/revenue`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Revenue"],
  endpoints: (builder) => ({
    // GET all revenue records
    getRevenueRecords: builder.query({
      query: ({ page = 1, limit = 10, sort = "-createdAt" } = {}) =>
        `/revenue?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.revenues.map(({ id }) => ({
                type: "Revenue",
                id,
              })),
              { type: "Revenue", id: "LIST" },
            ]
          : [{ type: "Revenue", id: "LIST" }],
    }),

    // GET single revenue record by ID
    getRevenueRecordById: builder.query({
      query: (id) => `/revenue/${id}`,
      providesTags: (result, error, id) => [{ type: "Revenue", id }],
    }),

    // GET revenue by project ID
    getRevenueByProjectId: builder.query({
      query: (projectId) => `/revenue/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "Revenue", id: projectId },
      ],
    }),

    // GET revenue dashboard
    getRevenueDashboard: builder.query({
      query: (projectId) => `/revenue/dashboard/${projectId}`,
    }),

    // GET B2C analysis
    getB2CAnalysis: builder.query({
      query: (id) => `/revenue/${id}/b2c-analysis`,
    }),

    // GET B2B analysis
    getB2BAnalysis: builder.query({
      query: (id) => `/revenue/${id}/b2b-analysis`,
    }),

    // GET other revenue analysis
    getOtherAnalysis: builder.query({
      query: (id) => `/revenue/${id}/other-analysis`,
    }),

    // GET revenue forecast
    getRevenueForecast: builder.query({
      query: ({ id, months = 12 }) =>
        `/revenue/${id}/forecast?months=${months}`,
    }),

    // POST create revenue record
    createRevenueRecord: builder.mutation({
      query: (data) => ({
        url: "/revenue",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Revenue", id: "LIST" }],
    }),

    // PATCH update revenue record
    updateRevenueRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/revenue/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Revenue", id },
        { type: "Revenue", id: "LIST" },
      ],
    }),

    // DELETE revenue record
    deleteRevenueRecord: builder.mutation({
      query: (id) => ({
        url: `/revenue/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Revenue", id: "LIST" }],
    }),

    // POST add subscription plan
    addSubscriptionPlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/revenue/${id}/subscription-plans`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Revenue", id }],
    }),

    // PATCH update subscription plan
    updateSubscriptionPlan: builder.mutation({
      query: ({ id, planIndex, ...data }) => ({
        url: `/revenue/${id}/subscription-plans/${planIndex}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Revenue", id }],
    }),

    // DELETE subscription plan
    deleteSubscriptionPlan: builder.mutation({
      query: ({ id, planIndex }) => ({
        url: `/revenue/${id}/subscription-plans/${planIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Revenue", id }],
    }),

    // POST add corporate training
    addCorporateTraining: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/revenue/${id}/corporate-training`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Revenue", id }],
    }),

    // POST add college partnership
    addCollegePartnership: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/revenue/${id}/college-partnership`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Revenue", id }],
    }),

    // GET export revenue report
    exportRevenueReport: builder.query({
      query: (projectId) => `/revenue/export/${projectId}`,
    }),
  }),
});

// Export hooks
export const {
  useGetRevenueRecordsQuery,
  useGetRevenueRecordByIdQuery,
  useGetRevenueByProjectIdQuery,
  useGetRevenueDashboardQuery,
  useGetB2CAnalysisQuery,
  useGetB2BAnalysisQuery,
  useGetOtherAnalysisQuery,
  useGetRevenueForecastQuery,
  useCreateRevenueRecordMutation,
  useUpdateRevenueRecordMutation,
  useDeleteRevenueRecordMutation,
  useAddSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useAddCorporateTrainingMutation,
  useAddCollegePartnershipMutation,
  useExportRevenueReportQuery,
} = revenueApi;
