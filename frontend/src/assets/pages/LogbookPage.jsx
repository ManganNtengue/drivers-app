import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import LogSheet from "../components/LogBook/LogSheet";
import LogExport from "../components/LogBook/LogExport";
import { getLogSheets, getLogSheet } from "../api/logs";

// Import the CSS file
import "../styles/pages/logbook.css";

const LogbookPage = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10), // 7 days ago
    endDate: new Date().toISOString().slice(0, 10), // today
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a specific log ID is in the URL
    const params = new URLSearchParams(location.search);
    const logId = params.get("id");

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { startDate, endDate } = dateRange;
        const logsData = await getLogSheets(startDate, endDate);
        setLogs(logsData);

        // If a log ID is specified, fetch and select that log
        if (logId) {
          const specificLog = await getLogSheet(logId);
          setSelectedLog(specificLog);
        } else if (logsData.length > 0) {
          // Otherwise select the most recent log
          setSelectedLog(logsData[0]);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [location.search, dateRange]);

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogSelect = (log) => {
    setSelectedLog(log);
    // Update URL with selected log ID
    navigate(`/logbook?id=${log.id}`);
  };

  const handleLogCertify = async (logId) => {
    // Update the certified status in the logs array
    setLogs(
      logs.map((log) =>
        log.id === logId
          ? { ...log, certified: true, certified_at: new Date().toISOString() }
          : log
      )
    );

    // Update selected log if it's the one being certified
    if (selectedLog && selectedLog.id === logId) {
      setSelectedLog({
        ...selectedLog,
        certified: true,
        certified_at: new Date().toISOString(),
      });
    }
  };

  return (
    <Layout>
      <div className="logbook-container">
        <div className="logbook-header">
          <div className="logbook-title-container">
            <h1 className="logbook-title">Driver's Logbook</h1>
            <p className="logbook-subtitle">
              View and manage your electronic logs
            </p>
          </div>

          {selectedLog && (
            <div className="logbook-actions">
              <LogExport logId={selectedLog.id} date={selectedLog.date} />
            </div>
          )}
        </div>

        <div className="filter-card">
          <h2 className="filter-title">Filter Logs</h2>

          <div className="filter-grid">
            <div>
              <label htmlFor="startDate" className="filter-field">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="filter-input"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="filter-field">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="filter-input"
              />
            </div>
          </div>
        </div>

        <div className="logbook-layout">
          <div className="log-list-container">
            <div className="log-list-card">
              <div className="log-list-header">
                <h2 className="log-list-title">Log Sheets</h2>
              </div>

              {loading ? (
                <div className="p-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No logs found for the selected date range
                </div>
              ) : (
                <ul className="log-list">
                  {logs.map((log) => (
                    <li key={log.id}>
                      <button
                        onClick={() => handleLogSelect(log)}
                        className={`log-list-item-button ${
                          selectedLog && selectedLog.id === log.id
                            ? "log-list-item-active"
                            : ""
                        }`}
                      >
                        <div className="log-list-item-info">
                          <span className="log-list-item-date">
                            {new Date(log.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="log-list-item-hours">
                            {log.hours_driving.toFixed(1)} hrs driving,{" "}
                            {log.hours_on_duty.toFixed(1)} hrs on duty
                          </span>
                        </div>

                        {log.certified && (
                          <span className="log-list-item-badge">Certified</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="log-content-container">
            {loading ? (
              <div className="logbook-loading">
                <div className="logbook-spinner"></div>
              </div>
            ) : selectedLog ? (
              <LogSheet log={selectedLog} onCertify={handleLogCertify} />
            ) : (
              <div className="logbook-empty">
                <svg
                  className="logbook-empty-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="logbook-empty-title">No log selected</h3>
                <p className="logbook-empty-message">
                  Select a log from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LogbookPage;
