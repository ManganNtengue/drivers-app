import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export const getLogSheets = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get(`${API_URL}/log-sheets/`, { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to fetch log sheets"
    );
  }
};

export const getLogSheet = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/log-sheets/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to fetch log sheet"
    );
  }
};

export const certifyLogSheet = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/log-sheets/${id}/certify/`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to certify log sheet"
    );
  }
};

export const downloadLogSheet = async (id, format = "pdf") => {
  try {
    const response = await axios.get(`${API_URL}/log-sheets/${id}/export/`, {
      params: { format },
      responseType: "blob",
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Set filename
    const contentDisposition = response.headers["content-disposition"];
    let filename = `log_${id}.${format}`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail ||
        `Failed to download log sheet as ${format}`
    );
  }
};
