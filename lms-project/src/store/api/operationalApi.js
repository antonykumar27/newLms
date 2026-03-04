// src/store/api/ProgressApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const operationalApi = createApi({
  reducerPath: "operationalApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/operational`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Operational"],
  endpoints: (builder) => ({
    // GET all operational records
    getOperationalRecords: builder.query({
      query: ({ page = 1, limit = 10, sort = "-createdAt" } = {}) =>
        `/operational?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.operationalRecords.map(({ id }) => ({
                type: "Operational",
                id,
              })),
              { type: "Operational", id: "LIST" },
            ]
          : [{ type: "Operational", id: "LIST" }],
    }),

    // GET single operational record by ID
    getOperationalRecordById: builder.query({
      query: (id) => `/operational/${id}`,
      providesTags: (result, error, id) => [{ type: "Operational", id }],
    }),

    // GET operational by project ID
    getOperationalByProjectId: builder.query({
      query: (projectId) => `/operational/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "Operational", id: projectId },
      ],
    }),

    // GET operational dashboard
    getOperationalDashboard: builder.query({
      query: (projectId) => `/operational/dashboard/${projectId}`,
    }),

    // GET employee costs
    getEmployeeCosts: builder.query({
      query: (id) => `/operational/${id}/employee-costs`,
    }),

    // GET office expenses
    getOfficeExpenses: builder.query({
      query: (id) => `/operational/${id}/office-expenses`,
    }),

    // GET legal summary
    getLegalSummary: builder.query({
      query: (id) => `/operational/${id}/legal-summary`,
    }),

    // GET tech summary
    getTechSummary: builder.query({
      query: (id) => `/operational/${id}/tech-summary`,
    }),

    // GET optimization suggestions
    getOptimizationSuggestions: builder.query({
      query: (id) => `/operational/${id}/optimize`,
    }),

    // POST create operational record
    createOperationalRecord: builder.mutation({
      query: (data) => ({
        url: "/operational",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Operational", id: "LIST" }],
    }),

    // PATCH update operational record
    updateOperationalRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/operational/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Operational", id },
        { type: "Operational", id: "LIST" },
      ],
    }),

    // DELETE operational record
    deleteOperationalRecord: builder.mutation({
      query: (id) => ({
        url: `/operational/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Operational", id: "LIST" }],
    }),

    // PATCH update office space
    updateOfficeSpace: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/operational/${id}/office`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Operational", id }],
    }),

    // POST add employee role
    addEmployeeRole: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/operational/${id}/employees`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Operational", id }],
    }),

    // PATCH update employee role
    updateEmployeeRole: builder.mutation({
      query: ({ id, employeeIndex, ...data }) => ({
        url: `/operational/${id}/employees/${employeeIndex}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Operational", id }],
    }),

    // DELETE employee role
    deleteEmployeeRole: builder.mutation({
      query: ({ id, employeeIndex }) => ({
        url: `/operational/${id}/employees/${employeeIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Operational", id }],
    }),

    // POST add technology tool
    addTechTool: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/operational/${id}/tech-tools`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Operational", id }],
    }),

    // DELETE technology tool
    deleteTechTool: builder.mutation({
      query: ({ id, category, toolIndex }) => ({
        url: `/operational/${id}/tech-tools/${category}/${toolIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Operational", id }],
    }),

    // GET export operational report
    exportOperationalReport: builder.query({
      query: (projectId) => `/operational/export/${projectId}`,
    }),
  }),
});

// Export hooks
export const {
  useGetOperationalRecordsQuery,
  useGetOperationalRecordByIdQuery,
  useGetOperationalByProjectIdQuery,
  useGetOperationalDashboardQuery,
  useGetEmployeeCostsQuery,
  useGetOfficeExpensesQuery,
  useGetLegalSummaryQuery,
  useGetTechSummaryQuery,
  useGetOptimizationSuggestionsQuery,
  useCreateOperationalRecordMutation,
  useUpdateOperationalRecordMutation,
  useDeleteOperationalRecordMutation,
  useUpdateOfficeSpaceMutation,
  useAddEmployeeRoleMutation,
  useUpdateEmployeeRoleMutation,
  useDeleteEmployeeRoleMutation,
  useAddTechToolMutation,
  useDeleteTechToolMutation,
  useExportOperationalReportQuery,
} = operationalApi;
