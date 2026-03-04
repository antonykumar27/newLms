// // components/GoalsDashboard.jsx
// import React, { useState } from "react";

// import {
//   FaTarget,
//   FaBullseye,
//   FaCalendarAlt,
//   FaClock,
//   FaCheckCircle,
//   FaCircle,
//   FaTrophy,
//   FaStar,
//   FaRocket,
//   FaFire,
//   FaChartLine,
//   FaAward,
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaBell,
//   FaSun,
//   FaMoon,
//   FaCloudSun,
//   FaBolt,
//   FaMedal,
//   FaCrown,
//   FaGem,
//   FaCalendarWeek,
//   FaCalendarMonth,
// } from "react-icons/fa";
// import { motion, AnimatePresence } from "framer-motion";

// const GoalsDashboard = () => {
//   const [activeTab, setActiveTab] = useState("daily"); // daily, weekly, monthly, custom
//   const [showAddGoal, setShowAddGoal] = useState(false);
//   const [selectedGoal, setSelectedGoal] = useState(null);

//   // ========== COMPLETE GOALS DATA ==========
//   const goalsData = {
//     // Overall progress
//     overall: {
//       level: 12,
//       xp: 2450,
//       nextLevelXp: 3000,
//       streak: 12,
//       bestStreak: 24,
//       completionRate: 78,
//       goalsCompleted: 24,
//       totalGoals: 32,
//       points: 8450,
//       rank: "Gold Achiever",
//     },

//     // Daily goals
//     daily: {
//       current: {
//         id: "daily-1",
//         date: "2026-03-04",
//         lessons: { target: 5, completed: 3 },
//         quizzes: { target: 3, completed: 2 },
//         studyTime: { target: 120, completed: 85 }, // minutes
//         xp: { target: 200, completed: 145 },
//         accuracy: { target: 80, completed: 84 }, // percentage
//       },
//       history: [
//         {
//           date: "2026-03-03",
//           lessons: 4,
//           quizzes: 3,
//           studyTime: 110,
//           completed: true,
//         },
//         {
//           date: "2026-03-02",
//           lessons: 5,
//           quizzes: 3,
//           studyTime: 135,
//           completed: true,
//         },
//         {
//           date: "2026-03-01",
//           lessons: 2,
//           quizzes: 1,
//           studyTime: 45,
//           completed: false,
//         },
//         {
//           date: "2026-02-28",
//           lessons: 3,
//           quizzes: 2,
//           studyTime: 90,
//           completed: true,
//         },
//         {
//           date: "2026-02-27",
//           lessons: 4,
//           quizzes: 3,
//           studyTime: 120,
//           completed: true,
//         },
//         {
//           date: "2026-02-26",
//           lessons: 5,
//           quizzes: 4,
//           studyTime: 150,
//           completed: true,
//         },
//         {
//           date: "2026-02-25",
//           lessons: 3,
//           quizzes: 2,
//           studyTime: 95,
//           completed: true,
//         },
//       ],
//       streak: {
//         current: 5,
//         best: 12,
//         thisWeek: [true, true, true, true, true, false, true],
//       },
//     },

//     // Weekly goals
//     weekly: {
//       current: {
//         id: "weekly-12",
//         week: "March 3-9, 2026",
//         lessons: { target: 25, completed: 12 },
//         quizzes: { target: 15, completed: 8 },
//         studyTime: { target: 600, completed: 280 }, // minutes
//         xp: { target: 1000, completed: 450 },
//         courses: { target: 2, completed: 1 },
//         badges: { target: 1, completed: 0 },
//       },
//       history: [
//         {
//           week: "Feb 24 - Mar 2",
//           lessons: 22,
//           quizzes: 14,
//           studyTime: 580,
//           completed: true,
//         },
//         {
//           week: "Feb 17-23",
//           lessons: 18,
//           quizzes: 12,
//           studyTime: 520,
//           completed: true,
//         },
//         {
//           week: "Feb 10-16",
//           lessons: 15,
//           quizzes: 10,
//           studyTime: 450,
//           completed: false,
//         },
//         {
//           week: "Feb 3-9",
//           lessons: 24,
//           quizzes: 15,
//           studyTime: 620,
//           completed: true,
//         },
//       ],
//     },

