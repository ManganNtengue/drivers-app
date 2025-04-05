import React, { useState } from "react";
import { updateDriverStatus } from "../../api/status";
import { useStatus } from "../../hooks/useStatus";

// Import the CSS file
import "../../styles/components/dashboard/statusButtons.css";

const StatusButtons = ({ currentStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showRemarksInput, setShowRemarksInput] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const { refreshStatus } = useStatus();

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setShowRemarksInput(true);
  };

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    try {
      await updateDriverStatus({
        status: selectedStatus,
        remarks: remarks,
      });

      // Refresh status after update
      await refreshStatus();

      // Reset form
      setRemarks("");
      setShowRemarksInput(false);
      setSelectedStatus(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setShowRemarksInput(false);
    setRemarks("");
    setSelectedStatus(null);
  };

  const getButtonClasses = (status) => {
    const baseClass = "status-button";
    const activeClass = "status-button-active";

    switch (status) {
      case "off_duty":
        return `${baseClass} ${
          currentStatus === "off_duty"
            ? `status-button-off-duty-active ${activeClass}`
            : "status-button-off-duty"
        }`;
      case "sleeper_berth":
        return `${baseClass} ${
          currentStatus === "sleeper_berth"
            ? `status-button-sleeper-active ${activeClass}`
            : "status-button-sleeper"
        }`;
      case "driving":
        return `${baseClass} ${
          currentStatus === "driving"
            ? `status-button-driving-active ${activeClass}`
            : "status-button-driving"
        }`;
      case "on_duty":
        return `${baseClass} ${
          currentStatus === "on_duty"
            ? `status-button-on-duty-active ${activeClass}`
            : "status-button-on-duty"
        }`;
      default:
        return baseClass;
    }
  };

  const getSelectedBadgeClass = () => {
    switch (selectedStatus) {
      case "off_duty":
        return "status-selected-badge status-selected-badge-off-duty";
      case "sleeper_berth":
        return "status-selected-badge status-selected-badge-sleeper";
      case "driving":
        return "status-selected-badge status-selected-badge-driving";
      case "on_duty":
        return "status-selected-badge status-selected-badge-on-duty";
      default:
        return "status-selected-badge";
    }
  };

  return (
    <div className="status-buttons-container">
      <h2 className="status-buttons-title">Update Driver Status</h2>

      {!showRemarksInput ? (
        <div className="status-buttons-grid">
          <button
            onClick={() => handleStatusClick("off_duty")}
            disabled={currentStatus === "off_duty" || isUpdating}
            className={getButtonClasses("off_duty")}
          >
            <div className="status-button-icon status-button-icon-off-duty">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="status-button-text">Off Duty</span>
          </button>

          <button
            onClick={() => handleStatusClick("sleeper_berth")}
            disabled={currentStatus === "sleeper_berth" || isUpdating}
            className={getButtonClasses("sleeper_berth")}
          >
            <div className="status-button-icon status-button-icon-sleeper">
              <span className="text-2xl">😴</span>
            </div>
            <span className="status-button-text">Sleeper Berth</span>
          </button>

          <button
            onClick={() => handleStatusClick("driving")}
            disabled={currentStatus === "driving" || isUpdating}
            className={getButtonClasses("driving")}
          >
            <div className="status-button-icon status-button-icon-driving">
              <span className="text-2xl">🚚</span>
            </div>
            <span className="status-button-text">Driving</span>
          </button>

          <button
            onClick={() => handleStatusClick("on_duty")}
            disabled={currentStatus === "on_duty" || isUpdating}
            className={getButtonClasses("on_duty")}
          >
            <div className="status-button-icon status-button-icon-on-duty">
              <span className="text-2xl">👷</span>
            </div>
            <span className="status-button-text">On Duty (Not Driving)</span>
          </button>
        </div>
      ) : (
        <div className="status-remarks-container">
          <div className="flex items-center">
            <span className="font-medium mr-2">Changing status to:</span>
            <span className={getSelectedBadgeClass()}>
              {selectedStatus === "off_duty"
                ? "Off Duty"
                : selectedStatus === "sleeper_berth"
                ? "Sleeper Berth"
                : selectedStatus === "driving"
                ? "Driving"
                : "On Duty (Not Driving)"}
            </span>
          </div>

          <div>
            <label
              htmlFor="remarks"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Remarks (optional)
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any notes about this status change..."
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              rows="3"
            />
          </div>

          <div className="status-buttons-actions">
            <button onClick={handleCancel} className="status-cancel-button">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="status-submit-button"
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusButtons;
