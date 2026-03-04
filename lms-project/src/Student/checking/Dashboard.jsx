// components/Dashboard.jsx
import React from "react";
import WelcomeCard from "../studentEngagement/WelcomeCard";
import StreakCard from "../studentEngagement/StreakCard";
import HeatmapWidget from "../studentEngagement/Heatmap";
import LeaderboardCard from "../studentEngagement/LeaderboardCard";
import RecentActivity from "../studentEngagement/RecentActivity";
import BadgesCard from "../studentEngagement/BadgesCard";
import ResumeCard from "../studentEngagement/ResumeCard";

import { useDashboard } from "../studentEngagement/DashboardContext";

import ProgressWidget from "../studentEngagement/ProgressWidget";
import DailyGoal from "../studentEngagement/DailyGoal";
import RecommendedLessons from "../studentEngagement/RecommendedLessons";
import WeeklyStats from "../studentEngagement/WeeklyStats";
import { FaGraduationCap, FaBell } from "react-icons/fa";

const Dashboard = () => {
  const { user, overallProgress } = useDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      {/* Simple Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <FaGraduationCap className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold text-white">LearnLMS</h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
              {/* XP Bar */}
              <div className="hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-40 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{
                        width: `${(user.xp / user.nextLevelXp) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-zinc-400">
                    Level {user.level}
                  </span>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                <FaBell className="text-zinc-400 text-lg" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>

              {/* User */}
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-emerald-500/50"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-zinc-500">{user.xp} XP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <WelcomeCard />

        {/* Progress Overview */}
        <div className="mt-6">
          <ProgressWidget />
        </div>

        {/* Main Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resume Course */}
            <ResumeCard />

            {/* Daily Goal & Weekly Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DailyGoal />
              <WeeklyStats />
            </div>

            {/* Heatmap */}
            <HeatmapWidget />

            {/* Recent Activity */}
            <RecentActivity />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Streak Card */}
            <StreakCard />

            {/* Recommended Lessons */}
            <RecommendedLessons />

            {/* Leaderboard */}
            <LeaderboardCard />

            {/* Badges */}
            <BadgesCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

// components/Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import {
//   TrendingUp,
//   ChevronRight,
//   Sparkles,
//   Moon,
//   Sun,
//   Bell,
//   Search,
//   Zap,
//   Target,
//   Award,
//   Users,
//   Flame,
//   Clock,
//   Brain,
// } from "lucide-react";
// import ResumeClick from "./ResumeClick";
// import { useGetUserAllStudentDashBoardQuery } from "../../store/api/ProgressApi";
// import Heatmap from "../studentEngagement/Heatmap";

// const Dashboard = () => {
//   const [darkMode, setDarkMode] = useState(false);
//   const [greeting, setGreeting] = useState("");

//   const {
//     data: dashboardData,
//     isLoading,
//     refetch,
//     error: dashboardError,
//     isFetching,
//   } = useGetUserAllStudentDashBoardQuery();

//   console.log("dashboardData", dashboardData);

//   useEffect(() => {
//     const hour = new Date().getHours();
//     if (hour < 12) setGreeting("Good Morning");
//     else if (hour < 17) setGreeting("Good Afternoon");
//     else setGreeting("Good Evening");
//   }, []);

//   // Calculate user stats from real data
//   const userStats = {
//     name: "Shibu",
//     todayWatchTime: dashboardData?.data?.today?.watchTime || 0,
//     todayPages: dashboardData?.data?.today?.pagesStudied || 0,
//     todayQuizzes: dashboardData?.data?.today?.quizzesTaken || 0,
//     weeklyProgress: dashboardData?.data?.weekly?.percentage || 0,
//     streak: dashboardData?.data?.streak?.current || 0,
//     streakMessage: dashboardData?.data?.streak?.message || "Keep going! 🔥",
//     lastBadge: dashboardData?.data?.achievement?.lastBadge?.name || null,
//     nextBadge: dashboardData?.data?.achievement?.nextBadge?.name || null,
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
//       {/* Animated background mesh */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
//         <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
//       </div>

//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
//         {/* ===== HEADER with Glassmorphism ===== */}
//         <div className="backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 rounded-3xl p-6 mb-6 border border-white/20 dark:border-gray-700/30 shadow-2xl">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-2xl transform hover:scale-105 transition-transform">
//                   {userStats.name[0]}
//                 </div>
//                 <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 animate-pulse"></div>
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                   {greeting}, {userStats.name}! 👋
//                 </h1>
//                 <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
//                   <Flame className="w-5 h-5 text-orange-500" />
//                   <span>{userStats.streakMessage}</span>
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 mt-4 sm:mt-0">
//               <button className="relative p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl hover:scale-105 transition-all border border-white/50 dark:border-gray-700/50">
//                 <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
//                 <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
//                   3
//                 </span>
//               </button>
//               <button
//                 onClick={() => setDarkMode(!darkMode)}
//                 className="p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl hover:scale-105 transition-all border border-white/50 dark:border-gray-700/50"
//               >
//                 {darkMode ? (
//                   <Sun className="w-5 h-5 text-yellow-500" />
//                 ) : (
//                   <Moon className="w-5 h-5 text-gray-700" />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Quick stats row */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
//             <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-3 border border-purple-500/20">
//               <div className="text-xs text-gray-500 dark:text-gray-400">
//                 Today's focus
//               </div>
//               <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
//                 <Clock className="w-4 h-4 text-purple-500" />
//                 {userStats.todayWatchTime} min
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-blue-500/20">
//               <div className="text-xs text-gray-500 dark:text-gray-400">
//                 Pages studied
//               </div>
//               <div className="text-xl font-bold text-gray-900 dark:text-white">
//                 {userStats.todayPages}
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-3 border border-green-500/20">
//               <div className="text-xs text-gray-500 dark:text-gray-400">
//                 Quizzes
//               </div>
//               <div className="text-xl font-bold text-gray-900 dark:text-white">
//                 {userStats.todayQuizzes}
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-3 border border-orange-500/20">
//               <div className="text-xs text-gray-500 dark:text-gray-400">
//                 Weekly goal
//               </div>
//               <div className="text-xl font-bold text-gray-900 dark:text-white">
//                 {userStats.weeklyProgress}%
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ===== MAIN RESUME COMPONENT with REAL DATA ===== */}
//         <ResumeClick dashboardData={dashboardData} />
//         <Heatmap />
//         {/* ===== BOTTOM BENTO GRID ===== */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//           {/* Last Quiz Card */}
//           <div className="md:col-span-1 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all">
//             <div className="flex items-center gap-2 mb-4">
//               <Brain className="w-5 h-5 text-purple-500" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">
//                 Last Quiz
//               </h3>
//             </div>
//             {dashboardData?.data?.resume?.items?.find(
//               (i) => i.type === "quiz",
//             ) ? (
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
//                   {
//                     dashboardData.data.resume.items.find(
//                       (i) => i.type === "quiz",
//                     ).chapter
//                   }
//                 </p>
//                 <div className="flex items-end justify-between">
//                   <div>
//                     <span className="text-2xl font-bold text-gray-900 dark:text-white">
//                       {dashboardData.data.resume.items.find(
//                         (i) => i.type === "quiz",
//                       ).bestScore || 0}
//                       %
//                     </span>
//                     <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
//                       best
//                     </span>
//                   </div>
//                   <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-transform">
//                     Try Again
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-gray-500 dark:text-gray-400 text-sm">
//                 No quizzes yet
//               </p>
//             )}
//           </div>

//           {/* Next Badge Card */}
//           <div className="md:col-span-1 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all">
//             <div className="flex items-center gap-2 mb-4">
//               <Award className="w-5 h-5 text-yellow-500" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">
//                 Next Achievement
//               </h3>
//             </div>
//             {dashboardData?.data?.achievement?.nextBadge ? (
//               <div>
//                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
//                   {dashboardData.data.achievement.nextBadge.name}
//                 </p>
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-xs">
//                     <span className="text-gray-500 dark:text-gray-400">
//                       Progress
//                     </span>
//                     <span className="text-gray-900 dark:text-white">
//                       {dashboardData.data.achievement.nextBadge.progress}%
//                     </span>
//                   </div>
//                   <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
//                       style={{
//                         width: `${dashboardData.data.achievement.nextBadge.progress}%`,
//                       }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-gray-500 dark:text-gray-400 text-sm">
//                 Keep learning to earn badges!
//               </p>
//             )}
//           </div>

//           {/* Social Proof Card */}
//           <div className="md:col-span-1 backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30 shadow-xl">
//             <div className="flex items-center gap-2 mb-4">
//               <Users className="w-5 h-5 text-purple-500" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">
//                 Your Rank
//               </h3>
//             </div>
//             <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
//               You're in the top{" "}
//               <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//                 30%
//               </span>
//             </p>
//             <p className="text-xs text-gray-500 dark:text-gray-400">
//               of learners this week
//             </p>
//             <div className="mt-3 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
//               <TrendingUp className="w-3 h-3" />
//               <span>+12% from last week</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Custom animations */}
//       <style jsx>{`
//         @keyframes blob {
//           0% {
//             transform: translate(0px, 0px) scale(1);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//           100% {
//             transform: translate(0px, 0px) scale(1);
//           }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Dashboard;

// // components/Dashboard.jsx (Revised)
// import React, { useState, useEffect } from "react";
// import {
//   TrendingUp,
//   ChevronRight,
//   Sparkles,
//   Moon,
//   Sun,
//   Bell,
//   Search,
//   Zap,
//   Target,
//   Award,
//   Users,
// } from "lucide-react";
// import ResumeClick from "./ResumeClick";
// import { useGetUserAllStudentDashBoardQuery } from "../../store/api/ProgressApi";
// const Dashboard = () => {
//   const [darkMode, setDarkMode] = useState(false);
//   const [greeting, setGreeting] = useState("");
//   const [userData, setUserData] = useState({
//     name: "Shibu",
//     streak: 3,
//     videosRemaining: 2,
//     quizRemaining: 1,
//     weeklyProgress: "+12%",
//     classPercentile: "30%",
//     estimatedCompletion: "2 weeks",
//   });
//   const {
//     data: dashboardData,
//     isLoading,
//     refetch,
//     error: dashboardError,
//     isFetching,
//   } = useGetUserAllStudentDashBoardQuery();
//   console.log("dashboardData", dashboardData);
//   useEffect(() => {
//     const hour = new Date().getHours();
//     if (hour < 12) setGreeting("Good Morning");
//     else if (hour < 17) setGreeting("Good Afternoon");
//     else setGreeting("Good Evening");
//   }, []);

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
//       {/* ===== HEADER ===== */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
//               SB
//             </div>
//             <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
//           </div>
//           <div>
//             {/* Dynamic Motivation Line - NEW */}
//             <h1 className="text-2xl font-bold dark:text-white">
//               {greeting}, {userData.name}! 👋
//             </h1>
//             <p className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-2">
//               <Zap className="w-4 h-4 fill-purple-600" />
//               <span>
//                 You're {userData.videosRemaining} videos away from completing
//                 Chapter 3! 🎯
//               </span>
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 mt-3 sm:mt-0">
//           <button className="relative p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md">
//             <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
//             <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//               3
//             </span>
//           </button>
//           <button
//             onClick={() => setDarkMode(!darkMode)}
//             className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md"
//           >
//             {darkMode ? (
//               <Sun className="w-5 h-5" />
//             ) : (
//               <Moon className="w-5 h-5" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* ===== PRIMARY ACTION SECTION (Above the Fold) ===== */}
//       <ResumeClick />

//       {/* ===== SECONDARY ROW ===== */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         {/* Today's Goal - Adaptive */}
//         <div className="md:col-span-1">
//           <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-xl h-full">
//             <div className="flex items-center gap-2 mb-4">
//               <Target className="w-5 h-5 text-white" />
//               <h3 className="text-white font-semibold">Today's Goal</h3>
//             </div>

//             {/* Dynamic Goals based on user activity */}
//             <div className="space-y-3">
//               {userData.videosRemaining > 0 ? (
//                 <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
//                   <div className="w-5 h-5 border-2 border-white rounded-full"></div>
//                   <span className="text-white flex-1">Watch 1 video</span>
//                   <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
//                     +10 pts
//                   </span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl opacity-50">
//                   <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
//                     ✓
//                   </div>
//                   <span className="text-white line-through">Watch 1 video</span>
//                 </div>
//               )}

//               {userData.quizRemaining > 0 ? (
//                 <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
//                   <div className="w-5 h-5 border-2 border-white rounded-full"></div>
//                   <span className="text-white flex-1">Complete 1 quiz</span>
//                   <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
//                     +15 pts
//                   </span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl opacity-50">
//                   <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
//                     ✓
//                   </div>
//                   <span className="text-white line-through">
//                     Complete 1 quiz
//                   </span>
//                 </div>
//               )}

//               <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
//                 <div className="w-5 h-5 border-2 border-white rounded-full"></div>
//                 <span className="text-white flex-1">Study 20 minutes</span>
//                 <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
//                   +5 pts
//                 </span>
//               </div>
//             </div>

//             {/* Progress to today's goal */}
//             <div className="mt-4">
//               <div className="flex justify-between text-white/80 text-sm mb-1">
//                 <span>Daily progress</span>
//                 <span>2/3 completed</span>
//               </div>
//               <div className="h-2 bg-white/20 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-white rounded-full"
//                   style={{ width: "66%" }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Course Progress with Momentum */}
//         <div className="md:col-span-2">
//           <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold dark:text-white">
//                 Course Progress
//               </h3>
//               <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
//                 <TrendingUp className="w-4 h-4" />
//                 <span className="text-sm font-medium">
//                   {userData.weeklyProgress}
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center gap-6">
//               {/* Circular Progress */}
//               <div className="relative">
//                 <svg className="w-32 h-32">
//                   <circle
//                     cx="64"
//                     cy="64"
//                     r="56"
//                     stroke="#E5E7EB"
//                     strokeWidth="8"
//                     fill="transparent"
//                     className="dark:stroke-gray-700"
//                   />
//                   <circle
//                     cx="64"
//                     cy="64"
//                     r="56"
//                     stroke="#8B5CF6"
//                     strokeWidth="8"
//                     fill="transparent"
//                     strokeDasharray={`${2 * Math.PI * 56}`}
//                     strokeDashoffset={`${2 * Math.PI * 56 * 0.68}`}
//                     className="transition-all duration-1000"
//                   />
//                 </svg>
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="text-center">
//                     <div className="text-3xl font-bold dark:text-white">
//                       32%
//                     </div>
//                     <div className="text-xs text-gray-500">complete</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Stats */}
//               <div className="flex-1 grid grid-cols-2 gap-4">
//                 <div>
//                   <div className="text-sm text-gray-500">Videos</div>
//                   <div className="text-2xl font-bold dark:text-white">
//                     12/40
//                   </div>
//                   <div className="text-xs text-gray-400">28 remaining</div>
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">Chapters</div>
//                   <div className="text-2xl font-bold dark:text-white">3/12</div>
//                   <div className="text-xs text-gray-400">9 to go</div>
//                 </div>
//                 <div className="col-span-2 mt-2">
//                   <div className="text-sm text-gray-500 mb-1">
//                     Estimated completion
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="font-semibold dark:text-white">
//                       {userData.estimatedCompletion}
//                     </span>
//                     <span className="text-xs text-gray-400">
//                       (at current pace)
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== SOCIAL PROOF (Subtle) ===== */}
//       <div className="mb-6">
//         <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl p-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//             <span className="text-sm dark:text-gray-300">
//               You're in the{" "}
//               <strong className="text-purple-600 dark:text-purple-400">
//                 top {userData.classPercentile}
//               </strong>{" "}
//               of your class this week!
//             </span>
//           </div>
//           <ChevronRight className="w-4 h-4 text-gray-400" />
//         </div>
//       </div>