//     // Monthly goals
//     monthly: {
//       current: {
//         id: "monthly-3",
//         month: "March 2026",
//         lessons: { target: 100, completed: 32 },
//         quizzes: { target: 60, completed: 18 },
//         studyTime: { target: 2400, completed: 720 },
//         xp: { target: 4000, completed: 1250 },
//         courses: { target: 3, completed: 1 },
//         badges: { target: 3, completed: 1 },
//         accuracy: { target: 85, completed: 84 },
//       },
//       history: [
//         {
//           month: "February 2026",
//           lessons: 95,
//           quizzes: 58,
//           studyTime: 2350,
//           completed: true,
//         },
//         {
//           month: "January 2026",
//           lessons: 88,
//           quizzes: 52,
//           studyTime: 2100,
//           completed: true,
//         },
//         {
//           month: "December 2025",
//           lessons: 72,
//           quizzes: 45,
//           studyTime: 1800,
//           completed: false,
//         },
//       ],
//     },

//     // Custom goals
//     custom: [
//       {
//         id: "custom-1",
//         title: "Complete React Course",
//         target: "Finish all modules",
//         progress: 65,
//         deadline: "2026-03-30",
//         category: "course",
//         priority: "high",
//         createdAt: "2026-03-01",
//         xpReward: 500,
//       },
//       {
//         id: "custom-2",
//         title: "Solve 50 Coding Problems",
//         target: "LeetCode challenges",
//         progress: 32,
//         deadline: "2026-03-20",
//         category: "coding",
//         priority: "medium",
//         createdAt: "2026-03-01",
//         xpReward: 300,
//       },
//       {
//         id: "custom-3",
//         title: "Get 90% Quiz Accuracy",
//         target: "Average score",
//         progress: 84,
//         deadline: "2026-03-15",
//         category: "performance",
//         priority: "high",
//         createdAt: "2026-03-01",
//         xpReward: 400,
//       },
//     ],

//     // Goal templates
//     templates: [
//       {
//         name: "Daily Learning",
//         icon: "📚",
//         goals: ["5 lessons", "3 quizzes", "2 hours"],
//       },
//       {
//         name: "Course Completion",
//         icon: "🎓",
//         goals: ["Finish course", "Pass final quiz"],
//       },
//       {
//         name: "Streak Master",
//         icon: "🔥",
//         goals: ["30 day streak", "No missed days"],
//       },
//       {
//         name: "Accuracy King",
//         icon: "🎯",
//         goals: ["90% accuracy", "20 perfect quizzes"],
//       },
//     ],

//     // Achievements related to goals
//     goalAchievements: [
//       {
//         name: "Goal Setter",
//         description: "Create 5 goals",
//         progress: 3,
//         total: 5,
//       },
//       {
//         name: "Goal Crusher",
//         description: "Complete 10 goals",
//         progress: 8,
//         total: 10,
//       },
//       {
//         name: "Streak Keeper",
//         description: "7 day goal streak",
//         progress: 5,
//         total: 7,
//       },
//       {
//         name: "Overachiever",
//         description: "Exceed goal by 50%",
//         progress: 2,
//         total: 5,
//       },
//     ],

//     // Recommendations
//     recommendations: [
//       {
//         type: "daily",
//         message: "Complete 2 more lessons to reach daily goal",
//         impact: "+50 XP",
//       },
//       {
//         type: "weekly",
//         message: "5 more quizzes needed for weekly target",
//         impact: "+150 XP",
//       },
//       {
//         type: "monthly",
//         message: "On track for monthly goal! Keep going",
//         impact: "🔥",
//       },
//     ],

//     // Motivational quotes
//     quotes: [
//       {
//         text: "The secret of getting ahead is getting started.",
//         author: "Mark Twain",
//       },
//       { text: "Small progress is still progress.", author: "Anonymous" },
//       { text: "Your only limit is your mind.", author: "Anonymous" },
//     ],
//   };

//   // Calculate progress percentages
//   const dailyProgress = {
//     lessons:
//       (goalsData.daily.current.lessons.completed /
//         goalsData.daily.current.lessons.target) *
//       100,
//     quizzes:
//       (goalsData.daily.current.quizzes.completed /
//         goalsData.daily.current.quizzes.target) *
//       100,
//     studyTime:
//       (goalsData.daily.current.studyTime.completed /
//         goalsData.daily.current.studyTime.target) *
//       100,
//     xp:
//       (goalsData.daily.current.xp.completed /
//         goalsData.daily.current.xp.target) *
//       100,
//     accuracy: goalsData.daily.current.accuracy.completed, // already percentage
//   };

