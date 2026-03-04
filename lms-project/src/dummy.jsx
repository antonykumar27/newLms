import "react-toastify/dist/ReactToastify.css";
import React from "react";
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
import StudentDashboard from "./Student/StudentDashboard";
import StudentWelcomeCard from "./Student/StudentWelcomeCard";
import TeacherLayout from "./teacher/TeacherLayout";
import TeacherOutLet from "./teacher/TeacherOutLet";
import TeacherDashBord from "./teacher/TeacherDashBord";
import AdminLayout from "./admin/AdminLayout";
import AdminOutLet from "./admin/AdminOutLet";
import AdminDashBoard from "./admin/AdminDashBoard";
import TeachersapplicationDetails from "./admin/Teacher/TeachersapplicationDetails";
import AvailableAllTeachers from "./admin/Teacher/AvailableAllTeachers";
import AdminRelatedAllCourseCheck from "./admin/courses/AdminRelatedAllCourseCheck";
import TeacherCreatedCourse from "./teacher/TeacherCreatedCourse";
import StudentMySelf from "./Student/StudentMySelf";
import BecomeTeacher from "./teacher/BecomeTeacher";
import { SocketProvider } from "./common/Socket";
import TeacherCourseCreateForm from "./teacher/TeacherCourseCreateForm";
import TeacherProfile from "./teacher/TeacherProfile";
import TeacherCreateCourseExplanation from "./teacher/TeacherCreateCourseExplanation";
import SubjectRelatedChapters from "./teacher/common/SubjectRelatedChapters";
import ChapterRelatedPageCreate from "./teacher/common/ChapterRelatedPageCreate";
import ChapterRelatedPageDisplay from "./teacher/common/ChapterRelatedPageDisplay";
import EachChaperChunkContentCreate from "./teacher/common/EachChaperChunkContentCreate";
import ChapterRelatedPageDisplayEdit from "./teacher/common/ChapterRelatedPageDisplayEdit";
import EachChapterRelatedQuiz from "./teacher/common/EachChapterRelatedQuiz";
import PlayQuiz from "./teacher/common/PlayQuiz";
import EachChapterStudy from "./teacher/common/EachChapterStudy";
import DiscussionBetweenStudentandTeacher from "./teacher/discussion/DiscussionBetweenStudentandTeacher";
import { useAuth } from "./common/AuthContext";
import TeacherwelcomeBoard from "./teacher/TeacherwelcomeBoard";
import ChapterRelatedPageDisplayStudent from "./Student/ChapterRelatedPageDisplayStudent";
import SubscriptionPage from "./subscription/SubscriptionPage";
import SubscriptionRegistration from "./subscription/SubscriptionRegistration";
import RegisterPaymentStudent from "./subscription/RegisterPaymentStudent";
import AdminCreateStandard from "./admin/AdminCreateStandard";
import AdminCreatedAllStandards from "./admin/AdminCreatedAllStandards";
import StudentsDetails from "./admin/courses/StudentsDetails";
import TeacherCreatedCourseEdit from "./teacher/TeacherCreatedCourseEdit";
import UserInteractionDashboard from "./admin/common/UserInteractionDashboard";
import CourseAnalyticsDashboard from "./admin/common/CourseAnalyticsDashboard";
import CEODashboard from "./admin/common/CEODashboard";
import VideoDeepDive from "./admin/common/VideoDeepDive";
import AlertsDashboard from "./admin/common/AlertsDashboard";
import WatchProgress from "./admin/common/WatchProgress";
import AllProgressDashboard from "./admin/common/AllProgressDashboard";
import ContinueWatching from "./admin/common/ContinueWatching";
import VideoAnalytics from "./admin/common/VideoAnalytics";
import UserEngagementReport from "./admin/common/UserEngagementReport";
import PlatformAnalytics from "./admin/common/PlatformAnalytics";

function App() {
  const { user } = useAuth();

  return (
    <>
      <SocketProvider>
        <Router>
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
                {/* <Route
                  path="watchProgress/:videoId/:lessonId"
                  element={<WatchProgress />}
                /> */}
                <Route path="watchProgress" element={<WatchProgress />} />
                <Route
                  path="allProgressDashboard"
                  element={<AllProgressDashboard />}
                />
                <Route
                  path="subscription/payment"
                  element={<RegisterPaymentStudent />}
                />
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
                  path="subjectRelatedChapters/:id"
                  element={<SubjectRelatedChapters />}
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
                <Route path="alertsDashboard" element={<AlertsDashboard />} />
                <Route path="watchProgress" element={<WatchProgress />} />

                <Route
                  path="allProgressDashboard"
                  element={<AllProgressDashboard />}
                />
                <Route path="continueWatching" element={<ContinueWatching />} />
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
                <Route path="studentsDetails" element={<StudentsDetails />} />
              </Route>
            </Route>
          </Routes>
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
    </>
  );
}

export default App;
App.jsx;
