import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StatusProvider } from "./context/StatusContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TripPlannerPage from "./pages/TripPlannerPage";
import LogbookPage from "./pages/LogbookPage";
import TripsPage from "./pages/TripsPage";
import TripDetailPage from "./pages/TripDetailPage";
import StatusHistoryPage from "./pages/StatusHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles/index.css";

const App = () => {
  return (
    <AuthProvider>
      <StatusProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/trip-planner"
              element={
                <PrivateRoute>
                  <TripPlannerPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/logbook"
              element={
                <PrivateRoute>
                  <LogbookPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/trips"
              element={
                <PrivateRoute>
                  <TripsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/trips/:id"
              element={
                <PrivateRoute>
                  <TripDetailPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/status-history"
              element={
                <PrivateRoute>
                  <StatusHistoryPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </StatusProvider>
    </AuthProvider>
  );
};

export default App;
