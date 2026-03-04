import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Smartphone,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  Key,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  GraduationCap,
  BookMarked,
  UserCog,
  Zap,
  Camera,
  Sun,
  Moon,
  X,
  Layout,
  Grid,
  Palette,
  Users,
  BarChart,
  FileText,
  Play,
  Menu,
  CheckCircle2,
  Upload,
  Phone,
  ChevronRight,
} from "lucide-react";
import {
  usePostUserMutation,
  useLazyCheckEmailQuery,
} from "../store/api/LoginUserApi";
import { debounce } from "lodash";

const Register = () => {
  const location = useLocation();
  const { role } = location.state || { role: "student" };
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default dark for modern look
  const [activeRole, setActiveRole] = useState(role);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [designMode, setDesignMode] = useState("modern"); // 'modern' or 'bento'

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    gender: "",
    wishTo: role,
    adminSecretCode: "",
    profilePicture: null,
  });

  const [emailStatus, setEmailStatus] = useState({
    isValid: false,
    isChecking: false,
    isAvailable: false,
    message: "",
    isAdminEmail: false,
  });

  const [showAdminCodeField, setShowAdminCodeField] = useState(false);

  const [register, { isLoading: isRegistering }] = usePostUserMutation();
  const [checkEmail] = useLazyCheckEmailQuery();

  // Toggle Theme logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const roles = [
    {
      id: "student",
      label: "Student",
      description: "Learn with personalized curriculum",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-r from-blue-600 to-cyan-600",
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop",
    },
    {
      id: "teacher",
      label: "Teacher",
      description: "Create and manage courses",
      icon: BookMarked,
      color: "from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-r from-purple-600 to-pink-600",
      image:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    },
    {
      id: "admin",
      label: "Administrator",
      description: "Manage platform and users",
      icon: UserCog,
      color: "from-emerald-500 to-teal-500",
      gradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    },
  ];

  // Bento Input Component
  const BentoInputField = React.memo(
    ({
      icon: Icon,
      label,
      name,
      type = "text",
      value,
      onChange,
      placeholder,
      required,
      error,
    }) => (
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative flex flex-col gap-1.5"
      >
        <label className="text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-[0.2em] ml-2">
          {label} {required && "•"}
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300">
            <Icon size={18} strokeWidth={2} />
          </div>
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-4 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all dark:text-white placeholder:text-gray-400/60"
            required={required}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1 ml-2">{error}</p>}
      </motion.div>
    ),
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 15 } },
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfileImage(file);
        setFormData((prev) => ({ ...prev, profilePicture: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setPreviewImage("");
    setProfileImage(null);
    setFormData((prev) => ({ ...prev, profilePicture: null }));
  };

  // Debounced email validation
  const validateEmail = useCallback(
    debounce(async (email) => {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailStatus({
          isValid: false,
          isChecking: false,
          isAvailable: false,
          message: "Please enter a valid email",
          isAdminEmail: false,
        });
        setShowAdminCodeField(false);
        return;
      }

      setEmailStatus((prev) => ({
        ...prev,
        isChecking: true,
        message: "Checking email...",
      }));

      try {
        const response = await checkEmail(email).unwrap();

        if (response.success) {
          const isAdminEmail = response.message === "this is admin email";

          setEmailStatus({
            isValid: true,
            isChecking: false,
            isAvailable: response.isAvailable || true,
            message: isAdminEmail
              ? "Admin email detected. Enter secret code to register as admin."
              : "Email is available",
            isAdminEmail: isAdminEmail,
          });

          setShowAdminCodeField(isAdminEmail);

          if (isAdminEmail) {
            toast.info("Admin email detected. Enter secret code to proceed.");
          }
        }
      } catch (err) {
        console.error("Email check error:", err);
        setEmailStatus({
          isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
          isChecking: false,
          isAvailable: true,
          message: "Email validation skipped",
          isAdminEmail: false,
        });
        setShowAdminCodeField(false);
      }
    }, 500),
    [checkEmail],
  );

  // Handle email input change
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData((prev) => ({ ...prev, email, adminSecretCode: "" }));
    setShowAdminCodeField(false);
    validateEmail(email);
  };

  const handleRoleSelect = (roleId) => {
    setActiveRole(roleId);
    setFormData((prev) => ({ ...prev, wishTo: roleId }));

    if (roleId !== "admin") {
      setFormData((prev) => ({ ...prev, adminSecretCode: "" }));
      setShowAdminCodeField(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter phone number");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!formData.gender) {
      toast.error("Please select gender");
      return;
    }

    if (emailStatus.isAdminEmail && !formData.adminSecretCode.trim()) {
      toast.error("Admin secret code is required for admin registration");
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("phoneNumber", formData.phoneNumber);
    submitData.append("wishTo", formData.wishTo);
    submitData.append("password", formData.password);
    submitData.append("gender", formData.gender);

    if (formData.adminSecretCode) {
      submitData.append("adminSecretCode", formData.adminSecretCode);
    }

    if (formData.profilePicture) {
      submitData.append("media", formData.profilePicture);
    }

    try {
      const response = await register(submitData).unwrap();

      if (response.success) {
        toast.success(response.message || "Registration successful!");

        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }

        if (response.token) {
          localStorage.setItem("token", response.token);
        }

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      const errorMessage =
        err.data?.message ||
        err.data?.error ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);

      if (err.status === 403 || err.data?.message?.includes("code")) {
        setFormData((prev) => ({ ...prev, adminSecretCode: "" }));
        toast.error("Invalid admin secret code");
      }
    }
  };

  // Modern Design Input Style
  const modernInputStyle = `
    w-full h-12 pl-11 pr-4 rounded-xl transition-all duration-300
    bg-white/50 dark:bg-white/5 
    border border-slate-200 dark:border-white/10
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none
    hover:bg-slate-50/50 dark:hover:bg-white/10
  `;

  const selectedRole = roles.find((r) => r.id === activeRole);

  // Bento Design Render
  const renderBentoDesign = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* 2026 Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-6xl grid lg:grid-cols-12 gap-6"
      >
        {/* Left Column: Branding */}
        <div className="lg:col-span-4 space-y-6">
          <div
            className={`p-8 rounded-[2.5rem] ${selectedRole.gradient.replace("bg-gradient-to-r", "bg-gradient-to-br")} border border-white/20 shadow-2xl relative overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8">
                <selectedRole.icon className="text-white" size={30} />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Join as <br />
                <span className="text-white/80">{selectedRole.label}</span>
              </h1>
              <p className="mt-4 text-white/80 text-sm leading-relaxed">
                {selectedRole.description}
              </p>
            </div>
            <Sparkles
              className="absolute -bottom-4 -right-4 text-white/10"
              size={160}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "AI Tools",
                val: "25+",
                color: "bg-emerald-500/10 text-emerald-500",
              },
              {
                label: "Active",
                val: "50k",
                color: "bg-blue-500/10 text-blue-500",
              },
              {
                label: "Courses",
                val: "200+",
                color: "bg-purple-500/10 text-purple-500",
              },
              {
                label: "Success",
                val: "98%",
                color: "bg-cyan-500/10 text-cyan-500",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-6 rounded-[2rem] border border-white/10 backdrop-blur-md ${stat.color} flex flex-col items-center justify-center`}
              >
                <span className="text-2xl font-bold">{stat.val}</span>
                <span className="text-[10px] uppercase tracking-widest opacity-80">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: The Form */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            className="group/form bg-white/60 dark:bg-white/[0.03] backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-white/40 dark:border-white/10 shadow-2xl relative"
          >
            <div className="flex flex-col md:flex-row gap-10">
              {/* Profile Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group/avatar">
                  <div
                    className={`w-32 h-32 rounded-full ring-4 ${selectedRole.color.split(" ")[0].replace("from-", "ring-")}/20 p-1 ${selectedRole.gradient}`}
                  >
                    <div className="w-full h-full rounded-full bg-slate-200 dark:bg-[#1a1a1a] overflow-hidden">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          className="w-full h-full object-cover"
                          alt="Profile"
                        />
                      ) : (
                        <User className="w-full h-full p-8 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                    <Camera size={16} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                  Profile Identity
                </p>
              </div>

              {/* Form Inputs Grid */}
              <div className="flex-1 grid md:grid-cols-2 gap-6">
                <BentoInputField
                  icon={User}
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Alex Rivera"
                  required
                />

                <BentoInputField
                  icon={Mail}
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="alex@edu.com"
                  required
                />

                <BentoInputField
                  icon={Lock}
                  label="Security Key"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                  required
                />

                <BentoInputField
                  icon={Phone}
                  label="Contact"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  placeholder="+1 ••• ••• ••••"
                />

                {/* Gender Select */}
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-[0.2em] ml-2">
                    Gender •
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full mt-1 pl-4 pr-4 py-4 bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all dark:text-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Admin Secret Code (Conditional) */}
                {showAdminCodeField && (
                  <div className="col-span-2">
                    <BentoInputField
                      icon={Key}
                      label="Admin Secret Code"
                      type="password"
                      name="adminSecretCode"
                      value={formData.adminSecretCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          adminSecretCode: e.target.value,
                        }))
                      }
                      placeholder="Enter admin secret code"
                      required={emailStatus.isAdminEmail}
                    />
                    <p className="text-xs text-yellow-500/80 mt-2 ml-2">
                      Admin email detected. Secret code required.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Email Status Display */}
            {formData.email && emailStatus.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
                  emailStatus.isAdminEmail
                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    : emailStatus.isValid
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {emailStatus.isChecking ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : emailStatus.isAdminEmail ? (
                  <ShieldCheck size={16} />
                ) : emailStatus.isValid ? (
                  <CheckCircle size={16} />
                ) : (
                  <XCircle size={16} />
                )}
                <span>{emailStatus.message}</span>
              </motion.div>
            )}

            {/* Action Area */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10 pt-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Secure, encrypted registration</span>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                disabled={isRegistering || emailStatus.isChecking}
                className={`w-full md:w-auto px-10 py-4 ${selectedRole.gradient} text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isRegistering ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Complete {selectedRole.label} Enrollment{" "}
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );

  // Modern Design Render
  const renderModernDesign = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0a0a0c] dark:to-gray-900 text-slate-900 dark:text-slate-100 transition-colors duration-500">
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

          <div className="hidden md:flex items-center gap-6">
            {/* Design Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-full">
              <button
                onClick={() => setDesignMode("modern")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  designMode === "modern"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layout size={16} />
              </button>
              <button
                onClick={() => setDesignMode("bento")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  designMode === "bento"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Grid size={16} />
              </button>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
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
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Left Side - Role Information & Image */}
          <motion.div variants={itemVariants} className="lg:w-2/5">
            <div className="sticky top-32 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 border border-blue-100 dark:border-blue-500/20">
                <Sparkles size={16} />
                <span>Join as {selectedRole.label}</span>
              </div>

              <div className="mb-6 overflow-hidden rounded-2xl">
                <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden group">
                  <img
                    src={selectedRole.image}
                    alt={selectedRole.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${selectedRole.color} opacity-20`}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-black mb-4">
                Register as{" "}
                <span
                  className={`bg-clip-text text-transparent bg-gradient-to-r ${selectedRole.color}`}
                >
                  {selectedRole.label}
                </span>
              </h2>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {selectedRole.description}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${selectedRole.color.split(" ")[0].replace("from-", "bg-")}/20`}
                  >
                    <Zap
                      size={18}
                      className={`${selectedRole.color.split(" ")[0].replace("from-", "text-")}`}
                    />
                  </div>
                  <span className="font-medium">AI-Powered Learning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${selectedRole.color.split(" ")[0].replace("from-", "bg-")}/20`}
                  >
                    <ShieldCheck
                      size={18}
                      className={`${selectedRole.color.split(" ")[0].replace("from-", "text-")}`}
                    />
                  </div>
                  <span className="font-medium">Secure Platform</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${selectedRole.color.split(" ")[0].replace("from-", "bg-")}/20`}
                  >
                    <CheckCircle
                      size={18}
                      className={`${selectedRole.color.split(" ")[0].replace("from-", "text-")}`}
                    />
                  </div>
                  <span className="font-medium">Verified Accounts</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Registration Form */}
          <motion.div variants={itemVariants} className="lg:w-3/5">
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-xl">
              <header className="text-center mb-8">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                  Create Your Account
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Join thousands already learning on EduLearn
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                          <Camera
                            className="text-slate-400 dark:text-slate-500"
                            size={48}
                          />
                        </div>
                      )}
                    </div>

                    <label
                      htmlFor="profileImage"
                      className="absolute bottom-2 right-2 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera className="text-white" size={18} />
                    </label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {previewImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                    Upload profile picture (Optional)
                  </p>
                </div>

                {/* Full Name */}
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={19}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={modernInputStyle}
                  />
                </div>

                {/* Email with Validation */}
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={19}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleEmailChange}
                    className={modernInputStyle}
                  />

                  {formData.email && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {emailStatus.isChecking ? (
                        <Loader2
                          size={18}
                          className="animate-spin text-slate-400"
                        />
                      ) : emailStatus.isAdminEmail ? (
                        <ShieldCheck size={18} className="text-yellow-500" />
                      ) : emailStatus.isValid ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <XCircle size={18} className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Email Status Message */}
                {formData.email && emailStatus.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm px-4 py-3 rounded-xl flex items-start gap-2 ${
                      emailStatus.isAdminEmail
                        ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20"
                        : emailStatus.isValid
                          ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                          : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                    }`}
                  >
                    {emailStatus.isAdminEmail && (
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    )}
                    <span>{emailStatus.message}</span>
                  </motion.div>
                )}

                {/* Admin Secret Code Field */}
                {showAdminCodeField && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <div className="relative group">
                      <Key
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500"
                        size={19}
                      />
                      <input
                        type="password"
                        required={emailStatus.isAdminEmail}
                        placeholder="Enter Admin Secret Code"
                        value={formData.adminSecretCode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            adminSecretCode: e.target.value,
                          }))
                        }
                        className={`${modernInputStyle} border-yellow-500/30 focus:ring-yellow-500`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                        Required
                      </div>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 ml-1">
                      Only admins have this code. Contact system administrator
                      if needed.
                    </p>
                  </motion.div>
                )}

                {/* Phone Number */}
                <div className="relative group">
                  <Smartphone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={19}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className={modernInputStyle}
                  />
                </div>

                {/* Password */}
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={19}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className={modernInputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Gender Selection */}
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={19}
                  />
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className={`${modernInputStyle} appearance-none cursor-pointer`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isRegistering ||
                    emailStatus.isChecking ||
                    (emailStatus.isAdminEmail &&
                      !formData.adminSecretCode.trim())
                  }
                  className={`w-full h-14 mt-6 ${selectedRole.gradient} text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isRegistering ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {emailStatus.isAdminEmail
                        ? "Register as Admin"
                        : "Create Account"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );

  return designMode === "bento" ? renderBentoDesign() : renderModernDesign();
};

export default Register;
