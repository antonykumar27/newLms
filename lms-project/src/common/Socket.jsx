// import { createContext, useContext, useEffect, useState } from "react";
// import io from "socket.io-client";
// import { useAuth } from "../common/AuthContext"; // ✅ adjust path

// const SocketContext = createContext();

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }) => {
//   const auth = useAuth();
//   const [socket, setSocket] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);

//   const user = auth?.user;
//   const loading = auth?.loading;

//   useEffect(() => {
//     if (!user?._id) return;

//     const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
//       auth: { userId: user._id },
//     });

//     setSocket(socketConnection);

//     // 🔥 EMIT JOIN
//     socketConnection.emit("join", {
//       id: user._id,
//       name: user.name,
//     });

//     // ✅ Listen for online users
//     socketConnection.on("getOnlineUsers", (users) => {
//       setOnlineUsers(users);
//     });

//     return () => {
//       socketConnection.disconnect();
//     };
//   }, [user?._id]);

//   // Safely handle cases before auth is ready
//   if (!auth) {
//     console.warn(
//       "⚠️ useAuth() returned undefined. Is AuthProvider wrapping SocketProvider?",
//     );
//     return <div>Loading context...</div>;
//   }

//   if (loading) return <div>Loading...</div>;

//   return (
//     <SocketContext.Provider value={{ socket, onlineUsers }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../common/AuthContext";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, loading } = useAuth() || {};
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user?._id || socketRef.current) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5, // 🔥 stop infinite reconnect
      auth: {
        userId: user._id,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", {
        id: user._id,
        name: user.name,
      });
    });

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });

    return () => {
      console.log("❌ Cleaning up socket");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

  if (loading) return null;

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
