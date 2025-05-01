import React, { useEffect, useState } from "react";
import StatusButtons from "../Dashboard/StatusButtons";
import HoursDisplay from "../Dashboard/HoursDisplay";
import { getDriverInfo, getCurrentStatus } from "../../api/status";

// Import the CSS file
import "../../styles/components/dashboard/dashboard.css";

const Dashboard = () => {
  const [driverInfo, setDriverInfo] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driverResponse, statusResponse] = await Promise.all([
          getDriverInfo(),
          getCurrentStatus(),
        ]);

        setDriverInfo(driverResponse);
        setStatus(statusResponse);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for status updates every 30 seconds
    const interval = setInterval(() => {
      getCurrentStatus().then(setStatus).catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    if (!status) return "";

    switch (status.current_status) {
      case "driving":
        return "dashboard-status-badge-driving";
      case "on_duty":
        return "dashboard-status-badge-on-duty";
      case "sleeper_berth":
        return "dashboard-status-badge-sleeper";
      default:
        return "dashboard-status-badge-off-duty";
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-card-title">Driver Dashboard</h1>

        {driverInfo && (
          <div className="dashboard-info-grid">
            <div className="dashboard-info-item">
              <h2 className="dashboard-info-title">Driver Information</h2>
              <div className="mt-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {driverInfo.user.first_name} {driverInfo.user.last_name}
                </p>
                <p>
                  <span className="font-medium">License:</span>{" "}
                  {driverInfo.license_number} ({driverInfo.license_state})
                </p>
                <p>
                  <span className="font-medium">Company:</span>{" "}
                  {driverInfo.company_name}
                </p>
              </div>
            </div>

            <div className="dashboard-info-item">
              <h2 className="dashboard-info-title">Current Status</h2>
              {status ? (
                <div className="mt-2">
                  <p>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`dashboard-status-badge ${getStatusBadgeClass(
                        status
                      )}`}
                    >
                      {status.current_status?.replace("_", " ")}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Hours in status:</span>{" "}
                    {status.hours_in_current_status.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-medium">Last updated:</span>{" "}
                    {new Date(status.status_timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-gray-500">
                  No current status available
                </p>
              )}
            </div>

            <div className="dashboard-info-item">
              <h2 className="dashboard-info-title">Hours Summary</h2>
              {status ? (
                <div className="mt-2">
                  <p>
                    <span className="font-medium">Drive today:</span>{" "}
                    {status.drive_hours_today.toFixed(2)} hrs
                  </p>
                  <p>
                    <span className="font-medium">On duty today:</span>{" "}
                    {status.duty_hours_today.toFixed(2)} hrs
                  </p>
                  <p>
                    <span className="font-medium">Cycle hours:</span>{" "}
                    {status.cycle_hours.toFixed(2)} hrs
                  </p>
                  <p>
                    <span className="font-medium">Break status:</span>
                    <span
                      className={
                        status.break_status === "required"
                          ? "break-status-required"
                          : "break-status-ok"
                      }
                    >
                      {status.break_status === "required"
                        ? "Break Required!"
                        : status.break_status === "compliant"
                        ? "Break Compliant"
                        : "Not Required Yet"}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-gray-500">No hours data available</p>
              )}
            </div>
          </div>
        )}
      </div>

      <StatusButtons currentStatus={status?.current_status} />

      {status && <HoursDisplay hoursData={status} />}

      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="overflow-x-auto">
          <table className="dashboard-table">
            <thead className="dashboard-table-header">
              <tr>
                <th className="dashboard-table-header-cell">Time</th>
                <th className="dashboard-table-header-cell">Status</th>
                <th className="dashboard-table-header-cell">Location</th>
                <th className="dashboard-table-header-cell">Remarks</th>
              </tr>
            </thead>
            <tbody className="dashboard-table-body">
              {/* Sample data - in a real app, this would come from the API */}
              <tr className="dashboard-table-row">
                <td className="dashboard-table-cell">8:30 AM</td>
                <td className="dashboard-table-cell">
                  <span className="dashboard-status-badge dashboard-status-badge-driving">
                    Driving
                  </span>
                </td>
                <td className="dashboard-table-cell">Springfield, IL</td>
                <td className="dashboard-table-cell">
                  Started trip to Chicago
                </td>
              </tr>
              <tr className="dashboard-table-row">
                <td className="dashboard-table-cell">10:15 AM</td>
                <td className="dashboard-table-cell">
                  <span className="dashboard-status-badge dashboard-status-badge-on-duty">
                    On Duty
                  </span>
                </td>
                <td className="dashboard-table-cell">Bloomington, IL</td>
                <td className="dashboard-table-cell">Fuel stop</td>
              </tr>
              <tr className="dashboard-table-row">
                <td className="dashboard-table-cell">10:45 AM</td>
                <td className="dashboard-table-cell">
                  <span className="dashboard-status-badge dashboard-status-badge-driving">
                    Driving
                  </span>
                </td>
                <td className="dashboard-table-cell">Bloomington, IL</td>
                <td className="dashboard-table-cell">Continuing to Chicago</td>
              </tr>
              <tr className="dashboard-table-row">
                <td className="dashboard-table-cell">1:30 PM</td>
                <td className="dashboard-table-cell">
                  <span className="dashboard-status-badge dashboard-status-badge-off-duty">
                    Off Duty
                  </span>
                </td>
                <td className="dashboard-table-cell">Joliet, IL</td>
                <td className="dashboard-table-cell">30-minute break</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
