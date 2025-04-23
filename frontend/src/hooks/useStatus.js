import { useState, useEffect } from "react";
import { getCurrentStatus, updateDriverStatus } from "../api/status";

export const useDriverStatus = (pollInterval = 60000) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current status
  const fetchStatus = async () => {
    setLoading(true);

    try {
      const statusData = await getCurrentStatus();
      setStatus(statusData);
      setError(null);
      return statusData;
    } catch (err) {
      console.error("Error fetching status:", err);
      setError("Failed to fetch driver status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update driver status
  const updateStatus = async (statusData) => {
    setIsUpdating(true);

    try {
      await updateDriverStatus(statusData);
      await fetchStatus(); // Refresh status after update
      return true;
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update driver status");
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchStatus();

    // Poll for status updates
    const interval = setInterval(fetchStatus, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return {
    status,
    loading,
    error,
    isUpdating,
    fetchStatus,
    updateStatus,
  };
};