//   const weeklyProgress = {
//     lessons:
//       (goalsData.weekly.current.lessons.completed /
//         goalsData.weekly.current.lessons.target) *
//       100,
//     quizzes:
//       (goalsData.weekly.current.quizzes.completed /
//         goalsData.weekly.current.quizzes.target) *
//       100,
//     studyTime:
//       (goalsData.weekly.current.studyTime.completed /
//         goalsData.weekly.current.studyTime.target) *
//       100,
//     xp:
//       (goalsData.weekly.current.xp.completed /
//         goalsData.weekly.current.xp.target) *
//       100,
//     courses:
//       (goalsData.weekly.current.courses.completed /
//         goalsData.weekly.current.courses.target) *
//       100,
//   };

//   const monthlyProgress = {
//     lessons:
//       (goalsData.monthly.current.lessons.completed /
//         goalsData.monthly.current.lessons.target) *
//       100,
//     quizzes:
//       (goalsData.monthly.current.quizzes.completed /
//         goalsData.monthly.current.quizzes.target) *
//       100,
//     studyTime:
//       (goalsData.monthly.current.studyTime.completed /
//         goalsData.monthly.current.studyTime.target) *
//       100,
//     xp:
//       (goalsData.monthly.current.xp.completed /
//         goalsData.monthly.current.xp.target) *
//       100,
//     courses:
//       (goalsData.monthly.current.courses.completed /
//         goalsData.monthly.current.courses.target) *
//       100,
//   };

//   // Get motivational message based on progress
//   const getMotivationMessage = (progress) => {
//     if (progress >= 100) return "🎉 Goal Achieved! Excellent work!";
//     if (progress >= 75) return "🚀 Almost there! Keep pushing!";
//     if (progress >= 50) return "💪 Halfway there! You got this!";
//     if (progress >= 25) return "🌱 Good start! Keep going!";
//     return "🎯 Let's get started!";
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-4 md:p-8">
//       {/* Header */}
//       <div className="max-w-7xl mx-auto mb-8">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
//               <FaTarget className="text-emerald-400" />
//               Goals & Progress
//             </h1>
//             <p className="text-zinc-400 mt-2">
//               Track your learning goals • {goalsData.overall.goalsCompleted}/
//               {goalsData.overall.totalGoals} goals completed
//             </p>
//           </div>

//           {/* Add Goal Button */}
//           <button
//             onClick={() => setShowAddGoal(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-colors"
//           >
//             <FaPlus /> Create New Goal
//           </button>
//         </div>
//       </div>