//       {/* ===== CONTINUE WATCHING SECTION ===== */}
//       <div className="mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-semibold dark:text-white">
//             Continue Watching
//           </h3>
//           <button className="text-purple-600 text-sm flex items-center gap-1">
//             View all <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {[1, 2, 3].map((i) => (
//             <div
//               key={i}
//               className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
//             >
//               <div className="relative h-32">
//                 <img
//                   src={`https://images.unsplash.com/photo-${i === 1 ? "1530026186672-2cd00ffc50fe" : i === 2 ? "1532094349884-543bc11b234d" : "1432139555190-58524dae6a55"}?w=400`}
//                   className="w-full h-full object-cover"
//                   alt="thumb"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
//                 <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
//                   15:30
//                 </div>
//               </div>
//               <div className="p-4">
//                 <h4 className="font-semibold dark:text-white mb-2">
//                   Chapter {i + 2}: Cell Structure
//                 </h4>
//                 <div className="flex justify-between text-sm text-gray-500 mb-1">
//                   <span>Progress</span>
//                   <span>{i === 1 ? "30" : i === 2 ? "60" : "15"}%</span>
//                 </div>
//                 <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
//                     style={{
//                       width: `${i === 1 ? "30" : i === 2 ? "60" : "15"}%`,
//                     }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ===== BOTTOM ROW: Quiz + Achievements ===== */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Quiz Card */}
//         <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
//           <div className="flex items-start justify-between mb-4">
//             <div>
//               <h3 className="font-semibold dark:text-white mb-1">Last Quiz</h3>
//               <p className="text-sm text-gray-500">Chapter 3: Photosynthesis</p>
//             </div>
//             <div className="bg-green-100 dark:bg-green-900/30 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
//               Passed ✓
//             </div>
//           </div>
//           <div className="flex items-end justify-between">
//             <div>
//               <div className="text-3xl font-bold dark:text-white">80%</div>
//               <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
//                 <TrendingUp className="w-4 h-4" />
//                 <span>+5% from last</span>
//               </div>
//             </div>
//             <button className="bg-purple-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-purple-700 transition-colors">
//               Try Quiz
//             </button>
//           </div>
//         </div>

