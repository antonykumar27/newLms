import {
  Home,
  LayoutDashboard,
  BookOpenText,
  PenTool,
  TrendingUp,
  ShieldCheck,
  ListChecks,
  PlusCircle,
  Award,
  BarChart3,
  GraduationCap,
  Users,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../common/AuthContext"; // adjust if needed

export const getSidebarLinksMobiles = () => {
  const { user } = useAuth();

  const sidebarLinks = [
    {
      icon: LayoutDashboard,
      route: "/quizOverview",
      label: "Dashboard",
      show: user?.user?.role === "teacher",
    },
    {
      icon: LayoutDashboard,
      route: "/teacherDetails/applyAsTeacher",
      label: "Apply As Teacher",
    },
    {
      icon: LayoutDashboard,
      route: "/teacherDetails/teacherCreateCourseForm",
      label: "Create Video Course",
      show: user?.user?.role === "teacher",
    },
    {
      icon: LayoutDashboard,
      route: "/teacherDetails/teacherCreatingCourse",
      label: "Create Text Course",
      show: user?.user?.role === "teacher",
    },
    {
      icon: LayoutDashboard,
      route: "/teacherDetails/teacherCreateCourseExplanation",
      label: "Course Explanation",
      show: user?.user?.role === "teacher",
    },
    {
      icon: LayoutDashboard,
      route: "/teacherDetails/teacherProfile",
      label: "My Profile",
      show: user?.user?.role === "teacher",
    },

    {
      icon: TrendingUp,
      route: "/quizOverview/progress",
      label: "Progress",
      show: user?.user?.role === "teacher",
    },

    {
      icon: TrendingUp,
      route: "/quizOverview/studentQuizReusults",
      label: "Student Quiz Reusults",
      show: user?.user?.role === "teacher",
    },

    {
      icon: ShieldCheck,
      route: "/quizOverview/standardSubjectList",
      label: "Student My Class",
      show: user?.user?.role === "teacher",
    },
    {
      icon: ShieldCheck,
      route: "/teacherDetails/standardSubjectList",
      label: "I Create Course",
      show: user?.user?.role === "teacher",
    },

    {
      icon: ShieldCheck,
      route: "/quizOverview/admin",
      label: "Admin",
      show: user?.user?.role === "teacher",
    },

    {
      icon: PlusCircle,
      route: "/quizOverview/create-quiz",
      label: "Create Quiz",
      show: user?.user?.role === "teacher",
    },

    {
      icon: BarChart3,
      route: "/quizOverview/analytics",
      label: "Quiz Analytics",
      show: user?.user?.role === "teacher",
    },
    {
      icon: GraduationCap,
      route: "/quizOverview/my-learning",
      label: "My Learning",
      show: user?.user?.role === "teacher",
    },
    {
      icon: Users,
      route: "/quizOverview/participants",
      label: "Participants",
      show: user?.user?.role === "teacher",
    },
  ];

  return sidebarLinks.filter((link) => link.show !== false);
};
