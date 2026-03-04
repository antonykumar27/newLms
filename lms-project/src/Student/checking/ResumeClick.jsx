// components/ResumeClick.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  ChevronRight,
  Zap,
  AlertCircle,
  RotateCcw,
  Lock,
  Clock,
  BookOpen,
  Award,
  Target,
  Brain,
  Sparkles,
  Flame,
  BarChart3,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function ResumeClick({ dashboardData }) {
  const [primaryContent, setPrimaryContent] = useState(null);
  const [secondaryItems, setSecondaryItems] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeTab, setActiveTab] = useState("resume"); // resume, quizzes, revisions
  console.log("primaryContent", primaryContent);
  // ==================== SMART PRIORITY ENGINE ====================
  const processedItems = useMemo(() => {
    if (!dashboardData?.data?.resume?.items) return [];

    const items = dashboardData.data.resume.items;
    console.log("items", dashboardData?.data?.resume);
    // Add smart metadata to each item
    return items.map((item) => ({
      ...item,
      // Calculate confidence level based on progress and quiz attempts
      confidenceLevel: calculateConfidence(item),
      // Determine if this is blocking progress
      isBlocking: checkIfBlocking(item),
      // Calculate urgency score (0-100)
      urgencyScore: calculateUrgency(item),
      // Get smart action text
      smartAction: getSmartAction(item),
      // Get next milestone
      nextMilestone: getNextMilestone(item),
    }));
  }, [dashboardData]);

  // Set primary and secondary items based on smart priority
  useEffect(() => {
    if (processedItems.length === 0) return;

    // Sort by priority: blocking > near-complete > urgent > recent
    const sorted = [...processedItems].sort((a, b) => {
      // Blocking quizzes first
      if (a.isBlocking && !b.isBlocking) return -1;
      if (!a.isBlocking && b.isBlocking) return 1;

      // Near complete content next (>85%)
      if (a.progress > 85 && b.progress <= 85) return -1;
      if (a.progress <= 85 && b.progress > 85) return 1;

      // Then by urgency score
      return b.urgencyScore - a.urgencyScore;
    });

    setPrimaryContent(sorted[0]);
    setSecondaryItems(sorted.slice(1, 3));
  }, [processedItems]);

  // ==================== HELPER FUNCTIONS ====================
  function calculateConfidence(item) {
    if (item.type === "quiz") {
      if (item.bestScore >= 80) return "high";
      if (item.bestScore >= 60) return "medium";
      if (item.attemptCount >= 2) return "low";
      return "unknown";
    }
    // For content, confidence is based on progress
    if (item.progress >= 80) return "high";
    if (item.progress >= 40) return "medium";
    return "low";
  }

  function checkIfBlocking(item) {
    return (
      item.type === "quiz" &&
      item.isMandatory &&
      item.progress < 100 &&
      (!item.bestScore || item.bestScore < (item.passScore || 60))
    );
  }

  function calculateUrgency(item) {
    let score = 0;

    // Based on last accessed (recent = more urgent)
    const hoursAgo = getHoursSince(item.lastAccessed);
    score += Math.max(0, 50 - hoursAgo);

    // Based on progress (near complete = more urgent)
    if (item.type === "content") {
      score += item.progress * 0.3;
    }

    // Quiz specific urgency
    if (item.type === "quiz") {
      if (item.isBlocking) score += 30;
      if (item.attemptCount >= 2 && item.failCount > 0) score += 20;
      if (item.questionsRemaining === 1) score += 40;
    }

    return Math.min(100, score);
  }

  function getSmartAction(item) {
    if (item.type === "quiz") {
      if (item.questionsRemaining === 1) return "Finish Quiz";
      if (item.attemptCount >= 2 && item.failCount > 0) return "Review & Retry";
      if (item.progress > 0) return "Continue Quiz";
      return "Start Quiz";
    }

    if (item.progress >= 95) return "Complete";
    if (item.progress > 0) return "Continue";
    return "Start Learning";
  }

  function getNextMilestone(item) {
    if (item.type === "quiz") {
      if (item.questionsRemaining) {
        return `${item.questionsRemaining} questions left`;
      }
      return `Need ${item.passScore - (item.bestScore || 0)}% to pass`;
    }

    const remaining = 100 - item.progress;
    return `${remaining}% remaining`;
  }

  function getHoursSince(timestamp) {
    if (!timestamp) return 999;
    const hours = (Date.now() - new Date(timestamp)) / (1000 * 60 * 60);
    return Math.min(999, hours);
  }

  function getTimeAgo(timestamp) {
    if (!timestamp) return "Never";

    const hours = getHoursSince(timestamp);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function getConfidenceColor(level) {
    switch (level) {
      case "high":
        return "text-green-400 bg-green-500/20";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "low":
        return "text-orange-400 bg-orange-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  }

  function getUrgencyColor(score) {
    if (score > 75) return "from-red-500 to-orange-500";
    if (score > 50) return "from-orange-500 to-yellow-500";
    if (score > 25) return "from-yellow-500 to-green-500";
    return "from-blue-500 to-purple-500";
  }

  // Loading state
  if (!dashboardData) {
    return (
      <div className="lg:col-span-3">
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center border border-white/10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded-full w-3/4 mx-auto"></div>
            <div className="h-4 bg-white/10 rounded-full w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // No items state
  if (!primaryContent) {
    return (
      <div className="lg:col-span-3">
        <div className="rounded-3xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-xl p-12 text-center border border-white/10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
            <Award className="w-20 h-20 text-purple-400 mx-auto mb-4 relative" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            All Caught Up! 🎉
          </h3>
          <p className="text-white/70 mb-6">
            You've completed all pending items. Ready to start something new?
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform">
            Explore New Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 space-y-4">
      {/* ===== BENTO GRID HEADER ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <div className="md:col-span-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Your Learning Journey
          </h2>
          <p className="text-white/60 text-sm">
            {dashboardData?.data?.streak?.message || "Keep up the momentum!"}
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setActiveTab("resume")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "resume"
                ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            Resume
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "quizzes"
                ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            Quizzes
          </button>
        </div>
      </div>

      {/* ===== PRIMARY RESUME CARD (BENTO STYLE) ===== */}
      <div className="relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-1 shadow-2xl border border-white/10">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 animate-gradient-x"></div>

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 backdrop-blur-xl bg-black/20"></div>

        {/* Content */}
        <div className="relative p-6 md:p-8">
          {/* Top badges - Bento style */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {/* Urgency badge with gradient */}
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getUrgencyColor(primaryContent.urgencyScore)} text-white flex items-center gap-2 shadow-lg`}
            >
              <Zap className="w-4 h-4 fill-current" />
              {primaryContent.isBlocking
                ? "Required to continue"
                : primaryContent.progress > 85
                  ? "Almost there!"
                  : "Continue learning"}
            </div>

            {/* Type badge */}
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm flex items-center gap-2 border border-white/20">
              {primaryContent.type === "quiz" ? (
                <Brain className="w-4 h-4" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              {primaryContent.type === "quiz" ? "Quiz" : "Video Lesson"}
            </div>

            {/* Confidence badge */}
            <div
              className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${getConfidenceColor(primaryContent.confidenceLevel)}`}
            >
              <Target className="w-4 h-4" />
              {primaryContent.confidenceLevel === "high"
                ? "Strong"
                : primaryContent.confidenceLevel === "medium"
                  ? "Building"
                  : "Needs practice"}
            </div>
          </div>

          {/* Main content - Bento grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Main info */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {primaryContent.title}
                </h3>
                <p className="text-xl text-white/70">
                  {primaryContent.subject} • {primaryContent.chapter}
                </p>
              </div>

              {/* Smart insights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Next milestone
                  </div>
                  <p className="text-white font-semibold">
                    {primaryContent.nextMilestone}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                    <Flame className="w-4 h-4" />
                    Last accessed
                  </div>
                  <p className="text-white font-semibold">
                    {getTimeAgo(primaryContent.lastAccessed)}
                  </p>
                </div>
              </div>

              {/* Quiz specific info */}
              {primaryContent.type === "quiz" && (
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <span className="text-white/60 text-sm">
                        Questions left
                      </span>
                      <p className="text-2xl font-bold text-white">
                        {primaryContent.questionsRemaining || 0}/
                        {primaryContent.totalQuestions || 5}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div>
                      <span className="text-white/60 text-sm">Best score</span>
                      <p className="text-2xl font-bold text-white">
                        {primaryContent.bestScore || 0}%
                      </p>
                    </div>
                    {primaryContent.attemptCount > 1 && (
                      <>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div>
                          <span className="text-white/60 text-sm">
                            Attempts
                          </span>
                          <p className="text-2xl font-bold text-white">
                            {primaryContent.attemptCount}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Progress & Action */}
            <div className="space-y-4">
              {/* Circular progress with glow */}
              <div className="relative flex justify-center">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl"></div>
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - primaryContent.progress / 100)}`}
                      className="text-purple-400 transition-all duration-1000 drop-shadow-glow"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-white">
                        {primaryContent.progress}%
                      </span>
                      <span className="block text-xs text-white/60">
                        complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action button with hover effect */}
              <button
                onClick={() => console.log("Resuming:", primaryContent)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all transform hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-2 group"
              >
                <PlayCircle className="w-5 h-5" />
                <span>{primaryContent.smartAction}</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Quick stats */}
              <div className="flex items-center justify-center gap-3 text-sm text-white/60">
                <span>
                  ⏱️ {primaryContent.type === "quiz" ? "5-10 min" : "15 min"}
                </span>
                <span>•</span>
                <span>
                  🎯{" "}
                  {primaryContent.confidenceLevel === "high"
                    ? "On track"
                    : "Focus needed"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECONDARY CARDS - BENTO GRID ===== */}
      {secondaryItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {secondaryItems.map((item, index) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => console.log("Resuming secondary:", item)}
              className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-1 border border-white/10 hover:border-purple-500/50 transition-all"
            >
              {/* Hover effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 transition-opacity duration-300 ${hoveredItem === item.id ? "opacity-100" : "opacity-0"}`}
              ></div>

              <div className="relative p-5 backdrop-blur-xl bg-black/20">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-white/50">
                      {item.subject}
                    </span>
                    <h4 className="text-white font-semibold">{item.chapter}</h4>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${item.type === "quiz" ? "bg-purple-500/30 text-purple-300" : "bg-blue-500/30 text-blue-300"}`}
                  >
                    {item.type === "quiz" ? "Quiz" : "Lesson"}
                  </div>
                </div>

                {/* Progress bar with glow */}
                <div className="relative mb-3">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  {hoveredItem === item.id && (
                    <div className="absolute -top-1 right-0 text-xs text-white/70">
                      {item.progress}%
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white/50">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeAgo(item.lastAccessed)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.isBlocking && (
                      <Lock className="w-3 h-3 text-orange-400" />
                    )}
                    <span className="text-white/70">{item.smartAction}</span>
                    <ChevronRight className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Hover tooltip */}
                {hoveredItem === item.id && (
                  <div className="absolute -top-10 right-4 px-3 py-1.5 bg-gray-900 rounded-lg text-xs text-white border border-purple-500/30 animate-fade-in">
                    {item.nextMilestone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== FLOATING ACTION BUTTON (Mobile) ===== */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
          <Zap className="w-6 h-6 text-white fill-current" />
        </button>
      </div>

      {/* ===== BENTO STATS GRID ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-xs text-white/50">Today's focus</div>
          <div className="text-lg font-bold text-white">45 min</div>
          <div className="text-xs text-green-400">↑12%</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-xs text-white/50">Videos left</div>
          <div className="text-lg font-bold text-white">3</div>
          <div className="text-xs text-yellow-400">In progress</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-xs text-white/50">Quizzes</div>
          <div className="text-lg font-bold text-white">2</div>
          <div className="text-xs text-purple-400">Pending</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-xs text-white/50">Streak</div>
          <div className="text-lg font-bold text-white">
            {dashboardData?.data?.streak?.current || 0} 🔥
          </div>
          <div className="text-xs text-orange-400">
            {dashboardData?.data?.streak?.message}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add custom CSS for animations
const styles = `
  @keyframes gradient-x {
    0%, 100% { transform: translateX(0%); }
    50% { transform: translateX(100%); }
  }
  
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-gradient-x {
    animation: gradient-x 3s ease infinite;
    background-size: 200% 200%;
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .drop-shadow-glow {
    filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ResumeClick;

// import React, { useState, useEffect } from "react";
// import {
//   TrendingUp,
//   ChevronRight,
//   Zap,
//   AlertCircle,
//   RotateCcw,
//   Lock,
// } from "lucide-react";

// function ResumeClick() {
//   const [userData, setUserData] = useState({
//     items: [],
//   });
//   const [primaryContent, setPrimaryContent] = useState(null);
//   const [secondaryItems, setSecondaryItems] = useState([]);
//   const [totalIncomplete, setTotalIncomplete] = useState(0);
//   const [userContext, setUserContext] = useState({
//     currentStreak: 3,
//     averageConfidence: "medium",
//     weeklyGoal: 70,
//   });

//   // Load user data (example - replace with actual API)
//   useEffect(() => {
//     // This simulates real API data with proper quiz metadata
//     const sampleData = {
//       items: [
//         {
//           id: 1,
//           subject: "English",
//           chapter: "Chapter 2",
//           page: 1,
//           topic: "Nouns and Pronouns",
//           description: "Learn about different types of nouns",
//           completionPercentage: 60,
//           lastAccessed: "2024-01-15T18:00:00",
//           timeRemaining: 15,
//           weeklyProgress: "+12%",
//           thumbnail:
//             "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=100",
//           hasDoubt: false,
//           hasPendingQuiz: false,
//           type: "content",
//           nextChapter: "Chapter 3",
//         },
//         {
//           id: 2,
//           subject: "English",
//           chapter: "Chapter 1",
//           page: 2,
//           topic: "Parts of Speech",
//           completionPercentage: 5, // Near complete!
//           lastAccessed: "2024-01-15T20:30:00",
//           timeRemaining: 2,
//           weeklyProgress: "+8%",
//           thumbnail:
//             "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=100",
//           hasDoubt: false,
//           hasPendingQuiz: false,
//           type: "content",
//         },
//         {
//           id: 3,
//           subject: "Maths",
//           chapter: "Chapter 1",
//           page: 3,
//           topic: "Algebra Basics",
//           completionPercentage: 34,
//           lastAccessed: "2024-01-15T19:15:00",
//           timeRemaining: 10,
//           weeklyProgress: "+15%",
//           deadline: "2024-01-19",
//           thumbnail:
//             "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100",
//           hasDoubt: false,
//           hasPendingQuiz: false,
//           type: "content",
//         },
//         {
//           id: 4,
//           subject: "Maths",
//           chapter: "Chapter 1",
//           type: "quiz",
//           quizType: "chapter", // "page" | "chapter" | "subject" | "revision"
//           topic: "Algebra Quiz",
//           completionPercentage: 20, // Started but incomplete
//           questionsRemaining: 4,
//           totalQuestions: 5,
//           avgTimePerQuestion: 2,
//           bestScore: 40,
//           lastScore: 35,
//           attemptCount: 2,
//           failCount: 1,
//           lastAccessed: "2024-01-15T17:00:00",
//           hasPendingQuiz: true,
//           deadline: "2024-01-19",
//           nextChapter: "Chapter 2",
//           unlocksNextContent: true,
//           isMandatory: true,
//           isBlocking: true,
//           requiredScoreToPass: 60,
//           confidenceLevel: "low", // calculated from attempts
//         },
//         {
//           id: 5,
//           subject: "Science",
//           chapter: "Chapter 3",
//           type: "quiz",
//           quizType: "revision",
//           topic: "Cells Revision",
//           completionPercentage: 0,
//           totalQuestions: 10,
//           lastAccessed: "2024-01-14T10:00:00",
//           hasPendingQuiz: true,
//           isMandatory: false,
//           isBlocking: false,
//           attemptCount: 0,
//         },
//       ],
//     };

//     setUserData(sampleData);
//   }, []);

//   // Update content with smart priority
//   useEffect(() => {
//     if (userData.items.length > 0) {
//       const primary = getSmartPrimaryContent(userData, userContext);
//       setPrimaryContent(primary);

//       const secondary = getSmartSecondaryItems(
//         userData,
//         primary.id,
//         userContext,
//       );
//       setSecondaryItems(secondary);

//       setTotalIncomplete(userData.items.length);
//     }
//   }, [userData, userContext]);

//   // ==================== SMART PRIORITY ENGINE ====================

//   function getSmartPrimaryContent(userData, context) {
//     const items = userData.items;

//     // ===== STEP 1: BLOCKING QUIZZES (Highest Priority) =====
//     // These prevent progress to next content
//     const blockingQuiz = items.find(
//       (item) =>
//         item.type === "quiz" &&
//         item.isBlocking === true &&
//         item.requiredScoreToPass > (item.bestScore || 0) &&
//         (item.completionPercentage < 100 ||
//           (item.bestScore || 0) < item.requiredScoreToPass),
//     );

//     if (blockingQuiz) {
//       return {
//         ...blockingQuiz,
//         priorityLabel: "🚨 Must Complete to Continue",
//         priorityReason: getBlockingReason(blockingQuiz),
//         urgencyLevel: "critical",
//         ctaText: getSmartQuizCTA(blockingQuiz),
//         icon: <Lock className="w-4 h-4" />,
//       };
//     }

//     // ===== STEP 2: NEAR-COMPLETE CONTENT (>85%) =====
//     // Finish what's almost done (momentum optimization)
//     const nearCompleteContent = items.find(
//       (item) =>
//         item.type === "content" &&
//         item.completionPercentage > 85 &&
//         item.completionPercentage < 100,
//     );

//     if (nearCompleteContent) {
//       return {
//         ...nearCompleteContent,
//         priorityLabel: "🎯 Almost There!",
//         priorityReason: `Just ${100 - nearCompleteContent.completionPercentage}% remaining`,
//         urgencyLevel: "high",
//         ctaText: "Finish Now",
//       };
//     }

//     // ===== STEP 3: FAILED/STRUGGLE QUIZZES =====
//     // Student needs help/retry
//     const failedQuiz = items.find(
//       (item) =>
//         item.type === "quiz" &&
//         item.attemptCount >= 2 &&
//         item.failCount >= 1 &&
//         (item.bestScore || 0) < (item.requiredScoreToPass || 60),
//     );

//     if (failedQuiz) {
//       return {
//         ...failedQuiz,
//         priorityLabel: "📚 Needs Review",
//         priorityReason: getStruggleReason(failedQuiz),
//         urgencyLevel: "medium",
//         ctaText: "Review & Retry",
//         icon: <RotateCcw className="w-4 h-4" />,
//       };
//     }

//     // ===== STEP 4: RECENT CONTENT (Context Preservation) =====
//     const sortedByRecency = [...items].sort(
//       (a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed),
//     );

//     const mostRecent = sortedByRecency[0];

//     return {
//       ...mostRecent,
//       priorityLabel: "▶️ Continue Where You Left",
//       priorityReason: "Pick up from your last session",
//       urgencyLevel: "normal",
//       ctaText: getButtonText(mostRecent),
//     };
//   }

//   function getSmartSecondaryItems(userData, primaryId, context) {
//     const items = userData.items.filter((item) => item.id !== primaryId);

//     // Calculate weighted scores with business logic
//     const scored = items.map((item) => {
//       let score = 0;

//       // Base recency score
//       const hoursAgo = getHoursSinceLastAccess(item.lastAccessed);
//       score += Math.max(0, 50 - hoursAgo); // Recent items get up to 50

//       // Completion momentum
//       if (item.type === "content") {
//         score += item.completionPercentage * 0.3; // Higher completion = higher score
//       }

//       // Quiz urgency
//       if (item.type === "quiz") {
//         if (item.isBlocking) score += 30;
//         if (item.deadline) {
//           const daysLeft = getDaysUntilDeadline(item.deadline);
//           if (daysLeft <= 2) score += 40;
//           else if (daysLeft <= 5) score += 20;
//         }
//         if (item.attemptCount >= 2 && item.failCount > 0) score += 25;
//         if (item.questionsRemaining === 1) score += 35; // Almost done!
//       }

//       // Deadline urgency
//       if (item.deadline) {
//         const daysLeft = getDaysUntilDeadline(item.deadline);
//         if (daysLeft === 0) score += 60;
//         else if (daysLeft === 1) score += 40;
//         else if (daysLeft <= 3) score += 20;
//       }

//       return { ...item, score };
//     });

//     return scored.sort((a, b) => b.score - a.score).slice(0, 2);
//   }

//   // ==================== SMART QUIZ HELPERS ====================

//   function getBlockingReason(quiz) {
//     if (quiz.attemptCount === 0) {
//       return "Complete this quiz to unlock the next chapter";
//     }
//     if (quiz.failCount >= 2) {
//       return `You've attempted ${quiz.attemptCount} times. Review the chapter and try again`;
//     }
//     return `Need ${quiz.requiredScoreToPass}% to pass. Current best: ${quiz.bestScore}%`;
//   }

//   function getStruggleReason(quiz) {
//     if (quiz.failCount >= 2) {
//       return "Struggling with this topic? Review the chapter before retrying";
//     }
//     if (quiz.bestScore < 40) {
//       return "Let's strengthen your basics. Review the material first";
//     }
//     return "Previous attempt needs improvement. Try again?";
//   }

//   function getSmartQuizCTA(quiz) {
//     if (quiz.questionsRemaining === 1) {
//       return "Finish Quiz (1 question left)";
//     }
//     if (quiz.attemptCount >= 2 && quiz.failCount > 0) {
//       return "Retry Quiz to Improve";
//     }
//     if (quiz.deadline) {
//       const daysLeft = getDaysUntilDeadline(quiz.deadline);
//       if (daysLeft <= 1) return "⚠️ Urgent: Complete Quiz";
//     }
//     if (quiz.completionPercentage > 0) {
//       return `Continue Quiz (${quiz.questionsRemaining} left)`;
//     }
//     return "Start Quiz";
//   }

//   // ==================== UTILITY FUNCTIONS ====================

//   function getHoursSinceLastAccess(lastAccessed) {
//     const last = new Date(lastAccessed);
//     const now = new Date();
//     const diffMs = now - last;
//     return diffMs / (1000 * 60 * 60);
//   }

//   function getDaysUntilDeadline(deadline) {
//     const deadlineDate = new Date(deadline);
//     const now = new Date();
//     const diffMs = deadlineDate - now;
//     return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
//   }

//   function getTimeAgo(lastAccessed) {
//     const hours = getHoursSinceLastAccess(lastAccessed);
//     if (hours < 1) return "Just now";
//     if (hours < 24) return `${Math.floor(hours)} hours ago`;
//     const days = Math.floor(hours / 24);
//     return `${days} days ago`;
//   }

//   function formatDate(dateString) {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
//   }

//   function getButtonText(content) {
//     if (!content) return "Resume Learning";
//     if (content.type === "quiz") {
//       return getSmartQuizCTA(content);
//     }
//     if (content.hasDoubt) return "Continue Discussion";
//     if (content.completionPercentage === 0) return "Start Learning";
//     if (content.completionPercentage > 85) return "Finish Now";
//     return "Resume Learning";
//   }

//   function getContextInfo(content) {
//     if (!content) return "";
//     if (content.type === "quiz") {
//       let info = `📝 ${content.questionsRemaining || 0} of ${content.totalQuestions || 0} questions left`;
//       if (content.bestScore > 0) {
//         info += ` • Best score: ${content.bestScore}%`;
//       }
//       if (content.attemptCount > 1) {
//         info += ` • Attempt ${content.attemptCount}`;
//       }
//       return info;
//     }
//     return `Last ${getTimeAgo(content.lastAccessed)} • ${content.completionPercentage}% complete`;
//   }

//   function getPriorityBadgeColor(urgencyLevel) {
//     switch (urgencyLevel) {
//       case "critical":
//         return "bg-red-500/30 text-red-200";
//       case "high":
//         return "bg-orange-500/30 text-orange-200";
//       case "medium":
//         return "bg-yellow-500/30 text-yellow-200";
//       default:
//         return "bg-white/20 text-white";
//     }
//   }

//   // Don't render if no data
//   if (!primaryContent) {
//     return (
//       <div className="lg:col-span-3">
//         <div className="rounded-3xl bg-gray-100 p-8 text-center">
//           <p className="text-gray-500">Loading your learning journey...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="lg:col-span-3">
//       {/* Main Resume Card */}
//       <div className="relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 p-1 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500">
//         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

//         <div className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 rounded-3xl p-6 md:p-8">
//           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl"></div>

//           <div className="relative z-10">
//             {/* Smart Priority Badges */}
//             <div className="flex items-center gap-2 mb-4 flex-wrap">
//               <span
//                 className={`px-3 py-1 backdrop-blur-sm rounded-full text-sm flex items-center gap-1 ${getPriorityBadgeColor(primaryContent.urgencyLevel)}`}
//               >
//                 {primaryContent.icon || (
//                   <Zap className="w-4 h-4 fill-current" />
//                 )}
//                 {primaryContent.priorityLabel}
//               </span>

//               {primaryContent.type === "quiz" &&
//                 primaryContent.questionsRemaining === 1 && (
//                   <span className="px-3 py-1 bg-green-500/30 backdrop-blur-sm rounded-full text-green-200 text-sm flex items-center gap-1">
//                     <span>🎯</span> Last Question!
//                   </span>
//                 )}

//               {primaryContent.deadline && (
//                 <span className="px-3 py-1 bg-red-500/30 backdrop-blur-sm rounded-full text-red-200 text-sm flex items-center gap-1">
//                   <span>⏰</span>{" "}
//                   {getDaysUntilDeadline(primaryContent.deadline) === 0
//                     ? "Due today"
//                     : `${getDaysUntilDeadline(primaryContent.deadline)} days left`}
//                 </span>
//               )}
//             </div>

//             {/* Main Content */}
//             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
//               <div className="flex-1">
//                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
//                   {primaryContent.type === "quiz"
//                     ? `${primaryContent.subject} - ${primaryContent.chapter} Quiz`
//                     : `Continue Learning: ${primaryContent.topic}`}
//                 </h2>

//                 <p className="text-xl text-white/90 mb-2">
//                   {primaryContent.subject} - {primaryContent.chapter}
//                   {primaryContent.page && ` (Page ${primaryContent.page})`}
//                 </p>

//                 {/* Smart reason message */}
//                 <p className="text-white/80 mb-3">
//                   {primaryContent.priorityReason}
//                 </p>

//                 {/* Stats row */}
//                 <div className="flex items-center gap-4 text-white/80 flex-wrap">
//                   {primaryContent.type === "quiz" ? (
//                     <>
//                       <span className="flex items-center gap-1">
//                         <span>📊</span>
//                         {primaryContent.questionsRemaining || 0} of{" "}
//                         {primaryContent.totalQuestions || 5} left
//                       </span>
//                       <span>•</span>
//                       <span>
//                         ⏱️ {primaryContent.avgTimePerQuestion || 2} min/question
//                       </span>
//                       {primaryContent.attemptCount > 1 && (
//                         <>
//                           <span>•</span>
//                           <span>Attempt {primaryContent.attemptCount}</span>
//                         </>
//                       )}
//                     </>
//                   ) : (
//                     <>
//                       <span className="flex items-center gap-1">
//                         <TrendingUp className="w-4 h-4" />
//                         {primaryContent.weeklyProgress || "+0%"} this week
//                       </span>
//                       <span>•</span>
//                       <span>
//                         ⏱️ {primaryContent.timeRemaining || 15} min left
//                       </span>
//                       {primaryContent.completionPercentage > 80 && (
//                         <>
//                           <span>•</span>
//                           <span className="text-yellow-200">
//                             🎯 Almost there!
//                           </span>
//                         </>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Progress Circle */}
//               <div className="relative">
//                 <svg className="w-24 h-24 transform -rotate-90">
//                   <circle
//                     cx="48"
//                     cy="48"
//                     r="42"
//                     stroke="currentColor"
//                     strokeWidth="6"
//                     fill="transparent"
//                     className="text-white/20"
//                   />
//                   <circle
//                     cx="48"
//                     cy="48"
//                     r="42"
//                     stroke="currentColor"
//                     strokeWidth="6"
//                     fill="transparent"
//                     strokeDasharray={`${2 * Math.PI * 42}`}
//                     strokeDashoffset={`${2 * Math.PI * 42 * (1 - (primaryContent.completionPercentage || 0) / 100)}`}
//                     className="text-white transition-all duration-500"
//                   />
//                 </svg>
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <span className="text-white text-2xl font-bold">
//                     {primaryContent.completionPercentage || 0}%
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Smart Resume Button */}
//             <button
//               onClick={() => console.log("Resuming:", primaryContent)}
//               className="mt-6 w-full md:w-auto bg-white text-purple-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2 group"
//             >
//               <span>
//                 ▶️ {primaryContent.ctaText || getButtonText(primaryContent)}
//               </span>
//               <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//             </button>

//             {/* Context info */}
//             <div className="mt-4 flex items-center gap-3 flex-wrap">
//               {primaryContent.thumbnail && (
//                 <img
//                   src={primaryContent.thumbnail}
//                   className="w-12 h-12 rounded-lg object-cover"
//                   alt="preview"
//                 />
//               )}
//               <span className="text-white/80 text-sm">
//                 {getContextInfo(primaryContent)}
//               </span>

//               {primaryContent.hasDoubt && (
//                 <span className="text-yellow-200 text-sm flex items-center gap-1">
//                   <span>💬</span>
//                   Pending doubt
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Secondary Cards */}
//       {secondaryItems.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//           {secondaryItems.map((item) => (
//             <SecondaryContinueCard
//               key={item.id}
//               item={item}
//               onResume={(item) => console.log("Resuming secondary:", item)}
//               getTimeAgo={getTimeAgo}
//               formatDate={formatDate}
//               getDaysUntilDeadline={getDaysUntilDeadline}
//             />
//           ))}
//         </div>
//       )}

//       {/* View All Link */}
//       {totalIncomplete > 3 && (
//         <div className="mt-3 text-right">
//           <button
//             onClick={() => console.log("View all items")}
//             className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1 justify-end"
//           >
//             <span>📚 View all {totalIncomplete} in-progress items</span>
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// // Enhanced Secondary Card Component
// function SecondaryContinueCard({
//   item,
//   onResume,
//   getTimeAgo,
//   formatDate,
//   getDaysUntilDeadline,
// }) {
//   return (
//     <div
//       onClick={() => onResume(item)}
//       className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/20"
//     >
//       <div className="flex items-start justify-between mb-2">
//         <span className="text-xs text-white/70">{item.subject}</span>
//         <div className="flex gap-1">
//           {item.type === "quiz" && (
//             <span className="text-xs bg-purple-500/50 px-2 py-0.5 rounded-full text-white">
//               Quiz
//             </span>
//           )}
//           {item.hasPendingQuiz && (
//             <span className="text-xs bg-orange-500/50 px-2 py-0.5 rounded-full text-white">
//               Pending
//             </span>
//           )}
//         </div>
//       </div>

//       <h4 className="text-white font-semibold mb-1">{item.chapter}</h4>
//       <p className="text-white/70 text-sm mb-3">{item.topic}</p>

//       {/* Smart progress indicator for quizzes */}
//       {item.type === "quiz" && item.questionsRemaining > 0 && (
//         <div className="mb-2 text-xs text-white/60">
//           {item.questionsRemaining} of {item.totalQuestions} questions left
//           {item.bestScore > 0 && ` • Best: ${item.bestScore}%`}
//         </div>
//       )}

//       <div className="flex items-center justify-between">
//         <div className="flex-1 mr-3">
//           <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
//             <div
//               className={`h-full rounded-full ${
//                 item.type === "quiz" && item.failCount > 0
//                   ? "bg-orange-400"
//                   : "bg-white"
//               }`}
//               style={{ width: `${item.completionPercentage || 0}%` }}
//             />
//           </div>
//         </div>
//         <span className="text-white text-sm font-medium">
//           {item.completionPercentage || 0}%
//         </span>
//       </div>

//       <div className="mt-2 flex items-center justify-between text-xs text-white/60">
//         <span>⏱️ {item.timeRemaining || 10} min</span>
//         <span>{getTimeAgo(item.lastAccessed)}</span>
//       </div>

//       {item.deadline && (
//         <div className="mt-2 text-xs text-red-300 flex items-center gap-1">
//           <span>⏰</span>
//           Due {formatDate(item.deadline)}
//           {getDaysUntilDeadline(item.deadline) <= 2 && (
//             <span className="ml-1 text-red-200">(Urgent!)</span>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default ResumeClick;
