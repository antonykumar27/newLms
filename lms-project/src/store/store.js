import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import { loginUseApi } from "./api/LoginUserApi";
import { standardSubjectApi } from "./api/StandardSubjectApi";
import { teacherCourseApi } from "./api/TeacherCourseApi";
import { quizManagementApi } from "./api/QuizManagementApi";
import { adminCourseRelatedDecisionApi } from "./api/AdminCourseRelatedDecision";
import { allAnalyticsApi } from "./api/AllAnalyticsApi";
import { teacherAnalyticsApi } from "./api/TeacherAnalytics";
import { chapterApi } from "./api/EachChapterApi";
import { courseApi } from "./api/CourseApi";
import { companyCustomerApi } from "./api/ComapnyCustomerApi";
import { chapterPageApi } from "./api/EachPageStudentApi";
import { mathsLessonsApi } from "./api/MathsLessonApi";
import { quizApi } from "./api/QuizApi";
import { chatDiscussionApi } from "./api/ChatStudentDiscussionApi";
import { razorpayApi } from "./api/razorpayApi";
import { progressApi } from "./api/ProgressApi";
import { infrastructureApi } from "./api/infrastructureApi";
import { contentCreationApi } from "./api/contentCreationApi";
import { developmentCostApi } from "./api/developmentApi";
import { sponsorsApi } from "./api/sponsorsApi";
import { operationalApi } from "./api/operationalApi";
import { revenueApi } from "./api/revenueApi";
import { kpiApi } from "./api/kpiApi";
import { marketingApi } from "./api/marketingApi";
import { financialSummaryApi } from "./api/financialSummaryApi";
import { studentAllDetailsGetAndSendApi } from "./api/StudentAllDetailsGetAndSend";

export const store = configureStore({
  reducer: {
    // Add the userApi reducer
    [loginUseApi.reducerPath]: loginUseApi.reducer,
    [standardSubjectApi.reducerPath]: standardSubjectApi.reducer,
    [teacherCourseApi.reducerPath]: teacherCourseApi.reducer,
    [quizManagementApi.reducerPath]: quizManagementApi.reducer,
    [adminCourseRelatedDecisionApi.reducerPath]:
      adminCourseRelatedDecisionApi.reducer,
    [allAnalyticsApi.reducerPath]: allAnalyticsApi.reducer,
    [teacherAnalyticsApi.reducerPath]: teacherAnalyticsApi.reducer,
    [chapterApi.reducerPath]: chapterApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [companyCustomerApi.reducerPath]: companyCustomerApi.reducer,
    [chapterPageApi.reducerPath]: chapterPageApi.reducer,
    [mathsLessonsApi.reducerPath]: mathsLessonsApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [chatDiscussionApi.reducerPath]: chatDiscussionApi.reducer,
    [razorpayApi.reducerPath]: razorpayApi.reducer,
    [progressApi.reducerPath]: progressApi.reducer,
    [infrastructureApi.reducerPath]: infrastructureApi.reducer,
    [contentCreationApi.reducerPath]: contentCreationApi.reducer,
    [developmentCostApi.reducerPath]: developmentCostApi.reducer,
    [sponsorsApi.reducerPath]: sponsorsApi.reducer,
    [operationalApi.reducerPath]: operationalApi.reducer,
    [revenueApi.reducerPath]: revenueApi.reducer,
    [kpiApi.reducerPath]: kpiApi.reducer,
    [marketingApi.reducerPath]: marketingApi.reducer,
    [financialSummaryApi.reducerPath]: financialSummaryApi.reducer,
    [studentAllDetailsGetAndSendApi.reducerPath]:
      studentAllDetailsGetAndSendApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(loginUseApi.middleware)
      .concat(standardSubjectApi.middleware)
      .concat(teacherCourseApi.middleware)
      .concat(quizManagementApi.middleware)
      .concat(adminCourseRelatedDecisionApi.middleware)
      .concat(allAnalyticsApi.middleware)
      .concat(teacherAnalyticsApi.middleware)
      .concat(chapterApi.middleware)
      .concat(courseApi.middleware)
      .concat(companyCustomerApi.middleware)
      .concat(chapterPageApi.middleware)
      .concat(mathsLessonsApi.middleware)
      .concat(quizApi.middleware)
      .concat(chatDiscussionApi.middleware)
      .concat(razorpayApi.middleware)
      .concat(progressApi.middleware)
      .concat(infrastructureApi.middleware)
      .concat(contentCreationApi.middleware)
      .concat(developmentCostApi.middleware)
      .concat(sponsorsApi.middleware)
      .concat(operationalApi.middleware)
      .concat(revenueApi.middleware)
      .concat(kpiApi.middleware)
      .concat(marketingApi.middleware)
      .concat(financialSummaryApi.middleware)
      .concat(studentAllDetailsGetAndSendApi.middleware),
});

setupListeners(store.dispatch); // Set up listeners for RTK query

export default store;
