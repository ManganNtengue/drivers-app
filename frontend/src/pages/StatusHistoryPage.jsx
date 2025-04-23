import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { getStatusHistory } from "../api/status";

// Import the CSS file
import "../styles/pages/statusHistory.css";

const StatusHistoryPage = () => {
  const navigate = useNavigate();
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const fetchStatusHistory = async () => {
      setLoading(true);

      try {
        // Note: This is a hypothetical API function that would need to be created
        const historyData = await getStatusHistory(
          dateRange.startDate,
          dateRange.endDate
        );
        setStatusHistory(historyData);
        setError(null);
      } catch (err) {
        console.error("Error fetching status history:", err);
        setError("Failed to load status history");
      } finally {
        setLoading(false);
      }
    };

    fetchStatusHistory();
  }, [dateRange]);

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "driving":
        return "status-history-badge-driving";
      case "on_duty":
        return "status-history-badge-on-duty";
      case "sleeper_berth":
        return "status-history-badge-sleeper";
      case "off_duty":
        return "status-history-badge-off-duty";
      default:
        return "";
    }
  };

  return (
    <Layout>
      <div className="status-history-container">
        <div className="status-history-header">
          <div className="status-history-title-container">
            <h1 className="status-history-title">Status History</h1>
            <p className="status-history-subtitle">
              View your historical duty status changes
            </p>
          </div>
        </div>

        <div className="status-history-filters">
          <div className="status-history-date-range">
            <div className="status-history-date-field">
              <label htmlFor="startDate" className="status-history-date-label">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="status-history-date-input"
              />
            </div>

            <div className="status-history-date-field">
              <label htmlFor="endDate" className="status-history-date-label">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="status-history-date-input"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="status-history-loading">
            <div className="status-history-spinner"></div>
          </div>
        ) : error ? (
          <div className="status-history-error">
            <div className="status-history-error-message">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="status-history-retry-button"
            >
              Retry
            </button>
          </div>
        ) : statusHistory.length === 0 ? (
          <div className="status-history-empty">
            <div className="status-history-empty-container">
              <svg
                className="status-history-empty-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="status-history-empty-title">
                No status history found
              </h3>
              <p className="status-history-empty-text">
                No status changes were recorded during the selected date range.
              </p>
              <button
                onClick={() =>
                  setDateRange({
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 10),
                    endDate: new Date().toISOString().slice(0, 10),
                  })
                }
                className="status-history-empty-button"
              >
                View Last 30 Days
              </button>
            </div>
          </div>
        ) : (
          <div className="status-history-content">
            <div className="status-history-table-container">
              <table className="status-history-table">
                <thead className="status-history-table-header">
                  <tr>
                    <th className="status-history-header-cell">Date & Time</th>
                    <th className="status-history-header-cell">Status</th>
                    <th className="status-history-header-cell">Location</th>
                    <th className="status-history-header-cell">Duration</th>
                    <th className="status-history-header-cell">Remarks</th>
                  </tr>
                </thead>
                <tbody className="status-history-table-body">
                  {statusHistory.map((entry, index) => (
                    <tr key={entry.id} className="status-history-table-row">
                      <td className="status-history-table-cell">
                        {formatDateTime(entry.timestamp)}
                      </td>
                      <td className="status-history-table-cell">
                        <span
                          className={`status-history-badge ${getStatusBadgeClass(
                            entry.status
                          )}`}
                        >
                          {entry.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="status-history-table-cell">
                        {entry.location
                          ? `${entry.location.city}, ${entry.location.state}`
                          : "Location not available"}
                      </td>
                      <td className="status-history-table-cell">
                        {entry.duration_hours
                          ? `${Math.floor(entry.duration_hours)}h ${Math.round(
                              (entry.duration_hours % 1) * 60
                            )}m`
                          : "-"}
                      </td>
                      <td className="status-history-table-cell status-history-remarks">
                        {entry.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StatusHistoryPage;