//         {/* Achievements Card */}
//         <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-6 shadow-xl relative overflow-hidden">
//           <div
//             className="absolute inset-0 opacity-10"
//             style={{
//               backgroundImage:
//                 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M20 0l20 20-20 20L0 20z"/%3E%3C/g%3E%3C/svg%3E")',
//               backgroundSize: "30px 30px",
//             }}
//           ></div>

//           <div className="relative z-10">
//             <div className="flex items-center gap-2 mb-4">
//               <Award className="w-6 h-6 text-yellow-300 fill-current" />
//               <h3 className="text-white font-semibold">Achievements</h3>
//             </div>

//             <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3">
//               <div className="text-white/80 text-xs mb-1">Recently earned</div>
//               <div className="text-white font-medium">7-day streak 🔥</div>
//             </div>

//             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
//               <div className="text-white/80 text-xs mb-1">Next milestone</div>
//               <div className="text-white font-medium mb-2">15-day streak</div>
//               <div className="text-white/80 text-sm mb-2">8 days to go</div>
//               <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-white rounded-full"
//                   style={{ width: "46%" }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// // components/Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import {
//   TrendingUp,
//   ChevronRight,
//   Sparkles,
//   Moon,
//   Sun,
//   Bell,
//   Search,
// } from "lucide-react";
// import StreakCard from "./StreakCard";
// import ContinueLearning from "./ContinueLearning";
// import ProgressCard from "./ProgressCard";
// import TodayGoal from "./TodayGoal";
// import ContinueWatching from "./ContinueWatching";
// import QuizCard from "./QuizCard";
// import AchievementCard from "./AchievementCard";
// import MobileNav from "./MobileNav";

