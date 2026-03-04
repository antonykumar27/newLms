// services/companyApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const companyCustomerApi = createApi({
  reducerPath: "companyCustomerApi",
  tagTypes: ["User"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/jobcreate`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.user?.token || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createCompany: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }], // Tag invalidation for cache management
    }),
    createMyProfile: builder.mutation({
      query: (formData) => ({
        url: "/createmyprofile",
        method: "POST",
        body: formData,
      }),
    }),
    createMyJobAply: builder.mutation({
      query: (formData) => ({
        url: "/createmyjobaply",
        method: "POST",
        body: formData,
      }),
    }),
    cancelMyJobAply: builder.mutation({
      query: (formData) => ({
        url: "/cancelmyjobaply",
        method: "POST",
        body: formData,
      }),
    }),
    UpdateMyProfile: builder.mutation({
      query: ({ formData, jobId }) => ({
        url: jobId ? `/updatemyprofile/${jobId}` : "/createmyprofile",
        method: jobId ? "PUT" : "POST",
        body: formData,
      }),
    }),

    getMyProfile: builder.query({
      query: () => "/myownprofile", // Replace '/all' with the correct API endpoint if different
    }),
    getMyEmployeeApliedJobList: builder.query({
      query: () => "/getMyEmployeeApliedJobList", // Replace '/all' with the correct API endpoint if different
    }),
    getMyApliedJobList: builder.query({
      query: () => "/getEmployeeApliedJobList", // Replace '/all' with the correct API endpoint if different
    }),
    getCompanyById: builder.query({
      query: (id) => `/get/${id}`,
    }),
    getEmployeeDetailsForEmployerById: builder.query({
      query: (id) => `/getEmployeeDetailsForEmployerById/${id}`,
    }),
    updateCompany: builder.mutation({
      query: ({ id, data }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/updateApplicationStatus/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
    }),
    listCompanies: builder.query({
      query: () => "/list",
    }),

    // New endpoint for fetching all companies
    getAllCompanies: builder.query({
      query: () => "/all", // Replace '/all' with the correct API endpoint if different
    }),
    // New endpoint for fetching all companies
    getAllJobVacancies: builder.query({
      query: () => "/allJobVacancies", // Replace '/all' with the correct API endpoint if different
    }),
  }),
});

export const {
  useUpdateApplicationStatusMutation,
  useCreateCompanyMutation,
  useCreateMyProfileMutation,
  useCreateMyJobAplyMutation,
  useCancelMyJobAplyMutation,
  useGetMyProfileQuery,
  useGetMyEmployeeApliedJobListQuery,
  useGetMyApliedJobListQuery,
  useGetEmployeeDetailsForEmployerByIdQuery,
  useGetCompanyByIdQuery,
  useUpdateCompanyMutation,
  useUpdateMyProfileMutation,
  useDeleteCompanyMutation,
  useListCompaniesQuery,
  useGetAllJobVacanciesQuery,
  useGetAllCompaniesQuery, // Export the new hook
} = companyCustomerApi;
