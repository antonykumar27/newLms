import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../common/AuthContext";
import { getSidebarLinksMobiles } from "./TeacherIndex";
import ModernLoader from "../common/ModernLoader";
import TrendingButton from "../common/TrendingButton";
import { useSocket } from "../common/Socket";
import { useRefreshTokenMutation } from "../store/api/AdminCourseRelatedDecision";
const TeacherSidebar = ({ refetchok, ippolLoginCheythaUser }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { socket } = useSocket() || {};
  const [refreshToken, { isLoading: rejecting }] = useRefreshTokenMutation();
  // Modal States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const sidebarLinks = getSidebarLinksMobiles();
  // TeacherSidebar.js - Add this useEffect
  useEffect(() => {
    if (!socket || !user?._id) return;

    console.log("🔌 Setting up socket listeners for user:", user._id);

    // Listen for APPROVAL_SUCCESS event
    const handleApprovalSuccess = async (data) => {
      console.log("✅ APPROVAL_SUCCESS event:", data);

      // Check if this event is for current user
      if (data.metadata?.userId === user._id) {
        console.log("🔄 Teacher approved! Refreshing token...");

        try {
          // 1. Refresh token
          const result = await refreshToken().unwrap();

          if (result.success) {
            console.log("✅ Token refreshed, new user:", result.user);

            // 2. Show success message
            alert(
              `🎉 ${data.notification?.title}\n${data.notification?.message}`,
            );

            // 3. Option A: Update AuthContext if you have updateUser function
            if (updateUser) {
              updateUser(result.user);
              alert("Your role has been updated to Teacher!");
            }
            // Option B: Reload page
            else {
              alert("Role updated! Page will reload...");
              setTimeout(() => window.location.reload(), 1000);
            }
          }
        } catch (error) {
          console.error("❌ Token refresh failed:", error);
          alert("Please logout and login again to see changes");
        }
      }
    };

    // Register the listener
    socket.on("APPROVAL_SUCCESS", handleApprovalSuccess);

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("APPROVAL_SUCCESS", handleApprovalSuccess);
    };
  }, [socket, user, refreshToken, updateUser]);
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
    <nav className="hidden md:flex px-6 py-0 flex-col justify-between min-w-[280px] h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#09090b] transition-colors duration-300">
      {/* Fixed Top Header Section */}
      <div className="flex-shrink-0 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            AppLogo
          </h2>

          {/* Simple Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              // Sun icon for dark mode (click to switch to light)
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
              // Moon icon for light mode (click to switch to dark)
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
        {console.log("user", user.user)}
        {/* User Profile Section */}
        {!isAuthenticated ? (
          <div className="flex justify-center p-4">
            <ModernLoader />
          </div>
        ) : (
          <Link
            to={`/profile/${user?._id}`}
            className="flex gap-3 items-center p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all mt-4"
          >
            <img
              src={
                user.user.media[0]?.url ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="profile"
              className="h-12 w-12 rounded-full ring-2 ring-indigo-500/20 shadow-sm"
            />
            <div className="flex flex-col overflow-hidden">
              <p className="font-bold truncate text-slate-900 dark:text-slate-100">
                {user.user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                @{user.user?.username}
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* Scrollable Navigation Links Section */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <ul className="flex flex-col gap-2">
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
                    className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                  />
                  <span className="font-medium">{link.label}</span>

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

      {/* Fixed Footer / Logout Section */}
      <div className="flex-shrink-0 pb-6 pt-4 border-t border-slate-200 dark:border-slate-800">
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

export default TeacherSidebar;
