import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import RouteMap from "../components/TripPlanner/RouteMap";
import { getTrip, getTripRestStops, updateTripStatus } from "../api/trips";

// Import the CSS file
import "../styles/pages/tripDetail.css";

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [restStops, setRestStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchTripData = async () => {
      setLoading(true);
      try {
        const [tripData, stopsData] = await Promise.all([
          getTrip(id),
          getTripRestStops(id),
        ]);
        setTrip(tripData);
        setRestStops(stopsData);
      } catch (err) {
        console.error("Error fetching trip data:", err);
        setError("Failed to load trip details");
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await updateTripStatus(id, newStatus);
      setTrip((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Error updating trip status:", err);
      alert("Failed to update trip status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="trip-detail-loading">
          <div className="trip-detail-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="trip-detail-error">
          <div className="trip-detail-error-message">{error}</div>
          <button
            onClick={() => navigate("/trips")}
            className="trip-detail-back-button"
          >
            Back to Trips
          </button>
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="trip-detail-not-found">
          <h2 className="trip-detail-not-found-title">Trip not found</h2>
          <p className="trip-detail-not-found-text">
            The trip you are looking for does not exist or has been deleted.
          </p>
          <button
            onClick={() => navigate("/trips")}
            className="trip-detail-back-button"
          >
            Back to Trips
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="trip-detail-container">
        <div className="trip-detail-header">
          <div className="trip-detail-title-container">
            <h1 className="trip-detail-title">Trip Details</h1>
            <div className="trip-detail-subtitle">
              <span
                className={`trip-detail-status-badge trip-detail-status-${trip.status}`}
              >
                {trip.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="trip-detail-actions">
            <Link to="/trips" className="trip-detail-back-link">
              Back to Trips
            </Link>

            {trip.status === "planned" && (
              <button
                onClick={() => handleStatusChange("in_progress")}
                disabled={statusUpdating}
                className="trip-detail-start-button"
              >
                {statusUpdating ? "Updating..." : "Start Trip"}
              </button>
            )}

            {trip.status === "in_progress" && (
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={statusUpdating}
                className="trip-detail-complete-button"
              >
                {statusUpdating ? "Updating..." : "Complete Trip"}
              </button>
            )}
          </div>
        </div>

        <div className="trip-detail-content">
          <div className="trip-detail-info-card">
            <h2 className="trip-detail-section-title">Trip Overview</h2>

            <div className="trip-detail-info-grid">
              <div className="trip-detail-info-section">
                <h3 className="trip-detail-info-title">Route Information</h3>
                <div className="trip-detail-info-list">
                  <div className="trip-detail-info-item">
                    <span className="trip-detail-info-label">
                      Starting Point:
                    </span>
                    <span className="trip-detail-info-value">
                      {trip.starting_location.name},{" "}
                      {trip.starting_location.city},{" "}
                      {trip.starting_location.state}
                    </span>
                  </div>
                  <div className="trip-detail-info-item">
                    <span className="trip-detail-info-label">
                      Pickup Location:
                    </span>
                    <span className="trip-detail-info-value">
                      {trip.pickup_location.name}, {trip.pickup_location.city},{" "}
                      {trip.pickup_location.state}
                    </span>
                  </div>
                  <div className="trip-detail-info-item">
                    <span className="trip-detail-info-label">
                      Delivery Location:
                    </span>
                    <span className="trip-detail-info-value">
                      {trip.delivery_location.name},{" "}
                      {trip.delivery_location.city},{" "}
                      {trip.delivery_location.state}
                    </span>
                  </div>
                  <div className="trip-detail-info-item">
                    <span className="trip-detail-info-label">
                      Total Distance:
                    </span>
                    <span className="trip-detail-info-value">
                      {Math.round(trip.total_distance_miles)} miles
                    </span>
                  </div>
                </div>
              </div>

              <div className="trip-detail-info-section">
                <h3 className="trip-detail-info-title">Trip Details</h3>
                <div className="trip-detail-info-list">
                  <div className="trip-detail-info-item">
                    <span className="trip-detail-info-label">
                      Scheduled Start:
                    </span>
                    <span className="trip-detail-info-value">
                      {formatDateTime(trip.scheduled_start)}
                    </span>
                  </div>
                  <div className="trip-detail-info-item">
                    <span className="trip-detail-info-label">
                      Estimated Duration:
                    </span>
                    <span className="trip-detail-info-value">
                      {Math.round(trip.estimated_duration_hours)} hours
                    </span>
                  </div>
                  <div className="trip-detail-info-item">
                    <span className="trip-detail-info-label">Vehicle:</span>
                    <span className="trip-detail-info-value">
                      {trip.vehicle.make} {trip.vehicle.model} (
                      {trip.vehicle.year})
                    </span>
                  </div>
                  <div className="trip-detail-info-item">
                    <span className="trip-detail-info-label">
                      Vehicle Number:
                    </span>
                    <span className="trip-detail-info-value">
                      {trip.vehicle.vehicle_number}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="trip-detail-map-card">
            <h2 className="trip-detail-section-title">Route Map</h2>
            <div className="trip-detail-map-container">
              <RouteMap
                tripData={{
                  trip,
                  route: trip.route,
                  hos_compliance: trip.hos_compliance,
                }}
              />
            </div>
          </div>

          <div className="trip-detail-stops-card">
            <h2 className="trip-detail-section-title">Required Stops</h2>

            {restStops.length === 0 ? (
              <p className="trip-detail-empty-message">
                No rest stops required for this trip.
              </p>
            ) : (
              <div className="trip-detail-table-container">
                <table className="trip-detail-table">
                  <thead className="trip-detail-table-header">
                    <tr>
                      <th className="trip-detail-table-header-cell">Type</th>
                      <th className="trip-detail-table-header-cell">
                        Location
                      </th>
                      <th className="trip-detail-table-header-cell">
                        Arrival Time
                      </th>
                      <th className="trip-detail-table-header-cell">
                        Duration
                      </th>
                      <th className="trip-detail-table-header-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody className="trip-detail-table-body">
                    {restStops.map((stop, index) => (
                      <tr key={index} className="trip-detail-table-row">
                        <td className="trip-detail-table-cell">
                          <span
                            className={`trip-detail-stop-badge trip-detail-stop-${stop.stop_type}`}
                          >
                            {stop.stop_type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="trip-detail-table-cell">
                          {stop.location.name}
                        </td>
                        <td className="trip-detail-table-cell">
                          {formatDateTime(stop.arrival_time)}
                        </td>
                        <td className="trip-detail-table-cell">
                          {stop.duration_minutes} minutes
                        </td>
                        <td className="trip-detail-table-cell">
                          <span
                            className={`trip-detail-stop-status trip-detail-stop-status-${
                              stop.status || "pending"
                            }`}
                          >
                            {stop.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="trip-detail-notes-card">
            <h2 className="trip-detail-section-title">Trip Notes</h2>

            {trip.notes ? (
              <div className="trip-detail-notes-content">
                {trip.notes.split("\n").map((line, index) => (
                  <p key={index} className="trip-detail-notes-line">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="trip-detail-empty-message">
                No notes for this trip.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripDetailPage;
