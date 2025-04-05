import React from "react";

// Import the CSS file
import "../../styles/components/dashboard/hoursDisplay.css";

const HoursDisplay = ({ hoursData }) => {
  if (!hoursData) {
    return null;
  }

  const {
    drive_hours_today,
    duty_hours_today,
    cycle_hours,
    drive_hours_remaining,
    duty_hours_remaining,
    cycle_hours_remaining,
  } = hoursData;

  // Calculate percentages for progress bars
  const drivePercentage = Math.min(100, (drive_hours_today / 11) * 100);
  const dutyPercentage = Math.min(100, (duty_hours_today / 14) * 100);
  const cyclePercentage = Math.min(100, (cycle_hours / 70) * 100);

  // Determine color classes based on hours remaining
  const getDriveColorClass = () => {
    if (drive_hours_remaining <= 1) return "progress-bar-fill-driving-low";
    if (drive_hours_remaining <= 3) return "progress-bar-fill-driving-medium";
    return "progress-bar-fill-driving";
  };

  const getDutyColorClass = () => {
    if (duty_hours_remaining <= 1) return "progress-bar-fill-duty-low";
    if (duty_hours_remaining <= 3) return "progress-bar-fill-duty-medium";
    return "progress-bar-fill-duty";
  };

  const getCycleColorClass = () => {
    if (cycle_hours_remaining <= 5) return "progress-bar-fill-cycle-low";
    if (cycle_hours_remaining <= 15) return "progress-bar-fill-cycle-medium";
    return "progress-bar-fill-cycle";
  };

  const getBreakStatusClass = () => {
    return hoursData.break_status === "required"
      ? "break-status-required"
      : "break-status-ok";
  };

  return (
    <div className="hours-display-container">
      <h2 className="hours-display-title">Available Hours</h2>

      <div className="hours-grid">
        <div>
          <div className="progress-label">
            <span className="progress-label-text">Driving Time</span>
            <span className="progress-label-text">
              {drive_hours_today.toFixed(2)}/11 hrs
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${getDriveColorClass()}`}
              style={{ width: `${drivePercentage}%` }}
            ></div>
          </div>
          <div className="progress-remaining">
            {drive_hours_remaining.toFixed(2)} hours remaining
          </div>
        </div>

        <div>
          <div className="progress-label">
            <span className="progress-label-text">On-Duty Time</span>
            <span className="progress-label-text">
              {duty_hours_today.toFixed(2)}/14 hrs
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${getDutyColorClass()}`}
              style={{ width: `${dutyPercentage}%` }}
            ></div>
          </div>
          <div className="progress-remaining">
            {duty_hours_remaining.toFixed(2)} hours remaining
          </div>
        </div>

        <div>
          <div className="progress-label">
            <span className="progress-label-text">70-Hour Cycle</span>
            <span className="progress-label-text">
              {cycle_hours.toFixed(2)}/70 hrs
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${getCycleColorClass()}`}
              style={{ width: `${cyclePercentage}%` }}
            ></div>
          </div>
          <div className="progress-remaining">
            {cycle_hours_remaining.toFixed(2)} hours remaining
          </div>
        </div>
      </div>

      <div className="hours-summary">
        <h3 className="hours-summary-title">Hours of Service Summary</h3>
        <div className="hours-summary-grid">
          <div>
            <p className="hours-summary-item">
              <span className="hours-summary-label">Driving Limit:</span> 11
              hours
            </p>
            <p className="hours-summary-item">
              <span className="hours-summary-label">Duty Window:</span> 14
              consecutive hours
            </p>
            <p className="hours-summary-item">
              <span className="hours-summary-label">Required Break:</span> 30
              minutes after 8 driving hours
            </p>
          </div>
          <div>
            <p className="hours-summary-item">
              <span className="hours-summary-label">Off-Duty Required:</span> 10
              consecutive hours
            </p>
            <p className="hours-summary-item">
              <span className="hours-summary-label">Cycle Limit:</span> 70 hours
              in 8 days
            </p>
            <p className="hours-summary-item">
              <span className="hours-summary-label">Current Break Status:</span>{" "}
              <span className={getBreakStatusClass()}>
                {hoursData.break_status === "required"
                  ? "Break Required!"
                  : hoursData.break_status === "compliant"
                  ? "Break Compliant"
                  : "Not Required Yet"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoursDisplay;
