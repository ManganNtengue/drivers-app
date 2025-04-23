import { useState, useEffect } from "react";
import { getLogSheets, getLogSheet } from "../api/logs";

export const useLogbook = (
  initialDateRange = { startDate: null, endDate: null }
) => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate:
      initialDateRange.startDate ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: initialDateRange.endDate || new Date().toISOString().slice(0, 10),
  });

  // Fetch logs based on date range
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);

      try {
        const logsData = await getLogSheets(
          dateRange.startDate,
          dateRange.endDate
        );
        setLogs(logsData);
        setError(null);

        // Select the most recent log if none is selected
        if (!selectedLog && logsData.length > 0) {
          setSelectedLog(logsData[0]);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to fetch log sheets");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [dateRange, selectedLog]);

  // Fetch a specific log by ID
  const fetchLogById = async (logId) => {
    setLoading(true);

    try {
      const logData = await getLogSheet(logId);
      setSelectedLog(logData);
      setError(null);
      return logData;
    } catch (err) {
      console.error("Error fetching log:", err);
      setError("Failed to fetch log sheet");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update date range
  const updateDateRange = (newRange) => {
    setDateRange(newRange);
  };

  return {
    logs,
    selectedLog,
    loading,
    error,
    dateRange,
    setSelectedLog,
    fetchLogById,
    updateDateRange,
  };
};
