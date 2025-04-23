import React from "react";
import { Link } from "react-router-dom";

// Import the CSS file
import "../../styles/components/tripPlanner/tripSummary.css";

const TripSummary = ({ tripData }) => {
  const { trip, route, hos_compliance } = tripData;

  // Format date
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  // Format duration
  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const getStopTypeClass = (type) => {
    switch (type) {
      case "rest_break":
        return "trip-stop-badge-rest";
      case "10_hour_break":
        return "trip-stop-badge-break";
      case "fuel":
        return "trip-stop-badge-fuel";
      default:
        return "trip-stop-badge-default";
    }
  };

  return (
    <div className="trip-summary-container">
      <div className="trip-card">
        <h2 className="trip-card-title">Trip Overview</h2>

        <div className="trip-details-grid">
          <div>
            <h3 className="trip-details-title">Trip Details</h3>
            <div className="trip-details-section">
              <p>
                <span className="trip-detail-label">Trip ID:</span> {trip.id}
              </p>
              <p>
                <span className="trip-detail-label">Status:</span> {trip.status}
              </p>
              <p>
                <span className="trip-detail-label">Vehicle:</span>{" "}
                {trip.vehicle.make} {trip.vehicle.model} ({trip.vehicle.year})
              </p>
              <p>
                <span className="trip-detail-label">Scheduled Start:</span>{" "}
                {formatDateTime(trip.scheduled_start)}
              </p>
              <p>
                <span className="trip-detail-label">Estimated Duration:</span>{" "}
                {formatDuration(hos_compliance.total_duration)}
              </p>
              <p>
                <span className="trip-detail-label">Total Distance:</span>{" "}
                {Math.round(route.total_distance)} miles
              </p>
            </div>
          </div>

          <div>
            <h3 className="trip-details-title">Route Information</h3>
            <div className="trip-details-section">
              <p>
                <span className="trip-detail-label">From:</span>{" "}
                {trip.starting_location.name},{trip.starting_location.city},{" "}
                {trip.starting_location.state}
              </p>
              <p>
                <span className="trip-detail-label">Pickup:</span>{" "}
                {trip.pickup_location.name},{trip.pickup_location.city},{" "}
                {trip.pickup_location.state}
              </p>
              <p>
                <span className="trip-detail-label">To:</span>{" "}
                {trip.delivery_location.name},{trip.delivery_location.city},{" "}
                {trip.delivery_location.state}
              </p>
              <p>
                <span className="trip-detail-label">Pickup Distance:</span>{" "}
                {Math.round(route.start_to_pickup_distance)} miles
              </p>
              <p>
                <span className="trip-detail-label">Delivery Distance:</span>{" "}
                {Math.round(route.pickup_to_dropoff_distance)} miles
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="trip-hos-card">
        <h2 className="trip-hos-title">HOS Compliance</h2>

        <div className="trip-hos-grid">
          <div>
            <h3 className="trip-hos-section-title">Hours Summary</h3>
            <div className="trip-hos-section">
              <p>
                <span className="trip-detail-label">Total Drive Hours:</span>{" "}
                {hos_compliance.total_drive_hours.toFixed(2)} hrs
              </p>
              <p>
                <span className="trip-detail-label">Total Duty Hours:</span>{" "}
                {hos_compliance.total_duty_hours.toFixed(2)} hrs
              </p>
              <p>
                <span className="trip-detail-label">Start Time:</span>{" "}
                {formatDateTime(hos_compliance.start_time)}
              </p>
              <p>
                <span className="trip-detail-label">End Time:</span>{" "}
                {formatDateTime(hos_compliance.end_time)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="trip-hos-section-title">Compliance Check</h3>
            <div className="trip-hos-section">
              <p>
                <span className="trip-detail-label">Status:</span>
                <span
                  className={
                    hos_compliance.compliant
                      ? "status-compliant"
                      : "status-non-compliant"
                  }
                >
                  {hos_compliance.compliant ? "Compliant" : "Non-Compliant"}
                </span>
              </p>
              <p>
                <span className="trip-detail-label">
                  Remaining Drive Hours:
                </span>{" "}
                {hos_compliance.remaining_drive_hours.toFixed(2)} hrs
              </p>
              <p>
                <span className="trip-detail-label">Remaining Duty Hours:</span>{" "}
                {hos_compliance.remaining_duty_hours.toFixed(2)} hrs
              </p>
              <p>
                <span className="trip-detail-label">
                  Remaining Cycle Hours:
                </span>{" "}
                {hos_compliance.remaining_cycle_hours.toFixed(2)} hrs
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="trip-stops-title">
            Required Stops
            <span className="trip-stops-count">
              (Total: {hos_compliance.required_stops.length})
            </span>
          </h3>

          <div className="overflow-x-auto">
            <table className="trip-stops-table">
              <thead className="trip-stops-header">
                <tr>
                  <th className="trip-stops-header-cell">Type</th>
                  <th className="trip-stops-header-cell">Location</th>
                  <th className="trip-stops-header-cell">Arrival</th>
                  <th className="trip-stops-header-cell">Departure</th>
                  <th className="trip-stops-header-cell">Duration</th>
                </tr>
              </thead>
              <tbody className="trip-stops-body">
                {hos_compliance.required_stops.map((stop, index) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0
                        ? "trip-stops-row-even"
                        : "trip-stops-row-odd"
                    }
                  >
                    <td className="trip-stop-cell">
                      <span
                        className={`trip-stop-badge ${getStopTypeClass(
                          stop.stop_type
                        )}`}
                      >
                        {stop.stop_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="trip-stop-cell">{stop.location.name}</td>
                    <td className="trip-stop-cell">
                      {formatDateTime(stop.arrival_time)}
                    </td>
                    <td className="trip-stop-cell">
                      {formatDateTime(stop.departure_time)}
                    </td>
                    <td className="trip-stop-cell">
                      {stop.duration_minutes} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="trip-log-card">
        <h2 className="trip-log-title">Log Sheets</h2>
        <p className="trip-log-text">
          Electronic log sheets have been generated for this trip. View them in
          the Logbook section.
        </p>

        <div className="trip-log-actions">
          <Link to="/logbook" className="trip-action-button-primary">
            View Logbook
          </Link>
          <Link
            to={`/trips/${trip.id}`}
            className="trip-action-button-secondary"
          >
            Trip Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripSummary;
