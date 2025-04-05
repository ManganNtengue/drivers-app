import React, { useState } from "react";
import LogGrid from "./LogGrid";
import { certifyLogSheet } from "../../api/logs";

// Import the CSS file
import "../../styles/components/logbook/logSheet.css";

const LogSheet = ({ log, onCertify }) => {
  const [isCertifying, setIsCertifying] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCertify = async () => {
    setIsCertifying(true);
    try {
      await certifyLogSheet(log.id);
      onCertify(log.id);
    } catch (error) {
      console.error("Error certifying log sheet:", error);
      alert("Failed to certify log sheet");
    } finally {
      setIsCertifying(false);
    }
  };

  return (
    <div className="log-sheet-container">
      <div className="log-sheet-header">
        <div className="log-sheet-title-container">
          <h2 className="log-sheet-title">Log Sheet: {formatDate(log.date)}</h2>

          <div className="log-sheet-certification">
            {log.certified ? (
              <span className="log-certified-badge">
                <svg
                  className="log-certified-icon"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Certified{" "}
                {log.certified_at &&
                  `on ${new Date(log.certified_at).toLocaleDateString()}`}
              </span>
            ) : (
              <button
                onClick={handleCertify}
                disabled={isCertifying}
                className="log-certify-button"
              >
                {isCertifying ? "Certifying..." : "Certify Log"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="log-sheet-content">
        <div className="log-info-grid">
          <div className="log-info-section">
            <h3 className="log-info-title">Driver Information</h3>
            <div className="log-info-details">
              <p>
                <span className="log-info-label">Name:</span>{" "}
                {log.driver.user.first_name} {log.driver.user.last_name}
              </p>
              <p>
                <span className="log-info-label">License:</span>{" "}
                {log.driver.license_number} ({log.driver.license_state})
              </p>
              <p>
                <span className="log-info-label">Company:</span>{" "}
                {log.driver.company_name}
              </p>
            </div>
          </div>

          <div className="log-info-section">
            <h3 className="log-info-title">Vehicle Information</h3>
            <div className="log-info-details">
              <p>
                <span className="log-info-label">Vehicle Number:</span>{" "}
                {log.vehicle.vehicle_number}
              </p>
              <p>
                <span className="log-info-label">License Plate:</span>{" "}
                {log.vehicle.license_plate} ({log.vehicle.state})
              </p>
              <p>
                <span className="log-info-label">Make/Model:</span>{" "}
                {log.vehicle.make} {log.vehicle.model} ({log.vehicle.year})
              </p>
            </div>
          </div>
        </div>

        <div className="log-hours-summary">
          <h3 className="log-info-title">Hours Summary</h3>
          <div className="log-hours-grid">
            <div className="log-hours-item log-hours-off-duty">
              <span className="log-hours-type">Off Duty</span>
              <span className="log-hours-value">
                {log.hours_off_duty.toFixed(2)} hrs
              </span>
            </div>
            <div className="log-hours-item log-hours-sleeper">
              <span className="log-hours-type">Sleeper Berth</span>
              <span className="log-hours-value">
                {log.hours_sleeper_berth.toFixed(2)} hrs
              </span>
            </div>
            <div className="log-hours-item log-hours-driving">
              <span className="log-hours-type">Driving</span>
              <span className="log-hours-value">
                {log.hours_driving.toFixed(2)} hrs
              </span>
            </div>
            <div className="log-hours-item log-hours-on-duty">
              <span className="log-hours-type">On Duty</span>
              <span className="log-hours-value">
                {log.hours_on_duty.toFixed(2)} hrs
              </span>
            </div>
          </div>
        </div>

        <div className="log-grid-section">
          <h3 className="log-info-title">Daily Log Grid</h3>
          <LogGrid logData={log} />
        </div>

        <div className="log-details-grid">
          <div className="log-details-section">
            <h3 className="log-info-title">Shipping Documents</h3>
            <p className="log-details-text">
              {log.shipping_docs || "No shipping documents recorded"}
            </p>
          </div>

          <div className="log-details-section">
            <h3 className="log-info-title">Remarks</h3>
            <p className="log-details-text">
              {log.remarks || "No remarks for this log"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogSheet;
