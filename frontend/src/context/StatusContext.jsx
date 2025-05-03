import React, { createContext, useState, useEffect, useContext } from "react";
import { getCurrentStatus } from "../api/status";

const StatusContext = createContext(null);

export const StatusProvider = ({ children }) => {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);

    try {
      const status = await getCurrentStatus();
      setCurrentStatus(status);
      setError(null);
    } catch (err) {
      console.error("Error fetching status:", err);
      setError("Failed to fetch driver status");
    } finally {
      setLoading(false);
    }
  };

  // Fetch status on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchStatus();

    // Poll for status updates every 60 seconds
    const interval = setInterval(fetchStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    currentStatus,
    loading,
    error,
    refreshStatus: fetchStatus,
  };

  return (
    <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
  );
};

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error("useStatus must be used within a StatusProvider");
  }
  return context;
};

// import React, { createContext, useState, useEffect, useContext } from "react";
// import { getCurrentStatus } from "../../api/status";

// const StatusContext = createContext(null);

// export const StatusProvider = ({ children }) => {
//   const [currentStatus, setCurrentStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchStatus = async () => {
//     setLoading(true);

//     try {
//       const status = await getCurrentStatus();
//       setCurrentStatus(status);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching status:", err);
//       setError("Failed to fetch driver status");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch status on mount
//   useEffect(() => {
//     fetchStatus();

//     // Poll for status updates every 60 seconds
//     const interval = setInterval(fetchStatus, 60000);

//     return () => clearInterval(interval);
//   }, []);

//   const value = {
//     currentStatus,
//     loading,
//     error,
//     refreshStatus: fetchStatus,
//   };

//   return (
//     <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
//   );
// };

// export const useStatus = () => {
//   const context = useContext(StatusContext);
//   if (!context) {
//     throw new Error("useStatus must be used within a StatusProvider");
//   }
//   return context;
// };
