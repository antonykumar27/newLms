import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Video,
  Brain,
  Globe,
  CheckCircle,
  Zap,
  TrendingUp,
  Star,
  Rocket,
  Clock,
  Target,
  Trophy,
  Lightbulb,
  Search,
  Filter,
  BookMarked,
  PenTool,
  FileText,
  BarChart,
  Headphones,
  Smartphone,
  Coffee,
  Music,
  Gamepad2,
  Palette,
  Languages,
  Calculator,
  Beaker,
  History,
  Music2,
  Code,
  Camera,
  Heart,
  Smile,
  Crown,
  Gift,
  PartyPopper,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";

const StudentWelcomeBoard = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleGetStarted = () => {
    navigate("/studentDetails/registerMySelf");
  };

  // Student LMS Features in Malayalam
  const studentFeatures = [
    {
      icon: Brain,
      title: "ക്രമീകൃത പാഠ്യപദ്ധതി",
      description: "ആധുനിക സിലബസ്, വിഷയങ്ങൾ ക്രമത്തിൽ",
      color: "from-blue-500 to-cyan-500",
      emoji: "📚",
    },
    {
      icon: Video,
      title: "ലൈവ് ക്ലാസുകൾ",
      description: "റിയൽ-ടൈം ഇന്ററാക്ടീവ് ക്ലാസുകൾ",
      color: "from-purple-500 to-pink-500",
      emoji: "🎥",
    },
    {
      icon: BookMarked,
      title: "സ്മാർട്ട് നോട്ട്സ്",
      description: "ഓട്ടോമാറ്റിക് നോട്ട് സൃഷ്ടി & സംഭരണം",
      color: "from-emerald-500 to-teal-500",
      emoji: "📝",
    },
    {
      icon: BarChart,
      title: "പുരോഗതി ട്രാക്കർ",
      description: "പ്രതിദിനം പുരോഗതി വിശകലനം",
      color: "from-amber-500 to-orange-500",
      emoji: "📊",
    },
    {
      icon: Clock,
      title: "സ്മാർട്ട് ഷെഡ്യൂൾ",
      description: "ഓട്ടോമാറ്റിക് സ്റ്റഡി പ്ലാനർ",
      color: "from-rose-500 to-red-500",
      emoji: "⏰",
    },
    {
      icon: Headphones,
      title: "24/7 സപ്പോർട്ട്",
      description: "എപ്പോഴും സഹായത്തിന് ടീച്ചർമാർ",
      color: "from-indigo-500 to-blue-500",
      emoji: "🎧",
    },
    {
      icon: Smartphone,
      title: "മൊബൈൽ അപ്ലിക്കേഷൻ",
      description: "എവിടെയും പഠിക്കാം, എപ്പോഴും പഠിക്കാം",
      color: "from-green-500 to-emerald-500",
      emoji: "📱",
    },
    {
      icon: Target,
      title: "പേഴ്സണൽ ട്യൂട്ടർ",
      description: "വ്യക്തിഗത ശ്രദ്ധ & മാർഗ്ഗനിർദ്ദേശം",
      color: "from-violet-500 to-purple-500",
      emoji: "🎯",
    },
  ];

  // Popular Subjects in Malayalam
  const popularSubjects = [
    {
      name: "ഗണിതശാസ്ത്രം",
      icon: Calculator,
      color: "bg-blue-500",
      emoji: "🧮",
    },
    {
      name: "ഫിസിക്കൽ സയൻസ്",
      icon: Beaker,
      color: "bg-purple-500",
      emoji: "🔬",
    },
    { name: "മലയാളം", icon: Languages, color: "bg-green-500", emoji: "📖" },
    { name: "ഇംഗ്ലീഷ്", icon: Languages, color: "bg-red-500", emoji: "🇬🇧" },
    {
      name: "കമ്പ്യൂട്ടർ സയൻസ്",
      icon: Code,
      color: "bg-indigo-500",
      emoji: "💻",
    },
    { name: "ചരിത്രം", icon: History, color: "bg-amber-500", emoji: "🏛️" },
    { name: "കല", icon: Palette, color: "bg-pink-500", emoji: "🎨" },
    { name: "സംഗീതം", icon: Music2, color: "bg-cyan-500", emoji: "🎵" },
  ];

  // Student Benefits in Malayalam
  const studentBenefits = [
    {
      icon: Trophy,
      text: "സർട്ടിഫിക്കേഷൻ",
      color: "text-yellow-500",
      emoji: "🏆",
    },
    {
      icon: TrendingUpIcon,
      text: "95% മാർക്ക് ഉറപ്പ്",
      color: "text-emerald-500",
      emoji: "📈",
    },
    {
      icon: Gift,
      text: "പ്രതിഫല പ്രോഗ്രാം",
      color: "text-purple-500",
      emoji: "🎁",
    },
    {
      icon: Gamepad2,
      text: "ഗെയിമിഫൈഡ് ലേണിംഗ്",
      color: "text-blue-500",
      emoji: "🎮",
    },
    {
      icon: Coffee,
      text: "ഫ്ലെക്സിബിൾ സമയം",
      color: "text-amber-500",
      emoji: "☕",
    },
    {
      icon: Crown,
      text: "ടോപ്പർ സപ്പോർട്ട്",
      color: "text-rose-500",
      emoji: "👑",
    },
  ];

  // Malayalam Motivational Quotes
  const malayalamQuotes = [
    "പഠിക്കുന്നവന് ലോകം കീഴടങ്ങും!",
    "ഓരോ ദിവസവും ഒരു പുതിയ പാഠം!",
    "നിങ്ങളുടെ സ്വപ്നങ്ങൾ യാഥാർത്ഥ്യമാക്കുക",
    "വിജയം നിങ്ങളുടെ ശ്രമത്തിന്റെ കിരീടം",
    "ആദ്യം പഠിക്കുക, പിന്നെ മികച്ചവരാകുക",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 text-gray-900 dark:text-white transition-colors duration-500 font-sans">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-12 z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-6 animate-pulse">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-bold text-blue-600 dark:text-cyan-400">
              🎉 പുതിയ അനുഭവത്തിന് സ്വാഗതം! 🎉
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
              മികച്ച വിദ്യാർത്ഥിയാകാനുള്ള
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-600 bg-clip-text text-transparent">
              സ്മാർട്ട് പാത!
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            ആധുനിക ടെക്നോളജി ഉപയോഗിച്ച് പഠനം രസകരവും ഫലപ്രദവുമാക്കുക!
            AI-സപ്പോർട്ടഡ് ലേണിംഗ്, ഇന്ററാക്ടീവ് ക്ലാസുകൾ, സ്മാർട്ട്
            അസൈൻമെന്റുകൾ!
          </p>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
            {[
              {
                value: "1 ലക്ഷം+",
                label: "വിദ്യാർത്ഥികൾ",
                icon: Users,
                emoji: "👨‍🎓",
              },
              { value: "5000+", label: "ടോപ്പർമാർ", icon: Trophy, emoji: "🏆" },
              {
                value: "99%",
                label: "പാസ് ശതമാനം",
                icon: TrendingUp,
                emoji: "📈",
              },
              { value: "4.8★", label: "റേറ്റിംഗ്", icon: Star, emoji: "⭐" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-2xl bg-white/80 dark:bg-white/10 border border-blue-200/50 dark:border-cyan-500/20 backdrop-blur-sm shadow-lg"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{stat.emoji}</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={handleGetStarted}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/30 hover:shadow-purple-500/50 transition-all animate-bounce"
          >
            <Rocket className="h-5 w-5" />
            <span className="text-lg">🎯 ഇപ്പോൾ തുടങ്ങുക!</span>
            <motion.div
              animate={{ x: isHovered ? 8 : 0 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ✨ പ്രത്യേകതകൾ ✨
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, rotateY: 10 }}
                className="group relative p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-blue-200 dark:border-cyan-500/30 hover:border-blue-400 dark:hover:border-cyan-400 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}
                />
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}/20`}
                  >
                    <feature.icon
                      className={`h-6 w-6 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}
                    />
                  </div>
                  <span className="text-2xl">{feature.emoji}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
                <div className="mt-4 pt-4 border-t border-blue-100 dark:border-gray-700">
                  <span className="text-xs font-medium text-blue-600 dark:text-cyan-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> അറിയാം! ഇത് സ്വതന്ത്രമാണ്!
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Subjects Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 rounded-3xl p-8 border border-blue-300/20 dark:border-cyan-500/20">
            <h2 className="text-2xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                📚 പ്രധാന വിഷയങ്ങൾ 📚
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularSubjects.map((subject, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-cyan-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${subject.color} bg-opacity-10`}
                    >
                      <subject.icon
                        className={`h-5 w-5 ${subject.color.replace("bg-", "text-")}`}
                      />
                    </div>
                    <div>
                      <span className="text-lg mr-2">{subject.emoji}</span>
                      <span className="font-medium">{subject.name}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              🎁 നിങ്ങൾക്ക് ലഭിക്കുന്നത് 🎁
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentBenefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ x: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-cyan-500/20"
              >
                <div
                  className={`p-3 rounded-lg ${benefit.color.replace("text-", "bg-")}/10`}
                >
                  <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{benefit.emoji}</span>
                  <span className="font-medium">{benefit.text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Motivational Quotes */}
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-pink-500" />
            <h3 className="text-2xl font-bold text-white mb-6">
              💬 പ്രചോദന വാക്കുകൾ
            </h3>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {malayalamQuotes.map((quote, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 px-6 py-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30"
                >
                  <p className="text-white font-medium">{quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block mb-6"
          >
            <PartyPopper className="h-12 w-12 text-yellow-500" />
          </motion.div>

          <h2 className="text-3xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              🚀 മികച്ച വിദ്യാർത്ഥിയാകാനുള്ള അവസരം!
            </span>
          </h2>

          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 animate-gradient-x">
            <button
              onClick={handleGetStarted}
              className="px-12 py-6 bg-white dark:bg-gray-900 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
            >
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent text-xl">
                🎯 ഇപ്പോൾ രജിസ്റ്റർ ചെയ്യുക →
              </span>
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mt-6 text-lg">
            🎓 1 ലക്ഷത്തിലധികം വിദ്യാർത്ഥികൾ ഇതിനകം തുടങ്ങിയിരിക്കുന്നു!
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {[
              "🏆 ടോപ്പർമാർ ഉണ്ടാക്കി",
              "📚 1000+ വിഷയങ്ങൾ",
              "🎯 95% പാസ് റേറ്റ്",
              "💝 സൗജന്യ ട്രയൽ",
            ].map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full"
              >
                <span className="text-sm font-medium text-blue-700 dark:text-cyan-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-200 dark:border-cyan-500/20 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            {[
              "📞 24/7 സപ്പോർട്ട്",
              "💯 സൗജന്യം",
              "🔒 സുരക്ഷിതം",
              "📱 മൊബൈൽ അപ്ലിക്കേഷൻ",
            ].map((item, idx) => (
              <span
                key={idx}
                className="text-sm text-blue-600 dark:text-cyan-400 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © 2024 എഡുപ്രോ വിദ്യാർത്ഥി പോർട്ടൽ. സ്മാർട്ട് പഠനത്തിന് വേണ്ടി!
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
            ❤️ എല്ലാ വിദ്യാർത്ഥികളും വിജയിക്കട്ടെ!
          </p>
        </div>
      </footer>

      {/* Floating Emojis */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {["🎓", "📚", "🏆", "⭐"].map((emoji, idx) => (
          <motion.div
            key={idx}
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: idx * 0.5 }}
            className="text-2xl"
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentWelcomeBoard;
