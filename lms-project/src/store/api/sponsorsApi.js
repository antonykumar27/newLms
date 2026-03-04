import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const sponsorsApi = createApi({
  reducerPath: "sponsorsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/sponsors`, // Update backend URL
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Sponsors"],
  endpoints: (builder) => ({
    // GET all sponsors records
    getSponsorsRecords: builder.query({
      query: ({ page = 1, limit = 10, sort = "-createdAt" } = {}) =>
        `/sponsors?page=${page}&limit=${limit}&sort=${sort}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.sponsorsRecords.map(({ id }) => ({
                type: "Sponsors",
                id,
              })),
              { type: "Sponsors", id: "LIST" },
            ]
          : [{ type: "Sponsors", id: "LIST" }],
    }),

    // GET single sponsors record by ID
    getSponsorsRecordById: builder.query({
      query: (id) => `/sponsors/${id}`,
      providesTags: (result, error, id) => [{ type: "Sponsors", id }],
    }),

    // GET sponsors by project ID
    getSponsorsByProjectId: builder.query({
      query: (projectId) => `/sponsors/project/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "Sponsors", id: projectId },
      ],
    }),

    // GET sponsors dashboard
    getSponsorsDashboard: builder.query({
      query: (projectId) => `/sponsors/dashboard/${projectId}`,
    }),

    // GET sponsor details
    getSponsorDetails: builder.query({
      query: (id) => `/sponsors/${id}/sponsor-details`,
    }),

    // GET investor details
    getInvestorDetails: builder.query({
      query: (id) => `/sponsors/${id}/investor-details`,
    }),

    // GET grant details
    getGrantDetails: builder.query({
      query: (id) => `/sponsors/${id}/grant-details`,
    }),

    // POST create sponsors record
    createSponsorsRecord: builder.mutation({
      query: (data) => ({
        url: "/sponsors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Sponsors", id: "LIST" }],
    }),

    // PATCH update sponsors record
    updateSponsorsRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sponsors/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Sponsors", id },
        { type: "Sponsors", id: "LIST" },
      ],
    }),

    // DELETE sponsors record
    deleteSponsorsRecord: builder.mutation({
      query: (id) => ({
        url: `/sponsors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Sponsors", id: "LIST" }],
    }),

    // POST add investor
    addInvestor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sponsors/${id}/investors`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Sponsors", id }],
    }),

    // PATCH update investor
    updateInvestor: builder.mutation({
      query: ({ id, investorIndex, ...data }) => ({
        url: `/sponsors/${id}/investors/${investorIndex}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Sponsors", id }],
    }),

    // DELETE investor
    deleteInvestor: builder.mutation({
      query: ({ id, investorIndex }) => ({
        url: `/sponsors/${id}/investors/${investorIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Sponsors", id }],
    }),

    // POST add sponsor
    addSponsor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sponsors/${id}/sponsors`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Sponsors", id }],
    }),

    // PATCH update sponsor
    updateSponsor: builder.mutation({
      query: ({ id, sponsorIndex, ...data }) => ({
        url: `/sponsors/${id}/sponsors/${sponsorIndex}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Sponsors", id }],
    }),

    // DELETE sponsor
    deleteSponsor: builder.mutation({
      query: ({ id, sponsorIndex }) => ({
        url: `/sponsors/${id}/sponsors/${sponsorIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Sponsors", id }],
    }),

    // POST add grant
    addGrant: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sponsors/${id}/grants`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Sponsors", id }],
    }),

    // PATCH update grant
    updateGrant: builder.mutation({
      query: ({ id, grantIndex, ...data }) => ({
        url: `/sponsors/${id}/grants/${grantIndex}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Sponsors", id }],
    }),

    // DELETE grant
    deleteGrant: builder.mutation({
      query: ({ id, grantIndex }) => ({
        url: `/sponsors/${id}/grants/${grantIndex}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Sponsors", id }],
    }),

    // GET export sponsors report
    exportSponsorsReport: builder.query({
      query: (projectId) => `/sponsors/export/${projectId}`,
    }),
  }),
});

// Export hooks
export const {
  useGetSponsorsRecordsQuery,
  useGetSponsorsRecordByIdQuery,
  useGetSponsorsByProjectIdQuery,
  useGetSponsorsDashboardQuery,
  useGetSponsorDetailsQuery,
  useGetInvestorDetailsQuery,
  useGetGrantDetailsQuery,
  useCreateSponsorsRecordMutation,
  useUpdateSponsorsRecordMutation,
  useDeleteSponsorsRecordMutation,
  useAddInvestorMutation,
  useUpdateInvestorMutation,
  useDeleteInvestorMutation,
  useAddSponsorMutation,
  useUpdateSponsorMutation,
  useDeleteSponsorMutation,
  useAddGrantMutation,
  useUpdateGrantMutation,
  useDeleteGrantMutation,
  useExportSponsorsReportQuery,
} = sponsorsApi;