//       {/* Overall Progress Card */}
//       <div className="max-w-7xl mx-auto mb-8">
//         <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/30">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <div>
//               <p className="text-sm text-emerald-400 mb-1">Overall Progress</p>
//               <p className="text-3xl font-bold text-white">
//                 {goalsData.overall.completionRate}%
//               </p>
//               <div className="h-2 bg-zinc-800 rounded-full mt-2 w-32">
//                 <div
//                   className="h-full bg-emerald-500 rounded-full"
//                   style={{ width: `${goalsData.overall.completionRate}%` }}
//                 />
//               </div>
//             </div>
//             <div>
//               <p className="text-sm text-zinc-400 mb-1">
//                 Level {goalsData.overall.level}
//               </p>
//               <p className="text-xl font-bold text-white">
//                 {goalsData.overall.xp} / {goalsData.overall.nextLevelXp} XP
//               </p>
//               <div className="h-2 bg-zinc-800 rounded-full mt-2 w-32">
//                 <div
//                   className="h-full bg-purple-500 rounded-full"
//                   style={{
//                     width: `${(goalsData.overall.xp / goalsData.overall.nextLevelXp) * 100}%`,
//                   }}
//                 />
//               </div>
//             </div>
//             <div>
//               <p className="text-sm text-zinc-400 mb-1">Current Streak</p>
//               <p className="text-2xl font-bold text-orange-400 flex items-center gap-2">
//                 <FaFire /> {goalsData.overall.streak} days
//               </p>
//               <p className="text-xs text-zinc-500">
//                 Best: {goalsData.overall.bestStreak}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-zinc-400 mb-1">Total Points</p>
//               <p className="text-2xl font-bold text-yellow-400">
//                 {goalsData.overall.points}
//               </p>
//               <p className="text-xs text-zinc-500">{goalsData.overall.rank}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Tabs */}
//       <div className="max-w-7xl mx-auto mb-6">
//         <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
//           {[
//             { id: "daily", label: "Daily", icon: FaSun },
//             { id: "weekly", label: "Weekly", icon: FaCalendarWeek },
//             { id: "monthly", label: "Monthly", icon: FaCalendarWeek },
//             { id: "custom", label: "Custom Goals", icon: FaStar },
//           ].map((tab) => {
//             const Icon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
//                   activeTab === tab.id
//                     ? "bg-emerald-500 text-white"
//                     : "text-zinc-400 hover:text-white"
//                 }`}
//               >
//                 <Icon />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="max-w-7xl mx-auto">
//         {activeTab === "daily" && (
//           <div className="space-y-6">
//             {/* Current Daily Goal */}
//             <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                   <FaSun className="text-yellow-400" />
//                   Today's Goals
//                 </h2>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-zinc-400">
//                     {goalsData.daily.current.date}
//                   </span>
//                   <div className="flex gap-1">
//                     {goalsData.daily.streak.thisWeek.map((active, i) => (
//                       <div
//                         key={i}
//                         className={`w-2 h-2 rounded-full ${
//                           active ? "bg-emerald-500" : "bg-zinc-700"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Daily Progress Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//                 <GoalProgress
//                   label="Lessons"
//                   icon={<FaBook />}
//                   current={goalsData.daily.current.lessons.completed}
//                   target={goalsData.daily.current.lessons.target}
//                   progress={dailyProgress.lessons}
//                   color="blue"
//                 />
//                 <GoalProgress
//                   label="Quizzes"
//                   icon={<FaQuestionCircle />}
//                   current={goalsData.daily.current.quizzes.completed}
//                   target={goalsData.daily.current.quizzes.target}
//                   progress={dailyProgress.quizzes}
//                   color="purple"
//                 />
//                 <GoalProgress
//                   label="Study Time"
//                   icon={<FaClock />}
//                   current={`${Math.floor(goalsData.daily.current.studyTime.completed / 60)}h ${goalsData.daily.current.studyTime.completed % 60}m`}
//                   target={`${Math.floor(goalsData.daily.current.studyTime.target / 60)}h`}
//                   progress={dailyProgress.studyTime}
//                   color="emerald"
//                 />
//                 <GoalProgress
//                   label="XP Goal"
//                   icon={<FaStar />}
//                   current={goalsData.daily.current.xp.completed}
//                   target={goalsData.daily.current.xp.target}
//                   progress={dailyProgress.xp}
//                   color="yellow"
//                 />
//                 <GoalProgress
//                   label="Accuracy"
//                   icon={<FaBullseye />}
//                   current={`${goalsData.daily.current.accuracy.completed}%`}
//                   target={`${goalsData.daily.current.accuracy.target}%`}
//                   progress={dailyProgress.accuracy}
//                   color="green"
//                 />
//               </div>

//               {/* Motivational Message */}
//               <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
//                 <p className="text-emerald-400 flex items-center gap-2">
//                   <FaRocket />
//                   {getMotivationMessage(
//                     (dailyProgress.lessons +
//                       dailyProgress.quizzes +
//                       dailyProgress.studyTime) /
//                       3,
//                   )}
//                 </p>
//               </div>
//             </div>

//             {/* Daily Streak & History */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Streak Card */}
//               <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-2xl p-6 border border-orange-500/30">
//                 <h3 className="text-sm font-medium text-orange-400 mb-4">
//                   STREAK
//                 </h3>
//                 <div className="text-3xl font-bold text-white mb-2">
//                   {goalsData.daily.streak.current} days
//                 </div>
//                 <p className="text-xs text-zinc-400 mb-4">
//                   Best: {goalsData.daily.streak.best} days
//                 </p>
//                 <div className="flex gap-1 mb-2">
//                   {goalsData.daily.streak.thisWeek.map((active, i) => (
//                     <div key={i} className="flex-1">
//                       <div
//                         className={`h-2 rounded-full ${active ? "bg-orange-400" : "bg-zinc-700"}`}
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 <p className="text-xs text-zinc-500">This week</p>
//               </div>

