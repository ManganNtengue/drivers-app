import React, { useState } from "react";
import { downloadLogSheet } from "../../api/logs";

// Import the CSS file
import "../../styles/components/logbook/logExport.css";

const LogExport = ({ logId, driverName, logDate }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const handleExport = async (format) => {
    setIsExporting(true);
    setExportError(null);

    try {
      await downloadLogSheet(logId, format);
    } catch (err) {
      console.error("Error exporting log sheet:", err);
      setExportError(
        `Failed to export as ${format.toUpperCase()}: ${err.message}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="log-export-container">
      <div className="log-export-header">
        <h3 className="log-export-title">Export Log Sheet</h3>
        <p className="log-export-info">
          Driver: {driverName} | Date: {formatDate(logDate)}
        </p>
      </div>

      {exportError && (
        <div className="log-export-error">
          <span className="log-export-error-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="log-export-error-message">{exportError}</span>
        </div>
      )}

      <div className="log-export-buttons">
        <button
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
          className="log-export-button log-export-button-pdf"
        >
          {isExporting ? "Exporting..." : "Export as PDF"}
        </button>

        <button
          onClick={() => handleExport("csv")}
          disabled={isExporting}
          className="log-export-button log-export-button-csv"
        >
          {isExporting ? "Exporting..." : "Export as CSV"}
        </button>
      </div>

      <div className="log-export-note">
        <p className="log-export-note-text">
          Note: Exported logs can be used for record-keeping or submitted to DOT
          officials when requested.
        </p>
      </div>
    </div>
  );
};

export default LogExport;
