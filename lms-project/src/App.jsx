import "react-toastify/dist/ReactToastify.css";
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import WelcomePage from "./pages/WelcomePage";
// import Dashboard from "./pages/Dashboard";
// import Courses from "./pages/Courses";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./Student/StudentCommon/ProtectedRoute";
import StudentLayout from "./Student/StudentCommon/StudentLayout";
import StudentOutLet from "./Student/StudentCommon/StudentOutLet";
// import StudentDashboard from "./Student/StudentDashboard";
import StudentWelcomeCard from "./Student/StudentWelcomeCard";
import TeacherLayout from "./teacher/TeacherLayout";
import TeacherOutLet from "./teacher/TeacherOutLet";
// import TeacherDashBord from "./teacher/TeacherDashBord";
import AdminLayout from "./admin/AdminLayout";
import AdminOutLet from "./admin/AdminOutLet";
// import AdminDashBoard from "./admin/AdminDashBoard";
// import TeachersapplicationDetails from "./admin/Teacher/TeachersapplicationDetails";
// import AvailableAllTeachers from "./admin/Teacher/AvailableAllTeachers";
// import AdminRelatedAllCourseCheck from "./admin/courses/AdminRelatedAllCourseCheck";
// import TeacherCreatedCourse from "./teacher/TeacherCreatedCourse";
import StudentMySelf from "./Student/StudentMySelf";
import BecomeTeacher from "./teacher/BecomeTeacher";
import { SocketProvider } from "./common/Socket";
// import TeacherCourseCreateForm from "./teacher/TeacherCourseCreateForm";
import TeacherProfile from "./teacher/TeacherProfile";
// import TeacherCreateCourseExplanation from "./teacher/TeacherCreateCourseExplanation";
// import SubjectRelatedChapters from "./teacher/common/SubjectRelatedChapters";
// import ChapterRelatedPageCreate from "./teacher/common/ChapterRelatedPageCreate";
// import ChapterRelatedPageDisplay from "./teacher/common/ChapterRelatedPageDisplay";
// import EachChaperChunkContentCreate from "./teacher/common/EachChaperChunkContentCreate";
// import ChapterRelatedPageDisplayEdit from "./teacher/common/ChapterRelatedPageDisplayEdit";
// import EachChapterRelatedQuiz from "./teacher/common/EachChapterRelatedQuiz";
// import PlayQuiz from "./teacher/common/PlayQuiz";
// import EachChapterStudy from "./teacher/common/EachChapterStudy";
// import DiscussionBetweenStudentandTeacher from "./teacher/discussion/DiscussionBetweenStudentandTeacher";
import { useAuth } from "./common/AuthContext";
import TeacherwelcomeBoard from "./teacher/TeacherwelcomeBoard";
import Dashboard from "./Student/checking/Dashboard";
import SubjectRelatedAdminChapters from "./admin/courses/SubjectRelatedAdminChapters";
import SubjectRelatedTeacherChapters from "./teacher/common/SubjectRelatedTeacherChapters";
import { DashboardProvider } from "./Student/studentEngagement/DashboardContext";
import StudentAnalytics from "./Student/studentAnalytics/StudentAnalytics";
import CoursesDashboard from "./Student/CoursesDashboard/CoursesDashboard";
import PracticeDashboard from "./Student/PracticeDashboard/PracticeDashboard";
import LeaderboardPage from "./Student/LeaderboardPage/LeaderboardPage";
import BadgesDashboard from "./Student/BadgesDashboard/BadgesDashboard";
import ProfileDashboard from "./Student/ProfileDashboard/ProfileDashboard";
import ActivityHistory from "./Student/ActivityHistory/ActivityHistory";
import GoalsDashboard from "./Student/GoalsDashboard/GoalsDashboard";
import InsightsDashboard from "./Student/InsightsDashboard/InsightsDashboard";
import StreakDashboard from "./Student/StreakDashboard/StreakDashboard";
import HeatmapDashboard from "./Student/HeatmapDashboard/HeatmapDashboard";
// import ChapterRelatedPageDisplayStudent from "./Student/ChapterRelatedPageDisplayStudent";
// import SubscriptionPage from "./subscription/SubscriptionPage";
// import SubscriptionRegistration from "./subscription/SubscriptionRegistration";
// import RegisterPaymentStudent from "./subscription/RegisterPaymentStudent";
// import AdminCreateStandard from "./admin/AdminCreateStandard";
// import AdminCreatedAllStandards from "./admin/AdminCreatedAllStandards";
// import StudentsDetails from "./admin/courses/StudentsDetails";
// import TeacherCreatedCourseEdit from "./teacher/TeacherCreatedCourseEdit";
// import UserInteractionDashboard from "./admin/common/UserInteractionDashboard";
// import CourseAnalyticsDashboard from "./admin/common/CourseAnalyticsDashboard";
// import CEODashboard from "./admin/common/CEODashboard";
// import VideoDeepDive from "./admin/common/VideoDeepDive";
// import AlertsDashboard from "./admin/common/AlertsDashboard";
// import WatchProgress from "./admin/common/WatchProgress";
// import AllProgressDashboard from "./admin/common/AllProgressDashboard";
// import ContinueWatching from "./admin/common/ContinueWatching";
// import VideoAnalytics from "./admin/common/VideoAnalytics";
// import UserEngagementReport from "./admin/common/UserEngagementReport";
// import PlatformAnalytics from "./admin/common/PlatformAnalytics";
// import AllProgressStudentDashboard from "./Student/AllProgressStudentDashboard";
// import PlayQuizStudent from "./teacher/common/PlayQuizStudent";
// import InfrastructureDashboard from "./admin/business/InfrastructureDashboard";
// import ContentCreationDashboard from "./admin/ContentCreation/ContentCreationDashboard";
// import DevelopmentCostDashboard from "./admin/developmentcost/DevelopmentCostDashboard";
// import SponsorsDashboard from "./admin/SponserdDashBoard/SponsorsDashboard";
// import OperationalDashboard from "./admin/OperationalSystem/OperationalDashboard";
// import RevenueDashboard from "./admin/RevenueComponent/RevenueDashboard";
// import KPIDashboard from "./admin/GetKPIComponent/KPIDashboard";
// import MarketingDashboard from "./admin/CreateMarketing/MarketingDashboard";
// import FinancialSummaryDashboard from "./admin/financialsummary/FinancialSummaryDashboard";

