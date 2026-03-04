import { Outlet } from "react-router-dom";
import { useTheme } from "next-themes";

import QuizSidebar from "./StudentSideBar";
import QuizeSideBarMobile from "./StudentSideBarMobile";
import QuizTopBar from "./StudentTopBar";

const StudentLayout = ({ isSidebarOpen, toggleSidebar }) => {
  const { theme } = useTheme();

  return (
    <div className="w-full h-screen md:flex overflow-hidden">
      {/* Top bar */}
      <QuizTopBar />

      {/* Mobile sidebar */}
      <QuizeSideBarMobile
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Desktop sidebar */}
      <QuizSidebar />

      {/* Main content area – NO SCROLL HERE */}
      <section
        className={`flex flex-1 overflow-hidden ${
          theme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-[#EEEEEE] text-black"
        }`}
      >
        <Outlet />
      </section>
    </div>
  );
};

export default StudentLayout;

// import { Outlet, Navigate } from "react-router-dom";

// import { useTheme } from "next-themes"; // Using next-themes' useTheme hook

// import QuizSidebar from "./StudentSideBar";
// import QuizeSideBarMobile from "./StudentSideBarMobile";
// import QuizTopBar from "./StudentTopBar";
// const StudentLayout = ({ isSidebarOpen, toggleSidebar }) => {
//   const { theme, setTheme } = useTheme(); // Now using next-themes' useTheme

//   return (
//     <div className="w-full md:flex">
//       <QuizTopBar />
//       <QuizeSideBarMobile
//         isSidebarOpen={isSidebarOpen}
//         toggleSidebar={toggleSidebar}
//       />
//       <QuizSidebar />
//       <section
//         className={`flex flex-1 h-full ${
//           theme === "dark"
//             ? "bg-gray-800 text-white border border-white "
//             : "bg-[#EEEEEE] text-black"
//         }`}
//       >
//         <Outlet />
//       </section>
//       {/* <Bottombar /> */}
//     </div>
//   );
// };

// export default StudentLayout;
