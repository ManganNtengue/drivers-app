import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { getDriverInfo, updateDriverPreferences } from "../api/status";

// Import the CSS file
import "../styles/pages/settings.css";

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [driverInfo, setDriverInfo] = useState(null);
  const [preferences, setPreferences] = useState({
    notifications_enabled: true,
    break_reminders: true,
    auto_duty_status: true,
    map_type: "roadmap",
    units: "miles",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const driverData = await getDriverInfo();
        setDriverInfo(driverData);

        // Update preferences with driver data if it exists
        if (driverData.preferences) {
          setPreferences({
            ...preferences,
            ...driverData.preferences,
          });
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching driver info:", err);
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPreferences((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear success message when settings are changed
    setSaveSuccess(false);
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // This is a hypothetical API function that would need to be implemented
      await updateDriverPreferences(preferences);
      setSaveSuccess(true);
      setError(null);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError("Failed to save preferences");
      setSaveSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <Layout>
        <div className="settings-loading">
          <div className="settings-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-container">
        <div className="settings-header">
          <div className="settings-title-container">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">
              Manage your account and application preferences
            </p>
          </div>
        </div>

        {error && (
          <div className="settings-error">
            <div className="settings-error-icon">
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
            </div>
            <div className="settings-error-message">{error}</div>
          </div>
        )}

        {saveSuccess && (
          <div className="settings-success">
            <div className="settings-success-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="settings-success-message">
              Settings saved successfully!
            </div>
          </div>
        )}

        <div className="settings-content">
          <div className="settings-card">
            <h2 className="settings-card-title">Application Preferences</h2>

            <form onSubmit={handleSavePreferences} className="settings-form">
              <div className="settings-form-group">
                <h3 className="settings-form-section-title">Notifications</h3>

                <div className="settings-form-field">
                  <div className="settings-checkbox-container">
                    <input
                      type="checkbox"
                      id="notifications_enabled"
                      name="notifications_enabled"
                      checked={preferences.notifications_enabled}
                      onChange={handlePreferenceChange}
                      className="settings-checkbox"
                    />
                    <label
                      htmlFor="notifications_enabled"
                      className="settings-checkbox-label"
                    >
                      Enable notifications
                    </label>
                  </div>
                  <p className="settings-field-description">
                    Receive alerts for important events and updates
                  </p>
                </div>

                <div className="settings-form-field">
                  <div className="settings-checkbox-container">
                    <input
                      type="checkbox"
                      id="break_reminders"
                      name="break_reminders"
                      checked={preferences.break_reminders}
                      onChange={handlePreferenceChange}
                      className="settings-checkbox"
                    />
                    <label
                      htmlFor="break_reminders"
                      className="settings-checkbox-label"
                    >
                      Break reminders
                    </label>
                  </div>
                  <p className="settings-field-description">
                    Get alerts when you need to take a required break
                  </p>
                </div>

                <div className="settings-form-field">
                  <div className="settings-checkbox-container">
                    <input
                      type="checkbox"
                      id="auto_duty_status"
                      name="auto_duty_status"
                      checked={preferences.auto_duty_status}
                      onChange={handlePreferenceChange}
                      className="settings-checkbox"
                    />
                    <label
                      htmlFor="auto_duty_status"
                      className="settings-checkbox-label"
                    >
                      Automatic duty status detection
                    </label>
                  </div>
                  <p className="settings-field-description">
                    Automatically detect and suggest status changes based on
                    vehicle movement
                  </p>
                </div>
              </div>

              <div className="settings-form-group">
                <h3 className="settings-form-section-title">Display Options</h3>

                <div className="settings-form-field">
                  <label htmlFor="map_type" className="settings-select-label">
                    Map Type
                  </label>
                  <select
                    id="map_type"
                    name="map_type"
                    value={preferences.map_type}
                    onChange={handlePreferenceChange}
                    className="settings-select"
                  >
                    <option value="roadmap">Road Map</option>
                    <option value="satellite">Satellite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="terrain">Terrain</option>
                  </select>
                </div>

                <div className="settings-form-field">
                  <label htmlFor="units" className="settings-select-label">
                    Distance Units
                  </label>
                  <select
                    id="units"
                    name="units"
                    value={preferences.units}
                    onChange={handlePreferenceChange}
                    className="settings-select"
                  >
                    <option value="miles">Miles</option>
                    <option value="kilometers">Kilometers</option>
                  </select>
                </div>
              </div>

              <div className="settings-form-actions">
                <button
                  type="submit"
                  disabled={saving}
                  className="settings-save-button"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>

          <div className="settings-card">
            <h2 className="settings-card-title">Account Information</h2>

            {driverInfo && (
              <div className="settings-account-info">
                <div className="settings-info-group">
                  <h3 className="settings-info-title">Personal Information</h3>

                  <div className="settings-info-grid">
                    <div className="settings-info-item">
                      <span className="settings-info-label">Name:</span>
                      <span className="settings-info-value">
                        {driverInfo.user.first_name} {driverInfo.user.last_name}
                      </span>
                    </div>

                    <div className="settings-info-item">
                      <span className="settings-info-label">Email:</span>
                      <span className="settings-info-value">
                        {driverInfo.user.email}
                      </span>
                    </div>

                    <div className="settings-info-item">
                      <span className="settings-info-label">Phone:</span>
                      <span className="settings-info-value">
                        {driverInfo.phone_number || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="settings-info-group">
                  <h3 className="settings-info-title">Driver Information</h3>

                  <div className="settings-info-grid">
                    <div className="settings-info-item">
                      <span className="settings-info-label">
                        License Number:
                      </span>
                      <span className="settings-info-value">
                        {driverInfo.license_number}
                      </span>
                    </div>

                    <div className="settings-info-item">
                      <span className="settings-info-label">
                        License State:
                      </span>
                      <span className="settings-info-value">
                        {driverInfo.license_state}
                      </span>
                    </div>

                    <div className="settings-info-item">
                      <span className="settings-info-label">Company:</span>
                      <span className="settings-info-value">
                        {driverInfo.company_name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="settings-account-actions">
              <button onClick={handleLogout} className="settings-logout-button">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
