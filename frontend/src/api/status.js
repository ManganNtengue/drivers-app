import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export const getCurrentStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/current-status/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch status");
  }
};

export const updateDriverStatus = async (statusData) => {
  try {
    const response = await axios.post(`${API_URL}/current-status/`, statusData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to update status");
  }
};

export const getDriverInfo = async () => {
  try {
    const response = await axios.get(`${API_URL}/drivers/me/`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to fetch driver info"
    );
  }
};

export const getAvailableHours = async () => {
  try {
    const response = await axios.get(`${API_URL}/drivers/available-hours/`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to fetch available hours"
    );
  }
};

export const getStatusHistory = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_URL}/status-history/`, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to fetch status history"
    );
  }
};

export const updateDriverPreferences = async (preferences) => {
  try {
    const response = await axios.put(
      `${API_URL}/drivers/preferences/`,
      preferences
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to update preferences"
    );
  }
};
