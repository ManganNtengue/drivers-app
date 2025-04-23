import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export const searchLocations = async (query) => {
  if (!query || query.length < 3) return [];

  try {
    const response = await axios.get(`${API_URL}/locations/search/`, {
      params: { q: query },
    });

    // If API integration is not available yet, return mock data
    if (!response.data || process.env.NODE_ENV === "development") {
      return [
        {
          id: "1",
          description: "New York, NY, USA",
          lat: 40.7128,
          lng: -74.006,
        },
        {
          id: "2",
          description: "Chicago, IL, USA",
          lat: 41.8781,
          lng: -87.6298,
        },
        {
          id: "3",
          description: query + ", USA",
          lat: 37.0902,
          lng: -95.7129,
        },
      ];
    }

    return response.data;
  } catch (error) {
    console.error("Location search error:", error);
    return [];
  }
};

export const getLocation = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/locations/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch location");
  }
};
