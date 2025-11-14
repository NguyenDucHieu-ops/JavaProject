// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://javaproject.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token
axiosClient.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");

  const isAdminPage = window.location.pathname.startsWith("/admin");

  const token = isAdminPage ? adminToken : userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Xử lý lỗi response
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.log("API Error:", error);

    const status = error.response?.status;

    if (status === 401 || status === 403) {
      const removeKeys = [
        "adminToken", "adminRole", "adminUsername", "adminEmail", "adminName",
        "userToken", "userRole", "userUsername", "userEmail", "userName", "userAvatar"
      ];

      removeKeys.forEach((k) => localStorage.removeItem(k));
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
