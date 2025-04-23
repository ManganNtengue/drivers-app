import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { getTrips } from "../api/trips";

// Import the CSS file
import "../styles/pages/trips.css";

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const status = filter !== "all" ? filter : null;
        const tripsData = await getTrips(status);
        setTrips(tripsData);
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError("Failed to load trips");
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [filter]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="trips-page-container">
        <div className="trips-page-header">
          <div className="trips-page-title-container">
            <h1 className="trips-page-title">Trip History</h1>
            <p className="trips-page-subtitle">View and manage your trips</p>
          </div>

          <div className="trips-page-actions">
            <Link to="/trip-planner" className="trips-page-button">
              Plan New Trip
            </Link>
          </div>
        </div>

        <div className="trips-filter-card">
          <div className="trips-filter-container">
            <span className="trips-filter-label">Filter by status:</span>
            <div className="trips-filter-options">
              <button
                onClick={() => setFilter("all")}
                className={`trips-filter-button ${
                  filter === "all" ? "trips-filter-button-active" : ""
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("planned")}
                className={`trips-filter-button ${
                  filter === "planned" ? "trips-filter-button-active" : ""
                }`}
              >
                Planned
              </button>
              <button
                onClick={() => setFilter("in_progress")}
                className={`trips-filter-button ${
                  filter === "in_progress" ? "trips-filter-button-active" : ""
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`trips-filter-button ${
                  filter === "completed" ? "trips-filter-button-active" : ""
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="trips-loading">
            <div className="trips-spinner"></div>
          </div>
        ) : error ? (
          <div className="trips-error">
            <div className="trips-error-message">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="trips-retry-button"
            >
              Retry
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="trips-empty">
            <div className="trips-empty-container">
              <svg
                className="trips-empty-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h3 className="trips-empty-title">No trips found</h3>
              <p className="trips-empty-text">
                {filter !== "all"
                  ? `No trips with "${filter}" status found.`
                  : "You have not planned any trips yet."}
              </p>
              {filter !== "all" ? (
                <button
                  onClick={() => setFilter("all")}
                  className="trips-empty-button"
                >
                  View All Trips
                </button>
              ) : (
                <Link to="/trip-planner" className="trips-empty-button">
                  Plan Your First Trip
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="trips-list-container">
            <div className="trips-table-container">
              <table className="trips-table">
                <thead className="trips-table-header">
                  <tr>
                    <th className="trips-table-header-cell">Start Date</th>
                    <th className="trips-table-header-cell">From</th>
                    <th className="trips-table-header-cell">To</th>
                    <th className="trips-table-header-cell">Distance</th>
                    <th className="trips-table-header-cell">Status</th>
                    <th className="trips-table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="trips-table-body">
                  {trips.map((trip) => (
                    <tr key={trip.id} className="trips-table-row">
                      <td className="trips-table-cell">
                        {formatDate(trip.scheduled_start)}
                      </td>
                      <td className="trips-table-cell">
                        {trip.starting_location.city},{" "}
                        {trip.starting_location.state}
                      </td>
                      <td className="trips-table-cell">
                        {trip.delivery_location.city},{" "}
                        {trip.delivery_location.state}
                      </td>
                      <td className="trips-table-cell">
                        {Math.round(trip.total_distance_miles)} miles
                      </td>
                      <td className="trips-table-cell">
                        <span
                          className={`trips-status-badge trips-status-${trip.status}`}
                        >
                          {trip.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="trips-table-cell trips-actions-cell">
                        <Link
                          to={`/trips/${trip.id}`}
                          className="trips-view-button"
                        >
                          View
                        </Link>
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

export default TripsPage;
