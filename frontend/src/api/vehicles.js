import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export const fetchVehicles = async () => {
  try {
    const response = await axios.get(`${API_URL}/vehicles/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch vehicles");
  }
};

export const getVehicle = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/vehicles/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch vehicle");
  }
};