// const Dashboard = () => {
//   const [darkMode, setDarkMode] = useState(false);
//   const [greeting, setGreeting] = useState("");
//   const [currentTime, setCurrentTime] = useState("");

//   useEffect(() => {
//     // Dynamic greeting based on time
//     const hour = new Date().getHours();
//     if (hour < 12) setGreeting("Good Morning");
//     else if (hour < 17) setGreeting("Good Afternoon");
//     else setGreeting("Good Evening");

//     // Update time
//     const timer = setInterval(() => {
//       setCurrentTime(
//         new Date().toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       );
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse-slow">
//               SB
//             </div>
//             <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
//           </div>
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
//               {greeting}, Shibu! 👋
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
//               <TrendingUp className="w-4 h-4" />
//               <span>{currentTime} • India</span>
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 self-end sm:self-auto">
//           {/* Search Bar */}
//           <div className="hidden md:flex items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-md border border-gray-200 dark:border-gray-700">
//             <Search className="w-5 h-5 text-gray-400 mr-2" />
//             <input
//               type="text"
//               placeholder="Search lessons..."
//               className="bg-transparent outline-none text-sm w-48"
//             />
//           </div>

//           {/* Notification */}
//           <button className="relative p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform">
//             <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
//             <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
//               3
//             </span>
//           </button>