//               {/* Recent Days */}
//               <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
//                 <h3 className="font-bold text-white mb-4">Last 7 Days</h3>
//                 <div className="space-y-3">
//                   {goalsData.daily.history.map((day, i) => (
//                     <div key={i} className="flex items-center gap-3">
//                       <span className="text-sm text-zinc-400 w-24">
//                         {day.date}
//                       </span>
//                       <div className="flex-1 flex gap-2">
//                         <div className="flex-1 h-2 bg-zinc-800 rounded-full">
//                           <div
//                             className="h-full bg-blue-500 rounded-full"
//                             style={{ width: `${(day.lessons / 5) * 100}%` }}
//                           />
//                         </div>
//                         <div className="flex-1 h-2 bg-zinc-800 rounded-full">
//                           <div
//                             className="h-full bg-purple-500 rounded-full"
//                             style={{ width: `${(day.quizzes / 4) * 100}%` }}
//                           />
//                         </div>
//                         <div className="flex-1 h-2 bg-zinc-800 rounded-full">
//                           <div
//                             className="h-full bg-emerald-500 rounded-full"
//                             style={{ width: `${(day.studyTime / 150) * 100}%` }}
//                           />
//                         </div>
//                       </div>
//                       {day.completed ? (
//                         <FaCheckCircle className="text-emerald-400" />
//                       ) : (
//                         <FaCircle className="text-zinc-600" />
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "weekly" && (
//           <div className="space-y-6">
//             {/* Current Weekly Goal */}
//             <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
//               <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//                 <FaCalendarWeek className="text-emerald-400" />
//                 This Week's Goals
//                 <span className="text-sm font-normal text-zinc-500 ml-2">
//                   {goalsData.weekly.current.week}
//                 </span>
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//                 <WeeklyProgress
//                   label="Lessons"
//                   current={goalsData.weekly.current.lessons.completed}
//                   target={goalsData.weekly.current.lessons.target}
//                   progress={weeklyProgress.lessons}
//                   color="blue"
//                 />
//                 <WeeklyProgress
//                   label="Quizzes"
//                   current={goalsData.weekly.current.quizzes.completed}
//                   target={goalsData.weekly.current.quizzes.target}
//                   progress={weeklyProgress.quizzes}
//                   color="purple"
//                 />
//                 <WeeklyProgress
//                   label="Study Time"
//                   current={`${Math.floor(goalsData.weekly.current.studyTime.completed / 60)}h`}
//                   target={`${Math.floor(goalsData.weekly.current.studyTime.target / 60)}h`}
//                   progress={weeklyProgress.studyTime}
//                   color="emerald"
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <WeeklyProgress
//                   label="XP Goal"
//                   current={goalsData.weekly.current.xp.completed}
//                   target={goalsData.weekly.current.xp.target}
//                   progress={weeklyProgress.xp}
//                   color="yellow"
//                 />
//                 <WeeklyProgress
//                   label="Courses"
//                   current={goalsData.weekly.current.courses.completed}
//                   target={goalsData.weekly.current.courses.target}
//                   progress={weeklyProgress.courses}
//                   color="green"
//                 />
//                 <div className="bg-zinc-800/50 rounded-xl p-4">
//                   <p className="text-xs text-zinc-500 mb-1">Remaining</p>
//                   <p className="text-2xl font-bold text-white">
//                     {goalsData.weekly.current.lessons.target -
//                       goalsData.weekly.current.lessons.completed}{" "}
//                     lessons
//                   </p>
//                   <p className="text-xs text-zinc-600 mt-1">
//                     {goalsData.weekly.current.quizzes.target -
//                       goalsData.weekly.current.quizzes.completed}{" "}
//                     quizzes
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Weekly History */}
//             <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
//               <h3 className="font-bold text-white mb-4">Previous Weeks</h3>
//               <div className="space-y-4">
//                 {goalsData.weekly.history.map((week, i) => (
//                   <div key={i} className="flex items-center gap-4">
//                     <span className="text-sm text-zinc-400 w-32">
//                       {week.week}
//                     </span>
//                     <div className="flex-1 flex gap-2">
//                       <div className="flex-1">
//                         <div className="h-2 bg-zinc-800 rounded-full">
//                           <div
//                             className="h-full bg-blue-500 rounded-full"
//                             style={{ width: `${(week.lessons / 25) * 100}%` }}
//                           />
//                         </div>
//                       </div>
//                       <div className="flex-1">
//                         <div className="h-2 bg-zinc-800 rounded-full">
//                           <div
//                             className="h-full bg-purple-500 rounded-full"
//                             style={{ width: `${(week.quizzes / 15) * 100}%` }}
//                           />
//                         </div>
//                       </div>
//                       <div className="flex-1">
//                         <div className="h-2 bg-zinc-800 rounded-full">
//                           <div
//                             className="h-full bg-emerald-500 rounded-full"
//                             style={{
//                               width: `${(week.studyTime / 600) * 100}%`,
//                             }}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                     {week.completed ? (
//                       <span className="text-xs text-emerald-400">
//                         ✓ Completed
//                       </span>
//                     ) : (
//                       <span className="text-xs text-red-400">Missed</span>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "monthly" && (
//           <div className="space-y-6">
//             {/* Current Monthly Goal */}
//             <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
//               <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//                 <FaCalendarMonth className="text-emerald-400" />
//                 {goalsData.monthly.current.month} Goals
//               </h2>

