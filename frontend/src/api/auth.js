import axios from "axios";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:8000/api";

export const login = async (credentials) => {
  try {
    // const response = await axios.post(`${API_URL}/auth/login/`, credentials);
    const response = await axios.post(`${API_URL}/token/`, credentials);

    // Store token in localStorage
    // if (response.data.token) {
    //   localStorage.setItem("token", response.data.token);
    //   axios.defaults.headers.common[
    //     "Authorization"
    //   ] = `Token ${response.data.token}`;
    // }

    if (response.data.access) {
      localStorage.setItem("token", response.data.access);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;
    }

    return response.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Login failed");
  }
};

export const logout = async () => {
  try {
    await axios.post(`${API_URL}/auth/logout/`);
  } finally {
    // Remove token regardless of API response
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const getCurrentUser = async () => {
  // Check if token exists
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Set authorization header
  // axios.defaults.headers.common["Authorization"] = `Token ${token}`;
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  try {
    const response = await axios.get(`${API_URL}/drivers/me/`);
    return response.data;
  } catch (error) {
    // If token is invalid, remove it
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
    throw error;
  }
};
