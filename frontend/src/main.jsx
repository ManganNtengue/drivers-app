import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

// Check for token on startup
const token = localStorage.getItem("token");
// if (token) {
//   axios.defaults.headers.common["Authorization"] = `Token ${token}`;
// }
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Add request interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (
      error.response &&
      error.response.status === 401 &&
      localStorage.getItem("token")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(
        new Error("Your session has expired. Please log in again.")
      );
    }
    return Promise.reject(error);
  }
);

// ReactDOM.createRoot(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root")
// );
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// const root = ReactDOM.createRoot(document.getElementById("root"));

// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