//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
//                 <MonthlyProgress
//                   label="Lessons"
//                   current={goalsData.monthly.current.lessons.completed}
//                   target={goalsData.monthly.current.lessons.target}
//                   progress={monthlyProgress.lessons}
//                 />
//                 <MonthlyProgress
//                   label="Quizzes"
//                   current={goalsData.monthly.current.quizzes.completed}
//                   target={goalsData.monthly.current.quizzes.target}
//                   progress={monthlyProgress.quizzes}
//                 />
//                 <MonthlyProgress
//                   label="Study Time"
//                   current={`${Math.floor(goalsData.monthly.current.studyTime.completed / 60)}h`}
//                   target={`${Math.floor(goalsData.monthly.current.studyTime.target / 60)}h`}
//                   progress={monthlyProgress.studyTime}
//                 />
//                 <MonthlyProgress
//                   label="XP"
//                   current={goalsData.monthly.current.xp.completed}
//                   target={goalsData.monthly.current.xp.target}
//                   progress={monthlyProgress.xp}
//                 />
//                 <MonthlyProgress
//                   label="Courses"
//                   current={goalsData.monthly.current.courses.completed}
//                   target={goalsData.monthly.current.courses.target}
//                   progress={monthlyProgress.courses}
//                 />
//                 <MonthlyProgress
//                   label="Accuracy"
//                   current={`${goalsData.monthly.current.accuracy.completed}%`}
//                   target={`${goalsData.monthly.current.accuracy.target}%`}
//                   progress={
//                     (goalsData.monthly.current.accuracy.completed /
//                       goalsData.monthly.current.accuracy.target) *
//                     100
//                   }
//                 />
//               </div>

//               {/* Monthly Timeline */}
//               <div className="mt-6">
//                 <h4 className="text-sm font-medium text-white mb-3">
//                   Monthly Progress
//                 </h4>
//                 <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
//                     style={{
//                       width: `${(goalsData.monthly.current.lessons.completed / goalsData.monthly.current.lessons.target) * 100}%`,
//                     }}
//                   />
//                 </div>
//                 <div className="flex justify-between mt-2 text-xs text-zinc-500">
//                   <span>Day 1</span>
//                   <span>Day 15</span>
//                   <span>Day 30</span>
//                 </div>
//               </div>
//             </div>

