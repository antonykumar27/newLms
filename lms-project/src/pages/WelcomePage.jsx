import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Play,
  BarChart,
  FileText,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
  Zap,
  LogIn,
  UserPlus,
  UserCog,
  Users,
  BookMarked,
} from "lucide-react";

const WelcomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeRole, setActiveRole] = useState("student"); // Default role

  // Toggle Theme logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Close menu when clicking outside or on a link
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        !event.target.closest(".mobile-menu") &&
        !event.target.closest(".menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  const roles = [
    {
      id: "student",
      label: "Student",
      description: "Learn with personalized curriculum",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-500",
      features: ["Interactive Lessons", "Progress Tracking", "Smart Quizzes"],
    },
    {
      id: "teacher",
      label: "Teacher",
      description: "Create and manage courses",
      icon: BookMarked,
      color: "from-purple-500 to-pink-500",
      features: ["Course Builder", "Student Analytics", "Assignment Manager"],
    },
    {
      id: "admin",
      label: "Administrator",
      description: "Manage platform and users",
      icon: UserCog,
      color: "from-emerald-500 to-teal-500",
      features: ["User Management", "System Analytics", "Content Moderation"],
    },
  ];

  const grades = [
    {
      id: 1,
      label: "Primary",
      range: "1-5",
      emoji: "👦",
      color: "from-blue-400 to-cyan-400",
    },
    {
      id: 2,
      label: "Middle",
      range: "6-8",
      emoji: "👨‍🎓",
      color: "from-purple-400 to-pink-400",
    },
    {
      id: 3,
      label: "Secondary",
      range: "9-10",
      emoji: "📚",
      color: "from-orange-400 to-red-400",
    },
    {
      id: 4,
      label: "Higher Sec",
      range: "11-12",
      emoji: "🎯",
      color: "from-emerald-400 to-teal-400",
    },
  ];

  const features = {
    student: [
      {
        title: "Smart Study Planner",
        desc: "AI-powered study schedules",
        icon: "📅",
      },
      {
        title: "Interactive Quizzes",
        desc: "Real-time feedback & analytics",
        icon: "🧠",
      },
      {
        title: "Progress Dashboard",
        desc: "Track learning journey",
        icon: "📈",
      },
    ],
    teacher: [
      { title: "Course Creator", desc: "Build engaging lessons", icon: "🎨" },
      {
        title: "Class Analytics",
        desc: "Monitor student performance",
        icon: "📊",
      },
      {
        title: "Assignment Manager",
        desc: "Create & grade assignments",
        icon: "📝",
      },
    ],
    admin: [
      {
        title: "User Management",
        desc: "Manage all platform users",
        icon: "👥",
      },
      { title: "System Analytics", desc: "Platform-wide insights", icon: "🔍" },
      { title: "Content Management", desc: "Moderate all content", icon: "🛡️" },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 15 } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const handleRoleSelect = (roleId) => {
    setActiveRole(roleId);
  };

  const handleGetStarted = () => {
    navigate("/register", {
      state: {
        role: activeRole,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0a0a0c] dark:to-gray-900 text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-blue-500/30">
      {/* NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/50 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              EduLearn
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Role Selector */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-full">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeRole === role.id
                      ? `bg-gradient-to-r ${role.color} text-white shadow-lg`
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun size={20} className="text-yellow-400" />
                ) : (
                  <Moon size={20} className="text-slate-600" />
                )}
              </button>

              <button
                onClick={() => navigate("/login")}
                className="font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Login
              </button>

              <button
                onClick={handleGetStarted}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                Get Started as{" "}
                {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden mobile-menu absolute top-20 left-0 right-0 bg-white dark:bg-[#0a0a0c] border-b border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-lg"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Theme</span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? (
                      <Sun size={20} className="text-yellow-400" />
                    ) : (
                      <Moon size={20} className="text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <h3 className="font-medium text-slate-500 dark:text-slate-400">
                    I am a:
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.id}
                          onClick={() => {
                            handleRoleSelect(role.id);
                            setIsMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            activeRole === role.id
                              ? `border-transparent bg-gradient-to-r ${role.color} text-white`
                              : "border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <Icon size={20} />
                          <span className="font-medium">{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <LogIn size={20} />
                  <span className="font-semibold">Login</span>
                </button>

                <button
                  onClick={() => {
                    handleGetStarted();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                >
                  Start as{" "}
                  {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
                </button>

                {/* Quick Links */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                  <h3 className="font-medium text-slate-500 dark:text-slate-400 mb-3">
                    Quick Links
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Curriculum",
                      "Features",
                      "Pricing",
                      "Contact",
                      "About",
                      "Help",
                    ].map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="p-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* HERO SECTION */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 border border-blue-100 dark:border-blue-500/20"
          >
            <Sparkles size={16} />
            <span>The Future of Learning is Here</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter"
          >
            Learn, Teach & Manage
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              All in One Platform.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10"
          >
            EduLearn provides a comprehensive platform for students to learn,
            teachers to create content, and administrators to manage the entire
            educational ecosystem seamlessly.
          </motion.p>

          {/* Role Features Preview */}
          <motion.div
            variants={itemVariants}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features[activeRole].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={handleGetStarted}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 transition-all group"
            >
              <Play fill="currentColor" size={20} />
              Start as{" "}
              {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
              <ArrowRight
                className="group-hover:translate-x-1 transition-transform"
                size={20}
              />
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-10 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
            >
              Already have an account?
            </button>
          </motion.div>
        </motion.section>

        {/* ROLE COMPARISON SECTION */}
        <section className="mb-24">
          <h2 className="text-3xl font-black mb-12 text-center">
            Choose Your Path
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`relative p-8 rounded-3xl cursor-pointer transition-all ${
                    activeRole === role.id
                      ? `bg-gradient-to-br ${role.color} text-white shadow-2xl`
                      : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl w-fit mb-6 ${
                      activeRole === role.id
                        ? "bg-white/20 backdrop-blur-sm"
                        : "bg-slate-100 dark:bg-white/10"
                    }`}
                  >
                    <Icon size={32} />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{role.label}</h3>
                  <p
                    className={`mb-6 ${activeRole === role.id ? "text-white/90" : "text-slate-600 dark:text-slate-400"}`}
                  >
                    {role.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activeRole === role.id ? "bg-white" : "bg-blue-500"
                          }`}
                        />
                        <span
                          className={
                            activeRole === role.id
                              ? "text-white/90"
                              : "text-slate-700 dark:text-slate-300"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      activeRole === role.id
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                    }`}
                  >
                    {activeRole === role.id
                      ? "Selected"
                      : `Choose ${role.label}`}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* GRADE SELECTOR (Only for Students) */}
        {activeRole === "student" && (
          <section className="mb-24">
            <h2 className="text-3xl font-black mb-12 text-center">
              Tailored for Your Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {grades.map((grade) => (
                <motion.button
                  key={grade.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    navigate(`/register?grade=${grade.label.toLowerCase()}`)
                  }
                  className="group relative p-6 md:p-8 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${grade.color}`}
                  />
                  <span className="text-5xl mb-6 block group-hover:scale-125 transition-transform duration-500">
                    {grade.emoji}
                  </span>
                  <h4 className="text-xl font-bold mb-1">{grade.label}</h4>
                  <p className="text-slate-400 text-sm font-medium italic">
                    Classes {grade.range}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight size={14} />
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {/* PLATFORM FEATURES */}
        <section className="mb-24">
          <h2 className="text-3xl font-black mb-12 text-center">
            Why Choose EduLearn?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-500/20">
              <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-2xl w-fit mb-6">
                <Users size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Unified Platform</h3>
              <p className="text-slate-600 dark:text-slate-400">
                One platform for students, teachers, and administrators to
                collaborate seamlessly.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/20 dark:border-purple-500/20">
              <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-2xl w-fit mb-6">
                <Zap
                  size={28}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI-Powered Tools</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Smart analytics, automated grading, and personalized learning
                paths.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/20 dark:border-emerald-500/20">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl w-fit mb-6">
                <BarChart
                  size={28}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-time Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Comprehensive dashboards for tracking progress and performance.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <GraduationCap className="text-blue-600" />
              <span className="font-bold text-xl tracking-tight">EduLearn</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-sm font-medium">
              {[
                "Features",
                "Pricing",
                "Testimonials",
                "Careers",
                "Blog",
                "Support",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-blue-600 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            <button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold hover:scale-105 transition-all shadow-lg"
            >
              Start Free Today
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5 text-center">
            <p className="text-slate-400 text-sm">
              © 2026 EduLearn Platform. All rights reserved.
              <span className="block md:inline md:ml-2">
                Built for the future of education.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