// Simple loader component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy load all heavy components
const StudentDashboard = lazy(() => import("./Student/StudentDashboard"));
const TeacherDashBord = lazy(() => import("./teacher/TeacherDashBord"));
const AdminDashBoard = lazy(() => import("./admin/AdminDashBoard"));
const TeachersapplicationDetails = lazy(
  () => import("./admin/Teacher/TeachersapplicationDetails"),
);
const AvailableAllTeachers = lazy(
  () => import("./admin/Teacher/AvailableAllTeachers"),
);
const AdminRelatedAllCourseCheck = lazy(
  () => import("./admin/courses/AdminRelatedAllCourseCheck"),
);
const TeacherCreatedCourse = lazy(
  () => import("./teacher/TeacherCreatedCourse"),
);
const TeacherCourseCreateForm = lazy(
  () => import("./teacher/TeacherCourseCreateForm"),
);
const TeacherCreateCourseExplanation = lazy(
  () => import("./teacher/TeacherCreateCourseExplanation"),
);
const SubjectRelatedChapters = lazy(
  () => import("./teacher/common/SubjectRelatedChapters"),
);
const ChapterRelatedPageCreate = lazy(
  () => import("./teacher/common/ChapterRelatedPageCreate"),
);
const ChapterRelatedPageDisplay = lazy(
  () => import("./teacher/common/ChapterRelatedPageDisplay"),
);
const EachChaperChunkContentCreate = lazy(
  () => import("./teacher/common/EachChaperChunkContentCreate"),
);
const ChapterRelatedPageDisplayEdit = lazy(
  () => import("./teacher/common/ChapterRelatedPageDisplayEdit"),
);
const EachChapterRelatedQuiz = lazy(
  () => import("./teacher/common/EachChapterRelatedQuiz"),
);
const PlayQuiz = lazy(() => import("./teacher/common/PlayQuiz"));
const EachChapterStudy = lazy(
  () => import("./teacher/common/EachChapterStudy"),
);
const DiscussionBetweenStudentandTeacher = lazy(
  () => import("./teacher/discussion/DiscussionBetweenStudentandTeacher"),
);
const ChapterRelatedPageDisplayStudent = lazy(
  () => import("./Student/ChapterRelatedPageDisplayStudent"),
);
const SubscriptionPage = lazy(() => import("./subscription/SubscriptionPage"));
const SubscriptionRegistration = lazy(
  () => import("./subscription/SubscriptionRegistration"),
);
const RegisterPaymentStudent = lazy(
  () => import("./subscription/RegisterPaymentStudent"),
);
const AdminCreateStandard = lazy(() => import("./admin/AdminCreateStandard"));
const AdminCreatedAllStandards = lazy(
  () => import("./admin/AdminCreatedAllStandards"),
);
const StudentsDetails = lazy(() => import("./admin/courses/StudentsDetails"));
const TeacherCreatedCourseEdit = lazy(
  () => import("./teacher/TeacherCreatedCourseEdit"),
);
const UserInteractionDashboard = lazy(
  () => import("./admin/common/UserInteractionDashboard"),
);
const CourseAnalyticsDashboard = lazy(
  () => import("./admin/common/CourseAnalyticsDashboard"),
);
const CEODashboard = lazy(() => import("./admin/common/CEODashboard"));
const VideoDeepDive = lazy(() => import("./admin/common/VideoDeepDive"));
const AlertsDashboard = lazy(() => import("./admin/common/AlertsDashboard"));
const WatchProgress = lazy(() => import("./admin/common/WatchProgress"));
const AllProgressDashboard = lazy(
  () => import("./admin/common/AllProgressDashboard"),
);
const ContinueWatching = lazy(() => import("./admin/common/ContinueWatching"));
const VideoAnalytics = lazy(() => import("./admin/common/VideoAnalytics"));
const UserEngagementReport = lazy(
  () => import("./admin/common/UserEngagementReport"),
);
const PlatformAnalytics = lazy(
  () => import("./admin/common/PlatformAnalytics"),
);
const AllProgressStudentDashboard = lazy(
  () => import("./Student/AllProgressStudentDashboard"),
);
const PlayQuizStudent = lazy(
  () => import("./Student/StudentCommon/PlayQuizStudent"),
);
const InfrastructureDashboard = lazy(
  () => import("./admin/business/InfrastructureDashboard"),
);
const ContentCreationDashboard = lazy(
  () => import("./admin/ContentCreation/ContentCreationDashboard"),
);
const DevelopmentCostDashboard = lazy(
  () => import("./admin/developmentcost/DevelopmentCostDashboard"),
);
const SponsorsDashboard = lazy(
  () => import("./admin/SponserdDashBoard/SponsorsDashboard"),
);
const OperationalDashboard = lazy(
  () => import("./admin/OperationalSystem/OperationalDashboard"),
);
const RevenueDashboard = lazy(
  () => import("./admin/RevenueComponent/RevenueDashboard"),
);
const KPIDashboard = lazy(() => import("./admin/GetKPIComponent/KPIDashboard"));
const MarketingDashboard = lazy(
  () => import("./admin/CreateMarketing/MarketingDashboard"),
);
const FinancialSummaryDashboard = lazy(
  () => import("./admin/financialsummary/FinancialSummaryDashboard"),
);

