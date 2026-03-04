// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   GraduationCap,
//   Sparkles,
//   ArrowRight,
//   BookOpen,
//   Users,
//   Award,
//   Video,
//   Mic,
//   Globe,
//   CheckCircle,
//   Zap,
//   TrendingUp,
//   Star,
//   Rocket,
//   FileText,
//   BarChart,
//   Calendar,
//   MessageSquare,
//   Shield,
//   Clock,
//   Brain,
//   Target,
//   Palette,
//   Layers,
//   PenTool,
//   Download,
//   Upload,
//   Settings,
//   Bell,
//   Search,
//   Filter,
//   Grid,
//   List,
//   Eye,
//   Edit,
//   Trash2,
//   Share2,
//   Copy,
//   Lock,
//   Unlock,
//   Bookmark,
//   Heart,
//   ThumbsUp,
//   MessageCircle,
//   User,
// } from "lucide-react";

// const TeacherWelcomeBoard = () => {
//   const navigate = useNavigate();
//   const [isHovered, setIsHovered] = useState(false);

//   const handleGetStarted = () => {
//     navigate("/teacherDetails/applyAsTeacher");
//   };

//   // LMS Features for Teachers
//   const lmsFeatures = [
//     {
//       icon: BookOpen,
//       title: "Course Creator",
//       description: "Build interactive lessons with multimedia content",
//       color: "from-blue-500 to-cyan-500",
//       stats: "Create Unlimited Courses",
//     },
//     {
//       icon: Video,
//       title: "Live Classes",
//       description: "Host real-time virtual classrooms with whiteboard",
//       color: "from-purple-500 to-pink-500",
//       stats: "HD Video & Audio",
//     },
//     {
//       icon: FileText,
//       title: "Assignment Manager",
//       description: "Create, distribute & auto-grade assignments",
//       color: "from-emerald-500 to-teal-500",
//       stats: "AI Grading Assistant",
//     },
//     {
//       icon: BarChart,
//       title: "Analytics Dashboard",
//       description: "Track student performance with detailed insights",
//       color: "from-amber-500 to-orange-500",
//       stats: "Real-time Analytics",
//     },
//     {
//       icon: Calendar,
//       title: "Schedule Planner",
//       description: "Organize classes, set deadlines & reminders",
//       color: "from-rose-500 to-red-500",
//       stats: "Smart Scheduling",
//     },
//     {
//       icon: MessageSquare,
//       title: "Communication Hub",
//       description: "Direct messaging & announcement system",
//       color: "from-indigo-500 to-blue-500",
//       stats: "24/7 Support",
//     },
//     {
//       icon: Shield,
//       title: "Secure Platform",
//       description: "Bank-level security for all your content",
//       color: "from-green-500 to-emerald-500",
//       stats: "Encrypted Data",
//     },
//     {
//       icon: Users,
//       title: "Student Management",
//       description: "Manage student profiles, groups & progress",
//       color: "from-violet-500 to-purple-500",
//       stats: "Unlimited Students",
//     },
//   ];

//   const teacherBenefits = [
//     {
//       icon: TrendingUp,
//       text: "Earn up to $5000/month",
//       color: "text-emerald-500",
//     },
//     { icon: Globe, text: "Teach students worldwide", color: "text-blue-500" },
//     { icon: Clock, text: "Flexible working hours", color: "text-amber-500" },
//     { icon: Award, text: "Get certified & verified", color: "text-purple-500" },
//     { icon: Brain, text: "AI teaching assistant", color: "text-cyan-500" },
//     { icon: Target, text: "Performance bonuses", color: "text-rose-500" },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-500">
//       <main className="max-w-7xl mx-auto px-6 py-12">
//         {/* Hero Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-16"
//         >
//           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6">
//             <Sparkles className="h-4 w-4 text-purple-500" />
//             <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
//               WELCOME, FUTURE EDUCATOR!
//             </span>
//           </div>

//           <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
//             Transform Your Teaching
//             <br />
//             <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
//               With Smart LMS Tools
//             </span>
//           </h1>

//           <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
//             Everything you need to create, manage, and deliver amazing learning
//             experiences in one powerful platform.
//           </p>

