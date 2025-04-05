import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useStatus } from "../../hooks/useStatus";

// Import the CSS file
import "../../styles/components/layout/navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { currentStatus } = useStatus();

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [time, setTime] = React.useState(formatTime());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Helper function to determine status class
  const getStatusClass = (status) => {
    switch (status) {
      case "driving":
        return "navbar-status-driving";
      case "on_duty":
        return "navbar-status-on-duty";
      case "sleeper_berth":
        return "navbar-status-sleeper";
      default:
        return "navbar-status-off-duty";
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-flex">
          <div className="flex items-center">
            <Link to="/" className="navbar-logo">
              <svg
                className="navbar-logo-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 8H4v7h4V8z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 15v-7a6 6 0 016-6h4a6 6 0 016 6v7"
                />
              </svg>
              <span className="navbar-logo-text">TruckerELD</span>
            </Link>

            <div className="navbar-links">
              <Link
                to="/dashboard"
                className={`navbar-link ${
                  pathname === "/dashboard"
                    ? "navbar-link-active"
                    : "navbar-link-inactive"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/trip-planner"
                className={`navbar-link ${
                  pathname === "/trip-planner"
                    ? "navbar-link-active"
                    : "navbar-link-inactive"
                }`}
              >
                Trip Planner
              </Link>
              <Link
                to="/logbook"
                className={`navbar-link ${
                  pathname === "/logbook"
                    ? "navbar-link-active"
                    : "navbar-link-inactive"
                }`}
              >
                Logbook
              </Link>
              <Link
                to="/trips"
                className={`navbar-link ${
                  pathname === "/trips"
                    ? "navbar-link-active"
                    : "navbar-link-inactive"
                }`}
              >
                Trips
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="navbar-time-display">
              <Clock size={18} className="mr-2" />
              <span>{time}</span>
            </div>

            {currentStatus && (
              <div
                className={`navbar-status-indicator ${getStatusClass(
                  currentStatus.status
                )}`}
              >
                <span className="capitalize">
                  {currentStatus.status.replace("_", " ")}
                </span>
              </div>
            )}

            {user && (
              <div className="navbar-user-info">
                <div className="navbar-user-container">
                  <div className="navbar-user-icon">
                    <User size={18} />
                  </div>
                  <div className="navbar-user-details">
                    <div className="navbar-user-name">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="navbar-user-license">
                      {user.license_number}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={logout} className="navbar-logout-button">
              <LogOut size={18} />
              <span className="ml-1 text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