function App() {
  const { user } = useAuth();

  return (
    <>
      <DashboardProvider>
        <SocketProvider>
          <Router>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<WelcomePage />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="teacherStudentDiscussion/:id"
                  element={<DiscussionBetweenStudentandTeacher />}
                />
                {/* ================= STUDENT ================= */}
                <Route
                  path="/studentDetails"
                  element={
                    <ProtectedRoute>
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route element={<StudentOutLet />}>
                    <Route
                      index
                      element={
                        user?.user?.role === "student" ? (
                          <StudentDashboard />
                        ) : (
                          <StudentWelcomeCard />
                        )
                      }
                    />
                    <Route path="registerMySelf" element={<StudentMySelf />} />
                    <Route
                      path="subjectRelatedChapters/:id"
                      element={<SubjectRelatedChapters />}
                    />
                    <Route
                      path="chapterRelatedPageDisplay/:id"
                      element={<ChapterRelatedPageDisplayStudent />}
                    />
                    <Route path="subscription" element={<SubscriptionPage />} />
                    <Route
                      path="subscription/register"
                      element={<SubscriptionRegistration />}
                    />
                    <Route path="watchProgress" element={<WatchProgress />} />
                    <Route
                      path="allProgressDashboard"
                      // element={<AllProgressStudentDashboard />}
                      element={<Dashboard />}
                    />
                    <Route
                      path="subscription/payment"
                      element={<RegisterPaymentStudent />}
                    />
                    <Route
                      path="studentAnalytics"
                      element={<StudentAnalytics />}
                    />
                    <Route
                      path="coursesDashboard"
                      element={<CoursesDashboard />}
                    />
                    <Route
                      path="practiceDashboard"
                      element={<PracticeDashboard />}
                    />
                    <Route
                      path="leaderboardPage"
                      element={<LeaderboardPage />}
                    />
                    <Route
                      path="badgesDashboard"
                      element={<BadgesDashboard />}
                    />
                    <Route
                      path="profileDashboard"
                      element={<ProfileDashboard />}
                    />
                    <Route
                      path="activityHistory"
                      element={<ActivityHistory />}
                    />
                    <Route
                      path="insightsDashboard"
                      element={<InsightsDashboard />}
                    />
                    <Route
                      path="streakDashboard"
                      element={<StreakDashboard />}
                    />
                    <Route
                      path="heatmapDashboard"
                      element={<HeatmapDashboard />}
                    />
                    <Route path="goalsDashboard" element={<GoalsDashboard />} />
                    <Route
                      path="eachChapterStudy/watch/:id"
                      element={<EachChapterStudy />}
                    />
                    <Route path="playQuiz/:id" element={<PlayQuizStudent />} />
                  </Route>
                </Route>

                {/* ================= TEACHER ================= */}
                <Route
                  path="/teacherDetails"
                  element={
                    <ProtectedRoute>
                      <TeacherLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route element={<TeacherOutLet />}>
                    <Route
                      index
                      element={
                        user?.user?.role === "teacher" ? (
                          <TeacherDashBord />
                        ) : (
                          <TeacherwelcomeBoard />
                        )
                      }
                    />

                    <Route
                      path="teacherCreatedCourse"
                      element={<TeacherCreatedCourse />}
                    />
                    <Route
                      path="teacherCreateCourseExplanation"
                      element={<TeacherCreateCourseExplanation />}
                    />
                    <Route
                      path="teacherCreateCourseForm/:id"
                      element={<TeacherCourseCreateForm />}
                    />
                    <Route
                      path="teacherCreatingCourse"
                      element={<TeacherCreatedCourse />}
                    />
                    <Route
                      path="teacherCreatingCourseEdit/:id"
                      element={<TeacherCreatedCourseEdit />}
                    />
                    <Route
                      path="subjectRelatedTeacherCreatedChapters/:id"
                      element={<SubjectRelatedTeacherChapters />}
                    />
                    <Route
                      path="chapterRelatedPageDisplay/:id"
                      element={<ChapterRelatedPageDisplay />}
                    />
                    <Route
                      path="chapterRelatedPageDisplay/edit/:id"
                      element={<ChapterRelatedPageDisplayEdit />}
                    />
                    <Route
                      path="eachChapterRelatedQuiz/:id"
                      element={<EachChapterRelatedQuiz />}
                    />
                    <Route path="playQuiz/:id" element={<PlayQuiz />} />
                    <Route
                      path="eachChapterStudy/watch/:id"
                      element={<EachChapterStudy />}
                    />
                    <Route
                      path="eachChapterChunkContentCreate/create/:id"
                      element={<EachChaperChunkContentCreate />}
                    />
                    {/* <Route
                    path="eachChapterChunkContentCreate/create/:id"
                    element={<EachChaperChunkContentCreate />}
                  /> */}
                    <Route
                      path="chapterRelatedPage/create/:id"
                      element={<ChapterRelatedPageCreate />}
                    />
                    <Route path="teacherProfile" element={<TeacherProfile />} />
                    <Route path="applyAsTeacher" element={<BecomeTeacher />} />
                  </Route>
                </Route>

                {/* ================= ADMIN ================= */}
                <Route
                  path="/adminDetails"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route element={<AdminOutLet />}>
                    <Route index element={<AdminDashBoard />} />
                    <Route
                      path="teachersapplication"
                      element={<TeachersapplicationDetails />}
                    />
                    <Route
                      path="availableTeachers"
                      element={<AvailableAllTeachers />}
                    />
                    <Route
                      path="adminCreateStandard"
                      element={<AdminCreateStandard />}
                    />
                    <Route
                      path="userInteractionDashboard"
                      element={<UserInteractionDashboard />}
                    />
                    <Route
                      path="courseAnalyticsDashboard"
                      element={<CourseAnalyticsDashboard />}
                    />
                    <Route path="ceoDashboard" element={<CEODashboard />} />
                    <Route path="videoDeepDive" element={<VideoDeepDive />} />
                    <Route
                      path="alertsDashboard"
                      element={<AlertsDashboard />}
                    />
                    <Route path="watchProgress" element={<WatchProgress />} />
                    <Route
                      path="allProgressDashboard"
                      element={<AllProgressDashboard />}
                    />
                    <Route
                      path="continueWatching"
                      element={<ContinueWatching />}
                    />
                    <Route path="videoAnalytics" element={<VideoAnalytics />} />
                    <Route
                      path="userEngagementReport"
                      element={<UserEngagementReport />}
                    />
                    <Route
                      path="platformAnalytics"
                      element={<PlatformAnalytics />}
                    />
                    <Route
                      path="adminCreatedAllStandards"
                      element={<AdminCreatedAllStandards />}
                    />
                    <Route
                      path="coursesManagement"
                      element={<AdminRelatedAllCourseCheck />}
                    />

                    <Route
                      path="teacherCreatingCourse/:id"
                      element={<SubjectRelatedAdminChapters />}
                    />
                    <Route
                      path="studentsDetails"
                      element={<StudentsDetails />}
                    />
                    {/* //business.logics */}
                    <Route
                      path="infrastructureDashboard"
                      element={<InfrastructureDashboard />}
                    />
                    <Route
                      path="contentCreationDashboard"
                      element={<ContentCreationDashboard />}
                    />
                    <Route
                      path="developmentCostDashboard"
                      element={<DevelopmentCostDashboard />}
                    />
                    <Route
                      path="sponsorsDashboard"
                      element={<SponsorsDashboard />}
                    />
                    <Route
                      path="operationalDashboard"
                      element={<OperationalDashboard />}
                    />
                    <Route
                      path="revenueDashboard"
                      element={<RevenueDashboard />}
                    />
                    <Route path="kPIDashboard" element={<KPIDashboard />} />
                    <Route
                      path="marketingDashboard"
                      element={<MarketingDashboard />}
                    />
                    <Route
                      path="financialSummaryDashboard"
                      element={<FinancialSummaryDashboard />}
                    />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
            <ToastContainer
              position="top-right"
              autoClose={1500}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
            />
          </Router>
        </SocketProvider>
      </DashboardProvider>
    </>
  );
}

export default App;

/// import "react-toastify/dist/ReactToastify.css";
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { ToastContainer } from "react-toastify";

// import WelcomePage from "./pages/WelcomePage";
// // import Dashboard from "./pages/Dashboard";
// // import Courses from "./pages/Courses";
// import Register from "./pages/Register";
// import Login from "./pages/Login";
// import ProtectedRoute from "./Student/StudentCommon/ProtectedRoute";
// import StudentLayout from "./Student/StudentCommon/StudentLayout";
// import StudentOutLet from "./Student/StudentCommon/StudentOutLet";
// import StudentDashboard from "./Student/StudentDashboard";
// import StudentWelcomeCard from "./Student/StudentWelcomeCard";
// import TeacherLayout from "./teacher/TeacherLayout";
// import TeacherOutLet from "./teacher/TeacherOutLet";
// import TeacherDashBord from "./teacher/TeacherDashBord";
// import AdminLayout from "./admin/AdminLayout";
// import AdminOutLet from "./admin/AdminOutLet";
// import AdminDashBoard from "./admin/AdminDashBoard";
// import TeachersapplicationDetails from "./admin/Teacher/TeachersapplicationDetails";
// import AvailableAllTeachers from "./admin/Teacher/AvailableAllTeachers";
// import AdminRelatedAllCourseCheck from "./admin/courses/AdminRelatedAllCourseCheck";
// import TeacherCreatedCourse from "./teacher/TeacherCreatedCourse";
// import StudentMySelf from "./Student/StudentMySelf";
// import BecomeTeacher from "./teacher/BecomeTeacher";
// import { SocketProvider } from "./common/Socket";
// import TeacherCourseCreateForm from "./teacher/TeacherCourseCreateForm";
// import TeacherProfile from "./teacher/TeacherProfile";
// import TeacherCreateCourseExplanation from "./teacher/TeacherCreateCourseExplanation";
// import SubjectRelatedChapters from "./teacher/common/SubjectRelatedChapters";
// import ChapterRelatedPageCreate from "./teacher/common/ChapterRelatedPageCreate";
// import ChapterRelatedPageDisplay from "./teacher/common/ChapterRelatedPageDisplay";
// import EachChaperChunkContentCreate from "./teacher/common/EachChaperChunkContentCreate";
// import ChapterRelatedPageDisplayEdit from "./teacher/common/ChapterRelatedPageDisplayEdit";
// import EachChapterRelatedQuiz from "./teacher/common/EachChapterRelatedQuiz";
// import PlayQuiz from "./teacher/common/PlayQuiz";
// import EachChapterStudy from "./teacher/common/EachChapterStudy";
// import DiscussionBetweenStudentandTeacher from "./teacher/discussion/DiscussionBetweenStudentandTeacher";
// import { useAuth } from "./common/AuthContext";
// import TeacherwelcomeBoard from "./teacher/TeacherwelcomeBoard";
// import ChapterRelatedPageDisplayStudent from "./Student/ChapterRelatedPageDisplayStudent";
// import SubscriptionPage from "./subscription/SubscriptionPage";
// import SubscriptionRegistration from "./subscription/SubscriptionRegistration";
// import RegisterPaymentStudent from "./subscription/RegisterPaymentStudent";
// import AdminCreateStandard from "./admin/AdminCreateStandard";
// import AdminCreatedAllStandards from "./admin/AdminCreatedAllStandards";
// import StudentsDetails from "./admin/courses/StudentsDetails";
// import TeacherCreatedCourseEdit from "./teacher/TeacherCreatedCourseEdit";
// import UserInteractionDashboard from "./admin/common/UserInteractionDashboard";
// import CourseAnalyticsDashboard from "./admin/common/CourseAnalyticsDashboard";
// import CEODashboard from "./admin/common/CEODashboard";
// import VideoDeepDive from "./admin/common/VideoDeepDive";
// import AlertsDashboard from "./admin/common/AlertsDashboard";
// import WatchProgress from "./admin/common/WatchProgress";
// import AllProgressDashboard from "./admin/common/AllProgressDashboard";
// import ContinueWatching from "./admin/common/ContinueWatching";
// import VideoAnalytics from "./admin/common/VideoAnalytics";
// import UserEngagementReport from "./admin/common/UserEngagementReport";
// import PlatformAnalytics from "./admin/common/PlatformAnalytics";
// import AllProgressStudentDashboard from "./Student/AllProgressStudentDashboard";
// import PlayQuizStudent from "./teacher/common/PlayQuizStudent";
// import InfrastructureDashboard from "./admin/business/InfrastructureDashboard";
// import ContentCreationDashboard from "./admin/ContentCreation/ContentCreationDashboard";
// import DevelopmentCostDashboard from "./admin/developmentcost/DevelopmentCostDashboard";
// import SponsorsDashboard from "./admin/SponserdDashBoard/SponsorsDashboard";
// import OperationalDashboard from "./admin/OperationalSystem/OperationalDashboard";
// import RevenueDashboard from "./admin/RevenueComponent/RevenueDashboard";
// import KPIDashboard from "./admin/GetKPIComponent/KPIDashboard";
// import MarketingDashboard from "./admin/CreateMarketing/MarketingDashboard";
// import FinancialSummaryDashboard from "./admin/financialsummary/FinancialSummaryDashboard";

// function App() {
//   const { user } = useAuth();

//   return (
//     <>
//       <SocketProvider>
//         <Router>
//           <Routes>
//             <Route path="/" element={<WelcomePage />} />

//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route
//               path="teacherStudentDiscussion/:id"
//               element={<DiscussionBetweenStudentandTeacher />}
//             />
//             {/* ================= STUDENT ================= */}
//             <Route
//               path="/studentDetails"
//               element={
//                 <ProtectedRoute>
//                   <StudentLayout />
//                 </ProtectedRoute>
//               }
//             >
//               <Route element={<StudentOutLet />}>
//                 <Route
//                   index
//                   element={
//                     user?.user?.role === "student" ? (
//                       <StudentDashboard />
//                     ) : (
//                       <StudentWelcomeCard />
//                     )
//                   }
//                 />
//                 <Route path="registerMySelf" element={<StudentMySelf />} />
//                 <Route
//                   path="subjectRelatedChapters/:id"
//                   element={<SubjectRelatedChapters />}
//                 />
//                 <Route
//                   path="chapterRelatedPageDisplay/:id"
//                   element={<ChapterRelatedPageDisplayStudent />}
//                 />
//                 <Route path="subscription" element={<SubscriptionPage />} />
//                 <Route
//                   path="subscription/register"
//                   element={<SubscriptionRegistration />}
//                 />
//                 {/* <Route
//                   path="watchProgress/:videoId/:lessonId"
//                   element={<WatchProgress />}
//                 /> */}
//                 <Route path="watchProgress" element={<WatchProgress />} />
//                 <Route
//                   path="allProgressDashboard"
//                   element={<AllProgressStudentDashboard />}
//                 />
//                 <Route
//                   path="subscription/payment"
//                   element={<RegisterPaymentStudent />}
//                 />
//                 <Route
//                   path="eachChapterStudy/watch/:id"
//                   element={<EachChapterStudy />}
//                 />
//                 <Route path="playQuiz/:id" element={<PlayQuizStudent />} />
//               </Route>
//             </Route>

//             {/* ================= TEACHER ================= */}
//             <Route
//               path="/teacherDetails"
//               element={
//                 <ProtectedRoute>
//                   <TeacherLayout />
//                 </ProtectedRoute>
//               }
//             >
//               <Route element={<TeacherOutLet />}>
//                 <Route
//                   index
//                   element={
//                     user?.user?.role === "teacher" ? (
//                       <TeacherDashBord />
//                     ) : (
//                       <TeacherwelcomeBoard />
//                     )
//                   }
//                 />

//                 <Route
//                   path="teacherCreatedCourse"
//                   element={<TeacherCreatedCourse />}
//                 />
//                 <Route
//                   path="teacherCreateCourseExplanation"
//                   element={<TeacherCreateCourseExplanation />}
//                 />
//                 <Route
//                   path="teacherCreateCourseForm/:id"
//                   element={<TeacherCourseCreateForm />}
//                 />
//                 <Route
//                   path="teacherCreatingCourse"
//                   element={<TeacherCreatedCourse />}
//                 />
//                 <Route
//                   path="teacherCreatingCourseEdit/:id"
//                   element={<TeacherCreatedCourseEdit />}
//                 />
//                 <Route
//                   path="subjectRelatedChapters/:id"
//                   element={<SubjectRelatedChapters />}
//                 />
//                 <Route
//                   path="chapterRelatedPageDisplay/:id"
//                   element={<ChapterRelatedPageDisplay />}
//                 />
//                 <Route
//                   path="chapterRelatedPageDisplay/edit/:id"
//                   element={<ChapterRelatedPageDisplayEdit />}
//                 />
//                 <Route
//                   path="eachChapterRelatedQuiz/:id"
//                   element={<EachChapterRelatedQuiz />}
//                 />
//                 <Route path="playQuiz/:id" element={<PlayQuiz />} />
//                 <Route
//                   path="eachChapterStudy/watch/:id"
//                   element={<EachChapterStudy />}
//                 />
//                 <Route
//                   path="eachChapterChunkContentCreate/create/:id"
//                   element={<EachChaperChunkContentCreate />}
//                 />
//                 <Route
//                   path="chapterRelatedPage/create/:id"
//                   element={<ChapterRelatedPageCreate />}
//                 />
//                 <Route path="teacherProfile" element={<TeacherProfile />} />
//                 <Route path="applyAsTeacher" element={<BecomeTeacher />} />
//               </Route>
//             </Route>

//             {/* ================= ADMIN ================= */}
//             <Route
//               path="/adminDetails"
//               element={
//                 <ProtectedRoute>
//                   <AdminLayout />
//                 </ProtectedRoute>
//               }
//             >
//               <Route element={<AdminOutLet />}>
//                 <Route index element={<AdminDashBoard />} />
//                 <Route
//                   path="teachersapplication"
//                   element={<TeachersapplicationDetails />}
//                 />
//                 <Route
//                   path="availableTeachers"
//                   element={<AvailableAllTeachers />}
//                 />
//                 <Route
//                   path="adminCreateStandard"
//                   element={<AdminCreateStandard />}
//                 />
//                 <Route
//                   path="userInteractionDashboard"
//                   element={<UserInteractionDashboard />}
//                 />
//                 <Route
//                   path="courseAnalyticsDashboard"
//                   element={<CourseAnalyticsDashboard />}
//                 />
//                 <Route path="ceoDashboard" element={<CEODashboard />} />
//                 <Route path="videoDeepDive" element={<VideoDeepDive />} />
//                 <Route path="alertsDashboard" element={<AlertsDashboard />} />
//                 <Route path="watchProgress" element={<WatchProgress />} />
//                 <Route
//                   path="allProgressDashboard"
//                   element={<AllProgressDashboard />}
//                 />
//                 <Route path="continueWatching" element={<ContinueWatching />} />
//                 <Route path="videoAnalytics" element={<VideoAnalytics />} />
//                 <Route
//                   path="userEngagementReport"
//                   element={<UserEngagementReport />}
//                 />
//                 <Route
//                   path="platformAnalytics"
//                   element={<PlatformAnalytics />}
//                 />
//                 <Route
//                   path="adminCreatedAllStandards"
//                   element={<AdminCreatedAllStandards />}
//                 />
//                 <Route
//                   path="coursesManagement"
//                   element={<AdminRelatedAllCourseCheck />}
//                 />
//                 <Route path="studentsDetails" element={<StudentsDetails />} />
//                 {/* //business.logics */}
//                 <Route
//                   path="infrastructureDashboard"
//                   element={<InfrastructureDashboard />}
//                 />
//                 <Route
//                   path="contentCreationDashboard"
//                   element={<ContentCreationDashboard />}
//                 />
//                 <Route
//                   path="developmentCostDashboard"
//                   element={<DevelopmentCostDashboard />}
//                 />
//                 <Route
//                   path="sponsorsDashboard"
//                   element={<SponsorsDashboard />}
//                 />
//                 <Route
//                   path="operationalDashboard"
//                   element={<OperationalDashboard />}
//                 />
//                 <Route path="revenueDashboard" element={<RevenueDashboard />} />
//                 <Route path="kPIDashboard" element={<KPIDashboard />} />
//                 <Route
//                   path="marketingDashboard"
//                   element={<MarketingDashboard />}
//                 />
//                 <Route
//                   path="financialSummaryDashboard"
//                   element={<FinancialSummaryDashboard />}
//                 />
//               </Route>
//             </Route>
//           </Routes>
//           <ToastContainer
//             position="top-right"
//             autoClose={1500}
//             hideProgressBar={false}
//             closeOnClick
//             pauseOnHover
//             draggable
//             theme="colored"
//           />
//         </Router>
//       </SocketProvider>
//     </>
//   );
// }

// export default App;
// import React from "react";
// import RedBox from "./RedBox";
// import BlueBox from "./BlueBox";
// import GreenBox from "./GreenBox";

// function App() {
//   return (
//     <div>
//       <h1>Three Boxes - JSX Version</h1>
//       <RedBox />
//       <BlueBox />
//       <GreenBox />
//     </div>
//   );
// }

// export default App;
//////////////////////////////////////////////////////////////////////////////////////////////////////
// To bring this component into 2026 design standards, we need to move beyond standard flat cards. The "trending" aesthetic for 2026 focuses on Bento-grid layouts, glassmorphism, micro-interactions, and dynamic depth (Z-axis).

// I have updated your code to include:

// Glassmorphism: Using backdrop-blur with subtle borders for a high-end feel.

// Bento Stats: Reorganized stats into a modern grid with varying weights.

// Floating Action Buttons (FAB): For better mobile ergonomics.

// Mesh Gradients: Dynamic backgrounds that feel alive.

// Enhanced Responsiveness: Smoother transitions between mobile and desktop states
