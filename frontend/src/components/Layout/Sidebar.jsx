import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Map,
  FileText,
  Truck,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import the CSS file
import "../../styles/components/layout/sidebar.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={`sidebar ${
        collapsed ? "sidebar-collapsed" : "sidebar-expanded"
      }`}
    >
      <div className="sidebar-header">
        <button onClick={toggleSidebar} className="sidebar-toggle-button">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-nav-link ${
              isActive ? "sidebar-nav-link-active" : "sidebar-nav-link-inactive"
            }`
          }
        >
          <Home size={20} />
          {!collapsed && <span className="sidebar-nav-text">Dashboard</span>}
        </NavLink>

        <NavLink
          to="/trip-planner"
          className={({ isActive }) =>
            `sidebar-nav-link ${
              isActive ? "sidebar-nav-link-active" : "sidebar-nav-link-inactive"
            }`
          }
        >
          <Map size={20} />
          {!collapsed && <span className="sidebar-nav-text">Trip Planner</span>}
        </NavLink>

        <NavLink
          to="/logbook"
          className={({ isActive }) =>
            `sidebar-nav-link ${
              isActive ? "sidebar-nav-link-active" : "sidebar-nav-link-inactive"
            }`
          }
        >
          <FileText size={20} />
          {!collapsed && <span className="sidebar-nav-text">Logbook</span>}
        </NavLink>

        <NavLink
          to="/trips"
          className={({ isActive }) =>
            `sidebar-nav-link ${
              isActive ? "sidebar-nav-link-active" : "sidebar-nav-link-inactive"
            }`
          }
        >
          <Truck size={20} />
          {!collapsed && <span className="sidebar-nav-text">Trips</span>}
        </NavLink>

        <NavLink
          to="/status-history"
          className={({ isActive }) =>
            `sidebar-nav-link ${
              isActive ? "sidebar-nav-link-active" : "sidebar-nav-link-inactive"
            }`
          }
        >
          <Clock size={20} />
          {!collapsed && (
            <span className="sidebar-nav-text">Status History</span>
          )}
        </NavLink>

        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar-nav-link ${
                isActive
                  ? "sidebar-nav-link-active"
                  : "sidebar-nav-link-inactive"
              }`
            }
          >
            <Settings size={20} />
            {!collapsed && <span className="sidebar-nav-text">Settings</span>}
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
