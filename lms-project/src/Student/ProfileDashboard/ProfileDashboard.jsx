// components/ProfileDashboard.jsx
import React, { useState } from "react";
import { useDashboard } from "../studentEngagement/DashboardContext";
import {
  FaUser,
  FaCog,
  FaCamera,
  FaEdit,
  FaCheckCircle,
  FaClock,
  FaBook,
  FaTrophy,
  FaFire,
  FaStar,
  FaChartLine,
  FaCalendarAlt,
  FaMedal,
  FaAward,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaMapMarkerAlt,
  FaCalendar,
  FaUsers,
  FaHeart,
  FaShare,
  FaDownload,
  FaBell,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { motion } from "framer-motion";

const ProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, badges, activity, settings
  const [editMode, setEditMode] = useState(false);

  // ========== PROFILE DATA ==========
  const profileData = {
    user: {
      id: "user_123",
      name: "Abhishek",
      fullName: "Abhishek Kumar",
      email: "abhishek.k@example.com",
      phone: "+91 98765 43210",
      avatar: "https://i.pravatar.cc/300?img=7",
      coverPhoto:
        "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200",
      title: "Full Stack Developer",
      bio: "Passionate learner | MERN Stack Developer | Love building cool stuff",
      location: "Kochi, Kerala",
      timezone: "IST (UTC+5:30)",
      memberSince: "September 15, 2025",
      lastActive: "2 minutes ago",

      // Stats
      level: 12,
      xp: 2450,
      nextLevelXp: 3000,
      totalStudyTime: 284, // hours
      coursesCompleted: 4,
      coursesInProgress: 3,
      totalQuizzes: 48,
      quizzesPassed: 32,
      accuracy: 84,
      streak: 12,
      bestStreak: 24,

      // Rankings
      globalRank: 156,
      countryRank: 23,
      stateRank: 5,

      // Social
      github: "abhishek-dev",
      linkedin: "abhishek-kumar",
      twitter: "@abhishek_learn",
      website: "abhishek.dev",

      // Preferences
      emailNotifications: true,
      pushNotifications: true,
      darkMode: true,
      language: "English",
    },

    // Badges summary
    badges: {
      total: 48,
      earned: 12,
      recent: [
        {
          name: "30 Day Streak",
          icon: "⚡",
          color: "orange",
          earned: "2 days ago",
        },
        {
          name: "JavaScript Guru",
          icon: "📜",
          color: "yellow",
          earned: "5 days ago",
        },
        {
          name: "Quiz Master",
          icon: "🎯",
          color: "purple",
          earned: "1 week ago",
        },
        {
          name: "100 Problems Solved",
          icon: "💻",
          color: "emerald",
          earned: "2 weeks ago",
        },
      ],
    },

    // Recent activity
    recentActivity: [
      {
        type: "course",
        title: "Completed React Hooks module",
        time: "2 hours ago",
        xp: "+50",
      },
      {
        type: "quiz",
        title: "Scored 95% on JavaScript Quiz",
        time: "5 hours ago",
        xp: "+30",
      },
      {
        type: "badge",
        title: 'Earned "30 Day Streak" badge',
        time: "2 days ago",
        xp: "+100",
      },
      {
        type: "course",
        title: "Started System Design course",
        time: "3 days ago",
        xp: "+10",
      },
      {
        type: "achievement",
        title: "Reached Level 12",
        time: "4 days ago",
        xp: "+200",
      },
    ],

    // Learning stats
    learningStats: {
      weeklyAverage: 8.5, // hours
      bestDay: "Wednesday",
      bestTime: "Evening (6-10 PM)",
      mostActive: "Weekends",
      topTopic: "React.js",
      weakestTopic: "System Design",
    },

    // Achievements
    achievements: [
      {
        name: "Fast Learner",
        description: "Complete 5 courses",
        progress: 4,
        total: 5,
      },
      {
        name: "Quiz Champion",
        description: "Score 90%+ in 20 quizzes",
        progress: 15,
        total: 20,
      },
      {
        name: "Streak Master",
        description: "30 day streak",
        progress: 12,
        total: 30,
      },
      {
        name: "Community Hero",
        description: "Help 50 students",
        progress: 23,
        total: 50,
      },
    ],

    // Course progress
    courseProgress: [
      {
        name: "Advanced React",
        progress: 65,
        lessons: "24/36",
        color: "emerald",
      },
      {
        name: "Node.js Masterclass",
        progress: 40,
        lessons: "11/28",
        color: "green",
      },
      { name: "System Design", progress: 20, lessons: "5/25", color: "blue" },
    ],

    // Certificates
    certificates: [
      {
        name: "JavaScript Fundamentals",
        date: "2026-01-15",
        credential: "JS-2026-001",
      },
      {
        name: "React Basics",
        date: "2026-02-01",
        credential: "REACT-2026-023",
      },
      {
        name: "TypeScript Essentials",
        date: "2026-02-20",
        credential: "TS-2026-045",
      },
    ],

    // Friends/Following
    connections: {
      followers: 128,
      following: 45,
      friends: [
        {
          name: "Rahul",
          avatar: "https://i.pravatar.cc/150?img=1",
          status: "online",
        },
        {
          name: "Priya",
          avatar: "https://i.pravatar.cc/150?img=2",
          status: "offline",
        },
        {
          name: "Amal",
          avatar: "https://i.pravatar.cc/150?img=3",
          status: "studying",
        },
        {
          name: "Neha",
          avatar: "https://i.pravatar.cc/150?img=4",
          status: "online",
        },
      ],
    },
  };

  // Get level progress percentage
  const levelProgress =
    (profileData.user.xp / profileData.user.nextLevelXp) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      {/* Cover Photo */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={profileData.user.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        {/* Edit Cover Button */}
        <button className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-2">
          <FaCamera /> Change Cover
        </button>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        {/* Profile Header Card */}
        <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profileData.user.avatar}
                alt={profileData.user.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-emerald-500/50"
              />
              <button className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 p-2 rounded-lg text-white">
                <FaCamera className="text-sm" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {profileData.user.fullName}
                  </h1>
                  <p className="text-emerald-400 text-lg">
                    {profileData.user.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-zinc-400 text-sm">
                    <FaMapMarkerAlt /> {profileData.user.location}
                    <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                    <FaCalendar /> Joined {profileData.user.memberSince}
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white transition-colors"
                >
                  <FaEdit /> Edit Profile
                </button>
              </div>

              {/* Bio */}
              <p className="text-zinc-300 mt-4 max-w-2xl">
                {profileData.user.bio}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4 mt-4">
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <FaGithub className="text-xl" />
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <FaLinkedin className="text-xl" />
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <FaTwitter className="text-xl" />
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <FaGlobe className="text-xl" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FaStar className="text-yellow-400" />}
            label="Level"
            value={profileData.user.level}
            subValue={`${profileData.user.xp} XP`}
            progress={levelProgress}
          />
          <StatCard
            icon={<FaClock className="text-blue-400" />}
            label="Study Time"
            value={`${profileData.user.totalStudyTime}h`}
            subValue="Total hours"
          />
          <StatCard
            icon={<FaBook className="text-emerald-400" />}
            label="Courses"
            value={profileData.user.coursesCompleted}
            subValue={`${profileData.user.coursesInProgress} in progress`}
          />
          <StatCard
            icon={<FaFire className="text-orange-400" />}
            label="Streak"
            value={`${profileData.user.streak} days`}
            subValue={`Best: ${profileData.user.bestStreak}`}
          />
        </div>

        {/* Main Content Tabs */}
        <div className="flex border-b border-zinc-800 mb-6">
          {[
            { id: "overview", label: "Overview", icon: FaUser },
            { id: "badges", label: "Badges", icon: FaAward },
            { id: "activity", label: "Activity", icon: FaChartLine },
            { id: "settings", label: "Settings", icon: FaCog },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {activeTab === "overview" && <OverviewTab profile={profileData} />}
          {activeTab === "badges" && <BadgesTab profile={profileData} />}
          {activeTab === "activity" && <ActivityTab profile={profileData} />}
          {activeTab === "settings" && <SettingsTab profile={profileData} />}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editMode && (
        <EditProfileModal
          profile={profileData.user}
          onClose={() => setEditMode(false)}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, subValue, progress }) => (
  <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800">
    <div className="flex items-start justify-between mb-2">
      <div>
        <p className="text-zinc-500 text-xs">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        <p className="text-xs text-zinc-600 mt-1">{subValue}</p>
      </div>
      <div className="p-2 bg-zinc-800 rounded-lg">{icon}</div>
    </div>
    {progress && (
      <div className="mt-2">
        <div className="h-1.5 bg-zinc-800 rounded-full">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )}
  </div>
);

// Overview Tab
const OverviewTab = ({ profile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column */}
    <div className="lg:col-span-2 space-y-6">
      {/* Course Progress */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <FaBook className="text-emerald-400" />
          Current Courses
        </h3>
        <div className="space-y-4">
          {profile.courseProgress.map((course) => (
            <div key={course.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white">{course.name}</span>
                <span className="text-zinc-400">{course.lessons}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full">
                <div
                  className={`h-full bg-${course.color}-500 rounded-full`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <FaClock className="text-emerald-400" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {profile.recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === "course"
                    ? "bg-blue-500/20"
                    : activity.type === "quiz"
                      ? "bg-purple-500/20"
                      : activity.type === "badge"
                        ? "bg-yellow-500/20"
                        : "bg-emerald-500/20"
                }`}
              >
                {activity.type === "course" && (
                  <FaBook className="text-blue-400" />
                )}
                {activity.type === "quiz" && (
                  <FaStar className="text-purple-400" />
                )}
                {activity.type === "badge" && (
                  <FaAward className="text-yellow-400" />
                )}
                {activity.type === "achievement" && (
                  <FaTrophy className="text-emerald-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.title}</p>
                <p className="text-xs text-zinc-500">{activity.time}</p>
              </div>
              <span className="text-xs text-emerald-400">{activity.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right Column */}
    <div className="space-y-6">
      {/* Learning Stats */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-4">Learning Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Weekly Average</span>
            <span className="text-white">
              {profile.learningStats.weeklyAverage}h
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Best Day</span>
            <span className="text-emerald-400">
              {profile.learningStats.bestDay}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Peak Time</span>
            <span className="text-blue-400">
              {profile.learningStats.bestTime}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Strongest Topic</span>
            <span className="text-green-400">
              {profile.learningStats.topTopic}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Focus Area</span>
            <span className="text-red-400">
              {profile.learningStats.weakestTopic}
            </span>
          </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-emerald-400" />
          Certificates
        </h3>
        <div className="space-y-3">
          {profile.certificates.map((cert, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                📜
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{cert.name}</p>
                <p className="text-xs text-zinc-500">ID: {cert.credential}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <FaUsers className="text-emerald-400" />
            Connections
          </h3>
          <div className="flex gap-2 text-sm">
            <span className="text-emerald-400">
              {profile.connections.followers}
            </span>
            <span className="text-zinc-600">followers</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {profile.connections.friends.map((friend) => (
            <div
              key={friend.name}
              className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded-lg"
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-white text-sm font-medium">{friend.name}</p>
                <p className="text-xs text-zinc-500">{friend.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Badges Tab
const BadgesTab = ({ profile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Badge Stats */}
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-4">Badge Collection</h3>
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-emerald-400">
            {profile.badges.earned}
          </div>
          <p className="text-zinc-400">of {profile.badges.total} earned</p>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full mb-6">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{
              width: `${(profile.badges.earned / profile.badges.total) * 100}%`,
            }}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Common</span>
            <span className="text-white">24</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Rare</span>
            <span className="text-blue-400">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Epic</span>
            <span className="text-purple-400">8</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Legendary</span>
            <span className="text-yellow-400">4</span>
          </div>
        </div>
      </div>
    </div>

    {/* Recent Badges */}
    <div className="lg:col-span-2">
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-6">Recent Badges</h3>
        <div className="grid grid-cols-2 gap-4">
          {profile.badges.recent.map((badge, i) => (
            <div
              key={i}
              className={`bg-${badge.color}-500/10 rounded-xl p-4 border border-${badge.color}-500/30`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <h4 className="text-white font-medium">{badge.name}</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Earned {badge.earned}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Activity Tab
const ActivityTab = ({ profile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Activity Heatmap */}
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-4">Weekly Activity</h3>
        <div className="h-40 flex items-end justify-between gap-2">
          {[4, 2, 5, 1, 3, 6, 4].map((hours, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${hours * 15}px` }}
                className="w-full bg-emerald-500 rounded-t-lg"
                style={{ maxHeight: "90px" }}
              />
              <span className="text-xs text-zinc-500">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-4">Achievement Progress</h3>
        <div className="space-y-4">
          {profile.achievements.map((ach) => (
            <div key={ach.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white">{ach.name}</span>
                <span className="text-zinc-400">
                  {ach.progress}/{ach.total}
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(ach.progress / ach.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500">{ach.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Activity Stats */}
    <div className="space-y-6">
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-4">Activity Summary</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Total Quizzes</p>
            <p className="text-2xl font-bold text-white">
              {profile.user.totalQuizzes}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Quizzes Passed</p>
            <p className="text-2xl font-bold text-emerald-400">
              {profile.user.quizzesPassed}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-purple-400">
              {profile.user.accuracy}%
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Questions Solved</p>
            <p className="text-2xl font-bold text-blue-400">847</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Settings Tab
const SettingsTab = ({ profile }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      {/* Profile Settings */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-6">Profile Information</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">
                Full Name
              </label>
              <input
                type="text"
                value={profile.user.fullName}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Title</label>
              <input
                type="text"
                value={profile.user.title}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Bio</label>
            <textarea
              rows="3"
              value={profile.user.bio}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Email</label>
              <input
                type="email"
                value={profile.user.email}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Phone</label>
              <input
                type="tel"
                value={profile.user.phone}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">
                Location
              </label>
              <input
                type="text"
                value={profile.user.location}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">
                Timezone
              </label>
              <select className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white">
                <option>IST (UTC+5:30)</option>
                <option>EST (UTC-5:00)</option>
                <option>PST (UTC-8:00)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-6">Social Links</h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FaGithub className="text-zinc-400 text-xl" />
            <input
              type="text"
              value={profile.user.github}
              className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <FaLinkedin className="text-zinc-400 text-xl" />
            <input
              type="text"
              value={profile.user.linkedin}
              className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <FaTwitter className="text-zinc-400 text-xl" />
            <input
              type="text"
              value={profile.user.twitter}
              className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <FaGlobe className="text-zinc-400 text-xl" />
            <input
              type="text"
              value={profile.user.website}
              className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Right Column - Preferences */}
    <div className="space-y-6">
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        <h3 className="font-bold text-white mb-6">Preferences</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Email Notifications</span>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                profile.user.emailNotifications
                  ? "bg-emerald-500"
                  : "bg-zinc-700"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                  profile.user.emailNotifications
                    ? "translate-x-7"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white">Push Notifications</span>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                profile.user.pushNotifications
                  ? "bg-emerald-500"
                  : "bg-zinc-700"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                  profile.user.pushNotifications
                    ? "translate-x-7"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white">Dark Mode</span>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                profile.user.darkMode ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                  profile.user.darkMode ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-white block mb-2">Language</label>
            <select className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white">
              <option>English</option>
              <option>Malayalam</option>
              <option>Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/30">
        <h3 className="font-bold text-red-400 mb-4">Danger Zone</h3>
        <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  </div>
);

// Edit Profile Modal
const EditProfileModal = ({ profile, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-zinc-800"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">
            Display Name
          </label>
          <input
            type="text"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Bio</label>
          <textarea
            rows="3"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg">
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default ProfileDashboard;