//             {/* Monthly History */}
//             <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
//               <h3 className="font-bold text-white mb-4">Previous Months</h3>
//               <div className="space-y-3">
//                 {goalsData.monthly.history.map((month, i) => (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg"
//                   >
//                     <span className="text-white font-medium">
//                       {month.month}
//                     </span>
//                     <div className="flex items-center gap-4">
//                       <span className="text-sm text-zinc-400">
//                         {month.lessons} lessons
//                       </span>
//                       <span className="text-sm text-zinc-400">
//                         {month.quizzes} quizzes
//                       </span>
//                       <span className="text-sm text-zinc-400">
//                         {Math.floor(month.studyTime / 60)}h
//                       </span>
//                       {month.completed ? (
//                         <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
//                           Completed
//                         </span>
//                       ) : (
//                         <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
//                           Missed
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "custom" && (
//           <div className="space-y-6">
//             {/* Custom Goals Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {goalsData.custom.map((goal) => (
//                 <motion.div
//                   key={goal.id}
//                   whileHover={{ y: -5 }}
//                   className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800 hover:border-emerald-500/30 transition-all"
//                 >
//                   <div className="flex items-start justify-between mb-4">
//                     <div>
//                       <span
//                         className={`text-xs px-2 py-1 rounded-full ${
//                           goal.priority === "high"
//                             ? "bg-red-500/20 text-red-400"
//                             : goal.priority === "medium"
//                               ? "bg-yellow-500/20 text-yellow-400"
//                               : "bg-green-500/20 text-green-400"
//                         }`}
//                       >
//                         {goal.priority} priority
//                       </span>
//                       <h3 className="text-lg font-bold text-white mt-2">
//                         {goal.title}
//                       </h3>
//                     </div>
//                     <div className="flex gap-1">
//                       <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400">
//                         <FaEdit />
//                       </button>
//                       <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400">
//                         <FaTrash />
//                       </button>
//                     </div>
//                   </div>

//                   <p className="text-sm text-zinc-400 mb-4">{goal.target}</p>

//                   <div className="space-y-2 mb-4">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-zinc-500">Progress</span>
//                       <span className="text-white font-medium">
//                         {goal.progress}%
//                       </span>
//                     </div>
//                     <div className="h-2 bg-zinc-800 rounded-full">
//                       <div
//                         className="h-full bg-emerald-500 rounded-full"
//                         style={{ width: `${goal.progress}%` }}
//                       />
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-zinc-500 flex items-center gap-1">
//                       <FaCalendarAlt /> Due: {goal.deadline}
//                     </span>
//                     <span className="text-emerald-400">
//                       +{goal.xpReward} XP
//                     </span>
//                   </div>
//                 </motion.div>
//               ))}

//               {/* Add Custom Goal Card */}
//               <button
//                 onClick={() => setShowAddGoal(true)}
//                 className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-dashed border-zinc-700 hover:border-emerald-500/50 transition-all flex flex-col items-center justify-center min-h-[200px]"
//               >
//                 <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
//                   <FaPlus className="text-emerald-400 text-xl" />
//                 </div>
//                 <p className="text-white font-medium">Create Custom Goal</p>
//                 <p className="text-xs text-zinc-500 mt-1">
//                   Set your own learning targets
//                 </p>
//               </button>
//             </div>

//             {/* Goal Templates */}
//             <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
//               <h3 className="font-bold text-white mb-4">Goal Templates</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {goalsData.templates.map((template, i) => (
//                   <div
//                     key={i}
//                     className="bg-zinc-800/30 rounded-xl p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer"
//                   >
//                     <div className="text-2xl mb-2">{template.icon}</div>
//                     <h4 className="text-white font-medium mb-2">
//                       {template.name}
//                     </h4>
//                     <ul className="space-y-1">
//                       {template.goals.map((goal, j) => (
//                         <li key={j} className="text-xs text-zinc-500">
//                           • {goal}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Recommendations & Quotes */}
//       <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recommendations */}
//         <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
//           <h3 className="font-bold text-white mb-4 flex items-center gap-2">
//             <FaRocket className="text-emerald-400" />
//             Recommendations
//           </h3>
//           <div className="space-y-3">
//             {goalsData.recommendations.map((rec, i) => (
//               <div
//                 key={i}
//                 className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg"
//               >
//                 <div className="flex items-center gap-3">
//                   {rec.type === "daily" && (
//                     <FaSun className="text-yellow-400" />
//                   )}
//                   {rec.type === "weekly" && (
//                     <FaCalendarWeek className="text-blue-400" />
//                   )}
//                   {rec.type === "monthly" && (
//                     <FaCalendarMonth className="text-purple-400" />
//                   )}
//                   <span className="text-white text-sm">{rec.message}</span>
//                 </div>
//                 <span className="text-xs text-emerald-400">{rec.impact}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Motivational Quote */}
//         <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/30">
//           <h3 className="text-sm font-medium text-emerald-400 mb-4">
//             MOTIVATION
//           </h3>
//           <p className="text-white text-lg italic mb-2">
//             "
//             {
//               goalsData.quotes[
//                 Math.floor(Math.random() * goalsData.quotes.length)
//               ].text
//             }
//             "
//           </p>
//           <p className="text-xs text-zinc-400">
//             - {goalsData.quotes[0].author}
//           </p>
//         </div>
//       </div>

//       {/* Add Goal Modal */}
//       <AnimatePresence>
//         {showAddGoal && <AddGoalModal onClose={() => setShowAddGoal(false)} />}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Goal Progress Component
// const GoalProgress = ({ label, icon, current, target, progress, color }) => (
//   <div className="bg-zinc-800/30 rounded-xl p-4">
//     <div className="flex items-center gap-2 mb-2">
//       <span className={`text-${color}-400`}>{icon}</span>
//       <span className="text-sm text-zinc-400">{label}</span>
//     </div>
//     <div className="flex items-end justify-between mb-2">
//       <span className="text-2xl font-bold text-white">{current}</span>
//       <span className="text-sm text-zinc-500">/ {target}</span>
//     </div>
//     <div className="h-2 bg-zinc-800 rounded-full">
//       <div
//         className={`h-full bg-${color}-500 rounded-full`}
//         style={{ width: `${progress}%` }}
//       />
//     </div>
//   </div>
// );

// // Weekly Progress Component
// const WeeklyProgress = ({ label, current, target, progress, color }) => (
//   <div className="bg-zinc-800/30 rounded-xl p-4">
//     <p className="text-sm text-zinc-400 mb-2">{label}</p>
//     <div className="flex items-end justify-between mb-2">
//       <span className="text-2xl font-bold text-white">{current}</span>
//       <span className="text-sm text-zinc-500">/ {target}</span>
//     </div>
//     <div className="h-2 bg-zinc-800 rounded-full">
//       <div
//         className={`h-full bg-${color}-500 rounded-full`}
//         style={{ width: `${progress}%` }}
//       />
//     </div>
//   </div>
// );

// // Monthly Progress Component
// const MonthlyProgress = ({ label, current, target, progress }) => (
//   <div className="bg-zinc-800/30 rounded-xl p-3 text-center">
//     <p className="text-xs text-zinc-400 mb-1">{label}</p>
//     <p className="text-lg font-bold text-white">{current}</p>
//     <p className="text-xs text-zinc-500">/ {target}</p>
//     <div className="h-1 bg-zinc-800 rounded-full mt-2">
//       <div
//         className="h-full bg-emerald-500 rounded-full"
//         style={{ width: `${progress}%` }}
//       />
//     </div>
//   </div>
// );

// // Add Goal Modal
// const AddGoalModal = ({ onClose }) => (
//   <motion.div
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     exit={{ opacity: 0 }}
//     className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
//     onClick={onClose}
//   >
//     <motion.div
//       initial={{ scale: 0.9, y: 20 }}
//       animate={{ scale: 1, y: 0 }}
//       exit={{ scale: 0.9, y: 20 }}
//       className="bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-zinc-800"
//       onClick={(e) => e.stopPropagation()}
//     >
//       <h3 className="text-xl font-bold text-white mb-4">Create New Goal</h3>

//       <div className="space-y-4">
//         <div>
//           <label className="text-sm text-zinc-400 mb-1 block">Goal Type</label>
//           <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white">
//             <option>Daily Goal</option>
//             <option>Weekly Goal</option>
//             <option>Monthly Goal</option>
//             <option>Custom Goal</option>
//           </select>
//         </div>

//         <div>
//           <label className="text-sm text-zinc-400 mb-1 block">Goal Name</label>
//           <input
//             type="text"
//             placeholder="e.g., Complete React Course"
//             className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="text-sm text-zinc-400 mb-1 block">Target</label>
//             <input
//               type="number"
//               placeholder="10"
//               className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
//             />
//           </div>
//           <div>
//             <label className="text-sm text-zinc-400 mb-1 block">Unit</label>
//             <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white">
//               <option>lessons</option>
//               <option>quizzes</option>
//               <option>hours</option>
//               <option>XP</option>
//             </select>
//           </div>
//         </div>

//         <div>
//           <label className="text-sm text-zinc-400 mb-1 block">Deadline</label>
//           <input
//             type="date"
//             className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
//           />
//         </div>

//         <div>
//           <label className="text-sm text-zinc-400 mb-1 block">Priority</label>
//           <div className="flex gap-3">
//             <label className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="priority"
//                 className="text-emerald-500"
//               />
//               <span className="text-white text-sm">Low</span>
//             </label>
//             <label className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="priority"
//                 className="text-emerald-500"
//               />
//               <span className="text-white text-sm">Medium</span>
//             </label>
//             <label className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="priority"
//                 className="text-emerald-500"
//               />
//               <span className="text-white text-sm">High</span>
//             </label>
//           </div>
//         </div>

//         <div className="flex gap-3 mt-6">
//           <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg">
//             Create Goal
//           </button>
//           <button
//             onClick={onClose}
//             className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   </motion.div>
// );

// export default GoalsDashboard;
import React from "react";

function GoalsDashboard() {
  return <div>GoalsDashboard</div>;
}

export default GoalsDashboard;
