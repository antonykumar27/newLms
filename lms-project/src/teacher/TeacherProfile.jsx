// src/components/teacher/TeacherProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Settings,
  Edit,
  Calendar,
  Award,
  Users,
  Star,
  TrendingUp,
  BookOpen,
  Clock,
  DollarSign,
  Globe,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Facebook,
  Share2,
  Download,
  Bell,
  CheckCircle,
  XCircle,
  MoreVertical,
  Plus,
  Eye,
  BarChart3,
  MessageSquare,
  Heart,
  ExternalLink,
  GraduationCap,
  Target,
  Medal,
  Trophy,
  Zap,
  Shield,
  Users as UsersIcon,
  Briefcase,
  FileText,
  Video,
  Image as ImageIcon,
  Music,
  Code,
  PenTool,
  Moon,
  Sun,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Sparkles,
  Rocket,
  Target as TargetIcon,
  Zap as ZapIcon,
  Brain,
  Cpu,
  Cloud,
  Database,
  Palette,
  Smartphone,
  Globe as GlobeIcon,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  Crown,
  BadgeCheck,
  Flame,
  Star as StarIcon,
  Coffee,
} from "lucide-react";

import { useTheme } from "next-themes";
import { useGetStudentProfileQuery } from "../store/api/CourseApi";
const TeacherProfile = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useGetStudentProfileQuery();
  console.log("data", data);
  // Enhanced stats with trends
  const [stats, setStats] = useState({
    totalStudents: { value: 1250, trend: "+12%", trendUp: true },
    totalCourses: { value: 15, trend: "+3", trendUp: true },
    totalReviews: { value: 342, trend: "+28", trendUp: true },
    averageRating: { value: 4.8, trend: "+0.2", trendUp: true },
    totalRevenue: { value: 45250, trend: "+8%", trendUp: true },
    completionRate: { value: 92, trend: "+4%", trendUp: true },
    engagement: { value: 87, trend: "+5%", trendUp: true },
    satisfaction: { value: 94, trend: "+2%", trendUp: true },
  });
  const [profiles, setProfiles] = useState({});
  useEffect(() => {
    if (!data?.data) return;

    const d = data.data;
    console.log("data", d);
    setProfiles({
      profile: d.profile || {},
      user: d.user || {},
      social: d.social || {},
      assignedClasses: d.assignedClasses || [],
      contact: d.contact || {},
      stats: d.stats || {},
      settings: d.settings || {},
      payment: d.payment || {},
      verification: d.verification || {},
      application: d.application || {},
      access: d.access || {},
      onboarding: d.onboarding || {},
      metadata: d.metadata || {},
      avatar: d.media || {},
    });
  }, [data]);
  console.log("profiles", profiles);
  // Enhanced teacher profile data
  const [profileData, setProfileData] = useState({
    personalInfo: {
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex.johnson@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "www.alexjohnson.com",
      bio: "Senior Full-Stack Developer with 8+ years of experience. Passionate about teaching programming and helping students achieve their career goals. Specialized in React, Node.js, and cloud technologies.",
      headline: "Senior Developer & Tech Educator",
      languages: ["English", "Spanish", "French"],
      joinDate: "January 2023",
      level: "Pro",
      badge: "Top 1%",
      availability: "Available for mentoring",
      timezone: "PST",
      aiAssistant: true,
    },
    socialLinks: {
      twitter: "twitter.com/alexjohnson",
      linkedin: "linkedin.com/in/alexjohnson",
      youtube: "youtube.com/c/alexjohnson",
      github: "github.com/alexjohnson",
      instagram: "instagram.com/alexjohnson",
      discord: "discord.gg/alexjohnson",
    },
    education: [
      {
        id: 1,
        degree: "Master of Computer Science",
        institution: "Stanford University",
        year: "2015-2017",
        description: "Specialized in Artificial Intelligence",
        icon: GraduationCap,
      },
      {
        id: 2,
        degree: "Bachelor of Engineering",
        institution: "MIT",
        year: "2011-2015",
        description: "Computer Science Major",
        icon: Brain,
      },
    ],
    experience: [
      {
        id: 1,
        position: "Senior Software Engineer",
        company: "Google",
        period: "2020-Present",
        description: "Leading frontend development for Google Drive",
        icon: Cpu,
      },
      {
        id: 2,
        position: "Full Stack Developer",
        company: "Facebook",
        period: "2017-2020",
        description: "Developed React components for core features",
        icon: Code,
      },
    ],
    skills: [
      {
        name: "React",
        level: 95,
        category: "Frontend",
        trend: "+5%",
        icon: Code,
      },
      {
        name: "Node.js",
        level: 90,
        category: "Backend",
        trend: "+3%",
        icon: Database,
      },
      {
        name: "TypeScript",
        level: 88,
        category: "Frontend",
        trend: "+8%",
        icon: FileText,
      },
      { name: "AWS", level: 85, category: "Cloud", trend: "+12%", icon: Cloud },
      {
        name: "MongoDB",
        level: 82,
        category: "Database",
        trend: "+4%",
        icon: Database,
      },
      {
        name: "Docker",
        level: 80,
        category: "DevOps",
        trend: "+7%",
        icon: Cpu,
      },
      {
        name: "Python",
        level: 75,
        category: "Backend",
        trend: "+2%",
        icon: Code,
      },
      {
        name: "GraphQL",
        level: 70,
        category: "Backend",
        trend: "+10%",
        icon: GlobeIcon,
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon",
        year: "2023",
        verified: true,
        icon: Shield,
      },
      {
        name: "Google Professional Cloud Developer",
        issuer: "Google",
        year: "2022",
        verified: true,
        icon: TargetIcon,
      },
      {
        name: "React Developer Certification",
        issuer: "Meta",
        year: "2021",
        verified: true,
        icon: ZapIcon,
      },
    ],
    achievements: [
      {
        title: "Top Rated Instructor 2024",
        description: "Ranked in top 1% of instructors",
        icon: Crown,
        color: "from-yellow-500 to-orange-500",
        date: "2024",
      },
      {
        title: "10K+ Students",
        description: "Reached 10,000 students milestone",
        icon: Users,
        color: "from-blue-500 to-cyan-500",
        date: "2024",
      },
      {
        title: "5 Star Average",
        description: "Consistent 5-star ratings",
        icon: StarIcon,
        color: "from-purple-500 to-pink-500",
        date: "2024",
      },
      {
        title: "Featured Instructor",
        description: "Featured on platform homepage",
        icon: TrendingUp,
        color: "from-green-500 to-emerald-500",
        date: "2024",
      },
      {
        title: "AI Mentor Certified",
        description: "Certified AI teaching assistant",
        icon: Brain,
        color: "from-indigo-500 to-purple-500",
        date: "2024",
      },
      {
        title: "Rapid Growth",
        description: "Fastest growing instructor",
        icon: Rocket,
        color: "from-red-500 to-orange-500",
        date: "2024",
      },
    ],
    aiFeatures: {
      enabled: true,
      assistant: "AI Teaching Assistant Active",
      analytics: "AI-Powered Insights",
      recommendations: "Personalized course suggestions",
    },
    teachingInfo: {
      subjects: ["React", "Node.js", "AI"],
      teachingSince: 2018,
      totalStudents: 12450,
      totalCourses: 18,
      avgRating: 4.8,
      teachingStyle: ["Hands-on", "Project-based", "Beginner Friendly"],
    },
    verification: {
      emailVerified: true,
      identityVerified: true,
      certificatesVerified: true,
    },
    mentorship: {
      enabled: true,
      hourlyRate: 40,
      currency: "USD",
      slotsAvailable: 3,
    },
    settings: {
      profileVisibility: "public",
      showEarnings: false,
      allowMessages: true,
      emailNotifications: true,
    },
  });

  // Enhanced recent courses with AI tags
  const [recentCourses, setRecentCourses] = useState([
    {
      id: 1,
      title: "Complete React Masterclass 2025",
      category: "Programming",
      students: 1250,
      rating: 4.9,
      price: 89.99,
      discountPrice: 69.99,
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
      status: "published",
      featured: true,
      trending: true,
      aiEnhanced: true,
      new: true,
      level: "Advanced",
      duration: "15h",
      tags: ["React", "TypeScript", "AI", "2025"],
    },
    {
      id: 2,
      title: "Node.js & AI Integration",
      category: "Programming",
      students: 845,
      rating: 4.8,
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop",
      status: "published",
      featured: false,
      trending: true,
      aiEnhanced: true,
      new: true,
      level: "Intermediate",
      duration: "12h",
      tags: ["Node.js", "AI", "Backend"],
    },
    {
      id: 3,
      title: "TypeScript + AI Best Practices",
      category: "Programming",
      students: 620,
      rating: 4.7,
      price: 59.99,
      discountPrice: 39.99,
      image:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=225&fit=crop",
      status: "published",
      featured: true,
      trending: false,
      aiEnhanced: false,
      new: false,
      level: "Beginner",
      duration: "8h",
      tags: ["TypeScript", "Frontend"],
    },
    {
      id: 4,
      title: "AI Cloud Solutions with AWS",
      category: "Cloud",
      students: 450,
      rating: 4.9,
      price: 99.99,
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop",
      status: "draft",
      featured: false,
      trending: false,
      aiEnhanced: true,
      new: true,
      level: "Advanced",
      duration: "20h",
      tags: ["AWS", "AI", "Cloud", "2025"],
    },
    {
      id: 5,
      title: "Mobile AI Development",
      category: "Mobile",
      students: 320,
      rating: 4.6,
      price: 74.99,
      discountPrice: 49.99,
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=225&fit=crop",
      status: "published",
      featured: true,
      trending: true,
      aiEnhanced: true,
      new: true,
      level: "Intermediate",
      duration: "10h",
      tags: ["Mobile", "AI", "React Native"],
    },
    {
      id: 6,
      title: "AI-Powered Web Design",
      category: "Design",
      students: 280,
      rating: 4.5,
      price: 54.99,
      image:
        "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400&h=225&fit=crop",
      status: "published",
      featured: false,
      trending: true,
      aiEnhanced: true,
      new: false,
      level: "Beginner",
      duration: "6h",
      tags: ["Design", "AI", "Figma"],
    },
  ]);

  // Enhanced recent reviews
  const [recentReviews, setRecentReviews] = useState([
    {
      id: 1,
      student: "Sarah Johnson",
      course: "Complete React Masterclass",
      rating: 5,
      comment:
        "Amazing course! Alex explains complex concepts in a very simple way. The AI-powered exercises were incredibly helpful!",
      date: "2 days ago",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b786d4c9?w=100&h=100&fit=crop",
      helpful: 24,
      verified: true,
    },
    {
      id: 2,
      student: "Mike Chen",
      course: "Node.js Backend Development",
      rating: 4,
      comment:
        "Great content, but could use more real-world AI integration examples. Overall excellent course!",
      date: "1 week ago",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      helpful: 12,
      verified: true,
    },
    {
      id: 3,
      student: "Emma Wilson",
      course: "TypeScript for Beginners",
      rating: 5,
      comment:
        "Perfect for beginners! The examples are very practical and the AI assistant helped me understand difficult concepts.",
      date: "2 weeks ago",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      helpful: 31,
      verified: true,
    },
  ]);

  // Enhanced recent activities
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: "course_published",
      title: "Published new AI course",
      description: "Complete React Masterclass 2025",
      time: "2 hours ago",
      icon: Rocket,
      color: "text-blue-500 bg-blue-100",
    },
    {
      id: 2,
      type: "student_enrolled",
      title: "New student enrolled",
      description: "Sarah Johnson joined your AI course",
      time: "1 day ago",
      icon: Users,
      color: "text-green-500 bg-green-100",
    },
    {
      id: 3,
      type: "review_received",
      title: "Received 5-star review",
      description: "From Mike Chen on Node.js AI course",
      time: "2 days ago",
      icon: Star,
      color: "text-yellow-500 bg-yellow-100",
    },
    {
      id: 4,
      type: "milestone",
      title: "AI Expert Badge Earned",
      description: "Certified as AI Teaching Expert",
      time: "1 week ago",
      icon: BadgeCheck,
      color: "text-purple-500 bg-purple-100",
    },
    {
      id: 5,
      type: "trending",
      title: "Course Trending",
      description: "React Masterclass trending #1",
      time: "3 days ago",
      icon: Flame,
      color: "text-orange-500 bg-orange-100",
    },
  ]);

  // Filter courses based on search
  const filteredCourses = recentCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditing(true);
    // In a real app, you would open a modal or navigate to edit page
    console.log("Edit profile clicked");
  };

  // Handle course click
  const handleCourseClick = (courseId) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  // Handle share profile
  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profileData.personalInfo.firstName} ${profileData.personalInfo.lastName}'s Profile`,
        text: `Check out ${profileData.personalInfo.firstName}'s AI-powered courses on our platform!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Profile link copied to clipboard!");
    }
  };

  // Handle export data
  const handleExportData = () => {
    const data = {
      profile: profileData,
      stats: stats,
      courses: recentCourses,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teacher-profile-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const levelToPercent = {
    beginner: 40,
    intermediate: 70,
    expert: 90,
  };
  const convertedSkills = (profiles?.profile?.expertise || []).map((exp) => ({
    name: exp.name,
    level: levelToPercent[exp.level] || 50,
    category: "Expertise", // single category
    trend: "+0%",
    icon: Code,
  }));

  // Calculate skill distribution by category
  const skillCategories = convertedSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      Programming: Code,
      Cloud: Cloud,
      Design: Palette,
      Mobile: Smartphone,
      Business: Briefcase,
      Music: Music,
      AI: Brain,
      Default: BookOpen,
    };
    return icons[category] || icons.Default;
  };

  // Enhanced tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: UsersIcon },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "ai", label: "AI Insights", icon: Brain },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-b from-gray-900 to-black text-white"
          : "bg-gradient-to-b from-gray-50 to-white text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-colors ${
          theme === "dark"
            ? "bg-gray-900/80 border-gray-800"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Teacher Dashboard
                </h1>
                {profileData.aiFeatures.enabled && (
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Enhanced
                  </span>
                )}
              </div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage your AI-powered teaching profile
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShareProfile}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={handleExportData}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <Link
                to="/teacherDetails/teacherCreateCourseForm"
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl text-white p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-start space-x-6">
              {/* Profile Image */}
              <div className="relative">
                {console.log("profiles", profiles)}
                <div className="w-32 h-32 rounded-2xl border-4 border-white/20 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center shadow-2xl overflow-hidden">
                  {profiles?.avatar?.length > 0 ? (
                    <img
                      src={profiles.avatar[0].url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                {/* Verified badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                {/* Featured badge */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <h1 className="text-4xl font-bold">
                    {profiles?.user?.name}{" "}
                  </h1>
                  <div className="flex items-center space-x-2">
                    {profiles?.access?.level && (
                      <span
                        className={`
      px-3 py-1 rounded-full text-xs font-semibold tracking-wide
      ${
        profiles.access.level === "basic"
          ? "bg-gray-200 text-gray-700"
          : profiles.access.level === "pro"
            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      }
    `}
                      >
                        {profiles.access.level.toUpperCase()} TEACHER
                      </span>
                    )}

                    {profiles?.access?.level && (
                      <span className="px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-sm font-medium flex items-center">
                        <Crown className="w-4 h-4 mr-1" />
                        {profiles.access.level.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xl text-white/90 mb-4 flex items-center">
                  {profiles?.profile?.experience[0].position}
                  <span className="ml-3 px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded text-xs font-medium">
                    AI Mentor
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center backdrop-blur-sm bg-white/10 px-3 py-1 rounded-lg">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profiles?.user?.city} , {profiles?.user?.village}
                  </div>

                  <div className="flex items-center backdrop-blur-sm bg-white/10 px-3 py-1 rounded-lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined{" "}
                    {data?.data?.createdAt &&
                      new Date(data.data.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          month: "short",
                          year: "numeric",
                        },
                      )}
                  </div>
                  <div className="flex items-center backdrop-blur-sm bg-white/10 px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4 mr-2" />
                    {profileData.personalInfo.timezone}
                  </div>
                  <div className="flex items-center backdrop-blur-sm bg-white/10 px-3 py-1 rounded-lg">
                    <Coffee className="w-4 h-4 mr-2" />
                    {profileData.personalInfo.availability}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 md:mt-0 flex space-x-3">
              <button
                onClick={handleEditProfile}
                className="flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
              <button
                className={`p-3 rounded-xl backdrop-blur-sm ${
                  theme === "dark"
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Enhanced Social Links */}
          {/* Enhanced Social Links */}
          <div className="relative mt-8 flex items-center space-x-4">
            {Object.entries(profiles?.social || {}).map(([platform, link]) => {
              const icons = {
                twitter: Twitter,
                linkedin: Linkedin,
                github: Code,
                website: Globe,
              };

              const Icon = icons[platform];
              if (!Icon || !link) return null;

              return (
                <a
                  key={platform}
                  href={link} // ✅ already full URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 backdrop-blur-sm bg-white/10 rounded-xl hover:bg-white/20 transition-all hover:scale-110"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div
          className={`rounded-2xl p-4 mb-8 ${
            theme === "dark"
              ? "bg-gray-800/50 backdrop-blur-lg"
              : "bg-white/50 backdrop-blur-lg border border-gray-200"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search courses, students, or analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl ${
                    theme === "dark"
                      ? "bg-gray-900 text-white placeholder-gray-400"
                      : "bg-white text-gray-900 placeholder-gray-500"
                  } border transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className={`flex items-center px-4 py-2 rounded-xl transition-colors ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <div
                className={`flex rounded-xl p-1 ${
                  theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? theme === "dark"
                        ? "bg-gray-700"
                        : "bg-white shadow"
                      : ""
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? theme === "dark"
                        ? "bg-gray-700"
                        : "bg-white shadow"
                      : ""
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Navigation */}
        <div
          className={`rounded-2xl overflow-hidden mb-8 ${
            theme === "dark"
              ? "bg-gray-800/50 backdrop-blur-lg"
              : "bg-white/50 backdrop-blur-lg border border-gray-200"
          }`}
        >
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium whitespace-nowrap transition-all relative group ${
                    activeTab === tab.id
                      ? theme === "dark"
                        ? "border-blue-500 text-blue-400 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                        : "border-blue-600 text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50"
                      : theme === "dark"
                        ? "border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                  {tab.id === "ai" && (
                    <Sparkles className="w-3 h-3 ml-2 text-yellow-400" />
                  )}
                  <div
                    className={`absolute bottom-0 left-0 w-full h-0.5 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500"
                        : "group-hover:bg-gradient-to-r from-blue-400/50 to-purple-400/50"
                    } transition-all`}
                  ></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(stats).map(([key, stat]) => {
                    const icons = {
                      totalStudents: Users,
                      totalCourses: BookOpen,
                      totalReviews: Star,
                      averageRating: Award,
                      totalRevenue: DollarSign,
                      completionRate: Target,
                      engagement: TrendingUp,
                      satisfaction: Heart,
                    };
                    const Icon = icons[key];
                    return (
                      <div
                        key={key}
                        className={`rounded-2xl p-6 backdrop-blur-lg ${
                          theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
                        } border ${
                          theme === "dark"
                            ? "border-gray-700"
                            : "border-gray-200"
                        } hover:scale-[1.02] transition-all`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`p-3 rounded-xl ${
                              theme === "dark"
                                ? "bg-gray-700/50"
                                : "bg-gray-100"
                            }`}
                          >
                            <Icon
                              className={`w-6 h-6 ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            />
                          </div>
                          <div
                            className={`text-sm font-medium px-2 py-1 rounded ${
                              stat.trendUp
                                ? theme === "dark"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-green-100 text-green-700"
                                : theme === "dark"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {stat.trendUp ? "↑" : "↓"} {stat.trend}
                          </div>
                        </div>
                        <p
                          className={`text-sm font-medium ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          } mb-2`}
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </p>
                        <p className="text-2xl font-bold">
                          {typeof stat.value === "number" &&
                          key !== "averageRating"
                            ? key === "totalRevenue"
                              ? `$${stat.value.toLocaleString()}`
                              : stat.value.toLocaleString()
                            : stat.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Enhanced AI Banner */}
                {profileData.aiFeatures.enabled && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <Brain className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            AI Teaching Assistant Active
                          </h3>
                          <p className="text-white/80">
                            Get personalized insights and recommendations
                          </p>
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-100 transition-all">
                        Explore AI Tools
                      </button>
                    </div>
                  </div>
                )}

                {/* Enhanced Recent Courses */}
                <div
                  className={`rounded-2xl p-6 backdrop-blur-lg ${
                    theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
                  } border ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center">
                      <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                      Recent Courses
                    </h3>
                    <Link
                      to="/teacher/courses"
                      className={`flex items-center text-sm font-medium ${
                        theme === "dark"
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div
                    className={`grid gap-4 ${
                      viewMode === "grid"
                        ? "grid-cols-1 md:grid-cols-2"
                        : "grid-cols-1"
                    }`}
                  >
                    {filteredCourses
                      .slice(0, viewMode === "grid" ? 4 : 6)
                      .map((course) => {
                        const CategoryIcon = getCategoryIcon(course.category);
                        return (
                          <div
                            key={course.id}
                            className={`rounded-xl overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] ${
                              theme === "dark"
                                ? "bg-gray-900/50 hover:bg-gray-800/50"
                                : "bg-white hover:bg-gray-50"
                            } border ${
                              theme === "dark"
                                ? "border-gray-700"
                                : "border-gray-200"
                            }`}
                            onClick={() => handleCourseClick(course.id)}
                          >
                            <div className="relative">
                              <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                {course.aiEnhanced && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs font-medium flex items-center">
                                    <Brain className="w-3 h-3 mr-1" />
                                    AI Enhanced
                                  </span>
                                )}
                                {course.new && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-medium">
                                    New
                                  </span>
                                )}
                                {course.featured && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-xs font-medium">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-bold text-lg line-clamp-1">
                                      {course.title}
                                    </h4>
                                  </div>
                                  <div className="flex items-center text-sm mb-3">
                                    <CategoryIcon className="w-4 h-4 mr-2" />
                                    {course.category} • {course.level} •{" "}
                                    {course.duration}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {renderStars(course.rating)}
                                  <span className="ml-3 text-sm">
                                    {course.students.toLocaleString()} students
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg">
                                    ${course.discountPrice || course.price}
                                  </div>
                                  {course.discountPrice && (
                                    <div className="text-sm line-through opacity-60">
                                      ${course.price}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {course.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 rounded text-xs ${
                                      theme === "dark"
                                        ? "bg-gray-800 text-gray-300"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Enhanced Recent Reviews */}
                <div
                  className={`rounded-2xl p-6 backdrop-blur-lg ${
                    theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
                  } border ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center">
                      <Star className="w-6 h-6 mr-3 text-yellow-500" />
                      Recent Reviews
                    </h3>
                    <Link
                      to="/teacher/reviews"
                      className={`flex items-center text-sm font-medium ${
                        theme === "dark"
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-6">
                    {recentReviews.map((review) => (
                      <div
                        key={review.id}
                        className={`pb-6 last:pb-0 border-b ${
                          theme === "dark"
                            ? "border-gray-700"
                            : "border-gray-200"
                        } last:border-0`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <img
                                src={review.avatar}
                                alt={review.student}
                                className="w-12 h-12 rounded-full"
                              />
                              {review.verified && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold">{review.student}</h4>
                              <p className="text-sm opacity-75">
                                {review.course}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm opacity-75">
                            {review.date}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : theme === "dark"
                                    ? "text-gray-600"
                                    : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium">
                            {review.rating}.0
                          </span>
                        </div>
                        <p className="mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4">
                            <button
                              className={`flex items-center text-sm ${
                                theme === "dark"
                                  ? "text-gray-400 hover:text-gray-300"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Reply
                            </button>
                            <button
                              className={`flex items-center text-sm ${
                                theme === "dark"
                                  ? "text-gray-400 hover:text-gray-300"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              Like ({review.helpful})
                            </button>
                          </div>
                          <button className="text-sm opacity-75 hover:opacity-100">
                            Report
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {activeTab === "courses" && (
              <>
                <h1>Courses</h1>
              </>
            )}
            {activeTab === "students" && (
              <>
                <h1>Students</h1>
              </>
            )}
            {activeTab === "reviews" && (
              <>
                <h1>Reviews</h1>
              </>
            )}
            {activeTab === "analytics" && (
              <>
                <h1>Analytics</h1>
              </>
            )}
            {activeTab === "settings" && (
              <>
                <h1>Settings</h1>
              </>
            )}
            {/* AI Insights Tab */}
            {activeTab === "ai" && (
              <div
                className={`rounded-2xl p-6 backdrop-blur-lg ${
                  theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
                } border ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center">
                      <Brain className="w-8 h-8 mr-3 text-blue-500" />
                      AI Insights & Recommendations
                    </h3>
                    <p className="opacity-75 mt-2">
                      Powered by advanced AI analysis of your teaching data
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm">
                    Real-time Analysis
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div
                    className={`p-6 rounded-2xl ${
                      theme === "dark"
                        ? "bg-gray-900/50"
                        : "bg-gradient-to-br from-blue-50 to-cyan-50"
                    }`}
                  >
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                      Performance Trends
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Student Engagement</span>
                          <span className="font-bold text-green-500">+12%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Course Completion</span>
                          <span className="font-bold text-blue-500">+8%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                            style={{ width: "92%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-2xl ${
                      theme === "dark"
                        ? "bg-gray-900/50"
                        : "bg-gradient-to-br from-purple-50 to-pink-50"
                    }`}
                  >
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-purple-500" />
                      AI Recommendations
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        Create AI-focused content for Node.js course
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Add interactive AI exercises to React course
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Optimize video content for better engagement
                      </li>
                    </ul>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-gray-800 to-gray-900"
                      : "bg-gradient-to-r from-gray-50 to-white"
                  }`}
                >
                  <h4 className="font-bold text-lg mb-4">
                    AI Teaching Assistant Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        title: "Smart Analytics",
                        desc: "Real-time insights",
                        icon: BarChart,
                      },
                      {
                        title: "Auto Grading",
                        desc: "AI-powered assessments",
                        icon: CheckCircle,
                      },
                      {
                        title: "Content Suggestions",
                        desc: "Personalized recommendations",
                        icon: Sparkles,
                      },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl ${
                          theme === "dark" ? "bg-gray-800/50" : "bg-white"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-3">
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h5 className="font-bold mb-1">{feature.title}</h5>
                        <p className="text-sm opacity-75">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* About Me */}
            <div
              className={`rounded-2xl p-6 backdrop-blur-lg ${
                theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
              } border ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <User className="w-6 h-6 mr-3 text-blue-600" />
                About Me
              </h3>
              <p className="mb-6 leading-relaxed">{profiles?.profile?.bio}</p>
              <div className="space-y-3">
                {[
                  { icon: Mail, text: profiles?.user?.email },
                  { icon: Phone, text: profiles?.user?.phoneNumber },
                  { icon: Globe, text: profiles?.social?.website },
                  { icon: Clock, text: profileData.personalInfo.timezone },
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`p-2 rounded-lg mr-3 ${
                        theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div
              className={`rounded-2xl p-6 backdrop-blur-lg ${
                theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
              } border ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Target className="w-6 h-6 mr-3 text-blue-600" />
                Skills & Expertise
              </h3>
              <div className="space-y-4">
                {Object.entries(skillCategories).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="space-y-3">
                      {skills.map((skill) => {
                        const Icon = skill.icon || Code;
                        return (
                          <div key={skill.name} className="group">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                <Icon className="w-4 h-4 mr-2 opacity-75" />
                                <span className="text-sm">{skill.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">
                                  {skill.level}%
                                </span>
                                <span className="text-xs px-1 rounded bg-gray-200 text-gray-700">
                                  {skill.trend}
                                </span>
                              </div>
                            </div>

                            <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div
              className={`rounded-2xl p-6 backdrop-blur-lg ${
                theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
              } border ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Trophy className="w-6 h-6 mr-3 text-yellow-500" />
                Achievements & Badges
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {profileData.achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.title}
                      className={`rounded-xl p-4 text-center transition-all hover:scale-105 cursor-pointer ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-gray-800 to-gray-900"
                          : "bg-gradient-to-br from-gray-50 to-white shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 bg-gradient-to-r ${achievement.color}`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h4 className="font-bold text-sm mb-1">
                        {achievement.title}
                      </h4>
                      <p className="text-xs opacity-75 mb-2">
                        {achievement.description}
                      </p>
                      <span className="text-xs opacity-60">
                        {achievement.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: "Create AI Course", icon: Plus },
                  { label: "View Analytics", icon: BarChart3 },
                  { label: "Message Students", icon: MessageSquare },
                  { label: "AI Assistant", icon: Brain },
                ].map((action, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                  >
                    <span>{action.label}</span>
                    <action.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className={`rounded-2xl p-6 backdrop-blur-lg ${
                theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
              } border ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-blue-600" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${activity.color} transition-all group-hover:scale-110`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm opacity-75">
                          {activity.description}
                        </p>
                        <p className="text-xs opacity-60 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
