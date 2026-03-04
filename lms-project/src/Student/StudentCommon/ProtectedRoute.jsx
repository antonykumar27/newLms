import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../common/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth(); // Authentication context
  console.log("isAuthenticated", isAuthenticated);
  // Check if the auth context is still loading
  if (authLoading) {
    return <div>Loading...</div>; // Show a loading spinner or message until auth and RTK query are ready
  }

  // If there is an error with RTK query or auth, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // If authenticated, render the children (protected content)
  return children;
};

export default ProtectedRoute;
