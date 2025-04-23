import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export const getTrips = async (status = null) => {
  try {
    const params = {};
    if (status) params.status = status;

    const response = await axios.get(`${API_URL}/trips/`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch trips");
  }
};

export const getTrip = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/trips/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch trip");
  }
};

export const planTrip = async (tripData) => {
  try {
    const response = await axios.post(`${API_URL}/trip-planner/`, tripData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to plan trip");
  }
};

export const updateTripStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_URL}/trips/${id}/`, { status });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to update trip status"
    );
  }
};

export const getTripRestStops = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/trips/${id}/rest-stops/`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to fetch trip rest stops"
    );
  }
};
