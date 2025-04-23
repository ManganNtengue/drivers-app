import React from "react";
import Layout from "../components/Layout/Layout";
import Dashboard from "../components/Dashboard/Dashboard";

// Import the CSS file
import "../styles/pages/dashboard.css";

const DashboardPage = () => {
  return (
    <Layout>
      <div className="dashboard-page-container">
        <div className="dashboard-page-header">
          <div className="dashboard-page-title-container">
            <h1 className="dashboard-page-title">Driver Dashboard</h1>
            <p className="dashboard-page-subtitle">
              Monitor your HOS status and manage daily activities
            </p>
          </div>
        </div>

        <Dashboard />
      </div>
    </Layout>
  );
};

export default DashboardPage;
