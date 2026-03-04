import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../common/AuthContext";
import { getSidebarLinksMobiles } from "./TeacherIndex";
import { useTheme } from "next-themes";
import { BarChart2, X, LogOut, ChevronDown, ChevronUp } from "lucide-react";

const TeacherSideBarMobile = ({ isSidebarOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarLinks = getSidebarLinksMobiles();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => setMounted(true), []);

  const handleNavigation = (path) => {
    navigate(path);
    toggleSidebar();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleDropdown = (label) => {
    setActiveDropdown((prev) => (prev === label ? null : label));
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const dropdownVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3 },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const mobileHeight = `calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))`;

  return (
    <>
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <motion.div
        initial="closed"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "tween", ease: "easeInOut" }}
        style={{ height: mobileHeight }}
        className={`fixed top-0 bottom-0 left-0 w-64 ${
          mounted && resolvedTheme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-white text-gray-900"
        } shadow-xl z-50 flex flex-col`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b ${
            mounted && resolvedTheme === "dark"
              ? "border-gray-700"
              : "border-gray-200"
          } flex-shrink-0 flex justify-between items-center`}
        >
          <h2 className="text-xl font-semibold">Menu</h2>
          <button
            onClick={toggleSidebar}
            className={`p-1 rounded-full ${
              mounted && resolvedTheme === "dark"
                ? "hover:bg-gray-700"
                : "hover:bg-gray-100"
            } transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 custom-scrollbar overflow-y-auto py-2 px-4 space-y-1">
          {sidebarLinks.map((link) => (
            <div key={link.route || link.label}>
              {link.children ? (
                <>
                  <div
                    onClick={() => toggleDropdown(link.label)}
                    className={`flex items-center justify-between gap-3 p-3 rounded-md ${
                      mounted && resolvedTheme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                    } cursor-pointer transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </div>
                    {activeDropdown === link.label ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>

                  <motion.div
                    className="ml-6 flex flex-col space-y-2 overflow-hidden"
                    variants={dropdownVariants}
                    initial="closed"
                    animate={activeDropdown === link.label ? "open" : "closed"}
                  >
                    {link.children.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={toggleSidebar}
                        className={`text-sm py-1 px-2 rounded ${
                          mounted && resolvedTheme === "dark"
                            ? "hover:bg-gray-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </motion.div>
                </>
              ) : (
                <div
                  onClick={() => handleNavigation(link.route)}
                  className={`flex items-center gap-3 p-3 rounded-md ${
                    mounted && resolvedTheme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  } cursor-pointer transition-colors`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{link.label}</span>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={`p-4 border-t ${
            mounted && resolvedTheme === "dark"
              ? "border-gray-700"
              : "border-gray-200"
          } flex-shrink-0`}
        >
          <div
            onClick={handleLogout}
            className={`flex items-center gap-3 p-3 rounded-md mb-10 ${
              mounted && resolvedTheme === "dark"
                ? "hover:bg-gray-700"
                : "hover:bg-gray-100"
            } cursor-pointer transition-colors`}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default TeacherSideBarMobile;
