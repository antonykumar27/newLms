import React, { useState, useContext, useEffect } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { useLoginUserMutation } from "../store/api/LoginUserApi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../common/AuthContext";
import { toast } from "react-toastify";

const LoginForm = () => {
  const { login: setAuthTrue } = useContext(AuthContext);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // --- LOGIC: Redirect & Messages ---
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("registered") === "true") {
      toast.success(
        queryParams.get("message") || "Account created successfully!",
      );
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const storeAuthData = (userData, token) => {
    const authData = {
      user: { ...userData },
      token: token,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("auth", JSON.stringify(authData));
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    return authData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await loginUser(formData).unwrap();
      if (response.success) {
        const authData = storeAuthData(response.user, response.token);
        setAuthTrue(authData);

        toast.success("Message copied to clipboard");

        setTimeout(() => {
          const user = response?.user;

          if (!user) return;

          if (user.role === "admin") {
            navigate("/adminDetails");
          } else if (user.role === "teacher" || user.wishTo === "teacher") {
            navigate("/teacherDetails");
          } else {
            navigate("/studentDetails");
          }
        }, 1000);
      }
    } catch (err) {
      const msg =
        err.data?.message || "Login failed. Please check credentials.";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div
      className={`${isDark ? "dark" : ""} min-h-screen transition-all duration-700`}
    >
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* 2026 Background FX */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-[120px] animate-pulse [animation-delay:2s]" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="fixed top-6 right-6 z-50 p-3 bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/20 rounded-full hover:scale-110 transition-transform shadow-xl"
        >
          {isDark ? (
            <Sun className="text-yellow-400" size={18} />
          ) : (
            <Moon className="text-indigo-600" size={18} />
          )}
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-[440px]"
        >
          {/* Main Card */}
          <div className="bg-white/70 dark:bg-white/[0.02] backdrop-blur-[40px] p-8 md:p-10 rounded-[3rem] border border-white dark:border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden">
            {/* Glossy Header Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] shadow-2xl shadow-indigo-500/40 mb-6 relative group">
                <ShieldCheck className="text-white relative z-10" size={38} />
                <div className="absolute inset-0 bg-white/20 rounded-[2rem] scale-0 group-hover:scale-100 transition-transform duration-500" />
              </div>
              <h2 className="text-3xl font-black tracking-tight dark:text-white">
                Hello <span className="text-indigo-500">Again.</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Enter your credentials to access your portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="group space-y-1.5">
                <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] ml-2">
                  Digital ID
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-white/5 border border-white dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all dark:text-white placeholder:text-gray-400/50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group space-y-1.5">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">
                    Security Key
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-[10px] font-bold text-gray-400 hover:text-indigo-500 transition-colors uppercase"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-white/5 border border-white dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all dark:text-white placeholder:text-gray-400/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Actions */}
              <div className="pt-4 space-y-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Sign In <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      email: "demo@edulearn.com",
                      password: "demopassword123",
                    })
                  }
                  className="w-full py-3 bg-white/50 dark:bg-white/5 border border-white dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Quick Demo Access
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-10 pt-8 border-t border-white dark:border-white/10 text-center">
              <p className="text-xs text-gray-500 font-medium">
                Not a member yet?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-indigo-500 font-bold hover:underline ml-1"
                >
                  Create Identity
                </button>
              </p>
            </div>

            {/* Subtle decorative sparkles */}
            <Sparkles
              className="absolute -top-4 -right-4 text-indigo-500/10 pointer-events-none"
              size={100}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;
