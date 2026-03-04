import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../common/AuthContext";
import { getSidebarLinksMobiles } from "./studentIndex";
import ModernLoader from "../../common/ModernLoader";
import TrendingButton from "../../common/TrendingButton";
import { useSocket } from "../../common/Socket";

const StudentSideBar = ({ refetchok, ippolLoginCheythaUser }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  console.log("isAuthenticateduser", user?.user);
  const { socket } = useSocket() || {};

  // Modal States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const sidebarLinks = getSidebarLinksMobiles();

  const handleLogout = async (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  // Dark mode toggle handler
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

  // Check system preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
      }
    }
  }, []);

  // Modal Handlers
  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);
  const openNotificationModal = () => setIsNotificationModalOpen(true);
  const closeNotificationModal = () => setIsNotificationModalOpen(false);
  const openGroupModal = () => setIsGroupModalOpen(true);
  const closeGroupModal = () => setIsGroupModalOpen(false);

  // Notification Logic
  const [updatedNotifications, setUpdatedNotifications] = useState([]);
  const notificationCount = updatedNotifications?.length || 0;

  useEffect(() => {
    if (socket) {
      socket.on("newFriendRequest", (newRequest) => {
        setUpdatedNotifications((prev) =>
          prev.some((r) => r.senderId === newRequest.senderId)
            ? prev
            : [...prev, newRequest],
        );
      });
      return () => {
        socket.off("newFriendRequest");
      };
    }
  }, [socket]);

  return (
    <nav className="hidden md:flex flex-col min-w-[280px] h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#09090b] transition-colors duration-300">
      {/* === FIXED HEADER SECTION - Never scrolls === */}
      <div className="flex-shrink-0 px-6 py-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#09090b]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            AppLogo
          </h2>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* === SCROLLABLE MIDDLE SECTION - User profile + Navigation links === */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
        {/* User Profile Section */}
        {!isAuthenticated ? (
          <div className="flex justify-center p-4 mb-4">
            <ModernLoader />
          </div>
        ) : (
          <Link
            to={`/profile/${user?._id}`}
            className="flex gap-3 items-center p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all mb-6"
          >
            <img
              src={
                user?.user?.media?.[0]?.url ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="profile"
              className="h-12 w-12 rounded-full ring-2 ring-indigo-500/20 shadow-sm"
            />
            <div className="flex flex-col overflow-hidden">
              <p className="font-bold truncate text-slate-900 dark:text-slate-100">
                {user?.user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                @{user?.username}
              </p>
            </div>
          </Link>
        )}

        {/* Navigation Links */}
        <ul className="flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.route;
            const IconComponent = link.icon;

            return (
              <li key={link.label}>
                <div
                  onClick={() => {
                    if (link.label === "Search") openSearchModal();
                    else if (link.label === "Notifications")
                      openNotificationModal();
                    else if (link.label === "Group") openGroupModal();
                    else navigate(link.route);
                  }}
                  className={`
                    flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all relative group
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }
                  `}
                >
                  <IconComponent
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : ""}`}
                  />
                  <span className="font-medium truncate">{link.label}</span>

                  {link.label === "Notifications" && notificationCount > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* === FIXED FOOTER SECTION - Never scrolls === */}
      <div className="flex-shrink-0 px-6 py-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#09090b]">
        <TrendingButton
          onClick={handleLogout}
          className="w-full justify-start gap-3"
        >
          <img
            src="/assets/icons/logout.svg"
            alt="logout"
            className="w-5 h-5 brightness-0 invert"
          />
          <span>Logout</span>
        </TrendingButton>
      </div>

      {/* Modals */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50">
          <p>Search Modal Here</p>
        </div>
      )}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50">
          <p>Group Modal Here</p>
        </div>
      )}
    </nav>
  );
};

export default StudentSideBar;
