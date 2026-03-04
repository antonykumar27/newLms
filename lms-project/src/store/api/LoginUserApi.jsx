import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const loginUseApi = createApi({
  reducerPath: "loginUseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/authentication/`,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.user?.token || localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // 🟢 REGISTER
    postUser: builder.mutation({
      query: (data) => ({
        url: "register",
        method: "POST",
        body: data,
      }),
    }),
    // 🟢 REGISTER As Student
    postUserAsStudent: builder.mutation({
      query: (data) => ({
        url: "registerAsStudent",
        method: "POST",
        body: data,
      }),
    }),
    // 🔵 LOGIN
    loginUser: builder.mutation({
      query: (data) => ({
        url: "login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // 🔍 EMAIL VALIDATION (New endpoint)
    checkEmail: builder.query({
      query: (email) => ({
        url: "check-email",
        method: "POST",
        body: { email },
      }),
      // Cache email check results for 30 seconds
      keepUnusedDataFor: 30,
    }),

    // 🔍 LAZY EMAIL VALIDATION (For real-time checking)
    // Use ONE endpoint for the email check
    checkEmail: builder.query({
      query: (email) => ({
        url: "check-email",
        method: "POST",
        body: { email },
      }),
    }),

    // 🟢 GET LOGGED USER
    getUser: builder.query({
      query: () => "me",
      providesTags: ["User"],
    }),
    // 🟢 GET LOGGED USER
    getUserStandard: builder.query({
      query: () => "meStandard",
      providesTags: ["User"],
    }),
    // 🟢 GET All Student Details
    getAdminRelatedStudents: builder.query({
      query: () => "adminRelatedSuents",
      providesTags: ["User"],
    }),
    // 🟡 UPDATE PROFILE
    updateUser: builder.mutation({
      query: (data) => ({
        url: "update",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // 🔴 DELETE ACCOUNT
    deleteUser: builder.mutation({
      query: () => ({
        url: "delete",
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // 🔑 ADMIN SPECIFIC ENDPOINTS
    verifyAdminCode: builder.mutation({
      query: (data) => ({
        url: "verify-admin-code",
        method: "POST",
        body: data,
      }),
    }),

    // 📧 RESEND VERIFICATION EMAIL
    resendVerification: builder.mutation({
      query: (email) => ({
        url: "resend-verification",
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const {
  usePostUserMutation,
  useLazyCheckEmailQuery,
  useLoginUserMutation,
  useCheckEmailQuery,
  usePostUserAsStudentMutation,

  useGetUserQuery,
  useGetUserStandardQuery,
  useGetAdminRelatedStudentsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useVerifyAdminCodeMutation,
  useResendVerificationMutation,
} = loginUseApi;
