// trip planner page

import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import TripForm from "../components/TripPlanner/TripForm";
import RouteMap from "../components/TripPlanner/RouteMap";
import TripSummary from "../components/TripPlanner/TripSummary";
import { planTrip } from "../api/trips";

// Import the CSS file
import "../styles/pages/tripPlanner.css";

const TripPlannerPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [error, setError] = useState(null);

  const handlePlanTrip = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await planTrip(formData);
      setTripData(result);
    } catch (err) {
      console.error("Error planning trip:", err);
      setError("Failed to plan trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTrip = () => {
    setTripData(null);
    setError(null);
  };

  return (
    <Layout>
      <div className="trip-planner-container">
        <div className="trip-planner-header">
          <div className="trip-planner-title-container">
            <h1 className="trip-planner-title">Trip Planner</h1>
            <p className="trip-planner-subtitle">
              Plan your trip with HOS compliance and generate electronic logs
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="trip-planner-loading">
            <div className="trip-planner-loading-container">
              <div className="trip-planner-spinner"></div>
              <p className="trip-planner-loading-text">
                Calculating optimal route and HOS compliance...
              </p>
              <p className="trip-planner-loading-subtext">
                This may take a few moments
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="trip-planner-error">
            <div className="trip-planner-error-alert">
              <div className="trip-planner-error-container">
                <div className="trip-planner-error-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="trip-planner-error-content">
                  <h3 className="trip-planner-error-title">
                    Error Planning Trip
                  </h3>
                  <div className="trip-planner-error-message">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="trip-planner-error-actions">
              <button
                onClick={handleNewTrip}
                className="trip-planner-try-again"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : tripData ? (
          <div className="trip-result-container">
            <div className="trip-result-map-card">
              <div className="trip-result-header">
                <h2 className="trip-result-title">Trip Plan</h2>
                <button
                  onClick={handleNewTrip}
                  className="trip-new-plan-button"
                >
                  Plan New Trip
                </button>
              </div>

              <RouteMap tripData={tripData} />
            </div>

            <TripSummary tripData={tripData} />
          </div>
        ) : (
          <div className="trip-form-card">
            <TripForm onPlanTrip={handlePlanTrip} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TripPlannerPage;