//           {/* Stats Banner */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
//             {[
//               { value: "50K+", label: "Active Teachers", icon: Users },
//               { value: "2M+", label: "Students", icon: GraduationCap },
//               { value: "98%", label: "Success Rate", icon: TrendingUp },
//               { value: "4.9★", label: "Rating", icon: Star },
//             ].map((stat, idx) => (
//               <div
//                 key={idx}
//                 className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm"
//               >
//                 <div className="flex items-center justify-center gap-2 mb-2">
//                   <stat.icon className="h-5 w-5 text-purple-500" />
//                   <span className="text-2xl font-bold text-gray-900 dark:text-white">
//                     {stat.value}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {stat.label}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* CTA Button */}
//           <motion.button
//             onClick={handleGetStarted}
//             onHoverStart={() => setIsHovered(true)}
//             onHoverEnd={() => setIsHovered(false)}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
//           >
//             <Rocket className="h-5 w-5" />
//             Start Your Teaching Journey
//             <motion.div
//               animate={{ x: isHovered ? 8 : 0 }}
//               transition={{ type: "spring", stiffness: 400 }}
//             >
//               <ArrowRight className="h-5 w-5" />
//             </motion.div>
//           </motion.button>
//         </motion.div>

//         {/* LMS Features Grid */}
//         <section className="mb-20">
//           <h2 className="text-3xl font-bold text-center mb-12">
//             Complete Teaching Toolkit
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {lmsFeatures.slice(0, 8).map((feature, idx) => (
//               <motion.div
//                 key={idx}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: idx * 0.1 }}
//                 whileHover={{ y: -5, scale: 1.02 }}
//                 className="group relative p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-purple-500/30 dark:hover:border-purple-500/50 transition-all cursor-pointer"
//               >
//                 <div
//                   className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
//                 />
//                 <div
//                   className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}/10 w-fit mb-4`}
//                 >
//                   <feature.icon
//                     className={`h-6 w-6 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}
//                   />
//                 </div>
//                 <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
//                   {feature.description}
//                 </p>
//                 <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
//                   {feature.stats}
//                 </span>
//               </motion.div>
//             ))}
//           </div>
//         </section>

//         {/* Teacher Benefits */}
//         <section className="mb-20">
//           <div className="bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 rounded-3xl p-8 border border-purple-500/20">
//             <h2 className="text-2xl font-bold mb-8 text-center">
//               Why Teachers Love Our Platform
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {teacherBenefits.map((benefit, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-white/10"
//                 >
//                   <div
//                     className={`p-2 rounded-lg ${benefit.color.replace("text-", "bg-")}/10`}
//                   >
//                     <benefit.icon className={`h-5 w-5 ${benefit.color}`} />
//                   </div>
//                   <span className="font-medium">{benefit.text}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* Quick Start Guide */}
//         <section className="mb-20">
//           <h2 className="text-2xl font-bold mb-8 text-center">
//             Get Started in 3 Easy Steps
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {[
//               {
//                 step: "1",
//                 title: "Create Profile",
//                 desc: "Set up your teacher profile & credentials",
//                 icon: User,
//               },
//               {
//                 step: "2",
//                 title: "Build Courses",
//                 desc: "Design your curriculum & upload materials",
//                 icon: Layers,
//               },
//               {
//                 step: "3",
//                 title: "Start Teaching",
//                 desc: "Launch classes & connect with students",
//                 icon: Video,
//               },
//             ].map((step, idx) => (
//               <div
//                 key={idx}
//                 className="relative p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-white/10"
//               >
//                 <div className="absolute -top-4 left-8 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                   {step.step}
//                 </div>
//                 <div className="text-center">
//                   <div className="flex justify-center mb-4">
//                     <div className="p-4 rounded-2xl bg-purple-500/10">
//                       <step.icon className="h-8 w-8 text-purple-500" />
//                     </div>
//                   </div>
//                   <h3 className="text-xl font-bold mb-2">{step.title}</h3>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     {step.desc}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Final CTA */}
//         <div className="text-center">
//           <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 animate-gradient">
//             <button
//               onClick={handleGetStarted}
//               className="px-12 py-6 bg-white dark:bg-gray-900 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
//             >
//               <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
//                 Begin Your Teaching Journey Now →
//               </span>
//             </button>
//           </div>
//           <p className="text-gray-500 dark:text-gray-400 mt-6">
//             Join 50,000+ educators transforming education
//           </p>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="border-t border-gray-200 dark:border-white/10 py-8">
//         <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 dark:text-gray-400 text-sm">
//           <p>© 2024 EduPro LMS. All teaching tools included.</p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default TeacherWelcomeBoard;
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
  Mic,
  Globe,
  CheckCircle,
  Zap,
  TrendingUp,
  Star,
  Rocket,
  Clock,
  Target,
  Trophy,
  DollarSign,
  Briefcase,
  Shield,
  BookMarked,
  BarChart,
  Calendar,
  MessageSquare,
  PenTool,
  Headphones,
  Settings,
  Upload,
  Download,
  FileText,
  Edit,
  Users2,
  Book,
  Monitor,
  Smartphone,
  Coffee,
  Crown,
  Gift,
  TrendingUp as TrendingUpIcon,
  Lightbulb,
  Brain,
  Palette,
  Music,
  Calculator,
  Beaker,
  Languages,
  History,
  Heart,
  Smile,
  PartyPopper,
  Medal,
  Gem,
  Banknote,
  Wallet,
  Home,
  ChartBar,
  Lock,
  Unlock,
  Phone,
  Mail,
} from "lucide-react";

const TeacherWelcomeBoard = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleGetStarted = () => {
    navigate("/teacherDetails/applyAsTeacher");
  };

  // Teacher LMS Features in Malayalam
  const teacherFeatures = [
    {
      icon: BookOpen,
      title: "ക്രിയേറ്റീവ് കോഴ്സ് ബിൽഡർ",
      description: "ഇന്ററാക്ടീവ് ലെസ്സണുകൾ സൃഷ്ടിക്കാം",
      color: "from-blue-500 to-cyan-500",
      emoji: "🎨",
      earning: "₹50,000/മാസം വരെ",
    },
    {
      icon: Video,
      title: "ലൈവ് ടീച്ചിംഗ്",
      description: "വിദ്യാർത്ഥികളുമായി റിയൽ-ടൈം ഇടപെടൽ",
      color: "from-purple-500 to-pink-500",
      emoji: "🎥",
      earning: "₹800/മണിക്കൂർ",
    },
    {
      icon: BookMarked,
      title: "ക്യൂറിക്കുലം ഡിസൈൻ",
      description: "മോഡേൺ സിലബസ് സൃഷ്ടിക്കാം",
      color: "from-emerald-500 to-teal-500",
      emoji: "📋",
      earning: "₹10,000/കോഴ്സ്",
    },
    {
      icon: BarChart,
      title: "സ്മാർട്ട് അനലിറ്റിക്സ്",
      description: "വിദ്യാർത്ഥി പുരോഗതി വിശകലനം",
      color: "from-amber-500 to-orange-500",
      emoji: "📊",
      earning: "AI അസിസ്റ്റൻസ്",
    },
    {
      icon: Calendar,
      title: "ഫ്ലെക്സിബിൾ ഷെഡ്യൂൾ",
      description: "നിങ്ങളുടെ സമയത്ത് പഠിപ്പിക്കാം",
      color: "from-rose-500 to-red-500",
      emoji: "⏰",
      earning: "സമയ സ്വാതന്ത്ര്യം",
    },
    {
      icon: MessageSquare,
      title: "കമ്മ്യൂണിക്കേഷൻ ഹബ്",
      description: "വിദ്യാർത്ഥികളുമായി നേരിട്ട് ആശയവിനിമയം",
      color: "from-indigo-500 to-blue-500",
      emoji: "💬",
      earning: "24/7 സപ്പോർട്ട്",
    },
    {
      icon: Shield,
      title: "സുരക്ഷിത പ്ലാറ്റ്ഫോം",
      description: "വിദ്യാർത്ഥി ഡാറ്റ സുരക്ഷിതം",
      color: "from-green-500 to-emerald-500",
      emoji: "🔒",
      earning: "ഇൻഷുറൻസ് കവറേജ്",
    },
    {
      icon: Users2,
      title: "വിദ്യാർത്ഥി മാനേജ്മെന്റ്",
      description: "അനലിമിറ്റഡ് വിദ്യാർത്ഥികൾക്ക് പഠിപ്പിക്കാം",
      color: "from-violet-500 to-purple-500",
      emoji: "👨‍🎓",
      earning: "₹500/വിദ്യാർത്ഥി",
    },
  ];

  // Teaching Subjects in Malayalam
  const teachingSubjects = [
    {
      name: "ഗണിതം",
      icon: Calculator,
      color: "bg-blue-500",
      emoji: "🧮",
      demand: "ഉയർന്ന താല്പര്യം",
    },
    {
      name: "ഫിസിക്സ്",
      icon: Beaker,
      color: "bg-purple-500",
      emoji: "⚛️",
      demand: "പ്രീമിയം റേറ്റ്",
    },
    {
      name: "മലയാളം",
      icon: Languages,
      color: "bg-green-500",
      emoji: "📖",
      demand: "പ്രാദേശിക താല്പര്യം",
    },
    {
      name: "ഇംഗ്ലീഷ്",
      icon: Languages,
      color: "bg-red-500",
      emoji: "🇬🇧",
      demand: "ഗ്ലോബൽ ഡിമാൻഡ്",
    },
    {
      name: "കമ്പ്യൂട്ടർ",
      icon: Monitor,
      color: "bg-indigo-500",
      emoji: "💻",
      demand: "ടെക് സ്കിൽസ്",
    },
    {
      name: "ചരിത്രം",
      icon: History,
      color: "bg-amber-500",
      emoji: "🏛️",
      demand: "കോച്ചിംഗ്",
    },
    {
      name: "ആർട്ട്",
      icon: Palette,
      color: "bg-pink-500",
      emoji: "🎨",
      demand: "ക്രിയേറ്റീവ്",
    },
    {
      name: "സംഗീതം",
      icon: Music,
      color: "bg-cyan-500",
      emoji: "🎵",
      demand: "ഹോബി ക്ലാസുകൾ",
    },
  ];

  // Teacher Benefits in Malayalam
  const teacherBenefits = [
    {
      icon: DollarSign,
      text: "₹50,000 - ₹2,00,000/മാസം",
      color: "text-emerald-500",
      emoji: "💰",
    },
    {
      icon: Globe,
      text: "ലോകമെമ്പാടും വിദ്യാർത്ഥികൾ",
      color: "text-blue-500",
      emoji: "🌍",
    },
    {
      icon: Clock,
      text: "നിങ്ങൾ തീരുമാനിക്കുന്ന സമയം",
      color: "text-amber-500",
      emoji: "⏰",
    },
    {
      icon: Award,
      text: "സർട്ടിഫൈഡ് ടീച്ചർ സ്റ്റാറ്റസ്",
      color: "text-purple-500",
      emoji: "🏆",
    },
    {
      icon: Brain,
      text: "AI ടീച്ചിംഗ് അസിസ്റ്റന്റ്",
      color: "text-cyan-500",
      emoji: "🤖",
    },
    {
      icon: TrendingUpIcon,
      text: "പ്രോമോഷൻ & ബോണസ്",
      color: "text-rose-500",
      emoji: "📈",
    },
    {
      icon: Home,
      text: "വീട്ടിൽ നിന്ന് പഠിപ്പിക്കാം",
      color: "text-green-500",
      emoji: "🏠",
    },
    {
      icon: ChartBar,
      text: "വാർഷിക ഇൻകം ഗ്രോത്ത്",
      color: "text-orange-500",
      emoji: "📊",
    },
  ];

  // Malayalam Motivational Quotes for Teachers
  const malayalamQuotes = [
    "ഒരു ടീച്ചർ ഒരു ലൈറ്റ് ഹൗസ് പോലെ!",
    "വിദ്യാഭ്യാസം ലോകം മാറ്റുന്നു!",
    "നിങ്ങളുടെ അറിവ് മറ്റുള്ളവരുടെ ജീവിതം മാറ്റും!",
    "ഒരു ടീച്ചറുടെ സ്വപ്നം ആയിരം വിദ്യാർത്ഥികളുടെ യാഥാർത്ഥ്യം!",
    "പഠിപ്പിക്കുക, പ്രചോദിപ്പിക്കുക, പരിവർത്തനം സൃഷ്ടിക്കുക!",
  ];

  // Success Stories
  const successStories = [
    {
      name: "ദിവ്യ എസ്.",
      role: "മലയാളം ടീച്ചർ",
      earning: "₹85,000/മാസം",
      students: "450+",
      emoji: "👩‍🏫",
    },
    {
      name: "രാജീവ് കെ.",
      role: "മാത്സ് എക്സ്പേർട്ട്",
      earning: "₹1,20,000/മാസം",
      students: "600+",
      emoji: "👨‍🏫",
    },
    {
      name: "പ്രിയ എം.",
      role: "സയൻസ് ടീച്ചർ",
      earning: "₹95,000/മാസം",
      students: "380+",
      emoji: "👩‍🔬",
    },
    {
      name: "അനിൽ ആർ.",
      role: "കമ്പ്യൂട്ടർ ടീച്ചർ",
      earning: "₹1,50,000/മാസം",
      students: "520+",
      emoji: "👨‍💻",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-500 font-sans">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-rose-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-purple-200 dark:border-pink-500/20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-xl shadow-lg animate-bounce">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              എഡുപ്രോ ടീച്ചർ പോർട്ടൽ
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-purple-600 dark:text-pink-400">
              👨‍🏫 പ്രൊഫഷണൽ ടീച്ചർമാർക്ക് വേണ്ടി
            </span>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 py-12 z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6 animate-pulse">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-bold text-purple-600 dark:text-pink-400">
              🎓 പ്രൊഫഷണൽ ടീച്ചിംഗ് കരിയർ ആരംഭിക്കൂ! 🎓
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              നിങ്ങളുടെ അറിവ്
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              നിങ്ങളുടെ വരുമാനം!
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            ഒരു ആധുനിക ടീച്ചർ ആയി ലോകമെമ്പാടുമുള്ള വിദ്യാർത്ഥികൾക്ക്
            പഠിപ്പിക്കൂ! ഫ്ലെക്സിബിൾ ടൈം, ഉയർന്ന വരുമാനം, ഡിജിറ്റൽ
            സ്വാതന്ത്ര്യം!
          </p>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
            {[
              {
                value: "10,000+",
                label: "ടീച്ചർമാർ",
                icon: Users,
                emoji: "👨‍🏫",
                color: "from-purple-500 to-pink-500",
              },
              {
                value: "₹5Cr+",
                label: "മാസിക വരുമാനം",
                icon: DollarSign,
                emoji: "💰",
                color: "from-emerald-500 to-teal-500",
              },
              {
                value: "50+",
                label: "രാജ്യങ്ങൾ",
                icon: Globe,
                emoji: "🌍",
                color: "from-blue-500 to-cyan-500",
              },
              {
                value: "4.9★",
                label: "റേറ്റിംഗ്",
                icon: Star,
                emoji: "⭐",
                color: "from-amber-500 to-orange-500",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{stat.emoji}</span>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-white/90">{stat.label}</p>
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
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/30 hover:shadow-pink-500/50 transition-all animate-bounce"
          >
            <Rocket className="h-5 w-5" />
            <span className="text-lg">🚀 ഇപ്പോൾ ടീച്ചർ ആകൂ!</span>
            <motion.div
              animate={{ x: isHovered ? 8 : 0 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Earning Potential Section */}
        <section className="mb-16 p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                💰 എത്ര സമ്പാദിക്കാം?
              </span>
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              ഞങ്ങളുടെ പ്ലാറ്റ്ഫോമിൽ നിന്നുള്ള ശരാശരി മാസിക വരുമാനം
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                level: "സ്റ്റാർട്ടർ",
                earning: "₹25,000 - ₹50,000",
                students: "50-100",
                icon: "🌱",
              },
              {
                level: "ഇന്റർമീഡിയറ്റ്",
                earning: "₹50,000 - ₹1,00,000",
                students: "100-300",
                icon: "📈",
              },
              {
                level: "പ്രൊഫഷണൽ",
                earning: "₹1,00,000 - ₹2,00,000",
                students: "300-500",
                icon: "🏆",
              },
              {
                level: "എക്സ്പേർട്ട്",
                earning: "₹2,00,000+",
                students: "500+",
                icon: "👑",
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-emerald-500/20 backdrop-blur-sm"
              >
                <div className="text-3xl mb-3">{plan.icon}</div>
                <h3 className="text-xl font-bold mb-2">{plan.level}</h3>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                  {plan.earning}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.students} വിദ്യാർത്ഥികൾ
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ✨ പ്രത്യേക സൗകര്യങ്ങൾ ✨
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teacherFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, rotateY: 10 }}
                className="group relative p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-purple-200 dark:border-pink-500/30 hover:border-purple-400 dark:hover:border-pink-400 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}
                />
                <div className="flex items-center justify-between mb-4">
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
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {feature.description}
                </p>
                <div className="mt-4 pt-4 border-t border-purple-100 dark:border-gray-700">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> {feature.earning}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Subjects Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 rounded-3xl p-8 border border-purple-300/20 dark:border-pink-500/20">
            <h2 className="text-2xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                📚 ഏത് വിഷയമാണ് പഠിപ്പിക്കാൻ? 📚
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {teachingSubjects.map((subject, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-pink-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${subject.color} bg-opacity-10`}
                    >
                      <subject.icon
                        className={`h-5 w-5 ${subject.color.replace("bg-", "text-")}`}
                      />
                    </div>
                    <span className="text-xl">{subject.emoji}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">
                      {subject.name}
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      {subject.demand}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              🏆 വിജയ കഥകൾ 🏆
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {successStories.map((story, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border border-purple-200 dark:border-pink-500/20"
              >
                <div className="text-3xl mb-3">{story.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {story.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {story.role}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {story.earning}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {story.students} വിദ്യാർത്ഥികൾ
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎁 ടീച്ചർമാർക്കുള്ള പ്രത്യേകതകൾ 🎁
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teacherBenefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ x: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white to-pink-50 dark:from-gray-800 dark:to-purple-900/20 border border-purple-200 dark:border-pink-500/20"
              >
                <div
                  className={`p-3 rounded-lg ${benefit.color.replace("text-", "bg-")}/10`}
                >
                  <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{benefit.emoji}</span>
                  <span className="font-medium text-sm">{benefit.text}</span>
                </div>
              </motion.div>
            ))}
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
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
              🚀 നിങ്ങളുടെ ടീച്ചിംഗ് കരിയർ ഇന്ന് തുടങ്ങൂ!
            </span>
          </h2>

          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 animate-gradient-x">
            <button
              onClick={handleGetStarted}
              className="px-12 py-6 bg-white dark:bg-gray-900 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
            >
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent text-xl">
                🎯 ഇപ്പോൾ രജിസ്റ്റർ ചെയ്യൂ →
              </span>
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mt-6 text-lg">
            👨‍🏫 10,000+ ടീച്ചർമാർ ഇതിനകം ഞങ്ങളോടൊപ്പം പ്രവർത്തിക്കുന്നു!
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {[
              "💰 ₹5Cr+ മാസിക വരുമാനം",
              "🌍 50+ രാജ്യങ്ങൾ",
              "🎓 1 ലക്ഷം+ വിദ്യാർത്ഥികൾ",
              "⭐ 4.9/5 റേറ്റിംഗ്",
            ].map((item, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full"
              >
                <span className="text-sm font-medium text-purple-700 dark:text-pink-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-200 dark:border-pink-500/20 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            {[
              "📞 24/7 ടീച്ചർ സപ്പോർട്ട്",
              "💼 പ്രൊഫഷണൽ പ്രൊഫൈൽ",
              "📱 ഫ്രീ ആപ്പ്",
              "🔒 സുരക്ഷിത പേയ്മെന്റ്",
            ].map((item, idx) => (
              <span
                key={idx}
                className="text-sm text-purple-600 dark:text-pink-400 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © 2024 എഡുപ്രോ ടീച്ചർ പോർട്ടൽ. പ്രൊഫഷണൽ ടീച്ചർമാർക്ക് വേണ്ടി!
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
            ❤️ നിങ്ങളുടെ അറിവ് മറ്റുള്ളവരുടെ ജീവിതം മാറ്റട്ടെ!
          </p>
        </div>
      </footer>

      {/* Floating Elements */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {["👨‍🏫", "💰", "🏆", "⭐"].map((emoji, idx) => (
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

export default TeacherWelcomeBoard;
