import {
  LayoutDashboard,
  BookOpenText,
  PenTool,
  TrendingUp,
  ShieldCheck,
  ListChecks,
  PlusCircle,
  Award,
  BarChart3,
  UserCircle,
  Home,
  MessageSquare,
  Search,
  Bell,
  User,
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Users,
  Calendar,
  Clock,
  Settings,
  FolderPlus,
  Bookmark,
  FileSearch,
  PenSquare,
  Library,
  FileVideo,
  Mic,
  Target,
  HelpCircle,
  Shield,
  Activity,
  Wallet,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users2,
  BookCheck,
  FileCheck,
  DollarSign,
  Database,
  Server,
  Cpu,
  CreditCard,
  PieChart,
  LineChart,
} from "lucide-react";

import { useAuth } from "../common/AuthContext"; // adjust if needed

export const getSidebarLinksMobiles = () => {
  const { user } = useAuth();

  const sidebarLinks = [
    {
      icon: Home,
      route: "/home",
      label: "Home",
    },
    {
      icon: Search,
      route: "/explore",
      label: "Explore",
    },

    // Admin Dashboard
    {
      icon: LayoutDashboard,
      route: "/adminDetails",
      label: "Admin Dashboard",
    },
    {
      icon: LayoutDashboard,
      route: "/adminDetails/adminCreateStandard",
      label: "Create Standards",
    },
    {
      icon: LayoutDashboard,
      route: "/adminDetails/adminCreatedAllStandards",
      label: "All Standards",
    },

    // User Management
    {
      icon: Users,
      route: "/admin/users",
      label: "User Management",
    },
    {
      icon: GraduationCap,
      route: "/adminDetails/studentsDetails",
      label: "All Students",
    },
    {
      icon: BookOpen,
      route: "/adminDetails/coursesManagement",
      label: "Course Management",
    },
    {
      icon: User,
      route: "/adminDetails/teachersapplication",
      label: "Teachers Application",
    },
    {
      icon: User,
      route: "/adminDetails/availableTeachers",
      label: "All Teachers",
    },
    {
      icon: Shield,
      route: "/admin/moderators",
      label: "Moderators",
    },

    // Course Management

    {
      icon: FolderPlus,
      route: "/admin/create-id",
      label: "Create User ID",
    },

    // Financial Management
    {
      icon: DollarSign,
      route: "/admin/finance",
      label: "Financial Management",
    },
    {
      icon: CreditCard,
      route: "/admin/transactions",
      label: "Transactions",
    },

    // Content Management
    {
      icon: FileText,
      route: "/admin/content",
      label: "Content Management",
    },
    {
      icon: Video,
      route: "/admin/live-sessions",
      label: "Live Sessions",
    },

    // Analytics
    {
      icon: BarChart3,
      route: "/admin/analytics",
      label: "Analytics",
    },
    {
      icon: PieChart,
      route: "/admin/reports",
      label: "Reports",
    },

    // System
    {
      icon: Settings,
      route: "/admin/settings",
      label: "System Settings",
    },
    {
      icon: Database,
      route: "/admin/database",
      label: "Database",
    },
    {
      icon: Server,
      route: "/admin/logs",
      label: "System Logs",
    },

    // Others
    {
      icon: Calendar,
      route: "/admin/schedule",
      label: "Master Schedule",
    },
    {
      icon: AlertCircle,
      route: "/admin/support",
      label: "Support Tickets",
    },
    {
      icon: Bell,
      route: "/admin/notifications",
      label: "System Notifications",
    },
    {
      icon: Bell,
      route: "/adminDetails/userInteractionDashboard",
      label: "UserInteraction Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/courseAnalyticsDashboard",
      label: "CourseAnalytics Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/ceoDashboard",
      label: "CEO Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/videoDeepDive",
      label: "Video Deep Dive",
    },
    {
      icon: Bell,
      route: "/adminDetails/alertsDashboard",
      label: "Alerts Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/watchProgress",
      label: "Watch Progress",
    },
    {
      icon: Bell,
      route: "/adminDetails/continueWatching",
      label: "Continue Watching",
    },
    {
      icon: Bell,
      route: "/adminDetails/videoAnalytics",
      label: "Video Analytics",
    },
    {
      icon: Bell,
      route: "/adminDetails/allProgressDashboard",
      label: "All Progress Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/userEngagementReport",
      label: "UserEngagementReport",
    },
    {
      icon: Bell,
      route: "/adminDetails/platformAnalytics",
      label: "Platfor Analytics",
    },
    {
      icon: Bell,
      route: "/adminDetails/infrastructureDashboard",
      label: "Infrastructure Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/contentCreationDashboard",
      label: "ContentCreation Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/developmentCostDashboard",
      label: "Development Cost Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/sponsorsDashboard",
      label: "Sponsors Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/operationalDashboard",
      label: "Operational Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/revenueDashboard",
      label: "Revenue Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/kPIDashboard",
      label: "KPI Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/marketingDashboard",
      label: "Marketing Dashboard",
    },
    {
      icon: Bell,
      route: "/adminDetails/financialSummaryDashboard",
      label: "Financial Summary Dashboard",
    },
  ];

  return sidebarLinks.filter((link) => link.show !== false);
};
