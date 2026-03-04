// src/components/StudentForm.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  ArrowRight,
  Mail,
  Lock,
  GraduationCap,
  Phone,
  School,
  Sparkles,
  ChevronRight,
  Globe,
  Hash,
  CheckCircle,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";
import { usePostUserAsStudentMutation } from "../store/api/LoginUserApi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGetAllStandardsForStudentsQuery } from "../store/api/StandardSubjectApi";

const StudentMySelf = ({ onLogin, onRegisterSuccess }) => {
  const [registerAsStudent, { isLoading, error: apiError }] =
    usePostUserAsStudentMutation();
  const { data: standardsData, isLoading: isLoadingStandard } =
    useGetAllStandardsForStudentsQuery();

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    medium: "", // This will store the medium string (english/malayalam)
    standardId: "", // This will store the ObjectId
    schoolName: "",
    std: "", // This stores the standard number (6,7,8 etc)
    rollNumber: "",
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [availableMediums, setAvailableMediums] = useState([]);
  const [groupedStandards, setGroupedStandards] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (standardsData?.data) {
      const grouped = standardsData.data.reduce((acc, item) => {
        const stdNum = item.standard;
        if (!acc[stdNum]) {
          acc[stdNum] = { standard: stdNum, mediums: [] };
        }
        acc[stdNum].mediums.push({
          id: item._id,
          medium: item.medium,
          standard: item.standard,
        });
        return acc;
      }, {});
      setGroupedStandards(grouped);

      if (formData.std && grouped[formData.std]) {
        setAvailableMediums(grouped[formData.std].mediums);
      }
    }
  }, [standardsData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "std") {
      setFormData({
        ...formData,
        std: value,
        medium: "",
        standardId: "",
      });

      if (value && groupedStandards[value]) {
        setAvailableMediums(groupedStandards[value].mediums);
      } else {
        setAvailableMediums([]);
      }
    } else if (name === "medium") {
      // Find the selected medium object from availableMediums
      const selectedMedium = availableMediums.find((m) => m.id === value);

      setFormData({
        ...formData,
        medium: selectedMedium?.medium || "", // Store the medium string
        standardId: selectedMedium?.id || "", // Store the ObjectId
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = "Full name is required";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.std) {
      errors.std = "Please select your class";
    }

    if (!formData.standardId) {
      errors.medium = "Please select your medium";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare the payload as per backend requirements
      const studentData = {
        name: formData.name?.trim(),
        email: formData.email?.trim(),
        password: formData.password,
        phone: formData.phone?.trim() || "",
        schoolName: formData.schoolName?.trim() || "",
        rollNumber: formData.rollNumber?.trim() || "",
        standardId: formData.standardId, // ObjectId from the selected medium
        medium: formData.medium, // "english" or "malayalam"
      };

      console.log(
        "Sending payload to API:",
        JSON.stringify(studentData, null, 2),
      );

      const response = await registerAsStudent(studentData).unwrap();

      console.log("Registration successful:", response);

      setSuccessMessage("Registration successful! Redirecting...");

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        medium: "",
        standardId: "",
        schoolName: "",
        std: "",
        rollNumber: "",
      });

      if (onRegisterSuccess) onRegisterSuccess(response);

      setTimeout(() => {
        navigate("/");
        if (onLogin) {
          onLogin({
            ...response,
            joinDate: new Date().toLocaleDateString(),
          });
        }
      }, 2000);
    } catch (err) {
      console.error("Registration error - Full error object:", err);

      // Log the detailed error response
      if (err.data) {
        console.error("Error data:", JSON.stringify(err.data, null, 2));
        console.error("Error status:", err.status);
        console.error("Error message:", err.data.message);
      }

      // Set user-friendly error message
      if (err.data?.message) {
        setError(err.data.message);
      } else if (err.status === 409) {
        setError("Email already registered. Please use a different email.");
      } else if (err.status === 400) {
        setError("Invalid data. Please check your information.");
      } else if (err.status === 500) {
        setError("Server error. Please try again later or contact support.");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  const uniqueStandards = standardsData?.data
    ? [...new Set(standardsData.data.map((item) => item.standard))].sort(
        (a, b) => a - b,
      )
    : [];

  // Theme-based classes
  const themeClasses = {
    background: isDark
      ? "bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950"
      : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
    cardBg: isDark
      ? "bg-white/5 backdrop-blur-2xl border-white/10"
      : "bg-white/70 backdrop-blur-2xl border-black/5",
    text: isDark ? "text-white" : "text-slate-900",
    textMuted: isDark ? "text-white/40" : "text-slate-600",
    textWhite: isDark ? "text-white" : "text-slate-900",
    inputBg: isDark
      ? "bg-white/5 border-white/10"
      : "bg-black/5 border-black/10",
    inputText: isDark ? "text-white" : "text-slate-900",
    placeholder: isDark
      ? "placeholder:text-white/20"
      : "placeholder:text-slate-400",
    iconColor: isDark ? "text-white/30" : "text-slate-500",
    border: isDark ? "border-white/10" : "border-black/10",
    hover: isDark ? "hover:border-white/30" : "hover:border-black/30",
    focus: isDark ? "focus:border-indigo-500" : "focus:border-indigo-600",
    errorBorder: isDark ? "border-red-500/50" : "border-red-500",
    errorText: isDark ? "text-red-400" : "text-red-600",
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-500 ${themeClasses.background} flex items-center justify-center p-4 md:p-8 relative overflow-x-hidden`}
    >
      {/* Theme Toggle */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 z-50 p-4 rounded-2xl backdrop-blur-xl ${
          isDark ? "bg-white/10 border-white/20" : "bg-black/5 border-black/10"
        } border shadow-2xl`}
      >
        {isDark ? (
          <Sun className="w-6 h-6 text-yellow-400" />
        ) : (
          <Moon className="w-6 h-6 text-indigo-600" />
        )}
      </motion.button>

      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute top-0 -left-20 w-96 h-96 ${
            isDark ? "bg-purple-600" : "bg-indigo-300"
          } rounded-full mix-blend-multiply filter blur-[120px] opacity-30`}
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute bottom-0 -right-20 w-96 h-96 ${
            isDark ? "bg-blue-600" : "bg-pink-300"
          } rounded-full mix-blend-multiply filter blur-[120px] opacity-30`}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              whileHover={{ rotate: 360 }}
              className={`inline-block p-6 rounded-3xl backdrop-blur-xl ${themeClasses.cardBg} mb-6 shadow-2xl relative group cursor-pointer`}
            >
              <GraduationCap
                className={`w-16 h-16 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute -top-2 -right-2 w-4 h-4 ${
                  isDark ? "bg-green-400" : "bg-green-500"
                } rounded-full border-2 border-white`}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-5xl md:text-7xl font-black mb-4 tracking-tighter ${
                isDark
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900"
              }`}
            >
              Join the Future.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-lg md:text-xl ${themeClasses.textMuted} max-w-2xl mx-auto`}
            >
              Experience education reimagined for 2026 and beyond
            </motion.p>
          </div>

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`backdrop-blur-2xl ${themeClasses.cardBg} border rounded-[3rem] shadow-2xl overflow-hidden relative group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-[3rem] blur-xl" />

            <form
              onSubmit={handleSubmit}
              className={`relative p-8 md:p-12 space-y-12 ${themeClasses.textWhite}`}
            >
              {/* Personal Information Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="sticky top-4"
                  >
                    <h2
                      className={`text-3xl font-bold mb-2 flex items-center gap-3 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <User
                        className={
                          isDark ? "text-indigo-400" : "text-indigo-600"
                        }
                      />
                      Identity
                    </h2>
                    <p
                      className={`${themeClasses.textMuted} text-lg leading-relaxed`}
                    >
                      Your basic account credentials and contact details.
                    </p>
                  </motion.div>
                </div>

                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputBlock
                      icon={<User />}
                      label="Full Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      disabled={isLoading}
                      themeClasses={themeClasses}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      isFocused={focusedField === "name"}
                      error={validationErrors.name}
                      required
                    />
                    <InputBlock
                      icon={<Mail />}
                      label="Email *"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@edu.com"
                      disabled={isLoading}
                      themeClasses={themeClasses}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      isFocused={focusedField === "email"}
                      error={validationErrors.email}
                      required
                    />
                    <InputBlock
                      icon={<Lock />}
                      label="Password *"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={isLoading}
                      themeClasses={themeClasses}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      isFocused={focusedField === "password"}
                      error={validationErrors.password}
                      required
                    />
                    <InputBlock
                      icon={<Phone />}
                      label="Phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                      disabled={isLoading}
                      themeClasses={themeClasses}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      isFocused={focusedField === "phone"}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <motion.hr
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8 }}
                className={`border-0 h-px ${isDark ? "bg-gradient-to-r from-transparent via-white/20 to-transparent" : "bg-gradient-to-r from-transparent via-black/20 to-transparent"}`}
              />

              {/* Academic Information Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <h2
                      className={`text-3xl font-bold mb-2 flex items-center gap-3 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <School
                        className={
                          isDark ? "text-purple-400" : "text-purple-600"
                        }
                      />
                      Education
                    </h2>
                    <p
                      className={`${themeClasses.textMuted} text-lg leading-relaxed`}
                    >
                      Your academic information.
                    </p>
                  </motion.div>
                </div>

                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <InputBlock
                        icon={<School />}
                        label="School Name"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        placeholder="Global International School"
                        disabled={isLoading}
                        themeClasses={themeClasses}
                        onFocus={() => setFocusedField("school")}
                        onBlur={() => setFocusedField(null)}
                        isFocused={focusedField === "school"}
                      />
                    </div>

                    {/* Class Select */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="space-y-3"
                    >
                      <label
                        className={`text-xs font-bold uppercase tracking-wider ml-2 ${themeClasses.textMuted}`}
                      >
                        Class/Standard *
                      </label>
                      <div className="relative">
                        <select
                          name="std"
                          value={formData.std}
                          onChange={handleChange}
                          className={`w-full pl-5 pr-12 py-5 ${themeClasses.inputBg} ${
                            validationErrors.std
                              ? themeClasses.errorBorder
                              : themeClasses.border
                          } rounded-2xl ${themeClasses.inputText} appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-base`}
                          disabled={isLoading || isLoadingStandard}
                          required
                        >
                          <option
                            value=""
                            className={isDark ? "bg-slate-900" : "bg-white"}
                          >
                            {isLoadingStandard
                              ? "Loading..."
                              : "Select your class"}
                          </option>
                          {uniqueStandards.map((std) => (
                            <option
                              key={std}
                              value={std}
                              className={isDark ? "bg-slate-900" : "bg-white"}
                            >
                              Class {std}
                            </option>
                          ))}
                        </select>
                        <ChevronRight
                          className={`absolute right-5 top-1/2 -translate-y-1/2 rotate-90 w-5 h-5 ${themeClasses.iconColor}`}
                        />
                      </div>
                      {validationErrors.std && (
                        <p
                          className={`text-xs mt-1 ml-2 ${themeClasses.errorText}`}
                        >
                          {validationErrors.std}
                        </p>
                      )}
                    </motion.div>

                    {/* Medium Select */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="space-y-3"
                    >
                      <label
                        className={`text-xs font-bold uppercase tracking-wider ml-2 ${themeClasses.textMuted}`}
                      >
                        Medium of Instruction *
                      </label>
                      <div className="relative">
                        <select
                          name="medium"
                          value={formData.standardId} // Using standardId as the select value
                          onChange={handleChange}
                          disabled={!formData.std || isLoading}
                          className={`w-full pl-5 pr-12 py-5 ${themeClasses.inputBg} ${
                            validationErrors.medium
                              ? themeClasses.errorBorder
                              : themeClasses.border
                          } rounded-2xl ${themeClasses.inputText} appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all outline-none disabled:opacity-30 disabled:cursor-not-allowed text-base`}
                          required
                        >
                          <option
                            value=""
                            className={isDark ? "bg-slate-900" : "bg-white"}
                          >
                            {!formData.std
                              ? "Select class first"
                              : "Select medium"}
                          </option>
                          {availableMediums.map((m) => (
                            <option
                              key={m.id}
                              value={m.id} // Store the ID as value
                              className={isDark ? "bg-slate-900" : "bg-white"}
                            >
                              {m.medium.charAt(0).toUpperCase() +
                                m.medium.slice(1)}
                            </option>
                          ))}
                        </select>
                        <Globe
                          className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.iconColor}`}
                        />
                      </div>
                      {validationErrors.medium && (
                        <p
                          className={`text-xs mt-1 ml-2 ${themeClasses.errorText}`}
                        >
                          {validationErrors.medium}
                        </p>
                      )}
                    </motion.div>

                    {/* Roll Number */}
                    <div className="md:col-span-2">
                      <InputBlock
                        icon={<Hash />}
                        label="Roll Number"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        placeholder="Enter your roll number"
                        disabled={isLoading}
                        themeClasses={themeClasses}
                        onFocus={() => setFocusedField("roll")}
                        onBlur={() => setFocusedField(null)}
                        isFocused={focusedField === "roll"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`p-5 rounded-2xl ${
                      isDark
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-red-100 border-red-200 text-red-600"
                    } border text-center font-medium`}
                  >
                    {error}
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`p-5 rounded-2xl ${
                      isDark
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-green-100 border-green-200 text-green-600"
                    } border text-center font-medium`}
                  >
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full group relative flex items-center justify-center gap-4 py-6 rounded-2xl font-bold text-xl shadow-2xl transition-all disabled:opacity-50 overflow-hidden ${
                  isDark
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                }`}
              >
                <motion.div
                  animate={{
                    x: ["0%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                />

                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Create Account</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </motion.button>

              {/* Terms notice */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className={`text-center text-sm ${themeClasses.textMuted}`}
              >
                By creating an account, you agree to our Terms of Service and
                Privacy Policy.
              </motion.p>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Enhanced InputBlock component with error handling
const InputBlock = ({
  icon,
  label,
  themeClasses,
  isFocused,
  error,
  ...props
}) => (
  <motion.div whileHover={{ scale: 1.02 }} className="space-y-3">
    <label
      className={`text-xs font-bold uppercase tracking-wider ml-2 ${themeClasses.textMuted}`}
    >
      {label}
    </label>
    <div className="relative">
      <motion.div
        animate={isFocused ? { scale: 1.1, color: "#6366f1" } : { scale: 1 }}
        className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
          isFocused ? "text-indigo-500" : themeClasses.iconColor
        }`}
      >
        {React.cloneElement(icon, { size: 20 })}
      </motion.div>
      <input
        {...props}
        className={`w-full pl-14 pr-5 py-5 ${themeClasses.inputBg} ${
          error ? themeClasses.errorBorder : themeClasses.border
        } rounded-2xl ${themeClasses.inputText} ${themeClasses.placeholder} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-base disabled:opacity-50 disabled:cursor-not-allowed`}
      />

      {isFocused && (
        <motion.div
          layoutId="focus-indicator"
          className="absolute inset-0 rounded-2xl border-2 border-indigo-500 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </div>
    {error && (
      <p className={`text-xs mt-1 ml-2 ${themeClasses.errorText}`}>{error}</p>
    )}
  </motion.div>
);

export default StudentMySelf;
