import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun } from "lucide-react";
import AccountingSideBarMobile from "./AdminMobileSideBar";

function AdminTopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else if (systemPrefersDark) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
      localStorage.setItem("theme", "dark");
    }
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setMenuOpen((prev) => !prev);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative md:hidden">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        {/* Menu Button - Left side */}
        <button
          className="text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          onClick={toggleSidebar}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Theme Toggle - Right side */}
        <button
          onClick={toggleDarkMode}
          className="ml-auto p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar (Only renders when open) */}
      {menuOpen && (
        <AccountingSideBarMobile
          isSidebarOpen={menuOpen}
          toggleSidebar={toggleSidebar}
        />
      )}
    </div>
  );
}

export default AdminTopBar;
