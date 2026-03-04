import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const razorpayApi = createApi({
  reducerPath: "razorpayApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/razorpay`, // Update backend URL
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
    // Get Razorpay Key for frontend
    getRazorpayKey: builder.query({
      query: () => "/razorpay-keyget", // Backend API that returns Razorpay Key
    }),

    // Create a new Razorpay order
    createOrder: builder.mutation({
      query: (amount) => ({
        url: "/create-order",
        method: "POST",
        body: amount, // Amount in INR
      }),
    }),
    // Create course order
    createCourseOrder: builder.mutation({
      query: (orderData) => ({
        url: "/create-course-order",
        method: "POST",
        body: orderData,
      }),
    }),
    // Verify course payment
    verifyCoursePayment: builder.mutation({
      query: (paymentData) => ({
        url: "/verify-course-payment",
        method: "POST",
        body: paymentData,
      }),
    }),
    // Verify Payment
    verifyPayment: builder.mutation({
      query: (body) => ({
        url: "/verify-payment",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetRazorpayKeyQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useCreateCourseOrderMutation,
  useVerifyCoursePaymentMutation,
} = razorpayApi;
