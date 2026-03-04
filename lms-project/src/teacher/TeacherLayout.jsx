import { Outlet, Navigate } from "react-router-dom";

import { useTheme } from "next-themes"; // Using next-themes' useTheme hook

import QuizSidebar from "./TeacherSidebar";
import QuizeSideBarMobile from "./TeacherSideBarMobile";
import QuizTopBar from "./TeacherTopBar";
const TeacherLayout = ({ isSidebarOpen, toggleSidebar }) => {
  const { theme, setTheme } = useTheme(); // Now using next-themes' useTheme

  return (
    <div className="w-full md:flex">
      <QuizTopBar />
      <QuizeSideBarMobile
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <QuizSidebar />
      <section
        className={`flex flex-1 h-full ${
          theme === "dark"
            ? "bg-gray-800 text-white border border-white "
            : "bg-[#EEEEEE] text-black"
        }`}
      >
        <Outlet />
      </section>
      {/* <Bottombar /> */}
    </div>
  );
};

export default TeacherLayout;
