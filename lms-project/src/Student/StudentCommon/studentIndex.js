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
  Bell,
} from "lucide-react";

import { useAuth } from "../../common/AuthContext"; // adjust if needed

export const getSidebarLinksMobiles = () => {
  const { user } = useAuth();
  console.log("user", user?.user?.role === "student");
  console.log("user", user);
  const sidebarLinks = [
    {
      icon: Home,
      route: "/home",
      label: "Home",
      show: user?.user?.role === "student",
    },
    {
      icon: LayoutDashboard,
      route: "/quizOverview",
      label: "Dashboard",
      show: user?.user?.role === "student",
    },
    {
      icon: TrendingUp,
      route: "/studentDetails/registerMySelf",
      label: "Register My Self",
      show: user?.user?.role !== "student",
    },
    {
      icon: TrendingUp,
      route: "/quizOverview/progress",
      label: "Progress",
      show: user?.user?.role === "student",
    },

    {
      icon: TrendingUp,
      route: "/quizOverview/studentQuizReusults",
      label: "Student Quiz Reusults",
      show: user?.user?.role === "student",
    },

    {
      icon: ShieldCheck,
      route: "/quizOverview/standardSubjectList",
      label: "Student My Class",
      show: user?.user?.role === "student",
    },
    {
      icon: ShieldCheck,
      route: "/quizOverview/standardSubjectList",
      label: "Teacher My Class",
      show: user?.user?.role === "student",
    },

    {
      icon: ShieldCheck,
      route: "/quizOverview/admin",
      label: "Admin",
      show: user?.user?.role === "student",
    },

    {
      icon: PlusCircle,
      route: "/quizOverview/create-quiz",
      label: "Create Quiz",
      show: user?.user?.role === "student",
    },

    {
      icon: BarChart3,
      route: "/quizOverview/analytics",
      label: "Quiz Analytics",
      show: user?.user?.role === "student",
    },
    {
      icon: GraduationCap,
      route: "/quizOverview/my-learning",
      label: "My Learning",
      show: user?.user?.role === "student",
    },
    {
      icon: Users,
      route: "/quizOverview/participants",
      label: "quizOverview",
      show: user?.user?.role === "student",
    },
    {
      icon: Users,
      route: "/studentDetails/watchProgress",
      label: "Watch Progress",
    },
    {
      icon: Users,
      route: "/studentDetails/practiceDashboard",
      label: "Practice Dashboard",
    },
    {
      icon: Bell,
      route: "/studentDetails/coursesDashboard",
      label: "CoursesDashboard",
    },
    {
      icon: Bell,
      route: "/studentDetails/studentAnalytics",
      label: "Analytics Study",
    },
    {
      icon: Bell,
      route: "/studentDetails/allProgressDashboard",
      label: "All Progress Dashboard",
    },
    {
      icon: Bell,
      route: "/studentDetails/leaderboardPage",
      label: "Leader board Page",
    },
    {
      icon: Bell,
      route: "/studentDetails/badgesDashboard",
      label: "Badges Dashboard",
    },
    {
      icon: Bell,
      route: "/studentDetails/profileDashboard",
      label: "Profile Dashboard",
    },
    {
      icon: Bell,
      route: "/studentDetails/activityHistory",
      label: "Activity History",
    },
    {
      icon: Bell,
      route: "/studentDetails/goalsDashboard",
      label: "Goals Dashboard",
    },
    {
      icon: Bell,
      route: "/studentDetails/insightsDashboard",
      label: "Insights Dashboard",
    },
    {
      icon: Bell,
      route: "/studentDetails/streakDashboard",
      label: "Streak Dashboard",
    },
    {
      icon: Bell,
      route: "/studentDetails/heatmapDashboard",
      label: "Heatmap Dashboard",
    },
  ];

  return sidebarLinks.filter((link) => link.show !== false);
};
