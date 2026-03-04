// context/DashboardContext.jsx
import React, { createContext, useContext, useMemo } from "react";

const DashboardContext = createContext();

// Realistic LMS Data Generator
const generateRealisticData = () => {
  const today = new Date();

  return {
    user: {
      id: "user_123",
      name: "Abhishek",
      level: 12,
      xp: 2450,
      nextLevelXp: 3000,
      avatar: "https://i.pravatar.cc/150?img=7",
      joinDate: "2025-09-15",
      title: "Full Stack Developer",
    },

    // Course Progress Data
    courses: [
      {
        id: 1,
        title: "Advanced React & Next.js",
        progress: 65,
        totalLessons: 36,
        completedLessons: 24,
        category: "Frontend",
        color: "emerald",
      },
      {
        id: 2,
        title: "Node.js Masterclass",
        progress: 40,
        totalLessons: 28,
        completedLessons: 11,
        category: "Backend",
        color: "green",
      },
      {
        id: 3,
        title: "System Design",
        progress: 20,
        totalLessons: 25,
        completedLessons: 5,
        category: "Architecture",
        color: "blue",
      },
    ],

    // Current learning session
    currentSession: {
      courseId: 1,
      title: "Building Custom Hooks",
      courseTitle: "Advanced React",
      timeLeft: "2.5 hours",
      progress: 65,
      nextLesson: "useMemo & useCallback Deep Dive",
      thumbnail:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      instructor: "John Doe",
    },

    // Streak data
    streak: {
      current: 12,
      best: 24,
      totalHours: 128,
      weeklyGoal: 10,
      weeklyProgress: 7,
    },

    // Daily goal
    dailyGoal: {
      target: 5,
      completed: 3,
      quizzesDone: 2,
      minutesLearned: 125,
    },

    // Heatmap data
    heatmap: Array.from({ length: 365 }, (_, i) => {
      const date = new Date(2026, 0, i + 1);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseActivity = isWeekend ? Math.random() * 4 : Math.random() * 3;

      return {
        date: date.toISOString().split("T")[0],
        count: Math.floor(baseActivity),
        minutes: Math.floor(baseActivity * 45),
        topic: ["React", "Node.js", "Python", "System Design"][
          Math.floor(Math.random() * 4)
        ],
      };
    }),

    // Leaderboard
    leaderboard: [
      {
        id: 1,
        name: "Rahul",
        points: 5840,
        avatar: "https://i.pravatar.cc/150?img=1",
        change: "up",
        rank: 1,
      },
      {
        id: 2,
        name: "Priya",
        points: 5720,
        avatar: "https://i.pravatar.cc/150?img=2",
        change: "same",
        rank: 2,
      },
      {
        id: 3,
        name: "You",
        points: 5450,
        avatar: "https://i.pravatar.cc/150?img=7",
        change: "up",
        rank: 3,
        isUser: true,
      },
      {
        id: 4,
        name: "Amal",
        points: 5210,
        avatar: "https://i.pravatar.cc/150?img=3",
        change: "down",
        rank: 4,
      },
      {
        id: 5,
        name: "Neha",
        points: 4980,
        avatar: "https://i.pravatar.cc/150?img=4",
        change: "down",
        rank: 5,
      },
    ],

    // Badges
    badges: [
      {
        id: 1,
        name: "7 Day Streak",
        icon: "🔥",
        color: "orange",
        unlocked: true,
      },
      {
        id: 2,
        name: "Quick Learner",
        icon: "🚀",
        color: "blue",
        unlocked: true,
      },
      {
        id: 3,
        name: "Quiz Master",
        icon: "🧠",
        color: "purple",
        unlocked: true,
      },
      {
        id: 4,
        name: "Team Player",
        icon: "👥",
        color: "green",
        unlocked: false,
        progress: 60,
      },
      {
        id: 5,
        name: "Code Wizard",
        icon: "⚡",
        color: "emerald",
        unlocked: false,
        progress: 30,
      },
      {
        id: 6,
        name: "Champion",
        icon: "🏆",
        color: "yellow",
        unlocked: false,
        progress: 10,
      },
    ],

    // Recent activities
    activities: [
      {
        id: 1,
        type: "course",
        title: "Completed React Hooks",
        course: "Advanced React",
        time: "2 hours ago",
        xp: 50,
      },
      {
        id: 2,
        type: "quiz",
        title: "Scored 95% on JavaScript Quiz",
        course: "JavaScript Fundamentals",
        time: "5 hours ago",
        xp: 30,
      },
      {
        id: 3,
        type: "lesson",
        title: "Started Node.js Basics",
        course: "Backend Development",
        time: "yesterday",
        xp: 10,
      },
      {
        id: 4,
        type: "achievement",
        title: 'Earned "7 Day Streak" Badge',
        time: "yesterday",
        xp: 100,
      },
    ],

    // Weekly stats
    weeklyStats: {
      studyTime: 12.5,
      lessonsCompleted: 8,
      quizzesPassed: 4,
      accuracy: 86,
      xpGained: 450,
    },

    // Recommended lessons
    recommended: [
      {
        id: 1,
        title: "React Context API Deep Dive",
        duration: "45 min",
        level: "intermediate",
      },
      {
        id: 2,
        title: "JWT Authentication in Node.js",
        duration: "60 min",
        level: "advanced",
      },
      {
        id: 3,
        title: "Database Indexing Strategies",
        duration: "30 min",
        level: "intermediate",
      },
    ],
  };
};

export const DashboardProvider = ({ children }) => {
  const data = useMemo(() => generateRealisticData(), []);

  const getOverallProgress = () => {
    const total = data.courses.reduce((acc, c) => acc + c.progress, 0);
    return Math.round(total / data.courses.length);
  };

  const value = {
    ...data,
    overallProgress: getOverallProgress(),
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard must be used within DashboardProvider");
  return context;
};