//           {/* Dark Mode Toggle */}
//           <button
//             onClick={() => setDarkMode(!darkMode)}
//             className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:rotate-45 transition-all duration-300"
//           >
//             {darkMode ? (
//               <Sun className="w-5 h-5 text-yellow-500" />
//             ) : (
//               <Moon className="w-5 h-5 text-gray-600" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Main Grid - Above the Fold */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
//         {/* Left Column - 2/3 width on desktop */}
//         <div className="lg:col-span-2 space-y-4 sm:space-y-6">
//           {/* Streak + Continue Learning Row */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
//             <div className="sm:col-span-1">
//               <StreakCard streak={3} longest={15} lastActive="Yesterday" />
//             </div>
//             <div className="sm:col-span-2">
//               <ContinueLearning
//                 title="Chapter 3: Photosynthesis"
//                 progress={70}
//                 thumbnail="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400"
//                 lastWatched="Yesterday, 8:30 PM"
//               />
//             </div>
//           </div>

//           {/* Progress Card */}
//           <ProgressCard
//             completed={12}
//             total={40}
//             chaptersDone={3}
//             totalChapters={12}
//           />
//         </div>

//         {/* Right Column - 1/3 width on desktop */}
//         <div className="lg:col-span-1">
//           <TodayGoal
//             goals={[
//               { text: "Watch 1 video", completed: false },
//               { text: "Complete 1 quiz", completed: false },
//               { text: "Study 20 min", completed: false },
//             ]}
//           />
//         </div>
//       </div>

//       {/* Below the Fold - Scroll Section */}
//       <div className="space-y-6 mt-8">
//         {/* Section Title with Animation */}
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-semibold flex items-center gap-2">
//             <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
//             Continue Watching
//           </h2>
//           <button className="text-sm text-purple-600 dark:text-purple-400 flex items-center hover:gap-2 transition-all">
//             View All <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>

//         {/* Continue Watching List */}
//         <ContinueWatching />

//         {/* Quiz + Achievements Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//           <QuizCard
//             lastQuiz="Chapter 3: Photosynthesis"
//             score={80}
//             trend="+5%"
//             passed={true}
//           />
//           <AchievementCard
//             recent="7-day streak 🔥"
//             next="15-day streak"
//             daysToGo={8}
//           />
//         </div>
//       </div>

//       {/* Mobile Bottom Navigation */}
//       <MobileNav />
//     </div>
//   );
// };

// export default Dashboard;
